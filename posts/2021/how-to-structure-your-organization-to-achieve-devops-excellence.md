---
title: "How to Structure Your Organization to Achieve DevOps Excellence"
slug: how-to-structure-your-organization-to-achieve-devops-excellence
description: "Many organizations are still missing the mark on DevOps. Let me show you how to turn that around."
added: "Mar 05, 2021"
tags:
  - technical
  - thought-leadership
  - devops
---

# How to Structure Your Organization to Achieve DevOps Excellence

![](https://cdn-images-1.medium.com/max/800/1*qbnYY5QVa6BJkhgsl6W64A.png)

This cat isn’t happy with the way that DevOps is being treated. Photo by Dzero Labs.

While scrolling through LinkedIn last fall, I came across the following post, in which the author enthusiastically asked, “What does a DevOps Engineer need to learn? This DevOps roadmap is very useful. What do you think is missing here?”

![](https://cdn-images-1.medium.com/max/800/1*Qi9au9dXzLH0Kpm8RllcVg.png)

This LinkedIn post from the fall of 2020 made me mad.

What’s missing here is **_the point of DevOps_**! This person is focusing on figuring out what tools to learn, rather than focusing on core DevOps principles. And that had me _fuming_. A lot. I was even tempted to post a snarky-ass response, but I restrained myself. I didn’t want to be _that_ person. So instead, it’s taken me all these months to collect my thoughts and formulate this post. Here we go.

### Optimizing Around Tools

What’s the deal with this continued focus on tools? Tools come and go. Jenkins was all the rage 2 years, ago, only to be bested by the likes of CircleCI and Bitbucket Pipelines. More recently, newer technologies like ArgoCD, Tekton, and FluxCD have taken center stage in the DevOps world. Even Spinnaker, developed by Netflix and once considered to be ahead of its time, feels old and bulky.

Optimizing on a particular tool will just pigeonhole you, and forces you to solution around the tool. _The solution should be independent of the tool._ Say it with me, y’all. _The solution should be independent of the tool._ 😊

Let’s look at this in a different way. There are those whose developer identity revolves around a particular programming language. “I’m a Java developer”, or “I’m a .NET developer”. What’s with this nonsense? Being a developer isn’t about optimizing your career around a programming langauge. It’s about applying software engineering principles to get the job done. Forget the language. IT. DOESN’T. MATTER. What matters is the design. Once you have a good design, you find the best language to do the job. That’s why good software engineers don’t identify themselves around a language.

### Pipeline Monkey

In another affront to DevOps, last fall I spoke with folks at one of Toronto’s universities, as they excitedly told me about the launch of a DevOps Certificate program as part of their School of Continuing Studies. Again, they’ve missed the point completely. They basically want to churn out pipeline monkeys.

Honestly, it’s weird to see an academic institution support such a serious misalignment.

It is nonsensical to task an individual or a team to be in charge of an entire organization’s software quality and consistency. You can be a developer or Operations person who applies DevOps principles to their work. Equating DevOps with pipeline creation defeats the purpose of what DevOps seeks to accomplish. Unfortunately, many organizations have turned DevOps into a job, whether it’s the DevOps Engineer creating DevOps pipelines, or rebranding Operations as DevOps or SRE. All it does is undermine DevOps itself.

DevOps pipelines aren’t rocket science. Most pipelines are pretty unexciting and aren’t that different from one another. Churning out DevOps Engineers who create pipelines is a waste of talent, time, and effort, and most importantly, defeats the purpose of what DevOps is.

### “DevOps is About Culture”

If I hear that phrase one more time, I’m going to BARF. 🤮 The problem is that this statement has become heinously diluted over time. What’s more, most people who say it don’t even know what it _means_.

So allow me to clarify it for you.

> DevOps is a practice and philosophy of Software Development.

DevOps is definitely NOT about hiring an army of pipeline monkeys or [AWS-certified experts](https://medium.com/dzerolabs/why-tech-certifications-are-a-waste-of-time-and-money-76208d7d7911). Want to know what DevOps culture REALLY means? It means making socio-technical changes to your organization so that it can fulfill the DevOps promise of delivering software quickly and safely.

These socio-technical changes include:

*   **Getting Executive support** of enterprise-wide practices & standards. Let’s face it. Without exec support, you’re dead in the water.
*   **Defining enterprise-wide DevOps practices & standards**
*   **Fixing bad habits.** Creating automation to support bad developer habits just reinforces bad practices. For example, creating TFS aliases for Git to cater to developers who are too scared to learn how to use Git properly.
*   **Focus on data-driven and event-driven** workflow optimization. Understand the workflows in your organization. What are the inputs? What are the outputs. Create automations for these workflows.
*   **Reorganize key teams** to support change. Gone are the days of the traditional ops person. It’s time to adopt a software engineering mindset.
*   **Embrace modern technical strategies**. This includes the likes of [GitOps](https://shahbhargav.medium.com/overview-of-gitops-31e206e19e4e) and Infrastructure as Code to provision and maintain your infrastructure.

### How DevOps fits in your organization

Okay, so I’ve ripped on how organizations are doing DevOps badly. [Again](https://medium.com/dzerolabs/the-six-horsemen-of-the-devops-apocalypse-a26ee8846f1f). (Hey, call me passionate. 😊 ) How do we solve this?

I’ve struggled with this question a fair bit in the last couple of years. It’s taken a lot of pondering, reading, and observing what works and doesn’t work at various organizations to come up with a model that properly honours DevOps. Unfortunately, most organizations have gotten it wrong. But that doesn’t have to be you.

How you deliver software (application or infrastructure) to production, how you create and maintain your infrastructure, and how you structure teams teams around it are what really matter.

So what do these teams look like? Let’s examine below. (_Aside: The structure below is based on content from_ [_cnpatterns.org,_](https://www.cnpatterns.org/organization-culture) _which has helped to validate much of what I’ve been thinking. Also, shoutout to my friend Rob over at_ [_Translucent_](https://www.translucentcomputing.com)_, for letting me bounce some ideas off of him around this topic. Don’t you just love the tech community?_ 😊 )

#### Build-Run (Dev) Teams

*   Have full authority over the services they build, not only creating, but also deploying and supporting them
*   Rely on standardized platform delivered by the Platform Team

#### Platform Team

*   In charge of architecting, building, and running a single, consistent, and stable cloud-native platform for use by the entire organization
*   Allows developers to focus on building applications instead of configuring infrastructure

#### SRE Team

*   In charge of improving whatever it takes to create better infrastructure, better runtime, and better user support, **_using DevOps principles_**
*   Proactive vs. reactive (focus on observability)
*   Makes the [error budgets](https://cloud.google.com/blog/products/management-tools/sre-error-budgets-and-maintenance-windows), and defines [Service Level Indicators (SLIs) & Service Level Objectives (SLOs)](https://www.atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli)
*   Helps Dev teams define their operational model
*   Helps the Platform Team to improve the platform
*   Highly knowledgeable and experienced in operations and software engineering

Or, if you’re a visual person, your tech organization would be structured like this:

![](https://cdn-images-1.medium.com/max/800/1*j3B0UzqQlVmnPE3xy-LqRA.png)

DevOps in an organization. Credit: [Ian Maxwell](https://www.linkedin.com/in/rimaxwell/) & Dzero Labs

A few important things to note:

*   Why are we doing all of this? **_To support the Build-Run team._** After all, without the Build-Run (Dev) team, there’s no application, and therefore no infrastructure is needed. The Platform team supports the Build-Run team. The SRE team in turn supports both the Build-Run team and the Platform team.
*   The SRE team is focused on **_using DevOps principles_** to provide practices and standards to help the other two teams achieve operational excellence. They let data guide them, allowing them to be proactive. For example, the SRE team would come up with guidelines for resource limits (CPU, RAM) for a Kubernetes application.
*   This is all a **_continuous feedback loop_**. Identifying system performance issues during run, feeds back into design. The SRE team works with the Platform team and/or the Build-Run team to make the necessary software tweaks (infrastructure and/or application) to fix and prevent further issues.

### Conclusion

Alex Hidalgo sums it up perfectly in his book, [_Implementing Service Level Objectives_](https://www.oreilly.com/library/view/implementing-service-level/9781492076803/):

> “The tech industry has a habit of becoming enamored with certain terms, phrases, or philosophies and overusing them to the point that they become just meaningless marketing jargon. One well-known recent example of this is the term _DevOps_, which was coined to describe a certain approach to getting things done. DevOps as originally formulated was intended to be a philosophy that could help shorten development release cycles and provide quicker feedback loops, but today it’s often used as a job title or assigned to a category of vendor tools.”

But it doesn’t have to be that way. Organizations big and small have the power to use DevOps to supercharge software delivery. Yes, it takes socio-technical changes. They also require **_a strong leadership team_** to help push these changes through. These things aren’t easy to accomplish, but just being aware of what the changes have to be, and being willing to make these changes is an enormous step foward. Are YOU ready to do what it takes to reap the benefits of DevOps?

And now, as your reward for putting up with my rant, please enjoy this picture of a cute hedgehog.

![](https://cdn-images-1.medium.com/max/800/1*ApJzIuM7tPR0KytQ5kxbow.jpeg)

Photo by [Liudmyla Denysiuk](https://unsplash.com/@hedgehog90?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/cute?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### Recommended Reading

*   [_Accelerate_](https://www.amazon.ca/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339/ref=sr_1_1?dchild=1&gclid=Cj0KCQiAhP2BBhDdARIsAJEzXlEUFzQbP8fOKhaGVAqvtU5brY6VcNFMpA21DBkM4NMaQdzjl6lRmXAaAsMpEALw_wcB&hvadid=284018215882&hvdev=c&hvlocphy=9000956&hvnetw=g&hvqmt=e&hvrand=6785031961552450006&hvtargid=kwd-307609789829&hydadcr=3289_10310785&keywords=accelerate+book&qid=1614811930&sr=8-1), by Dr. Nicole Forsgren, Jez Humble, and Gene Kim
*   [_Implementing Service Level Objectives_](https://www.oreilly.com/library/view/implementing-service-level/9781492076803/), by Alex Hidalgo

By [Adriana Villela](https://medium.com/@adri-v) on [March 5, 2021](https://medium.com/p/947b04d6a80b).

[Canonical link](https://medium.com/@adri-v/how-to-structure-your-organization-to-achieve-devops-excellence-947b04d6a80b)

Exported from [Medium](https://medium.com) on June 3, 2026.