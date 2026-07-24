---
title: "The Truth About OpenTelemetry’s Vendor-Neutrality"
slug: the-truth-about-opentelemetry-s-vendor-neutrality
description: "Understanding what “vendor neutral” actually means for OpenTelemetry"
added: "May 05, 2025"
tags:
  - technical
  - thought-leadership
  - opentelemetry
  - observability
  - "2025"
---



![Close-up of tree branches with small, pink buds clustered along them, set against a blurred background of a park or outdoor area. The buds are in the early stages of blooming, capturing the delicate beauty and promise of new growth in spring.](https://cdn-images-1.medium.com/max/800/1*AHK77PKgDEAlrnoSM5Q7IQ.jpeg)

Tree in bloom at Trinity Bellwoods Park in Toronto. Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

About a month or so ago, my friend [Josh Lee](https://medium.com/u/f765df021570) [wrote a post on LinkedIn about OpenTelemetry (OTel) vendor neutrality](https://www.linkedin.com/posts/joshuamlee_opentelemetry-otel-activity-7303855232763998208-ccf7):

![LinkedIn post text: “I still hear people saying that ‘OpenTelemetry is vendor neutral so you can switch vendors any time you want to.’ … This is like saying that because the vCard format exists, it’s easy to switch from iOs to Android. Sure, your core data will ultimately be portable, but you’ll be missing a \*lot\* of other things. Open formats are awesome — and essential for portability to be possible at all — but they are not a panacea that will save you from understanding your own use case.”](https://cdn-images-1.medium.com/max/800/1*Ysbzn7Ks6E9cqP5Rn0_YUQ.png)

Link to Johs’s original post on LinkedIn [here](https://www.linkedin.com/posts/joshuamlee_opentelemetry-otel-activity-7303855232763998208-ccf7)

Ever since I read his post, I couldn’t get it out of my head, especially the opening statement:

> “I still hear people saying that ‘OpenTelemetry is vendor neutral so you can switch vendors any time you want to.’ … This is like saying that because the vCard format exists, it’s easy to switch from iOs to Android.”

So is [OTel](https://opentelemetry.io) vendor neutral or not? The answer is, “Yes, but…” meaning that **_OTel is absolutely vendor neutral on data ingest_**. When I switched jobs from [Lightstep](https://docs.lightstep.com/) to [Dynatrace](https://dynatrace.com), I was able to keep existing instrumentation on my application code, and [all I had to do was repoint my OTel Collector to a different backend](https://medium.com/womenintechnology/how-do-i-send-opentelemetry-data-to-dynatrace-842cebb21286). Boom. Magic. ✨ I was able to see my traces, logs, and metrics in the Dynatrace UI, just like I had in the Lightstep UI.

BUT…

What nobody talks about is that it’s not \*just\* about data ingest, is it? If you’ve been working with Vendor X for a while, you’ve been used to doing things a certain way. A certain workflow, if you will. Whether it’s your own personal workflow, or perhaps one that your SRE team follows. Bottom line: **_using a new vendor means getting used to a new UI and vendor-specific nuances_**. Maybe Vendor X has some features that Vendor Y doesn’t have, that lets you do some cool stuff with your OTel data. Which means that you have to familiarize yourself with these new features in order to get the most out of them.

And then there are the dashboards and the queries behind those dashboards. Those don’t just grow out of trees. They require time and effort to build out. Many vendors have their own UI for dashboards, often with their own query language — think [PromQL for Prometheus](https://prometheus.io/docs/prometheus/latest/querying/basics/), [DQL for Dynatrace](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-query-language), and [SPL for Splunk](https://docs.splunk.com/Documentation/SplunkCloud/latest/Search/Aboutthesearchlanguage), to name a few. That means having to learn a new dashboarding interface, along with a new query language.

Does that mean that switching vendors is a no-go? Not at all. I’m just saying that you should manage your expectations when switching vendors, because it won’t be like waving a magic wand. 🪄

The wonderful thing about OpenTelemetry is that **_because OTel-compatible vendors all accept the same data, what differentiates them is what they do with your data_**. Does one vendor enable you to ask meaningful questions, get useful answers, and allow you to act on what you’ve learned better than another? Then going through the effort of switching vendors is _absolutely_ worthwhile and warranted, because at the end of the day, if your applications and systems are more reliable as a result, then that’s what matters most.

I will now leave you with a photo of our baby rat, Barbie, who is looking absolutely hilarious in this paper towel roll.

![A small white rat peeks out from a hole in a cardboard tube. The tube is surrounded by colorful shredded paper bedding and white tissue paper. Above the tube, there is a black and silver water bottle nozzle. In the background, a yellow plastic object is partially visible.](https://cdn-images-1.medium.com/max/800/1*F4FttTByMVRjzqFBpvtXGg.jpeg)

Barbie looks cozy in her paper towel roll! Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [May 5, 2025](https://medium.com/p/d385957e2c2d).

[Canonical link](https://medium.com/@adri-v/the-truth-about-opentelemetry-vendor-neutrality-d385957e2c2d)

Exported from [Medium](https://medium.com) on June 3, 2026.