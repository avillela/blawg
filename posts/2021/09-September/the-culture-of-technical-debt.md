---
title: "The Culture of Technical Debt"
slug: the-culture-of-technical-debt
description: "(Not just another tech debt story) Understanding when technical debt is okay"
added: "Sep 07, 2021"
tags:
  - technical
  - thought-leadership
---


![A black outline of a person wearing a suit who is entangled by multiples cables coming from all angles of the graphic. The image is meant to represent the “Entaglement of a Technical Debt Culture”](https://cdn-images-1.medium.com/max/800/1*Jca22vgvp-wfEc5Yb_zUoQ.png)

### Skeletons in the Coding Closet

As a software engineer, I am a total perfectionist. I take pride in my work, and in writing beautiful code. Does that mean that my code is always beautiful? Nope. We all have skeletons in our coding closets that we’d rather nobody know about.

Sometimes we write bad code because we just don’t know any better. Whenever I learn a new language, my goal is to get X to work, no matter what. I don’t care how ugly the code is, or how much of a kludge I’ve used. Hard-code a value? Yes, please! As long as it works.

Sometimes we get our coding examples from someone who appears to know what they’re doing, and then it turns out that nope…they had no clue themselves. Oops.

Sometimes we cut corners because of the pressure of a do-or-die looming deadline where you’ve promised something to a customer and they’re expecting it on a given day and their marketing team has already created a big campaign advertising this new product or feature.

Sometimes we need that quick-and-dirty solution because the system is on fire, customers are screaming bloody murder and this thing needs to be up and running no matter what or else.

All of these things are examples of [technical debt](https://en.wikipedia.org/wiki/Technical_debt): the idea of taking short-cuts in the short-term to get something done quickly, instead of going with a more future-proof approach that would take longer to complete.

Is all technical debt bad? Nope. Not necessarily. To understand that better, let’s dig into a financial example, shall we?

![Looking up at palm trees from the ground, as they grace a blue sky surrounded by soft clouds](https://cdn-images-1.medium.com/max/800/1*rAXq_UY07Yxh53ReIRMFzg.jpeg)

Palm trees in Rio de Janeiro’s Botannical Gardens. Photo by [Adri V](https://adri-v.medium.com)

### Financial Debt: An Example

It was the summer of 1999. I had just finished my second year of university. I was working at a bank for the summer (in the mainframe department!), happy to be getting a decent, steady paycheck for the next four months. I applied for and got approved for a student credit card. The credit limit was only $500, but it didn’t matter! I had a friggin’ credit card!

Having a credit card can be a double-edged sword. Now, you suddenly have the ability to buy something, even though at the time of purchase, you don’t necessarily have the funds in your checking account to cover the cost of the item. Heck, it can be super tempting to splurge on a luxury vacation to Hawaii. After all, it’s not Present You’s problem. It’s Future You’s problem.

Ah, but here’s the rub. There’s a reckoning at the end of the month, isn’t there? You have a choice: pay off your balance in full, or carry a balance.

Unfortunately, it’s not as simple as carrying a balance, is it?

Not only does the balance continue to accumulate from month to month if you don’t pay it off, the credit card company also penalizes you, by applying an obscenely high interest rate to your balance, so that you end up owing even more in the end. If you don’t break the cycle, you could be carrying a balance in perpetuity, paying more for your item than you paid for in the first place. Worse: it could affect your credit score, making it harder for you to get a loan for a big-ticket item like a house or a car.

![Metal gates with a caution sign, chained shut, against a hazy dessert backdrop.](https://cdn-images-1.medium.com/max/800/1*htYKZ6ZeynFZFHi1tFb0oQ.jpeg)

Photo by [Dan Meyers](https://unsplash.com/@dmey503?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/toxic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

### Toxic Debt Culture

So back to Technical Debt.

Technical Debt becomes a problem when you have a toxic debt culture in your organization. This happens when you make technical debt your go-to operating model, and don’t bake paying your debt down into your day-to-day operations. That can be a real culture killjoy, and also sets some really bad precedents.

Some examples below…

#### **Always Tight Timelines**

I’ve worked at companies where “tight timelines” were the norm. In that case, _of course_ things are going to be rushed! The consequences:

*   Cutting corners with testing, either by prematurely cutting testing cycles short, or by completely skipping things like performance tests.
*   Cutting corners with InfoSec, making security waivers the norm, or waiting last-minute to to security scans or security code reviews. (Pro tip: you can waive security remediations all you want…hackers still gonna hack.)
*   Cutting corners by blindly approving pull requests (PRs). If you’re blindly approving PRs, you might as well get a robot to do the job for you. You’re not doing anyone any favours. PRs should invoke good questions and thoughtful discussions.

There’s no time to think things through. There’s no time to clean up the code.

The worst part is that everyone works such crazy hours and cuts so many corners to make the deadline, that it becomes a never-ending cycle. Management thinks that the devs can work under crazy deadlines, and would continue to push more and more tight deadlines.

In the end, this is unsustainable, as it leads to employee burnout and sub-standard products.

#### **Feature-First Mentality**

Another one of my pet peeves of the tech world. At one of my previous jobs, there was an exec who was focused solely on pushing new features of the flagship product. So much so that the monolithic codebase had turned to spaghetti and was being held together by bandaids and duct tape.

Without a plan to clean up the technical debt, this flagship product was destined to eventually crash and burn.

#### **Rewarding Cowboys**

I hate tech cowboys. They make it bad for all of us. These are the folks who will swoop in to save the day with a quick fix, à la brute force. Sure, it’s fixed. But at what cost? What’s worse is when they’re rewarded by management, either with streams of praise (what about the folks who tried to do things the right way from the start) and/or money. Because of course bad solutions should have money thrown at them.

### The Solution

How do you fix Toxic Debt Culture? The answer lies in one word: **_culture_**. Put simply: don’t make technical debt the default operating model in your organization! This means doing the following:

#### **Start with good intent**

We should always try to do the right thing by default. That means always trying to architect properly in the first place. Obviously code is iterative and mistakes will ultimately be made. That’s the nature of the work. But at least if you start with a good design mindset, you’ll have less of a mess to untangle later.

#### **Plan to pay down your technical debt**

It’s pretty common in tech to see a proof-of-concept (POC) turn into the actual product. That’s okay. As long as you have a concrete plan to clean up that code. Or, if the code is a pile of spaghetti, plan for a proper re-write. It may mean that you can’t ship new features out as soon as you wanted, but at least it may mean that your users won’t be screaming at you because your product is horribly unreliable.

When you have a mortgage on your house, you have a plan to pay down your debt. You also know how much your debt will cost you in the end. With code, it’s the same thing. You need a plan to pay down your technical debt, and you need to realize that the longer you take to pay it down, the more it will cost you — in effort, quality of life, customer happiness — to pay it down.

**_Put it in your OKRs/project plans/sprint plans, and honour those commitments._**

#### **Communicate, y’all!**

The key to good culture? Communication! Transparency! Make it clear that yes, your developers should always strive to do things the right way, but that sometimes corners must be cut to make a deadline.

Again, make a concrete plan to undo the shortcuts sooner rather than later. Pay down your debt! Because the longer you wait, the worse it will be for your devs and for your customers.

### Conclusion

The take-away from all this?

Go ahead and charge things to your credit card, but spend within your means, with the intention of paying your balance (your debt) at the end of the month.

Similarly, when it comes to code, go ahead and take those coding short-cuts. You have my blessing. But you have to promise to fix your code in the future. Not “someday” with no deadline in sight. Not 5 or 10 years from now either. By then, your code will probably be so riddled with technical debt that you probably need band-aids and duct tape just to keep it together.

I will now reward you with the picture of some cute cows.

![A green field of cows, with a single cow looking forward in the foreground, against a blue sky](https://cdn-images-1.medium.com/max/800/0*Ub9SF0hzZ40l69Jv)

Photo by [Christian Burri](https://unsplash.com/@chrisburrc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/cow?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

By [Adriana Villela](https://medium.com/@adri-v) on [September 7, 2021](https://medium.com/p/9e8c70d4b124).

[Canonical link](https://medium.com/@adri-v/the-culture-of-technical-debt-9e8c70d4b124)

Exported from [Medium](https://medium.com) on June 3, 2026.