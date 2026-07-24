---
title: "Demystifying Observability 2.0"
slug: demystifying-observability-2-0
description: "Fulfilling the promise of Observability"
added: "Jun 10, 2024"
tags:
  - technical
  - observability
  - opentelemetry
  - "2024"
---


![Peering down at a spiral staircase. Black and white photo](https://cdn-images-1.medium.com/max/800/1*YSePcjJVFrlbr1uzHRSTVA.png)

Staircase in the Sagrada Famiglia, Barcelona, Spain. Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

Our systems have gotten complex. Like _really_ complex. Organizations have mostly shifted from monoliths to microservices. They’ve embraced the Cloud, and with it, Kubernetes (PS: happy 10th b-day to Kubernetes!) and all sorts of other cloud native tools that help run the things that we’ve grown accustomed to having in our tech-dependent lives: access to government services, social media, airline booking, shopping, streaming services, and so on.

As our systems get more and more complex, engineers need a way to understand them when things go 💩, so that services can be restored in a timely manner.

Enter [Observability](https://adri-v.medium.com/list/unpacking-observability-be1835c6dd23), which helps with just that. Observability has been around for a while now, and it’s been really exciting to see so many organizations embarking on their respective observability journeys.

Now, if you’ve been following the interwebs, you may have heard some rumblings about **_Observability 2.0_**. Cool. But what is it _really_, and how does it differ from Observability 1.0? Well, you’ve come to the right place. Sit back, relax, and let me take you on a journey.

### Defining Observability

Before we get into Observability 1.0 vs 2.0, let’s start with a definition of Observability, also known as o11y to us folks who sometimes get lazy and don’t want to write out the whole word. 🙃 (For the uninitiated: o11y == the 11 letters between “o” and “y” in “Observability”.)

The “classic” definition of Observability comes from [control theory](https://en.wikipedia.org/wiki/Observability):

> Observability is a measure of how well internal states of a system can be inferred from knowledge of its external outputs.

> _– Rudolf E. Kálmán_

[This definition](https://hazelweakly.me/blog/redefining-observability/#observability:-control-theory) was popularized by [Charity Majors](https://x.com/mipsytipsy).

I love this definition, and I’ve used it for many years, including in my very [first blog post on Observability](https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f), and more recently, in my [O’Reilly Observability video course](https://learning.oreilly.com/videos/fundamentals-of-observability/0636920926597/).

That being said, there’s a refinement to the definition of Observability that I’ve been embracing of late, which was coined by my good friend, [Hazel Weakly](https://www.linkedin.com/in/hazelweakly/), who has an [amazing blog post on redefining Observability](https://hazelweakly.me/blog/redefining-observability). (Hazel is also incredibly smart and super astute and you should totally [follow her on LinkedIn](https://www.linkedin.com/in/hazelweakly/)):

> Observability is the process through which one develops the ability to ask meaningful questions, get useful answers, and act effectively on what you learn.

> _– Hazel Weakly_

It’s so simple, and so elegant, and I love it. Also, it applies to both Observability 1.0 and 2.0, and does not hold us back from continuing to refine Observability.

Okay, now that we’ve gotten the basics out of the way, let’s tackle this 1.0 vs. 2.0 business.

I set out to write this piece because I’ve found myself talking a lot about Observability 2.0 recently, including last week on [Whitney Lee’s Enlightning show](https://www.youtube.com/live/WiFoSr54kjM?si=5edzpyd33RKcp2te), and in an [upcoming episode of The Cloud Gambit](https://www.linkedin.com/posts/adrianavillela_observability-otel-bouldering-activity-7204876506731335680-ACL2). After all this talking about it, I wanted a place to jot down my thoughts, and to also share them with y’all. I honestly thought it would be a straight regurgitation of what I’d already said. But then I asked Hazel to look over this piece, and her feedback encouraged me to think about this further, thereby refining some of my understanding and thoughts around this. Which is awesome, because it’s so fitting, given that I’m talking about the evolution of our understanding of Observability!

![Lightboard summarizing Observability 1.0 and 2.0](https://cdn-images-1.medium.com/max/800/1*f6QgoK8Bt7R8cdUqVG2D6A.jpeg)

[Summary of Observability 1.0 vs 2.0 from my appearance on Enlightning with Whitney Lee.](https://www.youtube.com/watch?v=WiFoSr54kjM)

### Observability 1.0

When Observability burst onto the scene, it was still a very APM-dominated world. Many APM vendors, sensing that Observability was becoming an Actual Thing, pivoted to Observability. This pivot, however, was mostly in name only, in much the same way that many organizations pivoted from Ops to DevOps (or SRE or Platform Engineering) in name only. New name, but business as usual. And perhaps we can’t blame them for that. These are paradigm shifts and paradigm shifts are often hard to swallow. You’ve gotta start somewhere, and maybe a name change is as good a place as any.

So, time for the big reveal…**_Observability 1.0 is APM._** But more specifically, what is Observability 1.0? Observability 1.0 is focused on:

#### 1- Yow you operate your code

This means that it’s more of an Ops concern, and not so much of an Everyone concern.

#### 2- Known unknowns

Also known as “predicable shit happens”. We know the usual things that go wrong with our systems, and [we put dashboards in place to represent all of things that we know can go wrong with our systems](https://faun.pub/observability-mythbusters-observability-anti-patterns-2b3062405b54) (and for which we know the fixes), so that we can keep an eye on things if they go sideways.

#### 3- Multiple sources of truth

These “sources of truth” are [traces, metrics, and logs](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172), also known as “The Three Pillars”. I actually hate that term, because it implies that these things are siloed from one another (more on that later). I much prefer the term “signal”. A signal is anything that gives you data.

I suppose that the whole Three Pillars thing kind of makes sense for Observability 1.0, where traces, metrics, and logs were often not correlated. This is especially true since, in the early days of Observability, we didn’t really have a common language for even talking about these signals. Each vendor had their own standard, and that may or may not have included a way to correlate the three signals.

I also want to add that there was much more of an emphasis on logs and metrics, because that’s just something that developers and operators are familiar with. Traces have been around, but were not very widely used.

### Observability 2.0

So now that we know what Observability 1.0 is all about, let’s look at how it differs from Observability 2.0.

First things first. Credit where credit is due. The term “Observability 2.0” was coined by [Charity Majors](https://x.com/mipsytipsy). Observability 2.0 is the acknowledgment that Observability, like all things tech and non-tech, continues to evolve. The evolution to Observability 2.0 is the recognition that we made a decent stab at Observability (i.e. 1.0), but unfortunately, it didn’t really fulfill the promise of the definition of Observability that we saw earlier on. No problem, because things are constantly evolving.

So what makes Observability 2.0 different from 1.0? It has the following characteristics:

#### 1- It’s focused not only on how you operate your code, but also on how you develop your code

This means that Observability is part of the [systems development lifecycle (SDLC)](https://en.wikipedia.org/wiki/Systems_development_life_cycle), and is therefore a concern of developers, QAs, and SREs. How?

[**Developers instrument their code**](https://youtube.com/shorts/GIF61VCIqQI?feature=share) so that they can troubleshoot it during development. 🤯 Instrumentation is the process of adding code to software to generate telemetry signals for Observability purposes. Software engineers already rely on logging for troubleshooting (hello, “print” statements?), so why not add traces and metrics into the mix?

[**Liz Fong-Jones on On-Call Me Maybe**  
_Liz Fong-Jones on On-Call Me Maybe talking about the importance of instrumenting your own code. #observability…_youtube.com](https://youtube.com/shorts/GIF61VCIqQI "https://youtube.com/shorts/GIF61VCIqQI")[](https://youtube.com/shorts/GIF61VCIqQI)

**Quality Assurance (QA) analysts leverage instrumented code during testing**. When they encounter a bug, QAs can use telemetry data to enable them to troubleshoot code and file more detailed bug reports to developers. Or, if they’re unable to troubleshoot the code with the telemetry provided, it means that the system has not been sufficiently instrumented. Again, they go back to developers with that information so that developers can add more instrumentation to the code.

**QAs further take advantage of instrumented code by** [**creating trace-based tests**](https://thenewstack.io/trace-based-testing-the-next-step-in-observability/) **(TBT) for integration testing.** In a nutshell, TBT leverages traces to create integration tests. For anyone interested in seeing TBT in action, the [OpenTelemetry Demo leverages TBT](https://github.com/open-telemetry/opentelemetry-demo/tree/main/test) using the opens source version of [Tracetest](https://tracetest.io).

**SREs leverage instrumented code to create** [**service-level objectives (SLOs)**](https://thenewstack.io/translating-failures-into-service-level-objectives/). SLOs help us answer the question, “What is the reliability goal of this service?” SLO are based on [Service Level Indicators](https://youtu.be/Mgzt4bq0JU4?si=lXigHRUPmoiMtd7Q) (SLIs), which are themselves based on metrics. Metrics that were instrumented by your developer! 🤯 SREs can create alerts based on these SLOs, so that when an SLO is breached, they’re notified right away. Furthermore, since the SLO is ultimatley tied a metric (via an SLI), which was correlated to a trace (more on signal correlation shortly), the SRE knows where to start looking when an issue arises in production.

[**CI/CD pipelines are instrumented**](https://thenewstack.io/how-to-observe-your-ci-cd-pipelines-with-opentelemetry/)**.** CI/CD pipelines are the backbone of modern SDLC. They are responsible for packaging and delivering code to production in a timely manner. When they fail, we can’t get code into production, which means angry users. Nobody likes angry useres. Ever. Therefore, having observable CI/CD pipelines allows us to address pipeline failures in a more timely manner to help alleviate software delivery bottlenecks.

#### 2- It’s focused on unknown unknowns

Also known as “unpredictable shit happens”. Let’s face it, you can’t know every problem that there’s ever going to be. This is especially true in the world of microservices, where services interact with each other in such weird and unpredictable ways because…well, we users tend to use systems in very weird and unpredictable ways! 🤯 [Traditional dashboards can’t save you](https://faun.pub/observability-mythbusters-observability-anti-patterns-2b3062405b54), but [SLO-based alerts can](https://youtu.be/5maHQiElGgY?si=FF7ZO8QN6ivnt_BZ).

#### 3- It’s focused on a single source of truth: events

Wait…what? What about traces, metrics, and logs? Well, traces, metrics, and logs all types of _events_. An event is information about a thing that happened. They are structured (think JSON-like), and timestamped. **_Traces, metrics, and logs are therefore different types of events that serve different and important purposes, each contributing to the Observability story._** Furthermore, they’re all _correlated_. Instead of Three Pillars, they’re more like [the three strands that make up a braid](https://thenewstack.io/modern-observability-is-a-single-braid-of-data/) (shoutout to my teammate [Ted Young](https://twitter.com/tedsuo) for this analogy).

In addition, we now have a common standard for defining and correlating traces, metrics, and logs: [OpenTelemetry](https://opentelemetry.io). Most Observability vendors are all in on OpenTelemetry, which means that it has become the de-facto standard for instrumenting code (and also the second most popular CNCF project in terms of contributions 🎉). It also means that these vendors all ingest the same data, and it’s up to how those vendors render the data that differentiates them from one other.

I also want to add that in this Observability story, we place traces front and center, since they help give us that end-to-end picture of what happens when someone does a thing to a system, with metrics and logs serving as supporting actors which add useful details to that picture. And of course, everything correlated.

### Final thoughts

Observability has come a long way from its early days, and Observability 2.0 is the acknowledgement that Observability is evolving, and most importantly, that we’re getting closer and closer to fulfilling the promise of Observability itself.

I can’t wait to see what the future has in store!

Now, please enjoy this photo of my rat Katie, enjoying some hangtime in the pocket of my husband’s bathrobe. 💜

![Head of a light brown fancy rat peeking out of a pocket of a pinstripe bathrobe.](https://cdn-images-1.medium.com/max/800/1*BujN2QY0BcRIVplvvskqOg.png)

Katie rat enjoying some pocket hangtime. Photo by [Adriana Villela](https://adri-v.medium.com).

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [June 10, 2024](https://medium.com/p/7d4f776f1dce).

[Canonical link](https://medium.com/@adri-v/demystifying-observability-2-0-7d4f776f1dce)

Exported from [Medium](https://medium.com) on June 3, 2026.