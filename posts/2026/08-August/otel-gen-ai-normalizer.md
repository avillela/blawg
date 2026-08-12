---
title: Let's Learn About the OpenTelemetry GenAI Normalizer
slug: otel-gen-ai-normalizer
description: Using Semantic Conventions for telemetry from LLMs
tags:
  - technical
  - ai
  - open-telemetry
  - '2026'
added: 2026-08-12T00:00:00.000Z
---

[OpenTelemetry (OTel)](https://opentelemetry.io) has given us a standard, vendor-neutral way for instrumenting applications. But what about when our applications make LLM calls?

Application observability shouldn't stop at LLM calls. And when your LLM does something that you weren't expecting, understanding what it did, and why, it important so that you can mitigate future disastrous outcomes. Because let's face it: bad things can and will happen with tech, and we can't avoid them. But we can take measures to make them suck less.

Frameworks such as [OpenLLMetry](https://www.traceloop.com/docs/openllmetry/introduction) and [OpenInference](https://arize.com/glossary/openinference/) make LLM applications observable by auto-instrumenting LLM SDKs from popular providers such as OpenAI, Anthropic, and Gemini. This means that not only is the application itself instrumented via the popular language-specific [OpenTelemetry SDKs](https://opentelemetry.io/docs/languages/sdk-configuration/) that we know and love, the LLM calls *within* those applications are also instrumented. 🎉

Unfortunately, not all tools are created equal. LLM provider support varies among these tools. Additionally, each tool uses different span attribute names to describe the telemetry being emitted. And we all know how fun it is when we have competing standards. [Blu-ray](https://en.wikipedia.org/wiki/Blu-ray) vs [HD DVD](https://en.wikipedia.org/wiki/HD_DVD), anyone?

To help bridge that gap, OpenTelemetry created the [Generative AI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions-genai), providing a common language for LLM application instrumentation.

But how do you ensure that the likes of OpenLLMetry and OpenInference follow these semantic conventions? Even if they agree to adhere to the new conventions, implementing these changes can take time. This is where the [OpenTelemetry GenAI Normalizer](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/genainormalizerprocessor) comes in. The GenAI Normalizer is a [processor](https://opentelemetry.io/docs/collector/components/processor/) of the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/). It translates span attribute labels from different LLM instrumentation frameworks into OpenTelemetry GenAI semantic conventions, prior to exporting it to your favourite OpenTelemetry backend.

## How it works

To use the GenAI normalizer, you will need to run version ?? or higher of the OpenTelemetry Collector.

```yaml
processors:
  gen_ai_normalizer:
    # overwrite_schema_url: true
    sources:
      - name: openinference
        remove_originals: false
      - name: openllmetry
        remove_originals: false
```
