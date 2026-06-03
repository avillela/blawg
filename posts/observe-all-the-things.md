---
title: "Observe All The Things"
slug: observe-all-the-things
description: "The Importance of Making Data Accessible"
added: "Apr 25, 2025"
tags:
  - technical
  - observability
  - opentelemetry
---

# Observe All The Things

#### The Importance of Making Data Accessible

![The image shows a tiled floor with the word “HELLO” spelled out in large, black, capital letters. The tiles are small and square, with a white background and black lines forming the letters and a border around the word. The word “HELLO” is centered within the border.](https://cdn-images-1.medium.com/max/800/1*gAIpfkR_L_va-84zRx30yw.jpeg)

Hello!

What if I told you that **_there is an entire world out there beyond our tech bubble that could benefit from the power of Observability_**? Would you believe me?

Consider [this definition of Observability](https://hazelweakly.me/blog/redefining-observability/), by my awesomely talented friend, [Hazel Weakly](https://www.linkedin.com/in/hazelweakly/):

> _“Observability is the process through which one develops the ability to ask meaningful questions, get useful answers, and act effectively on what you learn.”_

I don’t know about you, but that definition sounds like it could definitely apply to stuff outside of tech…don’t you?

Consider the fact that **_our daily lives are made up of workflows_**. A workflow is a series of related tasks strung together to accomplish a certain goal. For example:

*   Driving your kid(s) to school
*   Commuting to and from work
*   Getting ready for work in the morning
*   Cooking an evening meal

These are examples of “personal”, or “individual” workflows that are unique to you.

There are also “shared” workflows, that affect groups of people. For example:

*   Applying for a job
*   Onboarding a new employee at a company
*   Responding to natural disasters caused by climate change (e.g. forest fires, floods)
*   Going to the emergency room (ER)

As an Observability geek, these are the types of workflows that most interest me. Why? Because Observability can help us gain deeper insights into our workflows. By understanding what’s truly happening, we can pinpoint and eliminate bottlenecks, fine-tune processes, and enhance overall efficiency. That is, it enables us to take meaningful action based on what we’ve learned.

Show me one person who hasn’t complained about ER wait times or who hasn’t complained about getting ghosted when applying for a job. Yeah. Exactly. We need this.

So this begs the question…how can we extend Observability beyond our little tech bubble? Luckily for us, we already existing tooling at our disposal:

*   [OpenTelemetry](https://opentelemetry.io) (OTel) as a standard for generating, collecting, and exporting telemetry data
*   Observability backends that help us interpret and the OTel data so that we can make improvements

![A cartoon character with a wide-open mouth and bulging eyes, wearing a pink shirt, enthusiastically raises one arm. The background is filled with bright yellow rays. The text at the top of the image reads “OTEL ALL THE THINGS!”](https://cdn-images-1.medium.com/max/800/1*f-EZTLuJAUsiqIbCRjeEZg.jpeg)

Source: [imgflip.com](https://imgflip.com/i/9o1he9)

Okay…but how? Let’s look at an example, shall we?

#### Going to the emergency room

In Canada, where I live, we are fortunate to have government-provided healthcare; however, we’re certainly not immune to things like long ER wait times. Imagine if we could use Observability to improve ER workflows?

Using OpenTelemetry, we could use traces to capture the end-to-end ER workflow. Spans would represent each step in the workflow:

*   intake/registration
*   triage
*   sitting in the waiting room
*   being brought in to an exam area to be seen by a doctor
*   waiting in the exam to be seen by a doctor
*   speaking to the doctor
*   getting tests
*   waiting for tests
*   speaking to the doctor about test results
*   being discharged

We can add attributes to further enrich our spans. For example:

*   name of triage nurse
*   name of examining physician
*   medications prescribed
*   tests and/or imaging ordered

We can add logs to capture more detailed information, and correlate them to our spans:

*   triage nurse’s notes
*   doctor’s exam notes
*   discharge notes
*   patient feedback

And what about metrics? Span duration can be expressed as a metric. This can help us identify bottlenecks in our workflow. We can also use metrics to provide additional quantitative data about our workflow. For example:

*   average time spent in the waiting room by severity of case
*   average time spent in the waiting room by time of day, day of the week, time of the year (e.g. holidays vs. non-holidays)
*   average nurse and physician shift time
*   number of patients per case type (e.g. heart attacks, strokes, car accidents, animal bites)
*   number of patients by age group

We can then send the OpenTelemetry data to an Observability backend. This allows us to analyze and interpret the data, and identify areas of improvement, so that decision makers can implement these improvements.

### Final Thoughts

As we saw today, we already have standards and tools for gathering telemetry, so why not use them? OpenTelemetry can help us instrument our workflows, and existing Observability backends can help us make sense of the data, allowing us to gain better insights into these workflows, enabling us to improve them.

Before we part ways, I will leave you with [one last quote from Hazel Weakly](https://bsky.app/profile/hazelweakly.me/post/3llfkxh4spc2l):

> “In a world where every team is expected to bring value to the company, in a world where we need to understand systems of ever increasing complexity, why would we POSSIBLY think that we can get away with siloing away our knowledge and understanding our observability systems inside our own companies?”

And now please enjoy a photo of my baby rat, Barbie, taken a couple of days after we got her. She looks very much at home in her little sphere.

![A small white rat is peeking out from an orange and yellow plastic dome-shaped hideout. The hideout is placed on colorful bedding made of shredded paper in a pet enclosure. Nearby, there’s a cardboard tube, and a piece of white fabric is draped over the top of the hideout.](https://cdn-images-1.medium.com/max/800/1*aTVvmDur9HyAlkERl5yM0g.jpeg)

Barbie looking cozy in her little house.

Until next time, peace, love, and code. ✌️💜👩‍💻

### Appendix

This blog post is based on a talk that my good friend [Marino Wijay](https://www.linkedin.com/in/mwijay/) and I gave at Observability Day EU 2025. I was supposed to give the talk with my other good friend, [Tim Banks](https://www.linkedin.com/in/timjb/), who, unfortunately couldn’t make it to KubeCon. You can watch the recording here:

Observability Day EU 2025 talk with Adriana Villela and Marino Wijay

By [Adriana Villela](https://medium.com/@adri-v) on [April 25, 2025](https://medium.com/p/0a839ed6db34).

[Canonical link](https://medium.com/@adri-v/observe-all-the-things-0a839ed6db34)

Exported from [Medium](https://medium.com) on June 3, 2026.