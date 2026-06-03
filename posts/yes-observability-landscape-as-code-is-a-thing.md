---
title: "Yes, Observability-Landscape-as-Code is a Thing"
slug: yes-observability-landscape-as-code-is-a-thing
description: "What’s an Observability Landscape, why should you care, and how can we codify it?"
added: "Jun 06, 2022"
tags:
  - technical
---

# Yes, Observability-Landscape-as-Code is a Thing

![Person walking under rail bridge in Toronto’s Junction neighbourhood.](https://cdn-images-1.medium.com/max/800/0*-SsIVYFkwtg0wf9n)

Person walking under rail bridge in Toronto’s Junction neighbourhood. Photo by [Adri Villela](https://adri-v.medium.com).

You might be thinking that this might be yet _another_ overloaded term to add to your Buzzword Bingo lineup. Maybe you’re rolling your eyes at me over Yet Another X-as-Code thing. Or maybe you want to hurl your shoe at your screen in frustration. But aren’t you the teeeeniest bit curious? I invite you to stick around to satisfy your curiosity before you pass judgment.

Take my (virtual) hand, and let’s jump in!

### Observability-Landscape-as-Code?? Wut?

[Observability](https://opentelemetry.io/docs/concepts/observability-primer/#what-is-observability) is about good practices. Good practices are useless unless you have a consistent landscape. In order to support these practices, there are a number of setup-y-type things that are required to enable teams to truly unlock Observability’s powers.

With so many integrations and moving parts, it can be hard to keep track of all the things that you need in order to achieve Observability greatness. This is where Observability-Landscape-as-Code (OLaC) can help. OLaC means **_supporting Observability by codifying your Observability landscape_** to ensure:

*   Consistency ✅
*   Maintainability ✅
*   Reproducibility ✅

Our Observability Landscape is made up of the following:

*   Application instrumentation
*   Collecting and storing application telemetry
*   An Observability back-end
*   A set of meaningful SLOs
*   An Incident Response system for alerting on-call Engineers

Observability-Landscape-as-Code makes this possible, through the following practices:

1.  Instrumenting your code with OpenTelemetry
2.  Codifying the deployment of the OTel Collector
3.  Using a [Terraform Provider](https://registry.terraform.io) to configure your Observability back-end
4.  Codifying SLOs using the vendor-neutral [OpenSLO specification](https://openslo.com)
5.  Using APIs to configure your Incident Management systems

Let’s dig a little deeper.

![Your Observability Landscape includes Application Instrumentation, Observability Back-end, Collecting & Storing Application Telemetry, Meaningful SLOs, Incident Response System.](https://cdn-images-1.medium.com/max/800/1*6nEP1B0E069ooWhilNYFJA.png)

Image by [Adri Villela](https://adri-v.medium.com).

### Instrument Your Code

The most logical place to start when defining your Observability landscape is with instrumenting your application. After all, without instrumentation, you can’t send anything to your Observability back-end, which means that there is no way in Space that your system can be Observable.

[OpenTelemetry](https://lightstep.com/blog/opentelemetry.io/docs) (OTel), the vendor-neutral open-source Observability framework, is the means by which applications are instrumented. OTel allows you to instrument code written in a number of [major programming languages](https://opentelemetry.io/docs/instrumentation).

But…what exactly should you instrument? According to [Ted Young](https://twitter.com/tedsuo), you should “add tracing to your frameworks and libraries, and try to keep it out of your application code as much as possible.”

But whyyyy??

Let’s break it down.

An application is typically made up of a combination of [frameworks](https://www.baeldung.com/cs/framework-vs-library#how-does-a-framework-work) and [libraries](https://www.baeldung.com/cs/framework-vs-library#how-does-a-library-works). Think of your application code as the glue that holds these frameworks and libraries together. The frameworks and libraries being used in an application can be a combination of home-grown and third-party offerings. If you instrument your home-grown frameworks and libraries, then you have all the coverage you need, as far as tracing is concerned.

![Application code is made up of a combination of libraries and frameworks (which themselves are made up of libraries).](https://cdn-images-1.medium.com/max/800/1*vsJzvMaNK5hiCiV0lg_D_g.png)

How frameworks and libraries fit in with application code. Source [here](https://www.baeldung.com/cs/framework-vs-library#how-does-a-framework-work).

Yes, technically you _could_ add [Spans](https://opentelemetry.io/docs/concepts/observability-primer/#spans) to your application code, but chances are you’ll get caught up copying and pasting Spans all over the place. And next thing you know, you’ve polluted your code with unnecessary Spans. Plus, if you decide somewhere down the line that you want to change up how you’re creating your Spans, chances are you’ll end up having to do some search and replace to fix stuff up, which all know can be messyyyyy.

That said, it is still useful to have your application code add [Events](https://opentelemetry.io/docs/concepts/signals/traces/#span-events) and Span [Attributes](https://opentelemetry.io/docs/concepts/signals/traces/#attributes) which are specific to that particular operation and would add value. This is how you model the actual business logic of your service! You just have to be selective.

As Ted cautions, “Spans are a structural element and it’s usually a smell if they end up mixed in with application code. In general, any instrumentation which gets repeated across many instances of application code, such as adding a \*\* `project_id` as an attribute, should get moved into a framework hook or a shared function of some kind."

Eeeee! That sounds a bit stressful, doesn’t it. And let’s face it…it’s a mighty tall order to tell developers to instrument all their framework and library (and _sometimes_ application) code, but it’s the only way that this Observability thing will really do right by you. But, DON’T PANIC. Here’s what you do:

1.  If you’re instrumenting previously-uninstrumented code, [focus on instrumenting your most important services first](https://lightstep.com/blog/deployment-strategies-for-opentelemetry), so that it feels less overwhelming.
2.  When working with net-new code, follow [Observability-Driven Development](https://lightstep.com/blog/observability-mythbusters-not-only-for-sre#tdd-tbt-and-oodoh-my) (ODD), whereby you instrument-as-you-code, instrumenting your code ends up being waaaay less overwhelming. Whew!

The idea is to add enough Traces and supporting data (including [Attributes](https://opentelemetry.io/docs/concepts/signals/traces/#attributes), [Span Events](https://lightstep.com/blog/observability-mythbusters-logs-and-metrics-arent-enough#myth-1-logs-are-good-enough) and [Metrics](https://lightstep.com/blog/observability-mythbusters-logs-and-metrics-arent-enough#myth-2-the-usefulness-of-metrics)) to your code, such that it can send enough data to your Observability back-end to allow developers and operators to troubleshoot issues quickly and effectively. Remember, we want to help them answer that nagging question of “Why is this happening?”

### Use the OTel Collector & Codify its Deployment

Congrats! You’ve instrumented your code! Your Observability Landscape is looking slick AF! Now, while [OTel’s instrumentation libraries](https://opentelemetry.io/docs/instrumentation) are used to instrument application code, we need another OTel goodie as part of our Landscape: the [OTel Collector](https://storiesfromtheherd.com/unpacking-observability-the-observability-stack-93d4733e2a72). The Collector is a vendor-neutral agent that ingests, transforms, and exports data to one or more Observability back-ends.

And in case you’re wondering, yes, you _could_ technically send data directly from your instrumented code to your desired Observability back-end sans Collector; however, this isn’t the best way to go about it. The Collector serves as a data pipeline which allows you to do things like mask, filter, transform, and append data before sending it to your Observability back-end. It can also ingest Metrics data from your infrastructure, like your [Prometheus-style metrics generated by your Hashi stack](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/prometheusreceiver) or [Kubernetes cluster metrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/k8sclusterreceiver).

![The OTel Collector is made up of receivers, processors, and exporters.](https://cdn-images-1.medium.com/max/800/1*7KsIdd-oJmKU9ATKVsDDGA.png)

The OTel Collector. Image by [Adri Villela](https://adri-v.medium.com).

Now, if you’re adding an OTel Collector to the mix, then it means that it needs to run _somewhere_. That somewhere can include [Kubernetes](https://opentelemetry.io/docs/collector/getting-started/#kubernetes), [Nomad](https://opentelemetry.io/docs/collector/getting-started/#nomad), or [Virtual Machines (VMs) as a binary](https://opentelemetry.io/docs/collector/getting-started/#linux-packaging). Regardless of where you deploy it, you will need some sort of Infrastructure-as-Code (IaC) thing to configure and deploy the Collector. Luckily, you can use IaC tools like trusty ‘ole [Terraform](https://www.terraform.io), superfly competitor [Pulumi](https://lightstep.com/blog/pulumi.com), oft-forgotten-yet-still-cool-kid [Ansible](https://lightstep.com/blog/ansible.com). Or heck, write your own custom scripts to do it. It’s up to you. Just. Codify. It.

### Codify Observability Back-End Configuration

Now we’ve covered application instrumentation and data transmission. Next we must tackle The Thing that Receives the Data. That is, your Observability back-end. Now, as with many-a-tool out there, Observability back-ends require some tweaking so that they work in a way that makes them useful to us. Such configurations can include creating [(non-sucky, meaningful) dashboards](https://charity.wtf/2021/08/09/notes-on-the-perfidy-of-dashboards), Slack integrations, or [saved queries for your Traces](https://docs.lightstep.com/docs/monitor-a-service-level-indicator-with-streams).

And wouldn’t you know it…it turns out that most of the cool kids in the Observability back-end game have [Terraform Providers](https://registry.terraform.io/browse/providers) that facilitate said configurations, including [Lighstep](https://registry.terraform.io/providers/lightstep/lightstep/latest/docs). If you don’t believe me, go to the [Terraform Providers search bar](https://registry.terraform.io/browse/providers) and enter an Observability back-end name. I dare you. MUAHAHAHAHAHA…

> **Note:** _As far as I know, there are no equivalents from Pulumi and Ansible (wink wink, nudge nudge), but please correct me if I’m wrong!_

Regardless of what Observability back-end you use, make sure that you use the heck out of your Observability back-end’s Terraform Provider to codify as much of that setup stuff as possible. That way, if you happen to bork your setup, you can always go back to your Terraform code. And remember: make sure that you resist the temptation to make tweaks to things on the UI that are supported by your Provider.

### Get your SLO game on, and Codify It!

If we take a step back and admire our Landscape, you’ll see that it now includes application instrumentation, sending data to our Observability back-end, and setting up our Observability back-end. And while we’re on our Observability back-end, let’s talk [Service-Level Objectives](https://opentelemetry.io/docs/concepts/observability-primer/#reliability--metrics) (SLOs).

If you’re an on-call Engineer, chances are you don’t want to get woken up by just any alert. If you get woken up, it had better be for a damn good reason. I once got woken up at 2am over a development environment alert by the [Network Operations Center](https://en.wikipedia.org/wiki/Network_operations_center) (NOC). Not fun. And not needed. Aaaand…because I was totally wired after being woken up, I had a really hard time getting back to sleep after that. Nobody wants to deal with unnecessary alerts.

Alerts are usually triggered when a certain threshold is reached. For example: low disk space, high CPU, high RAM. There will always be a need for alerts, but if we have too many alerts, it becomes overwhelming, and it becomes hard to tell what’s important and what’s not.

Good Observability practices dictate that we should only set up _meaningful_ alerts. Defining a small, yet meaningful number of alerts is a good thing, because it means that the alerts that you _do_ get are the really, _really_ important ones, and are less likely to get ignored as “white noise” or worse, cause wake you up when it wasn’t wake-up-worthy. [Service-Level Objectives](https://opentelemetry.io/docs/concepts/observability-primer/#reliability--metrics) (SLOs) can help with this, by helping us identify what data ingested by your Observability back-end are important and alert-worthy. SLOs connect telemetry with specific customer experiences, so that the entire organization can understand the relationship between the software system and the business goals.

If you really want to up your SLO game (and you definitely _should_), you need to define your [SLOs as code](https://www.businesswire.com/news/home/20220510005542/en/OpenSLO-Specification-Moves-to-Version-1.0). This is where [OpenSLO](https://github.com/OpenSLO/OpenSLO) comes to the rescue! Originally started up by [Nobl9](https://www.nobl9.com), [OpenSLO](https://github.com/OpenSLO/OpenSLO) is an open-source “specification for defining SLOs to enable a common, vendor-agnostic approach to tracking and interfacing with SLOs.” Super dope. Don’t you just love standardization? 💜

> _Although it’s outside of the scope of this post to dig deep into this topic, in case you’re curious, you can check out what an OpenSLO YAML definition looks like_ [_here_](https://github.com/slok/sloth/blob/main/examples/openslo-getting-started.yml)_._

### Use APIs for Incident Response Tool Configuration

As we saw above, SLOs trigger alerts that are actioned by on-call Engineers. These on-call Engineers are made aware of said alerts, courtesy of an Incident Response (IR) tool. Like our Observability back-end, IR tools require a bunch of configuration in order for them to be useful to us and to our teams.

Things you need to configure:

*   On-call team and contact information
*   On-call schedule
*   Call tree
*   Triggers (i.e. things that cause you go get paged)

Luckily, many IR tools have APIs that let you set up and configure them, in lieu of clickity-clicking through a UI. Choosing an incident management system with a robust API that lets you do all of the above through code ensures that there are no knowledge bottlenecks, as everyone in your team has access to config as code via a Git repo.

To put things into perspective, I will tell you a little story. At one of my previous workplaces, we used an incident management system that was beyond annoying to configure and understand. I swear that it was a relic of the Web of the early 2000s. There was no API. There was one guy who knew how it all worked, and luckily I made friends with him, because there is no way that I would’ve known how to configure the on-call schedule for my team. Unfortunately, he was the only guy who knew how the system worked, so if he was on vacation, and you needed to onboard a new team or team members, you were hosed.

### Putting it all together

Today we learned that OLaC isn’t just some bogus, buzzwordy, cringe-worthy term, but in fact refers to supporting Observability by codifying your Observability Landscape, thereby making it consistent, repeatable, and maintainable.

Observability-Landscape-as-Code makes this possible, through the following practices:

1.  **Instrumenting your code with OpenTelemetry**, following ODD to instrument your code as you go. ✅
2.  \*\*Codifying the deployment of the OTel Collector \*\*(to Nomad, Kubernetes, or a VM) using tools such as [Terraform](http://terraform.io), [Pulumi](http://pulumi.com), or [Ansible](http://ansible.com). The Collector funnels your OTel data to your Observability back-end. ✅
3.  **Using a** [**Terraform Provider**](https://registry.terraform.io) **to configure your Observability back-end.** Fortunately, most Observability back-ends, like [Lighstep](https://registry.terraform.io/providers/lightstep/lightstep/latest/docs), have their own Providers. ✅
4.  **Codifying SLOs using the vendor-neutral** [**OpenSLO specification**](https://openslo.com)**.** SLOs are important because they are the driving force behind alerts. SLO-based alerts ensure that on-call Engineers get meaningful, data-driven alerts. ✅
5.  **Using APIs to configure your Incident Management systems**, which are usually the conduit for paging on-call Engineers. Many incident management systems have APIs that can be used to configure the platform for your organization’s specific needs. This includes things like managing incidents and account settings. ✅

That, my friends, is how you have a kick-ass Observability Landscape.

Congrats! You made it! I will now reward you with a picture of my dearly departed rat, Susie.

![](https://cdn-images-1.medium.com/max/800/1*BSjYjbz3OPhQaRRQnwQqIA.jpeg)

Susie the fancy rat. Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. 🦄 🌈 💫

If you’d like to share stories of your Observability journey, or just ask Observability-related questions, hit me up on the [Lightstep Community Discord](https://ltstp.run/discord), or [get in touch by e-mail](mailto:devrel@lightstep.com). Hope to hear from y’all!

For more Observability articles, check out my Unpacking Observability series:

[**Unpacking Observability**  
_Stories to help you understand Observability and OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/be1835c6dd23 "https://adri-v.medium.com/list/be1835c6dd23")[](https://adri-v.medium.com/list/be1835c6dd23)

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code)_._

By [Adriana Villela](https://medium.com/@adri-v) on [June 6, 2022](https://medium.com/p/6c955c16b59).

[Canonical link](https://medium.com/@adri-v/yes-observability-landscape-as-code-is-a-thing-6c955c16b59)

Exported from [Medium](https://medium.com) on June 3, 2026.