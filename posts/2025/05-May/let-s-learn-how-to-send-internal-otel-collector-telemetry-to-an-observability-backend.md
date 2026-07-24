---
title: "Let’s Learn How to Send Internal OTel Collector Telemetry to an Observability Backend"
slug: let-s-learn-how-to-send-internal-otel-collector-telemetry-to-an-observability-backend
description: "Configuring Your OTel Collector’s Internal Telemetry Endpoint"
added: "May 31, 2025"
tags:
  - technical
  - opentelemetry
  - observability
  - otel-collector
---



![A serene outdoor scene during sunset. The sun is partially obscured by trees, creating a beautiful sunburst effect with rays of light spreading out. The foreground features a wooden surface, possibly a bench or table, with visible grain and texture. The background includes lush green grass and trees, with some people faintly visible in the distance, enjoying the park. The overall atmosphere is peaceful and warm, capturing the essence of a tranquil evening in nature.](https://cdn-images-1.medium.com/max/800/1*QgDHtgh-rc80SHo49ozlKw.jpeg)

Golden hour at Christie Pitts Park in Toronto. Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

Many organizations using [OpenTelemetry (OTel)](https://opentelemetry.io) these days rely not only on the [OpenTelemetry API and SDK](https://opentelemetry.io/docs/concepts/components/#language-specific-api--sdk-implementations), they also rely on the [OTel Collector](https://opentelemetry.io/docs/collector/). The Collector is a flexible and powerful data pipeline which allows you to ingest telemetry data from multiple sources (including application and infrastructure), transform the data, and export it to your backend(s) of choice for analysis. To say that the Collector is a critical component of your Observability landscape is an understatement.

So it stands to reason then, that just as you’d want to observe your applications and infrastructure, it makes sense to do the same for your OTel Collectors. Fortunately, the good folks working on the OpenTelemetry project have you covered, because the [Collector also emits its own internal telemetry](https://opentelemetry.io/docs/collector/internal-telemetry/), allowing you observe it.

Learning about internal Collector telemetry has been on my OTel to-do list for a while, and I finally got around to it. 🎉 Today, I will share some of my learnings, specifically around exporting internal telemetry directly to an Observability backend.

Ready? Let’s do this!

### Exporting Internal Telemetry

When I started playing around with observing my own Collector, I learned that there are three ways to emit the Collector’s internal telemetry:

#### **1-** Self-ingesting and exporting, scraping metrics via its own Prometheus Receiver

Here, your Collector scrapes its own metrics via its own [Prometheus receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver). This means that you must configure your Collector’s Prometheus receiver to scrape itself, like this:

prometheus:  
  config:  
    scrape\_configs: \[\]  
      \# Collector metrics  
      \- job\_name: 'otel-collector'  
        scrape\_interval: 10s  
        static\_configs:  
        \- targets: \[ '0.0.0.0:8888' \]

And then configure your Collector’s internal metrics exporter by adding a `telemetry.metrics` section to the Collector’s `service` configuration section:

service:  
  telemetry:  
    metrics:  
      level: detailed  
      readers:  
      \- periodic:  
          exporter:  
            otlp:  
              endpoint: http://0.0.0.0:4318  
              protocol: http/protobuf

There are two pitfalls with this approach. First, it only applies to metrics (because Prometheus is only for metrics). Second, by sending the Collector’s metrics to itself for export, you end up in a self-monitoring loop, which, among other things, can degrade performance, since it’s sending additional telemetry to itself for processing.

You can check out a full example Collector configuration [here](https://github.com/avillela/how-green-is-my-otel-collector/blob/internal-collector-telemetry/src/k8s/02-otel-collector.yaml).

#### 2- To Prometheus

If Prometheus is your metrics backend of choice, then you can use the configuration below to have your Collector export its internal telemetry directly to Prometheus:

service:  
  telemetry:  
    metrics:  
      readers:  
        \- pull:  
            exporter:  
              prometheus:  
                host: '0.0.0.0'  
                port: 8888

> **🌈 NOTE:** This happens behind the scenes via the [Go Prometheus exporter](https://github.com/open-telemetry/opentelemetry-go/tree/main/exporters/prometheus). Fun fact: [Go Prometheus exporter. is not the same as the Collector’s Prometheus exporter](https://github.com/open-telemetry/opentelemetry.io/pull/7035#discussion_r2126899652). The Collector’s exporter is designed to aggregate metrics from multiple resources/targets together, whereas the Go SDK exporter is designed to only handle metrics from a single resource. That makes sense, because the only metrics source here is the Collector’s own metrics, so using the Collector’s exporter would be overkill.

#### 3- Exporting directly to an Observability backend

This approach allows you to export internal Collector telemetry directly to an Observability backend, eliminating the need for the Collector to ingest, process, and export its own telemetry.

There are a few advantages to this setup.

First off, it enables you to export your telemetry **_directly to whatever OTLP backend you want_** — i.e. any backend that supports OTLP ingest. This can be the same backend for traces, logs, and metrics, or it can be different backends for each.

> **NOTE:** I am a proponent of having a single backend for ingesting all signals to really deliver on Observability’s promise. You can read more about my thoughts [here](https://medium.com/womenintechnology/storing-all-of-your-observability-signals-in-one-place-matters-36178cd0ce10).

The second advantage is that you eliminate the self-monitoring loop that occurs with the first two approaches.

Below is my own `service.telemetry` configuration.

service:  
  telemetry:  
    resource:  
      k8s.namespace.name: "${env:K8S\_POD\_NAMESPACE}"  
      k8s.pod.name: "${env:K8S\_POD\_NAME}"  
      k8s.node.name: "${env:K8S\_NODE\_NAME}"  
  
    metrics:  
      level: detailed  
      readers:  
        \- periodic:  
            interval: 60000  
            exporter:  
              otlp:  
                protocol: http/protobuf  
                temporality\_preference: delta  
                endpoint: https://${ENDPOINT}  
                headers:  
                  \- name: Authorization  
                    value: "Api-Token ${TOKEN}"  
    logs:  
      level: info  
      output\_paths: \["stdout"\]  
      error\_output\_paths: \["stderr"\]  
      processors:  
        \- batch:  
            exporter:  
              otlp:  
                protocol: http/protobuf  
                endpoint: https://${ENDPOINT}  
                headers:  
                  \- name: Authorization  
                    value: "Api-Token ${TOKEN}"  
    traces:  
      processors:  
        \- batch:  
            exporter:  
              otlp:  
                protocol: http/protobuf  
                endpoint: https://${ENDPOINT}  
                headers:  
                  \- name: Authorization  
                    value: "Api-Token ${TOKEN}"

You can check out the full example [here](https://github.com/avillela/how-green-is-my-otel-collector/blob/internal-collector-telemetry/src/k8s/02-otel-collector-dt.yaml), which is configured to [send Collector telemetry to Dynatrace](https://medium.com/womenintechnology/how-do-i-send-opentelemetry-data-to-dynatrace-842cebb21286).

Let’s break things down.

First, let’s take a look at the `resource` section:

resource:  
    k8s.namespace.name: "${env:K8S\_POD\_NAMESPACE}"  
    k8s.pod.name: "${env:K8S\_POD\_NAME}"  
    k8s.node.name: "${env:K8S\_NODE\_NAME}"

In my case, I’m running my Collector in Kubernetes using the [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/), and this section enriches my internal Collector telemetry with Kubernetes attributes for namespace, pod name, and node name when they’re exported.

Next, I wanted to note that the `exporter` configuration is more or less the same for traces, logs, and metrics. They all look like this:

exporter:  
  otlp:  
    protocol: http/protobuf  
    endpoint: https://${ENDPOINT}  
    headers:  
      \- name: Authorization  
        value: "Api-Token ${TOKEN}"

I’m using `http/protobuf` as my protocol, because Dynatrace accepts OTLP data via HTTP.

Since I’m using [Dynatrace as my internal telemetry endpoint](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/collector/self-monitoring#sending-internal-telemetry-self-monitoring-data-to-dynatrace), my endpoints look like this:

*   **metrics:** `https://${DT_TENANT}.apps.dynatrace.com/api/v2/otlp/v1/metrics`
*   **traces:** `https://${DT_TENANT}.apps.dynatrace.com/api/v2/otlp/v1/traces`
*   **logs:** `https://${DT_TENANT}.apps.dynatrace.com/api/v2/otlp/v1/logs`

Where `${DT_TENANT}` is my [Dynatrace tenant name](https://medium.com/womenintechnology/how-do-i-send-opentelemetry-data-to-dynatrace-842cebb21286).

You’ll need to consult your own backend’s docs to determine your endpoint URIs, but it’s safe to say that it will look very similar to what you use for your Collector’s [OTLP exporter configuration](https://github.com/avillela/how-green-is-my-otel-collector/blob/ae0e9cd347c2a704108b6e03e323355375ca17ea/src/k8s/02-otel-collector-dt.yaml#L238-L241). You’ll also need to use the same authorization token that you use for your backend’s [OTLP exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlphttpexporter) configuration.

But there’s one gotcha here. The OTLP exporter configuration’s authorization header is configured as a key/value pair:

endpoint: "https://${ENDPOINT}"  
headers:  
  Authorization: "Api-Token ${TOKEN}"

The internal telemetry’s authorization header, on the other hand, is an array of attriute pairs. A name attribute whose value is `Authorization`, and a `value` attribute whose value is `“Api-Token ${TOKEN}”`:

endpoint: https://${ENDPOINT}  
headers:  
  \- name: Authorization  
    value: "Api-Token ${TOKEN}"

While the `Authorization: “Api-Token ${TOKEN}”` configuration still exports metrics, using this [configuration causes the](https://github.com/open-telemetry/opentelemetry-collector/issues/13080) `[temporality_preference: delta](https://github.com/open-telemetry/opentelemetry-collector/issues/13080)` [setting to be ignored](https://github.com/open-telemetry/opentelemetry-collector/issues/13080):

metrics:  
  level: detailed  
  readers:  
    \- periodic:  
        exporter:  
          otlp:  
            protocol: http/protobuf  
            temporality\_preference: delta  
            endpoint: https://${DT\_ENVIRONMENT}/api/v2/otlp/v1/metrics  
            headers:  
              \- name: Authorization  
                value: "Api-Token ${TOKEN}"

Since the `temporality_preference: delta` setting was ignored, my Collector metrics were exported with additional suffixes. For example, I was expecting to see the Collector’s `[otelcol_process_memory_rss](https://opentelemetry.io/docs/collector/internal-telemetry/#basic-level-metrics)` metric to look at its memory consumption. Instead, `otelcol_process_memory_rss_bytes` was being exported.

After asking around, I learned that this was happening because `_bytes` is a Prometheus units suffix that normally gets truncated when you go through the Prometheus receiver (i.e. approach #1). I was initially using approach #1, so I hadn’t seen the `_bytes` suffix. When exporting directly to a backend, however, you need to set `temporality_preference: delta` to make that `_bytes` suffix go bye-bye. 👋

> **NOTE:** Big thanks to my friend [Alex Boten](https://www.linkedin.com/in/codeboten/), for figuring out this workaround, and for telling me about it.

PS: Another reason why I used `temporality_preference: delta` is because [Dynatrace only accepts metrics with delta temporality via OTLP HTTP](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/collector/configuration#delta-metrics), and leaving it out would’ve caused any cumulative Collector metrics to be dropped.

#### 4- Exporting to another Collector

Another option which is similar to option #3 is to export the Collector’s internal telemetry to a Collector dedicated to handling internal telemetry from other Collectors in your fleet.

Here’s a sample configuration:

service:  
  telemetry:  
    resource:  
      k8s.namespace.name: "${env:K8S\_POD\_NAMESPACE}"  
      k8s.pod.name: "${env:K8S\_POD\_NAME}"  
      k8s.node.name: "${env:K8S\_NODE\_NAME}"

    metrics:  
      level: detailed  
      readers:  
        - periodic:  
            interval: 60000  
            exporter:  
              otlp:  
                protocol: http/protobuf  
                temporality\_preference: delta  
                endpoint: [https://${OTEL\_COLLECTOR}](https://$%7BOTEL_COLLECTOR%7D)  
    logs:  
      level: info  
      output\_paths: \["stdout"\]  
      error\_output\_paths: \["stderr"\]  
      processors:  
        - batch:  
            exporter:  
              otlp:  
                protocol: http/protobuf  
                endpoint: [https://${OTEL\_COLLECTOR}](https://$%7BOTEL_COLLECTOR%7D)  
    traces:  
      processors:  
        - batch:  
            exporter:  
              otlp:  
                protocol: http/protobuf  
                endpoint: [https://${OTEL\_COLLECTOR}](https://$%7BOTEL_COLLECTOR%7D)

Looks similar to option #3, except that your endpoint is another OTel Collector.

The advantage to this approach is that if you have multiple Collectors (which you likely will), you can funnel them through to a single Collector which can do additional processing (if you want), batch the telemetry from all the different Collectors together, and then export the internal telemetry to your Observability backend for analysis. This prevents your Observability backend from being bombarded by telemetry data from multiple Collectors.

This approach is the best of both worlds. You avoid the self-monitoring loop while not bombarding your Observability backend with data from too many sources.

### Collector API reference

I was surprised that I couldn’t find an API reference on the [OTel Collector’s GitHub repository](https://github.com/open-telemetry/opentelemetry-collector), like I’ve seen with in the [OTel Operator](https://github.com/open-telemetry/opentelemetry-operator/tree/main/docs/api) repository. After asking around, I learned that the Collector uses the Go implementation of the declarative SDK configuration format, and that the API docs can be found [here](https://pkg.go.dev/go.opentelemetry.io/contrib/otelconf@v0.15.0/v0.3.0). Not the most user friendly thing to read. Pass. But maybe you’ll find it useful, so I’m including it here, just in case. 🤷‍♀️

After asking around some more, I learned about `[kitchen-sink.yaml](https://github.com/open-telemetry/opentelemetry-configuration/blob/main/examples/kitchen-sink.yaml)` in the [opentelemetry-configuration](https://github.com/open-telemetry/opentelemetry-configuration) repository. I would’ve never found it had it not been for folks in the OTel community pointing me here. Now, it’s not the most intuitive file to read, because things in there don’t translate 100% to your telemetry configuration in the Collector. That being said, it’s nicer than trying to read that Go API, and it does show different combinations of configurations that you can use, that would apply to your internal telemetry. Like [these lines](https://github.com/open-telemetry/opentelemetry-configuration/blob/f27ee13bbc7ee8156954aea79b1d8bfb0312b7cc/examples/kitchen-sink.yaml#L260-L316), for metrics configuration.

And if you’re looking for various examples of Collector configs, you can also check out [Juraci Paixão Kröhling](https://www.linkedin.com/in/jpkroehling/)’s [otelcol-cookbook](https://github.com/jpkrohling/otelcol-cookbook/tree/main) repository. Juraci is one of the maintainers of the OTel Collector, and sits on the OTel Governance Committee. And bonus: he’s a fellow Brazilian. 🇧🇷

### Further considerations with internal Collector telemetry

I know that I’ve covered a lot, but I did want to call out a few things to keep in mind when you’re configuring internal Collector telemetry.

#### Limit what you export

Emitting Collector telemetry is great, but make sure that you emit only what you need. Do you need your internal telemetry Collector `logs.level` configuration to be set to `debug`? Probably not. Similarly, consider tweaking your [metrics interval](https://github.com/open-telemetry/opentelemetry-configuration/blob/f27ee13bbc7ee8156954aea79b1d8bfb0312b7cc/examples/kitchen-sink.yaml#L260-L264C9) to limit how often you’re exporting metrics.

Remember that the more data you export, the more load it places on your Collector’s CPU and memory, no matter which method you’re using to export your Collector’s internal telemetry. More CPU and memory translates to more energy and more infrastructure cost.

Being mindful of the volume of telemetry you export can also help keep costs down for data ingest into your backend, depending on their pricing model.

#### Avoid the self-monitoring loop

As I mentioned earlier, the self-monitoring loop means that you send the Collector’s internal telemetry to itself, which puts a greater load on itself, because you’re putting your telemetry data through the Collector’s own pipeline. Exporting directly to a backend lessens the load, because you’re not putting your telemetry through the Collector’s own pipeline.

The self-monitoring loop can increase CPU and memory, driving cloud costs up. In addition, increased CPU and memory uses more energy, which is bad for the environment.

Plus…the subject under monitoring shouldn’t also be the monitor. Here’s a snippet from maintainer [Tyler Helmuth](https://www.linkedin.com/in/tyler-helmuth-53150899/) from a conversation thread in the [OTel Collector Slack channel](https://cloud-native.slack.com/archives/C01N6P7KR6W/p1747664865237089?thread_ts=1747248889.209979&cid=C01N6P7KR6W) that sums it up:

> “If the collector is responsible for receiving and processing its own telemetry via one of its traces/metrics/logs pipeline and it is experiencing an issue, like memory\_limiter blocking data, then the collector’s internal telemetry won’t be exported to the desired destination and you wont know the collector is having an issue. Similarly if the collector is having an issue and producing additional telemetry for that issue, such as error logs, and you send those logs back into the collector it’ll create a cycle of more error logs -> more logs to ingest -> more error logs and so on.”

Couldn’t have said it better myself!

### Final Thoughts

I have to admit that I put off learning about internal Collector telemetry for a while because it looked hard. Having an actual use case that compelled me to learn about internal Collector telemetry helped me get over that hump, and made me realize that it wasn’t quite so scary.

Getting my mind around the three different approaches of sending internal Collector telemetry had my head spinning for a bit, but leaning on the OpenTelemetry community for help didn’t disappoint. I’ve said it before, and I’ll say it again. The OpenTelemetry community is absolutely lovely and thoughtful. Every time I ask a question on one of the OTel channels (the [#otel-collector channel](https://cloud-native.slack.com/archives/C01N6P7KR6W/p1747248889209979), in this case) on [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf), I am met with kindness, patience, and helpfulness. I am grateful for that, because it encourages people like me to ask questions and learn, and enables me to share my learnings with you. I’m also working on a [pull request](https://github.com/open-telemetry/opentelemetry.io/pull/7035) to help clarify all this stuff in the OTel docs, so stay tuned!

Hopefully now that you have a better understanding of internal Collector telemetry configuration, it won’t be scary for you to try this out for yourself.

And now, please enjoy this photo of my rat, Katie.

![A close-up image of a brown rat with large ears and dark eyes. The rat is inside a cage, standing on a wooden surface with metal bars visible in the background. The rat’s whiskers are prominent, and its fur appears soft and slightly tousled.](https://cdn-images-1.medium.com/max/800/1*2wf_5TODj1KiX_5XFuguNg.jpeg)

Katie is enjoying some hang time on her favourite perch.

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [May 31, 2025](https://medium.com/p/9aef6a18f317).

[Canonical link](https://medium.com/@adri-v/lets-learn-how-to-send-internal-otel-collector-telemetry-to-an-observability-backend-9aef6a18f317)

Exported from [Medium](https://medium.com) on June 3, 2026.