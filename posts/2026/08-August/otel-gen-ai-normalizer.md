---
title: Let's Learn About the OpenTelemetry GenAI Normalizer
slug: otel-gen-ai-normalizer
description: LLM observability with standardized OTel AI semantic conventions
tags:
  - technical
  - ai
  - open-telemetry
  - observability
  - otel-collector
  - '2026'
added: 2026-08-12T00:00:00.000Z
---

![A slender, long‑snouted fish swims just below the surface of clear blue water, its body lit by rippled sunlight over a sandy seabed.](/images/posts/otel-gen-ai-normalizer/swordfish.jpg)


[OpenTelemetry (OTel)](https://opentelemetry.io) has given us a standard, vendor-neutral way for instrumenting applications. But what about when our applications make LLM calls?

Application observability shouldn't stop at LLM calls. And when your LLM does something that you weren't expecting, understanding what it did, and why, it important so that you can mitigate future disastrous outcomes. Because let's face it: bad things can and will happen with tech, and we can't avoid them. But we can take measures to make them suck less.

Frameworks such as [OpenLLMetry](https://www.traceloop.com/docs/openllmetry/introduction) and [OpenInference](https://arize.com/glossary/openinference/) make LLM applications observable by auto-instrumenting LLM SDKs from popular providers such as OpenAI, Anthropic, and Gemini. This means that not only is the application itself instrumented via the popular language-specific [OpenTelemetry SDKs](https://opentelemetry.io/docs/languages/sdk-configuration/) that we know and love, the LLM calls *within* those applications are also instrumented. 🎉

Unfortunately, not all tools are created equal. LLM provider support varies among these tools. Additionally, each tool uses different span attribute names to describe the telemetry being emitted. And we all know how fun it is when we have competing standards. [Blu-ray](https://en.wikipedia.org/wiki/Blu-ray) vs [HD DVD](https://en.wikipedia.org/wiki/HD_DVD), anyone?

To help bridge that gap, OpenTelemetry created the [Generative AI Semantic Conventions](https://github.com/open-telemetry/semantic-conventions-genai), providing a common language for LLM application instrumentation.

But how do you ensure that the likes of OpenLLMetry and OpenInference follow these semantic conventions? Even if they agree to adhere to the new conventions, implementing these changes can take time. This is where the [OpenTelemetry GenAI Normalizer](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/genainormalizerprocessor) comes in. The GenAI Normalizer is a [processor](https://opentelemetry.io/docs/collector/components/processor/) of the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/). It translates span attribute labels from different LLM instrumentation frameworks into OpenTelemetry GenAI semantic conventions, prior to exporting it to your favourite OpenTelemetry backend.

## How it works

To use the GenAI normalizer, you will need to run version `0.153.0` or higher of the OpenTelemetry Collector. You can find it in the [`opentelemetry-collector-contrib` repository on GitHub](https://github.com/open-telemetry/opentelemetry-collector-contrib), or [build your own Collector distriution](/post/so-you-built-a-custom-collector-with-the-opentelemetry-collector-builder-now-what/) which includes this processor.

In your Collector config YAML, you will need to define it in the `processors` section, like this:

```yaml
processors:
  gen_ai_normalizer:
    overwrite_schema_url: false
    sources:
      - name: openinference
        remove_originals: false
      - name: openllmetry
        remove_originals: false
```

Let's dig into what these configurations mean.

* **`overwrite_schema_url`**: The schema URL indicates the version of the semantic conventions used when the data was produced. It is set to `false` by default. There is no right or wrong setting for this attribute. You should set it to `true` if you're confident that all attributes that you're using have been normalized, in which case, the schema URL is the OTel GenAI schema URL. If not, leave it as `false`, in which case the schema URL is your original framework's schema URL.

* **`sources`**: Specifies the sources of LLM telemetry. Since `sources` is an array, you can normalize data from multiple LLM frameworks at once. This is especially useful if some of your LLM applications are instrumented using OpenInference, and some are instrumented using OpenLLMetry, for example.

  This processor currently only supports two built-in sources, `openinference` and `openllmetry`, which includes all the mappings done for you. You can also [configure your own additional sources](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/genainormalizerprocessor#user-defined-sources), but you have to define all the mappings yourself, which I imagine is a super fun exercise in self-torture. 🫠

* **`sources.remove_originals`**: This is set to `false` by default. If set to `true`, it removes the original source attributes once the mapping is done. When you first play around with this processor, consider leaving it set to `false`, so that you can appreciate that nice side-by-side comparison of the "before" and "after".

But configuring the processor is only part of the story. You must also add it to your `traces` pipeline in your Collector config YAML:

```yaml
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [gen_ai_normalizer]
      exporters: [debug, otlp_http/jaeger]
```

In case you're wondering, the GenAI Normalizer only applies to `traces` pipelines. If you add the processor to the `metrics` or `logs` pipelines, your OTel Collector will throw an error and will fail to start up. Don't make the same mistake I made. 🙃

## The output

So what does it actually look like when you run the GenAI normalizer? Well, I put it to the test myself by running two sample applications.

I asked Claude to write me a simple Python program that makes a Claude API call. (Feels so meta!)

One version of the program instruments the Claude API call using OpenLLMetry.

```
OpenLLMetry sample app
  └── OpenLLMetry (traceloop-sdk)     ← wraps the Python OTel SDK
        └── Python OTel SDK
              └── auto-instruments anthropic.messages.create()
                    └── OTLP HTTP → OTel Collector → OTel backend
```

Another version instruments the Claude API call using OpenInference.

```
OpenInference sample app
  └── OpenInference (AnthropicInstrumentor)   ← patches Anthropic SDK
        └── Python OTel SDK
              └── OTLP HTTP → OTel Collector → OTel backend
```

Here's a sample of the OpenInference output:

![A screenshot of an OpenInference trace log showing input and output message fields, token usage, and metadata from a quantum‑mechanics analogy exchange.](/images/posts/otel-gen-ai-normalizer/openinference-spans.png)


I highlighted a couple of OpenInference attributes (`llm.*` prefix) above in red, along with their equivalent OTel ones (`gen_ai.*`) in magenta.

You can see the full list of mappings are between OpenInference and the OTel GenAI semantic conventions [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/genainormalizerprocessor#openinference).


And for comparison, here's a sample of the OpenLLMetry output:

![A screenshot of an OpenLLMetry trace log showing input and output message fields, token usage, and metadata from a quantum‑mechanics analogy exchange.](/images/posts/otel-gen-ai-normalizer/openllmetry-spans.png)

According to the [GenAI Normalizer docs](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/genainormalizerprocessor#user-defined-sources), I should be seeing a number of `llm.*` and `traceloop.*` attributes in addition to the `gen_ai.*` attributes in my trace output. But alas, I didn't see any `llm.*` attributes. So what was going on??

Well, it turns out that newer versions of OpenLLMetry are already implement a number of OTel GenAI semantic conventions. How cool is that?

## Final thoughts

It's an exciting time for LLM observability. It feels like things are really picking up steam!

In June 2026, [Arize](https://arize.com/), creator of OpenInference, [donated OpenInference to OpenTelemetry](https://github.com/open-telemetry/community/issues/3467).

To add to the mix, the OpenTelemetry folks are also working on a project called [OpenTelemetry GenAI Instrumentation](https://cloud-native.slack.com/archives/C06KR7ARS3X) which is an OTel-native approach to LLM observability. It is [currently only available for Python](https://github.com/open-telemetry/opentelemetry-python-genai), with plans to add support for Typescript and Java in the near future.

Now, you might be wondering...won't this clash with the recent OpenInference donation to OTel? Great question! It turns out that the OpenInference donation will serve as the foundation for the OpenTelemetry GenAI project. The project also aims to cover broader areas and support more operations than OpenInference. Learn more [here](https://cloud-native.slack.com/archives/C06KR7ARS3X/p1786559101447759).

And now, please enjoy a photo my rat Duckie, hamming it up for the camera.

![A light‑colored rat inside a cage reaches toward a human hand, surrounded by shredded paper bedding and a torn cardboard box.](/images/posts/otel-gen-ai-normalizer/duckie.jpg)

Until next time, peace, love, and code. 🖖💜👩‍💻