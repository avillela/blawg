---
title: "How to Fix Your Broken Enterprise DevOps"
slug: how-to-fix-your-broken-enterprise-devops
description: "Scaling Enterprise DevOps with Ephemeral and Multi-Dimensional Pipelines"
added: "Aug 11, 2020"
tags:
  - technical
  - devops
  - thought-leadership
---


![](https://cdn-images-1.medium.com/max/1200/1*CGZOK2jW_2_4mltLMFVp4A.jpeg)

Photo credit: Dzero Labs

I love rock climbing. I’ve been climbing since 2002, and over the years, climbing has turned into a family activity. One of the things that I love most about climbing is that it’s all about solving hard problems. Climbing is about getting to the top of the wall without falling. The type of climbing that I do, known as [bouldering](https://en.wikipedia.org/wiki/Bouldering), is about climbing without a rope, which adds to the challenge. When I work on a bouldering problem, depending on the level of difficulty, it can result in multiple falls off the wall. As frustrating as the falls can be, each time I get back on the wall, I learn a little bit more about the problem, and often am able to successfully top the problem.

### The DevOps Promise

DevOps, especially DevOps at the Enterprise, is like rock climbing, as it too is all about solving hard problems. And like rock climbing, DevOps is my passion.

Before we dive into things, let’s review the DevOps promise. DevOps tells us that we’re supposed to deliver software faster, and more safely. When you factor in DevOps at the enterprise, you need to take the following into account:

*   Compliance (to keep regulators happy)
*   Security (to keep client information safe)
*   Scale (how to ensure that the entire organization is following DevOps practices)
*   Tons of silos (team, department, company-wide, etc.)
*   Hundreds of projects, many of which need to be delivered concurrently
*   Fluid and dynamic workforce, comprised of mixture of full-time and contract workforce

### System Development Life Cycle

Before we dig a bit deeper into things, let’s examine software delivery at a smaller organization. From top to bottom:

*   **Row 1** represents the system development life cycle (SDLC)
*   **Row 2** (blue square) represents the parts of the SDLC which can be automated
*   **Row 3** represents common tools at the enterprise level which support the automation in Row 2.
*   **Row 4** features the DevOps practices which support all of the above

![](https://cdn-images-1.medium.com/max/1200/1*-aPtpAsr0eNBd7tYMx4YAA.png)

In a relatively small organization, this can be a relatively simple task. Smaller orgs tend to hire a small team of DevOps engineers who will manually build CI/CD pipelines to manage DevOps.

When you factor in a large organization, however, with tons of silos, distributed workforces, hundreds of concurrent projects, and all sorts of other complexities, you can end up with this DevOps mess:

![](https://cdn-images-1.medium.com/max/1200/1*zlarWkzkwb_9YEh1JUbtZw.png)

### YIKES!

DevOps efforts, from manual pipeline creation to scaling practices, suddenly become exceedingly complex. This leads to:

*   Duplication of work
*   Maintenance nightmares
*   Automation sprawl

We’re definitely NOT fulfilling the DevOps promise.

### DevOps at Scale is the Enterprise’s Biggest Challenge

Consider some additional problems that we see with DevOps in large enterprises:

*   Frustration with the lack of connectivity between the various DevOps tools in their toolchain
*   Limited access to self-service infrastructure
*   Finding the right DevOps skillset
*   Difficulty managing the complexity of multiple services and environments
*   Lack of urgency/budget
*   Limited support from executive leadership
*   A mix of legacy (brownfield) and modern (greenfield) applications. This created complexity in terms of deployment strategies and endpoints, toolchain, etc.
*   Struggles with siloed teams that could not collaborate as expected
*   Large portion of testing is manual, which slows things down

Scaling is about cost. In DevOps we define it as the unit cost of delivering value to a customer.

### YIKES!

Executing a successful DevOps transformation isn’t without its challenges. Organizations and software products vary in maturity and implementation, making transformation efforts difficult to design and deploy across teams and organizations. Most importantly, in order to truly deliver DevOps value, it must include more than just tooling and automation — so simply purchasing and installing a solution isn’t sufficient.

### The Solution

So how do we solve this problem? We solve it with Ephemeral & Multi-Dimensional Pipelines!

Say wut?

As the term implies, an **Ephemeral Pipeline** is a short-lived pipeline. That may seem counter-intuitive, but consider this. The best way to honour DevOps is to make Git a first-class citizen. This means defining everything as code, including the definition of the Pipeline itself. If the pipeline is defined as code, we can create and destroy it as many times as we’d, and will still get the same pipeline and same behaviour in the pipeline **each time we recreate it**.

The pipelines are multi-dimensional, because we have pipelines for Development, QA, and Ops. The pipelines operate independently and orthogonally to each other.

This means that the QA team will write their test automation code, and will have their own DevOps pipeline independent of what the dev team does. All they need from the dev team is the release binary that needs to be tested.

Similarly, the Ops team will have some automation code to deploy the (tested) release binary into Prod.

Since Git is a first-class citizen, it means that it’s important to get your Git game on. Remember that in an Enterprise DevOps setting, you’re also having to deal with some [high coordination costs](https://medium.com/dzerolabs/the-six-horsemen-of-the-devops-apocalypse-a26ee8846f1f) across different dev teams just to get your code out the door! If you’ve ever worked in a large enterprise setting, you know what I mean. If you haven’t, then lucky ducky!

Because of these high coordination costs, there needs to be a way to minimize noise from other teams working on the same application code simultaneously for a future release, while maintaining your sanity. That’s why Ephemeral Pipelines go hand-in-hand with [Ephemeral Release Forking](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea). In a nutshell, [Ephemeral Release Forking](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea) allows you to work in an isolated fork (representing the release you’re working on) of your application code until the release package is deployed into Prod. And as part of that fork, you have an accompanying pipeline. Once your release has gone into prod, you can merge your fork into the [Golden Repo](https://medium.com/dzerolabs/wut-the-fork-e875ed525979) and nuke your pipeline. Because your pipeline has been codified, you can recreate it for your next release. For more info, check out [Part 1](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea) and [Part 2](https://medium.com/dzerolabs/wut-the-fork-e875ed525979) of the Ephemeral Release Forking posts.

Want to learn more about Ephemeral & Multi-Dimensional Pipelines, and scaling DevOps at the enterprise? Be sure to follow us for more DevOps and SRE goodies!

By [Adriana Villela](https://medium.com/@adri-v) on [August 11, 2020](https://medium.com/p/145be3d52ae2).

[Canonical link](https://medium.com/@adri-v/how-to-fix-your-broken-enterprise-devops-145be3d52ae2)

Exported from [Medium](https://medium.com) on June 3, 2026.