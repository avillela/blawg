---
title: "Let’s Learn About OTel Arrow Together"
slug: let-s-learn-about-otel-arrow-together
description: "Learn how OpenTelemetry + Apache Arrow are a winning combination, and why"
added: "May 11, 2026"
tags:
  - technical
  - opentelemetry
  - observability
---

# Let’s Learn About OTel Arrow Together

#### Learn how OpenTelemetry + Apache Arrow are a winning combination, and why

![A red paper‑cut cat with floral patterns hangs on a light wall, surrounded by trailing green pothos vines that frame the artwork with soft, natural curves.](https://cdn-images-1.medium.com/max/800/1*gPL4UvmuoUZnSdHvwztpEg.jpeg)

Wall art at [Grey Tiger](https://www.greytiger.ca/) Toronto. Photo by author.

The [OpenTelemetry (OTel)](https://opentelemetry.io) ecosystem has grown and matured a LOT since its inception in 2019. Traces, logs, and metrics have reached general availability (GA). [Profiling](https://opentelemetry.io/blog/2024/profiling/?utm_source=copilot.com) was added as a new OTel signal. The [OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) has expanded. The [OTel Collector](https://github.com/open-telemetry/opentelemetry-collector) has expanded, with new components being added regularly. We’ve seen the addition of new components to the OTel ecosystem to help make it more ergonomic, including [OpAMP](https://medium.com/womenintechnology/opentelemetry-opamp-for-you-and-me-dcc6f84a2e32), the [OTel Operator](https://adri-v.medium.com/list/opentelemetry-operator-0ee6378d630a), [OTel Weaver](https://medium.com/womenintechnology/lets-learn-about-otel-weaver-together-8f5700fefc11), and OTel Arrow.

More organizations are adopting OpenTelemetry, and as they start emitting more OTel data, they’re starting to see scaling issues. One such issue is the explosion of telemetry data, which translates to increased pressure on resources and increased costs associated with telemetry. Organizations obviously see value in making their systems observable, but they’re probably not super excited about spending a small fortune to do it. So what’s the solution?

Before we get to that, let’s dig into the problem a bit more.

### OTLP is great, until it isn’t

OpenTelemetry uses the [OTLP protobuf](https://github.com/open-telemetry/opentelemetry-proto) data format, which is not optimized for managing high volumes of telemetry data. This is because:

*   **Telemetry data is hierarchical**: Protobuf must recursively encode and decode the data, which is CPU intensive.
*   **OTLP is row-based**: Each record is stored as a single message. This becomes expensive for duplicate (common) values.
*   **Serialization/deserialization is expensive**: The path SDK → Collector → Backend requires encoding/decoding. Again, this is CPU intensive, memory intensive, and causes latency.

This is where [OpenTelemetry Protocol with Apache Arrow (OTAP or OTel Arrow)](https://github.com/open-telemetry/otel-arrow#opentelemetry-protocol-with-apache-arrow) comes to the rescue.

OTel Arrow is based on the [Apache Arrow framework](https://arrow.apache.org), and serves as both a data format (how data is structured) and a transport protocol (how data moves between systems).

It converts OpenTelemetry OTLP data into [Apache Arrow’s columnar format](https://arrow.apache.org/docs/format/Columnar.html), providing a more efficient way to represent in-memory batches of OTel signals. OTel Arrow helps thanks to its:

*   **Columnar format:** This is optimized for analytics and data storage (optimized for compression). It also reduces data duplication. Repeated data is stored once in a dictionary. “Duplicated” data is replaced by a pointer to the “source of truth” dictionary item.
*   **Zero-copy data sharing:** When data moves between components, you need to serialize it, copy it to a new buffer, deserialize it, and allocate new memory storage. Zero copy means that everything stays in the same memory buffer. This saves on CPU, lowers memory pressure, and reduces latency.

OTel Arrow is optimized for:

*   High telemetry volume
*   Multi-cloud or multi-region deployments
*   Systems with bandwidth constraints

### OTel Arrow at work

Awesome, but how is OTel Arrow implemented?

#### Phase 1

OTel Arrow is currently implemented in the OTel Collector via the [OTel Arrow Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/otelarrowexporter/README.md), which emits data to a backend that accepts OTAP.

![A block diagram of an OpenTelemetry Collector. Inside a dark gray box labeled “OTel Collector” are three components arranged left to right: a pink “OTLP Receiver,” a blue “Processor(s),” and a pink “Arrow Exporter.” An arrow flows from the receiver to the processors to the exporter. A final arrow leads from the exporter to a green box labeled “Telemetry Backend,” showing the data flow out of the collector.](https://cdn-images-1.medium.com/max/800/1*r63RxhmcQ_QpypNGpEk5LQ.png)

OTel Arrow is currently available as a component of the OTel Collector

BUT…Since most telemetry backends don’t accept OTAP out of the box, you’ll likely need to add in an OTel Collector Gateway to ingest OTAP data via the [Arrow OTLP Receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/otelarrowreceiver/README.md) and export OTLP to your OTLP-compatible observability backend.

![A two‑stage diagram. The first stage, labeled “OTel Collector,” contains three components — “OTLP Receiver,” “Processor(s),” and “Arrow Exporter” — connected left to right. An arrow leads to the second stage, “OTel Collector Gateway,” which contains “Arrow OTLP Receiver,” “Processor(s),” and “OTLP Exporter,” also connected in sequence. A final arrow flows from the OTLP Exporter to a green box labeled “Telemetry Backend,” showing end‑to‑end data flow through collector and gateway layers.](https://cdn-images-1.medium.com/max/800/1*yAf9KBI17vlH_ohsI3jhTQ.png)

Most backends to ingest OTAP natively, so you need a Collector gateway to translate to OTLP first

> ✨**NOTE:** If you’d like to see some examples in action, [check out this article](https://oneuptime.com/blog/post/2026-02-06-otel-arrow-exporter-opentelemetry-collector/view).

If you’re looking at the above diagram and are thinking that this feels like a lot of steps and that we’re losing some efficiency having to convert from OTAP back to OTLP, you’re not wrong. This is where Phase 2 of the project comes in.

#### Phase 2

To get even more out of OTel Arrow, the project maintainers are working on Phase 2, the [OpenTelemetry Arrow Dataflow Engine](https://github.com/open-telemetry/otel-arrow/tree/main/rust/otap-dataflow), which is nearing completion. The dataflow engine is written from the ground up in [Rust](https://rust-lang.org), providing lower-level control, better performance characteristics, and elimination of garbage collection-related issues. The end result will be more performant, provide better compression, and have lower latency than through the current OTel Collector and OTAP exporter combination.

When completed, the new flow will look like this, with the OTel Arrow Dataflow Engine taking the place of the OTel Collector.

![A block diagram labeled “OTel Arrow Dataflow Engine.” Inside a dark blue box are three components arranged left to right: “OTLP Receiver,” “Processor(s),” and “OTAP Exporter.” An arrow flows through them in sequence. A final arrow leads from the OTAP Exporter to a green box labeled “Telemetry Backend,” showing the end‑to‑end data path.](https://cdn-images-1.medium.com/max/800/1*FnFLMbgdoq9rfuCGikNm1g.png)

The OTel Arrow Dataflow Engine replaces the OTel Collector and leverages the full power of OTel Arrow

Using OTel Arrow currently results in a [50% reduction in bandwidth](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/otelarrowexporter#getting-started). This number was reached by benchmarking against the same data being of equal batch sizes sent using standard OTLP/gRPC with Zstd compression (fancy compression algorithm). OTel Arrow also boasts a [compression factors of 15x-30x compared to uncompressed data](https://uptrace.dev/ingest/otelarrow#key-benefits). Even greater overall gains are expected for Phase 2.

To learn more about OTel Arrow Phase 2, check out [this blog post on](https://opentelemetry.io/blog/2025/otel-arrow-phase-2/) [opentelemetry.io](http://opentelemetry.io).

### Final thoughts

OTel Arrow is pretty damn cool, if I do say so myself. I think the coolest thing about it isn’t what it has achieved (which, yes, is amazing), but the fact that folks involved in OTel are always looking to experiment, improve, and push boundaries, finding ways to combine technologies.

Does OTel Arrow make sense for your organization? If telemetry volume, bandwidth, and cross-network traffic are an issue for you, then, by all means, check it out. Otherwise, good ’ole OTLP is perfectly fine!

Now, you might be wondering…will the OTel Arrow Dataflow Engine replace the Collector? That is a question that only the OpenTelemetry Gods can answer. At any rate, OTel Arrow is a project definitely worth keeping a close eye on!

As a final note, I’d like to thank Cijo Thomas, Josh MacDonald, and Laurent Quérel of the OTel Arrow project for helping me unpack this super cool project.

And now, please enjoy Penny and Duckie, enjoying an afternoon cuddle in their hammock.

![Two rats snuggled together in a soft, furry bed. The rat in front has brown‑and‑white fur with a pink nose and long whiskers, while the lighter‑colored rat behind it rests closely against its side, both appearing relaxed and cozy.](https://cdn-images-1.medium.com/max/800/1*c_URVuIKdwK3Iw5e7d0hew.jpeg)

Sleepy rats: Penny and Duckie enjoying an afternoon cuddle in their hammock.

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [May 11, 2026](https://medium.com/p/af10e604656d).

[Canonical link](https://medium.com/@adri-v/lets-learn-about-otel-arrow-together-af10e604656d)

Exported from [Medium](https://medium.com) on June 3, 2026.