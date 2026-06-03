---
title: "Beyond Platform Engineering"
slug: beyond-platform-engineering
description: "Engineering the Past, Hacking the Present, Transforming the Future"
added: "May 31, 2024"
tags:
  - technical
  - platform-engineering
---

# Beyond Platform Engineering

_co-written with Renata Rocha_

![](https://cdn-images-1.medium.com/max/800/0*xLlVIuJtOU-nvHE8.png)

Ferris Wheel at the Port of Old Montreal. Photo by Hannah Maxwell.

### The Elephant in the Room

First off, thank to for not running away screaming after seeing the title of this blog post, because let’s face it: our industry _loves_ buzzwords. We have many colleagues who, after surviving so-called “DevOps transformations”, cringed when “SRE” and “Platform Engineering” became popular terms. Especially when many organizations took that as a prompt to rebrand existing ops teams as SRE teams or Platform Engineering teams. And let’s not forget the companies out there who jump on these buzzword bandwagons and try to shove DevOps, SRE, and Platform Engineering products in our faces. Like we don’t have enough tools to worry about, amirite?

And aren’t these just all different ways of saying the same thing anyway?

We’re here to tell you that there is a difference, and that there is a method to our madness. To illustrate our point, we’ll take you on a little journey through time. So sit back, relax, and enjoy the show.

### In The Before Times

![A cat hacking the matrix with green binary code. Digital art, oil pastel, galaxy vibe](https://cdn-images-1.medium.com/max/800/0*YZLLy7hd4-Ds6ABM.png)

[Generated with Bing AI](https://copilot.microsoft.com/images/create/a-cat-hacking-the-matrix-with-green-binary-code-d/1-664256879b77483e8d95464ade1d18af?id=59Y2WRAQKq4xnJeVXwLD5Q%3d%3d&view=detailv2&idpp=genimg&idpclose=1&thId=OIG4.8CHRWgqpNsTpZ_.m.JN2&lng=en-US&ineditshare=1)

In the beginning, managing a bunch of computers before the Cloud was no walk in the park, because:

*   **We used to** [**telnet**](https://en.wikipedia.org/wiki/Telnet) **to computers.** Do y’all remember that? _We_ sure do! That was SO.NOT.SAFE.
*   **Computers were _huge_.** About 20 or 30 years back, computers used to be quite large. Maybe not as large as the original computers that [used to take up a whole room](https://www.scienceabc.com/innovation/how-did-computers-go-from-the-size-of-a-room-to-the-size-of-a-fingernail.html), but still large.
*   **Computers were** [**L33T**](https://en.wikipedia.org/wiki/Leet)**.** [The Matrix](https://www.imdb.com/title/tt0133093/) and [Hackers](https://www.imdb.com/title/tt0113243/) did a great job of making sysadmins look suuuper cool!
*   **Processing power took time and $$$.** We really take for granted that compute power is much less expensive than it was a couple of decades back. Consider this: [our smartphones have more processing power than the computers that sent humans to the moon in 1969](https://www.newmarkettoday.ca/local-news/beyond-local-the-computing-power-on-board-apollo-11-and-how-our-cell-phones-compare-1578266#:~:text=This%20means%20that%20the%20iPhone,tasks%2C%20such%20as%20the%20display.).
*   **Skilled professionals had a hard time managing so many computers at a time**. We definitely didn’t have the nice management consoles that we have nowadays.
*   **We literally had servers at our feet.** Yup, the servers we managed sat right under our desks.
*   **We had a direct connection between human and machine.** Okay, maybe not direct like [Neo plugging into the Matrix](https://youtu.be/DGhhOzzlS7w?si=AcIQwF0Geu56gnzZ), but sysadmins were definitely fine-tuned to a server’s moods.

But, as we said, managing a fleet of servers was not something that a single human or even a small group of humans could easily do at that time.

Add to that the fact that technology doesn’t seem to like to stand still. The internet became a thing. And as the internet became more popular, we ended up with online stores, social media, and online games. Which meant that we needed more computing power. This meant that the way in which we architected our systems also changed. We ditched our monoliths in favour of micro-services. Which meant…more complexity!

What was a sysadmin to do?!

Lucky for us, the Cloud came to our rescue!

All of a sudden:

*   We found ourselves with tons of computing power at our fingertips!
*   Everyone could have _tons_ of servers!
*   We were able spin up servers in _minutes_!

With the advent of more complex technology and infrastructure, we needed a way to manage it all. And so, we were blessed with the lovely gifts of DevOps, SRE, and Platform Engineering to help us out.

### In the Now-ish Times

![A cat working at a modern workstation surrounded by multiple screens, a tablet computer, and holding a smartphone. The desk should have a mug. The cat is also wearing a hoodie, sunglasses, and big headphones. Digital art, oil pastel, galaxy vibe](https://cdn-images-1.medium.com/max/800/0*GnYAsFzveH74Yk5w)

[Generated with Bing AI](https://copilot.microsoft.com/images/create/a-cat-working-at-a-modern-workstation-surrounded-b/1-66425ab18cb44a768a2c39970a76f03a?id=rSs6lPegOuJZTdTe1fgcRg%3d%3d&view=detailv2&idpp=genimg&idpclose=1&thId=OIG2.e5C3BHJGS.zQ6AOiIhJu&lng=en-US&ineditshare=1)

While there are many different interpretations and definitions of of DevOps, Site Reliability Engineering (SRE), and Platform Engineering, we see these as an evolution in how we think about and deliver software, with everything rooted in DevOps. And with that in mind, let’s do a bit of level-setting and define these terms.

**_DevOps_** gives us the fundamental principles of collaboration, Codify All The Things™, Automate All The Things™, and rapid feedback loops.

**_Site Reliability Engineering (SRE)_** applies DevOps principles, with a focus on customer impact and reliability.

**_Platform Engineering_** is an extension of SRE. While SRE focuses on external customers, platform engineering takes things a step further and also focuses on _internal_ customers — that is, developers.

It’s only natural then, that if Platform Engineering is the next step in the evolution of DevOps, we would expect _something_ to come _after_ Platform Engineering.

But what would that “next thing” be?

### The Future Times

![A chonky cat dressed as an astronaut floating in space next to a UFO and Saturn. The cat will be doing work on a tablet computer. Oil pastel, digital art, and galaxy vibe](https://cdn-images-1.medium.com/max/800/0*1pyApZ-ynVeh6Ktm.png)

[Generated with Bing AI](https://copilot.microsoft.com/images/create/a-fat-cat-dressed-as-an-astronaut-floating-in-spac/1-66427cfabecf4173a032b63d36d5fe7a?id=RoQitb8kxJm9Ag4q2q3kWg%3D%3D&view=detailv2&idpp=genimg&idpclose=1&thId=OIG2..wCNrfSrn9CLtq.5zoVj&lng=en-US&ineditshare=1)

#### Looking to the past for inspiration

In order to answer that question, **we can turn to the past for some inspiration**!

First off, **we** **can** **turn to DevOps itself, for inspiration**. After all, we know that whatever follows Platform Engineering should be anchored in the principles of DevOps, since it’s derived from SRE, which itself is the root of Platform Engineering. This includes all the DevOps-y goodies like fast feedback loops, collaboration, automation, and codifying all the things.

In addition, **we can turn to some vendors for inspiration**. For example, [HashiCorp](https://hashicorp.com/) has a product called [The Infrastructure Cloud](https://www.hashicorp.com/blog/introducing-the-infrastructure-cloud). According to HashiCorp:

> “The Infrastructure Cloud isn’t a new product. Instead, it’s a new way for the HashiCorp products to deliver value more quickly via the HashiCorp Cloud Platform (HCP), a unified SaaS platform for infrastructure and security lifecycle management.”

So basically it’s essentially a repackaging of existing components to provide a unified SaaS experience for infrastructure management and security.

**We can also look at on-premise (data centers) virtualization**. Being on-premise gives us that added security from managing our own infrastructure. It also gives us back that human-machine connection from The Good Old Days™, while leveraging the power of virtual servers. It’s where it all began, and it’s not going away quite so easily.

#### Looking to the future for inspiration

**We can turn to the future for inspiration**. While we don’t know what the future holds, we have a pretty good idea of where things are headed.

First off, **we don’t have to be bound by just cloud or just on-premise**. **(**What? Didn’t we just talk about this? 😜**)** In the past, we were forced to be on-premise, then we felt that the Cloud was our only option. Now we have reached a point where we have choices, and we can choose the options that best suit our needs, with combinations on-premise and Cloud to make a solution that best suits our organization’s needs.

Secondly, we know that [Observability](https://learning.oreilly.com/videos/fundamentals-of-observability/0636920926597/) will be a big part of this as-yet-unnamed Platform Engineering Successor. Technology is only getting more and more complex, and having insight into your pipelines, infrastructure, and software results in better reliability overall.

And finally, there’s our good old friend, AI. Ah…AI…that thing we love to hate and hate to love. We simply can’t ignore the fact that AI will have some sort of influence on things. And while we don’t see AI as taking over our Platform Engineering Successor, we do see AI having a huge role in being an assistive technology. AI is great at parsing through tons of data and identifying trends, so why not use it nudge human operators in the right direction? Ultimately, however, it’s still up to the human operator to decide what to do with that information.

#### What’ll it be?

With all that in mind, then, our new Platform Engineering successor should basically be: **more of the same, but with a little extra**!

That is we want to continue seeing more of…

*   **Basic DevOps principles**: Codifying All The Things, continuous collaboration, continuous testing
*   **Security, especially around** [**policy-as-code**](https://thenewstack.io/our-2023-site-reliability-engineering-wish-list/). That way, we can ensure that we keep the security folks happy, while not having to deal with annoying security-related bottlenecks
*   **Continued fast feedback loops** by [baking Observability into our pipelines](https://thenewstack.io/how-to-observe-your-ci-cd-pipelines-with-opentelemetry/) _and_ our [SDLC](https://adri-v.medium.com/observability-mythbusters-observability-is-not-only-for-sres-1161644b206b)
*   **Better integration.** Sure, things typically play nice with each other, to a certain extent, but we have to stitch things together. Wouldn’t it be nice if we could use pre-packaged “cookbooks” to deal with common patterns/use cases/automations?
*   **AI as a companion or co-pilot**.

But don’t just take our word for it. Check out the following shorts featuring [Kelsey Hightower](https://twitter.com/kelseyhightower) and [Charity Majors](https://twitter.com/mipsytipsy) on [Geeking Out Podcast](https://youtube.com/@geekingout_pod):

[**Kelsey Hightower wants to get rid of #kubernetes?? Whaaaa?!**  
_Edit description_youtube.com](https://youtube.com/shorts/1yFeu6BKXAs?feature=share "https://youtube.com/shorts/1yFeu6BKXAs?feature=share")[](https://youtube.com/shorts/1yFeu6BKXAs?feature=share)

[**Charity Majors talks about #Observability 2.0**  
_Edit description_youtube.com](https://youtube.com/shorts/flRpM9vWCD8?feature=share "https://youtube.com/shorts/flRpM9vWCD8?feature=share")[](https://youtube.com/shorts/flRpM9vWCD8?feature=share)

### What shall we name our creation?

![Four fat cats wearing dresses, voting. Each cat is holding a piece of paper with a checkmark and there’s a ballot box in the middle. Oil pastel digital art, galaxy vibe with a pink and blue theme](https://cdn-images-1.medium.com/max/800/0*bVaGhbkk4lUEqO_r.png)

[Generated with Bing AI](https://copilot.microsoft.com/images/create/four-fat-cats-wearing-dresses2c-voting-each-cat-is/1-664287c78d8649d88e4475eec3c53cba?id=pvoAoUZnmonTnwb4cWdTBw%3d%3d&view=detailv2&idpp=genimg&idpclose=1&thId=OIG3.4yCHjhwTbdV7vtYpDLDL&lng=en-US&ineditshare=1)

So now that we know what we want our new Platform Engineering Successor to look like, it needs a name.

Some of the options we came up with were a combination of really cringe suggestions from ChatGPT, our own ideas, and ideas from the community:

*   **DeltaOps:** In the spirit of embracing change, delta seems pretty fitting.
*   **NextOps:** The next thing to come after Platform Engineering, so why not _literally_ the _next_ thing?
*   **Synergeneering:** Thanks, ChatGPT
*   **FuturEngineering:** Thanks again, ChatGPT
*   **Cloud Gardener:** This was a [community suggestion from a poll that Adriana ran on LinkedIn](https://www.linkedin.com/feed/update/urn:li:ugcPost:7195884589897162753?commentUrn=urn%3Ali%3Acomment%3A%28ugcPost%3A7195884589897162753%2C7195897836868096001%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287195897836868096001%2Curn%3Ali%3AugcPost%3A7195884589897162753%29), and definitely a personal favourite of ours

Synergeneering and FuturEngineering definitely sound like something a consulting company would want to sell to its clients. Just you wait. Give it a year. We both used to work in consulting, so this would not be outside the realm of possible. 😜

When we ran the poll at our [DevOps Days Montreal](https://devopsdays.org/events/2024-montreal/welcome/) talk on May 28th, 2024, the people voted for…

![Forms response chart. Question title: What should the “next thing” beyond Platform Engineering be called?. Number of responses: 160 responses.](https://cdn-images-1.medium.com/max/800/0*hzOj5isMUWKduEQr.png)

Results in pie chart format for “What should the ‘next thing’ beyond Platform Engineering be called?”

Yup, **Cloud Gardener**! So maybe we’ll see you at **_Cloud Garderner Con_** in 2025?

### Wrap-up Times

Before we wrap things up, we want to make one thing super clear. Our goal is not to force a new term on anyone. Instead, we want to acknowledge the fact that technology is changing, and that this Platform Engineering Successor is happening whether we like it or not.

All we’re doing is collecting and sharing information from what is already happening. From what _you_ are already doing. Technology is fast, dynamic, and we are constantly iterating on it, and we need to embrace the change in order to keep up.

And as we learned from Battlestar Galactica: This has all happened before. This will all happen again.

![This has all happened before. This will all happen again.](https://cdn-images-1.medium.com/max/800/0*JiyuVyE21TZZgXXM.png)

Source: [Google images](https://images.app.goo.gl/Q1gjoqAZU7XHGvhy9)

Until next time, peace, love, and code. ✌️💜👩‍💻

_Originally published at_ [_https://geekingoutpodcast.substack.com_](https://open.substack.com/pub/geekingoutpodcast/p/beyond-platform-engineering)_._

By [Adriana Villela](https://medium.com/@adri-v) on [May 31, 2024](https://medium.com/p/78fd026a0253).

[Canonical link](https://medium.com/@adri-v/beyond-platform-engineering-78fd026a0253)

Exported from [Medium](https://medium.com) on June 3, 2026.