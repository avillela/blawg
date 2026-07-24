---
title: "Unpacking Observability: The Path to OpenTelemetry"
slug: unpacking-observability-the-path-to-opentelemetry
description: "How to roll out OpenTelemetry across your organization to achieve Observability vendor neutrality"
added: "Dec 01, 2021"
tags:
  - technical
  - opentelemetry
  - observability
  - thought-leadership
---


![A graphic with a person in a suit scrastching their heads at which direction to take next based on three directional arrows pointing north, east and west. It is meant to expemplify the pathfinding theme of this article.](https://cdn-images-1.medium.com/max/800/1*onbtAk9Jeo9zEIsddb8KHQ.png)

If you’re new to the [Unpacking Observability](https://adri-v.medium.com/list/unpacking-observability-be1835c6dd23) series, welcome! If you’ve been following along from the start, thanks for tagging along for the ride!

> **Observability Recap:** _Observability lets us understand a system from the outside, by letting us ask questions, without knowing the inner workings of that system. Observability allows us to easily troubleshoot and handle novel problems (i.e. “unknown unknowns”). ✅_

> **OTel Recap:** _OpenTelemetry is a vendor-neutral framework for instrumenting, generating, collecting, and exporting telemetry data (traces, metrics, and even_ [_ugh…logs_](https://medium.com/lightstephq/why-tracing-might-replace-almost-all-logging-790c7d7c5c2c)_). ✅_

If you recall from my post on the [Observability stack](https://storiesfromtheherd.com/unpacking-observability-the-observability-stack-93d4733e2a72), my goal is to have an OpenTelemetry-centric (OTel) company-wide setup that feeds data to an Observability vendor by way of the [OTel Collector](https://opentelemetry.io/docs/collector/). Here’s a picture of my stack.

![Diagram of an OTel-centric rollout. Includes OTel Collector agents feeding into an OTel Collector gateway, which sends telemetry data to Datadog, Honeycomb, Lightstep, and Loki.](https://cdn-images-1.medium.com/max/800/1*_e4C5GZXNZZS71OUvlLtnw.png)

With this OTel-centric Observability stack, you can feed instrumentation data to any of these lovely o11y vendors (and more). Diagram by [Adri V](https://adri-v.medium.com/)

I’ve got 4 different Observability back-ends there to show you that with OTel, you could absolutely send telemetry data to all 4 at once!

Okay…so you now have an OTel-centric Observability stack…NOW WHAT?

Now it’s time to figure out how to roll out OpenTelemetry to your organization. Great! HOW? Not to worry, friends…I’ve got your back.

Let’s get started, shall we?

### Recon Time!

Before you can roll out OTel to your organization, you must first do a bit of recon work. It starts with understanding your landscape. You need to answer the following questions:

#### 1- What language(s) is your code written in?

Chances are that you probably have multiple services. For each service, you need to know what language it’s written in, so that you can determine what OTel instrumentation library (or libraries) your dev teams need to use. Also take inventory of any frameworks and libraries that you’re using (e.g. [Python Django](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-django), [Java Hibernate](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/hibernate)), since OTel auto-instrumentation is available for a TON of popular libraries and frameworks out there. Just import the libraries and your code is automatically instrumented with Opentelemetry and start generating useful telemetry data. Boom. 💥

For a list of OTel instrumentation libraries, check out the [OpenTelemetry Registry](https://opentelemetry.io/registry/).

#### 2- Is your application code instrumented?

If you answered “yes” to this question, then it means that your code is using some sort of tracing library. For each service, find out:

*   Is it instrumented?
*   If yes, what instrumentation library is being used?

If your code is using tracing libraries, it’s important to find out what libraries are being used.

You might be using vendor tracing libraries such as the [NewRelic Trace API](https://docs.newrelic.com/docs/distributed-tracing/trace-api/introduction-trace-api/), the [Datadog Tracing Library](https://docs.datadoghq.com/tracing/setup_overview/), [Zipkin Libraries](https://zipkin.io/pages/tracers_instrumentation), or even soon-to-be-retired [Honeycomb Beelines](https://docs.honeycomb.io/getting-data-in/beelines/). It’s important to know these things because, for example, Beelines [is being retired](https://www.honeycomb.io/blog/all-in-on-opentelemetry/), so you might want to take action and OTel your code.

Maybe your code is using the [OpenTracing API](https://opentracing.io/). When we were taking inventory of our instrumentation landscape, we had been told that one of our app teams had been using [OpenTelemetry](http://opentelemetry.io/). I was sooooo excited…until I asked them to send me a snippet of their code. Turns out that the team was using the [OpenTracing API](https://opentracing.io/) with a vendor tracing library instead, and thought that it was the same as [OpenTelemetry](http://opentelemetry.io/).

**For the record:** [OpenTracing](http://opentracing.io/) != [OpenTelemetry](http://opentelemetry.io/). In 2019, [OpenTracing](http://opentracing.io/) and [OpenCensus](https://opencensus.io/) were merged to form [OpenTelemetry](http://opentelemetry.io). Bottom line: Use OpenTelemetry.

As part of your recon work, you might be surprised to find out that Service A may be using say, the Datadog tracing libraries, while Service B may be using the OpenTracing API.

> **Note:** [_OpenTracing_](http://opentracing.io/) _itself doesn’t have any tracing libraries. The OpenTracing API is used to plug into other tracing libraries (e.g._ [_Zipkin_](https://zipkin.io/pages/tracers_instrumentation)_,_ [_Datadog_](https://docs.datadoghq.com/tracing/setup_overview/)_)._

Now…If you’re not sending trace data to an Observability vendor, then great…because it means that you can go back and instrument all of your code with OpenTelemetry.

> **Note:** _I am under no illusion that “going back and instrumenting your code with OpenTelemetry” is a trivial task. First, it involves learning OTel, and second, it means convincing The Powers That Be that this is a necessary task. No easy feat, but ABSOLUTELY WORTH IT in the long-run._

#### 3- What are your metrics sources?

Along with your app tracing data, you most likely want to send metrics data to your Observability back-end too, so that you have that nice holistic system view. You need to identify what your metrics sources are. Kubernetes? Kafka? Docker? Nomad? VMs?

Now that you understand your landscape, it’s time to plan your rollout.

![Lamp post with a red stencil of a right hand, and a white heart outline superimposed on it](https://cdn-images-1.medium.com/max/800/1*TDHZdk-0vxRY86abyftDKA.png)

Photo by [Adri V](https://adri-v.medium.com)

### OTel Rollout Plan

My rollout plan was inspired by [Ted Young](https://medium.com/u/62653f8839a6)’s post, [Deployment Strategies for OpenTelemetry](https://lightstep.com/blog/deployment-strategies-for-opentelemetry/). It gave me a great starting point. I highly recommend that you check it out if you’re considering an OTel rollout for your org. Armed with that as my starting point, I crafted my plan. Here goes!

#### 1- Collector rollout

If you refer back to my lovely Observability Stack diagram earlier in this post, you’ll notice that the [OTel Collector](https://opentelemetry.io/docs/collector/getting-started/) is the star of the show. As it should be. The OTel Collector is a vendor-neutral agent which ingests instrumentation and metrics data, transforms the data (if you wish), and then sends the data out to one or more Observability back-ends. Which means that _all roads lead to the OTel Collector_. It also means that the OTel Collector needs to be the first thing that y’all roll out.

The Collector can be deployed as a [Gateway](https://opentelemetry.io/docs/collector/getting-started/#gateway) or as an [Agent](https://opentelemetry.io/docs/collector/getting-started/#agent). I recommend deploying it as a Gateway at a minimum. This allows you to deploy a cluster of Collectors (good for scaling!), and ensures that telemetry from all your apps and infrastructure flow through this one central point before their final stop at Observability Vendorville.

Once you get more comfortable with the Collector, you can start looking at deploying some OTel Collector Agents. These can run as an app sidecar, or binary on your host, for example. These will have the added benefit to applying any app-specific processors, before feeding data into the OTel Collector Mothership (i.e. the Gateway).

I’d say that most orgs out there are using some sort of [container orchestrator](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1), so you probably want to run the OTel Collector Gateway on your fave container orchestrator.

For you Kubernetes peeps out there, you can run the OTel Collector in Kubernetes by way of the handy-dandy [OTel Collector Kubernetes Operator](https://github.com/open-telemetry/opentelemetry-operator). _Disclaimer: I haven’t tried it out for myself, but it is part of the_ [_open-telemetry GitHub org_](https://github.com/open-telemetry?q=&type=&language=&sort=)_, so it’s legit._

For you Nomad peeps, I’ve got a handy-dandy tutorial on how to deploy the OTel Collector on Nomad [here](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382).

#### 2- Metrics rollout

With the OTel Collector in place, you can start ingesting data. An easy place to start is with metrics collection. You can use the Collector’s own [hostmetricsreceiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver), which can capture traditional host metrics (e.g. memory, disk, CPU) in the native [OpenTelemetry Protocol](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md) (OTLP) metrics format. The OTel Collector also has receivers for ingesting metrics in [statsd](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/statsdreceiver), [Prometheus](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver), and other formats. It’s just a matter of identifying where you want to capture your metrics from, and what format they use.

#### 3- Instrumentation rollout

In a perfect world, we’d be dealing with greenfield applications and everyone would be instrumenting their code with OTel. But this ain’t La-la Land, so we’ve gotta deal. And to deal, we must take a multi-phase approach to instrumentation.

**Phase 1: Instrument all _net-new services_ with OpenTelemetry**

Since we’ve identified all of the languages and frameworks that we use during our recon phase, and that comes in super handy here, because we can go to the OTel GitHub repo to find some implementation examples.

That’s all well and good, but what about code that’s already instrumented? Excellent question!

**Phase 2a: Deal with OpenTracing-instrumented code**

If you have code is instrumented using [OpenTracing](https://opentracing.io/), you’re in luck, because, according to [this blog post from Lightstep](https://opentelemetry.lightstep.com/migrating-from-opentracing/), “Each OpenTelemetry SDK comes with an **OpenTracing shim** which creates a bridge from the OpenTracing API to the OpenTelemetry API. Enabling this shim will connect the new SDK to your existing instrumentation.” This means that you don’t have to re-instrument your code if it uses OpenTracing. Woo hoo!!

But before you pop the champagne and celebrate, y’all must be aware of the fact that these bridges between OpenTracing and OTel aren’t available for all languages yet. For example, if you have Ruby code instrumented with OpenTracing, there’s a [GitHub issue](https://github.com/open-telemetry/opentelemetry-ruby/issues/91) logged for an OpenTracing compatibility shim, but there hasn’t been much action around it. It doesn’t mean that it won’t happen. It just means that it hasn’t happened yet.

Sooo…if your language doesn’t have an OpenTracing compatibility shim, you’ve got a few options:

*   Reinstrument your code using OTel
*   Pray that the bridge to your language will be ready soon (miracles sometimes happen)
*   Work on the bridge that’s missing for your org, and contribute it to OpenTelemetry

**Phase 2b: Deal with vendor tracing library-instrumented code**

This one gets a bit tricky, but it’s not all bad news. For example, if your code is instrumented with the [Datadog Tracing Librar](https://docs.datadoghq.com/tracing/setup_overview/)y, a kind soul has gone ahead and written a [Datadog Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/5836) for the OTel Collector. This means if your application code has been instrumented with Datadog Tracing Library, you can pipe it through the OTel Collector. Yessss! Fair warning that the pull request (PR) is still being reviewed, so it’s not part of OTel yet. But, it doesn’t stop you from trying it out yourself.

What about if you use another Observability vendor and their proprietary libraries? Well…you (and/or your team) could write your own receiver and contribute it back to OTel! OTel Collector components (receivers, processors, exporters) are written in Golang, so you would need Golang expertise on your team.

The receiver needs to ingest data from a vendor’s own proprietary format. To determine what data format that vendor uses, I would suggest looking under the covers of the vendor’s OTel Collector exporter (assuming they don’t use [OTLP](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md)), since it converts telemetry data to their own format before shipping it off to them. For example, say you’re looking to create a Dynatrace receiver, check out the [Dynatrace exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/dynatraceexporter) to see what data format Dynatrace ingests. And to create the receiver itself, use the [Zipkin Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/zipkinreceiver) as a guide for creating your receiver.

Obviously this is all easier said than done, but it would probably be less effort than asking developers to re-instrument their code, and it would really help to get more folks using OpenTelemetry.

**Phase 3: Instrument existing code using OTel**

As I said before, if you’ve got code instrumented using OpenTracing, then you’re good to go (as long as you’ve got that OpenTracing bridge for your language). If you’re using a vendor tracing library, using/writing a receiver for that vendor is a great interim solution, but eventually y’all gotta put on your big kid pants and re-instrument your code with OTel.

Yeah, your developers will be mad at you for making them re-instrument their code, but since when was meaningful change ever pain-free? I am firmly convinced the OTel is _the_ way to go when it comes to sending telemetry data to an Observability vendor. It’s vendor-neutral, the major Observability vendors support it, and it’s becoming the industry standard. I’d like to jump on this train sooner rather than later.

Ted mentions [in his post](https://lightstep.com/blog/deployment-strategies-for-opentelemetry/) to start by identifying transactions in your code. Next, pick the high-value transactions to start with first. This makes a lot of sense to me. It allows you to take an iterative approach to instrumentation, and minimizes overwhelming teams.

> **Note:** _If you’re getting started with OTel app instrumentation, be sure to check out_ [_David Alfonzo_](https://medium.com/u/dc7fdf56954c)_’s tutorial on_ [_OTel Golang instrumentation_](https://dalfonzo.medium.com/opentelemetry-hands-on-instrumentation-f1b423c323c0)_._

#### 4- Dashboard redo

Booooo! Whyyyy??? Yup. Annoying, but true. But it makes sense when you think about it. As Ted states in [his post](https://lightstep.com/blog/deployment-strategies-for-opentelemetry/#progressively-migrate-all-of-your-applications-to-opentelemetry), “because the instrumentation has changed, the content of the data will be different — the keys and values will probably be slightly different. To account for this, you should clone your existing dashboards, then modify the duplicate dashboards to use the new OpenTelemetry data.”

#### 5- Team support

You can’t just tell folks that you’re rolling out OpenTelemetry without proper support. That’s just cruel, and will result in developers throwing their shoes at you.

My team and I are in charge of the OTel rollout for our org, and more generally, of Observability practices and standards. This does not mean, however, that we will be instrumenting code for other developers. That’s like asking us to rifle through your underwear drawer. Awkward. What we _are_ doing is putting together reference implementations for the languages used across the organization so that developers have actual working examples of OTel instrumentation. And at some point we are hoping to be able to share these with the greater OTel community. 💫

#### 6- Vendor Bake-off

Since you’re going the OTel route, it means that you can easily send telemetry data to multiple Observability back-ends _at the same time_. This is a great opportunity to run an Observability Vendor Bake-Off. That is, a side-by-side comparison of 2–3 Observability vendors to see which one better suits your needs. Many vendors will be happy to run a 3-month POC with you. I would highly recommend running a POC with 2–3 vendors, with 3–5 services sending telemetry data to all vendors so that you can compare them.

Keep in mind that this can be rather labour-intensive, as it requires learning 3 different vendor tools. That said, it’s a relatively small price to pay before investing in a longer-term contract with an Observability vendor.

![Two fall-themed cakes. The cake on the left has a ghost and a jack-o-lantern. The one on the right has a little pumpkin patch on top of it.](https://cdn-images-1.medium.com/max/800/1*E7ivZW85IKPyLO66QhXw8g.png)

Which cake to choose?? Photo by [Adri V](https://adri-v.medium.com). Cakes by [old\_fashion\_glazed](https://www.instagram.com/old_fashion_glazed/?hl=en).

### Conclusion

Rolling out OTel to your organization is HARD! For starters, it requires understanding your development landscape:

*   Finding out what languages, frameworks, and instrumentation libraries are being used
*   Figuring out what metrics you want to capture

And once you have that understanding, you need a rollout plan that takes into account:

*   Rolling out the OTel Collector, because that’s your centrepiece
*   Dealing with code instrumented with OpenTracing
*   Dealing with code instrumented with a proprietary vendor tracing library
*   Configuring metrics capture in the OTel Collector
*   Enabling developers to effectively use OpenTelemetry libraries

It’s a crap ton of work, but when it’s done, it will be G.L.O.R.I.O.U.S.

PS: I’m right in the middle of an OTel transformation too. Solidarity, yo!

Now, please enjoy this lovely yak picture.

![Photo of a yak sitting on grass.](https://cdn-images-1.medium.com/max/800/1*z6Z7pcyOYwAclh17xU8oGw.jpeg)

Photo by [Kai Winckler](https://unsplash.com/@visionofkai?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/yak?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

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

*   [Deployment Strategies for OpenTelemetry](https://lightstep.com/blog/deployment-strategies-for-opentelemetry/?utm_source=pocket_mylist)
*   [OpenTelemetry Registry](https://opentelemetry.io/registry/)
*   [OTel Collector Kubernetes Operator](https://github.com/open-telemetry/opentelemetry-operator)
*   [Migrating from OpenTracing](https://opentelemetry.lightstep.com/migrating-from-opentracing/)
*   [Ask Miss O11y: Mapping Out Your Observability Journey](https://www.honeycomb.io/blog/mapping-your-observability-journey/)

By [Adriana Villela](https://medium.com/@adri-v) on [December 1, 2021](https://medium.com/p/399f40fd8c4).

[Canonical link](https://medium.com/@adri-v/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4)

Exported from [Medium](https://medium.com) on June 3, 2026.