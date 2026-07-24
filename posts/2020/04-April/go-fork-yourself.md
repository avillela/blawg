---
title: "Go Fork Yourself"
slug: go-fork-yourself
description: "Ephemeral Release Forking: A Git Working Model for Teams Managing Monoliths"
added: "Apr 02, 2020"
tags:
  - technical
  - thought-leadership
  - devops
  - "2020"
---


![](https://cdn-images-1.medium.com/max/800/1*BEy22Fudy4nAA2CPWMN9XA.jpeg)

My rubber chicken is horrified by bad Git practices

In our experience, many companies tend to have at least one very large, bastard codebase touched by many developer hands at once.

If you work for a large enterprise, chances are that your organization has a monster app featuring a codebase that is touched by many developer hands at once. It’s probably a legacy app that everyone is too afraid to refactor, for fear that “fixing” one thing may break another. And, most likely, the codebase used to be hosted on some [centralized version control system](https://medium.com/faun/centralized-vs-distributed-version-control-systems-a135091299f0) (CVCS), such as [TFVC](https://en.wikipedia.org/wiki/Azure_DevOps_Server#TFVC) or [ClearCase](https://en.wikipedia.org/wiki/Rational_ClearCase), and has recently all been moved everyone’s favorite [distributed version control system](https://medium.com/faun/centralized-vs-distributed-version-control-systems-a135091299f0) (DVCS), Git.

Moving from a centralized version control system to a distributed version control system can be scary. You are, after all, being asked to learn a new set of commands, and worse…a new way of working. Because humans are creatures of comfort, they tend to stick to what makes them feel comfortable, and inevitably, that means trying to use the same dev patterns to work that they used in the old version control system (VCS), and port them over to Git.

This can result in disastrous patterns of behaviour:

*   Creating aliases to make Git work like your old VCS.
*   Storing build artifacts in Git (it was considered okay to do this in ClearCase, for example).
*   Non-Git branching strategies
*   [Cherry-picking](https://devblogs.microsoft.com/oldnewthing/20180312-00/?p=98215) as part of your workflow

Even if you do get your team to follow [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) or [GitHub Flow](https://guides.github.com/introduction/flow/), the fact of the matter is, neither branching model on its own can scale very well for large applications being worked on by multiple teams at the same time. One of the biggest side-effects is ending up with multiple branches managed by different teams. This results in:

*   Accidentally merging code into the wrong branch, therefore breaking code
*   [Cherry-picking](https://devblogs.microsoft.com/oldnewthing/20180312-00/?p=98215) code from a bunch of branches into a release branch. This is a nightmarish task that often requires a team of Git pros to do this, and which is the equivalent of picking all the red M&Ms from a large jar full of M&Ms. Not fun.

Don’t believe me? Check out the diagram below. It’s a real Git network diagram for an app at a large enterprise. Gross.

![](https://cdn-images-1.medium.com/max/1200/1*3IYlW3iLJkNncBgPaK2qxA.jpeg)

Screen capture of an organization’s total bungle of Git branching. These are all long-lived branches.

To solve this, my good friend and business partner, [Bernard Otu](https://medium.com/u/2cce98ae7530), came up with a forking model called Ephemeral Release Forking (ERF).

### Fork is a 4-letter word

Before we get started, let me just say that whenever we mention this forking model to some folks, they tend to go all bug-eyed, as if I’d told them that their dog died. As if forking is this horrible practice. Or that forking is reserved only for open-source projects. Who wrote that rule? Okay. My rant is over.

Behold the Ephemeral Release Forking model.

![](https://cdn-images-1.medium.com/max/1200/1*8l1me0YN6Y62gD856rGZwQ.png)

Ephemeral Release Forking Model

Before we get into how it works, let’s talk about why forking is generally a good idea:

1.  It minimizes the number of branches being worked on at any team
2.  It prevents teams working on different releases from accidentally mucking up each other’s code

#### How Ephemeral Release Forking Works

1- Start with a a “Golden Repo”. This repo represents code that is currently in production. The Golden Repo has only one branch: the **master** branch.

2- A fork of the Golden Repo (with [fork syncing](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork) enabled) is created for each release being worked on.

*   The fork is named after golden repo and the major release #. For example: MySuperApp-2.0.0, or MySuperApp-3.0.0.
*   If you’re creating a hotfix off of the current 1.x prod code, you create a hotfix fork named MySuperApp-1.0.0

3- The fork has both a **master** and a **develop** branch. The **develop** branch is the [integration branch](https://stackoverflow.com/a/4428767).

4- All developers work off of feature branches created off of the **develop** branch.

*   When they are ready to integrate their code, the developer submits a pull request to their team lead, and once approved, the code is merged into the **develop** branch.

5- Once the code is merged into the develop branch, it kicks off a CI process using your favorite CI tool (e.g. [Circle CI](https://circleci.com), [Bamboo](https://www.atlassian.com/software/bamboo), [Jenkins](https://jenkins.io)) to build the code and publish the artifact into the artifact repository of your choice (e.g. [JFrog Artifactory](https://jfrog.com/artifactory/), [Sonatype Nexus](https://www.sonatype.com/product-nexus-repository)).

*   Specifically, the artifact is published into the Snapshots Repo.
*   The package version is bumped each time a new package is published to Snapshots. For example, in the MySuperApp-1.0.0, artifacts published to snapshots might be called MySuperApp-1.2.0, MySuperApp-1.3.2, etc. The major version stays the same, because all work is being done off the 1.x fork.
*   There is one CI pipeline per fork.

6- Upon dev completion, the team lead promotes the package from the Snapshots Repo to the Release Candidates Repo, at which point it is QA ready.

*   The package is ready to be deployed to QA, and can be tested ad nauseum (hopefully via automated QA tests).
*   Any bugs identified means that it goes back to developers, and then repeat Steps 4 onward

7- Once the QA lead is happy with the package, they promote the package from the Release Candidates Repo to the Releases Repo.

*   Packagers in the Releases Repo are ready for Production!

8- Once the package has been deployed to Production, the code is tagged, and a pull request is submitted to merge code from the **develop branch of the fork** to the **master branch of the Golden Repo**.

*   Remember how we enabled [fork syncing](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/syncing-a-fork) in Step 2? In doing so, it ensures that any code merged to **master** in the Golden Repo is automagically propagated through to the master branch in the forked repos. This means that hotfix code is automagically propagated to any teams currently working on a release in their own forks.

9- The forked repo is then subsequently deleted, along with its CI pipeline.

*   Our release has made it into prod, so we don’t need it anymore
*   Because our code is in the Golden Repo and has been tagged, we can always create a new fork to work on any hot fixes

#### Additional goodies:

*   Just because the code is automagically in the fork’s master doesn’t mean that it automagically makes its way to **develop**. The team lead must always merge code in the fork from **master** to **develop** at least once a day to ensure that the fork has the latest and greatest prod code
*   There might be two teams working on two overlapping releases simultaneously, so how do you ensure that the team working on Release 3 gets some of the goodies being worked on in Release 2? Via pull requests!

### Does this work?

All that’s well and good, but does this actually work? Yes, it does. We tried it at our previous organization, and it helped untangle branching messes. By having a simple branching strategy, we helped our previous organization achieve true Continuous Integration. One of the biggest things that I’ve seen at various organizations on Continuous Integration is that they would often merge into their integration branch close to when code needed to be delivered to QA. This meant that developers were often scrambling to fix code merge issues, and it promoted a culture whereby developers feared merging their code into the integration branch. This approach allowed developers to fail fast and to recover fast. Most importantly, it helped to deliver on the DevOps promise of delivering fast and safely.

### Further Reading

Want more gory details? Be sure to check out our follow-up story, [Wut the Fork](https://medium.com/dzerolabs/wut-the-fork-e875ed525979).

By [Adriana Villela](https://medium.com/@adri-v) on [April 2, 2020](https://medium.com/p/c8b69aa655ea).

[Canonical link](https://medium.com/@adri-v/go-fork-yo-self-c8b69aa655ea)

Exported from [Medium](https://medium.com) on June 3, 2026.