---
title: "Observability Mythbusters: Logs and Metrics Aren’t Enough"
slug: observability-mythbusters-logs-and-metrics-aren-t-enough
description: "Logs + Metrics != Observability. Here’s why…"
added: "May 03, 2022"
tags:
  - technical
  - observability
  - opentelemetry
  - "2022"
---


![](https://cdn-images-1.medium.com/max/800/0*yAT2Jif6ger8QgJg)

_Photo of mural painting near Symington and Dupont, in Toronto. Photo by_ [_Adri Villela_](https://adri-v.medium.com)_._

The other day, I found myself bantering back-and-forth with a reader in [one of my Medium articles](https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f). It ultimately ended with me saying that we were each looking at this problem differently, and we’ll have to just agree to disagree. I’ll admit that I was a bit frustrated by his err…bluntness. (Guess my frustration proves I’m not a bot?!) That said, I’d like to take this opportunity to address some of his points in a proper post.

The last reply from my reader in the comment thread is this:

> “Ignoring log data in your observability strategy is a major misstep unless you are running completely infrastructure-less. There are plenty of advanced users who only use logging and metrics for observability. Many of the hyper scalers (Microsoft/AWS), don’t use tracing due to scale and diversity of services, and only use it as a debugging tool on-demand.

> A log is an event, so on one of these blogs you are losing the meaning. Logs are essential when managing infrastructure or applications running on other app servers. You aren’t going to get the data to debug an infrastructure problem or an app server issue without logs, it’s that simple.”

There are two main points I want to address here specifically:

1.  “Ignoring log data in your observability strategy is a major misstep”
2.  “There are plenty of advanced users who only use logging and metrics for observability”

I will do this by addressing two myths:

1.  Logs alone are good enough for debugging
2.  The usefulness of metrics

> **Fine Print:** _I want to make it superly duperly clear that my Observability journey started in 2021, when I found myself managing an Observability Practices team, and was trying to devise an Observability strategy for my now former employer. This means that my understanding has evolved as I dig deeper into this problem space. As I continue to learn things and evolve my understanding, my goal is to continue to share my learnings with you, because let’s face it…it’s a lot to wrap your head around._

Okay…let’s get to it!

### Reminders & Terminology

First things first, let us remind ourselves of a few things related to Observability:

1.  It is a major paradigm shift, and as with all paradigm shifts, it ain’t always easy to change how we look at a problem.
2.  It is a set of practices.
3.  You won’t be perfect at it right away.

Here are some terminology refreshers, as I’ll be referring to these throughout this post. Feel free to skip if you’re already familiar with these.

*   **Logs** tell you about something at a particular point in time. They don’t have a standardized format, and are therefore hard to query.
*   A **Span** represents a unit of work or operation. It paints a picture of what happened during the time in which that operation was executed, through contextual information such as associated structured log messages (Span Events) and Attributes (e.g. Client ID, API endpoint, IP address). For example, a Span captures all the things that happened when you added an item to a shopping cart.
*   A **Trace** stitches together all related Spans (as a tree). Traces show you the big picture.
*   **Metrics** are aggregations over a period of time of numeric data about your infrastructure or application. Examples include: system error rate, CPU utilization, request rate for a given service.
*   **Telemetry** Signals emitted from a system, about its behaviour. These signals can come in the form of traces, metrics, and logs.
*   **Reliability** answers the question: “Is the service doing what users expect it to be doing?” Your system could be up 100% of the time, but if, when you click “Add to Cart” for a black pair of pants, and instead, the system keeps adding the wrong colour for those pants, you wouldn’t consider it to be reliable, would you?
*   **SLI**, or Service Level Indicator, is a thing that you are measuring. Although an SLI is created off of a metric, said metric is derived from aggragating Trace data. An example SLI: number of successful HTTP requests / total HTTP requests (success rate).
*   **SLO**, or Service Level Objective, is are how we communicate reliability to the rest of the org/other teams by attaching SLIs to business value.

Further reading on SLIs and SLOs can be found [here](https://www.oreilly.com/library/view/implementing-service-level/9781492076803/) and [here](https://sre.google/sre-book/service-level-objectives/).

### Myth #1: Logs are good enough

Do logs matter? Yup. But by themselves, they make it pretty damn difficult to troubleshoot. They’re a wall of text that you have to parse through so you can kinda sorta maybe piece together what’s up with your code. Ew. So what I’m saying is, “Hey, logs are more useful if we stick ’em in a Span.”

Spans provide context. Context is important because it’s the glue that stitches Spans together to tell a story — i.e. a Trace. In Microservices Land, you’re not dealing with just one big service (i.e. a monolith). You’re likely dealing with a boatload of smaller services that interact with each other and that can behave in weird, sometimes unpredictable ways. How can logs help with that? Imagine trying make sense of logs that look something like what you see below:

![](https://cdn-images-1.medium.com/max/800/1*9Hsb1ZJyylqRxcBYy63QNQ.png)

_Image Source:_ [_researchgate.net_](https://www.researchgate.net/figure/Logging-messages-example_fig3_333075450)

Even if you had structured logs and used a tool that specializes in slicing and dicing through your logs messages (e.g. [ElasticSearch](https://www.elastic.co/elastic-stack/)), you’re still missing the big picture. What services are involved? In what order are they called? What transactions belong together? Without this information readily on-hand makes it harder to troubleshoot.

At one of my previous companies, the dev teams had the hardest time trying to debug through prod issues. Why? Because they relied heavily on logs for debugging. There were so many logs with so much data, but they didn’t even know where to start looking. Sure, you can look for log level ERROR, but in the context of what? What transaction was it a part of? What service called the service that spewing the error message?

Now, what if we had used Traces instead? Consider this very stripped-down sample Trace:

Right away we have so much information! Here’s some info that we can glean:

1.  Our Trace (which is also the Root Span) is called `Hello`
2.  It has two children: `Hello-Greetings` and `Hello-Salutations`. We know this because they have the same `parent_id`, which corresponds to the span\_id of the `Hello` Span
3.  They are all part of the same Trace. We know this because they have the same `trace_id` .
4.  We’ve got some useful info about our Spans, which are stored as `attributes`.
5.  We’ve even got some log messages, stored as `events`, to provide us with some additional information.

Send that over to an Observability back-end, and we can do some serious troubleshooting!

If you’d like to read more on the topic Traces over Logs, check out the blog posts below:

*   [Why Tracing Might Replace Almost All Logging](https://go.lightstep.com/register-tracing-will-replace-logging-guide)
*   [Why Logs Aren’t Enough to Debug Your Microservices](https://thenewstack.io/tracing-why-logs-arent-enough-to-debug-your-microservices/)
*   [Publish Events, Not Logs](https://kislayverma.com/programming/publish-events-not-logs/)

### Myth #2: The usefulness of Metrics

Okay, y’all, let me address the elephant in the room. In a [previous blog post](https://storiesfromtheherd.com/unpacking-observability-a-beginners-guide-833258a0591f), I wrote:

> In the world of Observability, we’re dealing with unknown unknowns, and therefore we don’t know what we’re measuring. Which means…hasta la vista, metrics!

This is the part where I eat crow. I take that back. Metrics ARE useful. They can give us information about things like CPU levels and the amount of time that it takes to complete a transaction. But as we saw with Logs, Metrics without context won’t give us Observability.

You know what does? Tying Metrics to Traces.

In some cases, you can derive Metrics from Traces. For example, you can derive a response time metric for a service from a Trace. But sometimes, you can’t. For example, you can’t derive Metrics on your Virtual Machine (VM) like CPU and memory utilization from a Trace. But we can correlate them to a Trace via a linking attribute. For example, a VM with a given IP address can be correlated to a Trace if we capture IP address as a Span attribute.

And speaking of Metrics, beware the evils of Metrics dashboards. You know…the ones that many orgs like to display proudly on big monitors at the office as part of some fancy command center. Orgs like to have dashboards for things like keeping an eye on CPU utilization, disk utilization, memory utilization, number of transactions per hour.

That’s well and good, but who wants to stare at a dashboard all day, waiting for something to happen? Are these actionable? What’s on this dashboard anyway? Are these items still relevant? Where’s the dude who created that dashboard item? Oh…he retired? Crap.

A better alternative to Metrics dashboards would be to use SLOs. (Check out the Terminology section above for a refresher on SLOs.) SLOs are actionable. For example, suppose you have an SLO that states that the response time for Service X must be 95% of the time. If the service is not meeting that SLO, it triggers an alert to notify by Slack, phone, pager, passenger pigeon, or whatever, to tell your on-call engineers that your system is not behaving within the expected parameters, and that you’ve gotta take a closer look at things. Which takes you to your Metrics, which of course are correlated to your Traces.

### Are Logs and Metrics Enough?

As we learned today, Logs aren’t great on their own, because they lack context. We also learned that Metrics are also not great on their own because they too lack context.

Sending Logs and Metrics to an APM tool won’t magically give you context. Therefore:

**_Logs + Metrics != Observability_**

But, IF:

*   Our Logs are linked to Traces (e.g. as Span Events)

AND

*   Our Metrics are linked to Traces (e.g. either by deriving them from Traces or by correlating them via a linking attribute)

THEN: we begin to see the Big Picture of our system.

In which case we can say that Traces are the foundation upon which Observability is built.

So:

**_Traces(Logs + Metrics) == Observability_**

**Bottom line:** Traces should be the basis of your telemetry data.

Now, please enjoy this lovely picture of one of my rats.

![](https://cdn-images-1.medium.com/max/800/1*hNnblS343wYKSCrnkmKT-w.png)

_Photo by_ [_Adri Villela_](https://adri-v.medium.com)

Peace, love, and code. 🌈🦄 💫

### Related Reading

Check out my previous posts on Observability on my Unpacking Observability Series:

[**Unpacking Observability**  
_Stories to help you understand Observability and OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/be1835c6dd23 "https://adri-v.medium.com/list/be1835c6dd23")[](https://adri-v.medium.com/list/be1835c6dd23)

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/observability-mythbusters-logs-and-metrics-arent-enough)_._

By [Adriana Villela](https://medium.com/@adri-v) on [May 3, 2022](https://medium.com/p/4ed6f7653cef).

[Canonical link](https://medium.com/@adri-v/observability-mythbusters-logs-and-metrics-arent-enough-4ed6f7653cef)

Exported from [Medium](https://medium.com) on June 3, 2026.