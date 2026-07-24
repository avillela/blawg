---
title: "Let’s Talk About Psychological Safety"
slug: let-s-talk-about-psychological-safety
description: "Let’s talk about the dark side of tech and how to shed light on it"
added: "Jul 12, 2022"
tags:
  - technical
  - thought-leadership
  - sre
  - advice
  - "2022"
---


![Mural on West Toronto Rail Path: “Be the loves you want to see in the world”](https://cdn-images-1.medium.com/max/800/0*eHqWIbOqIWagoUzj)

_Mural in the West Toronto Rail Path. Photo by_ [_Adriana Villela_](http://adri-v.medium.com/)_._

### There’s something askew…

On the morning of Friday, July 8th, 2022, as I rolled out of bed, I instinctively reached over to my phone to check the weather for the day. Right away, I knew that something was off. My weather app wouldn’t load the weather. I toggled my wifi only to realize that I had no bars of cell signal on my phone. My husband’s phone also had no bars. No cell service and no internet. What was this? The ‘80s?!

As remote workers, this meant that we could not work until this thing got resolved. Cut off from the outside world, we scrambled to find out what was up. How bad was this thing? Luckily we live near a subway station with free wifi, so we stood across the street from the station and bummed a wifi signal from there.

![My Slack status: “No internet or cell. Free subway wifi is periodic lifeline. Send good internet vibes.”](https://cdn-images-1.medium.com/max/800/1*9Z30QafVV5MKuHMGmNaZ0w.png)

_My Slack status on July 8th. Screen shot by_ [_Adriana Villela_](http://adri-v.medium.com/)_._

We were able to check in with our respective co-workers and scour the interwebs to find out what was up. There was a [Rogers](https://www.rogers.com) service outage, and it affected cable, cell, and internet services. For those not in Canada, Rogers is one of our three large telecom providers. Our other two large providers, [Telus](https://www.telus.com/en) and [Bell](https://www.bell.ca), were unaffected.

![Rogers outage message on July 8th, 20022](https://cdn-images-1.medium.com/max/800/1*ah0Ni2sioy6ZYeNBHwGKdA.png)

_Rogers service outage message on July 8th, 2022. Screen shot by_ [_Adriana Villela_](http://adri-v.medium.com/)_._

### Psychological Safety

To say that this situation sucked is an understatement. It definitely made me realize just how dependent we are on internet connectivity for our day-to-day lives. Blows my mind. 🤯 I wasn’t able to work at all on Friday, which meant I was a bit behind on my work. I know that it was far worse for others. I think of the Uber drivers who couldn’t make their living because they were on the affected network. I think of the store owners who couldn’t accept debit payments because the outage affected Interac. What about folks closing on a house that day who couldn’t transfer funds? Folks who needed to cash out investments to make a down payment for a house. Or folks who couldn’t get cash at the ATMs of the affected banks. So yeah. This definitely sucked for a LOT of folks. But do you know who this also sucked for? The folks in the thick of this outage, who were probably breaking out in cold sweats, shaking in their booties, losing sleep, skipping meals, and straight up having panic attacks as they tried to resolve this issue as quickly as possible.

Before y’all come at me with your torches and pitchforks, let me remind you that the folks who were working to resolve Friday’s outage are HUMAN, and they were probably having the WORST. DAY. EVER.

This got me thinking of all the times I was involved with major production issues, and just how friggin’ STRESSFUL it was. Imagine being called on to solve a production issue. You don’t know what’s going on. You need to get your bearings, and you need to do it FAST. To top it all off, you’re likely on a call with a ton of people, including project managers and execs who are breathing down your neck, asking you for updates. If you’re super lucky, you’ll get some cowboy exec who “used to code” 20 years ago and tries to tell you how to troubleshoot. Recipe for SO. MUCH. FUN. Not.

Many folks who have worked in support or operations type roles have some serious PTSD from their experiences when they are called into fixing production issues. To the point where some just walk away from these types of roles, because it scars them for life. And the reason why they have PTSD over this is because they don’t have psychological safety.

So, what is psychological safety? [Wikipedia](https://en.wikipedia.org/wiki/Psychological_safety) actually gives a really good definition:

> _“Psychological safety is being able to show and employ oneself without fear of negative consequences of self-image, status or career”_

![This is a Merp. It’s a fuzzy purple creature, and it’s very cute. It’s saying “Merp”](https://cdn-images-1.medium.com/max/800/1*KNwJ9_fCZlDJnpwkLwmkWg.jpeg)

_This is a Merp. It’s cute. Image by_ [_Hannah Maxwell_](http://instagram.com/old_fashion_glazed)

### Meh. Who cares?

Why is psychological safety important? Because it gives folks room to fail. I’ve put in changes that broke a system before. It wasn’t intentional. And when I realized what happened, I was wracked with guilt, and was sweating buckets to find out the root cause. Unfortunately, like many folks in our industry, I didn’t have sympathetic management on my side to shield me from the fallout. If anything, I’ve had managers who were only too happy to point fingers at me for my failures.

Unfortunately, even though I vowed to not do this myself as a manager, I’m ashamed to say that I’ve been part of the problem too. I was once managing a team that was responsible for a critical backbone system. They made a maintenance change during the day, assuming that it wouldn’t affect anything, because when they’d made the same change in pre-prod, everything had been copacetic. Of course, things went south in prod. Because you know…Murphy. It brought the system down. Fortunately, my team was amazing and they were able to figure out the issue quickly, and brought things up within minutes. High fives all around.

Then, upper management started messaging me. And texting me. They wanted answers. Why did this system go down? How could this happen? I assured them that the team didn’t realize that this would happen in prod, since it had worked in pre-prod. I promised that we would use off-hours maintenance windows. The team was not happy. We were trying to push the needle by following more SRE-like practices (like [deployments and updates during business hours](https://docs.microsoft.com/en-us/devops/operate/safe-deployment-practices)), and this was not [SRE-like](https://sre.google/sre-book/part-III-practices) at all. We all knew it. But I was trying to keep upper management happy.

We had _another_ outage a couple of weeks later. Similar, but different. Fixed quickly again. But upper management was livid. Why was this happening again? More messages, more texts, and video calls to the tone of “Explain yourself!”

I let them get into my head, and I told the team how upper management was unhappy with these outages. Which of course stressed my team. They felt bad enough about the outage as it was. They’re good people. Smart people. Trying to do the right thing. But they’re also human. They make mistakes. And getting flack from me, even if it was minor flack, was distressing. And my team lead called me out on it. He sent me a private message saying that I wasn’t providing the team with psychological safety.

Whoa. Did that ever hit me like a ton of bricks! My first reaction was anger. How rude! How dare he? I thought I went pretty easy on the team. My tone was chill. What’s his beef? They weren’t following protocol. Screw him. I was livid.

But now that I think of it, HE. WAS. RIGHT.

You see, there were two points of failure here. First, upper management was putting pressure on me because their major client had experienced so many outages (mostly not related to our team) that just one more outage, even a minor one that was fixed quickly, eroded their confidence in the company. But I think that perhaps they could’ve “trained” their client to understand that outages happen and that it’s about how quickly you recover from the outages that matters. Instead, they continued to feed the client’s notion that failure should never ever ever happen. If only…

Then there was me. As a manager and spokesperson for my team, I should’ve done a better job of protecting them. Making it safe for them to fail. Telling them things like, “Upper management is on my butt over this and they want answers” just makes a stressful situation worse. I should’ve also pushed harder on the notion that we can only mature our SRE practices if we’re allowed to fail fast, recover quickly, and make changes during business hours. As a leader, I have to help make the change happen, and in this case I didn’t.

Do I regret my actions? Definitely. Couldda wouldda shouldda, right? But let me tell you…I learned from my gaffe. I am so much more aware of psychological safety as both a manager and an individual contributor, and as part of my mission as a Developer Advocate, I want more people talking about psychological safety.

### The Path to Psychological Safety

How do we achieve psychological safety? Though behavioural changes. That good ‘ole mindset change that we hear in the DevOps and Observability circles! Yes, it’s a real thing! And it starts with leadership.

For leaders, here are some things y’all can do to help:

*   **Give engineers room to breathe.** I can assure you that asking the poor engineer when the issue will be fixed is incredibly aggravating. I can also assure you that when they have an update, the engineer will happily, gleefully, and excitedly be more than willing to report status.
*   **Don’t make your teams feel guilty for causing a failure or not fixing things quickly enough.** Remember that sometimes you have people who had nothing to do with the failure who are trying really to fix that system. Y’all need to cut them some slack!
*   **Understand the root cause.** This means that you don’t point fingers at _who_ caused the change, but instead focus on the _what_ — i.e. understand the contributing factors that led to the failure.
*   **Create a safe space for your direct reports.** In doing so, they will feel comfortable in coming to you with concerns and even suggestions for improvement. To achieve this safe space, you will need to invest in relationship-building. Trust in them, and in return, they will trust you. If they feel that you have their back, they’ll have yours. I assure you. I’ve been on both sides.
*   **Celebrate your engineers for the rockstars that they are. (Maybe give ’em a hug too. #HugOps)** Really. As one friend of mine put it, 99% of the time, we as end-users are spoiled by relatively smooth-running systems, because there are engineers working their magic to minimize service disruptions. And yet folks are ready to pick on the 1% that went wrong, without even appreciating that there’s some seriously amazing work being done 99% of the time. How’s that good for morale, retention, and burnout prevention when your staff don’t even feel appreciated?
*   **Embrace the failure.** Failure is inevitable, so the sooner you learn to deal with it, the better!

![People crowding around guy in blue shirt as he saves the day in production](https://cdn-images-1.medium.com/max/800/1*jmAVdssx0XkWmpqOo8Eu8g.jpeg)

_The guy in the blue shirt is under pressure during a prod crisis._

So the above list is a great start. But wait…there’s more that can be done! Because we have some wonderful tools and practices at our disposal to help make this happen.

First off, there’s [Observability](https://adri-v.medium.com/list/unpacking-observability-be1835c6dd23). (Come on…y’all didn’t think I could do a whole blog post without mentioning Observability, did you? 😉) Observability is your friend when major incidents arise, because it provides you a holistic view of your system. [Properly-instrumented code](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code#instrument-your-code), along with a [good Observability back-end](https://medium.com/dzerolabs/unpacking-observability-how-to-choose-an-observability-vendor-aa0e6d80b71d) help you see what’s going on in your systems so that you can troubleshoot things quickly and effectively. In doing so, troubleshooting goes from, “Ahhhh!! WTF is happening?!” to, “Oh, I can follow these breadcrumbs to see what’s going on in my system.” This puts support folks at ease because they know that they have the tools to confidently troubleshoot an issue. This puts management at ease, because they know that their support folks are empowered to troubleshoot quickly and effectively. In short, [Observability gives you psychological safety](https://twitter.com/LightstepHQ/status/1545149604764721154).

> [](https://twitter.com/AkitaSoftware/status/1545162437132820480?s=20&t=wJVrXfbZbh2S-7A202ghFA)

> [](https://twitter.com/dangolant/status/1545163665661362178?s=20&t=wJVrXfbZbh2S-7A202ghFA)

Secondly, there are [Service-Level Objectives](https://opentelemetry.io/docs/concepts/observability-primer/#reliability--metrics) (SLOs). SLOs help us identify what data ingested by your Observability back-end are important and alert-worthy. SLOs connect telemetry with specific customer experiences, so that the entire organization can understand the relationship between the software system and the business goals.

Finally, there is [Incident Response tooling](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code#use-apis-for-incident-response-tool-configuration), which, when properly configured and integrated with your Observability back-end, ensures that the right people are contacted at the right time, triggered by the right [SLO-based alerts](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code#get-your-slo-game-on-and-codify) to investigate an issue.

In a nutshell, psychological safety is made possible by:

*   Proper support from management
*   Observability practices supported by tooling
*   SLO-based alerts
*   Incident response processes and tooling

### Final Thoughts

I think we can all agree that the July 8th/9th outage sucked for those of us affected. This also exposes the fact that there’s a system resiliency and reliability issue that needs to be addressed in order to ensure customer retention and confidence. I don’t think that anyone would argue with that. But remember that our systems of today are far more complex than they were even 2 years ago. The systems and devices that we enjoy today are backed by impossibly complex systems, and the more complex our systems, the more risk is involved.

Also, remember that this situation also TOTALLY SUCKED for the folks on the front lines who were desperately trying to resolve the Rogers outage. That said, if anything good came out of it, it’s that it once again opens up the conversation about psychological safety and how important it is in the tech world. Without psychological safety, you end up with burnout, and you end up with fewer and fewer people who are willing to take on these critical support roles that make our world run seamlessly.

As a final thought, I’d like to leave you with these words from a good friend of mine:

> _“As someone who works in IT and has been through many production outages I know how stressful this can be._

> _\[…\] before people start getting all upset at rogers about this outage they should realize that:_

> _1) This wasn’t them intentionally trying to be an asshole to you_

> _2) This could happen to any of our communication companies._

> _3) There are a lot of IT professionals right now working hard to fix this. IT professionals who are not sleeping and eating while they work on this. It is extremely stressful for these people. They are working hard and deserve respect for the hard work they are doing._

> _Bottom line: be careful if you cast the first stone in the complain and blame game.”_

Now, please enjoy this picture of my rat Chrissy, who fancies herself a lioness today.

![Chrissy the rat pokes her head through a piece of paper towel. She looks like a little lion](https://cdn-images-1.medium.com/max/800/1*N0jH85sjMWR5O1wsmZ-b6g.jpeg)

_Chrissy the rat fancies herself a lion. Photo by_ [_Hannah Maxwell_](https://www.instagram.com/old_fashion_glazed/)_._

Peace, love, and code. 🦄 🌈 💫

Join the conversation! We’d love to hear your thoughts on psychological safety. Connect with us on the [Lightstep Community Discord](https://ltstp.run/discord), or get in touch by [e-mail](mailto:devrel@lightstep.com). Hope to hear from y’all!

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/lets-talk-about-psychological-safety)_._

![](https://cdn-images-1.medium.com/max/800/0*q0gD6T-bw7EvlT8-.png)

#### If this post was helpful, please click the clap 👏 button below a few times to show your support for the author 👇

#### 🚀Developers: Learn and grow by keeping up with what matters, [JOIN FAUN.](https://faun.to/8zxxd)

By [Adriana Villela](https://medium.com/@adri-v) on [July 12, 2022](https://medium.com/p/7cff102ce8be).

[Canonical link](https://medium.com/@adri-v/lets-talk-about-psychological-safety-7cff102ce8be)

Exported from [Medium](https://medium.com) on June 3, 2026.