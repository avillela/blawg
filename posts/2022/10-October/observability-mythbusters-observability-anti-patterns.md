---
title: "Observability Mythbusters: Observability Anti-Patterns"
slug: observability-mythbusters-observability-anti-patterns
description: "Avoid committing “crimes against Observability” and get your Observability practice off the ground the right way."
added: "Oct 19, 2022"
tags:
  - technical
  - observability
  - opentelemetry

---


![](https://cdn-images-1.medium.com/max/800/1*qQlpvvDbwsE4_aOXo7OtPQ.png)

Bale of hay at [Applewood Farm](https://applewoodfarm.ca/apple-picking/), in Stouffville, ON, Canada. Photo by [Adri Villela](https://adri-v.medium.com)

Have you ever been at a place that claimed to be all in on Observability, only for you to realize that well, they’re not really following Observability practices? Yeah. Me neither. Just kidding. I’ve been in this space long enough to witness my fair share of anti-patterns, or what I like to refer to as, “Crimes Against Observability”. In today’s post, I’ll be calling these out, in the hopes that you can avoid these crimes and be on your merry way towards unlocking Observability’s powers.

Let’s get started!

### 1- Traces not treated as a first-class citizen

Too many organizations put far too much emphasis on metrics and logs, while either completely disregarding or downplaying traces. Yes, [metrics and logs are useful…to a point](https://lightstep.com/blog/observability-mythbusters-logs-and-metrics-arent-enough).

**Metrics** can give us information about things like CPU levels and the amount of time that it takes to complete a transaction. But they can only provide aggregate information that you can’t drill down into to understand what’s going on with your system.

**Logs** provide useful point-in-time information; however, by themselves, logs make it pretty damn difficult to troubleshoot. They’re a wall of text that you have to parse through so you can kinda sorta maybe piece together what’s up with your code.

[Neither metrics nor logs give you enough context to understand what’s happening with your system at a high level](https://lightstep.com/blog/observability-mythbusters-logs-and-metrics-arent-enough). Thus, the biggest crime against Observability is committed when metrics and logs are treated as the main actors of your Observability story, when in fact they take more of a supporting role. Spoiler alert: traces are the true stars of the show.

So how do we fix this? Take a trace-first approach. Traces give you that end-to-end system wide view. They show you not only what’s going on within services, but also across services. How do logs and metrics fit into this?

1.  Make logs more useful by making them a part of our overall story-i.e. traces-embedded as Span Events.
2.  Correlate metrics to traces via a linking attribute. For example, a VM with a given IP address can be correlated to a Trace if we capture IP address as a Span attribute.

**Moral of the story:** take a trace-first approach with your [Observability landscape](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code).

![Young Queen Elizabeth II: “I declare that traces be made first-class citizens”. https://imgflip.com/i/6vqwta](https://cdn-images-1.medium.com/max/800/0*e31g750xVKPPXI9d)

Image source: [https://imgflip.com/i/6vqwta](https://imgflip.com/i/6vqwta)

### 2- The Wall ‘o Dashboards

Y’all, this one’s nails on chalkboard for me. I once worked at a place where leadership thought that their production woes would be solved by dashboarding all the things. “I helped set up a wall of dashboards when I worked at XYZ company and it helped us so much!” Yeah. Like 10 years ago, when there wasn’t much else to work with. Time to get with the times and rethink that wall ‘o dashboards, my friends.

Does that mean that dashboards go away entirely? No. Instead, rethink your dashboard situation. Use fewer dashboards. Don’t rely on the Wall ‘o Dashboards to guide your Observability journey. A better alternative to Metrics dashboards would be to use [Service-Level Objectives (SLOs)](https://sre.google/sre-book/service-level-objectives). SLOs are actionable. For example, suppose you have an SLO that states that the response time for Service X must be 95% of the time. If the service is not meeting that SLO, it triggers an alert to notify by Slack, phone, pager, passenger pigeon, or whatever, to tell your on-call engineers that your system is not behaving within the expected parameters, and that you’ve gotta take a closer look at things.

For more hot takes on dashboards, check out this [great piece by Charity Majors](https://charity.wtf/2021/08/09/notes-on-the-perfidy-of-dashboards) and this [short, fun video by Austin Parker](https://youtu.be/5maHQiElGgY).

![Cartoon with googly eyes with one arm in air, yelling “dashboard all the things” and with a red circle with a line through it](https://cdn-images-1.medium.com/max/800/1*xIvH6Gf1SofzLMfeYZDDfw.png)

Image source: [https://imgflip.com/i/6vpwt3](https://imgflip.com/i/6vpwt3)

### 3- Getting someone else to instrument your code

Say you’re a developer. Would you get someone else to comment your code or write your unit tests? I didn’t think so. Now, say that your team is getting into Observability. This means that you need to instrument your code à la [OpenTelemetry](https://lightstep.com/blog/opentelemetry.io). Would you:

1.  Instrument your own code
2.  Ask someone else (maybe your SREs?) to instrument your code

If you answered B, then, yeaaaaahhhh…”Houston, we have a problem”.

![Appollo 13 meme: “Houston, we have a problem. Someone doesn’t want to instrument their own code.” https://imgflip.com/i/6vpy3x](https://cdn-images-1.medium.com/max/800/0*jkO2xHWXU37U3iuW)

Image source: [https://imgflip.com/i/6vpy3x](https://imgflip.com/i/6vpy3x)

What’s wrong with this picture? Well, for starters, the SREs didn’t write the code. You did. Just like it would be super weird to have someone comment **YOUR** code and write unit tests for **YOUR** code, then why would it be okay to have someone else instrument **YOUR** code? How in Space do you expect them to know **WHAT** to instrument?

Look, there’s no shame in not having instrumented your code before. If you’re just getting started with Observability on an existing code base, you bet your pants that you’ll have to go through your code and instrument it. But you can also ensure that you instrument new code as you write it, going forward. Moral of the story, instrument your own code. More specifically, if you focus on [instrumenting your home-grown frameworks and libraries](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code#instrument-your-code), then you have all the coverage you need, as far as tracing is concerned. Whatever you do, please, don’t get someone else to do your dirty work for you.

But hey, don’t take just my word for it. I’ll let [Liz Fong-Jones have the last word](https://twitter.com/oncallmemaybe/status/1570069781210107906?s=21&t=nhP2h1KNYopD7leVTT4XmQ):

“You’re a full grown-up software engineer. Write your own damn tests. Write your own damn comments. Write your own damn Observability annotations. This will help YOU understand your code later.”

### 4- Belief that Observability Tooling == Observability

Oh, mes amis, this couldn’t be further from the truth. Observability is a set of practices supported by tools. These include:

*   Instrumenting your [code properly so that you have enough info to troubleshoot when issues arise](https://lightstep.com/blog/observability-mythbusters-not-only-for-sre), and thereby avoiding calling the same group of “experts” to troubleshoot
*   Treating traces as first-class citizens
*   Keeping an eye on the health of your system after you release to prod
*   Creating meaningful, SLO-based alerts

Put that into place, and you’ve got yourself some Observability.

![Meme: Girl yelling into guy’s ear: “o11y is a set of practices supported by tools”](https://cdn-images-1.medium.com/max/800/0*RXvSknQrTSqHPdQF)

Image source: [https://imgflip.com/i/6vqrut](https://imgflip.com/i/6vqrut)

### 5- Observability theatre

We’ve seen it before. Companies going all-in on so-called “ [digital transformations](https://medium.com/dzerolabs/how-to-nail-your-digital-transformation-584630c3fbde) “. Which, of course, includes going Agile and creating a DevOps practice. All noble causes. And the intentions are good…maybe? In reality, nobody actually believed it would work, or wanted it to work. In short, it was all theatre. And I’ve seen that with Observability too. “Hey! We need Observability!” Woo hoo! 🎉 But then it turns out to be a front for Land o’ Logs and Walls ‘o Metrics Dashboards. Because that’s what folks grew up with. And that’s all they want to know.

Moral of the story: if you don’t have buy-in from your org, both from the exec ranks and the engineers doing the work. Can you get said buy-in? Absolutely! It won’t be an easy journey, but the worthwhile things are never easy to achieve, are they?

![Cookie Monster sitting in a green leather chair with a lamp to his left. Caption says: “Welcome to Observability theatre”](https://cdn-images-1.medium.com/max/800/1*v-RflQX7So_4_-WKTtQ6Rg.png)

Image source: [https://imgflip.com/i/6vqsmc](https://imgflip.com/i/6vqsmc)

### Final Thoughts

Observability ain’t easy, but keeping the following things in mind will help guide you in your Observability journey:

*   Make Traces your first-class citizen in your Observability Landscape. ✅
*   Say “byeeeee” to the wall ‘o dashboards, and hello to SLOs. ✅
*   Instrument your own damn code. Future You will thank you for it. ✅
*   Observability is a set of practices supported by tools. Sort your practices out before reaching out for the shiny new thing. ✅
*   Just say no to Observability Theater. ✅

And now, I shall reward you with a picture of an Octopus decked out for fall, drawn by my [superly-talented 14-year-old daughter](https://instagram.com/old_fashion_glazed).

![Octopus dressed up for fall. Drawing by Hannah Maxwell (https://instagram.com@old\_fashion\_glazed)](https://cdn-images-1.medium.com/max/800/0*0Np01cOrORpNqpWl)

Octopus dressed up for fall. Drawing by [@old\_fashion\_glazed](https://instagram.com@old_fashion_glazed)

Peace, love, and code. 🦄 🌈 💫

Got questions about Observability and/or OpenTelemetry? Talk to me! Feel free to connect through [e-mail](mailto:devrel@lightstep.com), or hit me up on [Twitter](https://twitter.com/adrianamvillela) or [LinkedIn](https://www.linkedin.com/in/adrianavillela). Hope to hear from y’all!

Check out my talk on Observability Anti-Patterns on YouTube:

CTO Craft Con Winter 2022 Lightning Talk: Observability Anti-Patterns

For more Observability articles, check out my Unpacking Observability series:

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/observability-mythbusters-observability-anti-patterns)_._

![](https://cdn-images-1.medium.com/max/800/0*rbBIrAtLWWmh60Qi.png)

#### 👋 If you find this helpful, please click the clap 👏 button below a few times to show your support for the author 👇

#### 🚀[Join FAUN Developer Community & Get Similar Stories in your Inbox Each Week](http://from.faun.to/r/8zxxd)

By [Adriana Villela](https://medium.com/@adri-v) on [October 19, 2022](https://medium.com/p/2b3062405b54).

[Canonical link](https://medium.com/@adri-v/observability-mythbusters-observability-anti-patterns-2b3062405b54)

Exported from [Medium](https://medium.com) on June 3, 2026.