---
title: "Observability Mythbusters: Observability is NOT Only for SREs"
slug: observability-mythbusters-observability-is-not-only-for-sres
description: "A look at how Observability can help testers too!"
added: "May 12, 2022"
tags:
  - technical
  - observability
  - opentelemetry
  - sre
---

# Observability Mythbusters: Observability is NOT Only for SREs

![Colourful garage door in one of Toronto’s laneways features a painting of 3 rainbow horses lounging on a field with a sun wearing sunglasses.](https://cdn-images-1.medium.com/max/800/1*xPRyTvmqY1ExOsk4rh_6UQ.png)

Colourful garage door in one of Toronto’s laneways. Photo by [Adri Villela](https://adri-v.medium.com).

When we think about [Observability](https://adri-v.medium.com/list/unpacking-observability-be1835c6dd23), we usually think about it in terms of SREs or developers. After all, it’s a mighty powerful practice for helping troubleshoot applications in production. But what if I told you that Observability can fit into the world of QA? What would you say to that?

If you’re scratching your head, don’t worry. I had _never_ even considered Observability as a practice that could be leveraged by QA analysts. Until today, that is!

Today I met with [Parveen Khan](https://www.linkedin.com/in/parveen-khan), a Quality Advocate who reached out to me on [LinkedIn](https://www.linkedin.com/in/adrianavillela) after reading my [Unpacking Observability series on Medium](https://adri-v.medium.com/list/unpacking-observability-be1835c6dd23). She took a keen interest in Observability after noticing a few inefficiencies in her day-to-day work, and wanted to understand how it could make her work life better.

### Observability for Exploratory Testing

[The more Parveen learned about Observability, the more she wondered about how it could fit into her world as a tester](https://www.heavybit.com/library/podcasts/o11ycast/ep-26-unknown-unknowns-with-parveen-khan-of-square-marble-technology). Parveen’s focus is on [exploratory testing](https://www.atlassian.com/continuous-delivery/software-testing/exploratory-testing). It’s a mostly manual process, and it can be very time consuming. Especially when you encounter a bug. I can totally relate.

My first role out of university was as a QA tester. As a tester, I had to manually execute test scenarios written by the more senior QA analysts. One of the things that I remember about my short stint as a QA tester was the amount of waiting I did. After logging a bug with the development team, I would look for other test scenarios to run through. But sometimes I’d encounter a showstopper bug-the kind whereby I couldn’t do any more testing until it got fixed. And so, I found myself waiting and waiting and waiting until the bug got fixed. In my boredom, I taught myself SQL so that I could query the database to better understand why the code was barfing out. It also proved helpful in allowing me to relay more detailed information to the development team when I filed my bugs. Any developer will tell you that detailed bug descriptions are way more productive (and less anger-inducing) than “It doesn’t work.” or “It’s broken.”

As a QA tester, Parveen wondered, “If we had Observability baked into our app, then I could actually try to understand what’s going on in the app that I’m testing!” 💡 And along the same lines as my SQL queries helped the developers in my QA days, Parveen understood the benefits of having better Observability into the systems she was testing, because it both allows and empowers her (and her fellow testers) to dig into what’s going on in the app, and enables them to provide more context when filing a bug for the development team.

And she’s not alone in her thinking!

My lovely Twitter peeps directed me to the works of [Abby Bangser](https://twitter.com/a_bangser), who shares similar views in her [O11ycast Episode](https://www.heavybit.com/library/podcasts/o11ycast/ep-16-observability-and-test-engineers-with-abby-bangser-of-moo). She states that testers can use Observability to their advantage by having access to _relevant and explorable data_. As Parveen realized in her own explorations, this gives testers the ability to dig into the root cause of a bug, which is helpful for filing detailed bug reports to developers. But wait…there’s more! If a test engineer identifies a problem and isn’t able to track it down in the Observability back-end, it means that the telemetry data emitted by the application is lacking. That is, it shows that the code hasn’t been instrumented well enough, because it’s not exposing data that’s useful to us for troubleshooting!

But we can take this one step further.

### TDD, TBT and ODD…oh my!

Ensuring that your system is Observable means that you have to instrument your code. Awesome, right? Now, what if we turned code instrumentation into a quality gate? This means that one of the criteria for passing the tests in your CI/CD pipeline is ensuring that the code is instrumented.

But…how in Space can this be accomplished?? The answer is: with Trace-Driven Development (TDD — different from the [other TDD](https://en.wikipedia.org/wiki/Test-driven_development)), also known as Trace-Based Testing (TBT)! It was introduced by [Ted Young](https://twitter.com/tedsuo) at his [2018 KubeCon North America](https://www.youtube.com/watch?v=NU-fTr-udZg) talk. In it, he shares the idea of leveraging distributed traces to write application tests. If you’re already instrumenting your code and are therefore sending traces out to an Observability back-end, then why not take advantage of these traces and use them to write your tests?

You might be thinking, “Sure, that’s nice, but HOW do you do that?” Fortunately, there are a couple of new tools which do just that. Both [Malabi](https://www.aspecto.io/blog/trace-based-testing-with-opentelemetry-meet-open-source-malabi) and [Tracetest](http://tracetest.io) leverage OpenTelemetry (OTel) traces to define tests. [Malabi](https://github.com/aspecto-io/malabi) is an open-source TBT Javascript framework developed in 2021. [Tracetest](https://github.com/kubeshop/tracetest), which is also open-source and runs on Kubernetes, is a newer entrant into the game, [launched in April 2022](https://kubeshop.io/blog/introducing-tracetest-trace-based-testing-with-opentelemetry) (super fresh!), and [they were inspired by Ted’s KubeCon talk](https://discord.com/channels/884464549347074049/963470167327772703/968610163361730590)! How cool is that??

![Screen capture of the Tracetest Discord talking about how Ted Young’s KubeCon 2018 talk inspired the project.](https://cdn-images-1.medium.com/max/800/0*2MchYyNBFrQ-bflV.png)

Tracetest Discord chat. Tracetest got their inspiration from [Ted Young’s](https://twitter.com/tedsuo) [KubeCon 2018 talk](https://www.youtube.com/watch?v=NU-fTr-udZg).

> **Aside:** _At the time of Ted’s talk, Traces weren’t really standardized. OpenTelemetry, which was_ [_created in 2019_](https://www.cncf.io/blog/2021/08/26/opentelemetry-becomes-a-cncf-incubating-project/#:~:text=The%20OpenTelemetry%20project%20was%20created,CNCF%20Sandbox%20project%20shortly%20thereafter.)_, wasn’t even a thing at the time…so he was waaay ahead of his time!_

Yeah, yeah…that’s all well and good, but how does TBT help with quality gates? Well, if your QA test engineer writes their test automation by leveraging trace-based tests, it means that the traces must be present in the application code in order for them to be leveraged. The mere fact that the automated QA tests (which are part of the CI/CD pipeline) are written using TBT automagically makes it a quality gate. Ta-da! 🎉

Okay! We’re on a roll here! So we’re instrumenting code now. Yay! Well, if you’re going to instrument your code, then you might as well instrument as you’re _writing_ your code, because that’s just waaaay easier than trying to add instrumentation after the fact? Why? Because as you’re writing the code, it’s still fresh in your mind. It’s like writing comments as you code, compared to trying to understand someone else’s code and commenting after the fact.

> **Aside:** _You may find yourself in situations where you may need to instrument after the fact, like at one of my previous jobs, where some code hadn’t been instrumented at all. It’s not an ideal situation, but it’s better than nothing._

The act of instrumenting-as-you-code is known as [Observability-Driven Development](https://www.infoq.com/articles/observability-driven-development), or ODD. ODD is an extension of [Behaviour-Driven-Development](https://www.techtarget.com/searchsoftwarequality/definition/Behavior-driven-development-BDD) (BDD), which is about writing test cases around how a system behaves. Think of ODD as keeping Observability in mind as you code. If you needed to poke into your Observability back-end to troubleshoot an issue, what information would you need to include in your traces?

Now, don’t expect to get it right off the bat. That’s okay though. Testers can help tease out what’s missing in your instrumentation to make your system more observable, as we saw in the first section.

The point is that you’re instrumenting your code, and it can only get better from here!

### Conclusion

Chatting with Parveen about her [QA’s perspectives on Observability](https://www.parveenkhans.com/p/speaking-engagements.html?m=1) reminded me that Observability doesn’t reside only in the domain of developers and SREs. It applies quite well to QAs as well!

By bringing the Observability conversation to QAs, we see the following benefits:

*   QA testers are empowered to troubleshoot when they encounter a bug, and can file more detailed bug reports. ✅
*   Having a “tracing must be present” quality gate ensures that developers instrument their code with a trace-first approach. This is enabled through TBT, with modern tools like [Malabi](https://www.aspecto.io/blog/trace-based-testing-with-opentelemetry-meet-open-source-malabi) and [Tracetest](http://tracetest.io). ✅
*   Since traces must be present for QA test engineers to be able to write their automated tests, it “forces” developers to instrument-as-they-code, thereby adopting Observability-driven development practices. ✅

One final thought. Parveen said something that I thought was very powerful: instrumenting code wasn’t just for her. By making Observability a QA concern, she benefited those whose job it is to troubleshoot issues in production. That’s some powerful stuff!

Now, please enjoy this picture of my friend Lisa’s guinea pig, Taffy.

![Taffy the guinea pig in her cage. Her fur is a mix of caramel and brown.](https://cdn-images-1.medium.com/max/800/1*oKruP9fU2SkeBEFSbWHucw.jpeg)

Taffy the guinea pig. Photo by Lisa Richards.

Peace, love, and code. 🦄 🌈 💫

If you’d like to share stories of your Observability journey, or just ask Observability-related questions, hit me up on [Twitter](https://twitter.com/adrianamvillela). Hope to hear from y’all!

For more Observability articles, check out my Unpacking Observability series:

[**Unpacking Observability**  
_Stories to help you understand Observability and OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/be1835c6dd23 "https://adri-v.medium.com/list/be1835c6dd23")[](https://adri-v.medium.com/list/be1835c6dd23)

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/observability-mythbusters-observability-not-is-only-for-sres)_._

By [Adriana Villela](https://medium.com/@adri-v) on [May 12, 2022](https://medium.com/p/1161644b206b).

[Canonical link](https://medium.com/@adri-v/observability-mythbusters-observability-is-not-only-for-sres-1161644b206b)

Exported from [Medium](https://medium.com) on June 3, 2026.