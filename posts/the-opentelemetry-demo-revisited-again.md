---
title: "The OpenTelemetry Demo Revisited (Again)"
slug: the-opentelemetry-demo-revisited-again
description: "Sending OTel Demo Data to Dynatrace"
added: "Dec 19, 2024"
tags:
  - technical
  - opentelemetry
  - observability
  - dynatrace
---

# The OpenTelemetry Demo Revisited (Again)

#### Sending OTel Demo Data to Dynatrace

![A close-up image of a green lava lamp against a gradient background transitioning from yellow to green. The lava lamp contains blobs of wax in various stages of ascent and descent, with one large drop-shaped blob suspended near the top and a round blob at the bottom, creating an interesting visual effect.](https://cdn-images-1.medium.com/max/800/1*4Qa5XLT0zabacqoFJaD3iA.jpeg)

The soothing sights of the lava lamp sitting on my desk. Photo by [Adriana Villela](https://adri-v.medium.com).

If you follow my work, you know that [I’ve written about the OpenTelemetry (OTel) Demo](https://adri-v.medium.com/list/the-opentelemetry-demo-de9da6655a72) a number of times over the last few years. I’ve always been a huge fan of it. Whenever folks ask me, “What’s the best way to get started with OTel?” I always point them to the Demo. I love it because it showcases the power of OpenTelemetry with relatively low effort. (I say _relatively_, because let’s face it…there’s always something that seems to go wrong whenever we try things out for ourselves for the first time, amirite? 🙃)

For those unfamiliar with the OTel Demo here’s the elevator pitch. The Demo is a multi-microservice application written in a number of different languages, and is instrumented with OpenTelemetry. By default, the Demo sends OTel data to a number of open source back-ends: [OpenSearch](https://opensearch.org) for logs ingest, [Prometheus](https://prometheus.io) for metrics ingest, and [Jaeger](https://www.jaegertracing.io) for traces ingest. It also leverages an open source version of Grafana for dashboarding and visualizing those three signals under one roof, so to speak.

### OTel Demo & Dynatrace

Nothing stops you from configuring the Demo to send data to additional back-ends. In fact, [many Observability vendors have forked the OTel Demo](https://github.com/open-telemetry/opentelemetry-demo/forks) to showcase just that. As you may have guessed, [Dynatrace also has a fork of the OTel Demo](https://github.com/dynatrace-oss-contrib/opentelemetry-demo).

As a newbie to [Dynatrace](https://dt-url.net/dt-otel-demo), I have spent some exploring [how to send OpenTelemetry (OTel) data Dynatrace](https://medium.com/womenintechnology/how-do-i-send-opentelemetry-data-to-dynatrace-842cebb21286) using some oldie but goodie examples of mine. The natural next stop for me was to configure the [OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) to send OTel data to Dynatrace.

If you’re interested to know how I went about it, then you’re in the right place! Let’s get started!

### Tutorial

I created a fork of the OpenTelemetry Demo repo, and within that fork, I created a special branch with the configurations needed for this tutorial. Note that the `main` branch of my fork does NOT have any of the special configs, so don’t use that if you plan on following this tutorial.

You can check out my branch [here](https://github.com/avillela/opentelemetry-demo/tree/avillela-dt-backend).

> **NOTE:** By the time you read this, the OTel Demo may be a bit ahead of the snapshot that I have in my little branch. Such is the nature of an active project like OpenTelemetry. But don’t panic, my friend! This tutorial should give you a pretty good idea of how things work, and it should give you the tools to explore the Demo as it continues to evolve. ✌️

So, what’s special about my little branch?

*   I created a [Development (Dev) Container](https://containers.dev) for running the OTel Demo. It not only includes Docker, which you need to run the Demo, it also includes language runtimes for the various languages that the Demo is written in. You know…in case you want to do any development on the Demo yourself, if you’re feeling adventurous. If you follow my work, you know that [I am a huge fan of Dev Containers](https://adri-v.medium.com/list/dev-containers-78d35408c59f). 🤘
*   There are additional configurations for pointing the OTel Demo’s [OTel Collector](https://opentelemetry.io/docs/collector/) to send OTel data to Dynatrace, which we’ll get into shortly.

**Pre-requisites:**

*   A Dynatrace account and access token. Learn how to get a trial account and generate an access token [here](https://medium.com/womenintechnology/how-do-i-send-opentelemetry-data-to-dynatrace-842cebb21286).
*   [Docker](https://www.docker.com) or [Podman](https://medium.com/womenintechnology/running-dev-containers-locally-with-podman-vscode-df16376350d3) or equivalent
*   [Dev Containers plugin for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
*   Dev Containers CLI (grab it [here](https://code.visualstudio.com/docs/devcontainers/devcontainer-cli) or [here](https://github.com/devcontainers/cli))

The Dev Container part is optional, but I recommend it just because it gives you a pre-configured environment to run the Demo.

Here we go!

#### 1- Clone the repo

Start by cloning the repo, and switch over to the `avillela-dt-backend` branch.

git clone git@github.com:avillela/opentelemetry-demo.git  
cd opentelemetry-demo  
git checkout avillela-dt-backend

#### 2- Build and run the Dev Container

> **NOTE:** If Dev Containers aren’t your jam, you can go ahead and skip this step.

Next, build and run your Dev Container.

devcontainer build \--no-cache  
devcontainer open

The build and open steps will take a few minutes when you run them for the first time.

You only need to build the Dev Container the first time you run the Demo. After that, you just need to run `devcontainer open` any time you want to run the Demo. That is, unless `devcontainer.json` has changed, in which case you should rebuild.

#### 3- Edit the Collector config file

The OpenTelemetry Demo was designed with flexibility and modularity in mind. This makes it easy for you to easily fork the repo and include configurations to whatever backend you want, without causing mega Git conflict headaches when it’s time to update the fork with the latest upstream source. And believe me, you’ll want to update from the upstream source regularly, because the Demo is a VERY active repo. 🤓

Keeping that in mind…you’ll notice that there are two Collector configuration files:

*   `otelcol-config.yml`
*   `otelcol-config-extras.yml`

The `otelcol-config.yml` file contains the base Collector configurations for [receivers](https://opentelemetry.io/docs/collector/configuration/#receivers), [processors](https://opentelemetry.io/docs/collector/configuration/#processors), [connectors](https://opentelemetry.io/docs/collector/configuration/#connectors), [exporters](https://opentelemetry.io/docs/collector/configuration/#exporters), and [pipelines](https://opentelemetry.io/docs/collector/configuration/#pipelines). As I mentioned earlier, by default, it exports traces to Jaeger, metrics to Prometheus, and logs to OpenSearch.

If you would like to override any of the OTel Collector base config file values, you would do so in `otelcol-config-extras.yml`. Don’t touch `otelcol-config.yml`. For example, if you would like to send traces to both Jaeger and another Observability back-end, you would configure that Observability back-end in this file. By default, this file is empty.

If you open up [otelcol-config-extras.yml](https://github.com/avillela/opentelemetry-demo/blob/otel-dt-devcontainers/src/otelcollector/otelcol-config-extras.yml) in my example repo, you’ll notice that it’s not empty, because I’ve pre-configured it just for you. (You’re welcome. 😜) Let’s take a look at it.

The file is located under `src/otelcollector/otelcol-config-extras.yml`:

\# Copyright The OpenTelemetry Authors  
\# SPDX-License-Identifier: Apache-2.0  
  
\# extra settings to be merged into OpenTelemetry Collector configuration  
\# do not delete this file  
  
\## Example configuration for sending data to your own OTLP HTTP backend  
\## Note: the spanmetrics exporter must be included in the exporters array  
\## if overriding the traces pipeline.  
##  
exporters:  
  otlphttp/dt:  
    endpoint: "https://${DT\_ENV\_ID}.${DT\_ENV\_SUFFIX}/api/v2/otlp"  
    headers:  
      Authorization: "Api-Token ${DT\_TOKEN}"  
  debug:  
    verbosity: detailed  
  
processors:  
  cumulativetodelta:  
  
service:  
  pipelines:  
    traces:  
      exporters: \[spanmetrics, otlp, otlphttp/dt, debug\]  
    metrics:  
      processors: \[cumulativetodelta, batch\]  
      exporters: \[otlphttp/dt, otlphttp/prometheus, debug\]  
    logs:  
      exporters: \[otlphttp/dt, opensearch, debug\]

Note that I:

*   Added an [otlphttp exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlphttpexporter) called `otlphttp/dt`, to send OTel data to Dynatrace
*   Set the [debug exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/debugexporter) verbosity to `detailed`
*   Added [cumulativetodelta processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/cumulativetodeltaprocessor) for metrics ([needed for Dynatrace metrics ingest](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/collector/configuration#delta-metrics))
*   Updated `pipeline` definitions to include `otlphttp/dt` (trace, metrics, and logs pipelines) and `cumulativetodelta` (metrics pipeline)

You can learn more about Dynatrace-specific Collector configurations [here](https://medium.com/womenintechnology/how-do-i-send-opentelemetry-data-to-dynatrace-842cebb21286).

You may have also noticed that `otelcol-config-extras.yml` references the following environment variables: `DT_ENV_ID`, `DT_ENV_SUFFIX`, and `DT_TOKEN`. How do these get passed in? Great question! Read on!

#### 4- Configure the environment variables

You can configure the `DT_ENV_ID`, `DT_ENV_SUFFIX`, and `DT_TOKEN` environment variables in a file called `docker-compose.override.yml`. Just as `otelcol-config-extras.yml` overrides values in `otelcol-config.yml`, `docker-compose.override.yml` overrides values in `docker-compose.yml`.

You might be wondering why you can’t see that file in my example repo. Two reasons:

1.  That file is in `.gitignore`, so you’ll never be able to commit it to version control.
2.  It contains app-specific configs, including your Dynatrace access token, which you definitely don’t want in version control.

And with that in mind, let’s create `docker-compose.override.yml`.

touch docker-compose.override.yml

And then let’s populate it, like this:

services:   
  otelcol:  
    environment:   
      \- DT\_ENV\_ID=<your\_dynatrace\_tenant>  
      \- DT\_TOKEN=<your\_dynatrace\_token>  
      \- DT\_ENV\_SUFFIX=live.dynatrace.com

Where:

*   `DT_ENV_ID` is your Dynatrace tenant
*   `DT_TOKEN` is your Dynatrace access token
*   `DT_ENV_SUFFIX` is your environment suffix, which is already set to `live.dynatrace.com`. I added this environment variable because I also have access to a couple of tenants that reside test environments under different suffixes. It’s safe to say that this doesn’t apply to you, so _don’t update this value_.

Learn how to find your `DT_ENV_ID` and `DT_TOKEN` values [here](https://medium.com/womenintechnology/how-do-i-send-opentelemetry-data-to-dynatrace-842cebb21286).

#### 5- Run the Demo!

Now that you’ve got everything configured, it’s time to run the Demo!

docker compose up

This may take a while the first time around, because Docker Compose needs to pull all of the service images from the [GitHub Container Registry (GHCR)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

Once the app starts running, you’ll see output like this in the console:

![Screen shot of log output to a terminal window, showing log messages for the various services that make up the OpenTelemetry Demo.](https://cdn-images-1.medium.com/max/800/1*KtMNdqbMrM56vc6V8WSUQw.png)

Screen shot of sample output of running docker compose up to bring up the OTel Demo

Give it a few minutes, and then try to access the Demo by going to [http://localhost:8080](http://localhost:8080). If you see this pop-up from VSCode (only if you’re running it in the Dev Container), then it’s safe to say that the front-end is ready to go:

![Pop-up in VSCode: “Your application running on port 8080 is available” with a blue button on the bottom that says “Open in Browser”, and another one next to it that says, “Preview in Editor”](https://cdn-images-1.medium.com/max/800/1*X6JxMxsL8x4t1sCkdM6BkA.png)

VSCode pop-up saying that the OTel Demo front-end is available

And once you navigate to [http://localhost:8080](http://localhost:8080), you’ll see this:

![Landing page for the OpenTelemetry Demo, located at http://localhost:8080. It includes a currency selector drop-down on the top right, and a shopping cart icon. On the bottom left of the screen is a blue “Go Shopping” button. The right side of the screen features a photo of a person looking through a telescope pointing at the user.](https://cdn-images-1.medium.com/max/800/1*N1A8_TQ_Vj61nKaX9CryhA.png)

The landing page for the OpenTelemetry Demo

#### 6- See data in Dynatrace

Once the app has been running for a few minutes, log into [Dynatrace](https://dt-url.net/dt-otel-demo) to check out your traces, logs, and metrics.

I’m not going in-depth on how to navigate the Dynatrace UI because a) you’re probably tired of reading and b) there are already some great videos on the [Dynatrace YouTube channel](https://www.youtube.com/@dynatrace) that explain this stuff pretty well, so I encourage you to go there for a more in-depth look, if that tickles your fancy.

Below are some screenshots of OTel Demo data in Dynatrace.

![Screen shot of the Dynatrace platform’s user interface. It includes a navigation bar on the left side with links various applications. The main screen features list of distributed traces on the top pane, a tracing flame graph on the bottom pane, taking up 3/4 of the screen. The bottom right pane, taking up 1/4 of the screen shows trace attributes.](https://cdn-images-1.medium.com/max/800/1*eBhrUNgDoYXn1L-jUXprIA.png)

Screen shot of the Dynatrace Distributed Tracing UI

![Screen shot of the Dynatrace platform’s user interface. It includes a navigation bar on the left side with links various applications. The main screen features a graph on the top pane, and a list of log messages on the bottom pane.](https://cdn-images-1.medium.com/max/800/1*RLBaduot5evTUatqSjrUBQ.png)

Screen shot of the Dynatrace Logs UI

![Screen shot of the Dynatrace platform’s user interface. It includes a navigation bar on the left side with links various applications. The right 3/4 of the main pane features a line graph for a metric called “app\_recommendations\_counter”. The left 1/4 of the main pane features a list of Notebooks. This notebook is called “Recommendations Counter Notebook”.](https://cdn-images-1.medium.com/max/800/1*8QQHDuHsNPhf2SceeQ7g7Q.png)

Screen shot of a Notebook created for the app\_recommendations\_counter metric

### Final Thoughts

I’m always impressed by how configurable and extensible the OTel Demo is. Its design makes it fairly straightforward for configuring multiple Observability backends, which is perfect for evaluating multiple vendors at the same time to see how each one handles your OTel data. If you run the app for an hour or so, you end up with a pretty high volume of data which you can then slice and dice and explore in your chosen backend(s).

Aaand that’s a wrap. This is my last blog post of 2024. Cheers to you, my lovely readers, for your continued support. Happy holidays, and here’s to an amazing 2025! 🧋🥂

And now, I will leave you with a photo of my rats, Buffy and Katie Jr., taken in January of this year, when they were babies. ❤️

![Two rats with grey and white fur are inside a cage, peeking out from behind a colorful wooden structure. The environment is dimly lit, emphasizing the curious gaze of the rats. The cage interior includes some bedding material scattered around and part of a red object, possibly a toy or accessory for the rats. The wooden structure has vibrant colors painted on it, adding a touch of liveliness to the scene.](https://cdn-images-1.medium.com/max/800/1*z7qlMT8zOAlzFJD_57Zb9g.jpeg)

Babies Katie Jr. (left), and Buffy (right), in January 2025

Until next year, peace, love and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [December 19, 2024](https://medium.com/p/409aa8e0a070).

[Canonical link](https://medium.com/@adri-v/the-opentelemetry-demo-revisited-again-409aa8e0a070)

Exported from [Medium](https://medium.com) on June 3, 2026.