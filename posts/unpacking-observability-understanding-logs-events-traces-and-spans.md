---
title: "Unpacking Observability: Understanding Logs, Events, Traces, and Spans"
slug: unpacking-observability-understanding-logs-events-traces-and-spans
description: "The path to instrumenting with OpenTelemetry"
added: "Jul 14, 2021"
tags:
  - technical
  - opentelemetry
  - observability
  - thought-leadership
---

# Unpacking Observability: Understanding Logs, Events, Traces, and Spans

![](https://cdn-images-1.medium.com/max/800/1*o5doa7Uuzq22wxoBk88y2A.jpeg)

Hawaiian Sunset. Image by [Adri V](https://adri-v.medium.com)

I’ve spent the last few weeks trying to [wrap my head around Observability](https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f), consuming every book, article, and podcast that I could get my hands on. My most recent explorations have gotten me digging into [OpenTelemetry](http://opentelemetry.io). OpenTelemetry (or OTel for short) is an open-source framework for instrumenting code, and many of the major Observability vendors such as [Datadog](http://datadoghq.com), [Lightstep](http://lightstep.com), and [Honeycomb](http://honeycomb.io) support it. It’s vendor-agnostic, so if you choose to switch Observability vendors, you won’t be royally screwed. I’m in charge of the Observability team at my current company, and my goal is to have the organization follow best practices around Observability. Among other things, this means steering the organization towards adopting [OpenTelemetry](http://opentelemetry.io) for instrumentation.

Before jumping into using [OpenTelemetry](http://opentelemetry.io), it’s important to understand core concepts, such Spans and Traces. But what about Logs? Where do these fit in? How about Events? Most of the literature I’ve read about Observability talks about wide Events and deep Traces; however, [OpenTelemetry](http://opentelemetry.io) docs don’t seem to put a huge emphasis on Events in the same way. Was I missing something?

So, of course, I decided to do some digging, asking questions in the [Observability community](https://honeycombpollinators.slack.com) and reading all sorts of online docs (see references below) to try to understand things better. The purpose of this blog post is to educate you in the differences between Logs, Events, Spans, and Traces so that you can start digging into OpenTelemetry.

### Logs

Logs are human-readable flat text files that are used by developers to capture useful data. Logs messages occur at a single point in time (though not necessarily at every point in time).

Unfortunately, log formats aren’t standardized across languages or frameworks, and they can be hard to parse and challenging to query. It’s also hard to group related logs together.

### Events

Events are structured logs. They follow a standardized format (JSON), and are waaaay easier to query.

Behold a sample log:

![](https://cdn-images-1.medium.com/max/800/1*dMx03t3s39tTv1BN4xZNJg.png)

Source: [The Path from Logs to Traces,](https://docs.google.com/presentation/d/1GIvoN2nmXM9s2_7SJ2FWceDAG6XBvXTTTIo5FNfUNeQ/edit?usp=sharing) by [Alex Vondrak](https://www.linkedin.com/in/ajvondrak)

And its Event counterpart:

![](https://cdn-images-1.medium.com/max/800/1*nS68QO_uI-VQchj5b4bCJg.png)

Source: [The Path from Logs to Traces,](https://docs.google.com/presentation/d/1GIvoN2nmXM9s2_7SJ2FWceDAG6XBvXTTTIo5FNfUNeQ/edit?usp=sharing) by [Alex Vondrak](https://www.linkedin.com/in/ajvondrak)

### Spans

A Span represents a unit of work. They can be thought of as the work being done during an operation’s execution.

Logs represent occurrences at a specific point in time. Events aren’t that much more useful, other than being easier to read and query. The problem is that in isolation, Events don’t really tell a story. What if instead, we captured info for **a given block of time** (i.e. a time span)?

Suppose we had the scenario below:

![](https://cdn-images-1.medium.com/max/800/1*L0TX12i3IISH9kjpjHfaLw.png)

Source: [The Path from Logs to Traces,](https://docs.google.com/presentation/d/1GIvoN2nmXM9s2_7SJ2FWceDAG6XBvXTTTIo5FNfUNeQ/edit?usp=sharing) by [Alex Vondrak](https://www.linkedin.com/in/ajvondrak)

In the olden days, we’d have log that looked like this:

![](https://cdn-images-1.medium.com/max/800/1*-4K_INw4JN8MrCtdYdGgZg.png)

Source: [The Path from Logs to Traces,](https://docs.google.com/presentation/d/1GIvoN2nmXM9s2_7SJ2FWceDAG6XBvXTTTIo5FNfUNeQ/edit?usp=sharing) by [Alex Vondrak](https://www.linkedin.com/in/ajvondrak)

We have a span that looks like this:

![](https://cdn-images-1.medium.com/max/800/1*xYE9bueKrdhN04frG6u1kQ.png)

Source: [The Path from Logs to Traces,](https://docs.google.com/presentation/d/1GIvoN2nmXM9s2_7SJ2FWceDAG6XBvXTTTIo5FNfUNeQ/edit?usp=sharing) by [Alex Vondrak](https://www.linkedin.com/in/ajvondrak)

Um…letdown? Yeah…if you only had those 3 fields, it would for sure be a letdown. In order for the Span to be more useful to us, we need some additional information. In OpenTelemetry, we can also include the following metadata in our Spans:

*   **Operation name**: The name of the microservice being executed, or a function call
*   **Start timestamp**
*   **End timestamp** (or duration)
*   [**Attributes**](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/common/common.md#attributes)**:** (Optional) List of key-value pairs used for aggregation or for filtering trace data (e.g. customer identifier, process hostname). Used to describe and contextualize the work being done under a Span.
*   **Events**: (Optional) Time-stamped strings which are made up timestamp, name, and (optional) Attributes. Used to describe and contextualize the work being done under a Span.
*   **Parent ID**: Unique identifier of the Span’s parent
*   [**Links**](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/overview.md#links-between-spans)**:** (Optional) References to other causally-related Spans

Now with the above metadata, we’ve got the proper context which helps us paint a picture of what happens during that operation.

### Trace

Traces are also known as _distributed traces_. They traverse network, process, and security boundaries, to give you a holistic view of your system.

A Span is the basic building block of a Trace. A Trace is made up of a tree of Spans, starting with a Root Span (i.e. Span with no parent), which encapsulates the end-to-end time that it takes to accomplish a task. The Root Span represents a single logical operation, such as clicking a button to add an item to a shopping cart.

Below are a few examples of trace visualizations using [Lightstep](http://lightstep.com) and [Honeycomb](http://honeycomb.io).

**Example 1: Trace visualization in LightStep**

![](https://cdn-images-1.medium.com/max/800/0*YChmlEyfqOASGZS2)

Source: [The Path from Logs to Traces,](https://docs.google.com/presentation/d/1GIvoN2nmXM9s2_7SJ2FWceDAG6XBvXTTTIo5FNfUNeQ/edit?usp=sharing) by [Alex Vondrak](https://www.linkedin.com/in/ajvondrak)

**Example 2: Trace visualization in Honeycomb**

![](https://cdn-images-1.medium.com/max/800/0*IHucl8MAQZNocLsE)

Source: [The Path from Logs to Traces,](https://docs.google.com/presentation/d/1GIvoN2nmXM9s2_7SJ2FWceDAG6XBvXTTTIo5FNfUNeQ/edit?usp=sharing) by [Alex Vondrak](https://www.linkedin.com/in/ajvondrak)

### Conclusion

In the world of Observability, Spans and Traces reign supreme. What we’ve learned:

*   Logs tell you about something at a particular point in time. They don’t have a standardized format, and are therefore hard to query.
*   Events are structured logs (JSON), and are easier to query.
*   Spans represent an operation. They paint a picture of what happened during the time in which that operation was executed, through contextual information such as associated Events and attributes.
*   A Root Span is a Span without a parent, and represents your high-level operation (e.g. clicking a button to add item to a shopping cart).
*   Traces stitch all related spans (as a tree) together to tell you the whole story.

I shall now reward you with a picture of a calf.

![](https://cdn-images-1.medium.com/max/800/1*eyyLx4sghdywRuk6bgHh3Q.jpeg)

Photo by [Sean Nyatsine](https://unsplash.com/@seannyyyee?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/calf?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### Acknowledgements

I wanted to give a big shoutout to the Observability community on the [Honeycomb Pollinators Slack](https://honeycombpollinators.slack.com). Folks there have been super responsive and patient with my many questions. I really appreciate it. Also, a shout-out to [Alex Vondrak](https://github.com/ajvondrak/), who put together a [great set of slides](https://docs.google.com/presentation/d/1GIvoN2nmXM9s2_7SJ2FWceDAG6XBvXTTTIo5FNfUNeQ/edit?usp=sharing) which clarified a LOT of this stuff for me.

I would also suggest that you reach out to other Observability user communities. I figure that it’s always good to get different points of view from the community! Datadog, for example, also has a [Slack user community](https://chat.datadoghq.com), and Lightstep has a [Discord user community](http://discord.gg/pCftwe8).

### More from the Unpacking Observability Series

[**Unpacking Observability: A Beginner’s Guide**  
_A beginner’s guide to understsanding Observability, why it matters, and how you can get started._adri-v.medium.com](https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f "https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f")[](https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f)

[**Unpacking Observability: The Observability Stack**  
_Putting together a simple, yet effective OpenTelemetry-centric Observability stack_adri-v.medium.com](https://adri-v.medium.com/unpacking-observability-the-observability-stack-93d4733e2a72 "https://adri-v.medium.com/unpacking-observability-the-observability-stack-93d4733e2a72")[](https://adri-v.medium.com/unpacking-observability-the-observability-stack-93d4733e2a72)

[**Unpacking Observability: The Path to OpenTelemetry**  
_How to roll out OpenTelemetry across your organization to achieve Observability vendor neutrality_adri-v.medium.com](https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4 "https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4")[](https://adri-v.medium.com/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4)

### References & Resources

*   [Honeycomb Pollinators Slack](https://honeycombpollinators.slack.com)
*   [Datadog User Community Slack](https://chat.datadoghq.com)
*   [Lightstep Community Discord](http://discord.gg/pCftwe8)
*   [The Path from Logs to Traces, by Alex Vondrak](https://ajvondrak.github.io/soapbox/2021/02/25/the-path-from-logs-to-traces/)
*   [Modern Observability with OpenTelemetry (LightStep)](https://www.youtube.com/watch?utm_source=pocket_mylist&v=_OXYCzwFd1Y)
*   [OpenTelemetry 101: What is Tracing? (LightStep)](https://lightstep.com/blog/opentelemetry-101-what-is-tracing/#opentelemetry-and-tracing)
*   [Span Attributes (OpenTelemetry)](https://opentelemetry.io/docs/java/manual_instrumentation/#span-attributes)
*   [Spans with Events (OpenTelemetry)](https://opentelemetry.io/docs/java/manual_instrumentation/#create-spans-with-events)
*   [OpenTelemetry Specification (OpenTelemetry GitHub)](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/overview.md)

By [Adriana Villela](https://medium.com/@adri-v) on [July 14, 2021](https://medium.com/p/836524d63172).

[Canonical link](https://medium.com/@adri-v/observability-journey-understanding-logs-events-traces-and-spans-836524d63172)

Exported from [Medium](https://medium.com) on June 3, 2026.