---
title: Running Codename Goose in a Dev Container
slug: running-codename-goose-in-a-dev-container
description: Exploring prompt-based workflow orchestration with MCP servers and Goose
tags:
  - technical
  - mcp
  - devcontainers
  - ai
  - aaif
  - '2025'
  - goose
  - AI
added: 2025-10-03T00:00:00.000Z
---

![A grand domed building with classical architecture, featuring a green copper dome topped by a cupola and cross, stands partially obscured by trees. Ornate golden embellishments and statues accent the structure, especially on a turret to the right. A nearly full moon glows in the muted gray sky, suggesting dusk or dawn, adding a serene contrast to the building’s opulence.](https://cdn-images-1.medium.com/max/800/1*6WtlgGqlTHP4VapjbUS9Eg.jpeg)

Waxing gibbous moon and [Karlskirche](https://www.visitingvienna.com/sights/karlskirche/) in Vienna. Photo by author.

***NOTE:*** *This is the first in a series of posts about Goose.*

It all started when I read [the post below by Angie Jones on Bluesky](https://bsky.app/profile/angiejones.tech/post/3lshqasecgs2t):

![Screenshot of a Bluesky thread by Angie Jones (@angiejones.tech) posted on June 25, 2023, at 7:05 PM. The thread lists five quick, practical ways she used her AI agent, Goose, to assist with work tasks — each taking under a minute. Examples include generating GitHub productivity reports, summarizing a 169-reply Slack thread into action items, identifying roadmap themes from team discussions, clarifying a technical concept for a colleague, and summarizing a long Google Drive document.](https://cdn-images-1.medium.com/max/800/1*yLo0677nOXfLl2SW9F-aaw.png)

Skeet by Angie Jones, talking about all the cool things that she used Goose for. Post link [here](https://bsky.app/profile/angiejones.tech/post/3lshqasecgs2t).

Damn. This Goose thing sounds super cool! I wanna try me some of that! Now, if you’ve read my writings, you know that [I’m a huge fan of dev containers](https://adri-v.medium.com/list/dev-containers-78d35408c59f). They’re great for creating self-contained, portable development environments. And when it comes to using a tool like Goose, which has the ability to interact with your local development environment, I wanted to limit what it could touch, in case I screwed up. 😳

In this blog post, I will show you how I created a dev container for running Goose.

But first, allow me to provide you with some additional context.

### Motivation

[Model Context Protocol (MCP)](https://youtu.be/7j_NE6Pjv-E?si=Jd6yELlSpFN7iDwU) servers are all the rage. They have been a huge game changer, opening up the tech world to natural language interactions with various systems à la Star Trek.

![Scene from Star Trek IV: The Voyage Home showing three men gathered around a computer. The man on the left, wearing a red and yellow outfit, humorously speaks into a computer mouse. The middle man, in glasses and a beige sweater with a red button, and the man on the right, in a brown jacket, watch the screen with interest. Bold white text at the bottom reads “HELLO COMPUTER,” highlighting the comedic clash between futuristic expectations and 20th-century technology.](https://cdn-images-1.medium.com/max/800/0*_nduPWuqadsI_fJE.jpg)

Iconic Star Trek IV scene: in which Scotty says, “Hello, computer”. Image source [here](https://www.google.com/url?sa=i\&url=https%3A%2F%2Fwww.luisllamas.es%2Fen%2Freview-google-home-mini%2F\&psig=AOvVaw2Yo7tgjaHrDONUaI9sbO6s\&ust=1759566763960000\&source=images\&cd=vfe\&opi=89978449\&ved=0CBUQjRxqFwoTCLjI1ZPPh5ADFQAAAAAdAAAAABAs).

[My initial exploration of MCP servers](https://medium.com/womenintechnology/lets-learn-about-mcp-together-be1601dc7a81) led me to some hands-on time using the [Dynatrace MCP server to query OpenTelemetry data in Dynatrace using natural language](https://medium.com/womenintechnology/querying-opentelemetry-data-with-the-dynatrace-mcp-server-2d9ed078ea5b). But why stop there? What if we could orchestrate an SRE workflow using MCP servers? And what tool would we use to get the job done?

Enter [Block’s Codename Goose](https://block.github.io/goose/). [According to Angie Jones](https://systemsdigest.com/videos/what-codename-goose-angie-jones-explains), Goose is

> A fully customizable, open-source client that connects to 4,000+ MCP servers and works with any large language model (LLM).

You can think of Goose as an abstraction layer above your chatbot, allowing you to create reusable workflows and leverage the power of MCP servers to help you do this.

![Flowchart diagram of a chatbot system architecture. On the far left, a goose icon labeled “Goose” connects to the central “MCP Client (chatbot)” which displays logos for OpenAI and other technologies. Below it, a box labeled “LLM” shows Claude 3.5 Sonnet, LLAMA 4, and GPT-4, indicating the large language models used. To the right, the MCP Client connects to “MCP Server,” which then links to a final box labeled “Service” on the far right. Arrows indicate data flow between components.](https://cdn-images-1.medium.com/max/800/1*QJkxfxO2tQS8MG0CTBuoEA.jpeg)

High level overview of Codename Goose. Diagram by [Adriana Villela](https://adri-v.medium.com).

The cool thing about Goose is that it allows you to create reusable prompts, called [Recipes](https://block.github.io/goose/docs/guides/recipes/). My ultimate goal was to create a set of Goose recipes to automate the following workflow:

* Create a local Kubernetes cluster ([KinD](https://kind.sigs.k8s.io))
* Deploy [ArgoCD](https://argoproj.github.io/cd/) to that cluster
* Use ArgoCD via the [ArgoCD MCP](https://github.com/argoproj-labs/mcp-for-argocd) server to manage the deployment of the [OpenTelemetry Demo App](https://opentelemetry.io/docs/demo/), sending [OpenTelemetry](https://opentelemetry.io) data to [Dynatrace](https://dynatrace.com)
* Query Dynatrace using natural language via the [Dynatrace MCP server](https://github.com/dynatrace-oss/dynatrace-mcp)

Cool. Now that you’re all caught up, let’s create a Goose dev container!

### Tutorial

For your convenience, I have a lovely GitHub repo with my end-to-end Goose example, including the dev container configuration. You can check it out [here](https://github.com/avillela/ai-sre-workflow-demo).

#### Dev Container JSON

My dev container definition looks like this:

{\
"name": "default",\
"image": "mcr.microsoft.com/devcontainers/python:dev-3.13-bullseye",\
"features": {\
"ghcr.io/devcontainers/features/node:1": {},\
"ghcr.io/devcontainers-extra/features/kubectl-asdf:2": {},\
"ghcr.io/dhoeric/features/k9s:1": {},\
"ghcr.io/devcontainers/features/docker-in-docker:2": {},\
"ghcr.io/mpriscella/features/kind:1": {},\
},\
"overrideFeatureInstallOrder": \[\
"ghcr.io/devcontainers/features/node",\
"ghcr.io/devcontainers-extra/features/kubectl-asdf",\
"ghcr.io/dhoeric/features/k9s",\
"ghcr.io/mpriscella/features/kind"\
],\
"hostRequirements": {\
"cpus": 5,\
"memory": "32gb",\
"storage": "16gb"\
},\
"remoteEnv": {\
"PODMAN\_USERNS": "keep-id",\
},\
"containerUser": "vscode",\
"runArgs": \[\
"--init" // Recommended for proper process management\
],\
"capAdd": \[\
"IPC\_LOCK"\
],\
"postCreateCommand": ".devcontainer/post-create.sh",\
}

My base image is a Python image:

mcr.microsoft.com/devcontainers/python:dev-3.13-bullseye

In case you’re wondering why, it’s in case I need to run any MCP servers that rely on [uvx](https://docs.astral.sh/uv/guides/tools/#:~:text=uvx%20is%20a%20convenient%20alias,the%20full%20uv%20tool%20prefix.\&text=When%20a%20tool%20is%20installed,to%20be%20run%20without%20uv.), an alias of Python’s uv tool: `uv <toolname> run`. [uv](https://docs.astral.sh/uv/) itself is a Python package and project manager.

I also include the following features in my `[devcontainer.json](https://github.com/avillela/mcp-playground/blob/main/.devcontainer/devcontainer.json)`:

* [node](https://github.com/devcontainers/features/tree/main/src/node): Required for running the Dynatrace MCP server locally
* [kubectl](https://github.com/devcontainers-extra/features/tree/main/src/kubectl-asdf): installs `kubectl`
* [k9s](https://github.com/dhoeric/features/tree/main/src/k9s): installs the [k9s CLI](https://k9scli.io/), my favourite tool for managing Kubernetes clusters
* [docker-in-docker](https://github.com/devcontainers/features/tree/main/src/docker-in-docker): required for running KinD
* [kind](https://github.com/mpriscella/features/tree/main/src/kind): installs KinD

#### Installing Goose

Goose gets installed as part of running `[post-create.sh](https://github.com/avillela/ai-sre-workflow-demo/blob/main/.devcontainer/post-create.sh)`, which is called by my `[devcontainer.json](https://github.com/avillela/ai-sre-workflow-demo/blob/d504a9335c546254010e392390abe7fe71d05853/.devcontainer/devcontainer.json#L32C5-L32C57)`:

"postCreateCommand": ".devcontainer/post-create.sh"

To install Goose, run:

curl -fsSL [https://github.com/block/goose/releases/download/v1.7.0/download\\\_cli.sh](https://github.com/block/goose/releases/download/v1.7.0/download/_cli.sh) | bash

This downloads and installs the Goose CLI, and prompts you to configure it.

Unfortunately, installing Goose in a dev container turned out to NOT be as straightforward as I thought it would be. To understand why, let me walk you through what happened when I tried to just run the above `curl` command.

As I mentioned, the above `curl` command downloads and installs Goose. It then launches into the Goose configuration. You can run the Goose configuration at any time after installing Goose by running `goose configure`. Upon launching the Goose configuration, you get this screen:

![Terminal interface for “goose-configure” tool displaying configuration options: Configure Providers, Add Extension, Toggle Extensions, Remove Extension, and Goose Settings. A message at the top notes that changes will update the existing config file and offers the option to edit it directly at /home/vscode/.config/goose/config.yaml.](https://cdn-images-1.medium.com/max/800/1*s5TfW90hnSCbYkkUW-WHSw.png)

The first thing you need to do is configure an [LLM Provider](https://block.github.io/goose/docs/getting-started/providers/) (i.e. chatbot, like GitHub Copilot and Gemini). In my case, I wanted to use [GitHub Copilot](https://github.com/features/copilot), so I selected it from the list:

![Terminal interface for the goose configure command, prompting the user to select a model provider. The selected option is “Tetrate Agent Router Service,” followed by a scrollable list of AI providers including OpenAI, Google Gemini, Claude Code, GitHub Copilot, Amazon SageMaker TGI, and others. A header asks, “What would you like to configure?” with “Configure Providers” selected.](https://cdn-images-1.medium.com/max/800/1*iKqm2tBEdMpxXuLjGSckXQ.png)

After selecting Copilot, I got this screen:

![Terminal interface showing the goose configure process for setting up GitHub Copilot. The user selects “Configure Providers” and chooses “GitHub Copilot” as the model provider. A message indicates configuration of GITHUB\_COPILOT\_TOKEN via OAuth device code flow, instructing the user to visit https://github.com/login/device and enter the code 94A9–6D1C. The config file path is /home/vscode/.config/goose/config.yaml.](https://cdn-images-1.medium.com/max/800/1*wRF5rvuYMCgt1aE40K_AiA.png)

Clicking on the above link opened up my browser:

![GitHub device activation screen showing the user “avillella” signed in, with a profile picture, a green “Continue” button, and a gray “Use a different account” button below.](https://cdn-images-1.medium.com/max/800/1*qsgLKqwlcYXWQ-nWwJKfWw.png)

After clicking on “Continue”, I was prompted to enter the code, `94A9–6D1C`, per the earlier screen shot:

![GitHub device activation screen prompting user “avillela” to enter an activation code. Eight input boxes are shown in two groups of four, separated by a hyphen. A green “Continue” button appears below, with a note stating GitHub staff will never ask for the code on this page.](https://cdn-images-1.medium.com/max/800/1*3L5QmZM3Q6DjquHgjGaxlQ.png)

And then after clicking on “Continue”, I was prompted to authorize the GitHub Copilot plugin:

![GitHub authorization request screen for the GitHub Copilot Plugin. It shows a request from Vienna (IP: 213.143.108.82) on October 3, 2025, at 16:50 CEST, asking user “avillela” to grant access. The page lists permissions and plugin details, with “Cancel” and “Authorize GitHub Copilot Plugin” buttons at the bottom.](https://cdn-images-1.medium.com/max/800/1*kThmr1wiqedgEej-yp2uxg.png)

And after authorizing the plugin, I got this error: 🤬

Couldn't access platform secure storage: Secret Service: no result found

The thing is, Goose relies on the system keyring/keychain to store LLM Provider access tokens (e.g. GitHub Copilot, Claude, etc.). Since I’m running Goose in Ubuntu, it means that Goose uses the [GNOME keyring](https://wiki.gnome.org/Projects/GnomeKeyring). Ordinarily, this wouldn’t be an issue, BUT, since I chose to run this in a dev container, it meant that I made life harder on myself. 😭 It turns out that dev containers + keyrings + Goose no workie out of the box.

After a bunch of StackOverflow and circular conversations with Microsoft Copilot, it came down to having to install the packages below:

sudo apt update && sudo apt install -y \\\
gnome-keyring \\\
dbus-x11 \\\
libsecret-1-0 \\\
libsecret-1-dev \\\
libsecret-tools

These packages are required for getting GNOME keyring to run. It in urn requires [D-Bus](https://en.wikipedia.org/wiki/D-Bus) to run. D-Bus is a communication system used by the `[gnome-keyring-daemon](https://wiki.gnome.org/Projects%282f%29GnomeKeyring%282f%29RunningDaemon.html)` for secrets store and access by various applications. There’s a tool called `[dbus-launch](https://dbus.freedesktop.org/doc/dbus-launch.1.html)`, which starts a D-Bus session bus. Without `dbus-launch`, the `gnome-keyring-daemon` won’t run properly, meaning:

* Your secrets store and access no workie, so
* Goose can’t store or access your LLM Provider tokens, which means
* You won’t be able to select a Model for your LLM Provider, which means
* Goose no workie

Ouch.

But, that’s not all. Because even after installing all that, I still needed to start D-Bus and the `gnome-keyring-daemon`. Many hours and tears later, I got things working after doing the following:

1. Created a directory called `keyrings`, in `~/.local/share`, because for some reason, it was missing. 😭
2. Recreated the keyring manually: `touch ~/.local/share/keyrings/login.keyring`
3. Launched D-Bus manually: `eval $(dbus-launch)`.
4. Exported the D-Bus environment variable, `$DBUS_SESSION_BUS_ADDRESS`, so that other programs (i.e. Goose) can connect to it: `export $(dbus-launch)`
5. Started they keyring: `gnome-keyring-daemon — start — components=secrets`

I also needed to enable [IPC](https://en.wikipedia.org/wiki/Inter-process_communication) locking in my `devcontainer.json`, as it is required by the GNOME keyring. This ensures that you don’t end up with process contention between the host machine (my MacBook, in this case), and the dev container. To do this, I added the following snippet to `[devcontainer.json](https://github.com/avillela/ai-sre-workflow-demo/blob/d504a9335c546254010e392390abe7fe71d05853/.devcontainer/devcontainer.json)`(see [lines 26–31](https://github.com/avillela/ai-sre-workflow-demo/blob/d504a9335c546254010e392390abe7fe71d05853/.devcontainer/devcontainer.json#L26-L31)):

"runArgs": \[\
"--init" // Recommended for proper process management\
],\
"capAdd": \[\
"IPC\_LOCK"\
],

Unfortunately, that wasn’t enough. Because I was getting this error when attempting to start the GNOME keyring:

couldn't connect to dbus session bus: Cannot spawn a message bus when setuid

It turns out that I needed to unlock the `gnome-keyring-deamon`. If you’re wondering, “WTF is going on here?”, then you’re in good company. Because, how could I unlock something that I \*just\* created in the first place? You and me both, my friend. You and me both.

To unlock the keyring, I had to run this command:

echo "blah" | gnome-keyring-daemon -r --unlock --components=secret

Which did the following:

* Restarted the `gnome-keyring-daemon` (`-r` flag)
* Unlocked the keyring (`--unlock` flag)
* Started only the secrets component of the keyring (`--components==secret flag`)

BUT…it expects a password to be provided via `stdin`. Since we \*just\* created the keyring (remember `touch ~/.local/share/keyrings/login.keyring`?), we can set that password to whatever we want. Which, in my case, was `“blah”`. Feel free to us whatever your want.

So, to summarize, before you can configure your LLM Provider in Goose, you need to run the following after installing GNOME keyring and D-Bus:

mkdir -p \~/.local/share/keyrings\
touch \~/.local/share/keyrings/login.keyring\
eval $(dbus-launch)\
export $(dbus-launch)\
gnome-keyring-daemon --start --components=secrets\
echo "blah" | gnome-keyring-daemon -r --unlock --components=secret

Which gives you the following output (yours may vary slightly):

GNOME\_KEYRING\_CONTROL=/home/vscode/. cache/keyring-KEVID3\
\*\* Message: 15:06:58.771: Replacing daemon, using directory: /home/vscode/. cache/keyring-KEVID3\
GNOME KEYRING CONTROL=/home/vscode/. cache/kevrina-KEVTD3

SUCCESS!

So now we’re ready to configure our LLM Provider again. To do that, run `goose configure`, and follow the same steps as before. This time, it things should work, and you should get this:

![Terminal screenshot showing GitHub Copilot setup in Visual Studio Code. The user configures the “goose-configure” option, selects “GitHub” as the provider, and is prompted to authenticate via OAuth device code flow by visiting github.com/login/device and entering a partially visible code. Authentication succeeds, followed by a “Model fetch complete” message. The user is then prompted to choose between GPT-3.5 and GPT-4 (recommended).](https://cdn-images-1.medium.com/max/800/1*-Cu1jeFHMCnz6JzIWTT_oQ.png)

Which finally allowed me to select my Model. In my case `[gpt-4o](https://en.wikipedia.org/wiki/GPT-4o)`.

![Terminal screenshot showing configuration of the “goose” tool in Visual Studio Code. The user is prompted to edit an existing config file at /home/vscode/.config/goose/config.yaml, selects “GitHub” as the provider, and authenticates using GitHub Copilot token via OAuth device code flow. After successful authentication and model fetch, the user selects “Auto” mode. Final messages confirm configuration check and successful save.](https://cdn-images-1.medium.com/max/800/1*Xy6P2i05rn6MBM1gwJB7Vg.png)

Success at last! You can see the full configuration file in `[post-create.sh](https://github.com/avillela/ai-sre-workflow-demo/blob/main/.devcontainer/post-create.sh)` in my GitHub repo.

Once you successfully configure Goose, it creates a configuration file called `config.yaml`, located under `~/.config/goose`, which contains the LLM Provider and model that you just configured:

GOOSE\_MODEL: gpt-4o\
GOOSE\_PROVIDER: github\_copilot

[Goose Extensions](https://block.github.io/goose/docs/getting-started/using-extensions/) also get added to this file, but that’s another topic for my next post.

#### Starting Goose

You are now finally ready to play around with Goose. To test it out, start Goose:

goose session

Which will look something like this:

![Terminal window showing Goose AI orchestration session initialized in /workspaces/ai-orchestration-playground using github\_copilot and gpt-4o. Session logs to a JSON file; token usage is 0%. Prompt at bottom reads: “Press Enter to send, Ctrl+J for new line.”](https://cdn-images-1.medium.com/max/800/1*NBOMIfBd3bi0_605_6fFuA.png)

And ask it a question. I asked it, “Tell me about MCP servers”. Here’s the output I got:

![Screenshot of a Visual Studio Code window displaying a markdown file titled “goose session” in the directory workspace/director-testing-playground/development. The file explains the term “MCP” in Minecraft server contexts, detailing three meanings: modded Minecraft servers using the Coder Pack, categorized server lists, and Multi-Channel Protocol as a broader communication protocol. Content is organized with headings and bullet points.](https://cdn-images-1.medium.com/max/800/1*qzTrT7zEcgVEw7VzekbZeQ.png)

We’re not ready to do anything fancy yet, like have Goose interact with file system. We’ll need to configure Extensions (MCP servers) for that. That’s for next time.

### Gotchas

I wish I could say that the keyring stuff was the end of my troubles, but alas, it wasn’t. I’m not sure if the issues I encountered are a Goose thing or a dev containers + Goose thing, but they’re worth mentioning, in case you run into them as well.

#### Error #1

ERROR goose::session::storage: Failed to generate session description: Authentication error: Authentication failed. Please ensure your API keys are valid and have the required permissions. Status: 401 Unauthorized

To fix it, I simply deleted the Goose configuration directory:

rm -rf \~/.config/goose

And re-ran `goose configure` to set up GitHub Copilot again. Painful and annoying, I know. If you encounter a nicer workaround, let me know!!

#### Error #2

ERROR goose::session::storage: Failed to generate session description: Execution error: failed to get api info after 3 attempts

Never fear! Just run this, and you’ll be good to go:

rm -rf \~/.local/share/keyrings\
mkdir -p \~/.local/share/keyrings\
touch \~/.local/share/keyrings/login.keyring\
eval $(dbus-launch)\
export $(dbus-launch)\
gnome-keyring-daemon --start --components=secrets\
echo "blah" | gnome-keyring-daemon -r --unlock --components=secret

goose configure

Basically you have to restart the GNOME keyring, restart D-Bus, and unlock the keyring, and re-run `goose configure`, like we did on initial setup. Again, annoying, but it fixes the issue. I’m open to a better way of fixing this error!

### Final thoughts

Getting Goose to run in a dev container on my local machine took an entire long, long day. I learned more about the GNOME keyring than I ever wanted to. To be honest, I’m not sure how my brain managed to cobble all of this information together into a workable solution, but I credit my persistence and determination to not be defeated by tech for my success. Microsoft Copilot definitely helped a lot too!

Anyway, I hope that this helps you out, should you ever decide to run Goose in a dev container on your machine. And even if that’s not your use case, this also comes in handy for any application running inside a dev container that needs to use the GNOME keyring.

If you’d like to learn more about the stuff that I did with Goose, stay tuned for the next post in the series.

And now, I’ll leave you with this lovely photo of Katie, poking her head out of a tissue box.

![Close-up of a brown rat nestled in shredded paper and bedding materials. The rat’s face is visible with dark eyes, long whiskers, and rounded ears. Surrounding debris includes green, white, and multicolored paper fragments, along with black foam-like pieces, suggesting a cozy, possibly domestic nesting environment.](https://cdn-images-1.medium.com/max/800/1*T03kiR3OHVwLTcxaAu9K7w.jpeg)

Hello from Katie! Photo by author.

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [October 3, 2025](https://medium.com/p/191950864090).

[Canonical link](https://medium.com/@adri-v/running-codename-goose-in-a-dev-container-191950864090)

Exported from [Medium](https://medium.com) on June 3, 2026.
