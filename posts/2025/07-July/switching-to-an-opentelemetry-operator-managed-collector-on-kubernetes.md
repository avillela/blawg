---
title: "Switching to an OpenTelemetry Operator-managed Collector on Kubernetes"
slug: switching-to-an-opentelemetry-operator-managed-collector-on-kubernetes
description: "A hands-on approach featuring the OpenTelemetry Operator and OpenTelemetry Demo on Kubernetes"
added: "Jul 10, 2025"
tags:
  - technical
  - observability
  - opentelemetry
  - otel-collector
  - otel-operator
  - kubernetes
---



![Close-up of a purple flower with yellow stamens hosting a bumblebee and a smaller insect — possibly a hoverfly — collecting nectar, highlighting active pollination.](https://cdn-images-1.medium.com/max/800/1*Vg9AOYwNMZ3es1kXAxlhjw.jpeg)

A bumblebee and a smaller insect pollinating the same flower. Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

When running the [OTel Demo App](https://github.com/open-telemetry/opentelemetry-demo) for the first time, most folks tend to [run it locally using Docker Compose](https://medium.com/womenintechnology/the-opentelemetry-demo-revisited-again-409aa8e0a070). And why not? It’s a relatively low barrier to entry. But let’s face it...in the Real World™, we don’t run our production apps on our desktops with Docker Compose. Most of us probably turn to a workload orchestrator like [Kubernetes](https://kubernetes.io) or [HashiCorp Nomad](https://medium.com/@adri-v/running-the-opentelemetry-demo-app-on-hashicorp-nomad-a3e21e35369d). Wouldn’t it be nice to see an example of the OTel Demo running on Kubernetes to get more of that Real World feel?

Luckily, the [OTel Demo repo](https://github.com/open-telemetry/opentelemetry-demo/blob/main/kubernetes/opentelemetry-demo.yaml) comes with Kubernetes manifests for deploying the Demo App. And if you really want to get fancy, you can even use the [OTel Demo Helm chart](https://opentelemetry.io/docs/demo/kubernetes-deployment/). Given all that, you might be wondering what I’m doing here. Am I just rehashing stuff that’s already been documented? Not quite!

While the OTel Demo on Kubernetes is great as-is, it doesn’t come with a Collector managed by the [OTel Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/). And if you’ve read my previous work, you know that [I am a HUGE fan of the OTel Operator](https://adri-v.medium.com/list/opentelemetry-operator-0ee6378d630a). So I asked myself, “What if I modified the OTel Demo on Kubernetes to run a Collector managed by the OTel Operator instead?”

But what’s the point of doing all this? Well, the Operator, among other things, is great for managing the deployment and configuration of the OTel Collector. If your were an early adopter of OpenTelemetry on Kubernetes, chances are, you’ve been deploying and managing your Collectors sans Operator, since the Operator is a newer component of OpenTelemetry. This blog post provides you a path for swapping out your “old” Collectors on Kuberntes for ones managed by the OTel Operator.

I will be demonstrating this by deploying the OpenTelemetry Demo App on Kubernetes using a Collector managed by the [OTel Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/). I will also be using [Dynatrace](https://dt-url.net/dt-otel-demo) as the Observability backend (feel free to replace with your own favourite backend).

Let’s do this!

### Tutorial

I’m a huge fan of [Development (Dev) Containers](https://containers.dev/), so I created one for running this example. While it is totally optional, I recommend it just because it gives you an environment with all of the tools you need to run the Demo App in Kubernetes.

#### **Pre-requisites**

*   A Kubernetes cluster v1.33+. The Dev Container comes with [KinD](https://kind.sigs.k8s.io), so you can spin up a KinD cluster, if you’d like (instructions below).
*   A Dynatrace account and access token. Learn how to get a trial account and generate an access token [here](https://www.dynatrace.com/news/blog/send-opentelemetry-data-to-dynatrace/).

For Dev Containers:

*   [Docker](https://www.docker.com/) or [Podman](https://medium.com/womenintechnology/running-dev-containers-locally-with-podman-vscode-df16376350d3) or equivalent (also required if you’re using KinD).
*   [Dev Containers plugin for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
*   Dev Containers CLI (grab it [here](https://code.visualstudio.com/docs/devcontainers/devcontainer-cli) or [here](https://github.com/devcontainers/cli)).

Here we go!

#### 1- Clone the repo

Start by cloning the repo:

git clone git@github.com:avillela/otel-demo-k8s-dt.git  
cd otel-demo-k8s-dt

#### 2- Build and run the Dev Container

> **_NOTE:_** If Dev Containers aren’t your jam, you can go ahead and skip this step.

Next, build and run the Dev Container.

devcontainer build \--no-cache  
devcontainer open

The build and open steps will take a few minutes when you run them for the first time.

You only need to build the Dev Container the first time you run the Demo. After that, you just need to run `devcontainer open` any time you want to run the Demo. That is, unless `devcontainer.json` has changed, in which case you should rebuild.

#### 3- Remove the Collector from the OTel Demo Manifest

The OTel Demo repo [comes with a Kubernetes manifest](https://github.com/open-telemetry/opentelemetry-demo/main/kubernetes/opentelemetry-demo.yaml), which includes the YAML definitions for deploying an OTel Collector.

I used the original file as a start, but then made the following modifications:

**1) Updated namespaces.** The original manifest deploys some resources to the `default` namespace and some to the `otel-demo` namespace. I’m personally not a fan of deploying resources to `default`, so I’ve modified the file to deploy all resources to `otel-demo`.

**2) Removed Collector references from the Demo App’s Kubernetes manifest**, since I want to deploy a Collector managed by the OTel Operator. I removed any `[ServiceAccount](https://github.com/open-telemetry/opentelemetry-demo/blob/f1c3783304108c302f2954c16cf693e4fd53c705/kubernetes/opentelemetry-demo.yaml#L52-L61)`, `[ConfigMap](https://github.com/open-telemetry/opentelemetry-demo/blob/f1c3783304108c302f2954c16cf693e4fd53c705/kubernetes/opentelemetry-demo.yaml#L254-L418)`, `[ClusterRole](https://github.com/open-telemetry/opentelemetry-demo/blob/f1c3783304108c302f2954c16cf693e4fd53c705/kubernetes/opentelemetry-demo.yaml#L10071-L10089)`, `[ClusterRoleBinding](https://github.com/open-telemetry/opentelemetry-demo/blob/f1c3783304108c302f2954c16cf693e4fd53c705/kubernetes/opentelemetry-demo.yaml#L10160-L10176)`, `[Service](https://github.com/open-telemetry/opentelemetry-demo/blob/f1c3783304108c302f2954c16cf693e4fd53c705/kubernetes/opentelemetry-demo.yaml#L10404-L10452)`, and `[Deployment](https://github.com/open-telemetry/opentelemetry-demo/blob/f1c3783304108c302f2954c16cf693e4fd53c705/kubernetes/opentelemetry-demo.yaml#L11121-L11217)` having `metadata.name: otel-collector`.

#### 4- Create an OpenTelemetryCollector resource

Since we’re replacing the OpenTelemetry Collector (and associated components) in the OTel Demo’s Kubernetes manifest with an OTel Operator-managed Collector, we’ll need to create an `OpenTelemetryCollector` resource. Say wut?

The OTel Operator introduces a custom resource called `OpenTelemetryCollector`, which is used for managing the deployment and configuration of the OTel Collector. Here’s a snippet of what mine looks like (see full definition [here](https://github.com/avillela/otel-demo-k8s-dt/blob/main/src/k8s/otel-collector-dt.yaml)):

apiVersion: opentelemetry.io/v1beta1  
kind: OpenTelemetryCollector  
metadata:  
  name: otel  
  namespace: otel-demo  
  labels:  
    app.kubernetes.io/name: opentelemetry-collector  
    app.kubernetes.io/instance: opentelemetry-demo  
    app.kubernetes.io/version: "0.128.0"  
    app.kubernetes.io/component: opentelemetry-operator  
spec:  
  mode: statefulset  
  image: otel/opentelemetry-collector-contrib:0.128.0  
  serviceAccount: otelcontribcol  
...  
  config:  
...

Let’s break things down.

**1) Deployment modes**

The `OpenTelemetryCollector` supports 4 deployment modes, which you configure via `spec.mode`. The supported modes are: `deployment`, `sidecar`, `daemonset`, or `statefulset`. If you leave out `mode`, it defaults to `deployment`. I’m using a `statefulset`, but feel free to use whichever mode best suits you.

When you specify `deployment`, `statefulset`, or `daemonset` mode, a `Deployment`, `StatefulSet`, and `DaemonSet` resource, respectively, is created, along with a corresponding `Service`. They are named `<collector_CR_name>-collector`. My `OpenTelemetryCollector` resource is called `OTel` (per `spec.name`), so the Operator will create a `StatefulSet` and a `Service` called `otel-collector`.

When you specify a `sidecar` deployment mode, a Collector sidecar container is created in your application’s pod, named `otc-container`. You also have to add an annotation to your application’s `Deployment` resource, under `spec.template.metadata.annotations`:

apiVersion: apps/v1  
kind: Deployment   
metadata:  
  name: my-deployment-with-sidecar   
spec:  
  replicas: 1   
  selector:  
    matchLabels:  
      app: my-pod-with-sidecar  
  template:  
    metadata:   
      labels:  
        app: my-pod-with-sidecar  
      annotations:  
        sidecar.opentelemetry.io/inject: "true"  
        instrumentation.opentelemetry.io/inject-python: "true"  
spec:  
  containers:  
    \- name: py-otel-server  
      image: otel-python-lab:0.1.0-py-otel-server  
  ports:  
    \- containerPort: 8082  
      name: py-server-port

**2) Image name**

If you leave out `spec.image`, the OTel Operator will use the latest compatible version from the [opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector) (Collector core) repo. That won’t do you much good, since it’s missing many of the exporters, processors, connectors, and receivers that we often rely on. Instead, you should specify an image from [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) or use your own custom Collector image. Learn more [here](https://medium.com/dzerolabs/otel-operator-q-a-81d63addbf92).

**3) RBAC**

I created my own `ServiceAccount`, `ClusterRole`, and `ClusterRoleBinding` for my Operator-managed Collector, to keep them separate from the ones in the original OTel Demo manifest. I could, however, have just left the ones from the manifest. It’s really up to you.

You reference the Collector’s `ServiceAccount` in the `OpenTelemetryCollector` resource’s `[spec.serviceAccount](https://github.com/avillela/otel-demo-k8s-dt/blob/535ffaea82d3cab243aa5c81c6a0031840360f7f/src/k8s/otel-collector-dt.yaml#L17)` config.

> ✨ NOTE: The Operator creates a default `ServiceAccount` for you named `<collector_CR_name>-collector` if you don’t specify one, but you still have to create the `ClusterRole` and `ClusterRoleBinding` for it.

**4) Collector configuration**

The `OpenTelemetryCollector` resource includes a `spec.config` section for configuring the OTel Collector. If you’re not using the Operator, you need to create a `ConfigMap` with the YAML config for the Collector, [like the one in the original Kubernetes manifest for the OTel Demo](https://github.com/open-telemetry/opentelemetry-demo/blob/f1c3783304108c302f2954c16cf693e4fd53c705/kubernetes/opentelemetry-demo.yaml#L254-L418). I took the Collector config from `ConfigMap` included in the OTel Demo YAML, and ported it over to the `OpenTelemetryCollector` resource’s `spec.config` with some modifications. First, I changed my backend to Dynatrace (more on that in the next section), and I updated the configuration for Collector self-monitoring metrics. Learn more about Collector self-monitoring configuration [here](https://medium.com/womenintechnology/lets-learn-how-to-send-internal-otel-collector-telemetry-to-an-observability-backend-9aef6a18f317).

You can see the full Collector config [here](https://github.com/avillela/otel-demo-k8s-dt/blob/535ffaea82d3cab243aa5c81c6a0031840360f7f/src/k8s/otel-collector-dt.yaml#L69-L202).

> **✨ NOTE:** For more on the OTel Operator, check out [the talk](https://youtu.be/FdfyEoMZI3k?si=639DaQEs2MNhp7Vf) that I did with [Reese Lee](https://www.linkedin.com/in/reese-lee/) on troubleshooting the OTel Operator. You can also check out [my collection of OTel Operator articles](https://adri-v.medium.com/list/opentelemetry-operator-0ee6378d630a).

#### 5- Set up the Collector exporter

In order to export the OpenTelemetry data to Dynatrace, we need to configure the [OTLP HTTP exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlphttpexporter) in the `[OpenTelemetryCollector](https://github.com/avillela/otel-demo-k8s-dt/blob/main/src/k8s/otel-collector-dt.yaml)` resource as follows:

exporters:  
  otlphttp/dt:  
    endpoint: "https://${DT\_ENV}/api/v2/otlp"  
    headers:  
      Authorization: "Api-Token ${DT\_TOKEN}"

Note that the exporter configuration references two environment variables: `DT_TOKEN` and `DT_ENV`. Both `DT_TOKEN` and `DT_URL` are mounted as environment variables from a `[Secret](https://kubernetes.io/docs/concepts/configuration/secret/)` called `otel-collector-secret` in `[OpenTelemetryCollector](https://github.com/avillela/otel-demo-k8s-dt/blob/main/src/k8s/otel-collector-dt.yaml)`.

env:  
  \- name: DT\_TOKEN  
    valueFrom:  
      secretKeyRef:  
        key: DT\_TOKEN  
        name: otel-collector-secret  
  \- name: DT\_ENV  
    valueFrom:  
      secretKeyRef:  
        key: DT\_ENV  
        name: otel-collector-secret

And the `[Secret](https://kubernetes.io/docs/concepts/configuration/secret/)`? You create it like this:

tee \-a src/k8s/otel-collector-secret-dt.yaml <<EOF  
 apiVersion: v1  
 kind: Secret  
 metadata:  
   name: otel-collector-secret  
   namespace: opentelemetry  
 data:  
   DT\_TOKEN: <base64-encoded-dynatrace-token>  
   DT\_ENV: <base64-encoded-dynatrace-environment-identifier>  
 type: "Opaque"  
EOF

Where:

*   `DT_TOKEN` is your [Dynatrace access token](https://www.dynatrace.com/news/blog/send-opentelemetry-data-to-dynatrace/) (see the pre-requisites section above)
*   `DT_ENV` is your Dynatrace environment URL. It will look something like this: `https://<your-dynatrace-tenant>.apps.dynatrace.com`. Learn how to find your Dynatrace tenant [here](https://www.dynatrace.com/news/blog/send-opentelemetry-data-to-dynatrace/).

You’ll need to [Base-64 encode](https://en.wikipedia.org/wiki/Base64) both `DT_TOKEN` and `DT_ENV` like this:

echo <base64-encoded-dynatrace-token> | base64

Or you can Base64-encode it through [this website](https://www.base64encode.org/).

Check out the full `OpenTelemetryCollector` YAML [here](https://github.com/avillela/otel-demo-k8s-dt/blob/main/src/k8s/otel-collector-dt.yaml).

#### 6- Install the OpenTelemetry Operator

Before deploying the OTel Demo, you must first install the OTel Operator in your Kubernetes cluster.

If you don’t have a Kubernetes cluster up and running, feel free to spin one up now. For your convenience, I have included 2 different ways for spinning up a Kubernetes cluster. Pick whichever one you like best, or feel free to create a Kubernetes cluster in your favourite cloud provider.

**Option 1: Create a** [**KinD**](https://kind.sigs.k8s.io) **cluster locally:**

./src/scripts/00-create-kind-cluster.sh

**Option 2: Create a GKE cluster on Google Cloud:**

Make a copy of `[.env](https://github.com/avillela/otel-demo-k8s-dt/blob/main/.env)`:

cp .env secrets.env

> **✨ NOTE:** While can use the original `.env`, if you have any sensitive info that you don’t want committed to version control, you should use `secrets.env`, as it is in `.gitignore`.

Edit the following values in the `secrets.env` file (you can ignore the other stuff in that file):

GCP\_PROJECT\_NAME\=<your\_gcp\_project\_name>  
  
\# e.g. us-east1  
GCP\_REGION\=<your\_gcp\_region>  
  
\# e.g. us-east1-c  
GCP\_ZONE\=<your\_gcp\_zone>  
  
\# e.g. e2-standard-8  
GKE\_MACHINE\_TYPE\=<your\_gke\_machine\_type>

Create the cluster:

./src/scripts/00-create-gke-cluster.sh secrets.env

Verify that the cluster has been created:

kubectl get nodes

Once the cluster is up and running, you should get something like this:

NAME                      STATUS   ROLES           AGE   VERSION  
otel-demo-control-plane   Ready    control-plane   21s   v1.33.1

Now you’re ready to install the OpenTelemetry Operator. This will install [cert-manager](https://cert-manager.io) (Operator pre-requisite) and the OTel Operator:

./src/scripts/02-install-otel-operator.sh

Make sure that cert-manager is up and running:

kubectl get pods -n cert-manager

Sample output:

NAME                                       READY   STATUS    RESTARTS   AGE  
cert\-manager\-7f6665fd8c\-gp8vl              1/1     Running   0          9m32s  
cert\-manager\-cainjector\-666564dc88\-crzr9   1/1     Running   0          9m32s  
cert\-manager\-webhook\-fd94896cd\-d6s5v       1/1     Running   0          9m32s

And then make sure that the Operator is up and running:

kubectl get pods -n opentelemetry-operator\-system

Sample output:

NAME                                                         READY   STATUS    RESTARTS   AGE  
opentelemetry-operator\-controller-manager\-7dd6b7c9c9-pxwzg   2/2     Running   0          9m11s

#### 7- Deploy the Kubernetes manifests

This will deploy the OTel Demo and the `OpenTelemetryCollector` resources:

./src/scripts/03-deploy-resources.sh

The above script will:

*   Create a namespace called `otel-demo`
*   Deploy the `Secrets` file created in step 5
*   Deploy OTel Operator resources, including the `OpenTelemetryCollector` resource
*   Deploy the [OTel Demo manifest](https://github.com/avillela/otel-demo-k8s-dt/blob/main/src/k8s/otel-demo.yaml)

#### 8- Explore OTel data in Dynatrace!

Once everything is deployed, you can log into Dynatrace to explore the OTel data emitted by the OTel demo.

I won’t be going in-depth on how to navigate the Dynatrace UI; however, feel free to check out my video series, [Dynatrace Can Do THAT With OpenTelemetry?](https://dt-url.net/dt-loves-otel-yt), which includes 6 episodes so far! 😁

![A dark-themed observability dashboard displaying real-time metrics for 18 microservices, including quote, cart, checkout, frontend, load-generator, and others. For each service, columns show failure rate (mostly 0% with few small spikes), p50 response time ranging from microseconds to milliseconds, throughput (requests per minute), and health alert status (all showing no alerts). Filters on the left panel allow sorting by alert state, cloud provider, security context, and profiling availability.](https://cdn-images-1.medium.com/max/800/1*7-EyC_pyXwN6gfyfwSyn9w.png)

Dynatrace Services app

![A dashboard interface showing distributed tracing data for a microservices-based application. The left sidebar includes filters for service name, endpoint, request status, span kind, and more. The top chart visualizes request traffic over time, color-coded for successful requests, failures, and percentile durations (P50, P90), along with average latency. Below the chart, a large table lists 1,000 individual request traces.](https://cdn-images-1.medium.com/max/800/1*7fv8qnzednDWGGgY1cm37g.png)

Dynatrace Distributed Tracing app

![A dashboard interface displaying a time-series chart tracking log volume by severity level (INFO, WARN, ERROR, NONE) over time. Below the chart is a table of log entries with details including timestamp, status, log message content (e.g. currency conversion, recommendations, HTTP requests), and associated microservice name (like currency, recommendation, frontend-proxy). The interface highlights structured observability data from the OpenTelemetry Demo running in Kubernetes.](https://cdn-images-1.medium.com/max/800/1*5nm-zcr7mmVnZF7K81A9KA.png)

Dynatrace Logs app

![Line chart in a Dynatrace notebook titled “Recommendations Counter Notebook,” showing the average number of application-generated recommendations (avg(app\_recommendations\_counter)) over time. The x-axis spans from 11:32 AM to 12:03 PM; the y-axis ranges from 0 to 160. Data points fluctuate to reflect changing recommendation activity.](https://cdn-images-1.medium.com/max/800/0*Illhxo-xfufvwUiT.png)

Dynatrace Notebook showing app\_recommendation\_counter

### Final Thoughts

Swapping out the OTel Collector in the OTel Demo manifest for a Collector managed by the OTel Operator wasn’t quite as daunting as I thought it would be. By understanding what resources are required for running the Collector in Kubernetes behind the scenes, coupled with having an understanding of the OTel Operator-managed Collector, the swap goes from scary to manageable. Hopefully having that extra bit of background is less scary for you too!

Whether you just want to learn how to use the OTel Demo with the OTel Operator on Kubernetes, or are looking to swap out your Collectors on Kubernetes for Operator-managed ones, you should now have the tools at your disposal to explore, experiment, and further your learnings!

I will now leave you with a photo of my favourite animal, the [capybara](https://en.wikipedia.org/wiki/Capybara). I got to hang out with this one in real life at the [Cappiness Capybara Café](https://www.cappiness.jp) on a recent trip to Tokyo for KubeCon Japan.

![A capybara resting indoors on a blue cushion near a window, with greenery visible outside and a single blade of grass beside it.](https://cdn-images-1.medium.com/max/800/1*xocC3hNDTv5xvEfB_uOd4Q.jpeg)

Capybara. Taken at the [Cappiness Capybara Café](https://www.cappiness.jp) in Tokyo, Japan by [Adriana Villela](https://instagram.com/adrianamvillela).

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [July 10, 2025](https://medium.com/p/0e02c7a54d85).

[Canonical link](https://medium.com/@adri-v/switching-to-an-opentelemetry-operator-managed-collector-on-kubernetes-0e02c7a54d85)

Exported from [Medium](https://medium.com) on June 3, 2026.