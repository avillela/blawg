---
title: The Great Autonomous AI Experiment
slug: BLAH-great-autonomous-ai-experiment
description: Exploring autonomous AI development using Paperclip and BMAD
tags:
  - AI
  - thought-leadership
  - vibe-coding
added: 2026-06-25T19:49:38.073Z
---

We’re a few years deep into The Great AI Experiment, and there is still a lot of debate out there on how to incorporate AI effectively into our tech lives. On the one extreme, we have those who have embraced AI wholeheartedly. On the other extreme, we have those who refuse to do anything AI. As with any big technology disruption, the answer lies somewhere in the middle.

Like many of my peers in tech, I am still struggling to find that “right balance” of AI use in my work, and to help me, I’ve been experimenting and educating myself on various topics. My latest set of experiments have brought me to the wonderful world of autonomous AI workflows, which is what I’ll be talking about today.

But before we dig in, let’s take a little detour and do a little level-set on terminology.

## Evolution

**Chatbot:** In the beginning\*, we had AI chatbots. These took the world by storm with the advent of ChatGPT, which opened the AI floodgates. Others like [Claude](https://en.wikipedia.org/wiki/Claude_\(AI\)), [Copilot](https://en.wikipedia.org/wiki/Microsoft_Copilot), and [Gemini](https://en.wikipedia.org/wiki/Google_Gemini), soon followed. They were neat! We could ask them about Shakespeare’s works, get them to draw us fun pictures, and help us polish our prose. Their scope was limited, however, because they were limited by the data they were trained on, and had no access to the outside world.

**Model Context Protocol (MCP):** Then [MCP](https://adrianavillela.com/post/let-s-learn-about-mcp-together/) entered the picture, providing an AI-native API for chatbots to access outside services. Suddenly, chatbots could do so much more for us, like look things up in the interwebs, and create documents for us.

**Agent**: Agents took things up another notch, making things like vibe coding possible. You might’ve been using an agent and didn’t even realize it. An agent is made up of a model (e.g. [Claude Sonnet](https://www.anthropic.com/claude/sonnet)), instructions, tools (e.g. MCP), and an agent loop. An agent loop cycle looks like this: observe → reason → act → evaluate. The agent follows this until it reaches its goal. For example, a deliverable as defined in its instructions.

**Harness:** A harness adds infrastructure around your agent. It is the agent’s operational runtime, providing the infrastructure that supports the agent. It does things like memory management, observability, and lifecycle management. Tools like [Goose](https://goose-docs.ai), Claude Code, and GitHub Copilot serve as both agents and harnesses. Just to add to confusion to an already confusing topic. 🫠💀

> *(\*) Kinda…[AI has been around for a few decades](https://www.tableau.com/data-insights/ai/history).*

## The Experiment

As I said in the intro, I wanted to play with autonomous AI workflows. But why?

If you’ve used AI agents, then you, my friend, have used autonomous agents. Agents by way of the “agentic loop” (see the definitions section above) will reason, iterate, and course correct until they have achieved their end goal\*.

Having one agent for development is great. But what if you had *a whole team of agents*, each one with specific skills to handle a different aspect of the software development life cycle (SDLC), without human intervention??

What would that look like? Would it be feasible? What tools could I use to make this happen?

That’s what I wanted to find out.

*(*) Well…on the most part. Sometimes they do get stuck in an infinite loop.\*

### Setup

For my autonomous AI workflow experiment, I decided on the following tools:

* [Paperclip](https://paperclip.ing)
* [BMAD](https://adrianavillela.com/post/my-thoughts-on-vibe-coding-have-evolved/)
* [Claude Sonnet](https://www.anthropic.com/claude/sonnet)

**Paperclip** is an AI agent orchestrator. It’s organized around the idea of having a company of agents. You must create at least one company, and each company must have at least one agent, the CEO agent.

You can organize your company however you like. For example, you could have a company with only the CEO, who also serves as your sole developer. Not great, and kind of defeats the purpose of Paperclip, but you could totally do that. Or you can create a team of agents with specific skills, reporting hierarchies, and handoffs, which is where Paperclip shines.

Paperclip agents are defined in an `AGENTS.md` file, and they include things like:

* Agent name and title
* Reports-to
* Skills (you must register your various `SKILLS.md` that you want made available in your Paperclip organization)
* Role and persona
* Communication style
* Core principles
* Capabilities
* Output conventions
* Where to store artifacts and what artifacts to produce
* Cross-agent collaborations (who the agent receives from/hands off to/collaborates with)

Additionally, Paperclip allows you to define goals, create projects, and assign agents to project tasks. You can associate goals to a project, and within a project, you can create issues and assign them to an agent.

All of this is packaged neatly into a nice web interface.

![Paperclip UI. Made with Claude.](/assets/paperclip-dashboard.png "A dark dashboard showing agent counts, zero recent activity, and a sidebar listing work items, projects, and multiple agent roles.")

As I said previously, I wanted a team of agents to do my bidding. After chatting with my co-worker and teammate, [Henrik Rexed](https://www.linkedin.com/in/hrexed/), who has done a LOT of work in this area, I decided to set up BMAD agents in Paperclip. In fact, I used his repository, [Papreclip-Bmad-Crew](https://github.com/henrikrexed/Paperclip-Bmad-Crew/tree/main), as a starting point for my explorations, since there’s no official documentation for setting up BMAD with Paperclip.

**BMAD** is a tool that provides AI agent skills for software development. Each agent has a set of skills that are mapped to different roles/personas in an Agile software development team. [I’ve played with BMAD before](https://adrianavillela.com/post/my-thoughts-on-vibe-coding-have-evolved/), and loved the experience of using it for AI-assisted software development.

I chose **Claude Sonnet** as the underlying LLM for my agents. Sonnet is a pretty powerful model, and it doesn’t burn through tokens like Opus does.

> **✨In a nutshell:** Paperclip manages the AI agents, and BMAD supplies the agent’s base skills, with Claude doing the work.

![Using Claude, BMAD, and Paperclip](/assets/paperclip-architecture.png "Short alt text:
A three‑layer diagram showing Paperclip at the top, BMAD skill roles in the middle, and Claude Sonnet as the model executing those skills at the bottom.")

### The Team

Using the agent definitions from [Henrik’s repository](https://github.com/henrikrexed/Paperclip-Bmad-Crew/tree/main), the team was structured as follows:

* **CEO:** Manages the organization.
* **Crew Manager (CTO):** Manages the development team. Reports to the CEO.
* **Development team:**
  * **Winston:** Architecture and implementation
  * **Mary:** Research and market analysis
  * **Amelia:** Dual personas, serving as both developer and code reviewer
  * **John:** Product manager who translates user needs into product requirements
  * **Story writer:** Bridges product planning and development execution
  * **Testing architect:** Test automation and quality assurance
  * **Challenger:** Looks at things with a critical eye.

You may notice in the diagram above that there are also O11y Engineer and DevOps Engineer agents. I personally didn’t use them for my little side project, and they don’t map to BMAD skills. If you want to leverage them (and other Paperclip-ready agents) for one of your projects, you should check out Henrik’s [GitHub repository of shareable Paperclip agents](https://github.com/henrikrexed/PaperClip-Agents).

### The project

To test this setup, I came up with an app idea. I have a podcast called [Geeking Out](https://bio.site/geekingout). I publish episodes to various podcasting platforms (e.g. Apple Music, Spotify, Amazon Music) using a tool called [Simplecast](https://geeking-out.simplecast.com). I also publish episodes on [YouTube](https://youtube.com/@geekingout_pod). I can’t view consolidated podcast stats across both tools, so I thought it would be useful to create a tool that pulls the stats for my podcast from YouTube and Simplecast onto a single dashboard.

And with that project in mind, away I went!

### First try: Winston built my app for me

After setting up my BMAD crew in Paperclip, I created an issue in Paperclip, and assigned it to Winston, who, you may recall, is the architect agent. The issue stated:

```
I would like collect stats from my YouTube channel (https://youtube.com/@geekingout_pod) and from my podcast hosted at https://geeking-out.simplecast.com.
I would like build an app that lets me see all of my stats in one place and and exports them to a PDF or spreadsheet (options for both).
I would like recommendations of stats to collect for both YouTube videos and podcast episodes, and the best way to display them.
```

We chatted back-and forth a bunch, and he came up with a nice app for me.

Damn, Winston…nice job. I was pretty happy…until I realized that I wasn’t really taking advantage of what Paperclip had to offer. What was the point of having this whole company of autonomous agents with different roles, handing tasks off to one another, if I was only engaging with just one agent?

Also…where were the other agents, anyway?

Confused, I messaged Henrik about the lack of agent handoff. He (rightly) pointed out that I needed to have done the following:

* Create the issue in Paperclip
* Assign it to the CEO, explicitly saying that it needed to follow the BMAD method

Oh…DUH. 🙄

So I started over.

### Second try: Working with a team of agents

Okay. Time to do this properly. I decided to nuke my Paperclip + BMAD environment and start from scratch…including writing the app.

I wanted to do this in a more Paperclip-native way, so here’s what I did the second time around:

* Created a goal in Paperclip: “Display stats for the Geeking Out Podcast from multiple sources in a single dashboard”.
* Created a project called *Geeking Out Podcast Stats Dashboard*. I then attached the above goal to the project.
* Created a markdown file in my repository with the project requirements. It included:
  * Goal
  * Language and framework used for development
  * Data to display
  * Data filter options
* Created a new issue inside the new project, and assigned it to the CEO. My new prompt was:

```
Implement the requirements from the file /workspaces/devrel-toolkit/requirements/podcast-stats-requirements.md"
```

The new prompt was encapsulated in a markdown file in my repository, and had way more details than the prompt I used the first time around.
