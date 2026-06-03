---
title: "KubeCon North America 2022 Retrospective"
slug: kubecon-north-america-2022-retrospective
description: "Thoughts on KubeCon NA from a KubeCon newbie and a KubeCon veteran."
added: "Nov 09, 2022"
tags:
  - technical
  - conferences
  - kubecon
---

# KubeCon North America 2022 Retrospective

![Sculpture in front of Detroit skyline.](https://cdn-images-1.medium.com/max/800/1*6IhnmqVLIfmvawYKFefJ0w.png)

Detroit. Photo by [Adri Villela](https://adri-v.medium.com).

**_with_** [**_Ana Margarita Medina_**](https://www.linkedin.com/in/anammedina/)

Hello fellow Kubernetes nerds! 🤓 KubeCon North America is now behind us, so it’s time for a conference retrospective! Now, y’all must be thinking, “Awww, not another one! Noooo…” Ah, but ’tis not just any KubeCon wrap-up, because both [Ana](https://lightstep.com/blog/authors/ana-margarita-medina) and I will be sharing our perspectives, and we’re awesome and y’all love us. Amirite? Course I am. Without further ado…

### Adriana’s Point-of-View

If there is any conference that is on My Conference Bucket List™, it is most definitely KubeCon. I have a love-hate relationship with [Kubernetes](https://kubernetes.io) (don’t we all, though?), and [have spent hours trying to understand its wiley ways](https://adri-v.medium.com/list/kubernetes-090db256e52b), and cursing at my terminal at yet another [CrashLoopBackOff](https://stackoverflow.com/questions/41604499/my-kubernetes-pods-keep-crashing-with-crashloopbackoff-but-i-cant-find-any-lo). So to go to KubeCon and nerd out on Kubernetes just sounded awesome to me.

I finally got my chance by attending [KubeCon North America 2022](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america), which took place in Detroit, MI.

![Collage of sites of downtown Detroit. Photo by Adri Villela.](https://cdn-images-1.medium.com/max/800/0*PlEeX2repfHUpR5g)

Collage of sites of downtown Detroit. Photo by [Adri Villela](https://adri-v.medium.com).

I was super excited to attend the conference for a few reasons.

1.  It would be the first time I’d be getting to meet my Lightstep DevRel team, and find out if I was the shortest of the bunch. Spoiler alert: Ana and I are the shortest at around 5'3 (161cm for my Metric peeps). Latina genes. I roll with it.
2.  It was my conference début as a DevRel. Y’all, this is my first DevRel role, if you can believe it — 6 months in and lovin’ it!
3.  Last time I attended a conference was [DevOps Days Toronto, in 2018](https://devopsdays.org/events/2018-toronto/welcome). The highlight of that was getting [Dr. Nicole Forsgren](https://nicolefv.com) and [Jez Humble](https://research.google/people/106958) (both of [DORA](https://www.devops-research.com/research.html) fame) to sign a hard copy of their book, [Accelerate](https://www.amazon.ca/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339/ref=asc_df_1942788339/?tag=googleshopc0c-20&linkCode=df0&hvadid=293004119900&hvpos=&hvnetw=g&hvrand=13450460705037761726&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9000918&hvtargid=pla-446149606248&psc=1), so not too shabby. PS: Get the book. Bonus: if you get the audiobook, it’s read by Nicole.

So, enough rambling. Here’s my KubeCon recap, newbie edition!

As a COVID-cautious gal, I was pleased to see that the [CNCF](https://www.cncf.io) had various COVID precautions in place including vaccine requirement or a negative COVID test to pick your badge and masking was required and enforced. various COVID precautions in place. For starters, you needed proof of vaccination or proof of a negative COVID test in order to pick your badge. Inside the venue, masking was required and enforced. I always mask indoors (no exceptions), so I definitely felt more at ease among the droves of humans, knowing that we had those protections in place. The other thing that I very much appreciated is that the CNCF provided freebie [rapid COVID tests](https://www.globalpointofcare.abbott/en/product-details/navica-binaxnow-covid-19-us.html) proctored through [eMed](https://www.emed.com), so I was able to test daily while I was there, for extra peace of mind.

Although KubeCon itself didn’t start until Wednesday, October 26th, I flew in on Sunday night so that I could catch [Open Observability Day](https://events.linuxfoundation.org/open-observability-day-north-america/program/schedule) on Monday, and [OTel Unplugged](https://www.eventbrite.com/e/otel-unplugged-kubeconcloudnativecon-detroit-2022-tickets-427595037267) on Tuesday.

#### Day 1: Open Observability Day

I popped in and out of [Open Observability Day](https://events.linuxfoundation.org/open-observability-day-north-america/program/schedule), and of the talks that I caught, there were two talks that I really enjoyed. One was [OTel Me How to Build a Data Pipeline for Observability, by Daniel Kim and Reese Lee](https://www.youtube.com/watch?v=p0oHZl3M51A&list=PLj6h78yzYM2MXp3asRZmwDIBPXfJIJn4F&index=8). Even though I was already familiar with the content, I really appreciated Daniel and Reese’s super energetic presentation style. It was definitely a welcome pick-me-up to help fight post-lunch food coma. The other talk I really enjoyed was [What Can eBPF Actually do for Modern-Day Observability? by Ori Shussman](https://www.youtube.com/watch?v=ieDvAiWxlt0&list=PLj6h78yzYM2MXp3asRZmwDIBPXfJIJn4F&index=9). In it, he talks about how [eBPF](https://www.tigera.io/learn/guides/ebpf) lets us see data that is otherwise not visible. For example, eBPF is useful for providing greater insight into [gRPC](https://grpc.io) calls, which are notoriously difficult to observe. 🤯I also wanted to give a special shout-out to [Opening the Door to Observability, by Libby Meren](https://www.youtube.com/watch?v=1v8aL9Jxce8&list=PLj6h78yzYM2MXp3asRZmwDIBPXfJIJn4F&index=13). Although I missed this talk, this topic is very near and dear to my heart, because in my previous role, I had to spend a chunk of time trying to get buy-in on doing Observability The Right Way ™.

Interested in checking out the other talks? Y’all can check out videos for them [here](https://www.youtube.com/watch?v=Q5Vf8bpTDlI&list=PLj6h78yzYM2MXp3asRZmwDIBPXfJIJn4F).

![Photo of the room at Open Observability day.](https://cdn-images-1.medium.com/max/800/0*IMItmYOEqAxNiAv-)

Presentations at Open Observability Day. Photo by [Adri Villela](https://adri-v.medium.com).

Later that afternoon, I got to meet my Lightstep DevRel fam in real life, and it was AWESOME! Unfortunately, we never took a group selfie. 😿

#### Day 2: OTel Unplugged

I spent Day 2 at the [Colony Club](https://www.weddingwire.com/biz/colony-club-detroit-detroit/68e394fe233e346c.html) to attend [OTel Unplugged](https://www.eventbrite.com/e/otel-unplugged-kubeconcloudnativecon-detroit-2022-tickets-427595037267). This event was sponsored by [Lightstep](https://lightstep.com), [Honeycomb](https://honeycomb.io), [New Relic](https://newrelic.com), [Splunk](https://www.splunk.com), [Dynatrace](https://www.dynatrace.com), [Crowdstrike](https://www.crowdstrike.com), and [NGINX](https://www.nginx.com). I came into the event not knowing what to expect. I can sometimes clamp up when I’m around folks that I don’t know, but because I was helping with the event check-in, I got to say hello to a number of the attendees, which helped break the ice. And it turns out that there were a lot of names that I recognized from my work in the OTel community, and it was nice to connect in person with folks whom I’d only previously met through Slack or Zoom.

![Photo collage of OTel Unplugged. Photo by Adri Villela.](https://cdn-images-1.medium.com/max/800/0*FXb35FQfAKjqqIE6)

Photo collage of OTel Unplugged. Photo by [Adri Villela](https://adri-v.medium.com).

PS: Big shout-out to the venue, which was gorgeous, and the staff were super friendly.

#### Day 3: KubeCon!

Finally, the main event! I’d been to the conference center on Monday to pick up my badge, but the volume of people that day didn’t even compare to how busy things got on Wednesday. It was a whirlwind of a day, and I spent some of my time at the Lightstep booth. The Lightstep crew did demos of the [OTel Demo App](https://github.com/open-telemetry/opentelemetry-demo) to illustrate [Observability-Landscape-as-Code in action](https://lightstep.com/blog/observability-as-code-with-kubernetes-and-lightstep), which [Ana](https://twitter.com/Ana_M_Medina) and I poured our blood, terror, terror, sweat, and (happy?) tears into it before KubeCon. It’s a great little demo, if I do say so myself, and I definitely recommend that you check it out. (Shameless plug, I know. Sorrynotsorry.)

![Photo collage of Lightstep booth at KubeCon](https://cdn-images-1.medium.com/max/800/0*JcT3icD63IAgvnPn)

Photo collage of Lightstep booth at KubeCon.

The life-sized game of [Jenga](https://en.wikipedia.org/wiki/Jenga) at our booth was a huge draw, and there were a lot of adventurous folks who tried their hand at it. The pic of Ana and me below shows how tall the tower got. What you don’t see is that, shortly after the pic was taken, one of us knocked the tower down. Oops. 😳

Our team also had KubeCon-Detroit-themed stickers made especially for this event. Ana took things to the next level and did her nails to match our stickers. And I don’t know if you can see it in any of the photos below, but she also wore Kubernetes-themed earrings too. She’s very extra, and I love it! The stickers were part of a scavenger hunt that revealed the location of a pizza party hosted by Lightstep on Thursday night.

Ana and I also spent some time roaming the exhibitors’ area, grabbing some sweet swag (I nabbed a sweet OTel t-shirt and the cutest little [Tracetest](https://tracetest.io) plushie, whom I named Tracey), meeting new and interesting people, and meeting some familiar faces in real life. (Hi [Abby](https://twitter.com/a_bangser)!!) Ah, the life of a DevRel. So. Much. Fun. 💜💜💜

![Photo collage at KubeCon](https://cdn-images-1.medium.com/max/800/0*WTWt36Gm_Rw5MKDX)

Photo collage at KubeCon

Unfortunately, I wasn’t able to stay for the full conference, but from what I did experience, it was lots of fun. This most definitely will not be my last KubeCon, and I most definitely can’t wait for the next KubeCon! Bring it!

![Bring it on meme.](https://cdn-images-1.medium.com/max/800/0*sBspdAL_byPuMrnt)

Image source [here](https://media.self.com/photos/57d8a21b46d0cb351c8c558e/master/pass/bring-it-gabrielle-union.gif).

### Ana’s Point-of-View

Ana here! I wanted to provide my perspective from attending four KubeCons in the past. This is my second KubeCon through COVID, and I appreciate that the CNCF has enforced COVID protocols for their events. As someone who caught COVID during KubeCon EU València, I was extra careful this time around, and tested daily. I’m still testing and COVID negative, so thanks, CNCF!

On Monday, I was scheduled to go to the Contributor Summit, but I lost my voice the week before on Thursday, and I still hadn’t recovered it by Monday morning.🥲 I had talks and booth duty during the coming week, so instead I did something more easygoing and I just helped my fellow Lightsteppers get ready for KubeCon and did final touches on my slides.

One thing that was really hard this year was that there were too many (or what felt to me like too many) co-located/Day 0 events. It’s great to see the ecosystem continuing to grow, but it definitely makes it very hard to decide which events to go to, for an opportunity to learn from the community. I know I struggled with this, so I do hope that we try to unify topics a bit more next time.

On Tuesday, I split my time between [Chaos Day](https://kccncna2022.sched.com/event/1AOma/chaos-day-hosted-by-harness-additional-in-person-registration-fee-100), [Keptn Community Day](https://community.cncf.io/events/details/cncf-keptn-community-presents-keptn-community-day-kubecon-cloudnativecon-detroit), and of course, the hallway track of the co-located events. From working in the Chaos Engineering community the last 4+ years, I loved to see the [Cloud Native Chaos Engineering community growth](https://twitter.com/Ana_M_Medina/status/1584958979767402496), I also loved talking to folks about the future of [Keptn](https://keptn.sh), and giving a talk on how to achieve more reliability with this CNCF sandbox project and the other OSS tools.

As Wednesday kicked off, it was great to feel the buzz and excitement of folks so eager to learn and connect. From Day 1’s keynote, I really enjoyed the reminder that companies benefiting from Kubernetes and the CNCF ecosystem should be getting involved, giving back, and mentoring others. There was a lot of love to maintainers and contributors in the ecosystem, and as someone involved in the [Kubernetes Release Team](https://github.com/kubernetes/sig-release) for Kubernetes v1.25 and v1.26, it was a huge honor to see my face up in there with the rest of the team! 💙

![Slide of Kubernetes contributors. Photo by Ana Margarita Medina.](https://cdn-images-1.medium.com/max/800/0*MaP8srcEZt91BLlK)

Kubernetes contributors. Photo by [Ana Margarita Medina](https://www.linkedin.com/in/anammedina/).

I also took some time to walk the show floor, buy some CNCF swag and check out the vendor swag too.

Thursday was another busy day of running around with the community. I also got to record some Cloud Native in Spanish content with some other Latinxs in the space. In addition to that, Lightstep hosted two events, one of which was our secret pizza party. It was fun to take over Detroit’s famous alley, [The Belt](https://www.thebelt.org/about-the-belt), to hang out and talk about SRE. Thanks to everyone who stopped by! #DetroitSRECity 🤘

![](https://cdn-images-1.medium.com/max/800/0*bIwgTPwyaM2Zfb6f)

Photo collage of Lightstep KubeCon pizza event.

One of the other places I spent a lot of time at at KubeCon NA was the CNCF Project Pavillion. I was very happy to see that it was a bit larger than the area we had during KubeCon EU, but I still wish that it was bigger and wasn’t so tucked away in the corner. A number of booths were showcasing their projects with demos through the week, hosted Q&A time, and gave away swag. If you are still trying to understand the Cloud Native Ecosystem, you can look at this [very extensive map](https://landscape.cncf.io) of the landscape and projects under the CNCF, some of which are more advanced than others. Of course I’m biased, but I’m really excited for the work that [Keptn](https://keptn.sh) is doing in helping developers have more control over their application lifecycle. I’m also very excited to see where [Backstage](https://backstage.io) goes and how other CNCF projects can integrate with their service catalog.

On Friday, I got a chance to hang out some more with my community friends and give a talk on the future of Keptn with our friends at [Dynatrace](https://www.dynatrace.com). I am very excited to see where this project goes and what work we continue to do with OpenTelemetry to make it easier to observe our deployments and their reliability.

![Ana and her fellow Keptn crew at KubeCon](https://cdn-images-1.medium.com/max/800/0*AxWcVbGB3pBfHZIC)

Keptn talk at KubeCon. Photo by [Ana Margarita Medina](https://www.linkedin.com/in/anammedina/).

### Final Thoughts

Aaaand…that’s a wrap! KubeCon was a ton of fun for both Ana and me. We loved having the Lightstep DevRel team in person for the first time, we loved connecting with our various CNCF communities, Lightstep customers, and it was great fun to see all the cool tech out there. Whether you’re a KubeCon newbie like me, or KubeCon veteran like Ana, it was great to see the CNCF community continuing to come together, grow, and prosper. We are definitely looking forward to KubeCon EU in 2023!

Now, please enjoy this photo of Adriana’s rat, Phoebe, keeping her company as she does her KubeCon expense report.

![Rat hanging out by laptop. Photo by Adri Villela.](https://cdn-images-1.medium.com/max/800/0*l9JTEaTkc_GsLk7m)

Phoebe the rat hanging out by my laptop while I do KubeCon expenses. Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. 🦄 🌈 💫

Got questions about Observability? Talk to us! Feel free to connect with us through [e-mail](mailto:devrel@lightstep.com), or:

*   Connect with Adriana up on [Twitter](https://twitter.com/adrianamvillela) or [LinkedIn](https://www.linkedin.com/in/adrianavillela)
*   Connect with Ana on [Twitter](https://twitter.com/Ana_M_Medina) or [LinkedIn](https://www.linkedin.com/in/anammedina).

Hope to hear from y’all!

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/kubecon-north-america-2022-a-retrospective)_._

By [Adriana Villela](https://medium.com/@adri-v) on [November 9, 2022](https://medium.com/p/2f08932e8a7f).

[Canonical link](https://medium.com/@adri-v/kubecon-north-america-2022-retrospective-2f08932e8a7f)

Exported from [Medium](https://medium.com) on June 3, 2026.