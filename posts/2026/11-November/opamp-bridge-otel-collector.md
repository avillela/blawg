---
title: 'Let''s Learn About The OpenTelemetry OpAMP Bridge'
slug: opamp-bridge-otel-collector
description: 'Kubernetes Native OTel Collector Management at Scale'
tags:
  - technical
  - opentelemetry
  - otel-collector
  - otel-operator
  - '2026'
added: 2026-10-30T00:00:00.000Z
---

If your organization uses [OpenTelemetry (OTel)](https://opentelemetry.io), chances are that you're running not one or two [OTel Collectors](https://opentelemetry.io/docs/collector/), but tens or even hundeds at once. And if you've ever had to manage that much infrastructure at scale, you know that it is quite difficult to do, unless you have good tooling available to help you.

Which is why the good OTel folks developed the [OpenAgent Management Protocol (OpAMP)](https://opentelemetry.io/docs/specs/opamp/). Not only can it mangage the configuration and deployment of OTel Collectors at scale, it can in theory manage the configuration and deployment of *any data collection agent at scale*. Translation: proprietary observability agents can be also managed by OpAMP!

[I've written about OpAMP before](/post/opentelemetry-opamp-for-you-and-me/), so the purpose of this post isn't to rehash things. Instead, I want to dig a little deeper into an aspect of OpAMP that I've touched upon previously: the OpAMP Bridge.

But before get into that, let's do a brief OpAMP refresher.

## OpAMP refresher

OpAMP is made up on the following components:
* **[Server](/post/opentelemetry-opamp-for-you-and-me/#opamp-server)**: Sends config updates, packages, instructions to the client. 
* **[Client](/post/opentelemetry-opamp-for-you-and-me/#opamp-client)**: Reports status, applies updates, receives configs.
* **Protocol**: Allows the client and server to communicate. Spoiler alert: the protocol is...OpAMP!

Any data collection agent can become an OpAMP client, as long as it implements the client requirements/specifications. By default, the OTel Collector is NOT an OpAMP client; however, it can turn into an OpAMP client in one of 3 ways:

First, we have the **[OpAMP Extension](/post/opentelemetry-opamp-for-you-and-me/#opamp-extension)**. It turns the OTel Collector into a read-only OpAMP client. All it can do is report status to the OpAMP server. Not super useful and I doubt you'll ever use this in prod. Or non-prod.

Next, we have the **[OpAMP Supservisor](/post/opentelemetry-opamp-for-you-and-me/#opamp-supervisor)**. You can think of the Supervisor as a bolt-on (or sidecar, if prefer) for your Collector. It gives the OTel Collector full [OpAMP Client capabilities](https://github.com/open-telemetry/opamp-spec/blob/main/specification.md#agenttoservercapabilities). Each Collector has its own Supervisor.

Finally, we have the **[OpAmp Bridge](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/operator-opamp-bridge/README.md)**: Kubernetes-native "replacement" for the OpAMP Supervisor.

And here is where our journey begins.

## The OpAMP Bridge

The OpAMP Supervisor requires the location of the OTel Collector binary and Collector config YAML. Which means that the ideal way to run the OpAMP Supervisor and Collector is if they're both running on bare metal or a VM. If you want to containerize this setup, you'd need to put both the Supervisor and Collector binaries in the same contaiener. Or, you can surely do some container magic with shared volumes, but honestly, that feels excessive.

So, enter the OpAMP Bridge to solve the problem of OpAMP-managed Collectors on Kubernetes!

The OpAMP Bridge is a component of the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator), one of my favourite OTel components.

> ✨ **HEADS' UP!** You can check out my writings on the OTel Operator [here](/tag/otel-operator).

You can think of the OpAMP Bridge as a replacement of sorts for the OpAMP Supervisor, with a few key differences:

* It manages OTel Collectors in a Kubernetes-native way
* It manages multiple Collectors at once, whereas the Supervisor manages one Collector at a time
* It manages _only_ OTel Collectors managed by the OTel Operator

Okay...now that you've got a feel for what the OpAMP Bridge is all about, let's see it in action with a tutorial.

## Tutorial

In this tutorial we will:
* Create a Kubernetes cluster (I'm using [KinD](https://kind.sigs.k8s.io/))
* Install the OpenTelemetry Operator
* Install an OpAMP Server
* Deploy the OpAMP Bridge
* Deploy OTel Collectors

You can check out the tutorial repository [here](https://github.com/avillela/opamp-demo).

I have provided all the tools that you'll need in a [dev container](/tag/devcontainers). Feel free to spin up the dev container, or install the tools yourself.

If you choose to install the tools yourself, make sure that you have:
* A Kubernetes cluster (e.g. [KinD](https://kind.sigs.k8s.io/))
* [kubectl](https://kubernetes.io/docs/reference/kubectl/)
* [k9s](https://k9scli.io/) (optional)

### 1- Clone the repository

Start by cloning the GitHub repo:

```bash
git clone git@github.com:avillela/opamp-demo.git  
cd opamp-demo
```

Next, build and run the Dev Container.

> **NOTE:** If Dev Containers aren’t your jam, you can go ahead and skip this step.

```bash
devcontainer build --no-cache  
devcontainer open
```

### 2- Create and configure KinD Cluster

Create a KinD cluster called `otel-opamp-demo`:

```bash
./src/scripts/00-create-kind-cluster.sh
```

And then install the [cert-manager](https://cert-manager.io/) and the OTel Operator. The [OTel Operator requires cert-manager](http://localhost:4321/post/when-things-go-sideways-troubleshooting-the-opentelemetry-operator/#installing-theoperator) or some other certificate manager to be installed in order to work.

```bash
./src/scripts/01-install-otel-operator.sh
```

Finally, load our container images into KinD. This is an optional step, but speeds up the Kubernetes deployment process later on, as it won't have to pull the images from GHCR/Docker Hub/whever.


```bash
./src/scripts/02-load-kind-images.sh
```

### 3- Deploy the OpAMP server

Remember from earlier on that the OpAMP server communicates with the OpAMP client via OpAMP (protocol). OpAMP itself does not provide a server, but it does provide a specification for the server, which anyone can implement.

At the time of this writing, these are the OpAMP servers out there:
* [OpAMP Go server (OpenTelemetry - not production-ready)](https://github.com/open-telemetry/opamp-go/tree/main/internal/examples/server)
* [OpAMP Elixir server (Jacob Aronoff - not production-ready)](https://github.com/jaronoff97/opamp-elixir)
* [OpAMP Python server (Adam Gardner - not production-ready)](https://github.com/agardnerIT/opamp-server-py)
* [Bindplane (commercial)](https://bindplane.com)

For the purposes of this tutorial, we don't need a "production ready" OpAMP server; however, the only OpAMP servers that work with the OpAMP bridge are Bindplane and the OpAMP Elixir server.

For starters, we'll use the Elixir server. I'll show off the Bindplane server later.

Let's go ahead and deploy it:

```bash
./src/scripts/03-deploy-elixir-server.sh
```

In a separate terminal window, set up a port-forward, so that we can access the Elixir server:

```bash
kubectl -n opamp port-forward svc/opamp-server 4320
```

You can now access the server at: `http://localhost:4320`:


### 4- Deploy the OpAMP bridge and collectors

This script will deploy:
* OpAMP Bridge
* OpAMP Bridge RBAC
* OTel Collectors

```bash
./src/scripts/04-deploy-elixir-bridge.sh
```



## Final thoughts



Until next time, peace, love, and code. 🖖💜👩‍💻