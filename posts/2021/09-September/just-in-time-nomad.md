---
title: "Just-in-time Nomad"
slug: just-in-time-nomad
description: "A Kubernetes practitioner’s guide to understanding HashiCorp Nomad"
added: "Sep 20, 2021"
tags:
  - technical
  - nomad
  - kubernetes
  - hashicorp
  - "2021"
---


![Picture of a mural featuring an astronaut surrounded by a circle.](https://cdn-images-1.medium.com/max/800/1*aYXLK8H0V3vRvFeeuSVzdA@2x.jpeg)

Image by [Adri V](https://adri-v.medium.com)

With the popularity of microservices on the rise, having a way to manage these microservices, from deploying them to making sure that the right ones can talk to each other, has become crucial in today’s distributed environment.

The most popular solution out there is [Kubernetes](https://kubernetes.io/). Heck, it’s so popular that most of the major Public Cloud providers offer some sort of managed service for spinning up and maintaining Kubernetes clusters. And while Kubernetes appears to be the container orchestration tool of choice for many organizations, it’s not the only one out there, as I discussed in my [intro to Kubernetes post](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1).

[HashiCorp Nomad](https://www.nomadproject.io/) is one such product. If you asked me six months ago to even consider looking at Nomad, I would’ve told you, “Meh. Why bother? The world has chosen Kubernetes.” Nomad felt like the container orchestration [Betamax](https://en.wikipedia.org/wiki/Videotape_format_war) to Kubernetes’ VHS. But recent circumstances have compelled me to dig a little deeper into Nomad, and what I’ve discovered is that Nomad is a fascinating product that definitely warrants attention.

My goal with this post is to share my learnings with you about Nomad, to give you a high-level overview of the product and its capabilities. Coming from a Kubernetes world, I’ve been trying to grasp Nomad in the best way I can – by drawing parallels between Kubernetes and Nomad. And while the two products are not straight 1:1 equivalents, it has helped me to wrap my head around how Nomad works.

I’m not here to convince you to ditch Kubernetes for Nomad. Instead, I hope to share what I’ve learned with you so that you’re at least aware of the fact that yes, there’s more to container orchestration than Kubernetes, and it’s an alternative worth understanding.

Let’s get started!

### High-Level Architecture: One Binary to Rule Them All

Nomad architecture is pretty freaking elegant. The coolest thing about it is that all you need to get started is a single binary.

The same binary that is used to set up a Nomad cluster can also be used to run Nomad locally on your machine. Let that sink in. 🤯

But wait…there’s more! The binary also includes the following:

*   Nomad CLI
*   Nomad management console

### Local Dev

When you’re running the Nomad binary locally on your machine, you can start up Nomad by running this command in your terminal:

nomad agent -dev

And once it’s up and running, you can hit up the management console by running this command in a separate terminal window:

nomad ui

Which gives opens up a lovely management console running on localhost (`http://127.0.0.1:4646`):

![Screen capture of the Nomad user interface](https://cdn-images-1.medium.com/max/800/0*ZLs5IL68286rLU_-)

Screen capture of the Nomad UI

Go on…try it…you know you want to! You can download the binary [here](https://www.nomadproject.io/downloads).

That’s waaaay less painful than trying to run Kubernetes locally. To do that, you can use [MiniKube](https://minikube.sigs.k8s.io/docs/start/), [microk8s](https://microk8s.io/), or [kind](https://kind.sigs.k8s.io/). I tried MiniKube once, and never got it working after messing around with it for a couple of hours. After that, I just spun up a cluster in Google cloud whenever I needed one. Maybe you’ve had better luck than me!

### Beyond Local Dev

Unlike Kubernetes, Nomad doesn’t have a Cloud-managed offering. While HashiCorp does have a Cloud-managed offering called [HashiCorp Cloud Platform](https://www.hashicorp.com/cloud-platform) (HCP), it’s currently only available for Consul, Vault, and Terraform. Kubernetes definitely has the edge on that one, with all major Cloud providers offering some sort of managed Kubernetes solution.

The good news is that setting up Nomad clusters is relatively straightforward. Compare that to building your own Kubernetes cluster from scratch, which can best be described as an exercise in self-flagellation and should be avoided unless you really just want to understand the nitty-grittiest of Kubernetes.

Now, let’s get back to the Nomad binary, shall we? As I mentioned before, the **_same binary_** that you can use to run Nomad locally is actually used in running a Nomad cluster.

A Nomad cluster is made up of Servers and Clients. To set up a Nomad Server, you run the Nomad binary in Server mode. To set up a Nomad Client, you run the Nomad binary in…wait for it…Client mode.

### Servers

Servers are machines that are responsible for cluster state and scheduling jobs. They are similar in concept to the Kubernetes Master node. [HashiCorp recommends](https://www.hashicorp.com/blog/a-kubernetes-user-s-guide-to-hashicorp-nomad) running 3 or 5 Servers per cluster (region in Nomad speak) to ensure high availability. One of the servers is elected leader. If the leader goes kaput, one of the other servers is elected as the new leader.

Servers use the [Raft Algorithm](https://www.hashicorp.com/resources/raft-consul-consensus-protocol-explained) to maintain cluster state, storing state in a designated directory on the machine. This is similar to what [etcd](https://rafay.co/the-kubernetes-current/etcd-kubernetes-what-you-should-know/) (also uses the Raft algorithm) does in Kubernetes.

Servers run the Nomad binary in server mode.

![Image of the Kubernetes control plane vs Nomad Server Node](https://cdn-images-1.medium.com/max/800/0*Mz-fOolh7ITXXyos)

Source: [A Kubernetes User’s Guide to HashiCorp Nomad](https://www.datocms-assets.com/2885/1614277208-nomad-blog-control-server.png?fit=max&fm=webp&q=80&w=2500)

### Clients

Clients are machines that run jobs, and are responsible for lifecycle management. They’re similar to Worker nodes in Kubernetes.

Here’s where it gets interesting. While Kubernetes is used to orchestrate containerized workloads, Nomad can run all sorts of workloads (known as tasks), which include but are not limited to:

*   Containerized (e.g. [Docker](https://www.docker.com/), [containerd](https://containerd.io/))
*   Virtualized (e.g. [QEMU](https://www.qemu.org/), [firecracker](https://firecracker-microvm.github.io/))
*   [Java](https://www.java.com/en/)
*   [IIS](https://www.iis.net/) on Windows

This is made possible by the [Task Driver](https://www.nomadproject.io/docs/drivers). The Task Driver is similar to the Container Runtime in Kubernetes, except that it can run more than just containers. And, as of Nomad 0.9, the Task Driver is pluggable, so whatever workload you can dream up (as long as it follows the specification, of course), Nomad would be able to handle it.

Clients run the Nomad binary in client mode.

![Image of the Kubernetes Worker Node vs Nomad Client Node](https://cdn-images-1.medium.com/max/800/0*MH6yW4gH2-9MDHvY)

Source: [A Kubernetes User’s Guide to HashiCorp Nomad](https://www.datocms-assets.com/2885/1614277182-nomad-blog-worker-client.png?fit=max&fm=webp&q=80&w=2500)

### Application Deployment

So we’ve got a decent feel for the Nomad architecture. Let’s get into the good stuff — deploying applications!

Applications are defined in a file called the job file. This file is written in [HCL](https://www.linode.com/docs/guides/introduction-to-hcl/) — HashiCorp Configuration Language. Nomad also speaks JSON, but most people write job files in HCL. The job file is similar to a Kubernetes manifest (written in YAML), except that whereas you can define individual YAML files to describe a Kubernetes application, you define your entire Nomad application in a single job file.

![Image of Kubernetes groupings (pod, deployment, etc) vs Nomad groupings (group, task, etc)](https://cdn-images-1.medium.com/max/800/0*s9AeJFLy6aX5k_er)

Source: [A Kubernetes User’s Guide to HashiCorp Nomad](https://www.datocms-assets.com/2885/1614277148-nomad-blog-docker.png?fit=max&fm=webp&q=80&w=2500)

Some fun facts about job files:

*   Job files contain all the things you need to define your application. This includes, tasks, ingress configuration, what client to run on, etc.
*   A task is the thing that you’re running (e.g. containerized app, Java app, binary, virtualized app).
*   A task is the smallest unit of deployment in Nomad
*   The smallest unit of deployment in Kubernetes is the Pod
*   A Task Group represents a set of tasks that go together
*   When defining a task, you specify: number of instances, task driver (e.g. docker vs Java vs ?), image, CPU resources (in MHz), and memory resources
*   Nomad Task != Kubernetes Pod
*   Nomad Task ~= individual container in a Kubernetes Pod
*   Nomad Task Group ~= Kubernetes Pod

If you’ve followed my Kubernetes work before, you know that I’m a huge fan using the [Dockerized 2048 app](https://github.com/alexwhen/docker-2048) for my examples. I now have a Nomad example for you as well!

For the sake of comparison, I’ve also included a Kubernetes deployment manifest:

#### Quick Example

Getting a quick example up running locally with Nomad is so simple, that I decided to throw in a short little tutorial. You can find the jobspec code [here](https://gist.github.com/avillela-tc/02d22e849f0bd842903bb7ebd92e083d).

**1- Start up Nomad in Dev mode**

Open up a new terminal window, and run this command:

nomad agent -dev -bind 0.0.0.0 -log-level INFO

**2- Deploy the Nomad jobspec**

Open up another terminal window, and run the following command (assuming your file is called`2048-game.nomad` and is located in the current working directory):

nomad job run 2048-game.nomad

You’ll see output that looks something like this:

![Sample output of deploying a job to Nomad](https://cdn-images-1.medium.com/max/800/1*lBIwA9pdp2-kc9lMkgKiBw.png)

**3- Open up the Nomad UI to take a peek at your job deployment.**

Run the following command in a new terminal window:

nomad ui

This will open up a new browser window at `http://127.0.0.1:4646`:

![](https://cdn-images-1.medium.com/max/800/1*ac5wbBOwrbCj0e5m9Q7raQ.png)

**4- Run the app**

We exposed port `80` in our jobspec file, so we should be able to reach our app at `http://127.0.0.1`:

![Screen capture of successfully-deployed 2048-game running on localhost](https://cdn-images-1.medium.com/max/800/1*tDNeyyIsy6KV-zepVJ8-Cw.png)

Ta-da!

For a more detailed Nomad tutorial, check out this [Medium post](https://medium.com/hashicorp-engineering/hashicorp-nomad-from-zero-to-wow-1615345aa539) by Russ Parsloe.

### Nomad != Kubernetes

One thing that I learned early on in my exploration of Nomad, is that by itself Nomad != Kubernetes.

Nomad is actually not meant to run all by itself, unless you’re running it locally. When you’re talking about running a Nomad cluster (like in Pre-Prod and Prod environments), you actually need a setup that includes running Nomad, [Vault](https://www.vaultproject.io/), and [Consul](https://www.consul.io/). All of which are…wait for it…HashiCorp tools! Which means that they play super nice together. ❤️

Chances are, you may have already heard of [Vault](https://www.vaultproject.io/), and [Consul](https://www.consul.io/). If you come from a Kubernetes background, you may have even used one or both of them in your Kubernetes cluster.

[**Vault**](https://www.vaultproject.io/) is used for secrets-management (think [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/) and [Google Secret Manager](https://cloud.google.com/secret-manager), but with more features).

[**Consul**](https://www.consul.io/) is used as a service mesh — i.e. service discovery, DNS, and basic load-balancing (similar to [Istio](http://istio.io/) and [Linkerd](http://linkerd.io/)).

The diagram below illustrates what it looks like to set up Nomad with Consul. You have:

*   Consul Servers (similar setup to Nomad Servers), running on separate machines
*   Consul Clients running as agents on the Nomad Client machines

As with Nomad, the Consul binary can be set up to run in either Client mode or Server mode.

Don’t they play so well together? 😄

![Nomad reference architecture](https://cdn-images-1.medium.com/max/800/0*LDE8P7EUnWwWQfwm)

Source: [Nomad Reference Architecture](https://learn.hashicorp.com/img/nomad/production/nomad_reference_diagram.png)

So, when you put it all together, you get:

> **Nomad + Consul + Vault = Opinionated Kubernetes**

I say “Opinionated Kubernetes” because by nature, Kubernetes very much embodies the choose-your-own-adventure mentality when it comes to things like secrets management and service mesh.

### Cluster Maintenance

Maintaining a Nomad cluster and [keeping it up-to-date is a relatively painless process](https://atodorov.me/2021/02/27/why-you-should-take-a-look-at-nomad-before-jumping-on-kubernetes/#upgrading). Relative to Kubernetes, that is. This is because:

*   Updating Nomad is a matter of replacing the binary and restarting the service.
*   Nomad strives to be backwards compatible for at least 1 point release. This means Nomad v0.10 hosts will work with v0.9 hosts.
*   Supports both in-place updates (update binary on existing hosts) and rolling updates (add new hosts with new binary, and remove old hosts with old binary)

For more on Nomad upgrades, [check out the Nomad docs](https://www.nomadproject.io/docs/upgrade).

Compared to maintaining your own self-hosted Kubernetes cluster ([don’t do it unless you have a really good reason](https://tasdikrahman.me/2020/11/27/to-self-host-or-to-not-self-host-your-kubernetes-cluster/)), this is a walk in the park. Needless to say, maintaining self-hosted Kubernetes clusters involves (among other things) keeping the various Kubernetes components up-to-date. This, on top of also keeping up with security patches on your underlying servers — something you also have to do with Nomad, FYI.

### Nomad & Kubernetes Side-by-Side

There’s so much else to talk about, but rather than bore you to death with a wall of text, I have put together a handy-dandy table comparing Kubernetes and Nomad. While things aren’t always 1:1 comparisons, this should at least give you a pretty good idea of what’s up.

Since Nomad terms differ from Kubernetes terms, I also put together a terminology decoder ring below.

### Worth A Look

So…which product is better? Nomad over Kubernetes? Honestly, it’s a personal/enterprise choice. It depends on:

*   Available expertise. Do you have more in-house Kubernetes or Nomad experts?
*   Appetite for managing Nomad clusters. Remember, it also includes having to keep your VMs up-to-date and patched, update the binaries…all that good stuff!

### Final Thoughts

Nomad is definitely a serious contender in the (not just) container orchestration space, and has a lot going for it:

*   Relatively easy to set up and upgrade a self-hosted Nomad cluster (installation of single binary on each server), compared to Kubernetes (installation of multiple services)
*   Nice integration with Vault for secrets management
*   Nice integration with Consul for service mesh
*   Not just for containerized workloads!
*   Relatively easy to pick up, coming from a Kubernetes background

On the cons side, we have:

*   No managed Nomad solution
*   Not as much expertise out there compared to Kubernetes
*   Not as much flexibility, as you’re “stuck” using Vault and Consul
*   Can be pricey for meeting Enterprise needs, since you have likely have to invest in Enterprise offerings of Nomad, Vault, and Consul
*   Lacks in parity with Kubernetes offerings, specifically around [Container Storage Interface](https://github.com/container-storage-interface/spec/blob/master/spec.md) (CSI) integrations

Kubernetes certainly gets a lot more press in the container orchestration space compared to Nomad, so you likely won’t find as many folks versed in Nomad compared to Kubernetes. But, the Hashi community gets some serious love and fandom, so you certainly won’t see a lack of enthusiasm. Plus, SREs I’ve worked with who came from Kubernetes-land and were thrust into Nomad-land have all told me how easy Nomad was to pick up. That’s definitely nothing to snort at!

A final note: I want to make sure that the info here is accurate, so if you find any boo-boos in this post, please send me a quick note to let me know, so that I can make corrections as needed!

And now, please enjoy this lovely picture of my recently departed pet rat and forever furry friend, Susie:

![Photo of a cute little rat](https://cdn-images-1.medium.com/max/800/0*u0BoJo9oSaHc52Ad)

Susie the rat: August 2019 to August 2021

Peace, love, and code.

### More from Just-in-Time Nomad

Check out more on my Just-in-Time Nomad series, as I continue my exploration of Nomad.

[**Just-in-Time Nomad: Running Traefik on HashiQube**  
_Deploying ThoughtWorks Tech Radar to Nomad using the Traefik Load Balancer_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8 "https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8")[](https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8)

[**Just-in-Time Nomad: Configuring HashiCorp Nomad/Vault integration on HashiQube**  
_A step-by-step guide to configuring HashiCorp Nomad and Vault to allow Nomad to pull Vault secrets_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a "https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a")[](https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a)

[**Just-in-Time Nomad: Running the OpenTelemetry Collector on Hashicorp Nomad with HashiQube**  
_An in-depth look into the Nomad OTel Collector jobspec using Traefik as a load balancer and pulling API keys from Vault_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382 "https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382")[](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382)

[**Just-in-Time Nomad: Managing Nomad Application Deployments Using Waypoint on HashiQube**  
_A beginner’s guide to installing and using HashiCorp Waypoint_faun.pub](https://faun.pub/just-in-time-nomad-managing-nomad-application-deployments-using-waypoint-on-hashiqube-467952b23689 "https://faun.pub/just-in-time-nomad-managing-nomad-application-deployments-using-waypoint-on-hashiqube-467952b23689")[](https://faun.pub/just-in-time-nomad-managing-nomad-application-deployments-using-waypoint-on-hashiqube-467952b23689)

### References & Further Reading

*   [A Kubernetes User’s Guide to HashiCorp Nomad](https://www.hashicorp.com/blog/a-kubernetes-user-s-guide-to-hashicorp-nomad)
*   [Nomad Reference Architecture VM with Consul](https://learn.hashicorp.com/tutorials/nomad/production-reference-architecture-vm-with-consul)
*   [Upgrading Nomad](https://www.nomadproject.io/docs/upgrade)
*   [Get Started: Nomad for Kubernetes Practitioners (with Demo)](https://getpocket.com/read/3428730254)
*   [Conductor: Why We Migrated from Kubernetes to Nomad](https://thenewstack.io/conductor-why-we-migrated-from-kubernetes-to-nomad)
*   [Nomad vs Kubernetes without the complexity](https://www.codemotion.com/magazine/dev-hub/backend-dev/nomad-kubernetes-but-without-the-complexity)
*   [Why you should take a look at Nomad before jumping on Kubernetes](https://atodorov.me/2021/02/27/why-you-should-take-a-look-at-nomad-before-jumping-on-kubernetes/)
*   [To self host or to not self host Kubernetes cluster(s)](https://tasdikrahman.me/2020/11/27/to-self-host-or-to-not-self-host-your-kubernetes-cluster/)
*   [HashiCorp Nomad — From Zero to WOW!](https://medium.com/hashicorp-engineering/hashicorp-nomad-from-zero-to-wow-1615345aa539?utm_source=pocket_mylist)

By [Adriana Villela](https://medium.com/@adri-v) on [September 20, 2021](https://medium.com/p/80f57cd403ca).

[Canonical link](https://medium.com/@adri-v/just-in-time-nomad-80f57cd403ca)

Exported from [Medium](https://medium.com) on June 3, 2026.