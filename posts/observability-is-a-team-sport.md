---
title: "Observability is a Team Sport"
slug: observability-is-a-team-sport
description: "Why having an “Observability team” is a bad idea"
added: "Apr 23, 2025"
tags:
  - technical
  - observability
  - thought-leadership
---

# Observability is a Team Sport

#### Why having an “Observability team” is a bad idea

![The Rosetta Stone, an ancient Egyptian artifact, featuring inscriptions in three scripts: hieroglyphic, demotic, and Greek. This stone was crucial in deciphering Egyptian hieroglyphs, as scholars could compare the identical text across the three scripts to unlock their meaning.](https://cdn-images-1.medium.com/max/800/1*7q6giAkvicZHSRq8Suvy6g.jpeg)

A portion of the Rosetta Stone. Photo taken at the British Museum by [Adriana Villela](https://adri-v.medium.com).

Observability may have been a newcomer few years ago, but it’s safe to say that it’s a pretty well-established part of our tech lives today. As a bona fide Observability fan, this makes me veeeeeery happy. Who doesn’t love being able to understand their systems better??

What _doesn’t_ get me excited is the rise of the so-called “Observability team”. I may be offending a lot of people when I say this, but… I. HATE. IT.

When I hear that an organization has an “Observability team”, I often hear alarm bells ringing in my head. It basically tells me that Observability exists in that organization as a silo, when in fact, Observability makes its way into _many_ aspects of an organization and therefore [should be treated as a team sport](https://medium.com/@adri-v/observability-mythbusters-observability-is-not-only-for-sres-1161644b206b)

But before we move ahead, let’s start with a refresher [definition of Observability](https://hazelweakly.me/blog/redefining-observability/), from my good friend, [Hazel Weakly](https://www.linkedin.com/in/hazelweakly/):

> “Observability is the process through which one develops the ability to ask meaningful questions, get useful answers, and act effectively on what you learn.”

Cool. But as we know, our systems need to emit data in order for them to be considered observable. No data means that we can’t ask questions about our systems, let alone get the answers that we seek. Luckily, we have [OpenTelemetry](https://opentelemetry.io) (OTel), which has been embraced by end users and Observability vendors alike, as the de-facto standard for instrumenting, generating, collecting, and exporting telemetry data.

Okay. But how does this all fit in with my dislike of “Observability teams”? Let’s dig in.

### Observability is everyone’s responsibility

Reliability can’t happen without Observability. Observability must be looked at holistically. It is not the sole responsibility of any one team or individual. Everyone has an important part to play, and to a certain extent, the parts weave into each other.

#### 1- Instrumenting code

OpenTelemetry offers two types of instrumentation: [code-based instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/code-based/) (aka manual instrumentation), and [zero-code instrumentation](https://opentelemetry.io/docs/concepts/instrumentation/zero-code/) (aka automatic or auto-instrumentation).

[Code-based instrumentation should be done by application developers](https://youtube.com/shorts/c5mz1ZX6Tqw?feature=share), and **_not_** by an “Observability team”. Developers know their applications best. Asking someone else to instrument your application is like asking someone to write your code comments for you. No, with a side order of nope.

Zero-code instrumentation usually involves a shim or bytecode instrumentation wrapper around your code. If you’re a developer writing code in a language that [supports OTel auto-instrumentation](https://opentelemetry.io/docs/zero-code/), I would hope that you would know how to implement both zero-code and code-based instrumentation. After all, you can use the instrumentation to \*gasp\* troubleshoot your own code! (More on that later.)

And then there’s another scenario. Zero-code instrumentation can be managed by the [OTel Operator](https://medium.com/dev-genius/lets-learn-about-auto-instrumentation-with-the-otel-operator-2cdc8a532514). If this is the case in your non-dev environments, then the responsibility might fall under an SRE or Platform Engineering (PE) team. In my ideal world, developers should still have have oversight/knowledge when it comes to configuring zero-code instrumentation with the OTel Operator.

#### 2- Managing Observability infrastructure

You’re going to have to manage Observability infrastructure, whether you’re using a SaaS vendor (e.g. [Dynatrace](https://dynatrace.com)) or a home-grown open source solution (e.g. [Grafana](https://grafana.com) for dashboards, [Prometheus](https://prometheus.io) for metrics, [Jaeger](https://www.jaegertracing.io/) for traces, [OpenSearch](https://opensearch.org/) for logs), because if you’re using OTel, chances are, you’re managing **_at least_** one [OTel Collector](https://opentelemetry.io/docs/collector/), if not more. And if you’re running your applications on a container orchestrator (e.g. Kubernetes or Nomad), then you’ll probably be managing and deploying Collectors in the orchestrator as well. In this case, managing Collectors would primarily fall under a Platform Engineering or SRE team.

In addition…if you’re following [proper Collector practices](https://medium.com/@adri-v/otel-collector-anti-patterns-43dca4a857a0) (you ARE, aren’t you?), then you should also be [building your own Collector distribution](https://medium.com/womenintechnology/so-you-built-a-custom-collector-with-the-opentelemetry-collector-builder-now-what-6588952ee6c5), and that would likely fall under a Platform Engineering team.

All that aside, I personally think that it’s probably a good idea for developers to know how to configure the OTel Collector. While it’s true that [you don’t need to go through a Collector to send OTel data to an Observability backend](https://opentelemetry.io/docs/collector/deployment/no-collector/), for non-production, the [Collector still offers some nice things that direct-from-application doesn’t](https://medium.com/@adri-v/otel-collector-anti-patterns-43dca4a857a0), and I still highly recommend using it, even in development.

#### 3- Making CI/CD pipelines observable

DevOps engineers can’t escape Observability either, because guess what? We can make CI/CD pipelines observable too! While CI/CD pipelines may not be a production environment that **_external_** users interact with, they most certainly are a production environment that **_internal_** users (i.e. software engineers, Platform Engineers, and SREs) interact with.

CI/CD pipelines are defined by code, and like it or not, that code **_can still fail_**. Making our application code observable helps us make sense of things when they fail in production. So it stands to reason that having pipeline Observability can help us understand what’s going on when CI/CD pipelines fail.

There’s been some great buzz around the Observability of CI/CD pipelines, especially now that there’s an official [OTel CI/CD Special Interest Group (SIG)](https://github.com/open-telemetry/community/blob/main/projects/ci-cd.md). This will give our favourite CI/CD tools a shared language for the Observability of CI/CD pipelines, creating a foundation for them to support OpenTelemetry in this context.

We’re not there yet, which means that right now [we must stitch a few tools together to achieve CI/CD Observability](https://youtu.be/h1miFQbeYWA?si=uZIvHxpBDBGo8m5w). But things are moving along nicely in this space, and if you haven’t considered CI/CD pipeline Observability in your organization before, now’s the time to start thinking about it. To learn more about what’s happening with OTel CI/CD Observability, check out the `[#otel-cicd](https://cloud-native.slack.com/archives/C0598R66XAP)` channel on [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf).

#### 4- Troubleshooting

The beauty of Observability is that once you instrument your code, you put the ability to troubleshoot in the hands of many! Consider the ripple effect when developers instrument their code:

*   **Developers:** Instrumentation allows developers to debug their code as they’re writing it.
*   **QA testers:** Instrumentation allows testers to troubleshoot failed tests, allowing them to file more detailed bug reports. If QAs can’t track down the issue, then it means that there is missing instrumentation that developers need to add to their code.
*   **SREs:** Instrumentation allows SREs to troubleshoot production issues, gain insight into system performance, and ensure overall system reliability.

#### **5- Ensuring adherence to Observability practices**

If there’s one place where I might make a teeny weeny concession on having an “Observability team”, it would be having an oversight and advocacy team that defines and disseminates Observability standards and practices within an organization. It needs to stay up to date in the latest Observability practices, vendor offerings, and OpenTelemetry — not just as an observer, but also as a project contributor, while also encouraging developers, PEs, and SREs to contribute.

If Observability is to be a team sport, it shouldn’t be a free-for-all, where everyone does whatever the hell they want. There should be guardrails in place, to ensure that you have standard tooling, practices, and enforcement of said practices. Practices and standards include things like standard Collector configurations, and standard attributes emitted to your chosen Observability backend(s).

Standardizing on tooling is important because I’ve seen far too many “tool jungles” in organizations, where each team or department has their own tooling and practices and it ends up being a recipe for disaster. Too much redundancy and overlap.

This “Observability practices team”, however, can’t exist on an island. First off, it needs to be aligned with leadership to ensure that everyone is on the same page when it comes to Observability. If you don’t have leadership support, you might as well throw in the towel, because trying to get \*anything\* done will be nearly impossible. That said, the team also needs support from individual practitioners. As a result, the team also needs to work with developers, SREs, Platform Engineers, QAs, and DevOps Engineers in order to ensure that the practices and standards that it comes up with make sense.

That said, the Observability practices team should **_not_** be responsible for instrumenting developers’ code, nor should it be managing infrastructure. It’s there to work with these other groups and to make sure that things are done right.

### Final Thoughts

In much the same way that DevOps was meant to break silos and instead, our industry birthed Yet Another Silo™ by creating “DevOps teams”, I fear that we may be headed in that same direction with so-called “Observability teams”.

As we saw today, Observability weaves its way into various aspects of an organization. Reducing it to a single “Observability team” downplays its importance, takes away our collective responsibility towards Observability, and dilutes the promise of Observability. BUT…the only way to make this work is by ensuring that the teams participating in this team sport that we call Observability don’t themselves operate in silos. Otherwise, we’re right back into the same pickle. Food for thought.

And now, I’ll leave you with a photo of my new baby rat, Barbie.

![A small white rat peeks out from inside a cardboard tube in a colorful bedding of a pet enclosure. The bedding consists of shredded paper in shades of pink, blue, green, and purple. There are various items scattered around, including pieces of paper towel, a green chew stick, and a black bowl with some food pellets. An orange plastic structure is partially visible in the background.](https://cdn-images-1.medium.com/max/800/1*nE6uhK4nL4M_Rs50fuBslw.jpeg)

Barbie is so teeny that she can fit through a paper towel tube!

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [April 23, 2025](https://medium.com/p/168277f3eb93).

[Canonical link](https://medium.com/@adri-v/observability-is-a-team-sport-168277f3eb93)

Exported from [Medium](https://medium.com) on June 3, 2026.