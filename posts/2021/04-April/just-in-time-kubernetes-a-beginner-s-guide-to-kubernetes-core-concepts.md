---
title: "Just-in-Time Kubernetes: A Beginner’s Guide to Kubernetes Core Concepts"
slug: just-in-time-kubernetes-a-beginner-s-guide-to-kubernetes-core-concepts
description: "A beginner’s guide to Kubernetes architecture and core concepts."
added: "Apr 22, 2021"
tags:
  - technical
  - kubernetes
---


![](https://cdn-images-1.medium.com/max/800/1*Wjzpy5zlWUFkqRM5vnam2w.png)

A snail spotted in the West Toronto Rail Path. Image by Dzero Labs

### The Elephant in the Room

So, you want to learn yourself some Kubernetes. That buzzwordy bundle of techy goodness that everyone seems to be talking about. I can’t tell you how many recruiters have approached me with Kubernetes work. Kubernetes is definitely the cool kid in town!

Perhaps one of the following applies to you:

*   You’ve heard all about Kubernetes and finally decided that it’s high time to see what all the fuss is about.
*   You are a seasoned software engineer who has been working with Kubernetes for a while à la just-in-time learning. That is, you learn what you need to get your job done. Now you’re getting more into the weeds, so you’ve decided that it’s high time to dig into some of the fundamentals. (Shhhh…I won’t tell — I’ve been there myself!)
*   You are a tech leader, and you have a team working on Kubernetes (or perhaps your team interacts with a team working on Kubernetes), and you would like to educate yourself

Whatever brought you here, welcome! I’m glad that you’re here!

My aim here is to keep things simple and to provide you with the basic building blocks for learning and understanding Kubernetes. Kubernetes can seem big and scary. Let’s face it…any new tech is scary. So much stuff to learn. So many nuances. Especially when you’re starting from zero. Are you scared yet? 😱

Don’t be…because I’m here to guide you! My goal here is to show you that Kubernetes is not so scary, and to inspire you to take your knowledge further. (And check out one of [my other advanced posts](http://medium.com/dzerolabs) when you do!) If you’ve been doing Kubernetes for a while, let this be your refresher! Maybe you’ve been doing things a certain way, taking it for granted that “that’s just the way it works”. Maybe you’ll have that “A-ha!” moment, whereby you gain deeper insight into why something works the way it does.

Let’s get started!

### Overview

In this post, I’ll be covering the following topics:

1.  What is Kubernetes?
2.  High-level view: Kubernetes Architecture
3.  Digging deeper: Resources, Controllers, and Operators
4.  The `kubectl` command-line tool for interacting with Kubernetes

If you’re interested in certain bits here and there, feel free to skip ahead to the topic that tickles your fancy. I won’t mind! 😊

> **Note:** _I’m assuming that you have a basic knowledge of containers._

### What is Kubernetes?

First things first…what the heck is Kubernetes? Kubernetes is a container orchestration system that lets you deploy, scale, and manage containerized applications. It is also known in its abbreviated form as k8s. Cuz we software folk are laaaaazy. So if you see the term “k8s”, and have been wondering what it is, now you know!

> **Fun fact:** _Kubernetes traces its roots to the_ [_Borg project_](https://kubernetes.io/blog/2015/04/borg-predecessor-to-kubernetes/)_, which was originally developed by Google._

![](https://cdn-images-1.medium.com/max/800/1*n0okBjEFkLqvr83vxOisvQ.jpeg)

Image credit: [memegenerator.net](https://memegenerator.net/instance/81447743/borg-locutus-resistance-is-futile)

Now, you might be wondering what the heck container orchestration is. Let’s look at an example.

Say you’ve got a bunch of Docker containers running on your computer. Maybe some of these containers need to talk to each other. Or maybe your friend Nancy is trying to access an API endpoint running on one of these containers. How do you ensure that the containers can talk to each others? How can you ensure that Nancy can hit that API endpoint securely? What happens when one of your containers dies? What happens if you need to scale your containers because all of a sudden, it’s not just Nancy needing to access that API endpoint…it’s Nancy and all her dev friends who are taking part a hackathon. Then what?

That’s where container orchestration comes in. It can help you with all that, and more. [Container orchestration](https://pvillela.com/2021/containers-kubernetes-and-service-mesh-in-a-nutshell/) is defined as the capability to define, deploy, and operate a compute cluster consisting of multiple virtual machines or physical servers to launch containers and manage their lifecycle.

### Frenemies of Kubernetes

Now, while Kubernetes is super cool and popular, you may be shocked to find out that it’s not the only container orchestrator out there! It’s true. So it’s only fair to mention a few of Kubernetes’ competitors:

*   [Docker Swarm](https://docs.docker.com/engine/swarm/)
*   [Marathon](https://www.sumologic.com/blog/container-orchestration-mesos-marathon/)
*   [Amazon ECS](https://aws.amazon.com/ecs/?whats-new-cards.sort-by=item.additionalFields.postDateTime&whats-new-cards.sort-order=desc&ecs-blogs.sort-by=item.additionalFields.createdDate&ecs-blogs.sort-order=desc)
*   [Azure Service Fabric](https://azure.microsoft.com/en-ca/services/service-fabric/)
*   [Hashicorp Nomad](https://www.nomadproject.io/)

### Flavours of Kubernetes

![](https://cdn-images-1.medium.com/max/800/1*S2OQTnBVcAUohGGd2i7wsA.png)

Some of the flavours that Kubernetes comes in — yum!

Though not as exciting as ice cream flavours, it’s worth mentioning that there are a few different ways to run Kubernetes.

#### Local

First off, you can run Kubernetes locally on your machine. Here are a few tools which make this possible:

*   [KIND](https://kind.sigs.k8s.io/) (stands for **K**ubernetes **in** **D**ocker)
*   [Docker Desktop](https://www.docker.com/products/kubernetes) (yes, it comes with Kubernetes, and you can run it locally)
*   [Minikube](https://minikube.sigs.k8s.io/docs/start/)

#### Cloud Vendor Solutions

Running k8s locally is all well and good for app development and local testing, but we do eventually need this thing to run in prod, and at scale. This is where it’s nice to know that most of the major cloud vendors have their own flavours of k8s. These include:

*   [Google Kubernetes Engine](https://cloud.google.com/kubernetes-engine) (GKE)
*   [Amazon Elastic Kubernetes Service](https://aws.amazon.com/eks/?whats-new-cards.sort-by=item.additionalFields.postDateTime&whats-new-cards.sort-order=desc&eks-blogs.sort-by=item.additionalFields.createdDate&eks-blogs.sort-order=desc) (EKS)
*   [Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/) (AKS)

Each cloud vendor will typically have a nice little CLI command set for automagically creating a k8s cluster in that cloud. It’s quite a magical experience to issue a CLI command which brings up an entire cluster in 5–10 minutes. We’re talking about not only spinning up virtual machines on-demand, but also starting up all the services that make k8s tick. When you think about it, it’s super impressive!

They also provide you with some basic k8s GUIs, though nothing super fancy.

#### Enterprise Solutions

For the enterprise-minded folks who like pretty admin GUIs and like to have their hands held (no judgment — there’s actually a **_huge_** market for this type of thing), you might want to look at some of these vendors:

*   [RedHat OpenShift](https://www.redhat.com/en/engage/container-platform-datasheet-20170814?sc_cid=7013a0000026GNBAA2&gclsrc=ds&gclsrc=ds)
*   [VMWare Tanzu](https://tanzu.vmware.com/tanzu?utm_source=google&utm_medium=cpc&utm_campaign=amer_gp-b_a2&utm_content=g2_t023&utm_term=vmware%20tanzu&_bt=498180106968&_bk=vmware%20tanzu&_bm=e&_bn=g&_bg=119184092313)
*   [Rancher](https://rancher.com/)

These tend to add a management layer on top of Kubernetes, catering to the enterprise crowd. As I mentioned earlier, they tend to have fancy admin consoles. They also tend to have a ton of plugins available through their respective “marketplaces”, and may have opinionated implementations of k8s (e.g. service mesh selection). These vendors also give you the option of running their k8s clusters in public clouds or self-hosted private clouds.

#### DIY

And finally, if you’re a glutton for punishment, you could always [create your own k8s clusters from scratch](https://github.com/kelseyhightower/kubernetes-the-hard-way). Not my personal cup of tea, but if you really want to understand how Kubernetes works, this is definitely a way to make that happen!

### Kubernetes Components

Now that we have a little bit of background on Kubernetes, lets’s look under the hood.

![](https://cdn-images-1.medium.com/max/800/1*ODy_Edp78awLcDWjjoyf_w.png)

Kubernetes master and worker (minion) nodes

A Kubernetes cluster is made up of nodes. These nodes can be either physical machines, or virtual machines. You can have a cluster of one or more nodes, though ideally, you’ll want at least two nodes in a non-dev scenario.

A cluster typically has a master node, and a bunch of worker (or minion) nodes.

> **Note:** _This is why you’ll want at least two nodes — because it would suck to have a one-node cluster whereby the one node acts as both master and worker in a non-dev setup._

The master node is responsible for watching the workers and performing the orchestration (think of what a manager does). The worker nodes are responsible for running the containers.

The diagram below shows us goes on inside the master node and worker nodes:

![](https://cdn-images-1.medium.com/max/800/1*tGQC9sl8Lv3m8jcdjTIaUA.png)

Kubernetes components. Image from [kubernetes.io](https://kubernetes.io/docs/concepts/overview/components/)

#### Master Node

As the manager of this whole operation, the master node has quite a few components:

*   etcd
*   API Server
*   Controller Manager
*   Scheduler

Let’s dig into these.

**etcd**

[etcd](https://etcd.io) is a distributed key-value database. It is Kubernetes’ source of truth. Every time you make a change to Kubernetes — e.g. by way of sending it YAML or JSON via k8s’ REST API or via the `kubectl` CLI tool (more on that later) — that change is stored in etcd as JSON. It is also versioned, so you also have some serious version control action going on.

One of the key features of etcd is its ability to keep an eye out for changes. That is, it checks what’s currently configured in the system, against any incoming changes sent to Kubernetes via REST API call or `kubectl`.

> **Nerd alert:** _I personally think that etcd one of the coolest Kubernetes components. You can actually install etcd on your local machine (_[_OSX_](https://brewinstall.org/install-etcd-on-mac-with-brew/) _and_ [_Ubuntu_](https://computingforgeeks.com/how-to-install-etcd-on-ubuntu-18-04-ubuntu-16-04/)_, for example), and play around with it by using the_ `[_etcdctl_](https://etcd.io/docs/v3.4/dev-guide/interacting_v3/)` _CLI tool. Python even has a few libraries for interacting etcd programmatically. I’ve personally played around with the_ [_Python etcd3 library_](https://pypi.org/project/etcd3/)_, and I highly recommend exploring etcd for yourself!_

**API Server**

The API server is responsible for serving up the Kubernetes API. Wanna talk to Kubernetes and tell it to do things for you? This is is your direct line — whether you’re a user, a program, or `kubectl`. The API Server is also what’s responsible for sending data to and pulling data from etcd.

**Controller Manager**

The controller manager is the brain behind the orchestration. Kubernetes has multiple controllers, each responsible for different things. Controllers watch the state of your cluster, then make or request changes where needed. The controller manager makes sure that it tells the right controllers to do the right things. For example, there are controllers for:

*   Taking action when a pod goes down
*   Connecting services to pods
*   Creating accounts and accessing API tokens

And many others…

> **Note:** _In case you’re wondering what a pod is, it’s basically a wrapper around one or more containers._

**Scheduler**

The scheduler distributes work across multiple nodes. Its looks at resource requirements (e.g. CPU and memory requirements) to figure out when to run a pod, and what node to run it on.

#### Worker Nodes

Clearly the master node does a lot, but like a manager, it’s nothing without the workers. Worker nodes contain 2 main components:

*   Kubelet
*   Kube-proxy

**Kubelet**

The kubelet is an agent (small app) that runs on each worker node in the cluster. Its main job is to make sure that containers are running in a pod (wrapper of one or more containers). But who tells it to run these containers? That comes from the control plane (where our good friend the controller manager resides). When the control plane needs something to happen in a node, the kubelet makes it happen.

The kubelet runs a container runtime, and, as its name implies, is responsible for actually running containers. More specificially, it manages the complete lifecycle of a container: container image pulling (from a container registry such as [Docker Hub](https://hub.docker.com/)) and storage, container execution, network attachment, etc. [Docker](https://www.docker.com/) is a popular container runtime; however, there are others, such as [containerd](https://containerd.io/), [CRI-O](https://cri-o.io/).

> **Note:** _Kubernetes currently uses the Docker container runtime; however, it will be deprecating Docker in the near future, in favor of runtimes that use the_ [_Container Runtime Interface (CRI)_](https://kubernetes.io/blog/2016/12/container-runtime-interface-cri-in-kubernetes/) _created for Kubernetes. Docker-produced images will continue to work in your cluster with all runtimes, as they always have, so no need to panic!_

**Kube-proxy**

The kube-proxy handles network communications inside and outside your cluster. This means that if pods need to talk to each other, or if some external service needs to talk to a pod, kube-proxy helps make that happen.

### Resources, Controllers, and Operators

Now that we understand the basics of Kubernetes components, let’s get into some other key Kubernetes concepts and terminology.

#### Resources

A Kubernetes [resource](https://kubernetes.io/docs/reference/using-api/api-concepts/) refers to either an object or operation in Kubernetes, accessed via the Kubernetes API. A resource type is known as a **_kind_**, and is represented as JSON object. This JSON object is stored (and versioned) in our good friend, etcd.

There are two categories of resources: primitive resources, and custom resources. Primitive resources come “out of the box” with Kubernetes. Primitive resources include `Pod`, `Service`, `Deployment`, `ServiceAccount`, `PersistentVolumeClaim`, `RoleBinding`…I could go on.

Sample primitive resource in Kubernetes

Custom resources are an extension of the Kubernetes API, and are therefore not necessarily available in the default Kubernetes installation. Upon installation, you can use the `kubectl` CLI tool to create and access these resources (more on `kubectl` later). Custom resources are created when you want/need Kubernetes to do some stuff that you don’t get out of the box with k8s.

Here’s an example of what a custom resource looks like:

Sample custom resource in Kubernetes

You’ll notice that on the most part, both the primitive resource and the custom resource have the same main fields:

*   `apiVersion`: Version of the Kubernetes API that you’re using to create your resource
*   `kind`: Type of resource to create
*   `metadata`: Data that uniquely identifies the resource
*   `spec`: Tells Kubernetes the desired state of the resource

> **Note:** _Not all resources have a_ `_spec_` _field (e.g._ `_ServiceAccount_`_,_ `_Role_`_,_ `_RoleBinding_`_)._

#### Controllers

As discussed earlier, a controller watches the state of your cluster, then makes or requests changes where needed, to achieve the desired state. Blah blah blah. But what exactly does that mean?

Let me give you a fun example. Suppose you’re a lifeguard at a pool. Your job is to keep everyone safe at the pool. To do this, you must constantly scan the pool to make sure that no swimmers are in distress. This is the desired state. Therefore, if you see someone who’s drowning, for example, you go and pull them out of the water, and perform any other necessary life-saving tasks to ensure that they are no longer in distress.

#### Operators

An operator is a type of controller. Remember those custom resources that I talked about earlier? It’s all well and good to define a custom resource, but at the end of the day, how do you get Kubernetes to do something useful with it? That’s where operators come in — they’re the code behind the scenes that make those custom resources **_do_** that useful something.

While all operators are controllers, not all controllers are operators. This can be rather confusing, because on the outset, they seem to be pretty much the same thing. The main difference is that operators extend Kubernetes functionality, and they work alongside custom resources to make that happen.

> **Fun fact:** _Operators can be written in any language, and there are a few frameworks out there that set up some boilerplate code to help you write your own operator._

Anyone can create operators: you, your org, or some external vendor. For example, RedHat OpenShift has its own set of operators (along with accompanying custom resources) that are part of its core product, which it runs on top of plain ‘ole Kubernetes. And thanks to the wonderful open source community, many of operators are made available for sharing. You can check some of these out on [OperatorHub.io](https://operatorhub.io/).

### kubectl

You’ve heard me talk a lot about `kubectl` throughout this post, and now we finally get to see what all the fuss is about! `kubectl` is a command-line interface (CLI) for managing operations on Kubernetes clusters. That’s it! It communicates with our good friend, the API Server, to get information about our cluster, and to tell Kubernetes to do stuff for us, like create a new resource, or modify an existing one. As I’ve mentioned before, when you extend the Kubernetes API using the magical combination of operators and custom resource definitions (CRDs), you can use `kubectl` to access/update those resources too!

Since it’s a command-line tool, `kubectl` runs on your local machine. It works in conjunction with the `kubeconfig` file, which is a YAML file that’s by default installed in `$HOME/.kube/config`. Here’s what a sample kubeconfig file might look like:

![](https://cdn-images-1.medium.com/max/800/1*pkeAenya-n_SeRvRXWy9WA.png)

Screen shot of a sample kubeconfig file

Before you panic trying to understand this garble, I want to tell you that the entries in the `kubeconfig` file are automagically generated when you connect to an existing Kubernetes cluster.

For example, if I wanted to connect to an Azure Kubernetes cluster I would use Azure’s `[az](https://docs.microsoft.com/en-us/cli/azure/)` CLI to run a command like this:

```
az aks get-credentials --resource-group my-resource-group --name my-aks-cluster
```

Which would populate my `kubeconfig` file for me. Magic!

Similarly, I could use Google Cloud’s `[gcloud](https://cloud.google.com/sdk/gcloud)` CLI to connect to a Google Kubernetes cluster like this:

```
gcloud container clusters get-credentials my-gke-cluster --region=us-central1-a
```

The point is, each cloud provider has its own cloud CLI and command set for connecting to a Kubernetes cluster in that cloud, and updating your `kubeconfig` file accordingly.

Once you have that cluster registered in your `kubeconfig` file, you can run various commands against your cluster. You can also use `kubectl` to learn about the clusters that you currently have registered, and to update individual cluster configs.

> **Note:** _You absolutely_ **can** _register multiple Kubernetes clusters from different clouds in the same_ `_kubeconfig_` _file. Alternatively, you can also have multiple_ `_kubeconfig_` _files, if that’s how you like to roll._

If you’re interested in learning more about `kubectl` and `kubeconfig`, check out the **_Recommended Reading_** section below.

### Conclusion

Whew! That was a lot to take in! This was by no means meant to be a technical deep-dive into Kubernetes. Rather, my goal was to introduce you to basic Kubernetes concepts, to give you an appreciation for what makes Kubernetes tick, and to hopefully inspire you to dig a little deeper into this buzzworthy tech that everyone seems to be talking about.

You should also now be able to rhyme off some Kubernetes fun facts to your friends and family on your next Zoom call. You’ll be able to tell them things like:

*   What Kubernetes is and why you need it
*   The difference between a master node and a worker node, and all the goodies that make each tick
*   What resources are
*   The difference between controllers and operators
*   What `kubectl` does

If anything in this post requires further clarification, please reach out in the comments, and let me know, so I can update this post accordingly. Many thanks. ❤️

And now, I shall reward you with a picture of some cute ducklings.

![](https://cdn-images-1.medium.com/max/800/1*1A741KdiTOCVT25YdzMOzQ.jpeg)

Photo by [Olivia Colacicco](https://unsplash.com/@oliviac_design?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/baby-animals?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### More from the Just-in-Time Kubernetes Series

[**Just-in-Time Kubernetes: Namespaces, Labels, Annotations, and Basic Application Deployment**  
_It’s okay to be confused. Let me guide you through some core Kubernetes concepts with a simple application deployment._medium.com](https://medium.com/dzerolabs/just-in-time-kubernetes-namespaces-labels-annotations-and-basic-application-deployment-f62568a9eaaf "https://medium.com/dzerolabs/just-in-time-kubernetes-namespaces-labels-annotations-and-basic-application-deployment-f62568a9eaaf")[](https://medium.com/dzerolabs/just-in-time-kubernetes-namespaces-labels-annotations-and-basic-application-deployment-f62568a9eaaf)

### Recommended Reading

*   [Don’t Panic: Kubernetes and Docker (Kubernetes.io)](https://kubernetes.io/blog/2020/12/02/dont-panic-kubernetes-and-docker/)
*   [Understanding Kubernetes Objects (Kubernetes.io)](https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/)
*   [Kubernetes Architecture (RedHat.com)](https://www.redhat.com/en/topics/containers/kubernetes-architecture)
*   [Kubernetes Operators by Example (Medium.com)](https://codeburst.io/kubernetes-operators-by-example-99a77ea4ac43)
*   [Mastering the KUBECONFIG File (Medium.com)](https://medium.com/@ahmetb/mastering-kubeconfig-4e447aa32c75)
*   [Overview of kubectl (Kubernetes.io)](https://kubernetes.io/docs/reference/kubectl/overview/)
*   [Containers, Kubernetes, and Service Mesh in a Nutshell (PauloVillela.com)](https://pvillela.com/2021/containers-kubernetes-and-service-mesh-in-a-nutshell/)

By [Adriana Villela](https://medium.com/@adri-v) on [April 22, 2021](https://medium.com/p/19ee7acbafa1).

[Canonical link](https://medium.com/@adri-v/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1)

Exported from [Medium](https://medium.com) on June 3, 2026.