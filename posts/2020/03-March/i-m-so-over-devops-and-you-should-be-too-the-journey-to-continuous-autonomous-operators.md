---
title: "I’m so over DevOps…and you should be too: the Journey to Continuous Autonomous Operators"
slug: i-m-so-over-devops-and-you-should-be-too-the-journey-to-continuous-autonomous-operators
description: "What started off as a DevOps problem turned out to be an Ops problem"
added: "Mar 08, 2020"
tags:
  - technical
  - devops
  - thought-leadership
  - "2020"
---


![](https://cdn-images-1.medium.com/max/1200/1*CjgWf5yGeHJCKDWb3iTn_Q.jpeg)

Please don’t hate me. I still very much believe in the core values of DevOps: deliver software quickly and safely. But the thing is, what started off as a DevOps problem turned out to be an Ops problem. And the truth of the matter is that Operations has never truly had a platform to do it justice. Allow me to explain…

I spent the better part of 10 years working for a very large corporation. It was one of those organizations with layers of VPs and hundreds of thousands of employees spanning the globe. I spent many of those years working in a vacuum — minding my own business, delivering custom code for a vendor-managed tool that our team used. I wasn’t even aware of any of the organization’s technological complexities outside my little bubble.

Then I got into DevOps after a super horrifying release weekend, where everything that could go wrong did go wrong. I found DevOps and DevOps found me. It was the thing that was missing from my career…or was it??

From then on, DevOps and I had a beautiful love affair. I spent about 3 years driving the DevOps vision for the organization. My team went through many pivots over the years, trying to find the best way to deliver DevOps best practices to this huge organization and all its little kingdoms. In those three years, my team and I made great strides in increasing velocity for developers, but everything always came to a grinding halt when it came to the non-dev stuff. It was like we hit a giant brick wall when it came to things like deployment, infrastructure provisioning, security, and operations. No matter how many gains we made on the CI/CD side of things, we were not actually seeing any real overall improvements, and that was super frustrating.

### The \*Actual\* Problem

And that’s when the “AHA!” moment came. The CI/CD side of things was never the real problem. We easily tamed that beast. Nope…it was the stuff after that — the [SRE](https://en.wikipedia.org/wiki/Site_Reliability_Engineering) stuff — is what was really hampering the organization from reaching its full potential of operational efficiency.

The thing is, most organizations’ Operations teams still operate in a very primitive fashion. While SRE is becoming fashionable (thanks Google), most organizations don’t know how to do SRE work effectively. Why’s that?

![](https://cdn-images-1.medium.com/max/800/1*9MNLZIj-QjzYxSlZwk6-JQ.jpeg)

Let’s consider some tasks done by Operations folks:

*   Running Disaster Recovery (DR) tests
*   Setting up network firewalls
*   Building a standard server image for deploying an application written in Language X
*   Following standardized steps when certain alerts — e.g. clearing disk space when receiving a low disk space alerts due to log files clogging up disk space
*   Fixing DB outages
*   Allocating network storage

On the most part, these common operational tasks, or runbooks, are described in Word docs:

*   If you’re lucky, you’ll find this Word doc somewhere on SharePoint or on a network drive.
*   The person writing the runbook is human, so guess what? It may have mistakes.
*   The person EXECUTING the runbook is also human, so guess what? They may make a mistake executing it.
*   The runbook may not be up to date. In which case, you may be SOL.

Maybe, just maybe, the runbook will be automated into a script. If this is the case…PLAY THE DAMN LOTTERY. NOW.

Automated Ops scripts tend to be written in Bash or PowerShell or <insert favourite scripting language here> to automate mundane tasks. YESSSS! They’re great and all, but…

*   These scripts tend to be written for the Ops person’s eyes only, and with the sole purpose of making that person’s life easier. Fair enough. I hate boring-ass repetition too!
*   These scripts that often live in the Ops person’s desktop, never to be shared or version controlled.
*   They tend to be reactive, rather than proactive, which means that there’s a lot of scrambling happening to cobble something together.
*   The scripts are very often triggered manually. This leads to a scaling problem, because as we all know, manual tasks are error-prone and slow things down.

![](https://cdn-images-1.medium.com/max/800/1*fFSuVfGxFM2c4v-jte0VrA.png)

### Continuous Autonomous Operators to the rescue!

Okay, so Operations is super-duper important, and companies need a means of transitioning effectively to more of an SRE minset. Unfortunately, here are the common realities about Operations in most organizations:

1.  Ops folks use runbooks, and they’re not always codified
2.  Chances are, different Ops folks have solved the same problem independently of each other, never aware of each others’ work
3.  When the runbooks are codified, they are hidden deep in a computer dungeon, and nobody besides the Ops person is aware of it
4.  Triggering the automated runbooks requires manual intervention

So how do we go from regular ‘ole Ops to a nice, well-oiled SRE machine? Automation is definitely in the cards. But beyond that, we’re talking Continuous Autonomous Operators.

So what the heck is an operator? An Operator is an event listener which proceeds to trigger and orchestrate a set of workflow actions. So then a Continuous Autonomous Operator give you:

1.  A standardized set of common CODIFIED Operators
2.  Standardized Operators available to other SREs, so that we’re not reinventing the wheel
3.  Defined events that trigger these Operators, so that they run sans human intervention — i.e. Autonomously

This leaves the SRE the much more fun task of coming up with cool workflows, while letting the system do its thing.

Sound cool? If you want to learn more about Continuous Autonomous Operators, be sure to follow the Dzero Labs publication, as we prepare to launch our alpha product in the coming weeks!

By [Adriana Villela](https://medium.com/@adri-v) on [March 8, 2020](https://medium.com/p/c6d586c4fb31).

[Canonical link](https://medium.com/@adri-v/im-so-over-devops-and-you-should-be-too-the-journey-to-continuous-autonomous-operators-c6d586c4fb31)

Exported from [Medium](https://medium.com) on June 3, 2026.