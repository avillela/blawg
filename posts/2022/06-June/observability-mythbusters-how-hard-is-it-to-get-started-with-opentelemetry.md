---
title: "Observability Mythbusters: How hard is it to get started with OpenTelemetry?"
slug: observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry
description: "The absolute beginner’s guide to getting data into Lightstep"
added: "Jun 13, 2022"
tags:
  - technical
  - observability
  - opentelemetry
---


![View of Georgian Bay from the top fo Blue Mountain.](https://cdn-images-1.medium.com/max/800/1*WHgjmjj3HZucF222vQN4BA.jpeg)

View of Georgian Bay from the top fo Blue Mountain. Photo by [Adri Villela](https://adri-v.medium.com).

So you’re [new to Observability](https://medium.com/@adri-v/list/unpacking-observability-be1835c6dd23) and [OpenTelemetry](https://lightstep.com/blog/opentelemetry.io) and Lighststep and you want to send traces to Lighstep to get a feel for the flow of things. But you’re not sure how to get started. There’s a LOT to learn and take in, and things can get pretty overwhelming, pretty fast, amirite? I feel ya. I’ve been there before. That was me last year. Solidarity!!

But, not to worry, my friend, because I am here to walk you through things. If you’re looking to do a quickie setup to learn how to send OpenTelemetry data over to Lightstep, then you, my friend, have come to the right place!

The [OpenTelemetry Demo Webstore](https://github.com/open-telemetry/opentelemetry-demo-webstore) repo was created to help lower the barrier to entry into OpenTelemetry and to illustrate its awesomeness. It features a fully-functioning online store made up of multiple micro-services, written in different languages that are supported by OpenTelemetry, that can send traces to an Observability back end, like Lightstep. (OMG that was a mouthful!) Most importantly, I found it superly duperly easy to set up and get going!

In today’s tutorial, I will show you how to get [Traces](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces) produced by the [OpenTelemetry Demo Webstore](https://github.com/open-telemetry/opentelemetry-demo-webstore) into Lightstep. The example uses the [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector) to ingest the Traces and send them to an Observability back-end, which in our case, will be Lightstep.

A few importat notes:

*   I am assuming that you have a basic understanding of OpenTelemetry and Observability. If not, check out this great [OpenTelemetry overview](https://opentelemetry.io/docs/concepts/what-is-opentelemetry) and [Observability oberview](https://opentelemetry.io/docs/concepts/observability-primer).
*   I will not be covering application instrumentation with OpenTelemetry — our goal is merely to get [Trace](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces) data into Lightstep via the OTel Collactor.

Before we start the tutorial, let’s do a quick OTel Collector overview, so that you can understand _how_ you’re getting data into Lighstep!

### OTel Collector 101

![The OTel Collector is made up of receivers, processors, and exporters](https://cdn-images-1.medium.com/max/800/1*rmzIJ7kiakz7ShSKxJwRZQ.png)

The OTel Collector. Image by [Adri Villela](https://adri-v.medium.com).

The OpenTelemetry (OTel) Collector is a vendor-neutral service that ingests, transforms, and exports data to one or more Observability back-ends.

The OTel Collector consists of 3 main components:

*   [**Receivers**](https://opentelemetry.io/docs/collector/configuration/#receivers) ingest data. Example data sources include: Kubernetes clusters, Prometheus, and application code.
*   [**Processors**](https://opentelemetry.io/docs/collector/configuration/#processors) transform data. This can include adding/removing data, modifying data (e.g. data masking), and even filtering data.
*   [**Exporters**](https://opentelemetry.io/docs/collector/configuration/#exporters) send data to an Observability back-end. In our case, Lightstep. Lightstep ingests OTel data natively, using the [OpenTelemetry Protocol (OTLP)](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md).

[Pipelines](https://opentelemetry.io/docs/collector/configuration/#service) are used to define how data flows in and out of the OTel Collector.

For more on the OTel Collector, please see the [official OTel docs site](https://opentelemetry.io/docs/collector).

> **NOTE:** _Although your instrumented code could_ technically _send data directly to an Observability back-end (e.g. Lightstep) without a Collector, it’s not really the right way to go about it. You should always funnel all OTel data (regardless of the soure) to your back-end by way of the OTel Collector._

#### Running the OTel Collector

There are [several ways to deploy the OTel Collector](https://opentelemetry.io/docs/collector/getting-started); however, we’re keeping things simple and local today, using [Docker Compose](https://docs.docker.com/get-started/08_using_compose), which runs [Docker](https://www.docker.com/get-started).

#### Configuration

The OTel Collector is [configured via YAML](https://opentelemetry.io/docs/collector/configuration).

The YAML file is used to define [receivers](https://opentelemetry.io/docs/collector/configuration/#receivers), [processors](https://opentelemetry.io/docs/collector/configuration/#processors), [exporters](https://opentelemetry.io/docs/collector/configuration/#exporters), and [pipelines](https://opentelemetry.io/docs/collector/configuration/#service).

### Tutorial

Ah, now the moment y’all have been waiting for — the tutorial! Let’s do this!

For this tutorial, we will be using a [modified version of the OpenTelemetry Demo Webstore](https://github.com/lightstep/opentelemetry-demo-webstore) repo. This repo has been modified to demonstrate how to send data to Lightstep using the OTel Collector. While the [upstream repo](https://github.com/open-telemetry/opentelemetry-demo-webstore) contains configs to send data to a local installation of Jaeger, the modified version contains configs to send data to Lightstep. We will be keeping the Lighstep repo in sync with the upstream repo.

#### Pre-Requisites

*   [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/get-started/08_using_compose)
*   A [Lightstep account](https://app.lightstep.com/signup)
*   A [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens#create-an-access-token)

#### Running the Webstore App Locally

**1- Clone the repo**

```
git clone https://github.com/lightstep/opentelemetry-demo.git
```

**2- Edit the** [**OTel Collector Config file**](https://github.com/lightstep/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config-extras.yml)

This file allows you to configure the OpenTelemetry Collector with your own Observability back-end. This case, [**otelcol-config-extras.yml**](https://github.com/lightstep/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config-extras.yml) is already configured to use Lightstep as the back-end. All you need to do is add your [**Lightstep Access Token**](http://localhost:4000/docs/create-and-manage-access-tokens#create-an-access-token) to the file, to be able to send traces to Lightstep.

cd `opentelemetry-demo`

Open `[src/otelcollector/otelcol-config-extras.yml](https://github.com/lightstep/opentelemetry-demo/blob/main/src/otelcollector/otelcol-config-extras.yml)` for editing using your favourite editor. The file looks like this:

\# extra settings to be merged into OpenTelemetry Collector configuration  
\# do not delete this file  
            
exporters:  
 logging:  
   logLevel: debug  
 otlp/ls:  
   endpoint: ingest.lightstep.com:443  
   headers:   
     "lightstep-access-token": "<lightstep\_access\_token>"  
    
service:  
 pipelines:  
   traces:  
     receivers: \[otlp\]  
     processors: \[batch\]  
     exporters: \[logging, otlp/ls\]  
   metrics:  
     receivers: \[otlp\]  
     processors: \[batch\]  
     exporters: \[logging, otlp/ls\]

Replace `<lightstep_access_token>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens#create-an-access-token), and save the file. The Access Token tells what [Lightstep project](https://docs.lightstep.com/docs/create-projects-for-your-environments) to send your telemetry data to.

A few noteworthy items:

*   The Collector can ingest data using both HTTP _and_ gRPC. The `receivers` configuration may _appear_ to be empty; however, it actually means that we are using the defult values for the `receivers` config. It is actually the same as saying:

receivers:  
  otlp:  
    protocols:  
      grpc:  
        endpoint: 0.0.0.0:4317  
      http:  
        endpoint: 0.0.0.0:4318

*   Lightstep ingests data in native [OpenTelemetry Protocol (OTLP)](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md) format, so we will use the [OTLP Exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter). The exporter can be called either `otlp` or follow the naming format `otlp/<something>`. We could call it `otlp/bob` if we wanted to. We're calling our exporter `otlp/ls` to signal to us that we are using the OTLP exporter to send the data to Lightstep.
*   Though not mandatory, we are also using a [Logging Exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/loggingexporter). This is helpful, as it prints our traces to the Collector’s `stdout`. As you might imagine, this is great for debugging, especially if you see traces sent to `stdout`, but not to your back-end.
*   We must define a pipeline in the `service.pipelines` section of the YAML config. Specifically, we need to define a pipeline for our taces. The pipeline tells the Collector: a) Where it’s getting Trace data from (it’s being sent via OTLP) b) If there’s any processing that needs to be done (this is optional) c) Where to send data to. In our case, it’s to `stdout` (via the [Logging Exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/loggingexporter)) and to Lightstep (via [OTLP Exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlpexporter))

> **TIP:** _If you find that you can’t see data in Lightstep, make sure that you’ve defined a pipeline, and that the pipeline’s exporter lists your_ `_otlp/ls_` _exporter. I can tell you that twice this week I forgot to add my exporter to the pipeline, and was sitting in front of my computer in sheer panic trying to figure out why I could see my traces in_ `_stdout_` _but not in Lightstep. 😱_

**3- Launch the app**

If you’re not already in the repo root, make sure you go there:

```
cd opentelemetry-demo
```

Run Docker compose. If you’re on an x86–64 machine (i.e. Intel or AMD-based, non-Apple Silicon), run the command below. If you’re running the Demo App for the first time, it will download all of the Docker images first. This may take several minutes.

docker compose up --no-build

If you’re on an Apple Silicon machine, you will need to build all images from source using the command below, as the images hosted in the GitHub Container Registry (GHCR) are built and optimized for x86–64 machines. This can take upwards of 20 minutes.

 docker compose build  
 docker compose up

Once the app is up and running, you will see text continuously scrolling down the screen. _This is expected!!_ The sample output looks something like this:

![Sample output on stdout from running the OpenTelemetry Demo Webstore application](https://cdn-images-1.medium.com/max/800/0*co6oiPt1SZZy9M50.png)

Sample output from OTel Demo Webstore. Image by [Adri Villela](https://adri-v.medium.com)

> **ASIDE:** _After the app started up, I kept waiting for the scrolling text to stop, only to realize that, “Oh, this thing is running. Guess I can access the URL now!” 🙄_

Since we added our [Logging Exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/loggingexporter) to our pipeline definition, you’ll also see that zoom by past you in the terminal:

![Sample output on stdout from the Logging Exporter when running the OpenTelemetry Demo Webstore app](https://cdn-images-1.medium.com/max/800/0*ehotgw_VGIt0aTzI.png)

Sample Logging Exporter output from the OTel Demo Webstore. Image by [Adri Villela](https://adri-v.medium.com).

> **NOTE:** _Obviously the Logging Exporter is more useful when it’s not running with a bunch of other services competing for your attention on your terminal. This will be more useful if you’re running it in_ [_Kubernetes_](https://opentelemetry.io/docs/collector/getting-started/#kubernetes) _or_ [_Nomad_](https://opentelemetry.io/docs/collector/getting-started/#nomad)_, or running standalone with_ [_Docker_](https://opentelemetry.io/docs/collector/getting-started/#docker)_._

You can now access the Webstore app: [http://localhost:8080](http://localhost:8080)

![Screen capture of the OpenTelemetry Demo App main screen](https://cdn-images-1.medium.com/max/800/1*cTWaBqnKdqU3eRSKiWa17g.jpeg)

OpenTelemetry Demo App main screen

Be sure to play around. Browse. Add items to your cart. Remove items from your cart. Checkout.

**4- See the Traces in Lightstep**

To [**view traces**](https://docs.lightstep.com/docs/view-traces) in your Lightstep Observability project, check out Lightstep Observability [**Notebooks**](http://localhost:4000/docs/use-notebooks).

![](https://cdn-images-1.medium.com/max/800/1*kSZX_-Z_Fpd7VLUrl1if1w.jpeg)

Screen capture of sample Traces in Lightstep

### Conclusion

Today we saw how easy it was to get Trace data into Lightstep using the [modified version of the OpenTelemetry Demo Webstore](https://github.com/lightstep/opentelemetry-demo-webstore), which uses our good friend, the OTel Collector.

Now that you’ve been able to get Trace data into Lighstep, I encourage you to play around with it. If you have any questions about Observability or OTel, pop into the [Lightstep Community Discord](https://ltstp.run/discord), or [get in touch by e-mail](mailto:devrel@lightstep.com).

And to reward you for your work today, please enjoy this cartoon drawn by my daughter.

![Cartoon of frog-like man in a shirt and tie holding a coffee cup that says “Yo” while his co-worker, a hovering octopus in a hoodie stands next to him. They are in a kitchen.](https://cdn-images-1.medium.com/max/800/1*s5oYsTlhanpIDDeiMm4JLw.jpeg)

“The Coffee Break” by [Hannah Maxwell](https://instagram.com/old_fashion_glazed).

Peace, love, and code. 🦄 🌈 💫

The [OpenTelemetry Demo Webstore App](https://github.com/open-telemetry/opentelemetry-demo-webstore) is always looking for feedback and contributors. Please consider [joining the OTel Community](https://github.com/open-telemetry/community/blob/main/community-membership.md#member) to help make OpenTelemetry AWESOME!

For more Observability articles, check out my Unpacking Observability series:

[**Unpacking Observability**  
_Stories to help you understand Observability and OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/be1835c6dd23 "https://adri-v.medium.com/list/be1835c6dd23")[](https://adri-v.medium.com/list/be1835c6dd23)

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry)_._

By [Adriana Villela](https://medium.com/@adri-v) on [June 13, 2022](https://medium.com/p/88cd91f4b5a1).

[Canonical link](https://medium.com/@adri-v/observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry-88cd91f4b5a1)

Exported from [Medium](https://medium.com) on June 3, 2026.