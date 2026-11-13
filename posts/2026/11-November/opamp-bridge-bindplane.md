---
title: The OpenTelemetry OpAMP Bridge with Bindplane
slug: opamp-bridge-bindplane
description: A Tutorial with a Production-Ready OpAMP Server
tags:
  - technical
  - opentelemetry
  - otel-collector
  - otel-operator
  - otel-opamp
  - '2026'
added: 2026-11-12T00:00:00.000Z
---

![Close-up of a decorative clear glass Edison-style LED bulb mounted on a black wall sconce, glowing against a textured gray stone wall.](/images/posts/opamp-bridge-bindplane/lightbulb.jpg)

[In my last blog post](/post/opamp-bridge-otel-collector/), I talked about the [OpAMP Bridge](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/operator-opamp-bridge/README.md), a Kubernetes-native “replacement” of sorts for the [OpAMP Supervisor](/post/opentelemetry-opamp-for-you-and-me/#opamp-supervisor), an add-on which turns the [OTel Collector](https://opentelemetry.io/docs/collector/) into a full-featured [OpAMP Client](/post/opentelemetry-opamp-for-you-and-me/#opamp-client), using [Jacob Aronoff](https://github.com/jaronoff97)'s [Elixir OpAMP server](https://github.com/jaronoff97/opamp-elixir) to demonstrate the OpAMP Bridge's capabilities.

Now, if you're looking to play around with the OpAMP Bridge to understand how it works, or use it for one of your personal projects, Jacob's Elixir server is absolutely the way to go.

BUT...if you're looking to use the OpAMP Bridge in a production environment, it might be tough to sell your boss on using an OpAMP Server that is a mostly solo maintainer operation. This leaves you two options:

1. Write your own OpAMP Server (you'd better be ready for the "maintenance burden" of that)
2. Use a commercial OpAMP Server

At the time of this writing, there is only one commercial OpAMP Server offering: [Bindplane](https://bindplane.com), and today I'll show you how to use the OpAMP Bridge with Bindplane.

**Full disclosure:** I work at [Dynatrace](https://dynatrace.com), and [Dynatrace acquired Bindplane this year](https://bindplane.com/blog/bindplane-to-join-dynatrace). That being said, this is NOT a promotional blog post. When I first started playing around with the OpAMP Bridge, all I wanted was a functioning OpAMP Server to use with the Bridge, because I was preparing to give [a talk on OpAMP at Cloud Native Days Norway](https://youtu.be/XXrx7vP4ld4?si=L4Sqsw9sydXTYbTK), which included a demo of the OpAMP Bridge. I didn't care what server I used, as long as I got the demo working. It turns out that I got the demo working with both servers, which ends up being an awesome showcase for OpAMP. 🌈

> ✨**NOTE:** At the time of this writing, Bindplane's OpAMP Bridge capabilities are currently in private beta and will be in public beta later in 2026.

So there you have it. Let's get going with that tutorial, shall we?

## Tutorial time!

In this tutorial we will:

* Create a Kubernetes cluster (I'm using [KinD](https://kind.sigs.k8s.io/))
* Install the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator)
* Configure Bindplane for use with the OpAMP Bridge
* Deploy the OpAMP Bridge pointing to Bindplane
* Deploy an OTel Collector

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

> ✨ **FUN FACT**: The [OTel Operator requires cert-manager](/post/when-things-go-sideways-troubleshooting-the-opentelemetry-operator/#installing-theoperator) or some other certificate manager to be installed first. Otherwise, the Operator no workie.

### 4- Configure Bindplane

> ✨ **NOTE:** The stuff that you see on the Bindplane screens may likely look a bit different for you, depending on your environment.

Let's start off by launching Bindplane by going to [https://app.bindplane.com](https://app.bindplane.com).

![Bindplane login screen](/images/posts/opamp-bridge-bindplane/bindplane-login.png)

If you don't have an account, you can sign up for a free account by clicking the `Sign up` link at the bottom of the screen.

Once you're signed up and logged in, go to the hamburger menu on the top right-hand side of the screen, and select `Kubernetes Clusters`.

![Bindplane main screen and hamburger menu](/images/posts/opamp-bridge-bindplane/bindplane-main-screen.png)

Next, click the `Connect Cluster` button.

![Bindplane Kubernetes Clusters summary screen](/images/posts/opamp-bridge-bindplane/bindplane-kubernetes-clusters.png)

In the pop-up, set the name to `opamp-bridge-test` (honestly, you can call it whatever you want), and leave the namespace as `bindplane` (again, it can be whatever you want). When you're done, click the `Connect` button.

![Bindplane Kubernetes Clusters configuration screen](/images/posts/opamp-bridge-bindplane/bindplane-config-k8s-cluster.png)

This will take you to a screen for `opamp-bridge-test`. You'll notice that there's a section that says, `Cluster Not Connected`. That's because we haven't yet configured and deployed an OpAMP Bridge pointed at Bindplane (our OpAMP server). To do that, you'll first have to click on `Show Intall Instructions`.

![Getting ready to connect Bindplane to our Kubernetes cluster](/images/posts/opamp-bridge-bindplane/bindplane-k8s-cluster-opamp-bridge-test-config.png)

This reveals a number of steps and instructions for configuring our Kubernetes cluster to get it ready for OpAMP and Bindplane. These steps include:

* Installing cert-manager
* Installing the OTel Operator
* Applying the OpAMP Bridge manifest

Luckily for us, we can skip the cert-manager and OTel Operator installation instructions, since we've already done that in [Tutorial Step 3](/post/opamp-bridge-bindplane#3--create-and-configure-kind-cluster). So, in the Bindplane UI, scroll down to section 4, which is labeled, `Apply the bridge manifest. Let the previous step finish first. The OpAMP Bridge will be rejected if the operator's webhook is not ready yet.`, and click the `Download` button.

![Getting ready to connect Bindplane to our Kubernetes cluster](/images/posts/opamp-bridge-bindplane/bindplane-k8s-cluster-opamp-bridge-test-config-bridge.png)

This will download the Kubernetes manifests that you need to configure and deploy the OpAMP Bridge to use with Bindplane.

Before we look at that file, I need you to create a `.env` file in the tutorial repository by opening up a new terminal window and running:

```bash
cp .env.template .env
```

You'll notice that the `.env` file has one environment variable called `BINDPLANE_SECRET`. What's the value of that secret? To find that out, open the file that you just downloaded from the Bindplane UI, and find the `Secret` configuration, located between lines 108 and 115:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: bindplane-secrets
  namespace: "bindplane"
type: Opaque
stringData:
  secret-key: "<your-bindplane-secret-key>"
```

Next, copy the _value_ of `secret-key` on line 115, and paste it as the _value_ of `BINDPLANE_SECRET` in your newly-created `.env` file.

We won't be using the rest of the file that you downloaded from Bindplane, because I already have that all set up for you in [bindplane-bridge.yaml](https://github.com/avillela/opamp-demo/blob/0dd4139394ac0b8592feb97972b5e665bfbec9dc/src/k8s/bindplane-bridge.yaml) in the tutorial repository. If you compare [that file](https://github.com/avillela/opamp-demo/blob/0dd4139394ac0b8592feb97972b5e665bfbec9dc/src/k8s/bindplane-bridge.yaml) to the one you downloaded from Bindplane, they are _almost_ identical, except for the following things:

1. I removed the `namespace` YAML definition
2. I removed the `secret` YAML definition

I instead placed these into a script called [03-deploy-bindplane-bridge.sh](https://github.com/avillela/opamp-demo/blob/0dd4139394ac0b8592feb97972b5e665bfbec9dc/src/scripts/03-deploy-bindplane-bridge.sh), which does the following:

1. Creates the `bindplane` namespace
2. Creates the `secret` by reading the value of `BINDPLANE_SECRET` in `.env`
3. Applies the [bindplane-bridge.yaml](https://github.com/avillela/opamp-demo/blob/0dd4139394ac0b8592feb97972b5e665bfbec9dc/src/k8s/bindplane-bridge.yaml) manifest.

So it does the _exact same thing_, but protects your secret in a gitignored `.env` file so it doesn't end up in version control by accident. And spoiler alert, [bindplane-bridge.yaml](https://github.com/avillela/opamp-demo/blob/0dd4139394ac0b8592feb97972b5e665bfbec9dc/src/k8s/bindplane-bridge.yaml) is based on that original YAML manifest downloaded from the Bindplane UI. No trickery here. 😁

Let's go ahead and deploy the OpAMP Bridge. Open up a new terminal window in the tutorial repository and run:

```bash
./src/scripts/03-deploy-bindplane-bridge.sh .env
```

Once everything is deployed, the status of your Kubernetes cluster configuration for `opamp-bridge-test` will change to `Connected`:

![opamp-bridge-test OpAMP Bridge is connected to the Kubernetes cluster via Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-k8s-cluster-opamp-bridge-test-config-bridge-connected.png)

We can also verify this on the Kubernetes side, by running:

```bash
kubectl get pods -n bindplane
```

You'll see something like this:

```text
opamp-bridge-test-opamp-bridge-696d9786-m5wqj   1/1     Running   0          24m
```

Okay...but so what did [the above script](https://github.com/avillela/opamp-demo/blob/0dd4139394ac0b8592feb97972b5e665bfbec9dc/src/k8s/bindplane-bridge.yaml) actually do?

It does the following:

1. Sets up OpAMP RBAC
2. Configures the OpAMP Bridge

If you'd like to dig in, read on. Otherwise, feel free to [skip ahead to the Collector deployment step](/post/opamp-bridge-bindplane/#5--deploy-an-otel-collector).

#### OpAMP Bridge RBAC

Let's start with the RBAC. RBAC is used to tell our resources what they can access. This is what we've set up:

* [ClusterRole](https://kubernetes.io/docs/reference/kubernetes-api/rbac/cluster-role-v1/): Describes what resources the Bridge will have access to, and what type of access it will have to each resource (e.g. get, list)
* [ClusterRoleBinding](https://kubernetes.io/docs/reference/kubernetes-api/rbac/cluster-role-binding-v1/): The glue that associates the `ClusterRole` to the `ServiceAccount`.
* [ServiceAccount](https://kubernetes.io/docs/concepts/security/service-accounts/): Referenced by the OpAMP Bridge, granting the Bridge access to the resources specified in the `ClusterRole`.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: otel-bridge
  namespace: "bindplane"
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: otel-bridge
rules:
  - apiGroups: ["opentelemetry.io"]
    resources: [opentelemetrycollectors]
    verbs: ["*"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: otel-bridge
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: otel-bridge
subjects:
  - kind: ServiceAccount
    name: otel-bridge
    namespace: "bindplane"
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: bindplane-collector-permissions
rules:
  - apiGroups: [""]
    resources:
      - events
      - namespaces
      - namespaces/status
      - nodes
      - nodes/spec
      - nodes/stats
      - nodes/proxy
      - pods
      - pods/status
      - persistentvolumeclaims
      - persistentvolumes
      - replicationcontrollers
      - replicationcontrollers/status
      - resourcequotas
      - services
    verbs: [get, list, watch]
  - apiGroups: ["apps"]
    resources: [daemonsets, deployments, replicasets, statefulsets]
    verbs: [get, list, watch]
  - apiGroups: ["extensions"]
    resources: [daemonsets, deployments, replicasets]
    verbs: [get, list, watch]
  - apiGroups: ["autoscaling"]
    resources: [horizontalpodautoscalers]
    verbs: [get, list, watch]
  - apiGroups: ["batch"]
    resources: [jobs, cronjobs]
    verbs: [get, list, watch]
  - apiGroups: ["events.k8s.io"]
    resources: [events]
    verbs: [get, list, watch]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: bindplane-collector-permissions
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: bindplane-collector-permissions
subjects:
  - kind: ServiceAccount
    name: otel-bridge
    namespace: "bindplane"
  - kind: ServiceAccount
    name: "opentelemetry-operator-controller-manager"
    namespace: "opentelemetry-operator-system"
```

#### OpAMP Bridge Configuration

Next up is the OpAMP Bridge configuration. This is done through a CR called [OpAMPBridge](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opampbridges.md), which comes with the OTel Operator. Our Bridge is configured like this:

```yaml
apiVersion: opentelemetry.io/v1alpha1
kind: OpAMPBridge
metadata:
  name: "opamp-bridge-test"
  namespace: "bindplane"
spec:
  serviceAccount: otel-bridge
  endpoint: "wss://app.bindplane.com/v1/opamp"
  env:
    - name: BINDPLANE_SECRET_KEY
      valueFrom:
        secretKeyRef:
          name: bindplane-secrets
          key: secret-key
    - name: BINDPLANE_AGENT_ID
      valueFrom:
        fieldRef:
          fieldPath: metadata.uid
  headers:
    Authorization: "Secret-Key ${BINDPLANE_SECRET_KEY}"
    Agent-Id: "${BINDPLANE_AGENT_ID}"
  description:
    non_identifying_attributes:
      service.labels: "configuration=opamp-bridge-test,ephemeral=true"
  capabilities:
    AcceptsRemoteConfig: true
    ReportsRemoteConfig: true
    ReportsEffectiveConfig: true
    ReportsHealth: true
    ReportsStatus: true
```

Notable items:

* `serviceAccount`: references the [ServiceAccount](https://github.com/avillela/opamp-demo/blob/8a0431e4c3e4496aef6fc0859f8877b422cd4a1f/src/k8s/elixir-bridge-rbac.yaml#L1-L7) described in the [section above](/post/opamp-bridge-bindplane/#opamp-bridge-rbac).
* `endpoint`: The endpoint of the OpAMP Server. The prefix is either `ws` for websocket or `wss` for secure websocket. We're using `wss` for Bindplane, since this a commercial, production-ready offering. The `app.bindplane.com` points to the Bindplane OpAMP Server. The `/v1/opamp` is the service endpoint.
* `capabilities`: The [OpAMP Client capabilities](https://github.com/open-telemetry/opamp-spec/blob/main/specification.md#agenttoservercapabilities) that we're giving to the OTel Collectors managed by the Bridge. Remember that the Bridge turns your OTel Operator-managed Collectors into OpAMP clients.
* `headers`: Authentication headers so that we can connect to the Bindplane sever, and to make sure we're connected to the right account. They take their values from [envs](https://github.com/avillela/opamp-demo/blob/0dd4139394ac0b8592feb97972b5e665bfbec9dc/src/k8s/bindplane-bridge.yaml#L109-L118). You'll notice that `BINDPLANE_SECRET_KEY` environment variable gets its value from `secret-key`, the key for the secret that we set in [03-deploy-bindplane-bridge.sh](https://github.com/avillela/opamp-demo/blob/0dd4139394ac0b8592feb97972b5e665bfbec9dc/src/scripts/03-deploy-bindplane-bridge.sh#L17-L27).
* `description`: Used for identification purposes, but not a must-have for deployment.

> **NOTE:** If you compare this OpAMP Bridge configuration to [the one used with the Elixir server](/post/opamp-bridge-otel-collector/#opamp-bridge-rbac), you'll notice that they're quite similar, except that this one includes a `headers`, `env`, and `description` section.

If you want to add further restrictions, you can also add a `componentsAllowed` section under `spec`, where any configuration containing components not in the `componentsAllowed` list will be rejected by the Bridge:

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

### 5- Deploy an OTel Collector

In the previous tutorial, [we created and deployed an OpenTelemetryCollector resource "by hand"](/post/opamp-bridge-otel-collector/#opentelemetrycollector). If you're using Bindplane, however, you configure and deploy the `OpenTelemetryCollector` resource from within the Bindplane UI. Let's go ahead and do that.

From the `opamp-bridge-test` configuration screen, click `Add Collector Workload`.

![Add OTel Collector in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-k8s-cluster-add-collector-workload.png)

And then select a workload type. Let's pick `Kubernetes Node`. This deploys an `OpenTelemetryCollector` resource to your Kubernetes cluster as a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/).

> 💡 **WHAT'S A DAEMONSET?** A `DaemonSet` ensures that Kubernetes nodes run a copy of a pod. In this case, the pod being run is a Collector pod. Whenever a node is added to a cluster, a pod is added to it. When a node is removed from a cluster, the pod is also removed. When a DaemonSet is deleted, any pods created by it are also deleted.

Once you've selected the workload type, give your Collector a name. Let's call it `my-collector`, and then click `Confirm`.

![Deploy OTel Collector in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-k8s-cluster-config-collector.png)

This deploys an `OpenTelemetryCollector` CR. Give it some time to finish deploying.

You'll see the Collector status in the UI go from `Not Ready 0/1` to `✔ 1/1`

If you go to your Kubernetes cluster and run:

```bash
kubectl get pods -n bindplane
```

You'll see something like this:

```text
my-collector-collector-gvzwq                    1/1     Running   0          4m16s
opamp-bridge-test-opamp-bridge-696d9786-m5wqj   1/1     Running   0          24m
```

But we need to finish configuring the Collector. So click the link under the `Configuration` header. It might get cut off, but should start with `opamp-bridge-test-my-collector`.

![Configure OTel Collector in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-k8s-cluster-config-collector-3.png)

You can actually see the Collector's configuration by clicking `View Configuration File`:

![Configure OTel Collector in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-view-collector-config.png)

Which brings up this pop-up where you can see just the Collector configuration YAML (not the full `OpenTelemetryCollector` manifest):

![Configure OTel Collector in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-collector-config.png)

As you can see, it's a bare bones Collector configuration.

> 💡 **SIDEBAR:** If you want to take a peek at the Kubernetes manifest of the `OpenTelemetryCollector` resource, you can always run:
>
> ```bash
> kubectl describe OpenTelemetryCollector -n bindplane $(kubectl -n bindplane get OpenTelemetryCollectors -o jsonpath='{.items[0].metadata.name}')
> ```
>
> Interestingly enough, if you modify the above command by adding `| grep Image:`, it will return the Collector's base image, `ghcr.io/dynatrace/dynatrace-bindplane-otel-collector:1.3.1`, which is a [Bindplane distribution of the OTel Collector](https://github.com/observiq/bindplane-otel-collector).

If we want to do something a little more interesting, we can set receivers and exporters for our Collector.

Under the `Logs` sub-section of `Pipelines`, you can set a `Source` (receiver) and `Destination` (exporter).

![Configure OTel Collector Logs pipeline in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-collector-config-2.png)

Let's start with configuring our receiver. Click the `Source` box. Since this is a logs pipeline, Bindplane gives you a few options of log sources. Or you can configure your own (`Custom` option). Let's pick a pre-configured source:

![Add Kubernetes cluster logs receiver to logs pipeline in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-collector-add-logs-source.png)

And then you'll be prompted to name it. Since this receiver is pulling logs from our cluster, let's call it `otel-opamp-demo`, the name of our cluster, and click `Done`.

![Add Kubernetes cluster logs receiver to logs pipeline in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-collector-add-logs-source-2.png)

Next, we'll configure our exporter by clicking `Destination`. Just like with Sources, you can pick from an existing list, or configure your own (`Custom` item). We're not looking to do anything fancy today. I just want to send our output to Nowheresville. We can accomplish that with the [No-Op Exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/nopexporter). So, in the search bar for `Add Logs Destination`, type `null`, which brings up `Dev Null`:

![Add Kubernetes cluster logs exporter to logs pipeline in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-collector-add-logs-destination.png)

In my case, there's already a Dev Null exporter configured. In fact, I have 3 to choose from. So I pick one of them.

![Add Kubernetes cluster logs exporter to logs pipeline in Bindplane. Set to no-op exporter](/images/posts/opamp-bridge-bindplane/bindplane-collector-add-logs-destination-2.png)

Once you have a source and destination configured, you need to apply these changes to the `OpenTelemetryCollector` resource in your cluster. You do that by clicking the `Start Rollout` button.

![Add Kubernetes cluster logs destination to logs pipeline in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-collector-start-rollout.png)

This may take a while, so sit back, and have a cup of tea. Once all of the changes are applied, your screen should look like this:

![Add Kubernetes cluster logs destination to logs pipeline in Bindplane](/images/posts/opamp-bridge-bindplane/bindplane-collectors-logs-dataflow.png)

Oh, and since we modified our Collector config, we should see the changes reflected when we click on `View Configuration File`:

![Collector configuration file after adding exporter and receiver](/images/posts/opamp-bridge-bindplane/bindplane-collector-updated-config.png)

> 💡 **NOTE:** In this example, we only added a receiver and expoerter to the logs pipeline. We can in fact add more receivers and exporters to it, along with processors. We can also configure metrics and traces pipelines, adding exporters, receivers, and processors to those.

## Final thoughts

Using Bindplane as an OpAMP Server, specifically for the OpAMP Bridge was a cool experience. I'm not gonna lie. I had some help. And to that effect, I'd like to thank my co-worker and OpAMP maintainer, [Andy Keller](https://github.com/andykellr), for showing me the ropes and letting me play in his environment so that I could get the demo ready for my talk and subsequently, for this blog post.

With it being a commercial product, Bindplane certainly has quite a learning curve, but it also has a lot to offer. I guess it's a balance! From what I've seen so far, it has a LOT of really cool functionality, and as the OpAMP Bridge support moves from private beta to public beta to GA, I can't wait to see it evolve.

And now, I will leave you with a photo of Barbie, my hammiest of rats who loves her humans. Don't let that shy face throw you off. She loves attention. 💜

![White pet rat partially hidden in cupped hands, peering outward with one visible eye and pink ears against a dark fabric background.](/images/posts/opamp-bridge-bindplane/barbie-peek-a-boo.jpg)

Until next time, peace, love, and code. 🖖💜👩‍💻
