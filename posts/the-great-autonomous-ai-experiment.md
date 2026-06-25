---
title: The Great Autonomous AI Experiment
slug: the-great-autonomous-ai-experiment
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

*(*) Kinda…[AI has been around for a few decades](https://www.tableau.com/data-insights/ai/history).\*

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

![Paperclip UI](/assets/paperclip-dashboard.png "Paperclip UI")
