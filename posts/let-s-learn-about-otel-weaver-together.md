---
title: "Let’s Learn About OTel Weaver Together"
slug: let-s-learn-about-otel-weaver-together
description: "A high-level overview of OTel’s schema and policy enforcement tool"
added: "May 06, 2026"
tags:
  - technical
  - opentelemetry
  - observability
---

# Let’s Learn About OTel Weaver Together

#### A high-level overview of OTel’s schema tool

![A well‑preserved ancient Greek temple with tall Doric columns stands in an open archaeological site, surrounded by small trees and a gravel path.](https://cdn-images-1.medium.com/max/800/1*_bsdkKlAdWmXO9K_UW65Ng.jpeg)

The Temple of Hephaestus in the Ancient Agora, Athens, Greece. Photo by author.

[OpenTelemetry (OTel) Weaver](https://github.com/open-telemetry/weaver) is one of the newer kids on the OpenTelemetry block, and like many new kids, it can be a bit mysterious.

Today, I’ll give you a high-level overview of OTel Weaver, so that you can better understand what it does, and how it can help your organization as it moves ahead in its OpenTelemetry journey.

### What is Weaver, anyway?

At its core, Weaver is a tool that allows you to create, document, and manage OpenTelemetry schemas and policies. But why should you care?

By defining and using a schema for your OpenTelemetry instrumentation, you ensure that everyone in your organization is speaking the same language. You establish:

*   Naming conventions
*   Spans, metrics, and logs (events) used by your application, and their attributes
*   Units of measure (metrics only)
*   Example values/format
*   Description of your telemetry
*   Stability level (in case something is still in the works, or is deprecated)
*   Policies

Policies are written in [Rego](https://www.openpolicyagent.org/docs/policy-language#why-use-rego), used by [OpenPolicy Agent (OPA)](https://www.openpolicyagent.org/docs/policy-language#why-use-rego) and can be used to define things such as:

*   Enforcing a prefix matching the company name for every custom metric, attribute, etc.
*   Requiring fields that are considered optional by the semantic conventions, such as `brief`
*   Validating the annotations attached to attributes and/or signals

Not only does Weaver let you define these, it can generate documentation (and/or code) for you, validate your schema, and enforce schema adherence. You can configure your CI process so that if someone introduces code that violates your schema and policies, that code is blocked from going into production until it’s fixed.

To use Weaver, you can either [run the Weaver binary locally (by building from source), or, if you’re lazy like me, you can run it via Docker.](https://github.com/open-telemetry/weaver#install)

### Weaver flow

To help you better understand how Weaver works, let’s look at what a Weaver workflow might look like.

![A simple four‑step flowchart showing “Create Schema,” “Create Templates (optional),” “Generate Files from Templates,” and “Validate in CI,” connected left to right.](https://cdn-images-1.medium.com/max/800/1*supsEsy-0MQM9QarM5hu-g.png)

OTel Weaver Flow

#### 1- Create schema

First things first — you must create a schema for your telemetry! You do this by creating YAML files to describe your telemetry schema — i.e. files that describe your spans, metrics, and events (logs).

The schema files should go into a special schema folder in your repository. You can call the folder whatever you want. For example: `[telemetry/registry](https://github.com/telemetrydrops/otel-in-practice/tree/main/stage-1-monolith/telemetry/registry)` or `[telemetry-schema](https://github.com/open-telemetry/opentelemetry-demo/tree/main/telemetry-schema)`.

The names of the YAML files also don’t matter, as Weaver will scan them and interpret them accordingly (as long as you provide the location of the schema files). Although the name doesn’t matter, you should call them something meaningful. 😜

As a best practice, you should create separate YAML files for spans, events (logs), metrics. If your application has multiple services, consider breaking each signal type down by service name. [You can see a great example here](https://github.com/open-telemetry/opentelemetry-demo/tree/main/telemetry-schema). Common attributes should be kept in a separate file so that [they can be referenced](https://github.com/open-telemetry/opentelemetry-demo/blob/05fab63b804f9d243c34ac624f0a9083bec92127/telemetry-schema/services/cart.yaml#L10-L14), avoiding repetition.

Once you’ve created your files, you validate them like this:

weaver registry check \\  
  --registry <path\_to\_registry>

This ensures that your YAML is formatted correctly. For example, do your metrics definitions include units?

Policy validation is optional, but if you’d like to be extra rigorous, you can add it to your validation process:

weaver registry check \\  
  --registry <path\_to\_registry>  
  --policy <path\_to\_policies>

#### 2- Create templates (optional)

Templates are [Jinja2 templates](https://jinja.palletsprojects.com/en/stable/) that Weaver can use to transform your YAML schema into code. This code can include but is not limited to: markdown, HTML files, document templates for Confluence, and data structures in your application code.

It’s important to note that this part isn’t done by Weaver. You have to create your own templates. This also means that you have to be familiar with Jinja2. For more information on how to create your own templates, [check out this example](https://telemetrydrops.com/blog/weaver-from-zero-to-hero/#step-2-generate-go-code).

Now, although Weaver itself doesn’t come with its own its own templates, some OTel projects have created their own:

*   [Java templates](https://github.com/open-telemetry/semantic-conventions-java/tree/main/buildscripts/templates/registry)
*   [Go templates](https://github.com/open-telemetry/opentelemetry-go/tree/main/semconv/templates/registry/go)
*   [Markdown templates for the OTel Demo](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/telemetry-docs/templates/markdown)

This means that can technically skip this step if there’s an existing template that works for you.

#### 3- Generate files from templates

With template files in hand, you can use Weaver to generate code from those templates (see step 2). That is, Weaver looks at your schema definitions, applies them to your templates, and then magically turns that into code.

This is done by running:

weaver registry generate \\  
  --registry <path\_to\_registry> \\  
  --template <path\_to\_templates> \\  
  <output\_path>

The template path can be either a local path or a remote path (e.g. GitHub repository). Check out a full example [here](https://telemetrydrops.com/blog/weaver-from-zero-to-hero/#step-2-generate-go-code).

#### 4- Validate your code in CI

Here, you can use Weaver’s `live-check` during test execution in your CI process, ensuring that the telemetry emitted by your application (e.g. via an [OTel Collector](https://opentelemetry.io/docs/collector/)) adheres to the schema and policies you wish to enforce.

The `live-check` produces a report telling you where you’re non-compliant. It exits with code `1` if there are any `violation` findings in the report. It also produces various stats in the report, such as `coverage`, which can be used to check if your tests have encompass the full registry.

Weaver’s `live-check` is incredibly flexible. It supports multiple:

*   input sources (e.g. file path, stdin, OTLP)
*   input formats (e.g. text, JSON)
*   output formats (e.g. YAML, JSON, JSONL)

It’s great to have all that flexibility, but so many options can also be a bit overwhelming!

One way to run it is like this:

weaver registry live-check \\  
  --registry <path\_to\_registry> \\  
  --policy <path\_to\_policies> \\  
  --input-source otlp \\  
  --format yaml  
  --output <path\_to\_report\_output> \\  
  --otlp-grpc-address 0.0.0.0 \\  
  --otlp-grpc-port 4318

Which runs a `live-check` on telemetry emitted by a Collector at address `0.0.0.0:4318`, checks it against the registry (`--registry` flag) and policies (`--policy` flag) provided, and outputs a YAML report to the specified path.

#### 5- Refactor!

If your CI process fails, you have to go back to the drawing board and refactor your code to ensure that it’s compliant. UGH! But wait — refactoring doesn’t have to be a nightmare, because [Weaver has an MCP server](https://github.com/open-telemetry/weaver/tree/main/crates/weaver_mcp) (`weaver registry mcp`) which, paired with your AI coding agent, can be used to help you refactor the code that failed the CI validation.

### Final thoughts

OTel Weaver, like many OpenTelemetry projects, can seem like a daunting beast at first. But once you understand how it works at a high level, it’s not quite so scary. I think it’s a really exciting project, and I can’t wait to see how it evolves!

Hopefully this overview will inspire you to check out Weaver for yourself. If you’d like to get more hands-on with Weaver, I suggest that you check out [Juraci Paixão Kröhling’s deep dive blog post into Weaver](https://telemetrydrops.com/blog/weaver-from-zero-to-hero/#what-hero-looks-like). I would also suggest checking out [this pull request on adding Weaver to the OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo/pull/2794). I learned a lot from both of these resources.

Also, the Weaver folks are always looking for contributors, so if you’d like to help out in any way (docs, bug fixes, etc.), say hello in the `[#otel-weaver](https://cloud-native.slack.com/archives/C0697EXNTL3)` channel on [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf).

Huge thanks as always to the lovely folks in the OpenTelemetry community who are always willing to answer my questions about how things work. Big shout-out to Martin Thwaites, Josh Suereth, and Jeremy Blythe, who [helped me unpack this tricky topic](https://cloud-native.slack.com/archives/C0697EXNTL3/p1778020437326969)!

And now, I’ll leave you with a photo of Barbie, the most extroverted of our rats, enjoying cuddles from my husband.

![A small white rat with light brown markings is cradled gently in both hands near a window, its whiskers forward as it looks to the side.](https://cdn-images-1.medium.com/max/800/1*HMCVGHAMs-sTlFLrjzBb5Q.jpeg)

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [May 6, 2026](https://medium.com/p/8f5700fefc11).

[Canonical link](https://medium.com/@adri-v/lets-learn-about-otel-weaver-together-8f5700fefc11)

Exported from [Medium](https://medium.com) on June 3, 2026.