---
title: "Platform engineering magic: Using Kratix to quickly deliver a pre-configured OpenTelemetry Operator"
slug: platform-engineering-magic-using-kratix-to-quickly-deliver-a-pre-configured-opentelemetry-operator
description: "Platform engineering automation in practice with Kratix"
added: "Apr 03, 2023"
tags:
  - technical
  - platform-engineering
---


![](https://cdn-images-1.medium.com/max/800/1*w1cCJk45YLZa-3gT0NwsaQ.jpeg)

Melting icicle. Photo by [Adri Villela](https://adri-v.medium.com).

_This post was originally published on the_ [_Syntasso blog_](https://www.syntasso.io/post/guest-blog-lightstep-and-kratix)_._

SRE teams are probably equally annoyed by requests from development teams. They don’t want to spend their time fulfilling service requests to install things like [PostgreSQL](https://www.postgresql.org/), [RabbitMQ](https://www.rabbitmq.com/), and [Nginx](https://www.nginx.com/) on [Kubernetes](https://kubernetes.io/) clusters for developers. This is honestly a waste of an SRE team’s time. They could be doing other, waaaaay cooler things with their time, like improving system reliability.

Which is why I’m super excited to see a movement toward self-serve provisioning coming from platform teams. One of the technologies that is helping to make this possible is [Kratix](https://kratix.io/). Kratix is a framework by [Syntasso](https://www.syntasso.io/) for building platforms which provides Kubernetes-native API-as-a-service out of the box.

Kratix allows SRE teams to deliver pre-configured, reliable, consistent, and compliant Kubernetes resources via an API that is easily consumed by developers. This is accomplished through a Kratix [Promise](https://kratix.io/docs/main/guides/installing-a-promise). A Promise is an encapsulation of a software capability. Its API and a pipeline enables the setup of the capability. All of this is defined in a Kubernetes YAML document which defines what is to be installed on a Kubernetes cluster (or other infrastructure!), how it is to be configured and deployed, and exposes it as an API that can be easily consumed by developers.

Promises are created by SRE teams. Kratix is typically installed on a control cluster, as are Kratix Promises. When you install a Kratix Promise, it makes the Promise resources available for installation on one or more worker clusters. Consumers of the API (typically development teams) request the resources via a simple resource request YAML file. The resources are applied to a worker cluster — i.e. the cluster where the development team’s services are deployed.

Kratix currently has a good-sized [Marketplace](https://kratix.io/marketplace) full of Promises that are ready-to-install. This is a great way to easily share resources both within and across organisations. You can also create your own Promise from scratch, which is what I’ll be demonstrating in today’s tutorial.

Are you ready? Let’s do this!!

### Tutorial

In this tutorial, we will be creating a Kratix Promise from scratch, and installing it. Specifically, we will create a Promise for the OpenTelemetry Operator. The [OpenTelemetry (OTel) Operator](https://opentelemetry.io/docs/k8s-operator/) is a [Kubernetes Operator](https://www.aspecto.io/blog/opentelemetry-operator/#What-is-a-Kubernetes-Operator) used to manage the deployment of the OpenTelemetry Collector on a Kubernetes cluster. As an added bonus, the OTel Operator also supports injecting and configuring [auto-instrumentation](https://opentelemetry.io/docs/concepts/instrumenting/#automatic-instrumentation) libraries for services written in [Python](https://opentelemetry.io/docs/instrumentation/python/automatic/), [Java](https://opentelemetry.io/docs/instrumentation/java/automatic/), [.NET](https://opentelemetry.io/docs/instrumentation/net/automatic/), and [NodeJS](https://opentelemetry.io/docs/instrumentation/js/libraries/#node-autoinstrumentation-package).

The Promise we’re creating today will do the following:

*   Install the OTel Operator
*   Configure and deploy an OTel Collector. The Collector will be configured to send [Traces](https://opentelemetry.io/docs/concepts/signals/traces/) to [Jaeger](https://www.jaegertracing.io/).
*   Install Jaeger
*   Deploy a Go service instrumented with OpenTelemetry

> **Note:** _we’ll be skipping out on the auto-instrumentation bit today. Sorry, kids!_

In real life, Kratix runs in a central location (i.e. a control cluster). The control cluster is responsible for installing Promises on worker clusters. If you’re familiar at all with [ArgoCD](https://adri-v.medium.com/list/argocd-2af5f37e1209), it’s a similar type of setup.

For the purposes of this tutorial, I will be running everything on a single cluster, so when I mention control cluster and worker cluster in the tutorial, they are, in fact, the same cluster.

### Tutorial Repo

All source code from this tutorial can be found [here](https://github.com/avillela/kratix-playground).

### Pre-Requisites

In order to complete this tutorial, you will need the following:

*   A basic understanding of [Kubernetes](https://kubernetes.io/) (If you need a refresher, check out my [Kubernetes articles](https://adri-v.medium.com/list/justintime-kubernetes-e13411064e51))
*   A basic understanding of [OpenTelemetry](https://opentelemetry.io/) and the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) (If you need a refresher, check out my article [here](https://medium.com/tucows/unpacking-observability-the-observability-stack-93d4733e2a72))
*   A Kubernetes cluster (I’m using Kubernetes version 1.25 at the time of this writing)

### Part 1: Creating a Promise

In this section, we’ll be creating a Promise from scratch. If this doesn’t interest you and you just want to install the Promise, feel free to skip this section and go directly to Part 2. You can find all source code [here](https://github.com/avillela/kratix-playground).

This Promise was created with the help of the [official Kratix docs](https://kratix.io/docs/main/guides/writing-a-promise#promise-api), and the lovely folks at Syntasso, who helped me debug some of the nasties.

#### 1- Create scaffolding

Let’s start by creating the directory structure for our Kratix Promise:

\# Promise directory structure  
mkdir -p oteloperator-promise/{resources,request-pipeline-image}  
mkdir -p oteloperator-promise/request-pipeline-image/{input,output}

The `resources` directory is where we will keep a copy of the Kubernetes resources that we want our Promise to create for us in the worker cluster. Resources can be Operators, Helm Charts, or any Kubernetes-native components required to run the software.

The `request-pipeline-image` is where we’ll define our pipeline — i.e. the additional resources/configs that we’ll be deploying to the worker cluster besides the OTel Operator.

#### 2- Define Promise template

Now, let’s create our Promise. We’ll start with our very basic Promise template:

tee \-a oteloperator-promise/promise-template.yaml <<EOF  
apiVersion: platform.kratix.io/v1alpha1  
kind: Promise  
metadata:  
  name: oteloperator

You should now have a file called `promise-template.yaml` in the oteloperator-promise directory, which looks like this:

apiVersion: platform.kratix.io/v1alpha1  
kind: Promise  
metadata:  
  name: oteloperator  
spec:  
  workerClusterResources:  
  xaasRequestPipeline:  
  xaasCrd:

Where:

*   `workerClusterResources` contains the things that you want to install on the worker cluster.
*   `xaasRequestPipleline` is used to instantiate the services defined in `workerClusterResources`.
*   `xaasCrd` is a Kubernetes [Custom Resource Definition](https://thenewstack.io/kubernetes-crds-what-they-are-and-why-they-are-useful/) (CRD). So basically, all this stuff that you’re deploying to the worker cluster is packaged up for you nicely by Kratix for you as a CRD. It’s pretty much the same idea as exposing an API for someone else to consume.

Let’s fill out `xaasCrd`:

tee \-a oteloperator-promise/promise-template.yaml <<EOF  
    apiVersion: apiextensions.k8s.io/v1  
    kind: CustomResourceDefinition  
    metadata:  
      name: oteloperators.example.promise  
    spec:  
      group: example.promise  
      scope: Namespaced  
      names:  
        plural: oteloperators  
        singular: oteloperator  
        kind: oteloperator  
      versions:  
      \- name: v1  
        served: true  
        storage: true  
        schema:  
          openAPIV3Schema:  
            type: object  
            properties:  
              spec:  
                type: object  
                properties:  
                  name:  
                    type: string  
EOF

Our `promise-template.yaml` now looks like this:

apiVersion: platform.kratix.io/v1alpha1  
kind: Promise  
metadata:  
  name: oteloperator  
spec:  
  workerClusterResources:  
  xaasRequestPipeline:  
  xaasCrd:  
    apiVersion: apiextensions.k8s.io/v1  
    kind: CustomResourceDefinition  
    metadata:  
      name: oteloperators.example.promise  
    spec:  
      group: example.promise  
      scope: Namespaced  
      names:  
        plural: oteloperators  
        singular: oteloperator  
        kind: oteloperator  
      versions:  
      \- name: v1  
        served: true  
        storage: true  
        schema:  
          openAPIV3Schema:  
            type: object  
            properties:  
              spec:  
                type: object  
                properties:  
                  name:  
                    type: string

Note that within `xaasCrd`, we are defining an actual Kubernetes CRD, which means that we must follow the [apiextensions.k8s.io/v1](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#create-a-customresourcedefinition) YAML schema.

Noteworthy items:

*   We set `spec.names.plural` to `oteloperators`, `spec.names.singular` to `oteloperator`. We also set `spec.names.kind` to `oteloperator`. These names reflect the fact that our Promise is creating a CRD for the OTel Operator.
*   `spec.group` is set to `example.promise`, which means that, per Kubernetes CRD naming convention, `metadata.name` must be a concatenation of spec.names.plural and `spec.group`, which translates to `oteloperators.example.promise`.

#### 3- Define the workerClusterResources

The `workerClusterResources` section of the Promise definition is where Kratix looks to find out what to install in the worker cluster. So what goes in there? Well, since we’re installing the OTel Operator, then the OTel Operator definition is what goes in there.

Before we populate the `workerClusterResources`, let’s start by getting a copy of OTel Operator YAML manifest:

curl -L https://github.com/open-telemetry/opentelemetry-operator/releases/download/v0.73.0/opentelemetry-operator.yaml -o oteloperator-promise/resources/opentelemetry-operator.yaml

Note that we’re installing version 0.73.0 of the OTel Operator, and we’re saving the YAML manifest to the [resources](https://github.com/avillela/kratix-playground/tree/main/oteloperator-promise/resources) directory created in Step 2, as `opentelemetry-operator.yaml`.

Now that we have a copy of the YAML manifest, we need to put everything from `opentelemetry-operator.yaml` into our Promise YAML. Except…if you look at the `opentelemetry-operator.yaml`, you’ll notice that it is one big mother of a file. And you can’t just do a copy-paste of the contents of that file into `workerClusterResources`, because `workerClusterResources` expects a list of each resource. Yikes! That would be a lot of manual, error-prone work. Fortunately, the nice folks at Syntasso were kind enough to create a handy-dandy tool, called the `worker-resource-builder`. This tool takes the contents of a YAML manifest and plunks them into the right spot in your Promise definition YAML. Yay! 🎉

Let’s download the `worker-resource-builder`:

curl -sLo worker-resource-builder https://github.com/syntasso/kratix/releases/download/v0.0.1/worker-resource-builder-v0.0.0-1-darwin-arm64  
chmod +x worker-resource-builder

> **Note:** _You’ll need to replace_ `_darwin-arm64_` _with the suffix specific to the architecture that you’re running on. You can see the full list of available downloads per architecture_ [_here_](https://github.com/syntasso/kratix/releases)_._

Now you can run the tool:

./worker-resource-builder \\  
\-k8s-resources-directory ./oteloperator-promise/resources \\  
\-promise ./oteloperator-promise/promise-template.yaml > ./oteloperator-promise/promise.yaml

Where:

*   `-k8s-resources-directory` is the location of your resources directory
*   `-promise` is the location of your `promise-template.yaml`

The result is the creation of a new file called `promise.yaml`. It contains all of the stuff from `promise-template.yaml` PLUS all of the resources from `opentelemetry-operator.yaml` are populated in the `workerClusterResources` section. The resulting file is HUGE, so I won’t paste the contents below. You can, however, check it out [here](https://github.com/avillela/kratix-playground/blob/main/oteloperator-promise/promise.yaml).

> **Note:** _I’m told by my friends at Syntasso that improving the Promise file experience is near the top of their product roadmap, so stay tuned!_

#### 4- Define the pipeline

While the `workerClusterResources` section of the Promise definition tells Kratix what to install on the worker cluster, the `xaasRequestPipeline` section tells Kratix how to instantiate it. So, in the case of the OTel Operator, we need to at a minimum deploy an [OpenTelemetryCollector resource](https://github.com/open-telemetry/opentelemetry-operator#getting-started). This resource deploys and configures an OpenTelemetry Collector instance on Kubernetes.

But this wouldn’t be a very exciting example if we did just that, would it? So we’re going to spice things up a bit, and not only deploy and configure a Collector as part of our pipeline, we’re also going to deploy a Jaeger instance and a sample Go service instrumented with OpenTelemetry, so that we can test our setup. The OpenTelemetry Collector will be configured to send [Traces](https://opentelemetry.io/docs/concepts/signals/traces/) to [Jaeger](https://www.jaegertracing.io/).

In our pipeline, we need to instantiate the OTel Collector, deploy Jaeger, and deploy our sample app, so we need to create YAML manifests for Kratix to deploy them to the worker cluster.

You can grab them as per below:

\# Create namespaces  
curl -s https://raw.githubusercontent.com/avillela/kratix-playground/main/oteloperator-promise/request-pipeline-image/namespaces.yaml -o oteloperator-promise/request-pipeline-image/namespaces.yaml  
  
\# Jaeger  
curl -L https://raw.githubusercontent.com/avillela/kratix-playground/main/oteloperator-promise/request-pipeline-image/jaeger.yaml -o oteloperator-promise/request-pipeline-image/jaeger.yaml  
  
\# OTel Collector  
curl -s https://raw.githubusercontent.com/avillela/kratix-playground/main/oteloperator-promise/request-pipeline-image/otel-collector.yaml -o oteloperator-promise/request-pipeline-image/otel-collector.yaml  
  
\# Sample OTel Go app  
curl -s https://raw.githubusercontent.com/avillela/kratix-playground/main/oteloperator-promise/request-pipeline-image/otel-go-example.yaml -o oteloperator-promise/request-pipeline-image/otel-go-example.yaml

Unfortunately, `xaasRequest` expects a list of one or more [Docker containers](https://www.docker.com/resources/what-container/) encapsulating the information you need to instantiate the `workerClusterResources`. So we need to get these YAML manifests into a Docker image in order to run our pipeline.

You may recall in Step 2 that we created a folder called `request-pipeline-image`, with two sub-folders, `input` and `output`. Kratix expects a Docker image with these input and output folders. The input folder is where Kratix ingests the resource request YAML. More on that later. The output folder is where Kratix looks for our aforementioned YAML manifests.

Let’s create a super simple pipeline. We begin by defining a simple script in request-pipeline-image called `execute-pipeline.sh`:

tee -a oteloperator-promise/request-pipeline-image/execute-pipeline.sh <<EOF  
#!/bin/sh  
  
set -x  
  
cp /tmp/transfer/\* /output/  
EOF  
  
chmod +x oteloperator-promise/request-pipeline-image/execute-pipeline.sh

All this script does is copy YAML files from the container instance’s transfer folder into its output folder. Kratix will then automagically pull the YAML manifests from the output folder and apply them to the worker cluster. 🪄

> **Note:** _If you want to do fancier things, you totally can, but for our purposes, this script does the trick. You can see fancier examples of pipeline execution scripts_ [_here_](https://github.com/syntasso/promise-postgresql/blob/main/internal/request-pipeline/execute-pipeline) _and_ [_here_](https://github.com/syntasso/promise-observability/blob/main/internal/request-pipeline/execute-pipeline)_._

This script executes inside a Docker container, so we need to create a Docker image:

tee \-a oteloperator\-promise/request\-pipeline\-image/Dockerfile <<EOF  
FROM "mikefarah/yq:4"  
RUN \[ "mkdir", "/tmp/transfer" \]  
COPY \*.yaml /tmp/transfer/  
ADD execute\-pipeline.sh execute\-pipeline.sh  
CMD \[ "sh", "-c", "./execute-pipeline.sh"\]  
ENTRYPOINT \[\]  
EOF

Now, let’s build the image locally:

docker build -t oteloperator-request-pipeline:dev ./oteloperator-promise/request-pipeline-image/

Let’s test the container, to make sure that it does what it needs to do:

docker run -v $PWD/oteloperator-promise/request-pipeline-image/input:/input -v $PWD/oteloperator-promise/request-pipeline-image/output:/output oteloperator-request-pipeline:dev

Expected output:

\+ cp /tmp/transfer/jaeger.yaml   
  /tmp/transfer/namespaces.yaml   
  /tmp/transfer/otel-collector.yaml   
  /tmp/transfer/otel-go-example.yaml   
  /output/

This shows that the Docker container is doing what it’s supposed to do! Now let’s push the image to your container registry. I’m using GitHub Container Registry (GHCR):

export GH\_TOKEN="<your\_gh\_pat>"  
export GH\_USER="<your\_gh\_username>"  
export IMAGE="oteloperator-request-pipeline:dev"  
  
echo $GH\_TOKEN | docker login ghcr.io -u $GH\_USER --password-stdin

Where:

*   `GH_TOKEN` is your GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
*   `GH_USER` is your GitHub username

Since I’m using an M1 Mac (ARM64 architecture), but my Kubernetes is AMD64 architecture, when I push to GHCR, I do a multi-arch build and push using [docker buildx](https://docs.docker.com/engine/reference/commandline/buildx/). To enable docker buildx on your machine, check out this tutorial [here](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/).

docker buildx build --push -t ghcr.io/$GH\_USER/$IMAGE --platform=linux/arm64,linux/amd64 ./oteloperator-promise/request-pipeline-image/

Once you push your image to GHCR, make sure that you make the repo public, so that Kubernetes can pull the image without requiring [image pull secrets](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) (we’re keeping things simple here).

Now we’re finally ready to add the pipeline to our Promise definition. For some reason, the `worker-resource-builder` seems to nukify the `xaasRequestPipeline` section of our Promise definition YAML, so we’ll have to add it again. No biggie — it’s a known bug with `worker-resource-builder`, and there are plans to address it. Just add it before `xaasCrd`. Your file should look something like this:

apiVersion: platform.kratix.io/v1alpha1  
kind: Promise  
metadata:  
  creationTimestamp: null  
  name: oteloperator  
spec:  
  workerClusterResources:  
...  
  xaasRequestPipeline:  
    \- <your\_pipeline\_image>  
  xaasCrd:  
    apiVersion: apiextensions.k8s.io/v1  
    kind: CustomResourceDefinition  
    metadata:  
      name: oteloperator.example.promise  
    spec:  
      group: example.promise  
      names:  
        kind: oteloperator  
        plural: oteloperators  
        singular: oteloperator  
      scope: Namespaced  
      versions:  
      \- name: v1  
        schema:  
          openAPIV3Schema:  
            properties:  
              spec:  
                properties:  
                  name:  
                    type: string  
                type: object  
            type: object  
        served: true  
        storage: true  
status: {}

Where `<your_pipeline_image>` is your pipeline image. Feel free to use mine if you’d like:

ghcr.io/avillela/oteloperator-request-pipeline:dev@sha256:37d8b8e306e7ea96b385cf1b2b09dd7ca2c9f00103333793d5d65ef2449601b4

But why did I include the long-ass SHA after `oteloperator-request-pipeline:dev`? Because I did a multi-arch build with `docker buildx`, and it pushed the AMD64 and ARM64 versions to GHCR:

![Screen caputer of arch-specific versions of Docker image builds in GHCR.](https://cdn-images-1.medium.com/max/800/1*lzlMpsfPEr2SaIaFEH6f0Q.png)

Screen caputer of arch-specific versions of Docker image builds in GHCR.

I want to make sure that when Kubernetes pulls the pipeline image, it pulls the one for the correct architecture.

You can check out my full Promise YAML definition [here](https://github.com/avillela/kratix-playground/blob/main/oteloperator-promise/promise.yaml).

### Part 2: Installing a Promise

We are finally ready to install and test our Promise! Yay! 🎉

#### 1- Install Kratix

> **_Note_**: this step would normally be run on the control cluster.

If we’re going to be using Kratix, we should probably install it on our cluster! Let’s do that right now:

\# Install Kratix  
kubectl apply --filename https://raw.githubusercontent.com/syntasso/kratix/main/distribution/single\-cluster/install-all-in\-one.yaml  
  
\# Configure Kratix  
kubectl apply --filename https://raw.githubusercontent.com/syntasso/kratix/main/distribution/single\-cluster/config-all-in\-one.yaml

Let’s look at our namespaces by running:

kubectl get ns

Sample output:

NAME                     STATUS   AGE  
default                  Active   39m  
flux-system              Active   4m56s  
kratix-platform-system   Active   5m2s  
kratix-worker-system     Active   4m20s  
kube-node-lease          Active   39m  
kube-public              Active   39m  
kube-system              Active   39m

Notice that there are 3 new namespaces created in your Kubernetes cluster:

*   `flux-system`
*   `kratix-platform-system`
*   `kratix-worker-system`

If you were using 2 separate clusters (i.e. control and worker clusters), `flux-system` and `kratix-platform-system` would be installed on your control cluster, and `kratix-worker-system` would be installed on your worker cluster.

#### 2- Install the Promise

> **_Note_**: this step would normally be run on the control cluster.

The OTel Operator requires that [cert-manager](https://cert-manager.io/) be installed as a prerequisite. Fortunately, Kratix has [cert-manager available through its marketplace](https://github.com/syntasso/kratix-marketplace/tree/main/cert-manager). Let’s install it:

kubectl create -f https://raw.githubusercontent.com/syntasso/kratix-marketplace/main/cert-manager/promise.yaml

This may take a few seconds, so be patient, and wait until you see a `cert-manager` namespace created in your cluster.

Now that cert-manager is installed, let’s install our Promise:

kubectl apply -f oteloperator-promise/promise.yaml

Let’s check to see what promises have been installed:

kubectl get promises

Sample output:

NAME AGE  
cert-manager 78s  
oteloperator 22s

Again, this may take a bit, so be patient, and wait until you see a `opentelemetry-operator-system` namespace created in your cluster.

You should also be able to see the newly-created CRD in Kubernetes. Get all CRDs:

kubectl get crds --watch

You should, among other things, see the `opentelemetrycollectors.opentelemetry.io` and the `oteloperators.example.promise` CRDs listed in the output:

certificaterequests.cert-manager.io              2023-03-27T22:24:53Z  
certificates.cert-manager.io                     2023-03-27T22:24:53Z  
challenges.acme.cert-manager.io                  2023-03-27T22:24:53Z  
...  
opentelemetrycollectors.opentelemetry.io         2023-03-27T22:25:55Z  
...  
oteloperators.example.promise                    2023-03-27T22:36:27Z  
...

#### 3- Request the resource

> **Note**: _this step would normally be run on the worker cluster._

Now it’s time to request the resource. To do that, we need to define a resource request YAML:

tee \-a oteloperator-promise/oteloperator-resource-request.yaml <<EOF  
apiVersion: example.promise/v1  
kind: oteloperator  
metadata:  
  name: my-oteloperator-promise-request  
spec:  
  name: my-amazing-oteloperator  
EOF

The resulting file is saved to the [oteloperator-promise](https://github.com/avillela/kratix-playground/tree/main/oteloperator-promise) folder:

apiVersion: example.promise/v1  
kind: oteloperator  
metadata:  
  name: my-oteloperator-promise-request  
spec:  
  name: my-amazing-oteloperator

There are two important things to keep in mind when defining your request YAML:

*   The `kind` is set to `oteloperator`. That is the same value that we specified in `xaasCrd.spec.names.kind` in our [promise.yaml](https://github.com/avillela/kratix-playground/blob/main/oteloperator-promise/promise.yaml#L5678). If the kind doesn’t match the kind value in `xaasCrd`, Kratix will err out.
*   The `apiVersion` needs to match the value of `xaasCrd.spec.group` ([here](https://github.com/avillela/kratix-playground/blob/main/oteloperator-promise/promise.yaml#L5676)) along with the version defined in `xaasCrd.spec.versions.name` ([here](https://github.com/avillela/kratix-playground/blob/main/oteloperator-promise/promise.yaml#L5683)) in our [promise.yaml](https://github.com/avillela/kratix-playground/blob/main/oteloperator-promise/promise.yaml). Again, if it doesn’t match, Kratix will err out.

Also, check out how small this file is, compared to the Promise definition. And by applying this teeny little file to Kubernetes, the following will be deployed to the worker cluster:

*   An OTel Collector instance configured to send Traces to Jaeger
*   A Jaeger instance
*   A Go service that sends OTel Traces to the Collector (which in turn sends those Traces to Jaeger).

How freakin’ cool is that?

Okay…let’s request the Promise, shall we?

kubectl apply -f oteloperator-promise/oteloperator-resource-request.yaml

This will create 2 new namespaces: opentelemetry and application. We can check this by running the following:

kubectl get ns

Sample output:

NAME                            STATUS   AGE  
application                     Active   4m29s  
cert-manager                    Active   40m  
default                         Active   5h20m  
flux-system                     Active   41m  
kratix-platform-system          Active   41m  
kratix-worker-system            Active   40m  
kube-node-lease                 Active   5h20m  
kube-public                     Active   5h20m  
kube-system                     Active   5h20m  
opentelemetry                   Active   4m29s  
opentelemetry-operator-system   Active   5m49s

We can also check our Promise request logs to make sure that everything was created properly. First we check the `status-writer` container of our Promise request pod:

kubectl logs --selector=kratix-promise-id=oteloperator-default --container status-writer

Sample output:

status: "True"  
type: PipelineCompleted  
reason: PipelineExecutedSuccessfully  
'  
\+ export 'status\_values=message: Resource requested'  
\+ '\[' -f /work-creator-files/metadata/status.yaml \]  
\+ yq -n '.status = env(status\_values)'  
\+ yq '.status.conditions\[0\] = env(conditions)'  
\+ kubectl patch oteloperator.example.promise/my-oteloperator-promise-request --namespace default --type merge --patch-file status.yaml --subresource status  
oteloperator.example.promise/my-oteloperator-promise-request patched

This shows that our pipeline execution completed successfully.

If you get this error:

Error from server (BadRequest): container "status-writer" in pod "request-pipeline-oteloperator-default-c62ad" is waiting to start: PodInitializing

Don’t panic!! Re-run the `kubectl logs` command above a few more times, as the container likely hasn’t executed yet due to dependencies on other containers.

Next, we check the `xaas-request-pipeline-stage-0` container of our Promise request pod:

kubectl logs --selector=kratix-promise-id=oteloperator-default --container xaas-request-pipeline-stage\-0

Sample output:

\+ cp /tmp/transfer/jaeger.yaml /tmp/transfer/namespaces.yaml /tmp/transfer/otel-collector.yaml /tmp/transfer/otel-go-example.yaml /output/

This shows the same output that we got when we ran our Docker container locally in Part 1, Step 5.

#### 4- Test our setup

> **Note**: _this step would normally be run on the worker cluster._

The logs show that everything is looking pretty good, but let’s just make sure by running a few tests.

Open a new terminal window and enable port-forwarding on the Jaeger UI:

kubectl port\-forward \-n opentelemetry svc/jaeger\-all\-in\-one\-ui 16686:16686

You should be able to access Jaeger through [http://localhost:16686](http://localhost:16686/):

![](https://cdn-images-1.medium.com/max/800/0*XjilrZAYQqIrPbAU.png)

Next, open a new terminal window, and enable port-forwarding for the Go service:

kubectl port-forward -n application svc/otel-go-server-svc 9000:9000

Open yet another terminal window to hit the Go service’s API endpoint:

curl http://localhost:9000

Sample output:

User Kathryn Janeway signed up⏎

Let’s check the OTel Collector logs:

kubectl logs -l app=opentelemetry -n opentelemetry \--follow

Sample output:

SpanEvent #0  
     -> Name: map\[Accept:\[\*/\*\] User-Agent:\[curl/7.85.0\]\]  
     -> Timestamp: 2023-03-27 23:25:19.175520554 +0000 UTC  
     -> DroppedAttributesCount: 0  
ScopeSpans #1  
ScopeSpans SchemaURL:   
InstrumentationScope go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp semver:0.32.0  
Span #0  
    Trace ID       : ff2726d1894d20a16fe5e83277491d7c  
    Parent ID      :   
    ID             : ff001a2f2cbbb054  
    Name           : /  
    Kind           : Server  
    Start time     : 2023-03-27 23:25:19.175466014 +0000 UTC  
    End time       : 2023-03-27 23:25:19.175541334 +0000 UTC  
    Status code    : Unset  
    Status message :   
Attributes:  
     -> net.transport: Str(ip\_tcp)  
     -> net.peer.ip: Str(127.0.0.1)  
     -> net.peer.port: Int(42798)  
     -> net.host.name: Str(localhost)  
     -> net.host.port: Int(9000)  
     -> http.method: Str(GET)  
     -> http.target: Str(/)  
     -> http.server\_name: Str(/)  
     -> http.user\_agent: Str(curl/7.85.0)  
     -> http.scheme: Str(http)  
     -> http.host: Str(localhost:9000)  
     -> http.flavor: Str(1.1)  
     -> http.wrote\_bytes: Int(30)  
     -> http.status\_code: Int(200)  
        {"kind": "exporter", "data\_type": "traces", "name": "logging"}

This is good, because it shows the Trace in our logs, which means that the Collector is receiving the Trace.

Let’s make sure that we also see the Trace in Jaeger by going to [http://localhost:16686](http://localhost:16686/). We should be able to see a service called `registration-server`:

![Screen capture showing drop-down with the registration-server service in Jaeger.](https://cdn-images-1.medium.com/max/800/0*xPD3D5HxwTplWJ9Y.png)

Drop-down showing our service in Jaeger

And we should be able to select that service to see the Trace:

![Screen capture of Jaeger UI, showing the trace from our Go example](https://cdn-images-1.medium.com/max/800/0*R-JNejy22ZDQpErz.png)

See our trace in Jaeger

![Screen capture of Jaeger, showing the flame graph for our trace](https://cdn-images-1.medium.com/max/800/0*_EM6DA6GXoOacv0Y.png)

Trace flame graph in Jaeger

Yay! 🎉

### Gotchas & Troubleshooting

#### Deleting Promises

If you have an invalid CRD in Kratix, if you try to delete the Promise, it will hang. So to delete the Promise, you’ll have to do the following:

1.  Run `kubectl delete promise oteloperator`. This will hang so you will need to kill it.
2.  Run `kubectl edit promise oteloperator`. Once the file is opened, scroll down to the `finalizers` section, and delete all the `finalizers`. Save and close the resource. This will cause the delete in Step 1 to complete.
3.  Run `kubectl get promises` and you should not see the deleted Promise anymore.

#### Jaeger port-forward not working

I don’t know why, but one of the times I deployed this, when I first applied the resource request, and set up Jaeger port-forwarding, Jaeger was being a turd and wasn’t running properly. So I decided to nukify everything and re-apply:

\# Nukify  
kubectl delete promise oteloperator  
  
\# Re-apply promise  
kubectl apply -f oteloperator-promise/promise.yaml  
  
\# Re-create resource request  
kubectl apply -f oteloperator-promise/oteloperator-resource-request.yaml

> **Note:** _When you nukify the Promise, it will delete everything that came with it: the Promise, the Promise request, and any resources that were created as part of the Promise, including namespaces. Pretty neat, huh?_

#### Troubleshooting a Promise

If you deploy a Promise it doesn’t appear to be deploying properly, you can check the Kratix manager logs:

curl -L https://raw.githubusercontent.com/avillela/kratix-playground/main/scripts/manager-logs.sh -o manager-logs.sh  
  
chmod +x manager-logs.sh  
  
./manager-logs.sh

### Final Thoughts

Today we got some hands-on time with Kratix. We learned how to:

*   Create a Promise for the OTel Operator from scratch
*   Install the OTel Operator Promise
*   Request the Promise resources, which resulted in the following:
*   Configured and installed the OTel Collector
*   Installed Jaeger
*   Deployed a Go service instrumented with OpenTelemetry

Most importantly, we got to experience the power of self-serve provisioning tooling. I’m really excited to keep up with Kratix as it continues to evolve, and I look forward to a day when tools like Kratix will be the go-to in the SRE’s toolbelt in the continued journey of system reliability.

For more on this topic, check out the [SRE Wishlist for 2023 blog post](https://thenewstack.io/our-2023-site-reliability-engineering-wish-list/) that I wrote with my partner-in-crime, [Ana Margarita Medina](https://twitter.com/ana_m_medina), and our upcoming talk at [KubeHuddle Toronto 2023](https://kubehuddle.com/2023/toronto/) in May.

That was a lot to take in, so as always, I will reward you for your patience. Please enjoy this photo of my rat Phoebe, as she pokes her head through a hole in a towel. Doesn’t she look cuddly? ❤️❤️

![Caramel-colored rat poking its head out of a grayish blue towel](https://cdn-images-1.medium.com/max/800/0*icW8AYcdE5RtoI9u.jpg)

Phoebe the rat looks cuddly in her towel. Photo by RI Maxwell

Before I wrap up, I want to send a huge shoutout to my friends at Syntasso, especially [Abby Bangser](https://www.linkedin.com/in/abbybangser) and [Chris Hedley](https://www.linkedin.com/in/hedleychristopher) for their help in getting the OTel Operator Promise up and running.

Until next time, peace, love, and code. ✌️❤️👩‍💻

_Originally published at_ [_https://www.syntasso.io_](https://www.syntasso.io/post/guest-blog-lightstep-and-kratix) _on April 3, 2023._

By [Adriana Villela](https://medium.com/@adri-v) on [April 3, 2023](https://medium.com/p/1ce2a9d988ad).

[Canonical link](https://medium.com/@adri-v/platform-engineering-magic-using-kratix-to-quickly-deliver-a-pre-configured-opentelemetry-operator-1ce2a9d988ad)

Exported from [Medium](https://medium.com) on June 3, 2026.