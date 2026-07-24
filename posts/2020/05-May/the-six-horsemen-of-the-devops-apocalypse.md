---
title: "The Six Horsemen of the DevOps Apocalypse"
slug: the-six-horsemen-of-the-devops-apocalypse
description: "DevOps at Enterprise Scale: It’s Complicated"
added: "May 21, 2020"
tags:
  - technical
  - thought-leadership
  - "2020"
---


![](https://cdn-images-1.medium.com/max/800/1*3H0tTxeWJSMkJpm1pME-lw.jpeg)

Elephant in the Attic storefront signs on Toronto’s Dundas St. West

### **DevOps at Enterprise Scale: It’s Complicated**

Most large organization are complex, with many moving parts. They’re often made up of multiple teams, and have multiple technology stacks, running on multiple platforms. This results in anywhere from ad-hoc to complex implementations of CI/CD pipelines.

Most DevOps experts assume that organizations are flat, and this assumption goes into pipeline design literature. These pipelines are often leveraged by very large, hierarchical organizations. DevOps at scale at the enterprise thus ends up incurring high coordination and bundling costs, and as a result, **the savings promised by DevOps are never realized, and these DevOps transformation programs fail.**

> _According to Gartner, 90% of the DevOps initiatives will fail to fully m_eet expectations by 2023.

**Coordination cost** is the cost incurred to develop, maintain, upgrade, secure, and distribute compliant CI/CD or DevOps capabilities at the enterprise at scale.

For large institutions dealing with personal and/or financial data, this is even more critical due to compliance and security concerns.

**Bundling cost** is the cost incurred by delivering a chunk of changes into production. Most large enterprises have to bundle multiple projects before shipping them all to production at the same time. This may include environment changes, application code, and/or dependency artifacts coupled with code.

**Coordination and bundling are not trivial costs, and they end up diminishing the value of your DevOps program.**

Let’s explore how high coordination and bundling costs manifest themselves across the enterprise.

### DevOps Fallacies: Apocalypse Now

The complexity of DevOps at large enterprises is often deeply misunderstood. Often, well-intentioned executives end up making critical errors in running their DevOps transformation programs, falling for some or all of the six common DevOps Fallacies. This either results in these programs never reaching their full potential, or worse — it leads to flat out failure of the program.

In this article, we’ll explore Six DevOps Fallacies in detail. Let’s get started!

![](https://cdn-images-1.medium.com/max/800/1*rH10mOOpEba_eVQZxixmCw.png)

### **Fallacy #1: The DevOps Cowboy**

Well-meaning managers entrust their DevOps strategy to one or more DevOps Engineers who rule over pipeline design.

The cowboy will create automation for the sake of automation, resulting in overly-complex pipelines that don’t adhere to core DevOps principles.

They are the only ones in the entire organization who understand the entire pipeline, so that when the pipeline breaks, you are at their mercy to fix the pipeline, and they become a software delivery bottleneck.

**Why it fails**

*   The DevOps Cowboy becomes a “human” single point of failure in delivering value to customers
*   If/when this person leaves the organization, software delivery suffers catastrophically

**Results**

High coordination costs leading to high delivery costs

### **Fallacy #2: The Frankenpipeline**

The original purpose of build orchestration tools was to build code. As plugins and capabilities were added, DevOps operators coupled CI and CD concerns together, resulting in over-engineered and hideously complex Frankenpipelines.

The feedback loop becomes so long that continuous integration becomes next to impossible. At best, builds take a minimum of 3 cups of coffee to complete, or at worst, overnight.

**Why it fails**

*   DevOps operators have coupled CI and CD concerns into one pipeline
*   The pipeline becomes a ball of technical debt, making it brittle and unmaintainable

**Results**

High bundling costs leading to high delivery costs

### **Fallacy #3: The Iron Throne Pipeline**

This “one pipeline to rule them all” pipeline strategy is an attempt to minimize coordination costs. In reality, it becomes overly-complex and bloated, as it attempts to solve multiple use cases in one pipeline.

One pipeline becomes a single point of failure. As a result, pipeline breakage results in cascading failure for all teams dependent on the pipeline.

**Why it fails**

*   Inherits all of the issues of its cousin, the Frankenpipeline (Fallacy #2)
*   High development and maintenance costs
*   Pipeline operators are tightly-coupled to deployments

**Results**

High bundling and coordination costs leading to high delivery costs

### **Fallacy #4: Quantum Git Entanglement**

[Gitflow and Github Flow branching strategies gone wild](https://link.medium.com/7j81p2lrE6), with multiple release branches peppered with feature branches from different teams.

Branching becomes so complex that it’s easy to lose track of what goes where, and requires an expert Git detangler to cherry-pick commits for a release.

**Why it fails**

*   Requires heavy controls to prevent developers from accidentally merging into other branches that they were not meant to operate in.

**Results**

High bundling and coordination costs leading to high delivery costs

### **Fallacy #5: Toolmania**

Many large organizations, enamored by the Googles, Amazons, Netflixes, and Facebooks of the world, go on a DevOps tools purchasing binge, with the high hopes that merely using cool tools like their idols will help them reach DevOps Nirvana.

Unfortunately, blindly using DevOps tools without a solid set of practices in place to support the tools leads to bad automation and increased technical debt. Remember: you’re not Google. Or Amazon. Or Netflix. Or Facebook. You’ve gotta do you.

**Why it fails**

*   Tools alone do not enable DevOps practices
*   Teams focus on tools adoption, rather than on using the tools to enable DevOps capabilities and to support DevOps practices

**Results**

High bundling and coordination costs leading to high delivery costs

### **Fallacy #6: DevOps is the new Ops**

This occurs when Ops teams become responsible for building and maintaining DevOps pipelines and tools for different development teams.

It also occurs when Ops teams’ roles don’t change, yet the teams are re-branded as “DevOps”, because it sounds way cooler.

**Why it fails**

*   Putting lipstick on a pig, keeping things “business as usual” doesn’t result in actual change
*   Operations costs go up, because DevOps tools are distributed, and become more expensive to maintain manually

**Results**

High coordination costs leading to high delivery costs

### Beware the Horsemen of the Apocalypse

Unfortunately, most DevOps failure conditions revolve around organizations not being able to afford the high coordination and bundling costs that they inevitably incur by adopting a system-of-work that [fundamentally requires the current organizational culture to change](https://link.medium.com/J8CZnNGtE6).

And at the same time, tech departments in large organizations don’t particularly have a huge incentive to cut existing costs, because they depend on having the same or higher operating budgets for survival into the next fiscal year. If DevOps is supposed to cut costs, then it makes no sense to VPs and directors to adopt DevOps practices, because it means cutting their operating budget. That’s when things get dangerous, and pose a serious threat to DevOps initiatives.

So, big corporations…you have a few choices:

1.  Do the DevOps transformation thingy for oh, 3 years or so, and declare “mission accomplished” after 3 years, shelve the initiative, and promote the VPs running the initiative to super duper senior VPs for a job well done.
2.  Go the [Satya Nadella](https://www.afr.com/work-and-careers/management/how-satya-nadella-revived-microsoft-in-just-three-years-20161220-gtf1i7) route and make the change happen.

It’s up to you.

By [Adriana Villela](https://medium.com/@adri-v) on [May 21, 2020](https://medium.com/p/a26ee8846f1f).

[Canonical link](https://medium.com/@adri-v/the-six-horsemen-of-the-devops-apocalypse-a26ee8846f1f)

Exported from [Medium](https://medium.com) on June 3, 2026.