---
title: Prompt-based reusable workflows for lazy developers
slug: prompt-based-reusable-workflows-for-lazy-developers
description: 'A solution LOOKING for a problem, or a solution FOR a problem?'
tags:
  - technical
  - ai
  - mcp
  - '2025'
  - goose
added: 2025-12-22T00:00:00.000Z
---

![Abstract night scene with colorful light streaks — white, yellow, red, and blue — suggesting motion and energy in an urban setting.](/images/postshttps://cdn-images-1.medium.com/max/800/1*Q6xNM9zTi_Gqq9a0BvRuXw.jpeg)

A happy accident! Photo by [Adriana Villela](https://bento.me/adrianamvillela).

Software development has evolved since I started my career as a developer. I was a Java developer for 16 years, and I can tell you that the knowledge required to be a developer in the early 2000s is VASTLY different from what it is now. Developers are expected to have a base knowledge of things like containers, CI/CD, Kubernetes, security, and Git, just to write code. And that’s just scratching the surface.

And if we don’t work with something on a daily basis, our brains aren’t likely to readily remember how to do them. I don’t know about you, but I always need to look how to do certain things in bash — I NEVER remember how to write IF statements. Don’t even get me started on regex. I know enough Git to be dangerous, but I always have to look up how to reset head when I mess up royally. When I don’t touch Kubernetes for a while, I forget most of the commands. I’ve gotten around this in the past by creating a mega-note with all of my most frequently-used commands for various things. I would often port that around from job to job. A couple of years ago, I got smart and moved everything to a private GitHub repo.

![Screenshot of a README titled ‘Adriana’s Notes’ with command-line instructions for Base64 encoding/decoding and Docker image management, including cleanup commands and references to GitHub scripts.](/images/postshttps://cdn-images-1.medium.com/max/800/1*E7foIX8pf0ox3VgkUQM2oQ.png)

A snippet of my private GitHub repo with my frequently used and often forgotten commands.

And now, in the age of LLMs, I can be extra-lazy and ask my favourite AI assistant to tell me these things. But what if I could take things a step further?

As a developer these days, you might need to stand up a local Kubernetes (k8s) cluster to test out your code locally. My go-to local k8s flavour is [KinD](https://kind.sigs.k8s.io). But I can never remember the command to create a cluster. Or what [Helm](https://helm.sh) command to use to install an operator. What if I could create a prompt-based reusable workflow using natural language, so I can say things like, “Install X”, or “Deploy Y”, and the LLM would know *exactly* how to do these things? Can it be done??

### MCP to the rescue?

This is where we can leverage vibe coding and MCP servers. As a quick refresher, [Model Context Protocol (MCP)](https://medium.com/womenintechnology/lets-learn-about-mcp-together-be1601dc7a81), allows an MCP client (i.e. an AI assistant powered by an underlying LLM like [Claude Sonnet](https://www.anthropic.com/claude/sonnet) or [GPT-5](https://en.wikipedia.org/wiki/GPT-5)) to accesses a service by communicating with an MCP server via a standard protocol — that is, MCP. The MCP server acts like an interpreter, serving as a conduit for the LLM to interact with that service. Each service that would interact with an LLM has its own MCP server.

> 💡 [Check out my article on MCP servers](https://medium.com/womenintechnology/lets-learn-about-mcp-together-be1601dc7a81) if your looking for a deeper dive.

![Diagram of an AI assistant architecture showing four components: MCP Client and LLM (pink boxes with Claude 3.5 Sonnet, LLaMA 4, GPT-4 logos), MCP Server (blue box), and Service (green box), with arrows indicating communication flow between them.](/images/postshttps://cdn-images-1.medium.com/max/800/1*pdKigYFUbNG2Lxd5uggqmg.jpeg)

High level MCP server overview

Great. So by connecting our LLM-powered AI assistants to the right MCP servers, we can create the prompts that we need to do The Thing, and then get it done. Cool. So what tools do we use?

I mean, look…you can use [GitHub Copilot (with VSCode)](https://github.com/features/copilot) to get the job done. Or [Claude Code](https://code.claude.com/docs/en/overview). Or any myriad tools that seem to be cropping up that do similar things. I chose to do this using [Block’s Codename Goose](https://block.xyz/inside/block-open-source-introduces-codename-goose).

### \*Honk, honk!\* it’s Goose! 🪿

What is Goose? [Block’s Angie Jones puts it nicely](https://systemsdigest.com/videos/what-codename-goose-angie-jones-explains): Goose is “a fully customizable, open-source client that connects to 4,000+ MCP servers and works with any large language model (LLM).”

It basically an abstraction layer that sits on top of my AI Assistant/LLM combo, like this:

![Architecture diagram of an AI assistant system with five components — Goose, MCP Client, LLM, MCP Server, and Service — connected by red lines showing communication flow. MCP Client is central, linking to all others, with LLM featuring Claude 3.5 Sonnet, LLaMA 4, and GPT-4 logos.](/images/postshttps://cdn-images-1.medium.com/max/800/1*3FUO_0uINGXZEHZ7CopHCA.jpeg)

MCP servers with Goose!

And why Goose? [Because Angie Jones kinda sold me on it with this post on Bluesky](https://bsky.app/profile/angiejones.tech/post/3lshqasecgs2t):

![Screenshot of a Bluesky thread by Angie Jones (@angiejones.tech) posted on June 25, 2023, at 7:05 PM. The thread lists five quick, practical ways she used her AI agent, Goose, to assist with work tasks — each taking under a minute. Examples include generating GitHub productivity reports, summarizing a 169-reply Slack thread into action items, identifying roadmap themes from team discussions, clarifying a technical concept for a colleague, and summarizing a long Google Drive document.](/images/postshttps://cdn-images-1.medium.com/max/800/1*yLo0677nOXfLl2SW9F-aaw.png)

Skeet by Angie Jones, talking about all the cool things that she used Goose for. Post link [here](https://bsky.app/profile/angiejones.tech/post/3lshqasecgs2t).

It looked like a cool tool, and with my prompt-based workflow idea, I had a little use case to try out. So what makes Goose different from other similar tools?

1. [It’s open source](https://github.com/block/goose).
2. It runs locally ([check out my post on boostrapping Goose in a dev container](https://medium.com/womenintechnology/running-codename-goose-in-a-dev-container-191950864090))
3. You can plug in your favourite AI assistant and LLM, which means that you can swap these out at any time!
4. It has reusable and shareable workflows called [recipes](https://block.github.io/goose/docs/guides/recipes/). You can even create sub-workflows called [sub-recipes](https://block.github.io/goose/docs/guides/recipes/subrecipes/). PLUS, you can pass parameters to these recipes and sub-recipes.
5. It integrates with MCP severs. In Goose speak, they’re referred to as [extensions](https://block.github.io/goose/extensions/). Goose even has its own [built-in extensions](https://block.github.io/goose/docs/getting-started/using-extensions/#built-in-extensions), like the [Developer Extension](https://block.github.io/goose/docs/mcp/developer-mcp), which allows Goose to run command-line tools, edit files, etc.

### The plan

With that in mind, I set out to create my prompt-based reusable workflow with Goose. I like to find fun ways to intersect technologies that I’m interested/work with, so I decided that I wanted use Goose to spin up a local k8s cluster, and deploy the OpenTelemetry Demo App. Here are my high level steps:

1. Spin up a local Kubernetes cluster using [KinD](https://kind.sigs.k8s.io)
2. Install and configure [ArgoCD](https://argo-cd.readthedocs.io/en/stable/) on the KinD cluster
3. Deploy the [OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) (managed by ArgoCD) to the KinD cluster, sending telemetry data to Dynatrace, using the [ArgoCD MCP server](https://github.com/argoproj-labs/mcp-for-argocd). The [OTel Collector](https://adri-v.medium.com/otel-collector-anti-patterns-43dca4a857a0) would be managed by the [OTel Operator](https://itnext.io/when-things-go-sideways-troubleshooting-the-opentelemetry-operator-3dee4d11db65), which also requires cert-manager to be installed.
4. Query the data in Dynatrace using natural language via the [Dynatrace MCP server](https://github.com/dynatrace-oss/dynatrace-mcp).

I also wanted to [run Goose in a dev container](https://medium.com/womenintechnology/running-codename-goose-in-a-dev-container-191950864090), to limit the blast radius. Basically, if things went bad, at its worst, it would mess up my Dev Container, and not my entire system. Also, [I love dev containers](https://adri-v.medium.com/list/dev-containers-78d35408c59f). 😁

![Humorous deployment pipeline diagram featuring a goose with a human face initiating ArgoCD-based deployments in a Kubernetes cluster. ArgoCD manages cert-manager, OTel Operator, and OTel Demo, which sends telemetry to Dynatrace.](/images/postshttps://cdn-images-1.medium.com/max/800/1*O7GgYRxWD1cfaUkcNTGHfg.jpeg)

The Goose dream!

### Mission accomplished…kind of!

At the end of the day, I achieved my goal. You can check out my repository with the Goose recipes for my prompt-based workflow [here](https://github.com/avillela/ai-sre-workflow-demo). (Expect a separate Goose tutorial post in the near future.)

That being said, it wasn’t all sunshine and rainbows. The road to achieve my goal was hard, and I learned some unexpected lessons.

#### Lesson 1: Writing prompts is HARD

Prompt-writing for this project brought me to tears. No joke. I spent more time refining the prompts than I would’ve if I’d just written everything as code.

I wrote what I thought were “great” prompts that had been super repeatable for 9 executions, only to have my LLM decide on the 10th execution to ignore everthing and do its own thing. It was infuriating, and made me feel like this:

![Scene from Star Trek: The Next Generation showing Captain Picard shouting with bold white text: ‘THERE ARE FOUR LIGHTS!!!’](/images/postshttps://cdn-images-1.medium.com/max/800/1*lYxOXFuuGxPQ14Hjl2yBvg.jpeg)

This is what it feels like when an LLM doesn’t do your bidding. Image source [here](https://satyadoylebyock.substack.com/p/there-are-four-lights-reality-in-authoritarian).

I came to the conclusion that there was something fundamentally wrong with my prompts. After doing some research, here’s what I found:

1. **Context is queen.** Add details, including the LLM’s role in executin the prompt, objective, and expected output (including output format). Include code snippets and links to documentation.
2. **Markdown is magic.** Humans are great at reading markdown. Turns out that LLMs are too. Be precise and concise.
3. **Temperature sets the tone.** Goose supports temperature, a value between 0 and 1 that represents creative control. Zero means that the LLM should follow everything precisely, and 1 gives the LLM more creative control. I like going with a value of 0.5. You can also technically go above 1, but I imagine that the results would be very unpredictable.
4. **Instructions factor out common elements.** Think of instruction as global, bootstrapping prompts. They get read before prompts. If there’s something you keep repeating over and over in your prompts, put them in an instructions file. Rules for prompts also apply to instructions. Goose has a special instructions file called `[.goosehints](https://block.github.io/goose/docs/guides/using-goosehints/)`.

For a more detailed look on good prompt writing, check out [my post on how to improve your prompts](https://medium.com/womenintechnology/i-fought-the-prompt-and-i-mostly-won-1c58c30e594e).

#### Lesson 2: LLMs are on a spectrum 🌈

Not all LLMs are created equal. Some are better than others. They’re a product of their input data and biases.

In my experience, I found that Claude Sonnet > Grok > GPT-4o. As much as I like Claude, it doesn’t come cheap. I have a plan for GitHub Copilot, and I blew through my Claude tokens within 2 days. I had to wait until the end of the month for them to reset. GPT-4o isn’t so great, but I didn’t run out of tokens with Copilot. 🤷‍♀️

But don’t take my word for it. I suggest playing around with different LLMs to see which one works best for you.

#### Lesson 3: Know your MCP

MCP servers are basically an API to a service, consumed by AI assistants. As with all APIs, you should use only the ones that you trust. When selecting what MCP server(s) to use, make sure that:

* **They do what you expect them to do.** For example, I wanted to use the ArgoCD MCP server to fully manage my application deployments and configuration. That is, create projects, register repositories, deploy and sync applications. Unfortunately, I wasn’t able to use it because it didn’t have the features that I wanted. The features that it did have didn’t work well at the time. I haven’t used the ArgoCD MCP server recently, so things may have improved by the time you read this.
* **You trust them.** MCP servers can do damage if you’re not careful. Make sure that if you’re passing them credentials, you trust the MCP server’s author. I usually check [this MCP server registry](https://github.com/modelcontextprotocol/servers?tab=readme-ov-file#-third-party-servers) for trustworthy servers. If they’re not on the registry, another way to vet them is by checking the number of stars and forks on GitHub.
* **They’re vetted by InfoSec.** Is the MCP server you want to use even approved for use in your organization? It not, it’s a moot point.

### So, are prompt-based workflows viable?

After working through all of these challenges, the million-dollar question is…***are prompt-based workflows viable***? And most importantly, ***is this a solution looking for a problem?*** That is, am I solving a problem that doesn’t *need* to be solved?

I’m not gonna lie. I was looking for a fun little use case to use with Goose. Was it a problem that was BEGGING to be solved? Nah. But it was a fun little exercise that taught me a lot about LLMs, writing prompts, and what’s useful and what’s not.

At the end of the day, **LLMs are non-deterministic**, meaning that you’re not guaranteed to get the same results each time you run the prompt. So if you want truly repeatable results, your best bet is to create prompts to generate scripts. Scripts are reusable and reliable, because they’re code. There’s no room for interpretation. But because they’re code, they may also be buggy.

So my conclusion is that the scenario that I concocted for my little experiment isn’t an ideal use case.

BUT, maybe it doesn’t have to be perfect? Perhaps we can be satisfied with “good enough”? Because I still stand by my statement from earlier that it would be nice to say, “Do the thing” and my LLM would know exactly what to do. But as a developer, I don’t want to spend a ton of time refining my prompts, either.

So I pose you this question: **What if platform engineers could create instruction files with embeded code snippets, hints, and links to relevant documentation, and share them in the same way that you’d make an API or library available to developers?** So basically you’d have a stubbed out repository provided by a platform engineering team, with some pre-written instruction files. That way, if a developer writes a prompt like, “Create a local Kubernetes cluster”, the instructions would contain all the details for:

* Installing KinD on your local machine, if it doesn’t already exist, including what version should be installed
* Creating a local KinD cluster
* Installing the `kubectl` and `helm` CLIs

We could even take it a step further. **What if repository maintainers included instructions files in their repository docs, so that *any* prompts that consume the tooling/docs/etc from that repository had guidance on how to use it?** How cool would that be? Credit to my teammate, [Adam Gardner](https://www.linkedin.com/in/agardner1/), for coming up with that neat use case.

### Final Thoughts

I want to make it super clear that the intention of this post was not to crap on LLMs or Goose. Goose has some great use cases, as per Angie Jones’ Bluesky post from earlier. All of this technology is really, really cool.

And as frustrating as this little exercise was for me, it was extremely educational. But one thing is certain…

Skynet is coming for us.

![Realistic depiction of the Terminator endoskeleton with a metallic skull, glowing red eyes, and exposed mechanical components against a dark background.](/images/postshttps://cdn-images-1.medium.com/max/800/0*jraIqDLRxGpd_u7C.jpg)

Terminator. Image link [here](https://www.google.com/url?sa=t\&source=web\&rct=j\&url=https%3A%2F%2Fwww.looper.com%2F1358463%2Fterminator-genisys-ending-explained-arnold-schwarzenegger%2F\&ved=0CBUQjRxqFwoTCPCCxYqzw5EDFQAAAAAdAAAAABAI\&opi=89978449).

Just kidding!

> At the end of the day, early adopters push things forward. People who are getting frustrated and are failing are the ones who push the boundaries.

Sure, we get mad at our tools for not doing what we want them/expect them to do. We complain. We push forward. We come up with weird use cases to test our tools to their limits, and we share how we’re using those tools with others. And then others take our ideas and build on them or improve on them. That’s how we evolve. Ain’t tech grand?

And now, please enjoy this photo of Barbie, making herself at home in my daughter’s sweater sleeve. 💜

![Light-colored rat peeking out from the sleeve of a white knitted sweater worn by a person with dark red nail polish, resting their hand on a wooden surface.](/images/postshttps://cdn-images-1.medium.com/max/800/1*NSpzVXskkI8Omr930BQzEQ.jpeg)

Barbie is feeling very much at home. Photo by [Adriana Villela](https://bento.me/adrianamvillela).

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [December 22, 2025](https://medium.com/p/5d9650e5aee2).

[Canonical link](https://medium.com/@adri-v/prompt-based-reusable-workflows-for-developers-who-dont-wanna-have-to-remember-5d9650e5aee2)

Exported from [Medium](https://medium.com) on June 3, 2026.