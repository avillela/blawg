---
title: "Just-in-Time Kubernetes: Namespaces, Labels, Annotations, and Basic Application Deployment"
slug: just-in-time-kubernetes-namespaces-labels-annotations-and-basic-application-deployment
description: "It’s okay to be confused. Let me guide you through some core Kubernetes concepts with a simple application deployment."
added: "Jun 22, 2021"
tags:
  - technical
  - kubernetes
  - "2021"
---


![](https://cdn-images-1.medium.com/max/800/1*bBQ-cnsZNb8NhrzzbUKPSQ.png)

Slow and steady wins the race. Photo by Dzero Labs

### It’s okay to be confused

I once interviewed with a hiring manager who confessed to me that he feels like an impostor. This, coming from a super-smart dude who knew his stuff. I couldn’t help but be impressed by his candour. I think that anyone who is remotely good at what they do suffers from Impostor Syndrome, and that’s okay. Because feeling like an impostor keeps us on our toes, and doesn’t let us for one second take our jobs for granted.

All this to say that if you find yourself struggling with Kubernetes, don’t beat yourself up. You’re in the same boat as many, many people out there. I think that anyone who claims to be a Kubernetes expert is full of hooey. There is no such thing. I hate to break it to you, but even the folks who are “Kubernetes certified” are not experts. Kubernetes is big, complex, full of nuances, and ever-evolving. We’re all learning Kubernetes as we go, and one of the things I love most about the tech community is how many people out there are willing to share their knowledge and experiences.

Today, I will be doing just that. A couple of months ago, I put together a presentation for my (now former) teammates on Kubernetes basics. This spawned my Just-in-Time Kubernetes series. If you want a basic Kubernetes intro, I suggest you check out the first post [here](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1).

In this second instalment of the series, I will be covering the following topics:

*   Kubernetes naming convention
*   Namespaces
*   Labels & annotations
*   App deployment overview

Let’s get started!

### Refresher

If you’re brand-new to Kubernetes, I highly recommend my first [Just-in-Time Kubernetes](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1), post, in which I talked a little bit about:

*   What Kubernetes is and why you need it
*   The difference between a master node and a worker node, and all the goodies that make each tick
*   What resources are
*   The difference between controllers and operators
*   What `kubectl` does

### Naming Convention

It’s worth noting that objects created in Kubernetes must follow a specific naming convention. They can only contain alphanumeric characters and hyphens. The alpha characters can only be lower-case, and names cannot start with hyphens. If you try to create objects that violate this naming convention, Kubernetes will complain.

### Namespaces

`Namespaces` allow you to group objects together in Kubernetes, so that you can filter them and control them as a unit. Some resources are namespaced (i.e. associated to a particular namespace), while other resources apply to the entire cluster.

Think of a `namespace` as a house. Inside a house, you have things like rooms, furniture, and people. Suppose that you have two houses: Mindy’s house, and Abdul’s house. They both have rooms, furniture, and people. Inside Mindy’s house, you refer to the couch as just “couch”. Similarly, inside Abdul’s house, you refer to the couch as “couch”. Outside of each home, however, we need to be able to distinguish which couch belongs to what house. We do this by saying “Mindy’s house’s couch” and “Abdul’s house’s couch”. That is, you’re qualifying the object (couch) as belonging to a particular house.

In Kubernetes, there are 4 `namespaces` that are created by default upon cluster creation:

*   `default`: Default dumping ground for objects. If you don’t specify a namespace, all objects go here.
*   `kube-system`: Reserved for Kubernetes system objects (e.g. `kube-dns`, `kube-proxy`). Also, add-ons that provide cluster-level features also go here (e.g. web UI dashboards, cluster-level logging, ingresses.
*   `kube-public`: Resources that should be made available to all users are created here. Any objects here are available without authentication.
*   `kube-node-lease`: Objects related to cluster scaling go here.

Here’s a visual on namespaces:

![](https://cdn-images-1.medium.com/max/800/1*Rr6sGF_k30NteLmGMf8glA.png)

Image credit: [morioh.com](https://images.app.goo.gl/pzMtNDgdq7iGEUSr7)

In addition to the 4 out-of-the box `namespaces`, we can also create custom `namespaces`. Namespace creation is typically only allowed by Kubernetes admins. With the proper security in place, `namespaces` can be set up so that only certain people have access to a particular `namespace` — just like having a key to a house. Only folks with the key can get in.

> **Note:** _When you create an object in Kubernetes, if you don’t specify a_ `_namespace_`_, it will be automagically placed in the_ `_default_` _namespace, so make sure you always specify a namespace!_

In real life, `namespaces` can be used for grouping:

*   Resources that are a part of the same application.
*   Resources that belong to a particular user. For example, I can create a namespace called `adri`, and create a bunch of resources in there as part of my Kubernetes experimentations.
*   Environment-specific resources. For example, rather than having a separate cluster for Dev and QA, you can simply create a `dev` namespace, and a `qa` namespace in the same cluster, and deploy resources to the appropriate namespace.

You can create a namespace in Kubernetes using `kubectl` like this (if you have permission to do so):

kubectl create ns foo

Where `foo` is our namespace. You can choose to call your `namespaces` whatever your want, as long as they follow the k8s naming convention described earlier.

You can also create a `namespace` from a YAML file, like this:

To create the `namespace` in Kubernetes from the above file:

kubectl apply -f sample-k8s-namespace.yml

#### Hierarchical Namespaces

One common question which arises around `namespaces` is whether or not `namespace` hierarchies are possible in Kubernetes. The answer is yes! The [Hierarchical Namespace Controller (HNC) was introduced in 2020](https://kubernetes.io/blog/2020/08/14/introducing-hierarchical-namespaces/).

A couple of cool things you can do with HNCs:

*   Create a parent `namespace` for your team, and then create `namespaces` for each team member.
*   Create a `dev` parent `namespace`, and then create a child `namespaces` for each application in `dev`.

Child `namespaces` inherit all of the access controls and network of their parent `namespace`.

At the time of this writing, the current [HNC version is 0.8](https://github.com/kubernetes-sigs/multi-tenancy/tree/master/incubator/hnc). Version 0.9 is expected later in 2021, and will be available [here](https://github.com/kubernetes-sigs/hierarchical-namespaces). HNC is currently not a part of the default Kubernetes installation; however, it can be installed as an add-on to your exiting cluster.

#### A Note on Namespaces

Fun fact: when you delete a `namespace`, it deletes the `namespace` itself, along with **_all of the associated objects in that_** `**_namespace_**`. It’s great for when you’re playing around and want to just nuke stuff quickly, but can become an issue if you want to selectively delete resources in the namespace.

### Labels & Annotations

Before we get into app deployments, it’s important to talk about Kubernetes Labels and Annotations. Both Labels and Annotations are key-value pairs used to describe an application; however, that’s where the similarities end.

Below is a comparison of Labels and Annotations:

![](https://cdn-images-1.medium.com/max/800/1*ZOecx_JbiE8o-BG_bLuhMA.png)

I like to think of Labels as key-value pairs as useful to Kubernetes. That is, no matter what Kubernetes resource you use (custom or core), Labels have the same behaviour across the board. Annotations, however, have Operator-dependent behaviour. That is, they follow an Operator-specific format, and the Operator knows how to handle a particular annotation.

Sample Label definitions:

![](https://cdn-images-1.medium.com/max/800/1*2Bqp20w4UtxPCw1IKZyeCQ.png)

In the example above, we use the `app: 2048-app` label in the `Deployment` definition. The `Service` definition uses the `selector` field as a filter. That is, it cares only about Deployments having the label `app: 2048-app`.

In addition to defining your own Labels, Kubernetes recommends using a set of standard Labels to describe an application. These can be helpful in documenting and organizing your application.

Recommended labels:

![](https://cdn-images-1.medium.com/max/800/1*eq-4y0akNsMh3wQoLCrMhA.png)

Source: [kubernetes.io](https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/#labels)

Since Labels are used to group resources together, it comes in very handy for using `kubectl` to filter objects based on Labels. For example, if I wanted to delete all resources in the namespace `foo` having the Label `app: 2048-app`, my command would look like this:

kubectl delete all -n foo -l app=2048-app

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*0bH2IWT8O0qJ0s_bXmcYJw.png)

We can similarly get all objects in the `foo` namespace that have the label `app: 2048-app`:

kubectl get all -n foo -l app=2048-app

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*CV9vg_EsP51tBpnuQP_D9Q.png)

You can also list all resources, their namespaces, and their labels:

kubectl get pods -A --show-labels

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*ekz_K0GUoXW9MRP-S78s7Q.png)

Sample Annotation definitions:

![](https://cdn-images-1.medium.com/max/800/1*lDxLZC6eETvj-G3slFzHcg.png)

If you look at the Annotation examples above, for instance, you’ll notice that we define an entire YAML spec within a YAML spec in lines 8–17 of the first example. Kubernetes itself doesn’t really care about these lines, but the Ambassador Operator does.

Similarly, line 7 in the second example defines this annotation:`tekton.dev/git-0: [https://github.cm/acme/my-k8s.git](https://github.cm/acme/my-k8s.git.)`[.](https://github.cm/acme/my-k8s.git.) Kubernetes itself doesn’t care, but you know who does care? The Tekton operator. It knows what to do with that annotation.

### Apps in Kubernetes

Now that we understand `namespaces` a little bit better, we can talk about deploying apps to Kubernetes. This is where it gets interesting. An applicaiton in Kubernetes is made up of many different objects. The diagram below shows how all of these components come together:

![](https://cdn-images-1.medium.com/max/800/1*taPTD0fpNLRW_ml1-J9sYw.png)

High-level view of Kubernetes Apps. Diagram by Dzero Labs

Don’t panic if you don’t get this diagram right away. It’s a lot to take in! I’ll walk you through the components. 😊

In this post, I’ll be covering `Deployments`, `Pods`, `ReplicaSets`, and `Services`.

#### Pod

Spoiler alert: we don’t deploy containers directly to Kubernetes. Instead, we wrap them around what’s known as a `Pod`. A `Pod` represents a grouping of one or more containers. Typically, you define one _app_ container per `Pod`. Technically, you could have a bunch of different microservice containers in the same `Pod`, but then that would defeat the whole purpose of using microservices, as they would all be tightly-coupled.

> **Note:** _One instance in which we might see more than one container in a Pod definition when using the_ [_sidecar pattern_](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-sidecar-container-pattern-6d8c21f873d)_. In a nutshell, a sidecar is a container that runs alongside your main app container, and serves as a proxy — all initial requests go through it, before going to your main app container. Other multi-container patterns include the_ [_Init Container Pattern_](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-init-container-pattern-7a757742de6b)_, the_ [_Adapter Container Pattern_](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-adaptor-container-pattern-97674285983c)_, and the_ [_Ambassador Container Pattern_](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-ambassador-container-pattern-bc2e1331bd3a)

#### Deployment

Remember how I said that we wrap `Pods` around containers? Well, we don’t actually create `Pods` directly in Kubernetes either (we can, but we don’t). Instead, we create `Deployments`. A `Deployment` manages pod creation, and serves as a wrapper around a `Pod`. In your`Deployment` definition, you specify your `containers` and `replicas`.

The `container` definition includes the registry name, container name, and version (if version is omitted, latest is assumed). The format looks like this: `<registry_name>/<container_name>:<version>`. The container must either live in a public container registry, or your Kubernetes cluster must have access to the container if it’s hosted in a private registry.

`replica` refers to the number of container instances to create.

When you create a `Deployment` resource in Kubernetes, it creates n `Pods` in the designated `namespace`, where n is the number of replicas specified.

The above file creates 2 container instances`alexwhen/docker-2048:latest` (wrapped as `Pods`) in the `namespace` foo.

Notice also that the `Deployment` contains what looks like some duplication. We see a `spec` definition in line 7, and again in line 16. Why is this? The first `spec` belongs to the `Deployment` object iteself. Line 12 onwards defines a `Pod` template. That is, any `Pods` created by this particular`Deployment` will have one container, and they will all have the Label `app: 2048-app`.

To create the above `Deployment` in Kubernetes:

kubectl create -f sample-k8s-deployment.yml

#### Services

`Deployments` are all well and good for deploying our container instances, but it leaves us with some questions:

*   How do we access an API served up by our containers?
*   How do containers talk to each other?

That’s where `Services` come in. `Services` are used to direct traffic to a `Pod`.

The accompanying `Service` definition for `my-app` `Deployment` looks like this:

A few things to note:

*   The `Service` resides in the same `namespace` (foo) as our `my-app` `Deployment`.
*   The `type` is `LoadBalancer`. This means that we’re exposing this `Service` using our Kubernetes cluster’s default LoadBalancer.
*   `port`: The port **of this service**
*   `targetPort` The target port on the pod(s) to forward traffic to
*   We have a field called `selector`, and its value is `app: 2048-app`. This tells the `Service` to look for deployments (in the same `namespace`) that have a label called `app: 2048-app`. If you look at `sample-k8s-deployment.yml`, you’ll note that lines 11 and 15 have the value `app: 2048-app`. This is what associates the `Service` to the `Deployment`. You’re more than welcome to define a bunch of labels for your `Deployments`, as long as they have the format `<key> : <value>`. That said, our `Service` only connects to our `Deployment` if one of those labels is called `app: 2048-app`. If our `Deployment` instead had one label, and it was `foo: bar`, then the `Service` wouldn’t be connected to that `Deployment`.

Let’s go ahead and deploy the above`Service` to Kubernetes:

kubectl apply -f sample-k8s-service.yml

We can test our app now. First, let’s get the `LoadBalancer` IP:

LOAD\_BALANCER\_IP=$(kubectl get -n foo service service -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")

We can test the app quickly with `cURL`:

curl http://$LOAD\_BALANCER\_IP

You’ll get a garble of HTML if you go this route, so if you prefer, you can enter the URL in your browser `http://$LOAD_BALANCER_IP`:

![](https://cdn-images-1.medium.com/max/800/1*xggwlBV1Bxewur-D4uAC2g.png)

The `LoadBalancer` is all well and good for exposing services for sample apps, but in real life, you’d want to use either an Ingress controller or an API gateway.

An **Ingress Controller** is used to serve up Web pages and route traffic. [Nginx](https://www.nginx.com) is a popular Ingress controller. You can use the Kubernetes `Ingress` resource to define and configure your Ingress controller.

An **API Gateway** limits requests and manages authentication, and works as a cluster-level traffic proxy. Examples of popular API Gateways include [Ambassador](https://www.getambassador.io) and [Kong](https://konghq.com/kong/). API Gateways are usually configured and defined using custom resources.

In either case, we still need to create a `Service` definition, in addition to definitions for our Ingress or API Gateway.

I won’t go into detail on Ingress Controllers and API Gateways in this post, but I wanted to include them here at a high-level for awareness.

### Example Repo

You can check out the source files used in this post in the [example repo](https://github.com/d0-labs/ansible-gke).

It includes an Ansible playbook for creating a Kubernetes cluster in Google Cloud.

I’ve lumped the `namespace`, `deployment`, and `service` definitions into one file for convenience.

### Conclusion

Is your head spinning yet? It’s okay if it is. We’ve covered a lot. We’ve learned that:

*   `Namespaces` can be used to group objects in Kubernetes. We can use them to group objects from the same app together, objects from the same environment (e.g. Dev, QA) together, or just serve as sandbox for individual users.
*   Hierarchical `namespaces` are a newer concept on k8s, and are great way for organizing teams and environments.
*   Labels are key-value pairs used by Kubernetes to filter and group applications
*   Annotations are key-value pairs used by Operators to do specialized things
*   `Pods`, the smallest unit of work in k8s, are container wrappers
*   `Deployments` are used to define `Pods` and `ReplicaSets` (# of `Pods` to spin up)
*   `Services` enable `Pod` communication, and can be further complemented with Ingress controllers or API Gateways.

And now, I shall reward you with a picture of a porcupine:

![](https://cdn-images-1.medium.com/max/800/1*O6BBRB4pdrd9iQBERnLe3g.jpeg)

Photo by [Eduardo Gorghetto](https://unsplash.com/@egorghetto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/porcupine?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### Just-in-Time Kubernetes

[**Just-in-Time Kubernetes: A Beginner’s Guide to Kubernetes Core Concepts**  
_A beginner’s guide to Kubernetes architecture and core concepts._medium.com](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1 "https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1")[](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1)

### References

*   [What is the kube-system namespace used for?](https://stackoverflow.com/questions/43987244/what-is-the-kube-system-namespace-for)
*   [Kubernetes components: add-ons](https://kubernetes.io/docs/concepts/overview/components/#addons)
*   [Introducing Hierarchical Namespaces](https://kubernetes.io/blog/2020/08/14/introducing-hierarchical-namespaces/)
*   [Kubernetes hierarchical-namespaces repo on GitHub](https://github.com/kubernetes-sigs/hierarchical-namespaces)
*   [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
*   [Kubernetes Sidecar Pattern](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-sidecar-container-pattern-6d8c21f873d)
*   [Init Container Pattern](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-init-container-pattern-7a757742de6b)
*   [Adapter Container Pattern](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-adaptor-container-pattern-97674285983c)
*   [Ambassador Container Pattern](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-ambassador-container-pattern-bc2e1331bd3a)
*   [Kubernetes Labels and Annotations](https://blog.getambassador.io/kubernetes-labels-vs-annotations-95fc47196b6d)
*   [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

By [Adriana Villela](https://medium.com/@adri-v) on [June 22, 2021](https://medium.com/p/f62568a9eaaf).

[Canonical link](https://medium.com/@adri-v/just-in-time-kubernetes-namespaces-labels-annotations-and-basic-application-deployment-f62568a9eaaf)

Exported from [Medium](https://medium.com) on June 3, 2026.