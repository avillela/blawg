---
title: "Embracing the DevOps & SRE Paradigm Shift"
slug: embracing-the-devops-sre-paradigm-shift
description: "Why Large Enterprises Fail at DevOps and SRE"
added: "Mar 19, 2020"
tags:
  - technical
  - devops
  - sre
---

# Embracing the DevOps & SRE Paradigm Shift

![](https://cdn-images-1.medium.com/max/1200/1*vu3X1F3fuVJpj1LViPNGCQ.png)

Boulderz Climbing Center, Junction Triangle, Toronto

### The Climbing Paradigm Shift

Whenever I go to my local bouldering gym on weekends, I often see a mix of gym regulars, like me, and newbies who are trying out bouldering for the first time. Before they can get on the wall, the newbies are given a quick brief by a staff member, which, among other things includes safety rules and how the bouldering problems are arranged on the walls. There are five simple things to remember about how bouldering problems are set up at my gym:

1.  There are two pieces of coloured tape (same colour as the holds) to mark the start holds
2.  There is one piece of the same colour tape to mark the end hold
3.  Follow the same colour holds up the wall to reach the end of the problem
4.  Problems are rated from Beginner all the way up to V11, with the higher number indicating a higher level of difficulty. For reference, as an average climber, I can do most V4s, and some V5s.
5.  Stay off the white mats when you’re not climbing, and don’t start on a problem when it looks like it might interfere with another climber. (Beware falling climbers!)

The newbies often smile and nod, show off their sample climb to the staff member’s satisfaction, and away they go to start their climbing adventure.

After the briefing by the staff member, the first thing that the newbie climbers do is randomly head over to a wall and start climbing, without looking at their surroundings, forgetting the entire briefing. This happens over and over. One newbie thing that stands out more than anything for me is seeing really buff guys who obviously work out regularly, struggle at the climbing gym on beginner climbs. I see them struggle as they grab at whatever random hold they can, desperately trying to hold on, and not taking the time to understand what is required of them both mentally and physically to make it up the wall. They fail to understand that using muscles to lift weights is different from using muscles to pull one’s body-as-a-weight up a wall designed to test one’s agility. It takes an understanding of one’s body size, flexibility, and center of mass to truly begin to progress in bouldering. What works for them at the gym works against them in the climbing gym.

> It requires a paradigm shift in thinking.

And that’s when it hit me. The same situation was happening in my #worklife as well. DevOps and SRE were fundamental paradigm shifts happening in the world of IT, yet we were unsuccefully trying to fit them into system architectures that were designed to be monolithitic, and apply them to existing team cultures that have been siloed for decades. And we were rapidly failing at all of it. Worst off, our metrics such as “number of teams using DevOps tools”, and “number of builds per team” were giving us a false sense of success. We were failing because we had simply not embraced the paradigm shift that DevOps and SRE inherently presented. Our incremental thinking, the consulting favourite of “Crawl, Walk, Run”, was failing us miserably.

> Your ass cannot crawl, walk, and run into a paradigm shift.

Let’s examine some problems that arise when you don’t embrace the paradigm shift in the tech world.

### Problem #1: Manual DevOps & SRE

If you’ve been hired to do DevOps or SRE work, and you find yourself responding to ServiceNow tickets, Slack messages or what-have-you to manually build and maintain automation, you, my friend, are doing ops work. It also means that you are a massive bottleneck holding up teams from being able to develop and deliver code quickly and safely. OUCH.

For example, suppose that you’ve just maually built a CI pipeline with Jenkins for a dev team. That dev team can now clone, build, and publish packages in _five minutes_. Woo hoo! This may seem like a huge victory…but wait! The thing is, you’ve built this for one team, yet there are 20 other teams in the organization that also need these pipelines. Which means that you now have to manually build a pipeline for each team. And because _you_ built it, you also have to maintain it. Anytime the build breaks, teams will come to _you_…regardless of whether or not the problem was with your pipeline, or their crappy code. Congratulations! You are now an ops bottleneck, and will be forever tied to that pipeline until you retire or leave the company.

### Problem #2: Incidental Technical Debt — Using Weight-Lifting Muscles for Climbing

Let’s return to our newbie climbers at the gym who built up mad upper-body strength through weight training. As I said before, these folks are usually in for a very rude awakening when they realize that their weight training muscles don’t do much for them on the bouldering wall. Climbing is a full-body activity. When you watch a seasoned boulderer, it looks like ballet on the wall. The motion is very fluid, from head to toe. You can usually tell a newbie climber by their form, or lack thereof — upper body doing the bulk of the work, and feet either dangling awkwardly, or desperately fumbling for footholds.

We see similar behaviour from enterprises attempting to adopt DevOps practices. Most companies are stuck in their old operations thinking. And when these same companies begin to “adopt” DevOps and SRE practices, they figure that their ops muscles would carry them through these digital transformations. What _actually_ ends up happening is that many of these companies end up either butchering DevOps or ignoring practices, and unwittingly wind up churning out ops people who run, maintain, and deliver DevOps tools.

### Problem #3: The Human Fallacy — Seeking Familiarity in Change

Change is hard, uncomfortable, and intimidating. So when we’re faced with change, we tend to grasp for familiar things to help guide us through that change. On the one hand, it can be very comforting and can ease us into the change. On the other hand, it can totally bork things up.

For example, suppose that Company X was using ClearCase, and now they’ve switched to Git. Instead of learning Git best practices, developers try to squeeze their old ClearCase thinking into their Git workflow. They do this because they’ve been using ClearCase forever. It’s familiar. They’re comfortable with it. Developers can’t possibly be bothered with learning proper Git workflows, so someone has come up with a great idea on how to manage this transition: to Frankenstein dated ClearCase concepts into modern Git workflows. Because the reality is, learning Git and all that it offers is too much of an ask — developers have software to deliver, for crying out loud! And as a result, it means that they build up more technical debt with this bastardized flow. It also means that their CI pipelines aren’t as efficient as they could be.

### Tell me what the damned paradigm shift is, already!

So we’ve been talking our ears off about paradigm shift this and that, but what exactly is this paradigm shift that is required to make DevOps and SRE work as intended at the enterprise?

> Enterprises must embrace a developer-first culture in order to succeed at DevOps and SRE.

Embracing a developer-first culture means [treating Operations as if it’s a software problem](https://landing.google.com/sre/).

I’m sorry to break it to you, but the things that made hierarchical organizations successful in the “old way” of doing things _simply will not work_ in a DevOps and SRE world. Any DevOps and SRE initiatives in a hierarchical organization are destined to fail miserably. But hey, it’s your money to burn. 🤷‍♀️

Remember our weight-lifting newbie climbers whose weight training muscles failed them at the climbing gym? The same thing applies here.

This paradigm shift changes:

*   **Your hiring practices.** Having experience with using DevOps tools does not make you a DevOps expert. I’m looking at you, HR and hiring managers!
*   **How you think of Ops — it is no longer an afterthought.** Great — you now have a CI pipeline. It will take you 6 more months until you can actually deploy that code to Production. Congrats. You are NOT DevOps.
*   **How you look at your systems. Everything is code, and must adhere to proper software design principles.** This means that your systems are now software concerns. Just because you wrote a Terraform script for standing up your entire infrastructure doesn’t mean that it’s good, if it’s not maintainable, scalable, and easy to understand…like good code!

There’s more, but that’s a whole other Medium article…so stay tuned!

### Okay, I admit it…my organization has a problem. What do I do?

You’ve taken the first step, mon ami!

If you have a DevOps or SRE bottleneck, look at how you run Ops.

You must rethink how Ops is done in the context of DevOps and SRE practices. It’s not about an Ops person doing DevOps or SRE. [It’s about treating Operations as if it’s a software problem.](https://landing.google.com/sre/)

Understanding the paradigm shift and how that shift changes everything is key. Until enterprises embrace this paradigm shift, they’ll never be able to reap the full benefits of DevOps and SRE.

By [Adriana Villela](https://medium.com/@adri-v) on [March 19, 2020](https://medium.com/p/7a822a894088).

[Canonical link](https://medium.com/@adri-v/embracing-the-devops-sre-paradigm-shift-7a822a894088)

Exported from [Medium](https://medium.com) on June 3, 2026.