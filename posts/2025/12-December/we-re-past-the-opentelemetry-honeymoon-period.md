---
title: "We’re past the OpenTelemetry “Honeymoon Period”"
slug: we-re-past-the-opentelemetry-honeymoon-period
description: "My wishlist for OpenTelemetry in 2026"
added: "Dec 12, 2025"
tags:
  - technical
  - opentelemetry
  - observability
  - thought-leadership
---



![Kinkaku-ji (Golden Pavilion) in Kyoto, Japan, a three-story Zen Buddhist temple with gold-leaf-covered upper floors, reflected in a tranquil pond and surrounded by lush greenery. A large tree trunk appears in the foreground, adding depth to the serene landscape.](https://cdn-images-1.medium.com/max/800/1*csBZbgPf1tUQ_Ig274WpAg.jpeg)

Kinkaku-ji (Golden Temple) in Kyoto, Japan. Photo by [Adriana Villela](https://bento.me/adrianamvillela).

Observability in 2025 is well-established. So is [OpenTelemetry (OTel)](https://opentelemetry.io). And while new people are being introduced to Observability and OTel all the time (yay!), as a whole, the industry is past the “Observability 101” and “OTel 101” phase. Organizations have started to make their systems more observable. Code is being instrumented. We’re gathering telemetry from our infrastructure. We’re doing The Thing!!

And so, as 2025 comes to a close, we’re seeing ourselves come out of that Observability and OpenTelemetry “honeymoon period”. We’ve gone from, “Observability is so cool! We we can use OpenTelemetry to help us…let’s figure out how!” to “Are we doing a good job of it?” And now, as organizations are maturing their Observability practice (and using OpenTelemetry), we’re starting to see some interesting problems:

*   Managing the cost of telemetry
*   Emitting good quality telemetry data
*   OTel Collector management

Allow me to elaborate.

### Managing the cost of telemetry

When you first start instrumenting your code, it’s tempting to want to instrument All The Things. But then you may run into a few problems.

#### Unwanted telemetry through zero-code instrumentation

The first one has to do with [zero-code (auto) instrumentation](https://opentelemetry.io/docs/zero-code/). Zero-code instrumentation lowers the barrier to entry for code instrumentation, because teams don’t need to actually touch application code to instrument it. It is magical BUT…it also means that you might end up with a TON of instrumentation that you probably don’t need. Plus, it’s not a cure-all. You still need to supplement it with [code-based (manual) instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/code-based/).

Zero-code instrumentation can not only create a ton of unwanted noise (translation: 💩) that you have to sift through, it can also cause your Observability bill to skyrocket. After all, you need to send that telemetry data _somewhere_, whether it’s to a self-hosted Observability backend in your public or private cloud, or to an Observability SaaS backend. Either way, you’re paying money to ingest the data. It adds up. 💰💰💰

Fortunately, OpenTelemetry provides us with mechanisms to suppress some of the noise of auto-instrumentation. If you’re curious, you can check out how to do it for [Java](https://opentelemetry.io/docs/zero-code/java/agent/disable/), [Python](https://github.com/open-telemetry/opentelemetry-python/pull/1461), [.NET](https://opentelemetry.io/docs/zero-code/dotnet/instrumentations/), and [NodeJS](https://opentelemetry.io/docs/zero-code/js/configuration/). Each language approaches things a bit differently, because, shocker, not all languages are the same. They each have their own nuances, meaning that this zero-code instrumentation stuff isn’t easy to make “universal” across all languages. There are a lot of moving parts. That being said, a girl can dream, can’t she? This leads me to my first wish…

**_Wish #1:_** _A more universal and simplified approach to granularly disable auto-instrumentation in OpenTelemetry._

#### Do you really need to ingest all those traces?

Another spot where your telemetry costs can skyrocket is with your traces. I am [a firm believer that traces are a first-class citizen of Observability](https://medium.com/faun/observability-mythbusters-observability-anti-patterns-2b3062405b54). They show you the overall picture of things. They help you understand how you get from A to B in your application. BUT…do you need to ingest ALL traces all the time? Even the ones that don’t result in errors?

Remember that the more data you send to your Observability back-end, the more it will cost you. Obviously you want to keep sending the meaningful data to your backend. But why send excess data that will just drive your costs up?

This is where [sampling](https://opentelemetry.io/docs/concepts/sampling/) comes into play. But if sampling solves the problem, then what am I complaining about? The problem is that many organizations aren’t well-versed in sampling. They either don’t do it, or don’t do it right. Maybe they’re not even aware that sampling is a thing. Or, if they are, they don’t have anyone with knowledge/experience to configure sampling in the OTel Collector.

Now, it turns out that some Observability backends already provide some out-of-the-box sampling, which makes life easier. Yay! Which leads me to my next wish…

**_Wish #2:_** _Pre-configured sampling “profiles” for the OTel Collector._

### Emitting good quality telemetry

Instrumenting your code == adding telemetry code to your code. There is such a thing as bad code, so it would stand to reason that there is also such a thing as poor instrumentation, which means…bad telemetry. If you have bad telemetry, it hampers your ability to ask meaningful questions, get useful answers, and act effectively on what you’ve learned. That is, it does not allow Observability to live up to its promise. (Shoutout to my good friend, [Hazel Weakly](https://hazelweakly.me), for a kick-ass [definition of Observability](https://hazelweakly.me/blog/redefining-observability/#:~:text=Observability%3A%20Hazel%27s%20Definition&text=Observability%20is%20the%20process%20through,%E2%80%93%20Hazel%20Weakly).)

So how do you get “good” telemetry? Fortunately, the quality of telemetry has made its way into the OTel conversation. A few years ago, [TraceTest](https://tracetest.com) (RIP 🪦) launched the [TraceTest Analyzer](https://tracetest.io/blog/tracetest-analyzer-identify-patterns-and-issues-with-code-instrumentation), which examined your OTel instrumentation and provided score on the quality of your telemetry. Even though TraceTest is no longer with us, they were on to something.

This year, longtime OTel contributors [Juraci Paixão Kröhling](https://www.linkedin.com/in/jpkroehling/) and [Yuri Oliveira](https://www.linkedin.com/in/yurioliveirasa/), saw value in investing in the quality of telemetry, and launched the startup [OllyGarden](https://ollygarden.com), to focus on this, among other things.

And OllyGarden has taken things a step further, by creating an instrumentation quality standard with the launch of [Instrumentation Score](https://instrumentation-score.com) in [collaboration with Dash0](https://www.linkedin.com/posts/dash0hq_introducing-the-instrumentation-score-activity-7338479835981217792-FSvP). But wait! There’s more! They have also started an [#instrumentation-score](https://cloud-native.slack.com/archives/C090FEG5R0F) channel on [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf), collaborating with [OTel Semantic Conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/) folks and others.

> **✨ NOTE:** Check out Juraci’s [talk on instrumentation score](https://youtu.be/kdzeUiMI_t4?si=B5Q3k3R6wyp_8oUJ) with the OTel End User SIG’s [Dan Gomez Blanco](https://www.linkedin.com/in/danielgblanco86/) from this year’s KubeCon North America.

I’m really excited to see where this is going. Instrumentation quality is so important, and the more we make it a part of the conversation, the more we can make good on the promise of Observability. So for my next wish…

**_Wish #3:_** _More vendors incorporating telemetry quality into their products, adopting instrumentation score, and contributing to the Instrumentation Score standard._

### OTel Collector management

I’m a huge fan of the [OTel Collector](https://github.com/open-telemetry/opentelemetry-collector). Now, as organizations continue to embrace and expand the use OpenTelemetry, they’ll likely start deploying more Collectors. Which means that they’ll eventually run into management and scaling issues.

Fortunately, there is a way!

#### The OTel Operator

If your organization is deploying the Collector in Kubernetes, the [OTel Operator](https://adri-v.medium.com/list/opentelemetry-operator-0ee6378d630a) is great for managing the deployment and configuration of the Collector.

Unfortunately, if you’re an earlier adopter of the Collector, chances are that you’re not using the Operator. And the thought of switching to the Operator to manage the deployment of your Collectors in Kubernetes may be downright stressful. Which leads to my next wish…

**_Wish #4:_** _Tooling for organizations to migrate their Collectors deployed to Kubernetes to OTel Operator-managed Collectors._

#### OpAMP

OpenTelemetry introduced the [Open Agent Management Protocol (OpAMP)](https://opentelemetry.io/docs/specs/opamp/) (not to be mixed up with the concept of [OpAmp in electrical engineering](https://en.wikipedia.org/wiki/Operational_amplifier) — this one kinda messed with me) as a means for managing fleets of OTel Collectors. And bonus: the OTel Operator even supports OpAMP!

Pre-OpAMP, some organizations may have come up with their own way of managing fleets of Collectors. Maybe it’s not perfect, but it works.

After OpAMP came out, you might think that these organizations would jump at using OpAMP instead of their home-grown solutions. Unfortunately, [using OpAMP involves a bit of a learning curve](https://getlawrence.com/blog/OpenTelemetry-OpAMP--Getting-Started-Guide), which might not make it super attractive for organizations to adopt it, causing them to stick with their home-grown solutions for managing fleets of Collectors.

Which is why [Bindplane](https://bindplane.com/solutions)’s aptly-named Bindplane product provides an interface on top of OpAMP to simplify fleet management. This leads to my final wish…

**_Wish #5:_** _A simple, bare-bones abstraction layer for setting up and using OpAMP, to increase adoption._

### Final thoughts

If there’s one thing that all of my wishes have in common, it’s this: we crave abstraction. OTel has a lot of moving parts. It has a lot of really cool components which take time to learn, along with tons of terminology which isn’t familiar to everyone. It can be overwhelming. If we could simplify implementation, we could increase adoption even further.

Fortunately, the good folks working on OpenTelemetry are well aware of this, and are hard at work on many initiatives. These include the [OpenTelemetry Injector](https://github.com/open-telemetry/opentelemetry-injector) for simplifying auto-instrumentation and environment variable configuration. There’s also [OpenTelemetry Weaver](https://github.com/open-telemetry/weaver), which provides a framework for creating semantic convention schemas and validating semantic conventions against these schemas, which even intersects with the work around instrumentation score that I mentioned earlier.

Things are happening!

But hey, at the end of the day, all this is part of the “growing pains” related to Observability and OpenTelemetry adoption. The more we follow a practice and use a technology, the more we start seeing these types of problems. It’s a part of the process of growing up. And part of the process also involves looking for ways to evolve and improve. I can’t wait to see what’s in store for OpenTelemetry in 2026, and who knows…maybe my wishes will come true!

And now I’ll leave you with a photo of my lovely baby rats, Duckie and Penny.

![Two rats inside a glass enclosure. A white rat in the foreground is holding and eating food. A darker rat is partially inside a chewed cardboard box filled with shredded paper. The enclosure floor is covered with colorful bedding in shades of blue, purple, and green.](https://cdn-images-1.medium.com/max/800/1*-5ZlhC-Gu9C3Z6DjVeNLRQ.jpeg)

New baby rats to keep Barbie company. Meet Penny (top), and Duckie (front/bottom). Photo by Adriana [Villela](https://bento.me/adrianamvillela).

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [December 12, 2025](https://medium.com/p/38e363ad3c88).

[Canonical link](https://medium.com/@adri-v/were-past-the-opentelemetry-honeymoon-period-38e363ad3c88)

Exported from [Medium](https://medium.com) on June 3, 2026.