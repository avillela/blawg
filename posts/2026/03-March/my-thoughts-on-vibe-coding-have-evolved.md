---
title: "My Thoughts on Vibe Coding Have Evolved"
slug: my-thoughts-on-vibe-coding-have-evolved
description: "How using BMAD for vibe coding has opened my eyes"
added: "Mar 02, 2026"
tags:
  - technical
  - ai
  - vibe-coding
  - thought-leadership
---



![A light yellow cocktail in a clear glass topped with a dried citrus wheel, with a small pink plastic duck figurine sitting on the citrus slice.](https://cdn-images-1.medium.com/max/800/1*qmYmKyO2tELXb2w6DORfMg.jpeg)

Pink duckie going for a swim! Photo by author.

I’d like to think of myself as pretty open-minded when it comes to technology. Let’s face it: you can’t be successful in technology if you aren’t open to learning new things. And I myself wouldn’t be where I am now without that open-mindedness.

But I have to admit that I was a little more on the hesitant side when it came to AI. I kept thinking to myself, “Meh. It’s hype. This thing is just gonna die off soon.” But alas, that wasn’t the case.

As time went on and AI Things gained in popularity, all of a sudden I saw a bunch of my peers shifting their focus to AI Things, retooling themselves and becoming “experts”. (I put “experts” in quotes because who’s actually an expert at anything, really?) For the first time in my tech career, one of my worst fears seemed to be coming true: falling behind and being irrelevant because I was too bullheaded to jump on the bandwagon.

### Oooh, MCP looks cool!

It wasn’t until I started learning about [MCP servers](https://adri-v.medium.com/list/llm-mcp-379823d95765) that AI started to REALLY pique my interest. All of a sudden, I could see tons of really cool applications and use cases that I could try out. I guess that’s the thing for me. I need a use case. And that’s when I got the idea to build [a reusable prompt-based workflow for creating local developer infrastructure](https://medium.com/womenintechnology/prompt-based-reusable-workflows-for-developers-who-dont-wanna-have-to-remember-5d9650e5aee2).

I learned a few things from this experience:

*   **Prompt-writing is hard.** I initially sucked at it, but I [taught myself to write better prompts](https://medium.com/womenintechnology/i-fought-the-prompt-and-i-mostly-won-1c58c30e594e).
*   **Prompt-writing is an emotional roller-coaster.** Refining prompts feels like trying to reach the speed of light. You can write pretty good prompts, but you can’t ever achieve that perfect, repeatable prompt, because AI is non-deterministic. We need to just deal with that.

And then…I. Just. Stopped. I was paralyzed. Again, the world was moving onto more AI Things without me. Everyone was vibe coding. I was not.

### Enter vibe coding, stage left

I decided to change all that by just sucking it up and trying out this vibe coding thing for myself. The best way I learn is by doing, and I had a little application in mind.

As part of my job, I do a lot of work in [OpenTelemetry](https://opentelemetry.io) (OTel). In fact, I’m a newly-minted [OTel Community Manager](https://opentelemetry.io/blog/2026/hello-from-community-managers/), and as part of that role, I need to keep up with what’s new with the project. Easier said than done. OTel is MASSIVE, and it’s rapidly evolving. Keeping up with everything is HARD. But then I had an idea! 💡

#### An idea is born

The idea was to vibe code a web application to summarize the news-worthy bits from the OTel blog, and separate these news bits out into categories: Specification, Signals, API & SDKs, Semantic Conventions, Collector, Instrumentation, Context propagation, Ecosystem & integrations (e.g. OpAMP, OTel Operator, OBI, OTel Weaver). Users have the ability to export the results as a CSV or markdown file. It’s the perfect vibe coding experiment for me because…I know nothing about front-end development.

Would not knowing the language being used to write the app be a hindrance for me? Would it matter? I was about to find out.

#### The journey begins

I have access to GitHub Copilot through work, so that’s what I used for my little experiment.

My initial plan was to throw some well-constructed prompts into a [VSCode prompt file](https://code.visualstudio.com/docs/copilot/customization/prompt-files). And that’s exactly what I did. When Copilot produced the first iteration of the app, my thought was, “Look ma, no hands!” Seriously. A whole NodeJS app written for me, and all I had to do was describe it. Damn.

Okay, great first step. But it still needed some work. So I refined my prompts. I’m of the nukify-everything-and-start-from-scratch (TM) school of thought, so rather than refine my prompts in the chatbot window, I nuked all of the generated code, refined the prompt file, and re-ran it.

> Maybe not the best idea in hindsight, given that LLMs are non-deterministic and all. Some developer habits are hard to break. _😬_

I did this a number of times. The program was looking pretty good. Here’s the last version of my refined application prompt:

\---  
name: create-otel-news-app  
tools: \['execute/createAndRunTask', 'execute/runInTerminal', 'execute/getTerminalOutput'\]  
description: "Creates an 'OTel News' app"  
\---  
\# Role  
  
\* You are an engineering manager trying to keep up with the latest news in OpenTelemetry.   
\* You have a technical background, both as a Developer and as a DevOps Engineer  
  
\# Objective  
  
I'd like to stay on top of the latest opentelemetry news from the OpenTelemetry blog from mid-2025 until present. I don't have time to keep up with all of the OpenTelemetry news, so I want something that I can refer to regularly with updated information   
\* Create a single page application that goes through the OpenTelemetry blog and summarizes posts on the following topics:  
    - Specification  
    - Signals  
    - API & SDKs  
    - Semantic Conventions  
    - Collector  
    - Instrumentation  
    - Context propagation  
    - Ecosystem & integrations (e.g. OpAMP, OTel Operator, OBI, OTel Weaver)  
\* Exclude:  
    - personal articles  
    - how-to articles  
    - articles about kubecon  
    - articles about surveys  
\* The app should have a Web user interface that allows me to select:  
    - a date range that includes month and year (earliest year should be 2025)  
    - separate selectors for month and year  
\* The results screen should allow me to filter by:  
    - date (month and year)  
    - topic  
\* App name: OTel News Digest App  
\* Search results should not be hard-coded.   
\* The app should be able to go through the OpenTelemetry blog and identify relevant articles based on the criteria above.   
\* The app should be able to update the search results as new articles are published on the OpenTelemetry blog.  
  
\## UI Design:  
\* Add OpenTelemetry logo to the header  
\* Stylesheet: similar look and feel to the OpenTelemetry blog (https://opentelemeetry.io)  
\* Blue background based on OpenTelemetry color palette  
\* Use sleek design lines  
\* Single page application  
\* A search page. A web user interface that allows me to select:  
    - a date range that includes month and year (earliest year should be 2025)  
    - separate selectors for month and year  
\* A results page:  
    - filter by topic  
    - do not filter by date  
\* Ability to export results as CSV and Markdown  
  
\## Blog time period:   
\* from June 2025 to December 2025  
\* from January 2026 to present  
  
\# Guidelines  
  
Follow best practices for a NodeJS project  
  
\# Output  
  
Web page withe the following information per distinct topic:  
\* Title - summarize what this is about  
\* Category - what is the category (e.g. OpenTelemetry Demo, OpAMP, Localization)  
\* Bullet points summarizing the topic  
    - 4-5 bullet points summarizing topic  
\* Why is this important/why does this matter to the community?  
\* Links to sources  
  
\# Resources  
  
Use articles from the OpenTelemetry blog that talk about new OpenTelemetry features and initiatives:  
\* https://opentelemetry.io/blog/2025  
\* https://opentelemetry.io/blog/2026

But then I decided to pause. Because then I remembered that my co-worker, [Henrik Rexed](https://www.linkedin.com/in/hrexed/), had told me about something called the [BMAD (Build More Architecture Dreams) Method](https://github.com/bmad-code-org/BMAD-METHOD), which, if I understood correctly, would provide me with a framework for vibe coding.

It seemed like the perfect time to take BMAD out for a test drive, and to see what I was right.

#### Mad for BMAD

The best way to describe BMAD is that it’s basically having an entire Agile Development team at your disposal, in the form of AI agents. No joke. For example, we have:

*   Mary, the business analyst
*   John, the product manager
*   Winston, the architect
*   Sally, the UX designer
*   James, the developer
*   Quinn, the QA

To install BMAD, you first need Node.js installed on your machine. And then, you run:

npx bmad-method install

And then in your AI assistant chat window, you can invoke the various BMAD prompts and provide additional context.

> **✨ NOTE:** Check out the [BMAD quick start guide](https://docs.bmad-method.org/tutorials/getting-started/) to get started.

Here’s my initial prompt, in which I fed it the prompt file I shared above:

/bmad-help I have an idea for a project I want to build. I have the requirements written in context/otel-news-app-design.md. I would like to start planning and building the project. Where should I start?

It then proceeded to tell me which BMAD prompts to run and in what order, making sure that I run them in a separate window.

Create Brief (CB) — run /bmad-bmm-create-product-brief; Agent: 📊 Mary (Business Analyst); turns your idea into a structured product brief.  
Create PRD (CP) — required next — run /bmad-bmm-create-prd; Agent: 📋 John (Product Manager); this is the first required planning gate.  
Create UX (CU) — run /bmad-bmm-create-ux-design; Agent: 🎨 Sally (UX Designer); strongly recommended since your app is UI-heavy.  
Create Architecture (CA) — required in phase 3 — run /bmad-bmm-create-architecture; Agent: 🏗️ Winston (Architect).  
Create Epics and Stories (CE) — run /bmad-bmm-create-epics-and-stories; Agent: 📋 John (Product Manager), then proceed to implementation workflows.

So I did what I was told, and what happened next blew my mind. BMAD created project artifacts for me during each step, including:

*   **Functional and non-functional requirements documents**, using the initial (refined) prompt file that I used for my original vibe coding attempt
*   **UX design documents**. It asked me things like what did I want the design to look like? Was it for mobile, desktop, or tablet? What would define a good user experience? What did I want the user to experience? It even produced some design mockups for me to choose from!
*   **Architecture documents.** It asked me questions about the technologies I wanted to use. Database or no database (no database for the first iteration, I said). I asked for JavaScript for the front-end. It asked me if I wanted the code to be in Typescript or Javascript (Typescript, I said). I said Python for the backend (okay, I said).
*   **Epics and stories**, planning which features to implement and when.

![Six design mockups for an “OTel News Digest,” each showing different layout styles for presenting OpenTelemetry updates, including card-based, header‑focused, dark mode, sidebar navigation, narrative feed, and dense compact views.](https://cdn-images-1.medium.com/max/800/1*B_YpmnNBxoj27RPKkyPYkw.png)

The BMAD UX designer served me up some design options using the OTel colours, as I’d asked for

I refined my design along the way, as I began to develop a clearer picture of this application in my head. And as I did that, I asked BMAD to update the required design documents and code, to reflect the changes, thus preventing documentation drift.

After the user stories were created, I was ready to start development, so I told BMAD to make it so, by saying:

I'm ready for implementation. Can you implement them for me?

It went through each story and started implementing features in the stories and writing tests. I just sat back and answered some questions as it did its thing. It felt magical. Disconcertingly so. What was it doing back there?

This kept going for a while. The agent wanted to implement more features and write more tests. There was a lot of code being written, and I had no idea what it was doing. So then finally I said:

can we run the app quickly?

Good thing, too. Because I noticed a few things right away. In spite of all that planning, things weren’t quite working the way I wanted them to. For example:

*   **Topic categorization**. There was an article about [reducing log volume with the OpenTelemetry Log Deduplication Processor](https://opentelemetry.io/blog/2026/log-deduplication-processor/) which it erroneously put under the OTel `Signals` category, when in fact, it should’ve gone under the `Collector` category.
*   **Article summaries**. The article summaries were crap. It initially passed off the following as a summary for each article: “Additional implementation detail is available in the linked source post.”
*   **Broken links.** The links to the articles it referenced were non-existent.
*   **UI issues.** The UI didn’t look at all like any of the mockups that the UX designer agent had proposed to me, and the usability wasn’t the greatest.

It took me a couple of hours of refined prompts and many premium tokens to get the app to a half-decent state. At the time of this writing, my little app isn’t quite ready to be released to the world, but considering all I’ve accomplished so far, it’s progressing nicely.

I’m still not happy with how things are being summarized, and I suspect that I’ll need to add some sort of AI agent to the codebase to pull in the data and summarize in a more “human” way.

#### Advanced use cases

BMAD has some cool advanced use cases that worth exploring in the future. For example, there’s [party mode](https://docs.bmad-method.org/explanation/party-mode/), which brings all of the AI agents into one “room” and allows you to interact with them by name in various ways, like challenging Winston (architect) on design decisions, asking questions, building on ideas with Mary (business analyst) and Johh (program manager).

There’s also a feature called [adversarial review](https://docs.bmad-method.org/explanation/adversarial-review/), in which you’re forced to look at things with a critical eye, assuming that problems exist, rather than just giving it a “looks good to me” stamp of approval.

I haven’t tried either of these, but I really like what they’re going for. One of the things that’s infuriating about working with AI assistants is that they’re always patting you on the back, over-inflating your ego, and just going along with what you say. I love that these two things add a little more zest and challenge into the mix.

When I was talking to my husband about vibe coding, he said that one of the things he does is feed code generated by one LLM into a different LLM, so that the LLMs critique each other’s code. These BMAD features are kind of like that, in a way.

### Lessons learned

I came into this vibe coding experiment with my eyes half closed, not really knowing what I was doing, what to expect, and what I was getting out of it.

Given that this is my first vibe coding experiment, there was definitely a learning curve. I had to:

*   Learn how to describe my application well.
*   Learn how to describe refinements to my application.
*   Learn how to use BMAD properly to design and “write” the code. To that effect, do yourself a favour and read the [quick start guide](https://docs.bmad-method.org/tutorials/getting-started/).

All these things take time, and I suspect that for my next vibe coding project, certain things will go a bit faster.

I admit that I struggled with the idea of vibe coding. Vibe coding optimizes on senior engineers, and leaves more junior, less experienced folks sitting in a pile of confusion. I have some junior software engineering friends who are forced to code with AI companions, but are given no direction from their senior engineers. And yet, they get shit from their senior peers when they write sub-part pull requests. Didn’t sound like a ringing endorsement to me.

#### It’s an architect’s world

But maybe that’s the thing. I vibe coded an application using a language that I don’t know, but can read well enough. So what does this mean for the future of software engineering? I think it means that with the right frameworks in place, like BMAD, the future of software engineering lies not with the _software developers_, but with the _system architects_. The ones who have a vision of a system with inputs, outputs, and the things that happen in the middle.

I believe that the future of software engineer will need to:

*   Know what technologies are suitable for what
*   Understand data flow and data storage
*   Understand how different systems should interact with each other
*   Understand good design principles
*   Understand good security practices
*   Know how to express themselves in a way that that LLMs can understand

#### Other musings

*   **Where do the juniors fit in?** Vibe coding really is made for people who have a good understanding of software design principles. In order to groom junior into seniors, they will need guidance and mentorship from more senior folks.
*   **Bye bye agile teams?** If done right, tools like BMAD can essentially replace an entire agile team. But that’s the caveat: _if_ done right. It’s easy to get complacent and trust that AI is doing the right thing. Hell, I saw it myself. It was tempting to just go with whatever the BMAD agents said to me. I had to stop myself and take a step back to check things along the way.
*   **Vibe coding is a paradigm shift unlike any other**. Coming from a software engineering background, it used to be about knowing a particular programming language — its constructs, nuances, syntax. With vibe coding, it’s about being able to articulate your design ideas.
*   **You’re no longer constrained to create “static” code.** Back in the day, writing code with “dynamic” logic was using a bunch of `if` and `case` statements. Which isn’t that great, by the way. But that’s all you had. Now you can write code to use AI agents, whether they’re your own or a third party agent, to pull in data given fuzzy inputs and use fuzzy logic to paraphrase information.
*   **There’s a cost barrier.** The cost of using AI agents out-of-pocket can be very prohibitive for those who are just entering the workforce and trying to get experience in vibe coding. This is a very privileged position if you work for a company (or attend a school) that provides you with subscriptions to coding assistants, or if you make enough money to afford a monthly AI assistant subscription. And the good models are pricey.

### Final Thoughts

Vibe coding has put software development in the hands of folks who would normally never touch code. Whether it’s someone with a cool app idea but has a non-technical background, or a person with an Ops background who would default to writing an entire app using Bash or PowerShell because that’s what they’re comfortable with. We’ve gone from sitting on an idea for weeks, months, or years, to being able to execute it pretty quickly, and that is pretty freaking cool.

But as Peter Parker’s uncle Ben said, “With great power comes great responsibility.” Before unleashing your vibe coded app into the world, think about the people who might potentially use it. What does it do with user data? Does it keep it safe? Can it handle volume?

Should this deter you from vibe coding? Not at all. Just food for thought.

And with that, I will now leave you with a photo of all 3 of my rats, making a rare appearance together.

![Three pet rats snuggled together inside a soft, feather‑patterned hammock lined with faux fur. Two rats peek out from the front while a third rests behind them, all inside a cage with metal bars visible in the background.](https://cdn-images-1.medium.com/max/800/1*G_b8hU4LNWnxmBCkU-PVcw.jpeg)

Left to right: Barbie, Penny, and Duckie are all enjoying some hammock hang time together!

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [March 2, 2026](https://medium.com/p/7912d2df0300).

[Canonical link](https://medium.com/@adri-v/my-thoughts-on-vibe-coding-have-evolved-7912d2df0300)

Exported from [Medium](https://medium.com) on June 3, 2026.