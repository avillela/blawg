---
title: "Storing All of Your Observability Signals in One Place Matters!"
slug: storing-all-of-your-observability-signals-in-one-place-matters
description: "Going from “Swivel Chair” Observability to “Single Pane of Glass” Observability"
added: "May 09, 2025"
tags:
  - technical
  - observability
  - opentelemetry
  - thought-leadership
  - "2025"
---



![A close-up of a branch with young, green leaves and buds in the foreground. The background shows a paved path with a few people walking, trees with sparse leaves, and the sun setting, casting a warm glow over the scene. The image captures the essence of spring with new growth on the trees and a serene, natural setting.](https://cdn-images-1.medium.com/max/800/1*_ZYmDqWGCr2cEadUoNcUog.jpeg)

Spring is finally springing at Toronto’s Trinity Bellwoods park! Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

In Observability’s early days, there was often a lot of talk about the “three pillars”. That is, traces, logs, and metrics, which gave us the information to make our systems observable. The problem with referring to these three _signals_ as “pillars”, is that it implies that they’re siloed and therefore independent of each other, when in fact, the exact opposite is true.

To harness the true power of Observability, you need to treat these signals not as pillars, but as [three strands that make up a braid](https://thenewstack.io/modern-observability-is-a-single-braid-of-data/), as [OpenTelemetry](https://opentelemetry.io) (OTel) co-founder (and my former teammate) [Ted Young](https://www.linkedin.com/in/ted-young/) so aptly put it. This means that traces, logs, and metrics, each of which serves a different and important purpose, contribute to the observability story, giving us the full picture of what’s happening in our systems. The signals must also be correlated. Because what use is a metric or a log if you don’t know what trace it pertains to?

And yet, many organizations practicing Observability today still tend to send different signals to different backends for storage and analysis. The problem with this setup is two-fold. First, you’re not storing all of the signals in one place. Second, you’re having to go back and forth between different tools to look at your signals, try to correlate them, and understand what’s going on. How can you effectively analyze all of your data if it’s not all stored in the same place?

This problem is further amplified when you consider how some organizations will send telemetry data from different applications to different vendors. For example, an organization might have App A send metrics to SaaS Tool X, and traces and logs to SaaS Tool Y. And App B sends traces SaaS Tool J, logs to SaaS Tool L, and metrics to self-hosted Tool M. Let’s not forget the teams that have gone rogue and decided to do their own thing. See that Dell tower under Bob’s desk? Wouldn’t you know it? It’s running a bunch of OSS self-hosted tools, and App C is sending telemetry data there. Wheeee!

Oh boy…audit will have a field day with that one. To borrow a term coined by my husband, these types of organizations are practicing “swivel chair” observability, and to be honest, calling it “observability” at this point is being generous. You don’t have a braid. You don’t even have pillars. You’ve got _islands of pillars_. Zoinks!

Instead, what you want (and need) is a “single pane of glass” for your Observability. One place where your signals are stored. One place where you can view your signals. One place where you can understand how your signals are correlated.

In doing so, you can fulfill [the promise of Observability](https://hazelweakly.me/blog/redefining-observability/), enabling you to:

> “Ask meaningful questions, get useful answers, and act effectively upon what you learn.”

But remember: this can only succeed if you treat Observability as a team sport. That is, everyone in your organization needs to contribute to making your systems observable, coupled with enterprise oversight for tooling decisions, patterns, practices, and so on. You can read more about my take on this topic [here](https://medium.com/womenintechnology/observability-is-a-team-sport-168277f3eb93).

And now, please enjoy this lovely photo of Barbie hanging out with my husband.

![A person wearing a plaid shirt holds a small, white rat, in their hands. The rat has a pink nose, black eyes, and long whiskers. The background is an indoor setting with a chair and table visible. The image captures a moment of care and interaction between a human and their pet.](https://cdn-images-1.medium.com/max/800/1*s4MunHK_4xFnyCHqE3h65w.jpeg)

Barbie enjoys human time.

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [May 9, 2025](https://medium.com/p/36178cd0ce10).

[Canonical link](https://medium.com/@adri-v/storing-all-of-your-observability-signals-in-one-place-matters-36178cd0ce10)

Exported from [Medium](https://medium.com) on June 3, 2026.