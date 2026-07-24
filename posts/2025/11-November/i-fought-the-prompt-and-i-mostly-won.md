---
title: "I Fought the Prompt, and I (Mostly) Won"
slug: i-fought-the-prompt-and-i-mostly-won
description: "How I stopped writing crappy AI prompts, and you can too!"
added: "Nov 12, 2025"
tags:
  - technical
  - ai
---



![A nighttime waterfront view of Bryggen in Bergen, Norway, featuring a row of brightly lit, colorful wooden buildings with steep gabled roofs. Their reflections shimmer on the calm water in front. Behind the historic harbor district, a hillside dotted with lights from homes rises into the dark sky, adding depth to the scenic and culturally rich landscape.](https://cdn-images-1.medium.com/max/800/1*3qmCRGdkVc-D33wvfZuIAA.jpeg)

Bergen, Norway, at night. Photo by [Adriana Villela](https://bento.me/adrianamvillela).

I’m not gonna lie. Prompt-writing has brought me to tears in the past. I wrote what I thought were “great” prompts that had been super repeatable for the last 10 executions, only to have the LLM decide on the 11th execution to ignore me completely and do its own thing. 🤬

So I did what any halfway decent engineer would do: I “refined” my prompts in the hopes that the LLM would do my bidding. I’d get closer and closer. Just one more refinement. Just one execution. It’s almost there. Until…it wasn’t and everything would implode. I was convinced that there was a room full of LLMs somewhere out there, laughing at my expense.

![A screenshot of a humorous LinkedIn post by Adriana Villela. The post expresses playful frustration with AI behavior when using custom instructions for MCP servers. Adriana imagines the AI mocking her efforts with a fictional quote: “PUNY HOOMAN… just when you think you’ve got it all figured out, I’m gonna change my mind… MUHAHAHAHA.” The tone is light-hearted and self-aware, highlighting the unpredictability of AI interactions in technical workflows.](https://cdn-images-1.medium.com/max/800/1*AW4e5b4RTetPCK6yCQBZ1w.png)

Yup, prompt-writing is a VERY frustrating experience. Original post link [here](https://www.linkedin.com/posts/adrianavillela_the-more-i-use-custom-instructions-in-an-activity-7386514531755171840-okZJ?utm_source=share&utm_medium=member_ios&rcm=ACoAAASyNZMBOIsHxmGNQNfpDInV9MEDEeeNzvg).

And after spending weeks spinning my wheels and crying in frustration, I came to a very simple realization:

> I was a crappy prompt writer.

Once I came to terms with this simple, harsh truth, I set about to educate myself on how to write better prompts.

**_If you’ve been struggling with writing good AI prompts, please know that you are not alone._** Today, I will share my tips and tricks for writing better prompts, based on my research, suffering, and personal experience. Let’s do this!

### Prompt engineering is so 2024 and first half of 2025

Okay, first things first. Remember when we used to call it “prompt engineering”? Apparently [it’s now called “context engineering”](https://blog.langchain.com/the-rise-of-context-engineering/). This might seem like one of those roll-your-eyes moments, but when you think about it, the change in terminology highlights the essence of what makes for a good prompt: **_context_**. Let’s dig into that, and other elements that make for great prompt-writing.

#### **Context is queen**

The main reason why my prompts were so crappy is that they lacked context. They were so vague on the details that the LLM had no choice but to fill in the big, huge gaps that I left. That was a HUGE realization for me. DUH!

So what does it mean to provide context? It means including the following:

*   **Role:** Who’s doing this (e.g. software engineer, SRE), and what’s part of their day-to-day job? Yes, telling your LLM what persona to take on when executing the tasks at hand ensures that it performs the tasks within the correct scope.
*   **Objective:** What do you want to accomplish? Be sure to stick to one main objective, and include steps taken to accomplish the objective. But make sure that you’re concise. LLMs don’t dig verbosity.
*   **References:** Include links to documentation explaining how to do certain tasks, where applicable. That helps takes out a lot of the guesswork on the part of the LLM.
*   **Output format:** Once the LLM is done performing the task, what’s the final output? Is it sending results to stdout or to a file? Is it code, bullet points, or a table? Be specific!

#### **Not all LLMs are equal**

I hate to say it, but some LLMs are better than others. I started off my explorations using [GPT-4o](https://en.wikipedia.org/wiki/GPT-4o)…until a bunch of co-workers told me to use [Claude Sonnet 4.5](https://www.anthropic.com/claude/sonnet) instead. And you know what? They were right! WOW…what a difference! Sonnet was helpful and responsive. GPT-4o was like that very meh lab partner you’re stuck with in chemistry class, who does the bare minimum. 🙃💀

Unfortunately, I ran out of Sonnet credits pretty fast, and had to go back to GPT-4o. Ugh. 😭

#### **Markdown is magic**

I was surprised to learn that prompt files are typically written in markdown. WUUUT? I have to say that this totally broke my brain, because I guess I just didn’t expect that. But when you think about it, it makes a lot of sense. Markdown files are super easy to parse, whether you’re a human or an LLM.

#### **Temperature sets the tone (when applicable)**

I was surprised to discover that in some cases, you can set a “temperature” for your LLM. The [LLM temperature](https://www.iguazio.com/glossary/llm-temperature/) is a number (typically) between 0 and 1 that determines how “creative” you’d like the LLM to be with your prompts:

*   **<1.0:** LLM is more deterministic, more repetitive
*   **\==1.0:** Default value. The “balance” between creativity and determinism.
*   **\>1.0:** LLM is less deterministic, more creative, random ([Skynet](https://en.wikipedia.org/wiki/Skynet_%28Terminator%29), anyone?)

Note that you can’t always set the LLM temperature. For example, GitHub Copilot in VSCode currently doesn’t offer any temperature-setting capabilities.

#### **Instructions factor out common elements**

Just when I thought I was getting a handle on prompts, I then learned about something else: instructions. 🤦‍♀️ Great. Another thing to figure out. You can think of instructions as global (e.g. project-level) defaults for your chats. If there’s something that you find yourself repeating over and over and over again in your prompts, then consider moving it from your prompt file to an instructions file instead.

Like prompts, you should format your instructions using markdown, to make it easier for the LLM to parse.

The location of your instructions depends on the AI assistant used. For example, [GitHub Copilot with VSCode reads instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions) from `.github/copilot-instructions.md`. You can even get fancy and have fit-for-purpose instructions files. For example, instructions that apply to Python only.

### Prompt example

Now that we know what makes for a good prompt, let’s look at an example prompt. Let’s suppose we want to write a prompt that downloads and installs the [ArgoCD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/) on my machine.

Here is the original version of the prompt:

Run this to install the argocd CLI, and install it to ~/.local/bin. Skip installation of it's already found in {{ target\_directory }}.  
  
Test CLI by running argocd version.  
  
Summarize results.  
  

This prompt is okay, but it leaves a lot to the imagination, and if your LLM is feeling particularly cheeky that day, you may end up with some unpredictable results.

After my prompt-writing epiphany, I rewrote it as follows:

\## Role  
  
You are a site reliability engineer. Your role is to:  
\* Create Kubernetes clusters  
\* Configure Kubernetes clusters. This includes:  
  \* Installing operators  
  \* Deploying Kubernetes manifest YAML files using Helm charts and \`kubectl\`  
\* Creating automations  
\* Running scripts on the command line  
  
\## Objectives  
  
Your objective is to install the \`argocd\` CLI.  
  
Steps:  
1. Check to see if \`argocd\` already exists in ~/.local/bin. If it does, skip the subsequent steps in this section.  
2. Download version 3.2.0 of the \`argocd\` CLI.  
3. Install the \`argocd\` CLI  
   \* Installaiton directory: ~/.local/bin  
4. Test CLI installation by running \`argocd version\`.  
  
\## Source  
  
\* \`argocd\` installation instructions: https://argo-cd.readthedocs.io/en/stable/cli\_installation/  
  
\## Output  
  
Upon completion, print the following as per the "Output Guidelines" in \`.goosehints\`:  
\* Status of CLI installation (success/failed)  
\* CLI installation location  
\* Architecture of target machine  
\* Results of running \`argocd version\`

As you can see, the above prompt is quite detailed. Some big changes:

*   I’m using markdown, which, as we learned, is readable for both the LLM and me! Win-win!
*   I provide context in the “Role” section, telling the LLM to think of itself as an SRE. I even go so far as to state the job expectations for the SRE role.
*   I outline an objective, with clear and concise steps. Bullet points are your friend! We’re not writing a novel here, so no need to be verbose. Remember that the LLM likes clear and concise instructions.
*   I include a reference to the ArgoCD CLI installation docs. This tells the LLM exactly where to look for detailed instructions on how to download and install the CLI.
*   I specify the desired output format. Note that I point it to the “Output Guidelines” in my instructions file (see below).
*   I stick to one clear objective. The main objective is to install the ArgoCD CLI. That is all. If I want the LLM to perform another task, I should create a separate prompt file for it.

\## Output Guidelines  
  
\* Summarize results in tabular format  
\* The summary table should have 2 columns:  
\* First column: Component  
\* Second column: Details  
  

By making these refinements, I have made it very clear what my LLM needs to do in order to install the ArgoCD CLI on my machine, leaving less room for interpretation.

My original prompt, on the other hand, was vague, leaving way more room for interpretation, therefore leading to less consistent results.

For better results, I would also suggest that you play around with temperature settings (if applicable to the chatbot you’re using), and play around with different LLMs.

I really liked Claude Sonnet 4.5 and highly recommend it, if it’s available to me. And if I’m able to set temperature, I set it to 0.5. This gives the LLM just a bit of room for creativity. I definitely recommend against 0.0, because it leaves no wiggle room, which isn’t great either.

### Final Thoughts

If you were hoping for human/computer interactions like on [Star Trek](https://startrek.com), then I hate to break it to you…we’re not there yet.

![Geordi La Forge, a character from Star Trek: The Next Generation, stands in a spaceship control room wearing his signature VISOR device and a Starfleet uniform. Text at the bottom reads, “COMPUTER, RUN AN ANALYSIS,” referencing the show’s futuristic technology and analytical problem-solving. The image evokes a sci-fi theme and is often used humorously to signal a need for deep investigation or data review.](https://cdn-images-1.medium.com/max/800/1*doj2J4yrcwiR_lnArHZI5w.jpeg)

If only we could give prompts like on Star Trek! [Meme link](https://imgflip.com/i/abwxvj). [Base image link](https://static0.cbrimages.com/wordpress/wp-content/uploads/2020/04/geordi-la-forge-display.jpg?w=1200&h=675&fit=crop).

Instead, it feels more like Scotty in [Start Trek 4: The Voyage Home](https://www.imdb.com/title/tt0092007/), when he fruitlessly picks up a mouse and says, “Hello, Computer” expecting the computer to do his bidding. (Check out the video clip [here](https://www.youtube.com/watch?v=LkqiDu1BQXY). It’s one of my favourite movie scenes of all time!)

![Scene from Star Trek IV: The Voyage Home showing three men gathered around a computer. The man on the left, wearing a red and yellow outfit, humorously speaks into a computer mouse. The middle man, in glasses and a beige sweater with a red button, and the man on the right, in a brown jacket, watch the screen with interest. Bold white text at the bottom reads “HELLO COMPUTER,” highlighting the comedic clash between futuristic expectations and 20th-century technology.](https://cdn-images-1.medium.com/max/800/0*_nduPWuqadsI_fJE.jpg)

Iconic Star Trek IV scene: in which Scotty says, “Hello, computer”. Image source [here](https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.luisllamas.es%2Fen%2Freview-google-home-mini%2F&psig=AOvVaw2Yo7tgjaHrDONUaI9sbO6s&ust=1759566763960000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLjI1ZPPh5ADFQAAAAAdAAAAABAs).

Unfortunately, no matter how good a prompt you write, one thing remains true: AI prompts are non-deterministic, meaning that you’re not guaranteed to get the same results each time you run the prompt. So if you want truly repeatable results, the best use of _context_ engineering is to create prompts to generate scripts. Scripts are reusable and reliable (as long as they’re not buggy), because they’re code. There’s no room for interpretation.

But hey, even though we’re not at the level of Star Trek yet, you’ve got to admit that what we can do with prompts is pretty freaking amazing, if you follow the guidelines outlined here today.

And here’s to hoping for that Star Trek future!

And now, I’ll leave you with a photo our our recently-departed rat friend, Katie Jr. She lived a full rat life, filled with love and companionship from human friends and rat friends alike.

![A dark-furred rat with lighter facial markings peeks out from a red plastic shelter inside a cage. The enclosure is lined with shredded paper bedding and pink and white paper towels, arranged for nesting. The rat appears alert and curious, partially hidden within its cozy setup.](https://cdn-images-1.medium.com/max/800/1*f17F_2kb3jaFlUqKYmciPw.jpeg)

Remembering our recently-departed Katie Jr., who was kept young by her friend Barbie.

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [November 12, 2025](https://medium.com/p/1c58c30e594e).

[Canonical link](https://medium.com/@adri-v/i-fought-the-prompt-and-i-mostly-won-1c58c30e594e)

Exported from [Medium](https://medium.com) on June 3, 2026.