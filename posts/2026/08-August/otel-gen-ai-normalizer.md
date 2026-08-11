---
title: Speaking the LLM Language
slug: otel-gen-ai-normalizer
description: Using the OpenTelemetry GenAI Normalizer
tags:
  - technical
  - ai
  - open-telemetry
  - '2026'
added: 2026-08-11T00:00:00.000Z
---

LLM calls within an application can sometimes seem like a black box. And when your LLM does something that you weren't expecting, understanding what it did and why is important so that you can mitigate future disastrous outcomes. Because let's face it: bad things can and will happen with tech and we can't avoid them. But we can take measures to make them suck less.

Tools such as [OpenLLMetry](https://www.traceloop.com/docs/openllmetry/introduction) and [OpenInference](https://arize.com/glossary/openinference/) have made it possible to make LLM applications observable by instrumenting LLM SDKs from popular providers such as OpenAI, Anthropic, and Gemini. This means that not only is the application itself instrumented via the popular language-specific [OpenTelemetry SDKs](https://opentelemetry.io/docs/languages/sdk-configuration/) that we know and love, the LLM calls *within* those applications are also instrumented. 🎉

Unfortunately, not all tools are created equal. Each tool supports different LLM providers, and uses different terminology for describing the telemetry that they emit. And we all know how fun it is when we have competing standards. BluRay vs HD DVD, anyone?

To help bridge that gap, OpenTelemetry created the [Generative AI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions-genai), providing a common language for LLM application instrumentation.

But how do you ensure that the likes of OpenLLMetry and OpenInference follow these semantic conventions? Even if they agree to adhere to the new conventions, implementing these changes can take time. This is where the [OpenTelemetry GenAI Normalizer](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/genainormalizerprocessor) comes in. The GenAI Normalizer is a [processor](https://opentelemetry.io/docs/collector/components/processor/) of the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/). It translates span attribute labels from different LLM instrumentation frameworks into OpenTelemetry GenAI semantic conventions, prior to exporting it to your favourite OpenTelemetry backend.

## How it works

Here's 

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
