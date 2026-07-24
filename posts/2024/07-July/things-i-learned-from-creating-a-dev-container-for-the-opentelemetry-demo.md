---
title: "Things I Learned from Creating a Dev Container for the OpenTelemetry Demo"
slug: things-i-learned-from-creating-a-dev-container-for-the-opentelemetry-demo
description: "Dev container gotchas that you might not have known"
added: "Jul 23, 2024"
tags:
  - technical
  - devcontainers
  - opentelemetry
---


![Canada geese flying in a v-shape overhead](https://cdn-images-1.medium.com/max/800/1*CpVpfsFSOSnoIXu0Au4o4w.png)

Flock of Canada geese flying overhead. Photo by [Adriana Villela](https://adri-v.medium.com).

It all started because I wanted to contribute some content to [OpenTelemetry](https://opentelemetry.io) (OTel). I had recently gotten the [OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) running on [GitHub Codespaces](https://docs.github.com/en/codespaces/overview) and [blogged about how I did it](https://adri-v.medium.com/how-to-run-the-opentelemetry-demo-in-github-codespaces-ccdb5b6512f8). In addition, I wanted [to contribute this learning back to OTel](https://adri-v.medium.com/sharing-is-caring-how-to-be-a-good-open-source-citizen-97e2e1206e89), either as an [OTel blog post](https://opentelemetry.io/blog) or as part of the [OTel docs](https://opentelemetry.io). So I [opened an issue](https://github.com/open-telemetry/opentelemetry.io/issues/4725) to get some feedback on next steps.

That’s when one of the Demo maintainers, [Juliano Costa, made an intriguing suggestion](https://github.com/open-telemetry/opentelemetry.io/issues/4725#issuecomment-2200403706): rather than make this vendor-specific (i.e. GitHub Codespaces), would it be possible to create a [development (dev) container](https://containers.dev/) definition instead? I loved this for a few reasons. First off, I love that the OTel Community is so very thoughtful (and politely nudging) about keeping things vendor-neutral. Secondly, what a great way to learn more about dev containers! Finally, having a dev container available for the OTel Demo could lower the barrier for contributing to the Demo, since folks wouldn’t have to spend a ton of time trying to get their development environments set up. Win win!

So…challenge accepted!

Now, I know that there are tons of “intro to dev containers” blog posts and tutorials out there, and this isn’t one of them. Instead, I wanted to highlight some interesting things that I’ve learned as part of my little experiment.

Also, if you want to see what my `devcontainer.json` looks like for the OpenTelemetry Demo, you can check it out [here](https://github.com/avillela/opentelemetry-demo/blob/avillela-add-devcontainer/.devcontainer/devcontainer.json).

Are you ready? Let’s do this!

### Dev Container Learnings

#### Dev containers configuration

Dev containers are defined using a JSON file called `devcontainer.json`, which resides in a folder in the root of your repo called `.devcontainer`. When launching a dev container, your dev container tool looks for `devcontainer.json` inside of the `.devcontainer` folder.

my-app/  
├─ .devcontainer/  
│  ├─ devcontainer.json  
...

But what if you want to have multiple dev container configurations for the same repo? No problem! You simply create a different folder for each dev container, like this:

my-app/  
├─ .devcontainer/  
│  ├─ workspace-1/  
│  │  ├─ devcontainer.json  
│  ├─ workspace-2/  
│  │  ├─ devcontainer.json  
...

But what are the valid properties for `devcontainer.json`? You can find that in the dev containers [JSON reference](https://containers.dev/implementors/json_reference/). Be sure to bookmark it!

#### Running dev containers on ARM architectures locally

If you’re running your dev container locally using the [VSCode Dev Container plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) and have an [Apple Silicon Mac](https://en.wikipedia.org/wiki/Apple_silicon) (which uses the [ARM architecture](https://en.wikipedia.org/wiki/ARM_architecture_family)), you will notice that your dev container will fail on startup. It’s looking for an arm64 version of the base Docker image, which doesn’t exist, because [there isn’t native dev container support for ARM architectures](https://stackoverflow.com/questions/66493499/how-to-get-arm-docker-images-when-creating-devcontainer-is-vs-code-mac-m1). In order to get around this, you’ll need to pull the amd64 version of the base image yourself before starting up your dev container. For example, if your base image is `mcr.microsoft.com/devcontainers/base:ubuntu`, you would have to run the following command before launching your dev container locally for the first time:

docker pull --platform linux/amd64 mcr.microsoft.com/devcontainers/base:ubuntu

#### Dev containers image & feature registry

Not sure what base image to use? For a full list of available dev container images, check out the [image registry](https://mcr.microsoft.com/en-us/catalog?search=devcontainers). If you’re curious to see what goes into the various images, you can check out the [dev containers image GitHub repository](https://github.com/devcontainers/images/tree/main/src). It’s actually quite a useful repo to bookmark, because it also gives you examples of advanced `devcontainer.json` configurations.

If you would like to add more capabilities to your base image, you can do so by adding individual [features](https://containers.dev/implementors/features/) to your `devcontainer.json`. For example, if you want to be able to run Docker _within_ your dev container, you can just add the following feature to `devcontainer.json`:

"features": {  
    "ghcr.io/devcontainers/features/common-utils:2": {  
        "version": "latest"  
    }  
}

For a full list of available features, check out the [dev container feature registry](https://containers.dev/features).

#### Using the VSCode Dev Containers plugin

The easiest and quickest way to test your dev container is on your local machine. If you’re using [VSCode](https://code.visualstudio.com/), you can do this using the [VSCode Dev Containers plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers). This plugin allows you to run your dev container in VSCode using [Docker](https://docker.com).

When I set up my `devcontainer.json`, I set the following machine specs:

"hostRequirements": {  
  "cpus": 4,  
  "memory": "16gb",  
  "storage": "32gb"  
},

I set these requirements with the intention of running the dev container in Codespaces, and these were the beefiest machine specs at my disposal for my GitHub account.

But when I try to [run my dev container locally using the VSCode Dev Containers plugin](https://code.visualstudio.com/docs/devcontainers/tutorial), I get this warning message:

![Screen shot showing the message: “Not all host requirements in devcontainer.json are met by the Docker daemon.”](https://cdn-images-1.medium.com/max/800/1*Yf7m7U15z8h9qmL-kE76Rw.png)

It turns out that I had allocated 3 CPUs and 9.23GB RAM to my local Docker instance, which is lower than what I had specified as the minimum machine requirements for my dev container.

Not a problem, because it’s not necessarily a deal-breaker. You can still run the dev container; however, your dev container may not be as performant, so keep that in mind. You can bypass that warning by clicking on the `Continue` button, to get you on your merry way.

> **NOTE:** _If you want know what your local Docker settings are, you can run the_ `_docker info_` _command. Among other things, it will list your configured memory and CPU allocations. If you’d like to change these settings, check out the instructions in the Docker docs for_ [_Mac_](https://docs.docker.com/desktop/settings/mac/)_,_ [_Linux_](https://docs.docker.com/desktop/settings/linux/)_, and_ [_Windows_](https://docs.docker.com/desktop/settings/windows/)_._

#### Local dev containers and Docker in Docker

When you create a new GitHub Codespace from the [UI](https://github.com/codespaces) (or the [GitHub CLI](https://cli.github.com/)), you can select from a number of [existing templates](https://github.com/codespaces/templates). When [I ran the OTel Demo in GitHub Codespaces](https://adri-v.medium.com/how-to-run-the-opentelemetry-demo-in-github-codespaces-ccdb5b6512f8), I used a template called “Blank”, because it contains a bunch of tools and language runtimes, including Docker. The language runtimes are useful for doing development for the Demo within the dev container. And I needed Docker (i.e. you are running [Docker in Docker](https://shisho.dev/blog/posts/docker-in-docker/)) in order to run the OpenTelemetry Demo, which [runs using Docker Compose](https://opentelemetry.io/docs/demo/docker-deployment/). (Aside: [the Demo can also run on Kubernetes](https://opentelemetry.io/docs/demo/kubernetes-deployment/).)

As far as I know, there’s no way to export a Codespace configuration into a `devcontainer.json` 😭, so I had to do a bit of digging around to figure out what base image to use from the [Dev Containers Image Registry](https://mcr.microsoft.com/en-us/catalog?search=devcontainers). I finally landed on the [Universal Development Container Image](https://mcr.microsoft.com/en-us/product/devcontainers/universal/tags), which seemed to be a match.

So I created my `devcontainer.json`:

{  
    "image": "mcr.microsoft.com/devcontainers/universal:dev-linux",  
    "hostRequirements": {  
      "cpus": 4,  
      "memory": "16gb",  
      "storage": "32gb"  
    }  
  }

Short and sweet.

I ran it in GitHub Codespaces, and guess what? It totally worked! Awesome! And then I ran it locally. Can you guess where this story is going?

The dev container built successfully and I was able to launch it. BUT when I ran `docker compose up` to start up the Demo, I got an error saying that Docker wasn’t running. Huh?

Docker was installed, but the Docker daemon wouldn’t start up, no matter how hard I tried (and Googled). After a bit more Googling, I decided to try something different. I changed my starging image to a bare-bones Ubuntu image, `mcr.microsoft.com/devcontainers/base:ubuntu`, and added a Docker feature. So then my `devcontainer.json` looked like this:

{  
    "name": "default",  
    "image": "mcr.microsoft.com/devcontainers/base:ubuntu",  
    "features": {  
      "ghcr.io/devcontainers/features/docker-in-docker:2": {}  
   },  
    "hostRequirements": {  
      "cpus": 4,  
      "memory": "16gb",  
      "storage": "32gb"  
    }  
  }

That did the trick — it worked both locally and in GitHub Codespaces. Success!

That was a good start, but it wasn’t the final `devcontainer.json` that I ended up with. Since I couldn’t use the [Universal Development Container Image](https://mcr.microsoft.com/en-us/product/devcontainers/universal/tags) as-is due to that weird [Docker in Docker](https://shisho.dev/blog/posts/docker-in-docker/) mess, I did the next best thing: I found the `[devcontainer.json](https://github.com/devcontainers/images/blob/main/src/universal/.devcontainer/devcontainer.json)` [for the Universal image](https://github.com/devcontainers/images/blob/main/src/universal/.devcontainer/devcontainer.json) and added most of the configs from there into [my own](https://github.com/avillela/opentelemetry-demo/blob/avillela-add-devcontainer/.devcontainer/devcontainer.json) `[devcontainer.json](https://github.com/avillela/opentelemetry-demo/blob/avillela-add-devcontainer/.devcontainer/devcontainer.json)`. That seemed to do the trick!

And yes, before you think, “Well, that seems excessive”, I admit that I probably threw everything but the kitchen sink at it, so the dev container will need some tweaking in the near future. 😁

#### Creating a GitHub Codespace without a dev container definition

First things first: it’s important to know that behind the scenes, a GitHub Codespace runs a [dev container](https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers); however, you don’t need to define a `devcontainer.json` in order to create a GitHub Codespace.

When you create a GitHub Codespace, Codespaces checks to see if you have a `.devcontainer` folder and corresponding `devcontainer.json`. If so, that will be used to create your Codespace. If you have multiple dev container definitions in your repo, it allows you to select which one to use.

If you don’t have a `devcontainer.json`, then no problem! You can create a Codespace using a pre-existing template provided by Codespaces, using either the [Codespaces UI](https://github.com/codespaces) or the [GitHub CLI](https://cli.github.com). Behind the scenes, it’s creating a dev container for you. As I said before, there doesn’t appear to be a way to export a Codespace configuration into a `devcontainer.json`. It’s a shame, because you could use that as a starting point to build your own `devcontainer.json` your Codespace, and then take that config and run your dev container anywhere you can run dev containers. Maybe GitHub don’t want you to do that so that you’re stuck running it in Codespaces. 🙃

#### Pre-building Codespaces

When you first bring up a dev container, you need to build it. After all, you are defining a Docker image behind the scenes, and before you can use it, you have to build it first. Fortunately, once it’s built, you just reuse the image. Which is a good thing. Because dev containers can sometimes be big. In fact, the one that I’ve been working on for the OTel Demo is a beast and takes a veeeery long time to build.

When I first ran my OTel Demo dev container in GitHub Codespaces, I noticed that my workspace was taking a _really_ long time to come up. When I created my Codespace sans `devcontainer.json`, my workspace came up pretty quickly. Whyyyy??

Well, it turns out that by default, when you start up a Codespace à la `devcontainer.json`, it rebuilds the image EVERY. SINGLE. TIME. OUCH. 😣 Running a Codespace sans `devcontainer.json`, however, uses a pre-built image, which is why it bootstrapped quicly.

Fortunately, you can use [Codespaces pre-builds](https://docs.github.com/en/codespaces/prebuilding-your-codespaces) to get around this. A pre-build is a type of GitHub Action that builds your dev container. The dev container build can be triggered by one of the following events:

*   Every time you push any change to your repository
*   Every time you push changes _only_ to your dev container configs
*   On a given schedule (e.g. nightly at 21:00)

As I noted earlier, pre-builds aren’t turned on automagically, so you have to set them up yourself. Fortunately, [setting up a pre-build is fairly straightforward](https://docs.github.com/en/codespaces/prebuilding-your-codespaces/about-github-codespaces-prebuilds). I set up my pre-build to trigger only when my dev container configs changed, and it definitely sped things up significantly, so I highly recommend it!

> **NOTE:** _If you run out of your Codespaces quota for the month, your pre-builds will be disabled. You need to either wait for it to reset next month, or pay up._

![Screen shot showing the following message: “Prebuilds are currently disabled because you’ve reached your Codespaces included usage for this period. You can adjust it in billing settings.”](https://cdn-images-1.medium.com/max/800/1*3n2Lej_uSEF-4L6X5c6cuw.png)

### Final Thoughts

When I first took on the challenge of turning my Codespace into a dev container, I thought that I would have it done in no time. Ha! I should’ve known better. Experience has taught me that that’s never the case. Still, I’ve loved every minute of this challenge, because I’ve learned so many new things, and I get to share my learnings with y’all!

This little exercise has taught me the true power of dev containers. Having portable, pre-configured dev environments that run anywhere? That’s living the developer’s dream. No more of that “works on my machine” crap…we hope!

I had originally planned to include some cool learnings on running dev containers in [DevPod](https://devpod.sh), but this post was already running pretty long, so I won’t do that do you. You can catch the post about DevPod [here](https://adri-v.medium.com/things-i-learned-about-devpod-after-obsessing-over-it-for-a-week-678c71148793).

And now, I shall reward you with a photo of my rat Katie, who looks like she’s looking for a treat. 😁

![Brown rat sitting in a beige fuzzy hammock, looking straight at the camera](https://cdn-images-1.medium.com/max/800/1*29ZTmeh29fiDCjmBMvnRiA.png)

Photo by [Hannah Maxwell](https://instagram.com/old_fashion_glazed).

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [July 23, 2024](https://medium.com/p/9535ae8621ce).

[Canonical link](https://medium.com/@adri-v/things-i-learned-from-creating-a-dev-container-for-the-opentelemetry-demo-9535ae8621ce)

Exported from [Medium](https://medium.com) on June 3, 2026.