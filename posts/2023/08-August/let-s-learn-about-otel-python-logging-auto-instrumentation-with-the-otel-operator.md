---
title: "Let’s Learn About OTel Python Logging Auto-Instrumentation with the OTel Operator!"
slug: let-s-learn-about-otel-python-logging-auto-instrumentation-with-the-otel-operator
description: "OTel Logs with Python made simpler through auto-instrumentation"
added: "Aug 18, 2023"
tags:
  - technical
  - opentelemetry
  - observability
  - otel-operator
---



![Large catamaran sailboat approaching pier on the beach at sunset.](https://cdn-images-1.medium.com/max/800/1*9yDDdY1LbDO4XtK2iAkRbw.png)

Beach sunset in Turks & Caicos Islands. Photo by [Adri Villela](https://adri-v.medium.com).

Do you want to get started with OpenTelemetry (OTel) Logs in a Python app running on Kubernetes, but aren’t sure how to go about it? What if I told you that it’s not as scary as you think and that you can leverage the [OTel Operator](https://opentelemetry.io/docs/kubernetes/operator) for OTel Logs auto-instrumentation?

Then you, my friend, have come to the right place! In this post, you will:

*   Learn how to quickly get started with OTel Logs in Python
*   Auto-instrument logs via auto-instrumentation with the OTel Operator

### Python Logs Auto-Instrumentation

If you’re looking for all the source files in this example, you can find them [here](https://gist.github.com/avillela/16f1bbcc3aedc7f358e9914a98209b45). It also includes the [OTel Collector Custom Resource (CR)](https://github.com/open-telemetry/opentelemetry-operator#getting-started) config.

#### Assumptions

Before we move on, I am assuming that you have a basic understanding of:

*   **Kubernetes.** You can check out my Kubernetes blog posts [here](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1) and [here](https://medium.com/dzerolabs/just-in-time-kubernetes-namespaces-labels-annotations-and-basic-application-deployment-f62568a9eaaf) for a wee refresher if you need them.
*   **Python.** This is a Python-centric example, after all. 🙃
*   **The OTel Operator.** If not, check out my blog posts [here](https://blog.devgenius.io/lets-learn-about-auto-instrumentation-with-the-otel-operator-2cdc8a532514) and [here](https://medium.com/@adri-v/lets-learn-about-the-otel-operator-s-target-allocator-47a2b1f07562). The [OTel docs](https://opentelemetry.io/docs/kubernetes/operator/) are also a great resource.

> ⚠️ **NOTE:** _This is not a full-fledged tutorial on auto-instrumentation with the OTel Operator. I’ll be including code, but won’t be including end-to-end instructions on deploying the various pieces. I’m assuming that you know your way around Python and Kubernetes here. 🙃_

#### The Code

Let’s start with the Python code:

If you’ve followed my writings on [OTel with Python](https://faun.pub/auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep-aa1ffaeeb5e6) before, the example above may be familiar to you. It’s a simple [Python Flask](https://flask.palletsprojects.com/en/2.3.x/) server app that rolls a virtual die and outputs a number when the user requests the `/rolldice` endpoint at `[http://localhost:8082/rolldice](http://localhost:8082/rolldice)`.

The code emits Traces (lines 4, 25–28, and 62), Metrics (lines 4, 32, and 65–66), and Logs (lines 5–13, 30, 37–57, and 69).

If you look more closely at the Logs code, you’ll notice that it’s not using any OTel Python logging libraries. It’s actually using the Python logging library. Say wut?

_Unlike Traces and Metrics, there is no equivalent Logs API. There is only an SDK._ _🙃_ I know, right? I was pretty surprised too. The idea is that you can use whatever logger you want for your language (for Python, it’s the `logger` library), and then the OTel SDK attaches an OTLP handler to the root logger, basically turning your log library’s logs into OTLP logs. 🪄✨

> **⚠️ NOTE:** _There is a logs bridge API; however, it is different from the Traces and Metrics API, because it’s not used by application developers to create logs. Instead, they would use this bridge API to setup log appenders in the standard language-specific logging libraries. More information can be found_ [_here_](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/bridge-api.md)_._

But wait. There’s no OTel Logs SDK in this code either. We’re just using the Python logging library. We’re not specifically attaching the OTLP handler to the root logger, so like…did we give up on OTel logs?

Nope! See, this is where auto-instrumentation comes in! Yes, there is auto-instrumentation support for Python logs! Yaaaay!

So now you might be wondering…_where_ does that happen, because it’s definitely not happening anywhere in the above code, is it?

Well, it turns out that there’s a special OTel Python auto-instrumentation attribute called `OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED`, and if we set it to `true`, the logging magic described above happens.

Awesome, awesome…but _where_ do we set it to `true`? Well, since we’re doing auto-instrumentation via the OTel Operator, the config goes in the Operator’s Instrumentation CR. Like this:

Check out lines 19–20 above:

\- name: OTEL\_PYTHON\_LOGGING\_AUTO\_INSTRUMENTATION\_ENABLED  
  value: "true"

As you may recall from [my last piece on Auto-Instrumentation with the OTel Operator](https://blog.devgenius.io/lets-learn-about-auto-instrumentation-with-the-otel-operator-2cdc8a532514), there’s a special section for including language-specific configs just like this. For Python, it’s in the `spec.python.env` section of the Instrumentation CR.

But wait…there’s more! You may recall that Python auto-instrumentation only works with HTTP, and not gRPC, so we also need to set another attribute, called `OTEL_LOGS_EXPORTER`, to make sure that we’re using HTTP, and not gRPC for Logs, otherwise, it no workie:

\- name: OTEL\_LOGS\_EXPORTER  
  value: otlp\_proto\_http

And finally, we need to make sure that our Deployment YAML includes the special auto-instrumentation annotation, so that the Operator can inject auto-instrumentation into the Pod:

This is accomplished by lines 20 and 21:

annotations:  
    instrumentation.opentelemetry.io/inject-python: "true"

Remember that this annotation _must go_ to go under `spec.template.metadata`, and NOT under the main `metadata` section. If you try to put it in the main `metadata` section, it no workie. Believe me, I’ve made that mistake a zillion times, and it’s annoying AF when you’re scratching your head wondering why the annotation is “there”, but auto-instrumentation ain’t working.

When you deploy [python-server.yaml](https://gist.github.com/avillela/16f1bbcc3aedc7f358e9914a98209b45#file-python-server-yaml) (includes Deployment and Service definitions), [otel-collector.yaml](https://gist.github.com/avillela/16f1bbcc3aedc7f358e9914a98209b45#file-otel-collector-yaml), and [instrumentation.yaml](https://gist.github.com/avillela/16f1bbcc3aedc7f358e9914a98209b45#file-instrumentation-yaml) to Kubernetes, you should something along these lines in your OTel Collector’s output:

ScopeLogs #0  
ScopeLogs SchemaURL:   
InstrumentationScope opentelemetry.sdk.\_logs.\_internal   
LogRecord #0  
ObservedTimestamp: 1970-01-01 00:00:00 +0000 UTC  
Timestamp: 2023-08-17 16:29:23.971459584 +0000 UTC  
SeverityText: ERROR  
SeverityNumber: Error(17)  
Body: Str(Derp! Toronto, we have a major problem.)  
Attributes:  
     \-> otelSpanID: Str(73f9eb4977391ab2)  
     \-> otelTraceID: Str(885e9ce5faf1009fdc37eaee8ff7e660)  
     \-> otelTraceSampled: Bool(true)  
     \-> otelServiceName: Str(py-otel-server)

#### Logs auto-instrumentation sans Operator

Now, what if you wanted to do Python auto-instrumentation without the Operator? Like, if you were doing dev on your desktop. What would that look like? The Python`[opentelemetry-instrument](https://opentelemetry.io/docs/instrumentation/python/automatic/)` agent is used for Python auto-instrumentation. The agent configuration would look something like this:

\# Set the logs auto-instrumentation flag  
export OTEL\_PYTHON\_LOGGING\_AUTO\_INSTRUMENTATION\_ENABLED=true  
  
\# Start the agent  
opentelemetry-instrument \\  
    --traces\_exporter otlp \\  
    --metrics\_exporter otlp \\  
    --logs\_exporter otlp \\  
    --service\_name server-py \\  
    python server.py

Notice how we set the `OTel_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED` environment variable, which tells the agent to go ahead and use Python logs auto-instrumentation (it’s disabled by default).

> **⚠️ NOTE:** _The above config setup assumes that telemetry signals are being sent to a Collector running on_ `[_http://localhost:4317_](http://localhost:4317)` _(gRPC port) — the default. For more on the auto-instrumentation, check out_ [_this blog post_](https://faun.pub/auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep-aa1ffaeeb5e6)_._

### Final thoughts

OTel Logging in Python may seem intimidating a first glance, but it’s not quite so scary once you understand what’s up. And you’ve got to admit that the Logs auto-instrumentation bit is pretty damn cool and simplifies things a TON! Simple is always a win in my book!

I hope y’all learned something new and cool with this! There’s obviously a LOT more to dig into on this topic, but hopefully this gives you enough of a starting point for Python Logs auto-instrumentation with the OTel Operator. If you’d like to learn more about the OTel Operator, you should check out [#otel-operator channel](https://cloud-native.slack.com/archives/C033BJ8BASU) in the [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf). The folks on there are super helpful and responsive.

Massive thanks to my awesome colleague, [Alex Boten](https://www.linkedin.com/in/codeboten/), for teaching me the ways of Python Logs auto-instrumentation.

In the interest of making sure that this information makes it into the actual OTel docs, I also took the liberty of [creating a PR with this info](https://github.com/open-telemetry/opentelemetry.io/pull/3195), which has been merged. 🎉

Now, please enjoy this rare photo of my rat Mookie, who is usually moving too fast to snap a good pic of her!

![](https://cdn-images-1.medium.com/max/800/1*OA8AU0YAoyHMTt6nzj3_2g.png)

Mookie the rat stood still enough for a photo op!!

Until next time, peace, love, and code! ✌️💜👩‍💻

Want to learn more about OpenTelemetry? Check out my other OTel content here:

[**OpenTelemetry**  
_Blog posts about OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/92f897d8b31e "https://adri-v.medium.com/list/92f897d8b31e")[](https://adri-v.medium.com/list/92f897d8b31e)

#### Further Reading:

[**OpenTelemetry: A full guide**  
_Learn all about OpenTelemetry OpenSource and how it transforms microservices observability and troubleshooting_gethelios.dev](https://gethelios.dev/opentelemetry-a-full-guide/?utm_source=medium&utm_medium=cloud+native+daily "https://gethelios.dev/opentelemetry-a-full-guide/?utm_source=medium&utm_medium=cloud+native+daily")[](https://gethelios.dev/opentelemetry-a-full-guide/?utm_source=medium&utm_medium=cloud+native+daily)

[**Combining OTel and Prometheus metrics for alerting machine**  
_Using both OpenTelemetry and Prometheus, we delivered a trace-based alerting mechanism quickly and efficiently - here's…_gethelios.dev](https://gethelios.dev/blog/combinining-opentelemetry-traces-with-prometheus-metrics-to-build-a-powerful-alerting-mechanism/?utm_source=medium&utm_medium=referral&utm_campaign=cloud+native+daily "https://gethelios.dev/blog/combinining-opentelemetry-traces-with-prometheus-metrics-to-build-a-powerful-alerting-mechanism/?utm_source=medium&utm_medium=referral&utm_campaign=cloud+native+daily")[](https://gethelios.dev/blog/combinining-opentelemetry-traces-with-prometheus-metrics-to-build-a-powerful-alerting-mechanism/?utm_source=medium&utm_medium=referral&utm_campaign=cloud+native+daily)

[**OpenTelemetry Python - Walkthrough and monitoring Examples**  
_Python app monitoring & debugging can be challenging. Using distributed tracing with OpenTelemetry visualization solves…_gethelios.dev](https://gethelios.dev/blog/opentelemetry-python/?utm_source=medium&utm_medium=referral&utm_campaign=cloud+native+daily "https://gethelios.dev/blog/opentelemetry-python/?utm_source=medium&utm_medium=referral&utm_campaign=cloud+native+daily")[](https://gethelios.dev/blog/opentelemetry-python/?utm_source=medium&utm_medium=referral&utm_campaign=cloud+native+daily)

[**Kubernetes Monitoring with OpenTelemetry**  
_Learn how to monitor Kubernetes using OpenTelemetry with real-time visibility and granular error data - Reduce MTTR by…_gethelios.dev](https://gethelios.dev/blog/kubernetes-monitoring-opentelemetry/?utm_source=medium&utm_medium=cloud+native+daily "https://gethelios.dev/blog/kubernetes-monitoring-opentelemetry/?utm_source=medium&utm_medium=cloud+native+daily")[](https://gethelios.dev/blog/kubernetes-monitoring-opentelemetry/?utm_source=medium&utm_medium=cloud+native+daily)

By [Adriana Villela](https://medium.com/@adri-v) on [August 18, 2023](https://medium.com/p/663247666570).

[Canonical link](https://medium.com/@adri-v/lets-learn-about-otel-python-logging-auto-instrumentation-with-the-otel-operator-663247666570)

Exported from [Medium](https://medium.com) on June 3, 2026.