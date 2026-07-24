---
title: "Unpacking Observability: The Observability Stack"
slug: unpacking-observability-the-observability-stack
description: "Putting together a simple, yet effective OpenTelemetry-centric Observability stack"
added: "Aug 16, 2021"
tags:
  - technical
  - opentelemetry
  - observability
  - thought-leadership
---

# Unpacking Observability: The Observability Stack

![A graphic showing a box circled by stacked files to represent unpacking. There are various rectangular and circular shapes framing the graphic which is hued in a bright blue to deep purple.](https://cdn-images-1.medium.com/max/800/1*8q-8zVAjOzxHZbLClKYTcg.png)

As the manager of the Observability team at my current company, I find myself in a rather unique position. As part of my job, I get to define the “golden path” of Observability here. This means building an Observability practice, promoting the use of [OpenTelemetry](http://opentelemetry.io) (OTel) and [Observability-Driven Development (ODD)](https://thenewstack.io/a-next-step-beyond-test-driven-development/), and defining a Observability stack for teams across the org to use.

Our current Observability stack looks like a bit of a rummage sale of various open source products, as a result of Team X, being keen on using Tool A, and Team Y being keen on using Tool B. We ended up with a stack that included a bunch of different tools cobbled together in the hopes of providing Observability. Having followed the Observability scene pretty closely for the last year or so, I was pretty sure that we could reduce this stack by a LOT.

But first, I needed to start with some basics.

![Brick wall with the words “Look up to the starts” written on it.](https://cdn-images-1.medium.com/max/800/1*VEKi7Snzf8J6NfOUdHLmXg.png)

Image by [Adri V](https://adri-v.medium.com)

### The Plan

I think that before even talking about Observability tooling, it’s important for an organization to first [understand Observability and the problem that it solves](https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f).

> **Recap:** _Observability lets us understand a system from the outside, by letting us ask questions, without knowing the inner workings of that system. Observability lets us deal with_ unknown unknowns_._

This can be a challenge, because most organizations are steeped in the old [Application Performance Management (APM)](https://medium.com/lightstephq/apm-is-dying-d36007ac61fc) tradition. This is further muddled by the fact that many APM vendors have re-branded themselves as Observability vendors, in the same manner that many companies have re-branded Operations roles as DevOps or Site Reliability Engineer (SRE). 🤮

> **Embracing Observability means unlearning APM.**

Is APM bad? No, it isn’t. [But it’s not well-suited to the microservices world, whereas Observability is](https://medium.com/lightstephq/apm-is-dying-d36007ac61fc).

I’ve spent a lot of time educating myself on modern Observability practices: reading blog posts, watching videos, attending [o11ycon,](https://o11ycon-hnycon.io/o11ycon-agenda/) and binging on the [o11ycast podcast](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwi4vKmS34byAhVGa80KHec6BsQQFnoECAUQAw&url=https%3A%2F%2Fwww.heavybit.com%2Flibrary%2Fpodcasts%2Fo11ycast%2F&usg=AOvVaw2wjJ79R0BLBov02_Wx6wvZ). Of equal importance was sharing these resources with my own team, to ensure that we’re all aligned. After all, we’re on a mission to educate an entire organization on Observability benefits and practices.

When it comes to sharing info across an organization, it’s unreasonable to ask folks to go through so much material. They ain’t got time for that. They want the [Coles Notes](https://en.wikipedia.org/wiki/Coles_Notes)¹ version, not the 1000-page novel. So I put together a [couple of intro blog posts on Observability](https://adri-v.medium.com/list/observability-be1835c6dd23). Education is key. And when people get it, you get buy-in. ✨ 🌈

But that was only the beginning. With a better grasp on Observability, I was ready to start thinking about what our stack should look like.

### The Observability Stack

If there’s anything that’s an absolute must in my Observability to-do list, it’s getting org-wide acceptance of [OpenTelemetry](http://opentelemetry.io) (OTel) for data-collection. OTel is great for application _instrumentation_ (capturing traces — including spans and events — from our software) and _metrics_ (recording and transmitting readings from our infrastructure). I chose OpenTelemetry because it is:

*   THE industry standard for data-collection ✅
*   Vendor-agnostic ✅
*   Supported by the major Observability vendors ✅

I want to get rid of most — if not all — of the mish-mash of tools that I listed in the intro, and I strongly believe that using OTel along with an Observability back-end will give me everything that I need.

A few noteworthy requirements:

1.  **For my Observability back-end, I wanted to go with a vendor solution.** Vendors provide nice all-in-one solutions so that you can focus on Observability itself, and not on stitching tools together. I also really didn’t want the headache of managing tools on-prem if I didn’t need to.²
2.  **I don’t want to use Prometheus.** I think that we can pull this off. Turns out that Prometheus refers to both the [Prometheus tool](https://prometheus.io) and the [Prometheus data format](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwim5eftw7byAhVWa80KHeh1DfwQFnoECCUQAQ&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FPrometheus_%28software%29&usg=AOvVaw1j5sS5lzgMlFoU_EkmO_pl). (Confusing, right?!) If I’m going with an Observability vendor, I certainly don’t need/want to maintain the Prometheus tool. And if I have any infrastructure that captures Prometheus-style metrics, I’m hoping that OTel can come to the rescue for me (more on that below).

After a few weeks poking around, asking the mighty Google, and asking lots of questions to folks in the Observability community,³ I came up with the diagram below. I’m happy to say that it has been vetted by some legit folks in the Observability community, so this isn’t some unrealistic pipe-dream.

![](https://cdn-images-1.medium.com/max/800/1*8cRM0PfLq581qSPwlhm0WQ.png)

A sample Observability stack, featuring 3 different Observability vendor back-ends that you can check out (there are more to choose from). Diagram by [Adri V](https://adri-v.medium.com/)

Thanks to its vendor-agnostic amazingness, I can then send my data to whatever vendor back-end I choose. And if I’m unhappy with one vendor, I can switch to another without much effort.

Let’s take a deep-dive into the key aspects of my proposed architecture.

> **Note:** _The_ [_OpenTelemetry Collector_](https://opentelemetry.io/docs/collector/) _features prominently in the diagram above. I’ll cover that in greater detail below._

### Observability Back-End

Before I continue, it’s important to point out that yes, I have listed three Observability vendors above. Because…why not! The beauty of OTel is that you can totally do this! Also, this is a great way to evaluate vendors.

Your end goal should be to use a single vendor that best embodies the practices and principles of Observability.

What makes a good Observability vendor? Some things to consider:

*   **Speaks o11y fluently.** This may seem a little too abstract, but you can tell the fakers from the real-deal by how they speak about Observability. For one thing, they don’t talk about APM or the [“Three Pillars”](https://medium.com/lightstephq/the-three-pillars-of-observability-that-werent-435bbe22a27c). They ensure that you, as a potential customer, understand the definition of Observability, and, equally-important, they recognize the paradigm shift required when going from APM-land to Observability-land. They focus on unknown-unknowns as a first-class citizen.
*   **Supports OpenTelemetry…properly.** By “properly” I mean that the vendor doesn’t just say that they support OTel. They actually have a good understanding of OpenTelemetry and can provide guidance on using OTel with their product.
*   **Promotes dynamic dashboards.** Dynamic dashboards help with the unknown unknowns, by letting you drill down and ask questions about your system, so that you can get to the root of your issue(s). These are different from the traditional static dashboards, which answer a question that someone asked once upon a time. They’re fine for dealing with known unknowns, and some may still be useful. Others may be relics of an older, irrelevant codebase.⁴
*   **Facilitates easy troubleshooting of prod issues.** One of the key promises of Observability is that it allows you to get to the bottom of prod issues relatively quickly and easily, without necessarily having super-deep system knowledge.
*   **Supports high-cardinality.** Cardinality refers to the number of unique values in your data set. If you have high cardinality, you have a large number of unique values (e.g. Customer ID, IP address, Social Insurance Number). If you have low cardinality, you have a small number of unique values (e.g. gender, country). According to [New Relic’s John Withers](https://newrelic.com/blog/best-practices/why-observability-requires-high-cardinality-data), “High-cardinality data provides the necessary granularity and precision to isolate and identify the root cause, enabling you to pinpoint _where_ and _why_ an issue has occurred.”
*   **Has a good community.** I believe that having a good support community is important from a vendor. Maybe because I’ve been spoiled by good community support. I want a vendor that has a community Slack where I can ask questions, occasionally even contribute, and won’t be met with a “please open a ticket” response to my questions.
*   **Doesn’t break the bank.** This is the big ‘ole elephant in the room. Of course these services don’t come for free, and yes, if I wanted free, I’d probably be looking at cobbling together my own o11y stack from a bunch of open source tools. That said, I don’t want to break the bank on an Observability vendor, and to do so, it’s important to know how a vendor charges its customers, and it’s important to try to surface those sneaky additional costs that creep out of the woodwork when you start using a product for realzies. Finally, it’s important to understand what level of visibility is offered for that cost, because a pre-aggregated metrics provider may be cheap, but it doesn’t actually meet the critical requirements.

### Instrumentation

When you instrument your code with OpenTelemetry, you can do so in one of two ways:

*   [**auto-instrumentation**](https://lightstep.com/blog/opentelemetry-automatic-instrumentation/?utm_source=pocket_mylist)**:** Uses [shims](https://en.wikipedia.org/wiki/Shim_%28computing%29) or bytecode instrumentation agents to intercept your code at runtime or at compile-time to add tracing and metrics instrumentation to the libraries and frameworks you depend on. The beauty of auto-instrumentation is that it requires a minimum amount of effort. Sit back, relax, and enjoy the show.
*   **manual instrumentation:** Requires adding spans, context propagation, attributes, etc. to your code. It’s like commenting your code or writing tests.

Auto-instrumentation is already available for a number of languages (and [for a number of popular frameworks/libraries](https://opentelemetry.io/registry/?utm_source=pocket_mylist) for these languages), including [Java](https://github.com/open-telemetry/opentelemetry-java-instrumentation), [.NET](https://github.com/open-telemetry/opentelemetry-dotnet-instrumentation), [Python](https://github.com/open-telemetry/opentelemetry-python), [Ruby](https://github.com/open-telemetry/opentelemetry-ruby), [JavaScript](https://github.com/open-telemetry/opentelemetry-js-api), [Golang](https://github.com/open-telemetry/opentelemetry-go).

So you may be wondering: when should you auto-instrument, and when should you manually instrument? Should you choose one over the other? How can they best be combined when the language — or framework — supports it?

**Start with auto-instrumentation if it’s available.** If the auto-instrumentation isn’t sufficient for your use case, then add in the manual instrumentation. For example, auto-instrumentation doesn’t know your business logic — it only knows about frameworks and languages — in which case you’ll want to manually instrument your business logic, so that you get that visibility.

### OpenTelemetry Collector

If you’ve worked with observability vendors before, you may have noticed that they tend to have their own agents for receiving, processing, and exporting data from your apps and your infrastructure. This kinda sucks if you’re trying to avoid vendor lock-in. Fortunately, OpenTelemetry provides a vendor-agnostic agent called the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/getting-started/).

The OTel Collector can be deployed in two different ways:

*   **Agent:** Runs as an application sidecar, binary on your host, or daemonset on your [Kubernetes](https://adri-v.medium.com/list/justintime-kubernetes-e13411064e51) or [Nomad](https://adri-v.medium.com/list/nomad-cc5d249a172b) cluster (or whatever container orchestration tech tickles your fancy). It collects host metrics automatically, and collects tracing information.
*   **Gateway**: One or more Collector instances running as a stand-alone service in a cluster, environment, or region. It’s used for doing more advanced stuff, such as buffering, encryption, data obfuscation, and tagging. It receives data from OTel Collector Agents deployed within an environment.

You should have at least one OTel Collector in your architecture, because you need it to translate your metrics and your instrumentation data into a useful format that can be fed into your chosen Observability back-end. How many OTel Collectors you end up using in your own systems depends on your specific situation. You could have a bunch of Agents and no Gateway. Or a Gateway and no Agents. Or a Gateway and a bunch of Agents. Lots of options. Most likely you’ll want to go with a combo of Agents running on your hosts, some sidecar agents on your containers, and a Gateway cluster. How many nodes in your Gateway cluster depends on your particular use case.

The diagram below shows the architecture of the OTel Collector:

![OpenTelemetry Collector architecture. Receivers are data inputs, receiving data from different sources. Processors transform data. Exporters are data outputs, taking transformed data and sending them to different Observability tools.](https://cdn-images-1.medium.com/max/800/1*y3Iq3ehBSouZqkmyl_17Ow.png)

Source: [OpenTelemetry Agent and Collector CNCF talk by Steve Flanders and Trask Stalnaker](https://www.youtube.com/watch?v=cHiFSprUqa0)

Let’s dig into what all this means!

The OTel Collector has 4 main components:

*   Receivers
*   Exporters
*   Processors
*   Extensions

> **Note:** _If you check out the_ [_OTel GitHub repos_](https://github.com/open-telemetry)_, you’ll notice the_ [_otel-collector_](https://github.com/open-telemetry/opentelemetry-collector) _and_ [_otel-collector-contrib_](https://github.com/open-telemetry/opentelemetry-collector-contrib) _repos. The contrib repo is for contributions that are not part of the core distribution. This does not mean that it is any less relevant or any less useful!_

#### **Receivers**

The OpenTelemetry Collector’s [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers) is used to get data _into_ the OTel Collector. If you’re sending out instrumentation data from your application code, you would use the native [OpenTelemetry Protocol (OTLP)](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md) format, which means that you’ll be using the [OTLP receiver](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/otlpreceiver).

If you’re receiving metrics data from your infrastructure in some different data format (e.g. [statsd](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/statsdreceiver), [Jaeger](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/jaegerreceiver), [Prometheus](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/prometheusreceiver)), you’ll need to use a receiver that ingests that format to convert it to [OTLP](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md).

> **Note:** _I’m hoping that we can use the_ [_OTel Collector’s Prometheus Receiver_](https://github.com/open-telemetry/opentelemetry-collector/tree/main/receiver/prometheusreceiver) _to straight up replace running the Prometheus tool. My team is actually POCing this right now, and I expect to have an update in the next couple of weeks on the results of this experiment!_

#### **Exporters**

The OTel Collector sends data to multiple back-ends by way of [exporters](https://opentelemetry.io/docs/collector/configuration/#exporters). These translate [OTLP](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md) to a vendor-specific back-end format. These include but are not limited to:⁵

*   Datadog
*   Dynatrace
*   Jaeger
*   Loki

There’s also an [OTLP](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md) exporter, which doesn’t actually do any data transformation. Why do you need it? For things like:

*   Configuring your Observability back-end (e.g. Lightstep and Honeycomb support OTLP and therefore would utilize the OTLP exporter)
*   Defining pipelines (more on that below)

#### **Processors**

[Processors](https://opentelemetry.io/docs/collector/configuration/#processors) can be used to transform your data before exporting it. For example, you can use processors to append/modify/remove metadata, filter data, or even obfuscate data. You can also use processors to help ensure that your data makes it through a pipeline successfully by batching data or defining a retry policy. This is just scratching the surface. Be sure to check the [OTel docs](https://opentelemetry.io/docs/collector/configuration/#processors) for more on what Processors can do.

#### **Extensions**

For completeness, I’ll briefly mention the OTel Collector [Extensions](https://opentelemetry.io/docs/collector/configuration/#extensions). They were mainly designed so that you can use them to monitor the performance and behaviour of the Collectors. You use them for health checks and profiling.

#### **Dataflow (Pipelines)**

You might be wondering how we define how data flows through the OTel Collector. This is done with pipelines. Pipelines define the flow of your traces (application data) and metrics (infrastructure data). For example:

*   **Trace pipeline:** Receive instrumentation data via OTLP, run through some processors that add a couple of extra attributes, and then export the data to a Datadog back-end via the Datadog exporter.
*   **Metrics pipeline:** Receive Prometheus-style metrics from your infrastructure, remove a few attributes that you don’t need, and export the data to a Lightstep back-end via the OTLP exporter.

Also, there’s nothing stopping you from receiving from multiple sources and exporting to multiple sources in a pipeline.

That’s all well and good, but how in Thor’s Hammer do we configure all this??Using YAML! Check out a sample here:

> **Note:** _For more OTel Collector config samples, go_ [_here_](https://github.com/lightstep/opentelemetry-examples/blob/main/config/example-collector-config.yaml?utm_source=pocket_mylist)_._

A few things to note:

*   We have a place to configure our `receivers`, `exporters`, and `processors`. And we can configure more than one of each kind!
*   Pipelines are defined in the `services` section. We have separate pipelines for traces (our application code), and for our metrics (our infrastructure)

Since we’ve already covered a lot here, I’ll leave a full-fledged OTel example for a later blog post. My point here is to give y’alls a basic high-level understanding of the OTel Collector and its magical capabilities.

### Final Thoughts

That was a lot to take in! Take a breather…you deserve it!

Coming up with an Observability stack for my organization has been a journey. And a fun one at that. Regardless of what Observability stack you implement in your organization, you should consider the following:

*   Educate your organization about Observability. Many folks will be coming from an APM background, so be prepared for pushback.
*   Make OpenTelemetry a first-class citizen in your organization so that you’re not stuck with a back-end who turns out to be a poor fit for your org.
*   Select an Observability back-end that supports OpenTelemetry and best encompasses the principles and practices of Observability. And stay clear of back-ends that still talk about APM.
*   Consider going for an Observability vendor, rather than trying to string a bunch of open source tools yourself. The cost of maintaining these tools just ain’t worth it, yo.

I shall now reward you with a picture of some cows in a field.

![Three black-and-white cows grazing on a green field with an open blue sky](https://cdn-images-1.medium.com/max/800/1*1Wg3-VurlHN7opMQ_c-Hnw.jpeg)

Photo by [Henrik Hjortshøj](https://unsplash.com/@hfranke?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/cows-sleping?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### Related Listening

Be sure to check out my guest spot on [O11ycast](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/), as I talk about Tucows’ Observability journey!

[**O11ycast | Ep. #48, Mastering Migrations with Adriana Villela of Tucows | Heavybit**  
www.heavybit.com](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/ "https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/")[](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/)

### More from the Unpacking Observability Series

[**Unpacking Observability: A Beginner’s Guide**  
_A beginner’s guide to understsanding Observability, why it matters, and how you can get started._adri-v.medium.com](https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f "https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f")[](https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f)

[**Unpacking Observability: Understanding Logs, Events, Traces, and Spans**  
_The path to instrumenting with OpenTelemetry_medium.com](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172 "https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172")[](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172)

[**Unpacking Observability: The Path to OpenTelemetry**  
_How to roll out OpenTelemetry across your organization to achieve Observability vendor neutrality_adri-v.medium.com](https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4 "https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4")[](https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4)

### References & Resources

*   [A Next Step Beyond Test Driven Development](https://thenewstack.io/a-next-step-beyond-test-driven-development/)
*   [The Three Pillars of Observability that Weren’t](https://medium.com/lightstephq/the-three-pillars-of-observability-that-werent-435bbe22a27c)
*   [OpenTelemetry Agent and Collector CNCF talk by Steve Flanders and Trask Stalnaker (YouTube, 25:33)](https://www.youtube.com/watch?v=cHiFSprUqa0)
*   [How the OpenTelemetry Protocol Works with Lightstep & Prometheus](https://thenewstack.io/how-the-opentelemetry-protocol-works-with-lightstep-and-prometheus/)
*   [What are you doing for distributed tracing? (Reddit)](https://www.reddit.com/r/ExperiencedDevs/comments/oniq3o/comment/h61mol6/?context=3&utm_source=pocket_mylist)
*   [Notes on the Perfidy of Dashboards](https://charity.wtf/2021/08/09/notes-on-the-perfidy-of-dashboards/)
*   [OpenTelemetry automatic instrumentation: a deep dive](https://lightstep.com/blog/opentelemetry-automatic-instrumentation/?utm_source=pocket_mylist)

### Acknowledgements

Big thanks to folks at [Honeycomb](http://honeycomb.io) and [Lightstep](http://lightstep.com) for helping to clarify a number of the concepts covered in this post, and for putting up with my barrage of questions. ❤️

### Footnotes

\[1\]: [Coles Notes](https://en.wikipedia.org/wiki/Coles_Notes) are the Canadian equivalent of [CliffsNotes](https://www.cliffsnotes.com)

\[2\]: That’s not to say that you can’t. If that’s your jam, then by all means, go for it!

\[3\]: Big shout-out to [Honeycomb](http://honeycomb.io) and [Lightstep](http://lightstep.com) for a WEALTH of great info, including informative videos and blog posts. They also have a very responsive user community via the [Honeycomb Pollinators Slack](https://honeycombpollinators.slack.com), and the [Lightstep Community Discord](http://discord.gg/pCftwe8). These two communities have aided me immensely in understanding OpenTelemetry better, and in vetting my ideas.

\[4\]: I highly recommend that you check out [this comprehensive post on dashboards and Observability](https://charity.wtf/2021/08/09/notes-on-the-perfidy-of-dashboards/).

\[5\]: Check out the comprehensive list of OpenTelemetry Collector Exporters [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) (non-core distribution) and [here](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter) (core distribution).

By [Adriana Villela](https://medium.com/@adri-v) on [August 16, 2021](https://medium.com/p/93d4733e2a72).

[Canonical link](https://medium.com/@adri-v/unpacking-observability-the-observability-stack-93d4733e2a72)

Exported from [Medium](https://medium.com) on June 3, 2026.