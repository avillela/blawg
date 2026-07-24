---
title: "Let’s Learn About the OTel Operator’s Target Allocator!"
slug: let-s-learn-about-the-otel-operator-s-target-allocator
description: "Scrape Prometheus metrics without Prometheus in your Kubernetes cluster!"
added: "Jul 21, 2023"
tags:
  - technical
  - opentelemetry
  - observability
  - otel-operator
  - otel-collector
---

# Let’s Learn About the OTel Operator’s Target Allocator!

![Three blue Muskoka chairs on a dock, facing the lake at dusk.](https://cdn-images-1.medium.com/max/800/1*7LZeJGg2ARTPnd80PjuLsg.png)

Lakeside at dusk in Muskoka. Photo by [Adri V](https://adri-v.medium.com).

Ever heard of the [Target Allocator](https://github.com/open-telemetry/opentelemetry-operator/blob/main/cmd/otel-allocator/README.md#target-allocator) (TA)? Don’t fret if you haven’t. You’re not alone. I certainly hadn’t. That is, not until [Iris Dyrmishi mentioned it at one of our recent OTel Q&A sessions](https://youtu.be/9iaGG-YZw5I), after which, I had to look it up. And it sent my head spinning. Initially, I was SUPER. Duper. Confused.

It took me a lot of Googling and asking TONS of questions to finally wrap my head around it, so I thought I’d share some of my learnings while it was all still fresh in my mind.

First things first: what the heck is the Target Allocator?

The Target Allocator is part of the OTel Operator. The OTel Operator is a [Kubernetes Operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) that:

1.  Manages the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
2.  Injects and configures [auto-instrumentation](https://www.honeycomb.io/blog/what-is-auto-instrumentation) into your pods.

To help facilitate the above capabilities, the Operator ships with two [Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) (CRs): one for [managing the Collector](https://github.com/open-telemetry/opentelemetry-operator#getting-started), and one for [managing auto-instrumentation](https://github.com/open-telemetry/opentelemetry-operator#opentelemetry-auto-instrumentation-injection) for your applications.

> _💥_ **NOTE:** _You may recall that I played around a bit with the OTel Collector CR when I created the_ [_OTel Operator Kratix promise_](https://www.syntasso.io/post/guest-blog-lightstep-and-kratix)_._

Okay…back to the Target Allocator.

### Target Allocator Demystified

As I mentioned earlier, the Target Allocator is part of the OTel Operator, and more specifically, it is an optional component of the OTel Collector [Custom Resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) (CR).

In a nutshell, the TA is a mechanism for decoupling the service discovery and metric collection functions of Prometheus such that they can be scaled independently. The OTel Collector manages Prometheus metrics without needing to install Prometheus. The TA manages the configuration of the Collector’s [Prometheus Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/README.md). If you follow my work, y’all might remember that [ditching Prometheus from the Observability stack is my Observability dream](https://medium.com/tucows/unpacking-observability-the-observability-stack-93d4733e2a72) (sorry, Prometheus folks).

The TA serves two functions:

*   Even distribution of Prometheus targets among a pool of OTel Collectors
*   Discovery of Prometheus Custom Resources

#### **Even Distribution of Prometheus Targets**

The Target Allocator’s first job is todiscover targets to scrape and OTel Collectors to allocate targets to. Then it can distribute the targets it discovers among the Collectors. The Collectors in turn query the Target Allocator for Metrics endpoints to scrape, and then the Collectors’ [Prometheus Receivers](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/README.md) scrape the Metrics targets.

This means that the OTel Collectors collect the Metrics instead of a Prometheus [scraper](https://uzxmx.github.io/prometheus-scrape-internals.html).

> ✨[**Target:**](https://www.tigera.io/learn/guides/prometheus-monitoring/prometheus-metrics/#:~:text=Prometheus%20monitoring%20works%20by%20identifying,and%20generates%20metrics%20from%20it.) _An endpoint that supplies metrics for Prometheus to store_

> ✨ [**Scrape:**](https://www.oreilly.com/library/view/hands-on-infrastructure-monitoring/9781789612349/fdea00b6-64b4-4589-b453-685f31c6681d.xhtml#:~:text=In%20Prometheus%20terms%2C%20a%20scrape,collection%20is%20aptly%20named%20%2Fmetrics%20.) The action of collecting metrics through an HTTP request from a targeted instance, parsing the response, and ingesting the collected samples to storage.

![Diagram depicting how the target allocator evenly distributes metrics targets amongst a pool of OTel Collectors](https://cdn-images-1.medium.com/max/800/1*pkcyIKXJir9HkZwm2vrXCA.jpeg)

#### Discovery of Prometheus Custom Resources

The Target Allocator’s second job is the discovery of [Prometheus CRs](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/user-guides/getting-started.md), namely the [ServiceMonitor and PodMonitor](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/otel-allocator#target-allocator). The ServiceMonitor and the PodMonitor don’t do any scraping themselves; their purpose is to inform the Target Allocator (or Prometheus, if that’s your jam) to add a new job to their scrape configuration. The Target Allocator then adds the job to the OTel Collector’s [Prometheus Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/prometheusreceiver/README.md)’s scrape configuration.

![Diagram depicting the Target Allocator’s service discovery functionality](https://cdn-images-1.medium.com/max/800/1*Yiw2EfPyS_bV0j9UU-Junw.jpeg)

In order for this setup to work in our Prometheus-free world, however, the ServiceMonitor and PodMonitor must be installed in your Kubernetes cluster. These CRs are normally installed via the Prometheus Operator.

Wait…But I _just_ said that we can skip the whole Prometheus thing with this setup, so what gives?

Well, this is where a little hack comes in. Although you normally get these CRs by installing the Prometheus Operator, you can actually install them sans Operator. You can do this by going into the [Prometheus Operator’s Releases page](https://github.com/prometheus-operator/prometheus-operator/releases), grabbing a copy of the latest [bundle.yaml](https://github.com/prometheus-operator/prometheus-operator/releases/download/v0.66.0/bundle.yaml) file, and pulling out all that pesky YAML except the ServiceMonitor and PodMonitor YAML definitions. Ta-da! 🪄✨

#### Final thoughts

I have to admit that the OTel Operator repo docs on the Target Allocator were a bit confusing, so after writing this blog post, I also wanted to make sure that the docs were a bit clearer for newbs such as myself. Check out [my PR to update the docs](https://github.com/open-telemetry/opentelemetry-operator/pull/1951), which has just been merged! 🌈

I hope y’all learned something new and cool with this! There’s obviously a LOT more to dig into with respect to the Target Allocator, but hopefully this gives you an idea of what it’s all about, and who knows…maybe you’ll be inspired to check out the Target Allocator now! If you’d like to learn more about the OTel Operator, you should check out [#otel-operator channel](https://cloud-native.slack.com/archives/C033BJ8BASU) in the [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf). The folks on there are super helpful and responsive.

Before we part ways, be sure to check out the [OTel Q&A sessions](https://www.youtube.com/playlist?list=PLVYDBkQ1TdywIl9xKEo5_u7zlwY38dW43)…they’re suuuuper informative and fun! If videos aren’t your jam, you can check out the blog post summaries of the OTel Q&A sessions via the [OTel Blog](https://opentelemetry.io/blog).

Now, please enjoy this photo of my dear rat Mookie, who is generally VERY difficult to photograph, because she’s always on the move. Shout-out to my husband for snapping this rare pic of her sitting still. 💙

![White and brown fancy rat sitting on the arm of a black sofa.](https://cdn-images-1.medium.com/max/800/1*6YvCvU2MwJECOXrZJzEDmQ.png)

Mookie the rat is still enough for a photo op!

Peace, love, and code! ✌️💜👩‍💻

_PS: Massive shoutout to my co-worker_ [_Jacob Aronoff_](https://www.linkedin.com/search/results/all/?fetchDeterministicClustersOnly=true&heroEntityKey=urn%3Ali%3Afsd_profile%3AACoAABkjZ7wBUaOo8IRrUpzT7Emk4PiXYiXatHM&keywords=jacob%20aronoff&origin=RICH_QUERY_TYPEAHEAD_HISTORY&position=0&searchId=1777920c-9f22-424d-a9f0-89c6f0682a59&sid=ApB)_, who is also one of the OTel Operator maintainers, for helping me wrap my head around this topic, and answering all of my questions!_

Want to learn more about OpenTelemetry? Check out my other OTel content here:

[**OpenTelemetry**  
_Blog posts about OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/92f897d8b31e "https://adri-v.medium.com/list/92f897d8b31e")[](https://adri-v.medium.com/list/92f897d8b31e)

By [Adriana Villela](https://medium.com/@adri-v) on [July 21, 2023](https://medium.com/p/47a2b1f07562).

[Canonical link](https://medium.com/@adri-v/lets-learn-about-the-otel-operator-s-target-allocator-47a2b1f07562)

Exported from [Medium](https://medium.com) on June 3, 2026.