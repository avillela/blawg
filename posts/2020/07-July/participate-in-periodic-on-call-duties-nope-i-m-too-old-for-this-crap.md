---
title: "Participate in periodic on-call duties?! Nope. I’m too old for this crap."
slug: participate-in-periodic-on-call-duties-nope-i-m-too-old-for-this-crap
description: "The difference between DevOps, SRE, and Ops"
added: "Jul 17, 2020"
tags:
  - technical
  - sre
  - thought-leadership
  - "2020"
---


![](https://cdn-images-1.medium.com/max/800/1*-cBshqr9P8wYOgE8hVcOYA.jpeg)

The other day, a recruiter sent me a job description for an SRE Manager role. Some highlights from the JD:

*   The best candidates will have both strong bare metal Linux / Systems  
    expertise and proven Cloud Architecture & Operations skills.
*   Deep understanding of the Linux Operating System, including: Kernel,  
    Memory, Process, Threads, Static / Shared Libraries, IPC, Signals.
*   Participate in periodic on-call duties.
*   Have 5+ years of software support, reliability, or operations engineering experience.

Smells like an Ops Manager role to me.

Another nugget of fun that I encountered the other day on LinkedIn: a job posting for a DevOps Administrator. What. The. Hell.

Unfortunately, what this tells me is that many of these organizations are seriously misinformed when it comes to the difference between DevOps, SRE, and Operations. More often than not, SRE becomes the new Ops. [Or DevOps becomes the new Ops.](https://medium.com/dzerolabs/the-six-horsemen-of-the-devops-apocalypse-a26ee8846f1f) Either way, it’s wrongitty wrong wrong.

### I just want some bloody sleep

Before I dive into the difference between DevOps, SRE, and Ops, allow me to take you on a trip to my pre-DevOps & SRE days.

It was a Friday night in late 2015. I had been the lucky recipient of a nasty virus. Not only was I feeling gross, I’d lost my voice too. That night, all I wanted to do was crawl under my covers and sleep. Instead, I was overseeing an application deployment. I wasn’t the one doing the actual deployment, but I was the one who had provided the deployment instructions to the Ops person who, even though they had no frickin’ clue as to what our app was, or how to deploy it, had admin access, and therefore was the one who would be deploying our code into prod.

Since the Ops person didn’t know squat about the app, it meant that our team had to write a detailed set of release instructions — a Word doc runbook. The instructions had to be precise, because one wrong instruction, and the Ops person would throw their hands up in the air and declare defeat. Even if it was a typo on a Linux command, which they (technically) knew. There were Linux commands and screen shots. Most releases were similar, so we often made copies of the same template and made tweaks for the upcoming release.

While I typically preferred to review the release doc with our designated Ops person, we often didn’t have that luxury. I wouldn’t know who my designated Ops person was until maybe a couple of hours before, and they often worked on back-to-back, simultaneous releases.

Are you horrified yet? Because I still am. I mean, this is a ticking time bomb! Things that could go wrong:

*   I could make a mistake writing the release instructions
*   The ops person could make a mistake executing on the release instructions

Not to mention the fact that our pre-prod and prod environments were not identical, so it was anyone’s guess as to how things would go in prod. 😱

As you’d expect, what could go wrong DID go wrong. Something that should’ve taken us a couple of hours tops dragged into the weekend.

We did eventually get the release done, with a lot of babysitting on my part, and at the end of the weekend, I was spent. Unfortunately, throughout my career, working at different companies, more often than not, app releases seldom ever went smoothly. There was always SOMETHING. Some use case that didn’t get caught in pre-prod. Code that worked in UAT but not in prod, due to slight differences in VM configuration. DB tuning issues. But to me, this release was the final straw. I was getting too old for these late-nights and lost weekends. And with Agile becoming more popular, it meant that what used to be quarterly releases would become much more frequent, and potentially much more disastrous.

A week after this disastrous release, I was having lunch with my parents, telling my dad about this nightmare. My dad is a super badass software engineer and architect who consumes new tech like candy (and is amazing at it, to boot). He suggested I check out DevOps.

Well colour me impressed. The more I read about it, the more I needed to try it out at work. So I started a side-hustle and created a little build and release pipeline for my team. And rest, as they say, is history.

### **DevOps, SRE, and Ops**

So what was my driver for all of this DevOps stuff? I have to admit that it was driven out of pure selfishness. I wanted my weekends back. All-nighters and weekends spent studying might have been tolerable in university, but they were certainly NOT in the plans for career. I wanted a life. I wanted to spend time with family. I didn’t want my stomach to be in knots every time we needed to release to prod. I didn’t want to to be involved in releases on weekends and awkward maintenance windows, with the raccoons keeping me company. I wanted sleep.

Now, years later, thanks to a kickass team of very talented software engineers that I’ve had the pleasure of working with, I’ve got some pretty good DevOps and SRE experience under my belt. So back to our original question: “What’s the difference between DevOps, SRE, and Ops?”

DevOps refers to the practices. SRE is the application of DevOps practices. You can’t have one without the other. DevOps is about designing pipelines, and SRE is about implementing them. Which means that SREs need those DevOps skills in order to do their jobs effectively.

So what of Ops, then? SRE is the evolution of Ops. It’s about being proactive versus reactive. Strategic versus tactical.

Because of this, Ops work is driven by ticketing systems. Got a problem? Write up a ticket, and your friendly Ops person will take a looksie to see what’s up. Unfortunately, that means that you get a lot of cowboys/girls in Ops.

SRE takes a software engineering approach to building out infrastructure (hence Infrastructure-as-Code), and focuses on building (reusable) tooling to ensure that systems run smoothly, rather than try to fight fires like their Ops counterparts do. There are no cowboys/girls in SRE. SREs care about a holistic system view, and as a result, observability is crucial to their line of work. Because you have that holistic view of the system, it helps you understand WHY systems crap out when they do, so that you don’t find yourself blindly restarting VMs/app services/DB servers/k8s clusters when they stop working, praying that the restart will do the trick.

Does that mean that SREs never get calls in the middle of the night to fix some system breakage? No, it doesn’t. Things break, after all. If there was a way to build systems that never broke, then we’d be having a different conversation altogether. But what it _does_ mean is that system breakage — not to mention having the _same thing always breaking_ — is not meant to be a regular occurrence. When things break, an SRE will dig into the root cause and will put things in place (through code) which will prevent that same breakage from reoccurring. SREs want sleep, after all, and don’t live off the thrill of getting woken up regularly at some ungodly hour (and the corresponding overtime pay) to fix some crappy system that’s running on bandaids and duct tape.

So the next time you apply for an SRE position, find out the following:

*   Is there on-call work?
*   Does it require a deep knowledge of Linux systems?
*   Does it require ninja-level Bash scripting skills?

If you’ve answered “yes” to any one of these, then it’s probably a sign that this most likey ain’t SRE work. It’s just Ops in disguise.

By [Adriana Villela](https://medium.com/@adri-v) on [July 17, 2020](https://medium.com/p/e79c94ab7fe4).

[Canonical link](https://medium.com/@adri-v/im-too-old-for-this-crap-e79c94ab7fe4)

Exported from [Medium](https://medium.com) on June 3, 2026.