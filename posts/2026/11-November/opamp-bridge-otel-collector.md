---
title: 'Let''s Learn About the OpenTelemetry OpAMP Bridge'
slug: opamp-bridge-otel-collector
description: 'Kubernetes Native OTel Collector Management at Scale'
tags:
  - technical
  - opentelemetry
  - otel-collector
  - otel-operator
  - '2026'
added: 2026-11-04T00:00:00.000Z
---

![Palace of Science and Culture in Warsaw, Poland, at sunset. Water fountain splashing in the foreground](/images/posts/opamp-bridge-otel-collector/palace-of-science-culture-warsaw.jpg)

If your organization uses [OpenTelemetry (OTel)](https://opentelemetry.io), chances are that you're running not one or two [OTel Collectors](https://opentelemetry.io/docs/collector/), but tens or even hundeds at once. And if you've ever had to manage that much infrastructure at scale, you know that it is quite difficult to do, unless you have good tooling available to help you.

Which is why the good OTel folks developed the [OpenAgent Management Protocol (OpAMP)](https://opentelemetry.io/docs/specs/opamp/). Not only can it mangage the configuration and deployment of OTel Collectors at scale, it has the ability to manage the configuration and deployment of *any data collection agent at scale*. Translation: proprietary observability agents can be also managed by OpAMP!

[I've written about OpAMP before](/post/opentelemetry-opamp-for-you-and-me/), so the purpose of this post isn't to rehash OpAMP. Instead, I want to dig a little deeper into an aspect of OpAMP that I've touched upon previously: the OpAMP Bridge.

But before get into that, let's do a brief OpAMP refresher.

## OpAMP refresher

OpAMP is made up on the following components:
* **[Server](/post/opentelemetry-opamp-for-you-and-me/#opamp-server)**: Sends config updates, packages, instructions to the client. 
* **[Client](/post/opentelemetry-opamp-for-you-and-me/#opamp-client)**: Reports status, applies updates, receives configs.
* **Protocol**: Allows the client and server to communicate. Spoiler alert: the protocol is...OpAMP!

![Relationship between OpAMP server, client, and protocol](/images/posts/opamp-bridge-otel-collector/opamp-diagram.png)

Any data collection agent can become an OpAMP client, as long as it implements the client requirements/specifications. By default, the OTel Collector is NOT an OpAMP client; however, it can turn into an OpAMP client in one of 3 ways:

First, we have the **[OpAMP Extension](/post/opentelemetry-opamp-for-you-and-me/#opamp-extension)**. It turns the OTel Collector into a read-only OpAMP client. All it can do is report status to the OpAMP server. Not super useful and I doubt you'll ever use this in prod. Or non-prod.

Next, we have the **[OpAMP Supservisor](/post/opentelemetry-opamp-for-you-and-me/#opamp-supervisor)**. You can think of the Supervisor as a bolt-on (or sidecar, if prefer) for your Collector, giving the Collector full [OpAMP Client capabilities](https://github.com/open-telemetry/opamp-spec/blob/main/specification.md#agenttoservercapabilities). You configure one Supervisor per Collector.

Finally, we have the **[OpAmp Bridge](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/operator-opamp-bridge/README.md)**, a Kubernetes-native "replacement" for the OpAMP Supervisor.

And here is where our journey begins.

## The OpAMP Bridge

The OpAMP Supervisor requires the location of the OTel Collector binary and Collector config YAML. Which means that the ideal way to run the OpAMP Supervisor and Collector is if they're both running on bare metal or a VM. If you want to containerize this setup, you'd need to put both the Supervisor and Collector binaries in the same contaiener. Or, you can surely do some container magic with shared volumes, but honestly, that feels like too much work. Screw that.

So, enter the OpAMP Bridge to solve the problem of OpAMP with Collectors on Kubernetes!

The OpAMP Bridge is a component of the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator), one of my favourite OTel components.

> ✨ **HEADS' UP!** You can check out my writings on the OTel Operator [here](/tag/otel-operator).

As I noted earlier, you can think of the OpAMP Bridge as a "replacement" for the OpAMP Supervisor, with a few key differences:

* It manages OTel Collectors in a Kubernetes-native way
* It can be used for multiple Collectors at once, whereas the Supervisor can be used with only one Collector at a time
* It can _only_ be used with OTel Collectors managed by the OTel Operator

Okay...now that you've got a feel for what the OpAMP Bridge is all about, let's see it in action with a tutorial.

## Tutorial time!

In this tutorial we will:
* Create a Kubernetes cluster (I'm using [KinD](https://kind.sigs.k8s.io/))
* Install the OpenTelemetry Operator
* Install an OpAMP Server
* Deploy the OpAMP Bridge
* Deploy OTel Collectors

You can check out the tutorial repository [here](https://github.com/avillela/opamp-demo).

I have provided all the tools that you'll need in a [dev container](/tag/devcontainers). But if dev containers aren't your jam, feel free to skip that part.

If you choose to install the tools yourself, you'll need:
* A Kubernetes cluster (e.g. [KinD](https://kind.sigs.k8s.io/))
* [kubectl](https://kubernetes.io/docs/reference/kubectl/)
* [k9s](https://k9scli.io/) (optional)

### 1- Clone the repository

Start by cloning the GitHub repository:

```bash
git clone git@github.com:avillela/opamp-demo.git  
cd opamp-demo
```

### 2- Build and run the dev container

> ✨ **NOTE:** If dev containers aren’t your jam, you can go ahead and skip this step.

Next, build and run the dev container.

```bash
devcontainer build --no-cache  
devcontainer open
```

The build and open steps will take a few minutes when you run them for the first time.

You only need to build the dev container the first time you run the Demo. After that, you just need to run `devcontainer open` any time you want to run the Demo. That is, unless `devcontainer.json` has changed, in which case you should rebuild.

### 3- Create and configure KinD Cluster

Create a KinD cluster called `otel-opamp-demo` by running the script below:

```bash
./src/scripts/00-create-kind-cluster.sh
```

And then install the [cert-manager](https://cert-manager.io/) and the OTel Operator using this script:

```bash
./src/scripts/01-install-otel-operator.sh
```

> ✨ **Fun Fact**: The [OTel Operator requires cert-manager](/post/when-things-go-sideways-troubleshooting-the-opentelemetry-operator/#installing-theoperator) or some other certificate manager to be installed first.

Finally, we save our container images from the image repositories locally in the KinD cluster:

```bash
./src/scripts/02-load-kind-images.sh
```

This is an optional step, but it speeds up the Kubernetes deployment process later on. I keep all of my example resources in a separate namespace (i.e. not `default`). I tend to nuke and recreate the namespace and all associated resources regularly as I'm developing and testing. By loading the images into the KinD cluster directly beforehand means that each time I redeploy, Kubernetes won't have to pull the images again from the image repository, since they're already available locally within the cluster.

### 4- Deploy the OpAMP server

Remember what I said earlier that the OpAMP server communicates with the OpAMP client via OpAMP (protocol)? There is no official OpAMP server implementation; there is only a server specification, which anyone can implement. And I mean _anyone_.

At the time of this writing, the OpAMP servers out there are:

| OpAMP Server | Author | Type | Production-ready? |
  |--------------|--------|------|-------------------|
  | [OpAMP Go server](https://github.com/open-telemetry/opamp-go/tree/main/internal/examples/server) | OpenTelemetry | Open source (educational example) | No |
  | [OpAMP Elixir server](https://github.com/jaronoff97/opamp-elixir) | [Jacob Aronoff](https://github.com/jaronoff97) | Open source | No |
  | [OpAMP Python server](https://github.com/agardnerIT/opamp-server-py) | [Adam Gardner](https://github.com/agardnerit) | Open source (vibecoded) | No |
  | [Bindplane](https://bindplane.com) | Bindplane by Dynatrace | Commercial | Yes |

For the purposes of this tutorial, we don't need a "production ready" OpAMP server. Now, if you think that you can use ANY of the above servers with the OpAMP Bridge, you'd be wrong. Believe me, I fell into that trap.

This is because the Bridge needs to talk to a server that can pass [OpenTelemetryCollector Custom Resources (CRs)](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md#opentelemetryiov1beta1) in the remote config message instead of plain OTel Collector config YAML. While the `OpenTelemetryCollector` CR includes the Collector config we all know and love, it also has a bunch of Kubernetes constructs in its YAML, because it's a Kubernetes resource. The "regular" OTel Collector config YAML is _just_ the Collector config YAML. So basically the 2 YAMLs are not the same, and whatever OpAMP Server you choose to use with the OpAMP Bridge needs to be able to speak OTel Operator YAML.

Okay, so after all this, we're left with 2 options: the Elixir Server or Bindplane. In this example, we'll use the Elixir server. (PS: Huge thanks to Jacob, who made a bunch of updates to this server to improve the UX.)

Let's go ahead and deploy it:

```bash
./src/scripts/03-deploy-elixir-server.sh
```

The above script will:
* Create an `opamp` namespace
* Create Kubernetes `secrets`, to be used by Postgres and the Elixir server
* Deploy Postgres. This is used to store the configurations and configuraiton changes.
* Deploy the Elixir server

In a separate terminal window, set up a Kubernetes `port-forward`, so that we can access the Elixir server:

```bash
kubectl -n opamp port-forward svc/opamp-server 4320
```

You can now access the server at: [http://localhost:4320](http://localhost:4320):

![OpAMP Elixir server main screen](/images/posts/opamp-bridge-otel-collector/opamp-elixir-server.png)


### 5- Deploy the OpAMP Bridge and Collectors

Next we need to deploy the OpAMP Brdige and OTel Collectors managed by the Bridge:

```bash
./src/scripts/04-deploy-elixir-bridge.sh
```

The above script deploys:
* [OpAMP Bridge RBAC](https://github.com/avillela/opamp-demo/blob/8a0431e4c3e4496aef6fc0859f8877b422cd4a1f/src/k8s/elixir-bridge-rbac.yaml)
* [OpAMP Bridge](https://github.com/avillela/opamp-demo/blob/8a0431e4c3e4496aef6fc0859f8877b422cd4a1f/src/k8s/elixir-bridge.yaml)
* Two [OTel Collectors](https://github.com/avillela/opamp-demo/blob/8a0431e4c3e4496aef6fc0859f8877b422cd4a1f/src/k8s/otel-collector.yaml)

Let's return to our OpAMP Server at [http://localhost:4320](http://localhost:4320):

![Elixir OpAMP Server showing the OpAMP Bridge and 2 Collectors managed by it](/images/posts/opamp-bridge-otel-collector/opamp-elixir-bridge-collector.png)

We now see our OpAMP Bridge and 2 OTel Collectors, both managed by the Bridge. How cool is that?!

Let's dig into the resources we just deployed.

#### OpAMP Bridge RBAC

Let's start with the RBAC. RBAC is used to tell our resources what they can access. This is what we've set up:

* [ClusterRole](https://kubernetes.io/docs/reference/kubernetes-api/rbac/cluster-role-v1/): Describes what resources the Bridge will have access to, and what type of access it will have to each resource (e.g. get, list)
* [ClusterRoleBinding](https://kubernetes.io/docs/reference/kubernetes-api/rbac/cluster-role-binding-v1/): The glue that associates the `ClusterRole` to the `ServiceAccount`.
* [ServiceAccount](https://kubernetes.io/docs/concepts/security/service-accounts/): Referenced by the OpAMP Bridge, granting the Bridge access to the resources specified in the `ClusterRole`.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    app: opamp-bridge-sa
  name: opamp-bridge-sa
  namespace: opamp
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    app: opamp-bridge-sa
  name: opamp-bridge-role
rules:
- apiGroups: ["opentelemetry.io"]
  resources: ["opentelemetrycollectors"]
  verbs: ["*"]
- apiGroups: [""]
  resources: ["pods", "statefulsets", "daemonsets", "deployments", "replicasets"]
  verbs: ["get", "list"]
- apiGroups: ["apps"]
  resources: ["pods", "statefulsets", "daemonsets", "deployments", "replicasets"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  labels:
    app: opamp-bridge-sa
  name: opamp-bridge-rolebinding
subjects:
- kind: ServiceAccount
  name: opamp-bridge-sa
  namespace: opamp
roleRef:
  kind: ClusterRole
  name: opamp-bridge-role
  apiGroup: rbac.authorization.k8s.io
```

#### OpAMP Bridge Configuration

Next up is the OpAMP Bridge configuration. This is done through a CR called `OpAMPBridge`, which comes with the OTel Operator. Our Bridge is configured like this:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpAMPBridge
metadata:
  labels:
    app: opamp-bridge-sa
  name: opamp-bridge
  namespace: opamp
spec:
  serviceAccount: opamp-bridge-sa
  endpoint: "ws://opamp-server.opamp.svc:4320/v1/opamp"
  tls:
    insecure: true
  capabilities:
    AcceptsRemoteConfig: true
    ReportsEffectiveConfig: true
    ReportsHealth: true
    ReportsRemoteConfig: true
```

Notable items:
* `serviceAccount`: references the [ServiceAccount](https://github.com/avillela/opamp-demo/blob/8a0431e4c3e4496aef6fc0859f8877b422cd4a1f/src/k8s/elixir-bridge-rbac.yaml#L1-L7) described in the [section above](/post/opamp-bridge-otel-collector/#opamp-bridge-rbac).
* `endpoint`: The endpoint of the OpAMP server. The prefix is either `ws` for websocket or `wss` for secure websocket. The `opamp-server.opamp.svc` refers to the fully-qualified Kubernetes [service](https://kubernetes.io/docs/concepts/services-networking/service/) name of the Elixir OpAMP server. The `/v1/opamp` is the service endpoint.
* `tls.insecure`: Set to `true` because we don't have any TLS set up. In the real world, you'd have TLS set up.
* `capabilities`: The [OpAMP Client capabilities](https://github.com/open-telemetry/opamp-spec/blob/main/specification.md#agenttoservercapabilities) that we're giving to the OTel Collectors managed by the Bridge. Remember that the Bridge turns your OTel Operator-managed Collectors into OpAMP clients.

You can also get fancy and tell the Bridge what parts of the Collector config are allowed to be updated by the OpAMP Server by adding this snippet under `spec`:

```yaml
componentsAllowed:
  receivers:
    - otlp
  processors:
    - memory_limiter
    - batch
  exporters:
    - otlphttp
```

> 💡 **TIP!** check out the full OpAMP Bridge API reference [here](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opampbridges.md).

#### OpenTelemetryCollector

When we configured the OpAMP Bridge, you may have noticed that there was nothing in the configuration that indicated what Collector(s) it would manage. That's defined in the `OpenTelemetryCollector` CR, by setting a label in `metadata.labels`.

There are 3 possibilities, which are mutually exclusive:
* `opentelemetry.io/opamp-managed: "true"`: Let the OpAMP Bridge manage this Collector.
* `opentelemetry.io/opamp-managed: "opamp-bridge"`: Let _only_ the OpAMP Bridge named `opamp-bridge` manage this Collector.
* `opentelemetry.io/opamp-reporting: "true"`: Allow this Collector to _only_ report status to the OpAMP Bridge. Realistically, you'll probably never use this, because you can't do much with it.

Here's what our `OpenTelemetryCollector` CR looks like:

```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel
  namespace: opamp
  labels:
    app.kubernetes.io/name: opentelemetry-collector
    app.kubernetes.io/version: "0.161.0"
    app.kubernetes.io/component: opentelemetry-operator
    opentelemetry.io/opamp-managed: "true"
spec:
  mode: statefulset
  image: otel/opentelemetry-collector-contrib:0.161.0
  imagePullPolicy: Always
  serviceAccount: otelcontribcol
  autoscaler:
    minReplicas: 1
    maxReplicas: 2
    targetCPUUtilization: 50
    targetMemoryUtilization: 60
  resources:
    limits:
      cpu: 200m
      memory: 500Mi
    requests:
      cpu: 100m
      memory: 128Mi


  config:
    receivers:
      otlp:
        protocols:
          grpc: {}
          http: {}

    processors:
      batch: {}

    exporters:
      debug:
        verbosity: detailed

    service:
      pipelines:
        traces:
          receivers: [ otlp ]
          processors: [ batch ]
          exporters: [ debug ]
        metrics:
          receivers: [ otlp ]
          processors: [ batch ]
          exporters: [ debug ]
        logs:
          receivers: [ otlp ]
          processors: [ batch ]
          exporters: [ debug ]
```

Note the metadata label we're using:

```yaml
metadata:
  labels:
  ...
    opentelemetry.io/opamp-managed: "true"
  ...
```

If you'd like to learn more about the `OpenTelemetryCollector` CR, you can read up on it [here](/post/switching-to-an-opentelemetry-operator-managed-collector-on-kubernetes/).

### 6- Make some configuration changes!

Now that we have the OpAMP Bridge set up, let's do something useful, like update the configuration of one of our Collectors.

To do that, click on one of the Collectors in the OpAMP Server screen, and click the `Config` button:

![Selecting an OTel Collector to update in the OpAMP Elixir server UI](/images/posts/opamp-bridge-otel-collector/opamp-elixir-bridge-collector-selected.png)

Scroll to `line 29` and change the [debug exporter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/debugexporter/README.md) configuration from `detailed` to `basic`, and click `Send to agent`.

![Update the debug exporter verbosity from detailed to basic](/images/posts/opamp-bridge-otel-collector/collector-update-debug-exporter.png)

Upon success, you'll see a popup on the top right-hand corner of the page saying, `The agent applied the config`.

![Successful update of the debug exporter verbosity from detailed to basic](/images/posts/opamp-bridge-otel-collector/collector-update-debug-exporter-success.png)


## Final thoughts

The OpAMP Bridge is a great Kubernetes-native alternative to using the OpAMP Supervisor to turn your Collectors into an OpAMP Client. I think that the fact that it can manage multiple Collectors at once compared to the 1:1 relationship between Supervisor and Collector is awesome. Anything that requires managing fewer configs is a huge win in my book.

If you haven't considered the OpAMP Bridge before, I hope that this sways you.

And now, I will leave you with a photo of my rat Penny.

![A brown-and-white pet rat explores a wire cage, balancing on a wooden platform above a glass water container. Soft hanging fabric toys and ropes surround the platform.](/images/posts/opamp-bridge-otel-collector/penny-the-explorer.jpg)

Until next time, peace, love, and code. 🖖💜👩‍💻