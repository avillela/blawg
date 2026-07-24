---
title: "Applying SRE Principles to Design Reliable COVID-19 Vaccinaton Registration Systems"
slug: applying-sre-principles-to-design-reliable-covid-19-vaccinaton-registration-systems
description: "How to use data to build reliable COVID-19 vaccine registration systems that won’t buckle under pressure, and won’t irritate users."
added: "Mar 18, 2021"
tags:
  - technical
  - sre
---

# Applying SRE Principles to Design Reliable COVID-19 Vaccinaton Registration Systems

![](https://cdn-images-1.medium.com/max/800/1*xoW4gv3D7XxJxHGEnuaYZQ.png)

Mural in the West Toronto Rail Path. Photo credit: Dzero Labs

### A COVID-19 Tale

This week, after months and months of waiting for COVID-19 vaccines to reach the masses in Canada, vaccine distribution has finally shot up. And of course, when you’ve got tons of anxious people waiting for their dose of liquid gold, you need a good system in place to allow people to sign up for their chance at an arm jab. This is where technology can either be your friend, or your foe.

Unfortunately, things seem to point toward the foe part, like this tweet below:

> [](https://twitter.com/CheriDiNovo/status/1371482614662639618?s=1001)

Folks on Twitter expressing their discontent with Ontario’s vaccination sing-up system

Other parts of the country weren’t faring that much better either, like in [Nova Scotia](https://www.halifaxexaminer.ca/province-house/vaccination-registration-website-overwhelmed-taken-off-line/), [Alberta](https://www.cbc.ca/news/canada/calgary/alberta-vaccine-booking-overwhelmed-1.5925889), and [British Columbia](https://www.citynews1130.com/2021/03/08/bc-covid-vaccine-booking-system-busy/).

This, my friends, is what happens when systems are poorly-designed.

> **NOTE:** _In Canada, each province and territory is responsible for vaccine distribution._

### The Ugly (Tech) Truth

If we dig a little deeper into the nature of the complaints, we see an emerging trend:

*   The registration web sites are overwhelmed because provincial governments didn’t anticipate so many people wanting to sign up
*   The registration web sites work for some people, and error out for others
*   Some older folks simply aren’t tech savvy or don’t have access to a computer or smartphone, and therefore can’t use an online registration form

In short, for the people trying to register to get their arm jabs, **_the vaccination registration systems were not doing what they were supposed to be doing_**.

So…what happens when:

1.  A service isn’t doing what its users need it to do?
2.  Your users are not happy?

Well, if 1 and 2 are true, then it means that **_your service is not reliable_**! (Source: [Implementing Service Level Objectives](https://www.oreilly.com/library/view/implementing-service-level/9781492076803/), by [Alex Hidalgo](https://twitter.com/ahidalgosre))

### People + Data

So how do we fix this? Great question! The good news is that this ain’t rocket science.

#### Who’s using the service?

First, we need to start with the basics:

> [](https://twitter.com/ahidalgosre/status/1342178980946993152?s=20)

Yup. Focus on the people who are going to use the service. Genius!

Okay, so let’s look at the people using these services:

*   **_They’ve been ITCHING for a COVID-19 vaccine._** Hello? Canada has been waiting and waiting and waiting while other countries are getting vaccines. So yeah…demand will be HUGE.
*   **_They’ll be trying to use the vaccination registration services at the same time_**. Hello? Liquid gold? Light at the end of the Pandemic Tunnel of Hell? Gimme some vaccine now!
*   **_They expect the web site to be up._** No crashy crashy. If Best Buy, Bed Bath & Beyond, and Amazon can handle Black Friday, we know that it’s possible to do this.
*   **_They expect to register to get an appointment in a timely manner._** At a bare minimum, timely means not wasting your time for 3 hours on 3 different browsers (hello power users) while hitting refresh in the hopes of getting a time slot. Yeah, we’re stuck at home, but a date with a web browser ain’t my idea of fun.
*   **_They don’t care if their age group isn’t part of this round of signups._** It sucks, but it’s true. We know that some people will try to jump the queue. Humans aren’t known to be civil in dark times. Remember all that [panic buying in the beginning of the pandemic](https://www.ctvnews.ca/health/coronavirus/nobody-was-ready-retail-council-of-canada-urges-consumers-to-stop-panicking-as-grocers-stripped-bare-1.4851901)?
*   **_They need a way to be able to register to get an appointment if they don’t have access to fancy tech._** This means that our service needs to be API-driven. Whether you’re using a web site or a phone to register, the back-end should be the same. Maybe the existing services already are. If so, then that’s good.

#### Let the data do the talking

This gives us a pretty good picture of what our users want, and what will make them happy. But we can do better, by using data to drive our system design.

First off, let’s address the elephant in the room. Provincial governments know how many people are candidates for each phase of vaccination. Therefore, the web site should expect a high number of concurrent users during the initial hours of operation. So saying that you’re surprised that so many people are signing up is just a lame excuse, and I’m not buying it.

What does vaccination registration remind us of? Maybe this:

*   People flooding online retailers for Black Friday deals
*   Buying concert tickets
*   Signing your kid up for summer camp
*   Vaccination registration services from other cities around the world getting clogged up

Yup. So we’re not reinventing the wheel. We’ve experienced using high-volume, high-demand systems before. We’ve seen them work really well (Amazon), and we’ve seen them crash and burn (buying concert tickets). Let’s use what we know of these systems to help us design our own system so that it is responsive and scalable.

**We know that the system will be flooded**, so we need to make sure that our web app can scale to handle an obscene number of requests. If you’re using Kubernetes, for example, this means:

*   Making sure that you have a node scaling mechanism that ensures enough nodes to handle the predicted surges in traffic. You may also need some form of user-friendly throttling as can be provided by a [CDN](https://www.akamai.com/us/en/cdn/what-is-a-cdn.jsp).
*   Making sure you provisioned the right type of nodes (i.e. Do you need something that’s light on CPU and heavy on RAM? Heavy on CPU and light on RAM? Perhaps a balance?)
*   Making sure that your pods can scale appropriately. You definitely don’t want to scale up to 4 pods max, knowing that you’re going to get flooded.
*   Making sure that you’ve allocated the right amount of CPU and RAM to your pods

We also know that users expect some sort of quick response. The trick here is that we can lighten the load with some batch processing.

Sure, we’ll have a web front-end where we capture basic users data, like name, address, phone number, date of birth, health card number, and top 5 preferred time slots. Then, you submit the form.

When you submit the form, your request is put into a queue for asynchronous processing. This way, we’re not killing the system with crazy traffic bombarding a database. Once the item in the queue is processed, the system will do some magical number crunching, and will get back to you via text or email with a suggested one-hour window that most closely matches the time preferences you selected. If you’re not part of the age group being serviced, it will give you a date starting in the month when vaccinations open up to your age group.

Either way, the system will send you a one-hour window based on your stated preferences. That window will accommodate not only you, but others as well. If you assume it takes 5 minutes for a nurse to jab a person, you’re looking at sharing that time slot with 12 other people. The nice thing about that is that you don’t need to worry about dishing out super-granular time slots, so again, it keeps things moving.

The system will hold that time window for say, 10 minutes, to give you time to decide if you want it. If you take longer than 10 minutes to respond, or if you don’t want that time window, it’s released and is made available to someone else. If you don’t want the time window, you have the option of going into the system again. And because our system is way more reliable and scalable, next time you go in, you’re again not having to wait for hours on end in front of a spinning wheel to see if maybe you got through.

What about the non-tech savvy folks, or those without access to smartphones or a computer? In that case, a telephone system can be put in place to help them. Either an IVR one, or one with a customer service rep who can jot down your info for you, and enter it into the web form on your behalf. In either case, we’re still hitting the same underlying asynchronous service. The magic of an API-driven solution!

![](https://cdn-images-1.medium.com/max/800/1*QYGtcossbxgh0_J9Ze_cuA.png)

VERY simplified flow of our improved vaccine registration system

What about retirement residences? They shouldn’t have to go to a vaccination center. Instead, the vaccinations should come to them.

If you’re a still a little lukewarm to this solution, then think of it this way:

This solution is akin to calling a help desk, and being told to provide a number for them to call you back when it’s your turn to be served. In this case, when they do call you back, they give you an available time window that you can accept or decline. It’s like when you try to buy a block of tickets for a concert or a play, and you’re given the “best available seating”, based on seating preferences that you selected earlier.

### Conclusion

To be clear, the above example is a simplification. There are a ton of other things to keep in mind when designing a reliable vaccination registration system. That said, the point is that it IS possible to design a system that isn’t overwhelmed by crazy volumes and doesn’t make its users want to throw their shoe at you.

First, we need to understand who the system’s users are and how **_they_** expect the system to behave. Secondly, need to let data drive how we’re going to scale the system — like knowing that you’ll have a swarm of users on the site at the same time when you “open your doors” — so that we end up with a system that doesn’t exasperate most users most of the time.

And now, I shall reward you for putting up with my rant by showing you a picture of a cute baby seal.

![](https://cdn-images-1.medium.com/max/800/1*E-mmtJZJiOXhQoHswAGtkg.jpeg)

Photo by [Diana Parkhouse](https://unsplash.com/@ditakesphotos?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on Unsplash

Peace, love, and code.

### Other related posts you might like

[**How to Structure Your Organization to Achieve DevOps Excellence**  
_Many organizations are still missing the mark on DevOps. Let me show you how to turn that around._medium.com](https://medium.com/dzerolabs/how-to-structure-your-organization-to-achieve-devops-excellence-947b04d6a80b "https://medium.com/dzerolabs/how-to-structure-your-organization-to-achieve-devops-excellence-947b04d6a80b")[](https://medium.com/dzerolabs/how-to-structure-your-organization-to-achieve-devops-excellence-947b04d6a80b)

[**How to Fix Your Broken Enterprise DevOps**  
_Scaling Enterprise DevOps with Ephemeral and Multi-Dimensional Pipelines_medium.com](https://medium.com/dzerolabs/how-to-fix-your-broken-enterprise-devops-145be3d52ae2 "https://medium.com/dzerolabs/how-to-fix-your-broken-enterprise-devops-145be3d52ae2")[](https://medium.com/dzerolabs/how-to-fix-your-broken-enterprise-devops-145be3d52ae2)

[**The Six Horsemen of the DevOps Apocalypse**  
_DevOps at Enterprise Scale: It’s Complicated_medium.com](https://medium.com/dzerolabs/the-six-horsemen-of-the-devops-apocalypse-a26ee8846f1f "https://medium.com/dzerolabs/the-six-horsemen-of-the-devops-apocalypse-a26ee8846f1f")[](https://medium.com/dzerolabs/the-six-horsemen-of-the-devops-apocalypse-a26ee8846f1f)

### Recommended Reading

*   [_Implementing Service Level Objectives_](https://www.oreilly.com/library/view/implementing-service-level/9781492076803/), by Alex Hidalgo
*   [_The Data Detective: Ten Easy Rules to Make Sense of Statistics_](https://www.amazon.ca/Data-Detective-Rules-Sense-Statistics/dp/0593084594), by Tim Harford

By [Adriana Villela](https://medium.com/@adri-v) on [March 18, 2021](https://medium.com/p/1a3c234fbf85).

[Canonical link](https://medium.com/@adri-v/applying-sre-principles-to-design-reliable-covid-19-vaccinaton-registration-systems-1a3c234fbf85)

Exported from [Medium](https://medium.com) on June 3, 2026.