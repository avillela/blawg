---
title: "Let’s Learn About MCP Together!"
slug: let-s-learn-about-mcp-together
description: "Unpacking Model Context Protocol and why it’s so frickin’ cool!"
added: "Jun 06, 2025"
tags:
  - technical
  - mcp
  - ai
---

# Let’s Learn About MCP Together!

#### Unpacking Model Context Protocol and why it’s so frickin’ cool!

![A garden gnome with a green hat decorated with yellow flowers stands atop a tree stump, surrounded by vibrant greenery. The gnome has a long white beard, black boots, and holds a small watering can in one hand and a flower pot in the other. Sunlight highlights the lush foliage and the intricate details of the gnome’s features.](https://cdn-images-1.medium.com/max/800/1*7tVzcjsgc0V1sxpp_GNzxQ.jpeg)

A garden gnome enjoying the sunny day. Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

Okay, I give in. I’m throwing my hat into the AI ring. [Model context protocol (MCP)](https://modelcontextprotocol.io/introduction) has been the new cool kid on the block, and given all the hype around it, I decided to educate myself about it. I don’t know about you, but when I started reading up on MCP, I was getting really confused. Like, I kind of got what it was doing, but it felt like a lot of magic behind the scenes.

That is, until yesterday.

That’s when I finally [watched some videos](https://www.youtube.com/playlist?list=PL2n5EpcOFZfsMABIwZIzcT3YUK3iYaeNF) that explained things to me in a way that my brain understood. Now, [while I do create videos as part of my day job](https://dt-url.net/dt-loves-otel-yt), watching videos is not my favourite way of learning. I find them too distracting. So if you’re like me, and prefer reading blog posts to learn things, then you, my friend, have come to the right place.

Sit back, relax, and let’s learn about MCP together!

### So what is MCP, anyway?

If you use [ChatGPT](https://openai.com/index/chatgpt/) or [Microsoft Copilot](https://copilot.microsoft.com) or any of the many AI chatbots out there, then you, my friend, have interacted with a large language model (LLM). By design, LLMs are trained to understand human conversation, and to respond in a human-like fashion. It’s like a fancy auto-complete, but smarter, because it has been trained on lots of data and context to produce (mostly) relevant output.

The thing with LLMs is that they can’t talk easily to the outside world (i.e. external services).

LLM developers got around this by creating custom integrations to specific tools. The problem is that these LLM/tool integrations were specific to that LLM and tool. So across LLMs: a Copilot-to-Slack integration would be different from a ChatGPT-to-Slack integration. Within LLMs: a Copilot-to-Slack integration is different from a Copilot-to-LinkedIn integration.

Wouldn’t it be nice if we had an open standard so that all LLMs could speak to services in the same way? And so, MCP was born. MCP was developed by [Anthropic](https://www.anthropic.com/), the company behind [Claude](https://www.anthropic.com/claude), and [was released in late November 2024](https://www.anthropic.com/news/model-context-protocol).

![Diagrams illustrating the difference between a stand-alone LLM, one that communicates with services via tool-specific APIs, and one that communicates with services via MCP.](https://cdn-images-1.medium.com/max/800/1*jR6i5IaSl2yM8ZYV9EhjHQ.png)

**Source:** [Model Context Protocol (MCP), clearly explained (why it matters)](https://youtu.be/7j_NE6Pjv-E?si=Jd6yELlSpFN7iDwU)

With MCP, an LLM (MCP client) accesses a service by communicating with an MCP server via the MCP protocol. The MCP server acts like an interpreter, serving as a conduit for the LLM to interact with that service. Each service that wants to interact with an LLM has its own MCP server.

![Diagram illustrating how an LLM (client) communicates with an MCP server to access a service.](https://cdn-images-1.medium.com/max/800/1*bJ42aBwSPRICqD5XagPBFw.png)

**Source:** [Model Context Protocol (MCP), clearly explained (why it matters)](https://youtu.be/7j_NE6Pjv-E?si=Jd6yELlSpFN7iDwU)

Let’s look at an example. Suppose that you’re a huge Taylor Swift fan and are DYING to get concert tickets for her latest tour. You know that tickets are hard to come by, but you are determined. You opt for an unconventional approach: Reddit. But UGH. You don’t want to spend hours poring through Reddit posts. So you decide to ask ChatGPT to search through [r/TaylorSwift](https://www.reddit.com/r/TaylorSwift/) for anyone looking to sell tickets.

Behind the scenes, ChatGPT (your MCP client) is talking to a Reddit MCP server, which exposes the Reddit APIs to ChatGPT in a way that ChatGPT can understand. Bonus: if you wanted to change your client from ChatGPT to Claude, you could do that too!

> **✨ NOTE:** Check out [this link](https://modelcontextprotocol.io/clients) for a list of MCP clients and their capabilities.

### Anatomy of an MCP server

MCP servers are made up of [3 components](https://youtu.be/eeOANluSqAE?si=wWEnSxNj62-T-JXz&t=119) that are exposed to the underlying LLM (MCP client):

*   **Tools:** Actions to take — i.e. things that the LLM might want to do, such as creating a GKE instance or querying a database.
*   **Resources:** Data sources made available to the LLM to provide accurate responses.
*   **Prompts:** Structured inputs given to the LLM model to guide interactions.

#### Writing your own MCP server

I’m not going to go into details on writing your own MCP server, but I did want to touch upon a few things at a high level when it comes to writing your own MCP server, in case you wanted to give it a go.

There are a few different ways to write your own MCP server.

1.  **From scratch**: There are SDKs available for some popular languages such as [Python](https://github.com/modelcontextprotocol/python-sdk), [Java](https://github.com/modelcontextprotocol/java-sdk), and [C#](https://github.com/modelcontextprotocol/csharp-sdk), that you can use to build your own MCP server. Learn more [here](https://github.com/modelcontextprotocol).
2.  **Auto-generation tools:** There are a number of tools available that auto-generate MCP servers from API endpoints (e.g. [Speakeasy](https://www.speakeasy.com), [Stainless](https://app.stainless.com/docs/guides/generate-an-mcp-server), [FastAPI MCP](https://huggingface.co/blog/lynn-mikami/fastapi-mcp-server)).

No matter what approach you take, note that the API endpoints that you expose to an LLM via MCP server are not a 1:1 translation from say, your REST APIs. If you choose to use a tool to auto-generate your MCP server from your API endpoints, you’ll need to go in and make some adjustments after the fact. And with that, here are some points that you should keep in mind when writing your MCP server:

*   **LLMs perform better (i.e. run faster) with small context size.** Be mindful of what APIs you expose.
*   **Don’t give LLMs too much choice.** Don’t expose all of your API endpoints to LLMs, because most of them will probably not be used. Also, your LLM may choose the wrong one, if the API documentation isn’t descriptive enough.
*   **Human-readable API descriptions in your existing API are not optimized for LLM consumption.** When documenting APIs for LLM consumption, you should give as much information as possible to the LLM, and explain when that API endpoint should be used.
*   **Write tests (**[**MCP evals**](https://huggingface.co/blog/mclenhard/mcp-evals)**) to ensure that your LLMs are calling the right tool (API) for the right job.** And run those tests over and over.
*   Most APIs are designed for resource management and automation; not for human tasks. **Remember that LLMs emulate humans, so, like humans, they don’t care about low-level resource creation.** They care about achieving a specific goal.

The moral of the story: focus on creating AI-native APIs. ✨🌈

**PS:** Huge shout-out to [this talk](https://youtu.be/eeOANluSqAE?si=QUUFqY5GT-0cWN56) for enlightening me on this topic.

### Final thoughts: why should I care about MCP?

MCP doesn’t add any new tools and capabilities to LLMs. Rather, **_it provides a standardized way for making tools available to LLMs_**. So if you have a service and want an LLM to interact with it, all you have to do is write an MCP server. Okay…that’s over-simplifying, because it implies that creating MCP servers is magically easy, but the point here is that it up opens doors for us to do cool workflows with LLMs. Before, integrations were few and far between, since you had to painstakingly create LLM-specific integrations for service you wanted your LLM to interact with. Now, we’re seeing new MCP servers cropping up all the time. And that, my friends, is magical. 🪄✨

On a personal, note, wow that I have a better understanding of MCP servers, I’m super excited to learn about the awesome use cases and workflows that I can apply to my favourite topic, Observability. My employer, [Dynatrace](https://dt-url.net/dt-devrel-playground), has come out with its [own MCP server](https://dt-url.net/mcp). I’m stoked to play around with it, because I think it’s a super-cool idea to be able to interact with your Observability backend using a chatbot. Stay tuned, because I’m sure that there’s a tutorial on the horizon in the near future!

I hope that this has enlightened you on the awesomeness of MCP servers, and that it inspires you to explore some cool use cases and maybe even build your own!

And now, please enjoy this photo of my rat Barbie, enjoying some hammock time.

![A white rat with pink ears and a pink nose is peeking out from a hammock inside a cage. The hammock is patterned with feathers in black, white, and pink colors. The cage has various colorful shredded paper and cardboard tubes scattered on the floor. The rat’s eyes are wide and shiny, giving it an inquisitive look.](https://cdn-images-1.medium.com/max/800/1*bBkSXNq8dGNGTM_f69JPPg.jpeg)

Barbie looking cozy in her hammock. Photo by Ian Maxwell.

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [June 6, 2025](https://medium.com/p/be1601dc7a81).

[Canonical link](https://medium.com/@adri-v/lets-learn-about-mcp-together-be1601dc7a81)

Exported from [Medium](https://medium.com) on June 3, 2026.