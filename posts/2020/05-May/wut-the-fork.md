---
title: "Wut the Fork?"
slug: wut-the-fork
description: "A follow-up to Ephemeral Release Forking"
added: "May 03, 2020"
tags:
  - technical
  - thought-leadership
  - devops
---


![](https://cdn-images-1.medium.com/max/800/1*Hjek9CMD2DD5CtdSjkoksA.jpeg)

Two. TWO chickens horrified by bad Git practices. Ah-ah-ah…

When I first posted about [Ephemeral Release Forking](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea) (ERF), I knew that I was opening up a can of worms. After all, Git branching strategies are polarizing. Everyone and their uncle’s goat has an opinion about branching best practices. And here I am, with yet ANOTHER opinion on branching best practices. Since my last post was a LOT to digest, I thought that a follow-up post to address some common questions and comments around [Ephemeral Release Forking](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea) were in order.

### Code Delivery vs Package Delivery

Before we move forward, I’d like to take some time to talk about code delivery and package delivery, because they are two very very different concerns.

Continuous integration (CI) is all about **_code delivery_**. In a nutshell, you build your code, run your tests, and package it up — whether it’s a _jar_ file via Maven or Gradle, _dll_ or _exe_ via Nuget, a Docker image, or a _zip_ file — the end result is a package (binary).

Continuous Delivery (CD) is the process of orchestrating binaries (i.e. the result of CI) to get them deployed to a target system. If you’re part of a large organization, that can mean deploying those binaries into tens or even hundreds of machines. In a nutshell, the end result of CD is **_package delivery_**.

The main take-away is that we shouldn’t mush the two together — they are separate concerns. This means that we build once, and deploy many, which means that it’s the same binary that’s delivered to QA, UAT, and Prod. I repeat: _the same binary is delivered to QA, UAT, and Prod_. This enables us to truly shift left.

#### Why does this matter?

QA, UAT, Staging, Perf, Prod — or anything in-between — are just environments. These environments are simply configs that are used by your binary to know what systems it should talk to. For example, should your binary be talking to your QA, UAT, or Prod database? Should it connect to your QA, UAT, or Prod external vendor service?

Now, some teams follow the practice of having a branch represent an environment, because they have environment-specific configs (e.g. URLs, system credentials). This means that they need to rebuild their code for each environment, which is crazy! This is easily solved by secrets-management systems. This is not a git problem to solve. This environment-per-branch practice is complete nonsense and should be stopped.

Compare that to building the package once, and letting it flow to QA, UAT and Prod…and at least at that point, you know that your package hasn’t changed, so if any poop hits the fan, then it’s probably an environment issue (which is a whole other blog post).

### ERF Terminology Refresher

First, let’s review what ERF is all about:

#### Golden Repo

This is the “source of truth” repo, and it contains only one branch — **master**. It represents code that’s currently in prod. All releases have been properly tagged.If your prod system were to sudenly die, you should be able to rebuild your code from Golden Master from a tag.

#### Release Fork

A release fork is a repo that is forked from the Golden Master, with [fork syncing enabled](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork). Attributes of a release fork:

*   The fork itself IS the release, so there’s no need to create a release branch
*   The fork follows the following naming convention: Golden repo name + the major release #. For example: **MyAweseomeApp\_1.0.0**
*   It has two “long-lived” branches: **master**, and **develop**
*   Fork syncing is enabled between **master** on the Golden Repo, and **master** on the Release Fork
*   The **develop** branch is the integration branch, and developers create features branches off it, to follow a simplified [Github Flow](https://guides.github.com/introduction/flow/)
*   Each fork has a corresponding build pipeline
*   Each fork has the same build pipeline — i.e. each pipeline works the same way. The only difference is that the **MyAwesomeApp\_1.0.0** fork will publish 1.x.y artifacts to your artifact repo, and the **MyAwesomeApp\_2.0.0** will publish 2.x.y artifacts to your artifact repo.
*   The repo and its build pipeline are destroyed once the release is deployed to Prod

### When should I consider ERF?

Most large Enterprises tend to be project-centric, rather than product-centric. As a result, they end up having large groups of developers working on multiple releases of the same codebase _at the same time_.

[Ephemeral Release Forking](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea) isolates teams working on different releases from each other, while still allowing them to share code updates through pull requests. By isolating each release team to a different fork you effectively treat each team as a product team.

In most enterprise scenarios, when you have multiple teams working on the different releases on the same codebase at the same time, they often end up doing things like:

*   Cherry-picking commits into a release branch 🤮
*   Creating release branches off of **master**, and creating a “release master” branch off of the release branch, and feature branches off of the “release master” branch 😵

These types of behaviours are very error-prone, and you can accidentally contaminate your master branch with unwanted commits.

### When should I NOT consider ERF?

If you’re a small product team all working on the same release, and don’t have multiple concurrent releases, don’t over-complicate it. Use [Github Flow](https://guides.github.com/introduction/flow/) instead.

### What about hotfixes?

When working on a hotfix, you’d need to fork as well. Suppose that:

*   The app version in prod of MyAwesomeApp is v11.5.5
*   Team A is working on version 12, being released in May
*   Team B is working on version 13, being released in June

This means that the fork is called **MyAwessomeApp\_11.0.0**. Once the hotfix is pushed to prod, we nuke that fork and its pipeline.

Teams A and B will automagically receive the latest code from the hostfix to their respective master branches, courtesy of our lovely fork-syncing. This ensures that the teams don’t re-introduce that bug(s) that were fixed in the hotfix.

### If I fork per release, I’ll end up with too many forks!

The cornerstone of the [Ephemeral Release Forking](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea) model is that the forks exist for the lifecycle of the release — i.e. from dev until the code is released into production. Once the code is released into production, it should be tagged and merged into the **Golden Repo**. And then…delete the fork and the pipeline.

### Wait, but? I destroy my pipeline in the end?!

DevOps gives us the ability to create and destroy pipelines, infrastructure, etc. many times over, consistently and repeatably. This means that when you recreate things, they will behave in the same manner **every time**. If they don’t, then your automation is tainted and you’ve got bigger problems…

### I dunno…forking seems complicated…

More complicated than managing multiple branches off the same repo and getting confused as to what each branch does? Remember this diagram?

![](https://cdn-images-1.medium.com/max/800/1*3IYlW3iLJkNncBgPaK2qxA.jpeg)

Folks, this is real Git network diagram from a real team at a large enterprise. This is what happens when branching gets untamed and out of hand. This is the type of BS that results in having a guy (or gal) named Sam can **git cherry-pick** in their sleep and whose main job is “[build meister](https://wiki.c2.com/?BuildMeister)”. Don’t be a Sam.

### Why fork when I can branch?

Why not do both? Forking protects your team from other teams unwittingly touching your code. Branching gives your team an easy way to collaborate.

### Isn’t forking is used only by open-source projects? I’m not working on open-source code…

Last time I checked, there was no hard-fast rule in place which stated that forking was reserved only for open-source projects. Actually, a very similar version of this flow, the [Fork-and-Branch Git Workflow](https://blog.scottlowe.org/2015/01/27/using-fork-branch-git-workflow/), **_is_** used by developers working on open-source projects. And when you think about it, it makes sense.

Different groups of developers are working on a copy of the forked repo, in isolation from each other, so that they don’t end up mucking each others’ work. They follow a branching workflow within the fork, and when they’re done, they simply send a pull request to the forked repo.

We’re saying, “hey, do pretty much the same thing”. But instead of saying that it applies only to multiple teams across different organizations working on the same codebase, we’re saying that this should also apply to teams working on the same app within an organization, with a few more optimizations made.

### How do I handle feature flags?

[Martin Fowler has a great article on feature flags](https://www.martinfowler.com/articles/feature-toggles.html#CategoriesOfToggles), covering the various types of feature flags, and how to apply them effectively. When most folks talk about feature toggles, they’re actually referring to Release Toggles:

> Release Toggles allow incomplete and un-tested codepaths to be shipped to production as latent code which may never be turned on.

But here’s the question: do you actually need them? One of the most common arguments that I’ve heard in favour of Release Toggles is when you have two teams working on different components of an app — say, a back-end team and a front-end team. They have different repos, and different release cadences. The front-end team works in an Agile fashion with frequent releases, but the back-end team is more waterfall-y. The front-end team needs to implement Release Toggles so that when the back-end team finally releases their features to prod, the front-end team can turn on their features.

But why? No matter how fast the front-end team is, their speed is hampered by the (lack of) speed of the back-end team. So the front-end team should either release as slowly as the back-end team, or the back-end team should release as quickly as the front-end team.

Otherwise, releasing for the sake of releasing is just theater.

### Why put protection around an entire repo when I can just protect my branches?

So instead of protecting your team by putting protections around a fork, which are less granular, you’re talking about protecting specific team branches within a repo??

That pretty much defeats the collaborative and distributed nature of Git, doesn’t it? We might as well go back to those centralized version control systems from the olden days, like ClearCase and TFVC. Ew.

![](https://cdn-images-1.medium.com/max/800/1*WjNtCncR0aaink_ysjp9jA.gif)

Jimmy Fallon “Ew” segment

### The ERF model says I should merge often to my integration branch. But frequent merges are always breaking the build!

If you’re not integrating often, you ain’t doin’ DevOps. And if you’re scared of integrating because you’re worried that merges are going to break the build, then you definitely ain’t doin’ DevOps.

The beauty of continuously integrating is that if and when issues creep up (and they will), teams can respond to them quickly. But if you’re so scared of integrating that you wait to just before you release to QA, then that’s akin to waiting to the last minute to do your income taxes, and realizing that you’re missing a bunch of tax slips.

It’s scary AF because you procrastinated and now you have to scramble to fix a crap ton of build issues that would’ve probably been very minor had you addressed them earlier. Worse yet, what if waiting to integrate later makes you realize that you need to do a major code refactor because you didn’t account for a developer’s implementation of a feature earlier? Nightmarish.

### What’s in it for me?

Peace of mind. Not stepping on someone else’s toes. For real. Wouldn’t it be nice to isolate you and your dev team from the noise around them, so that they can have some peace of mind while they code, not worried about accidentally merging into the wrong branch because there are so many branches out there?

### Conclusion

So here’s the thing. There are good branching strategies, and there are bad ones. I won’t harp on and on, but I will say this:

> At the end of the day, you want to choose a branching strategy that is simple, and can be easily followed by your whole team without babysitting.

If your branching strategy can give you that, then more power to you, girlfriend!

ERF provides a simple, safe, and quick (i.e. DevOps-y) way to build code for large teams who have to work on multiple concurrent releases on the same codebase. Why not give it a try?

By [Adriana Villela](https://medium.com/@adri-v) on [May 3, 2020](https://medium.com/p/e875ed525979).

[Canonical link](https://medium.com/@adri-v/wut-the-fork-e875ed525979)

Exported from [Medium](https://medium.com) on June 3, 2026.