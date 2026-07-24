---
title: "Unpacking Observability: A Beginner’s Guide"
slug: unpacking-observability-a-beginner-s-guide
description: "A beginner’s guide to understsanding Observability, why it matters, and how you can get started."
added: "Jul 05, 2021"
tags:
  - technical
  - opentelemetry
  - observability
---

# Unpacking Observability: A Beginner’s Guide

![The graphic shows a child standing on a box peering through a telescope and observing the stars. The background is a dark shade of “Tucows Blue” and they are resting on a yellow line graphic that looks like a platform/diving board.](https://cdn-images-1.medium.com/max/800/1*GqJdmknBAPtN4oC0o-_tTg.png)

### Picture This

Sandy’s company has a high-profile flagship application. The development team has deployed a microservice to Prod. A few hours after the deployment, the company’s Twitter feed is flooded with angry Tweets from users. The anger spreads to the company’s Facebook page too. The app is acting really weird. It’s not an issue that’s been seen before, so none of the usual alerts get triggered. Sandy is on-call, and therefore gets paged to look into this issue. Sandy starts troubleshooting.

The company doesn’t have Observability practices and tooling in place, so to troubleshoot, they need to SSH into various machines to look at logs. Application logs. Database logs. App server logs. Thingamawutchit logs. If it has a log, you want to look at it. _Anything_ that can give you a clue as to what’s causing that performance issue.

It takes 2 gruelling and stressful hours, with management breathing down their neck for much of that time, but Sandy finally connects the dots together to figure out the underlying problem. These types of things keep happening, and it’s burning them and their team out. Sandy is too old to be dealing with this much stress, this often.

**There has _got_ to be a better way…**

### A Better Way

Sandy’s company has a high-profile flagship application. The development team has deployed a microservice to Prod. The company has Observability practices and tooling in place, so right after deployment, they check the app’s health by logging into the Observability tool. Sandy has gone into the system enough times to know what normal looks like, and right away, they notice that something looks out of place. They do a bit of digging, and within 10 minutes, they find the culprit. Damn. That was a weird use case, and if left unchecked, the company would’ve ended up with a _lot_ of unhappy users in a few hours’ time.

In the first scenario, Sandy relied on old practices and tooling to troubleshoot an issue in Prod. In the second scenario, Sandy relied on Observability practices and tooling to troubleshoot the same issue in Prod.

How did Observability help Sandy?

*   **It allowed Sandy to be proactive.** Because Sandy knew what a healthy system looked like, they were able to identify a prod issue before it got to the company’s customers.
*   **It enabled Sandy to troubleshoot quickly.** Sandy had never encountered this particular issue before, but having proper instrumentation in place enabled them to quickly identify the culprit.
*   **It gave Sandy their sanity back!** On-call doesn’t have to be a horribly stressful experience if you have Observability on your side!

Great…so how do we achieve this Observability Nirvana? Read on, my friend!

![The image shows an adorable hand drawn cow looking though a telescope right at the reader. The cow is white with brown spots and the background is a cool teal.](https://cdn-images-1.medium.com/max/800/1*LyzUnNxwRZQQOQFHoeMgkA@2x.jpeg)

Image by Hannah Maxwell

### What is Observability?

Observability (or **_o11y_**, for short) is a paradigm shift. Much of the literature out there talks about Observability in terms of the so-called “Three Pillars”: logs, metrics, and traces.

That’s hogwash. Are you telling me that if I have these three things in place, then I will have Observability? Ummm…no! That’s like saying, “If I have a CI/CD pipeline, I have DevOps!”, or, “If I have automation, I have DevOps!” Outlandish, isn’t it?

Okay, so if we shouldn’t talk about Observability in terms of the Three Pillars, then what in the Milky Way _is_ Observability? Glad you asked!

The quote below from [Charity Majors](https://twitter.com/mipsytipsy?lang=en) in [o11ycast Episode 1 (27:28)](https://www.heavybit.com/library/podcasts/o11ycast/ep-1-monitoring-vs-observability/) is one of my favourite explanations of Observability:

> “You can understand the inner workings of a system \[…\] by asking questions from the outside \[…\], without having to ship new code every time. It’s easy to ship new code to answer a specific question that you found that you need to ask. But instrumenting so that you can ask _any_ question and understand any answer is both an art and a science, and your system is observable when you can ask any question of your system and understand the results without having to SSH into a machine.”

In a nutshell, **Observability lets you easily deal with unknown unknowns**. To help achieve this, you must instrument your code properly. If you instrument your code properly, you don’t need to keep adding log lines (and therefore redeploying your code) every time there is an issue, just to figure out what’s happening in Prod. You should also not be SSHing into a machine as a first line of defence. That should be your very last resort.

### Observability Best Practices

Observability is a real paradigm shift, and it takes a while to wrap your head around it, so don’t expect to do it perfectly right out of the gate. Like all new things, it’s an iterative process, and there will be some failures. But we learn best from failure, right? So don’t be hard on yourself. Start with some of the guidelines below to help you succeed in your Observability journey.

#### Focus on Observability-Driven Development (ODD)

Just like Test-Driven Development (TDD) puts an emphasis on writing unit tests as you write code, Observability-Driven Development puts an emphasis on instrumenting as you code. Get your developers in the habit of instrumenting as they code.

What about older codebases? No problem! Go back and instrument the heck out of them. As a starting point, focus on your pain points, and start by instrumenting stuff that’s broken.

#### Instrument, instrument, instrument!

Instrumenting your code is super-important if you want to practice ODD. Getting your instrumentation right is also important. While it might require some tweaking as you go along, here are some guidelines that you and your team can follow when instrumenting code:

*   **Focus on Traces and Spans.** A [**Span**](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172) is the work being done during an operation’s execution, which happens over a period of time. Spans contain **Events**, structured (JSON) logs which describe single-point-in-time occurrences during that timeframe. A [**Trace**](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172) is made up of a tree of Spans, and gives you a holistic view of your system.
*   **Events should be wide.** This means that you should send as much info in one log line, rather than break it up into many log lines. “Measure everything, and figure out what matters later.” ([o11ycast, Episode 18, 18:03](https://www.heavybit.com/library/podcasts/o11ycast/ep-18-real-user-monitoring-with-michael-hood-of-optimizely/))
*   **Traces should be deep.** As stated in the [Guide to Achieving Observability](https://www.honeycomb.io/guide-achieving-observability/), “Tracing shows the relationships among various services and pieces in a distributed system, and tying them together helps give a more holistic view of what’s happening in production.”
*   **Instrument the stuff that’s broken first.** Wouldn’t you want to tackle the lowest-hanging fruit first? No, you wouldn’t. Because the lowest-hanging fruit isn’t the stuff that causes your SREs to keep getting paged in the middle of the night. That’s not the stuff that makes your customers send you angry Tweets and Facebook messages.

What should we use to instrument our code? I highly recommend looking into [OpenTelemetry](https://opentelemetry.io/). It is an open-source framework for instrumenting code, and many of the major Observability vendors support it. It’s vendor-agnostic, so if you choose to switch Observability vendors, you won’t be royally screwed.

#### Know what “Normal” looks like in Prod

As we saw in the second scenario of our use case, Sandy checked the Observability tool right after the app was deployed to Prod. In doing so, they were able to identify an issue before it became catastrophic. Rule of thumb: When you deploy your code to prod, look at it. Don’t wait for bad things to happen.

Now, you might be thinking, “why should I need to check the system for ‘normal’? Aren’t there tools out there that do that for me?”

As [Charity Majors](https://twitter.com/mipsytipsy?s=21) (co-founder of Observability tool [honeycomb.io](http://honeycomb.io)) puts it, “Any machine can find spikes in graphs, but only humans can say if it’s good, bad, or meaningful.”

Allow me to give you a real-life example. My husband is an SAP guru, and for one of his clients, he used to log on to the Prod system first thing in the morning for a few minutes to check the health of the system. I swear it looked like that scene in The Matrix where they’re looking through the screen with code streaming.

He knew that SAP system like the back of his hand, so he was able to notice right away when something was out of whack. As a result, he could identify issues _before_ they became a problem. Imagine how much time and money he saved the client because of his daily ritual!

![A gif that emulates the raining down text popularized in the Matrix. There are a mix of Chinese, Kanji, English, Symbolic and Numeric characters.](https://cdn-images-1.medium.com/max/800/0*4CZV4o-ErdduozG3)

[_By Jahobr — Own work, CC0_](https://commons.wikimedia.org/w/index.php?curid=63377056)

#### Get rid of the noise

I recently attended an Observability vendor presentation in which the vendor proudly boasted about a feature that filters through log noise. I was in utter shock, because my immediate thought was that _it’s catering to bad practices_. Observability is a paradigm shift, and as part of that, it requires refactoring logs so that you don’t need to query your log data. Is that easy to do? No. But nothing worth doing ever is.

Noisy logs are like noisy alerts. You end up with so many, that you don’t know what’s important anymore. And if you’re having to query your logs to sift through the noise, then it’s a big red flag indicating that you’re emitting garbage.

If you _do_ need to see some extra logs temporarily (e.g. you want to comb through your debug logs), I read about a great suggestion of using feature flags (via a tool like [LaunchDarkly](https://launchdarkly.com/)) to turn certain logging levels off and on as needed.

#### Choose the right tool for the job

There are many tools out there claiming to be “Observability tools”, but not all of them are. That’s why it’s important to choose the right one. I can’t tell you what tool to choose, but I can tell you that a good Observability tool will help answer the following questions:

*   Does the tool help you troubleshoot quickly, even if the person troubleshooting isn’t super familiar with the application and/or codebase?
*   How well does the tool do at answering questions you didn’t even know you had (i.e. unknown unknowns)?
*   Does the tool enable you to be proactive (i.e. does it help you identify things in Prod before they become an issue for your customers)?
*   Does the tool replace having to stitch a bunch of separate tools together to allow you to achieve Observability?

With that in mind, here are a few Observability tools that you may want to check out, while keeping the above questions in mind:

*   [honeycomb.io](https://www.honeycomb.io/)
*   [Lightstep](https://lightstep.com/)
*   [Datadog](https://www.datadoghq.com/)

If you’re wondering why there are no open source tools in the list, it’s because, at the time of this writing, as far as I know, none of the open source tools provide you with an all-in-one Observability solution. That said, please feel free to correct me if I’m wrong!

### Where do Monitoring, Alerting, and Metrics fit in?

#### Monitoring

According to the [Guide to Achieving Observability](https://www.honeycomb.io/guide-achieving-observability/), “Monitoring systems collect, aggregate, and analyze periodic metrics to systematically sift through known patterns that indicate failures might be occurring. Observability takes a different approach that allows you to identify new and unexpected failures.”

Again…those unknown unknowns following us around! Monitoring fails us when we hit a new and unexpected problem. It also fails us when we find ourselves in front of our fancy dashboards that tell us that everything is hunky-dory, and yet our customers are yelling at us. In short, Monitoring doesn’t exactly take a front seat in the world of Observability.

#### Alerting

Alerts are usually triggered when a certain threshold is reached. For example: low disk space, high CPU, high RAM. There will always be a need for alerts, but if we have too many alerts, it becomes overwhelming, and it becomes hard to tell what’s important and what’s not.

Since we’re already poking around in Prod regularly, we know what looks normal and what looks out of whack. Practicing Observability correctly therefore reduces the number of alerts that need to be set up. Reducing the number of alerts is a good thing, because it means that the alerts that you _do_ get are more meaningful, and are less likely to get ignored as “white noise” or cause stress. ([o11ycast Episode 17, 18:38](https://www.heavybit.com/library/podcasts/o11ycast/ep-17-leveling-up-software-delivery-with-pete-hodgson/))

#### Metrics

Metrics measure something. Which means you have to know what you’re measuring. Metrics require foresight into what’s going to happen later on. ([o11ycast Episode 18, 07:23](https://www.heavybit.com/library/podcasts/o11ycast/ep-18-real-user-monitoring-with-michael-hood-of-optimizely/)) In the world of Observability, we’re dealing with unknown unknowns, and therefore we don’t know what we’re measuring. Which means…hasta la vista, metrics!

> **Update: October 21st, 2022:** I would like to point out that since I initially wrote this blog post, I have evolved my position on metrics. Metrics ARE useful. They can give us information about things like CPU levels and the amount of time that it takes to complete a transaction. That said, Metrics without context won’t give us Observability.

### Final Thoughts

Observability is really hard to wrap your head around. I hope that this post has clarified some things around Observability for you. I have to admit that it was self-serving too. I’ve been taking a lot of notes on Observability lately, and I wanted to organize them into a cohesive narrative. 😊

What we’ve learned:

*   Observability helps us answer questions we didn’t even know we had (unknown unknowns).
*   Observability-Driven Development is the practice of instrumenting as you code.
*   When we instrument our code, we should focus on wide Events and deep Traces.
*   Check your Observability system often, so you know what “normal” looks like, and check your Observability system after you deploy to Prod, so that you can identify issues before they become problematic.
*   [OpenTelemetry](https://opentelemetry.io) is a great way to instrument your code, as it’s open-source and vendor agnostic.
*   Good Observability practices reduce your alerts to the meaningful ones only.

Fundamentally, Observability is a data problem, and capturing the right data will ensure a properly observable system.

One final quote to leave you with:

> “I can’t predict it, and I’m not even gonna try”

I shall now reward you with a picture of some cows chillin’ in France.

![An image showing a group of grazing cows. The main focus is a white cow with black spots looking directly at the reader, there are three more white cows standing on a grassy field at twilight.](https://cdn-images-1.medium.com/max/800/1*J3NxUKL01jiQekEyMbAaMw.jpeg)

Photo by [Stijn te Strake](https://unsplash.com/@stijntestrake?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/cows-grazing?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### More from Unpacking Observability

Check out my guest spot on [o11ycast](https://www.heavybit.com/library/podcasts/o11ycast) as I talk about Tucows’ Observability journey!

[**O11ycast | Ep. #48, Mastering Migrations with Adriana Villela of Tucows | Heavybit**  
www.heavybit.com](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/ "https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/")[](https://www.heavybit.com/library/podcasts/o11ycast/ep-48-mastering-migrations-with-adriana-villela-of-tucows/)

Be sure to check out my follow-up posts on Observability:

[**Unpacking Observability: Understanding Logs, Events, Traces, and Spans**  
_The path to instrumenting with OpenTelemetry_medium.com](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172 "https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172")[](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172)

[**Unpacking Observability: The Observability Stack**  
_Putting together a simple, yet effective OpenTelemetry-centric Observability stack_adri-v.medium.com](https://adri-v.medium.com/unpacking-observability-the-observability-stack-93d4733e2a72 "https://adri-v.medium.com/unpacking-observability-the-observability-stack-93d4733e2a72")[](https://adri-v.medium.com/unpacking-observability-the-observability-stack-93d4733e2a72)

[**Unpacking Observability: The Path to OpenTelemetry**  
_How to roll out OpenTelemetry across your organization to achieve Observability vendor neutrality_adri-v.medium.com](https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4 "https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4")[](https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4)

[**Just-in-Time Nomad: Running the OpenTelemetry Collector on Hashicorp Nomad with HashiQube**  
_An in-depth look into the Nomad OTel Collector jobspec using Traefik as a load balancer and pulling API keys from Vault_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382 "https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382")[](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382)

### References & Resources

*   [Observability Engineering (Early Preview from O’Reilly)](https://info.honeycomb.io/observability-engineering-oreilly-book-preview)
*   [Achieving Observability (Honeycomb whitepaper)](https://www.honeycomb.io/guide-achieving-observability/)
*   [o11ycast Podcast](https://www.heavybit.com/library/podcasts/o11ycast/)
*   [OpenTelemetry](https://opentelemetry.io)
*   [The Anatomy of Observability (Lightstep)](http://mkto-sj240115.com/MjYwLUtHTS00NzIAAAF-Y_8DSMs5A38WdjsqREvZ9NQdxcq9ulQ7vfFjEUnkgNZgP_3rE4iSLfNWOqlv17N-UCEImF4=)

> **Disclaimer:** _Most of the material that I reference in this post comes from_ [_Charity Majors_](https://twitter.com/mipsytipsy?lang=en)_,_ [_honeycomb.io_](http://honeycomb.io/)_, and the_ [_o11ycast podcast_](https://www.heavybit.com/library/podcasts/o11ycast/) _(also affiliated with Charity and honeycomb.io). I am by no means promoting honeycomb.io (and most definitely don’t get paid to do so). I cite these sources because what they say really resonates with me, and quite frankly, makes a heck of a lot of sense._

By [Adriana Villela](https://medium.com/@adri-v) on [July 5, 2021](https://medium.com/p/833258a0591f).

[Canonical link](https://medium.com/@adri-v/unpacking-observability-a-beginners-guide-833258a0591f)

Exported from [Medium](https://medium.com) on June 3, 2026.