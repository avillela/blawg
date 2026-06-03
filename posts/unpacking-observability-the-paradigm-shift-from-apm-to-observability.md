---
title: "Unpacking Observability: The Paradigm Shift from APM to Observability"
slug: unpacking-observability-the-paradigm-shift-from-apm-to-observability
description: "How I learned to get off of logs and embrace the trace."
added: "Feb 11, 2022"
tags:
  - technical
  - opentelemetry
  - observability
  - thought-leadership
---

# Unpacking Observability: The Paradigm Shift from APM to Observability

![Mural artwork featuring a black blob person with the thought bubble, “If we saved them…would they notice?” while UFOs attack a city.](https://cdn-images-1.medium.com/max/800/1*CD17te4DNlITYyjphPFcEg.jpeg)

Alley mural in downtown Toronto. Photo by [Adri Villela](https://adri-v.medium.com).

If you’ve been following my [Unpacking Observability](https://adri-v.medium.com/list/unpacking-observability-be1835c6dd23) series, you have heard me harp on the fact that Observability (o11y), like DevOps and SRE, is a paradigm shift. And the more [APM](https://medium.com/lightstephq/apm-is-dying-d36007ac61fc)\-minded your organization is, the more challenging it will be to steer them towards Observability Nirvana, which can be super hard to do when an org/management/developers have “grown up” with APM. Don’t take it personally. It’s hard to change, even when you know that there’s a better way out there. That whole “devil you know” bit. The good news, my friend, is that the change is not impossible…it’s just a pain in the rear. Lucky for you, I’m here to guide you! 🌈 💫

So…keeping all that in mind, I wanted to share some of my thoughts on the challenges that companies face when converting from an APM-minded organization to an Observability-minded one. It really boils down to three main challenges. Let’s dig in!

> **Note:** _This post is a very high-level take. I am assuming that you are familiar with basic Observability concepts. If not, I invite you to check out early posts in my_ [_Unpacking Observability_](https://adri-v.medium.com/list/unpacking-observability-be1835c6dd23) _series to get started._

### Challenge #1: Logs don’t really fit in an Observability world

As developers, we are sooooo used to poring through logs for that hint of “WTF is causing this issue?!” It’s annoying, but it works. Until it becomes cumbersome or overwhelming.

Imagine that you’ve been woken up in the middle of the night by a production issue. This one is super extra bad. The app is down, and management is breathing down your neck, asking about the root case. You’re tired, and disoriented, and are desperately scrolling through all sorts of logs for any hint of what is going on.

Looking through a sea of logs is like trying to find your diamond engagement ring in a muddy lake while your fiancé is yelling at you, wondering why you’re not going faster.

From an Observability standpoint, it’s a no-no. Logs are unstructured, hard to search, and have no context. They are soooo yesterday!

We actually need to move away from our heavy reliance on logs for troubleshooting, cuz that’s not where da real party’s at.

Which leads me to my next point…

### Challenge #2: Finding the right Trace structure

Observability, when you boil it down, is all about distributed traces. Traces give you that end-to-end “picture” of what the heck happens from user request to system response (or maybe lack thereof). BUT…that’s only part of the story. It’s important to structure your traces effectively so that y’all can troubleshoot quickly and effectively.

I used to say to the teams I was working with that they needed to wrap their logs in a trace, because then you’d have that overall context to give you that “big picture” of what was going on in your system. Then I had a big “AHA!” moment, when I realized that doing that basically amounts to putting lipstick on a pig. Sure, it may be useful to include an informative log-like message as part of a trace. But that shouldn’t be what you depend on to troubleshoot a system issue. At a high level, it’s about including enough useful [high-cardinality data](https://twitter.com/mipsytipsy/status/1491202856564981763?s=21)¹ in our traces so that we can more easily “slice and dice” our data to help us drill into the problem. So, if you are tempted to search for info in a log line which is attached to a span, remember that you are putting the cart before the horse.

Okay…you’ve got a kick-ass trace. Hurrah!! But now you have another challenge — visualization. This leads me to my final point…

### Challenge #3: Not all o11y tools are created equal

While it’s true that many so-called Observability vendors will render your traces all pretty for you, what differentiates them is whether or not you can do something useful with the traces ingested by these systems. Some questions to ponder:

*   Does the vendor support high-cardinality¹ data?
*   How well does the vendor handle monster traces?
*   How well/easily can you drill into your traces to troubleshoot?
*   How well can you slice and dice your trace data?

Some vendors claim to be o11y vendors, when in fact, they are old school APM vendors who cobbled together a distributed tracing interface and “OTel support” into their product, to avoid o11y FOMO. The result is a UI that ain’t that useful for troubleshooting.

![“BE BRAVE ENOUGH TO SUCK AT SOMETHING NEW.” written in black all-caps text against a white brick wall.](https://cdn-images-1.medium.com/max/800/1*HdU9F5jYnM5-mN2KDFP1Qg.png)

Image source [here](https://gutsygirlsadventurefilmtour.co.nz/wp-content/uploads/2019/12/Be-brave-enough-to-suck.png).

### Conclusion

So you might be thinking, “Welp, that’s all well and good, but how does that help _me_?” Excellent question!

Answer: identifying these challenges now puts you in a position to effect change. Here’s what you can do next:

#### 1- Start working with dev teams by educating them on [moving away from logs, and into traces](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172)

A little nagging combined with a nice show-and-tell goes a long way! What won’t work is coming up to them and saying that their way of doing things sucks and that they must now bow down to their new Observability Overlords. Be kind. Listen. Help.

#### 2- Understand what data is important for your traces

Ask your devs and SREs about the attributes that are important to _them_ when they are digging into an issue?

#### 3- Shop around for a good Observability back-end (vendor/tool)

By instrumenting your code using [OpenTelemetry](https://storiesfromtheherd.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4), you can send to a few Observability back-ends at the same time, effectively running an “Observability Vendor Bake-Off”. That is, a side-by-side comparison of 2–3 Observability vendors to see which one better suits your needs. Many vendors will be happy to run a 3-month POC with you. I would highly recommend running a POC with 2–3 vendors, with 3–5 services sending telemetry data to all vendors so that you can compare them, to see how useful they are for analyzing traces.

Now, don’t just take my word on the magic of traces. Check out [this post](https://irezyigit.medium.com/edafcfb173c2), written by [Yiğit İrez](https://medium.com/u/c5632fbf2f8b), as he shares his personal journey of moving into Traces from Logs.

So, my friend, go forth and spread some Observability! But before you do that, please enjoy this picture of four yaks on a snowy field.

![](https://cdn-images-1.medium.com/max/800/1*LiGsHrquNiAzwfdROebdbg.jpeg)

Photo by [Lieve Ransijn](https://unsplash.com/@lievemax?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/yak?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### Related Listening

Be sure to check out my guest spot on [O11ycast](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/), as I talk about Tucows’ Observability journey!

[**O11ycast | Ep. #48, Mastering Migrations with Adriana Villela of Tucows | Heavybit**  
www.heavybit.com](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/ "https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/")[](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/)

### Related Reading

[**Unpacking Observability: A Beginner’s Guide**  
_A beginner’s guide to understsanding Observability, why it matters, and how you can get started._storiesfromtheherd.com](https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f "https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f")[](https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f)

[**Unpacking Observability: Understanding Logs, Events, Traces, and Spans**  
_The path to instrumenting with OpenTelemetry_medium.com](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172 "https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172")[](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172)

[**Unpacking Observability: The Observability Stack**  
_Putting together a simple, yet effective OpenTelemetry-centric Observability stack_storiesfromtheherd.com](https://storiesfromtheherd.com/unpacking-observability-the-observability-stack-93d4733e2a72 "https://storiesfromtheherd.com/unpacking-observability-the-observability-stack-93d4733e2a72")[](https://storiesfromtheherd.com/unpacking-observability-the-observability-stack-93d4733e2a72)

[**Just-in-Time Nomad: Running the OpenTelemetry Collector on Hashicorp Nomad with HashiQube**  
_An in-depth look into the Nomad OTel Collector jobspec using Traefik as a load balancer and pulling API keys from Vault_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382 "https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382")[](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382)

[**Fix Disjointed Traces with Context Propagation**  
_Connecting an OTel-Instrumented Service to a Service Instrumented with Datadog Tracing Libraries_storiesfromtheherd.com](https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0 "https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0")[](https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0)

[**OpenTelemetry: Hands-on Instrumentation**  
_How to Instrument Golang code with OpenTelemetry_storiesfromtheherd.com](https://storiesfromtheherd.com/opentelemetry-hands-on-instrumentation-f1b423c323c0 "https://storiesfromtheherd.com/opentelemetry-hands-on-instrumentation-f1b423c323c0")[](https://storiesfromtheherd.com/opentelemetry-hands-on-instrumentation-f1b423c323c0)

### References

*   [Publish Events, Not Logs](https://t.co/dC0367N46i)
*   [Charity Majors — a Twitter thread of High-Cardinality & High Dimensionality](https://twitter.com/mipsytipsy/status/1491202856564981763?s=21)
*   [The Future of Observability with OpenTelemetry \[Book\]](https://www.oreilly.com/library/view/the-future-of/9781098118433/)

### Footnotes

\[1\] According to [New Relic’s John Withers](https://newrelic.com/blog/best-practices/why-observability-requires-high-cardinality-data): “High-cardinality data provides the necessary granularity and precision to isolate and identify the root cause, enabling you to pinpoint where and why an issue has occurred.”

By [Adriana Villela](https://medium.com/@adri-v) on [February 11, 2022](https://medium.com/p/707735953c75).

[Canonical link](https://medium.com/@adri-v/unpacking-observability-the-paradigm-shift-from-apm-to-observability-707735953c75)

Exported from [Medium](https://medium.com) on June 3, 2026.