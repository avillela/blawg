---
title: "Unpacking Observability: How to Choose an Observability Vendor"
slug: unpacking-observability-how-to-choose-an-observability-vendor
description: "Six Observability vendor selection criteria to help you run a successful Observability practice"
added: "Mar 30, 2022"
tags:
  - technical
  - opentelemetry
  - observability
  - thought-leadership
  - "2022"
---


![](https://cdn-images-1.medium.com/max/800/1*jngxoWs6Bwgs9RPBDu7e3g.jpeg)

Mural under the rail bridge near Dupont St. and Campbell Ave. in Toronto. Photo by [Adri Villela](https://adri-v.medium.com).

If you’ve been following along in my [Unpacking Observability series](https://medium.com/@adri-v/list/unpacking-observability-be1835c6dd23), you know that I’m a big fan of [OpenTelemetry](http://OpenTelemetry.io) (OTel). Instrumenting your code is just part of the picture. The other part? Actually _doing_ something with the telemetry data. That’s where Observability (o11y) back-ends come in.

There are a number of Observability back-ends out there, ranging from self-hosted open source tools like [Jaeger](https://www.jaegertracing.io/docs/1.32/getting-started/), [Zipkin](https://zipkin.io/pages/quickstart.html), and [Grafana Tempo](https://grafana.com/docs/tempo/latest/getting-started/?pg=oss-tempo&plcmt=resources), to paid software-as-a-service (SaaS) offerings, like [Honeycomb](http://honeycomb.io), [Datadog](http://datadoghq.com), [Dynatrace](http://dynatrace.com), and [Lightstep](http://lightstep.com). I personally prefer going the SaaS vendor route, for two reasons:

1.  I don’t want the extra burden of maintaining tools on-prem when a vendor can most likely do a better job of it. Also, you can focus on The Most Important Thing: Observability itself.
2.  As far as I know, none of the open source tools provide you with an all-in-one Observability solution. (Please feel free to correct me if I’m wrong!) The other thing is the burden of managing infrastructure and integrations with open source tools. No thanks.

[In my first Unpacking Observability blog post](https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f), I briefly touched upon Observability vendor selection criteria. Now that I’ve spent some time working in the trenches with dev teams facing real-world challenges, I’d like to revisit and tweak these criteria.

Let’s do this!

> **Note:** _This post assumes basic knowledge of Observability and OpenTelemetry. If you need a refresher, check out my_ [_Intro to Observability_](https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f) _post, and my post on the_ [_Observability Stack_](https://storiesfromtheherd.com/unpacking-observability-the-observability-stack-93d4733e2a72) _before reading on._

### The Problem

Before we talk about our selection criteria, let’s zero in on The Problem that we are trying to solve. One of the biggest challenges that many organizations face is that they have a handful of engineers who are the “go-to crew” for when the poop hits the fan in Production. These are typically senior engineers with years of troubleshooting experience and domain knowledge. While it may sound like rainbows and unicorns at first to always be the one to save the day, it gets very draining, very fast, for most people.

The problem is that often, these engineers have other things to do, like writing code to implement new features. If they’re constantly having to troubleshoot prod issues, they get less time to work on cool new stuff. They may feel resentful for having less time to work on solving interesting problems, and always being the go-to person when there’s an issue.

They may try to juggle their software engineering duties with the troubleshooting work, which will ultimately lead to burn-out. Burnt-out, resentful engineers will eventually get fed up and leave. And before you know it, you’ve lost domain knowledge _and_ a good engineer. Yikes! 😱

Can we solve this? Yes! With Observability, [as we’ve already established](https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f)! But it’s not like I just wave my magic wand and say, “Thou shalt now do the Observability!” to make y’alls problems go away. In order to be successful, we need two things to happen:

1.  [Instrument code properly à la OpenTelemetry](https://storiesfromtheherd.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4) ✅
2.  Select a good Observability vendor ✅

Assuming that you’ve instrumented your code properly, that leaves us with #2. So let’s look at what it takes to select a good Observability vendor…

### Selection Criteria

> **First things first.** _At the time of this writing, I was working as a manager of the Observability Practices team at_ [_Tucows_](http://Tucows.com)_/_[_Wavelo_](http://wavelo.com)_. You’ll see many of my o11y writings published in their_ [_Medium publication_](http://storiesfromtheherd.com)_. Also, I want to make it superly duperly clear that I am_ **not** _here to push any specific vendor onto you. I am here to help you make an informed decision in selecting a vendor, based on real-life experiences and observations. When I call out a particular vendor, it’s only to share info based on my experience with them. The choice to go with a particular vendor is ultimately up to you. I’m just here for guidance._

So what should you look for when selecting an Observability vendor?

#### 1- Troubleshooting Ease

A good Observability back-end should allow SREs and/or devs who aren’t super familiar with all aspects of an application to **_quickly_** troubleshoot a prod issue. No domain knowledge? No problem! A good Observability vendor will be able to point you in the right direction of what might be going caca in your system. This means that you don’t always have to rely on your “go-to crew” to troubleshoot prod issues. Sweet.

Let me give you an example. A few weeks back, I spoke with a solutions engineer for an Observability vendor. We were looking at whether or not we might consider making the switcheroo to their product. We had instrumented one of our applications using OpenTelemetry, and had asked him to walk us through how to read traces and troubleshoot using their platform. Right away, this engineer, who had never seen our code before and had zero knowledge of our application, was able to point to some potential wonkiness in our code. All of us on the call were like, “Whoa!” 🤯

#### 2- OpenTelemetry Support

Fact: most of the big Observability vendors out there have OpenTelemetry support. That’s awesome, given that OTel has become the de facto standard for instrumenting code. This means that vendors either ingest OTel data via the native OpenTelemetry format, [OTLP](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md) (e.g. [Lightstep](https://docs.lightstep.com/docs/send-otlp-over-http-to-lightstep) and [Honeycomb](https://www.honeycomb.io/blog/announcing-honeycomb-support-for-event-ingestion-with-otlp/)), or they require their own OpenTelemetry exporter [via the OTel Collector](https://opentelemetry.io/docs/collector/) to translate the OTel data format into their platform’s native data format (e.g. [Dynatrace](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/dynatraceexporter), [Datadog](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/datadogexporter)).

Whether or not a vendor requires a vendor-specific exporter or uses the OTLP format doesn’t really matter²…as long as there’s a way to get the OTel data into that vendor platform. What **_does_** matter is **_how_** the vendor renders the OTel data in their UI. So, when speaking with a potential vendor, declare to them your intention to use OpenTelemetry, and see how they react.

Last year, my team and I spoke with a vendor who kept trying to steer us towards using their own proprietary tracing library. When we asked about OTel support, they said that while they did ingest OTel data by way of a their own OTel Collector exporter, they said that using their own library for instrumentation would allow us to tap into more features and analytics on their platform. Yikes! Red alert! 🚨

#### 3- Vendor-Differentiating Features

While it’s true that many so-called Observability vendors will render your traces for you, what differentiates them is whether or not you can do something **_useful_** with the traces ingested by these systems. (Also, some vendors do a crappy job of making those traces look useful. Just sayin’.) Some questions to ponder:

*   Does the vendor support high-cardinality¹ data?
*   How well does the vendor handle monster traces? That is, can you easily find The Problem in that big, giant trace?
*   How well/easily can you drill into your traces to troubleshoot?
*   How well can you slice and dice your trace data to narrow in on the issue at hand?
*   Does the vendor focus more on [logs over traces](https://adri-v.medium.com/unpacking-observability-the-paradigm-shift-from-apm-to-observability-707735953c75)? (Pro tip: if they focus heavily on logs: RUN AWAY.)
*   While traces are the star attraction in the Observability world, metrics are still important too. How does the vendor tool handle metrics? How well do they correlate traces and metrics?
*   Does the vendor have any cool features in place to surface weird system behaviour, compared to their competitors?

#### 4- Technical Support

Have you ever noticed that when a vendor is trying to land you as a client, they will kiss your derrière to the ends of the Earth, catering to your every whim? During the wooing phase, vendor sales reps are super-attentive, scheduling various Q&A sessions, demos, and meetings to pick their solutions engineers’ brains. It’s magical. It’s wonderful. But…what happens to that white-glove service once you’ve signed on the dotted line and forked over the moolah?

It’s an important question to ask, because in many cases, you might only get white-glove support with a vendor if you purchase an Enterprise-tier subscription. If you go for a middle (typically “Pro”) tier, you may be relegated to the bowels of ZenDesk Hell, playing a never-ending game of ping-pong with support staff (or are they really bots? 🤔) who often take a week or more of back-and-forth clarification e-mails to kinda sorta answer your questions to some satisfaction. And good luck trying to get face-time with a solutions engineer. That’ll cost ya extra.

The point is, find out what kind of support you’d be getting with Pro vs Enterprise tiers for the vendors you are considering, before you cut any one of them that big fat cheque. Are you okay with meh support? Do you want the fancy white-glove support? If so, is it within your budget?

#### 5- Good Vibes

This may sound a bit corny, but I think that getting a good vibe from a vendor is super important. Working with a vendor you trust, and whose overall philosophy and approach to Observability are in line with your own will make for a much better relationship and experience. There are a few ways to get a sense for an Observability vendor’s vibe.

Number one: find out who their [Developer Advocates](https://www.freecodecamp.org/news/what-the-heck-is-a-developer-advocate-87ab4faccfc4/) are. They typically author the company’s blog posts and YouTube videos, present at conferences, and have a healthy Twitter presence. Developer Advocates are technical, are great communicators, are passionate about Observability, and are involved with OpenTelemetry. They cut through the BS and tell it like it is. A good Developer Advocate has a solid track record and personal brand, and is the type of person you want to follow because you love to hear what they have to say in the tech space. The Developer Advocates whom I’ve been following in the Observability space are [Liz Fong-Jones](https://twitter.com/lizthegrey), [Ted Young](https://twitter.com/tedsuo), and [Austin Parker](https://twitter.com/austinlparker), all of whom I’ve had the pleasure of meeting. 💜

Number two: check out the vendor’s blog posts and YouTube videos. Does their content resonate with you, particularly when discussing Observability concepts and philosophy?

Number three: check out the vendor’s Slack or Discord user communities. (Does the vendor even **_have_** such communities?) Some vendor communities follow a “community center” model, with users and vendor staff alike who are more than happy to share their knowledge with you. [Honeycomb Pollinators Slack](https://honeycombpollinators.slack.com/) is one such community. Some vendor communities follow more of a “library model”, run by curators who provide a combination of high-level info and links to well-documented online resources. One such example is the [Lightstep Community Discord](http://discord.gg/pCftwe8). And then some vendors have grossly sub-standard Slack communities whereby when you ask them a question, they simply direct you to open a support ticket with them. Red alert! 🚨

#### 6- Bang for your buck

Deciding to use a vendor solution for your Observability back-end means that it’s gonna cost you. After all, these vendors are in it to make money on a product that they believe will be helpful to engineers.

The most important thing you need to do is to understand **_how_** you are billed. Here are some of the typical vendor billing models (at a very high level):

*   **Charge per Event (e.g.** [**Honeycomb**](https://www.honeycomb.io/pricing-faq/)**)**, whereby a Span is considered an Event. If you include Span Events in your Span, you get charged for those too. So for example, if you send over a Span with 5 Span Events, you get charged for 6 Events. (For a terminology refresher on Traces, Spans, and Events, check out [this](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172) post).
*   **Charge per active Service (e.g.** [**Lightstep**](https://lightstep.com/pricing)**)**, whereby a Service usually corresponds to a microservice, which corresponds to a code repo. With this model, if you launch 60 replicas (containers) of the same service, you still get charged only for one service.
*   **Charge per host (e.g.** [**Datadog**](https://www.datadoghq.com/pricing/)**).** This usually includes a certain allotment of containers per host. Suppose that you’re allotted 20 containers per host. If you launch 60 replicas of the same service, you will get charged for those additional 40 containers.

But it doesn’t stop there. Make sure that you’re aware of any hidden costs. Some vendors charge extra for every little thing. Need metrics? Extra charge. Need to index fields? Extra charge. Want high-cardinality¹? Extra charge. Want longer data retention³? Extra charge.

Bottom line: find out what the extra costs are, to avoid having to explain outrageously large bills to your senior leadership.

Final note: some vendors might offer some integrations and features that are included as part of their service fees. Cool beans. Question: do these really add value to what you and your organization are doing, or are they just useless fluff being thrown in to give you a false sense of getting your money’s worth?

### Conclusion

There is no right or wrong answer when selecting an Observability vendor. What is important, however, is _knowing what you’re getting yourself into_. Understanding what you’re getting in terms of features, technical support, community support, and bang for your buck are key.

Most vendors will give you trial access to their Enterprise tier for a short period of time (typically anywhere from 1 to 3 months). And since you’re using OpenTelemetry (you ARE, right??), you can easily send telemetry data to multiple Observability back-ends _at the same time_, à la Vendor Bake-Off. I would highly recommend running a POC with 2–3 vendors, with 3–5 services sending telemetry data to all vendors so that you can compare them. Pro tip: pick useful services with lots of volume; don’t bother instrumenting a small, relatively insignificant service. You’ll do yourself a disservice, since it won’t represent “real life”. I speak from experience.

Keep in mind that (properly) comparing 2–3 vendors at the same time can be rather labour-intensive, as it requires learning different vendor tools. That said, it’s a relatively small price to pay before investing in a longer-term contract with an Observability vendor.

And remember that once you’ve selected a vendor, don’t feel pressured to sign on for multiple years. Sign on with them for a year to see if they’re the right fit. (Most — if not all — vendors won’t let you sign on for less than a year.) After a year, if you still like them, then great…you can extend the contract. And if not, you can switch to another vendor relatively easily because you’ve instrumented your code with OpenTelemetry (you did, right??).

Finally…don’t be afraid to evaluate your vendor situation every so often. Vendors add new features all the time, and maybe a vendor that you passed up a few years back might have launched some cool new features this year that can really help you up your Observability game.

And with that…we’re done. Congrats! You made it! You are now equipped with all you need to select an Observability vendor. As a reward, please enjoy this photo of my pet rat Phoebe. Isn’t she a sweetie? 💗

![](https://cdn-images-1.medium.com/max/800/1*7t655xFapCw-XnyqKsQ5Ag.png)

Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. ☮️ ❤️ 👩‍💻

### Footnotes

\[1\] According to [New Relic’s John Withers](https://newrelic.com/blog/best-practices/why-observability-requires-high-cardinality-data): “High-cardinality data provides the necessary granularity and precision to isolate and identify the root cause, enabling you to pinpoint where and why an issue has occurred.”

\[2\] Okay…it kind of somewhat matters if a vendor sends their data via OTLP vs requiring an exporter. Exporting directly to OTLP is better because OTLP is supported and maintained by OpenTelemetry. Vendor-specific exporters, however, are supported and maintained by the vendors themselves, which means that you have to rely on them to fix the exporter if you find a bug. Or fix it yourself, submit a PR, and pray.

\[3\] Find out what the data retention period is for the vendors you’re considering, to avoid surprises. Some of them will charge you extra to keep your data longer. The other question you should be asking yourself is, “Do I actually need to keep data around that long? WHY do I need to keep data around for that long?” If you’re keeping data around for a long time, then it’s more of a compliance thing, and not an Observability thing. And chances are, you’re keeping _different_ data around anyway.

### More Observability Goodies

Check out my guest spot on [o11ycast](https://www.heavybit.com/library/podcasts/o11ycast) as I talk about Tucows’ Observability journey!

[**O11ycast | Ep. #48, Mastering Migrations with Adriana Villela of Tucows | Heavybit**  
www.heavybit.com](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/ "https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/")[](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/)

Be sure to check out other articles in my Unpacking Observability series:

[**Unpacking Observability**  
_Stories to help you understand Observability and OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/be1835c6dd23 "https://adri-v.medium.com/list/be1835c6dd23")[](https://adri-v.medium.com/list/be1835c6dd23)

Also be sure to check out some great hands-on OTel tutorials by my very talented colleagues:

[**Fix Disjointed Traces with Context Propagation**  
_Connecting an OTel-Instrumented Service to a Service Instrumented with Datadog Tracing Libraries_storiesfromtheherd.com](https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0 "https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0")[](https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0)

[**OpenTelemetry: Hands-on Instrumentation**  
_How to Instrument Golang code with OpenTelemetry_storiesfromtheherd.com](https://storiesfromtheherd.com/opentelemetry-hands-on-instrumentation-f1b423c323c0 "https://storiesfromtheherd.com/opentelemetry-hands-on-instrumentation-f1b423c323c0")[](https://storiesfromtheherd.com/opentelemetry-hands-on-instrumentation-f1b423c323c0)

[**OpenTelemetry-Python Manual Instrumentation — How to Guide**  
_by Keerthi M and Irfan Khan | DevOps Engineer and Sr.DevOps Engineer — Observability| Tucows_storiesfromtheherd.com](https://storiesfromtheherd.com/opentelemetry-python-manual-instrumentation-how-to-guide-b6c518a8427e "https://storiesfromtheherd.com/opentelemetry-python-manual-instrumentation-how-to-guide-b6c518a8427e")[](https://storiesfromtheherd.com/opentelemetry-python-manual-instrumentation-how-to-guide-b6c518a8427e)

By [Adriana Villela](https://medium.com/@adri-v) on [March 30, 2022](https://medium.com/p/aa0e6d80b71d).

[Canonical link](https://medium.com/@adri-v/unpacking-observability-how-to-choose-an-observability-vendor-aa0e6d80b71d)

Exported from [Medium](https://medium.com) on June 3, 2026.