---
title: "Running Dev Containers Locally with Podman & VSCode"
slug: running-dev-containers-locally-with-podman-vscode
description: "Running Podman in a Docker World"
added: "Dec 06, 2024"
tags:
  - technical
  - docker
  - devcontainer
---



![A vibrant red and yellow maple leaf with intricate vein patterns lies on a textured grey concrete surface. Scattered around are small, yellow, elliptical leaves and thin twigs, contrasting with the maple leaf’s distinct shape and coloration.](https://cdn-images-1.medium.com/max/800/1*2XUbV42RE9ZypFyX4lO-6w.jpeg)

Photo by [Adriana Villela](https://adri-v.medium.com).

I have recently found myself in a situation whereby I needed to run [Podman](https://podman.io) on my local development environment, in lieu of [Docker](https://docker.com). This was a bit of a change and a challenge for me, because I’ve been using Docker since about 2016 or so.

But hey. With great challenges come great learnings, and I am always down to learn cool stuff. So, if you’re looking to start using Podman or have started using Podman and would like a little bit of guidance, stick around!

### A bit about Podman

A bit of background for the uninitiated (like me). Podman is an open source container management tool created by [Redhat](https://redhat.com). It plays nice with Windows, Linux, and Mac. It has a number of [commands](https://docs.podman.io/en/stable/Commands.html) similar to the ones that you know and love from Docker, such as `podman run`, `podman rmi`, `podman images`. It even has a nice little desktop manager called [Podman Desktop](https://podman-desktop.io), similar to [Docker Desktop](https://www.docker.com/products/docker-desktop/).

What it does’t have is the price tag that comes with Docker. In a nutshell: Docker is free for personal use, and smaller orgs, but you do you have to shell out the money if you’re a big org and want to use Docker for non-commercial purposes, and some companies might not want to pay that extra money if they were used to getting Docker for free in the Before Times. 💰💰💰 Totally understandable. If you’re curious, you can get more info on Docker pricing [here](https://www.docker.com/pricing/faq/). Podman, on the other hand, is open source and freeeeeeee.

### Installing & Running Podman

Note that the instructions below apply to Mac useres. For Linux and Windows, check out the instructions [here](https://podman.io/docs/installation).

As a Mac user, there are 2 ways to install Podman. You can download and run the [installer](https://podman.io), or if you use [Homebrew](https://brew.sh), you can run:

brew install podman  
brew install --cask podman-desktop

> 🚨**NOTE:** _If you go the Homebrew route, you’ll need to install Podman and Podman Desktop separately. Also, keep in mind that this is_ [not _the recommended way to install Podman on Mac_](https://podman.io/docs/installation#macos)_, since it is community-maintained. Do so at your own risk. PS: I did it and lived to tell the tale._

Podman also has [Podman Compose](https://podman-desktop.io/docs/compose), which is similar to [Docker Compose.](https://docs.docker.com/compose/) This isn’t enabled by default. If you’d like to install `podman compose`, check out the instructions [here](https://podman-desktop.io/docs/compose/setting-up-compose). Or, you can install it via Homebrew:

brew install podman-compose

Once Podman has been installed, you need to create and start your Podman machine:

podman machine init  
podman machine start

Why? Because under the covers it’s running a Linux VM to run your containers. Much like [Docker Desktop does](https://docs.docker.com/desktop/features/vmm/#:~:text=The%20Virtual%20Machine%20Manager%20%28VMM,options%20in%20Docker%20Desktop%27s%20settings.). The `init` command downloads the Podman machine image, and the `start` command starts it up so that you can start building and running your containers. You can’t use Podman until you run the above two commands.

As I mentioned before, Podman has its own CLI, and many of the commands are similar to what you get with Docker. If you want to avoid the mental switchover from `docker run` to `podman run`, you can spare retraining your brain with a little trick — creating shell script `docker` alias for `podman`:

sudo tee -a bleh.sh <<EOF  
 #!/bin/bash  
 exec podman "\\$@"  
EOF  
  
sudo chmod +x /usr/local/bin/docker

> **NOTE:** _Credit where credit is due. I grabbed the above (and made a couple of changes) from_ [_this blog post_](https://blog.okikio.dev/from-docker-to-podman-vs-code-devcontainers#heading-step-3-create-a-shell-script)_._

I’ve tried this out myself, and I have to say that so far, it works pretty nicely. I haven’t hit any Docker-to-Podman CLI translation issues. It also seems to work for `docker compose`. Fingers crossed that it all stays that way! 🤞

### Podman and VSCode

Now that Podman is installed and running, it’s time to get it set up to run with [Development (Dev) Containers](https://containers.dev/) in VSCode. If you’re on a Mac and are setting up VSCode from scratch, you can run these commands:

\# Install VSCode using Homebrew  
brew install --cask visual-studio-code  
  
\# Install the VSCode Dev Containers extension  
code --install-extension ms-vscode-remote.remote-containers

Once you’ve installed the Dev Containers plugin, you also need to make sure that the Dev Containers plugin is pointing to Podman, and not Docker. To do this, you’ll need to open up your VSCode settings. On the Mac, the settings can be found under `$HOME/Library/Application Support/Code/User/settings.json`. Check out the [VSCode docs](https://code.visualstudio.com/docs/getstarted/settings#_settings-json-file) for its location on other systems.

Inside `settings.json`, look for the setting `dev.containers.dockerPath`, and set its value to `“podman”`, as per below:

"dev.containers.dockerPath": "podman",

If you want to get fancy, you can try to replace the _existing_ setting using the [sed](https://www.geeksforgeeks.org/sed-command-in-linux-unix-with-examples/) command on VSCode. The command below won’t work if the setting doesn’t exist, and if you’re using an operating system other than MacOS, your location may be a little different:

sed -i -e 's/"dev.containers.dockerPath": "docker"/"dev.containers.dockerPath": "podman"/g' $HOME/Library/Application\\ Support/Code/User/settings.json

Regardless of how you make the change, be sure to restart VSCode after updating `settings.json`.

> **NOTE:** _If you used created the_ `_docker_` _alias for the_ `_podman_` _command in the Installation section above, you can get away with not needing to make this change. That being said, I prefer to err on the side of caution and point to the Podman executable directly, just in case._

But we’re not done just yet, my friend! If you’re running Docker-in-Docker in your Dev Container (as I often do, so that I can run KinD in my Dev Container), you’ll also need to ensure that you add the following lines to your Dev Container JSON:

"remoteEnv": {  
    "PODMAN\_USERNS": "keep-id"  
},  
"containerUser": "vscode"

This is what the above lines look like in my complete`devcontainer.json` files:

For more info on using the VSCode Dev Containers plugin with Podman, check out the [VSCode docs](https://code.visualstudio.com/remote/advancedcontainers/docker-options#_podman). I also found [this GitHub issue](https://github.com/microsoft/vscode-remote-release/issues/7657#issuecomment-2468346230) helpful and used the configuration snippet from there.

### Gotchas

Before we wrap things up I’d like to share a few gotchas that I encountered on my Podman with VSCode journey.

#### Resource Allocation

I have a really really really beefy machine, and I was really scratching my head over the fact that when I first tried to run my Dev Containers a) my Dev Container images were taking FOREVER to build and b) once inside the Dev Container, things were suuuuuper slow.

I finally realized the culprit: I hadn’t allocated sufficient machine resources to Podman. In fact, I hadn’t edited my resource allocations at all since I installed Podman. The main culprit was memory allocation: only 2GB RAM had been allocated to Podman, which was a very very very small percentage of the memory that I had available to allocate, and also woefully inadequate in general. You can also tweak the CPU and Disk Size Settings.

To view your settings go to `Settings > Resources` in Podman Desktop:

![A screenshot of a computer interface showing the ‘Settings’ menu with options like Resources, Proxy, and Authentication. The main panel displays ‘Podman Machine’ status, running with an endpoint ‘unix:///var/folders/…/podman.sock’. CPU usage is at 7% (0.37 GB) and memory usage is around 25% (4.83 GB). The bottom right corner shows ‘Podman 3.4.1 — OCI (Default Apple Hypervisor)’.](https://cdn-images-1.medium.com/max/800/1*QDO_9SSXaKAkKLe-YjQcZw.png)

Podman Desktop Resources configuration screan

Or, if you’re like me and want to know where the configuration files are, you can find this info in the `podman-machine-default.json` file located in `$HOME/.config/containers/podman/machine/applehv` on Mac. More information on `podman-machine-default.json` and its location on other systems can be found [here](https://docs.podman.io/en/stable/markdown/podman-machine.1.html).

The resources configuration section looks like this:

"Name": "podman-machine-default",  
"Resources": {  
    "CPUs": 7,  
    "DiskSize": 100,  
    "Memory": 43869,  
    "USBs": \[\]  
},

Which, as you can see, matches up with what I have in the Podman Desktop screenshot above.

#### Extension Host Terminated Unexpectedly

After I finally got my Dev Containers up and running, I kept periodically getting the following pop-up message in VSCode from within my Dev Container: `Extension host terminated unexpectedly`. Which meant that my Dev Container environment kept cutting out _all the time_ and I couldn’t get any actual work done. Very frustrating.

I eventually made the error go away, but I don’t know if it was related to two culprits or one, because it was also happening at around the time that I noticed my woefully inadequate resource allocations for Podman. So bumping my resources may have fixed it.

But there’s also another possibility, which was described in [this StackOverflow post](https://stackoverflow.com/questions/46457994/receiving-error-message-extension-host-terminated-unexpectedly-in-visual-stud): there may have been a VSCode extension (or two or three or…) that was causing problems too. The easiest course of action is to just disable each extension one by one (except the Dev Container one!!) until the the problem appears to be resolved. The other option, as one user suggested, is to [run the Extension Bisect Utility](https://code.visualstudio.com/blogs/2021/02/16/extension-bisect), which helps speed up the extension troubleshooting process.

#### My Dev Container was failing to build!!

This one hit me just this morning. I had built a Dev Container last week. It was working fine. I thought that I had made no changes since I’d built it last week. (Ha! Famous last words!) Then I rebuilt it from scratch today, just to make sure that things were still working smoothly, and then…I ended up this nasty error saying that VSCode couldn’t build my Dev Container because it was failing to install the [Docker in Docker](https://github.com/devcontainers/features/tree/main/src/docker-in-docker) feature.

Feature "Docker (Docker-in-Docker)" (ghcr.io/devcontainers/features/docker-in-docker) failed to install! Look at the documentation at https://github.com/devcontainers/features/tree/main/src/docker-in-docker for help troubleshooting this error.

I’ll be honest — I tried a few things, because I was bordering on desperation and frustration so early on a Friday morning.

1- Pruned my volumes

podman system prune --volumes -af

2- Removed dangling images

podman image prune -f

3- Restarted Podman

podman machine stop  
podman machine start

**And when all else failed, I rebooted my computer.**

While I think that each of those things was helpful in their own right, after playing around a bunch, I think I’ve narrowed the issue to the true culprit: how I defined my [docker-in-docker feature](https://github.com/devcontainers/features/tree/main/src/docker-in-docker) in my `devcontainer.json`:

"ghcr.io/devcontainers/features/docker-in-docker:2": {  
    "version": "2.12.0",  
}

I thought I was being smart by locking down the version. Leaving out a `version` altogether is equivalent to setting `“version”: “latest”`, and that’s generally not a good practice. But alas, setting the version is exactly what was causing me problems.

So I just went with the feature configuration below, and that did the trick:

"ghcr.io/devcontainers/features/docker-in-docker:2": {  
    "version": "latest",  
}

To be sure that there was no additional funky business, I made sure to build my Dev Container in VSCode using the `Dev Containers: Rebuild Without Cache and Reopen in Container`” option:

![A screenshot of a computer interface showing the ‘Settings’ menu with options like Resources, Proxy, and Authentication. The main panel displays ‘Podman Machine’ status, running with an endpoint ‘unix:///var/folders/…/podman.sock’. CPU usage is at 7% (1037.6 MB) and memory usage is around 25% (4489 GB). The interface has a dark mode color scheme with purple accents.](https://cdn-images-1.medium.com/max/800/1*j0GtkbJPvohqcOtxo4nmnA.png)

Rebuild Dev Containers Without Cache option in VSCode

I suspect that if you encounter similar issues with other [Dev Container features](https://containers.dev/features), try leaving out the feature’s version to see if that helps fix things.

### Final Thoughts

Moving from Docker to Podman was overall a pretty good experience once you get over some of those initial hiccups and gotchas. Some of the gotchas have to do with Dev Containers themselves — not related at all to Podman or Docker, which always adds to the joy. The good news is that you’ve got some info at your fingertips now, so hopefully your transition from Docker to Podman is much smoother than mine.

This experience has definitely made a convert out of me, and a week into using Podman, I’d say that I got comfortable with it pretty quickly. Not too shabby!

With that, I will leave you with a photo of my more elusive rat Buffy (the Vampire Slayer), getting cuddles from my daughter.

![A close-up of a person’s lap, wearing a black hoodie with partially visible white lettering ‘INES.’ Two small rodents are resting on the lap: one nestled in the crook of the arm wearing a watch with a colorful band, and the other lying on a patterned blanket covering the legs. The scene highlights a cozy and caring interaction between the person and the small pets](https://cdn-images-1.medium.com/max/800/1*8VzpuPeGxFuB8KU8eoEjMg.jpeg)

Buffy comes out for a rare photo op.

Until next time, peace, love, and code! ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [December 6, 2024](https://medium.com/p/df16376350d3).

[Canonical link](https://medium.com/@adri-v/running-dev-containers-locally-with-podman-vscode-df16376350d3)

Exported from [Medium](https://medium.com) on June 3, 2026.