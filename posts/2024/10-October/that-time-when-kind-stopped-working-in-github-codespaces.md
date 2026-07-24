---
title: "That Time When KinD Stopped Working in GitHub Codespaces"
slug: that-time-when-kind-stopped-working-in-github-codespaces
description: "Sh*t Happens, But You Deal…"
added: "Oct 16, 2024"
tags:
  - technical
  - kubernetes
  - github-codespaces
  - devcontainers
---

# That Time When KinD Stopped Working in GitHub Codespaces

#### Sh\*t Happens, But You Deal…

![Sun’s rays peeking from behind fluffy clouds in late afternoon](https://cdn-images-1.medium.com/max/800/1*oRs6KtrJnpUnZ4a0I02QZw.png)

Sun peering behind clouds in late afternoon. Photo by [Adriana Villela](https://adri-v.medium.com).

A few weeks ago, [a user logged an issue](https://github.com/avillela/otel-python-lab/issues/4) against one of my GitHub repositories with the following error:

ERROR: failed to create cluster: failed to ensure docker network:   
command "docker network create -d=bridge   
\-o com.docker.network.bridge.enable\_ip\_masquerade=true   
\-o com.docker.network.driver.mtu=1500 --ipv6   
\--subnet fc00:f853:ccd:e793::/64 kind"   
failed with error: exit status 1   
Command Output: Error response from daemon:   
Failed to Setup IP tables:   
Unable to enable NAT rule:   
(iptables failed: ip6tables - wait -t nat   
\-I POSTROUTING -s fc00:f853:ccd:e793::/64 !   
\-o br-94ab107754dc -j MASQUERADE: ip6tables v1.8.4 (legacy):   
can't initialize ip6tables table nat':   
Table does not exist (do you need to insmod?)  
Perhaps ip6tables or your kernel needs to be upgraded

The repository in question is my [otel-python-lab](https://github.com/avillela/otel-python-lab) repository, which is the repository accompanying [my O’Reilly video course on Observability with OpenTelemetry](https://learning.oreilly.com/videos/-/0636920926597/). The code in this repository is meant to run in a Kubernetes cluster. In order to reduce headaches associated with setting up development environments, I made it so that you could run the whole thing in a [GitHub Codespace](https://github.com/features/codespaces). And yes, that meant running Kubernetes in a GitHub Codespace. My Kubernetes distribution of choice here was [KinD, or Kubernetes in Docker](https://kind.sigs.k8s.io/).

This setup never gave me any trouble before (famous last words), so imagine my surprise when this issue was opened and that it was very much reproducible. My heart sank. My setup was meant to reduce headaches, and here it was, causing new ones. I felt like I was letting people down. 💩

Time to suck it up and do some Googling. Try as I might, I could not get anything to work. I looked up how to update the Linux kernel. I looked up how to update IP tables. Spoiler alert: neither is a trivial task, and definitely not something to be sorted out within a couple of hours in between work tasks.

Time to think outside the box. I was using the GitHub Codespaces default image to run my setup. What if I built my own dev container instead? It wasn’t a terrible idea because folks would no longer be restricted to running the example in GitHub Codespaces. They could now have the option of running the dev container locally (e.g. using the [VSCode dev container plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)) if they wanted. Or remotely using a tool like [DevPod](https://devpod.sh/). And if I used a newer Linux image, wouldn’t I then have a newer version of the Linux kernel? Win-win. 🏆

Good news and bad news. The good news is that I successfully created the dev container, and was able to spin up the KinD cluster in the dev container. Yesssss. The bad news is that while it worked locally using the VSCode dev container plugin, it still did not work in GitHub Codespaces. 💩 💩

Still, not all was lost. At least folks could now run the example locally in a pre-configured development environment without pulling their hair. And yet, this didn’t change the fact that the original problem had not been solved. And that did not sit well with me. In fact, it was eating away at me in the back of my mind.

Time for another approach. I eventually decided to suck it up and [file an issue in the KinD repo](https://github.com/kubernetes-sigs/kind/issues/3748). To be honest, this seemed to be happening in GitHub Codespaces and not locally, so ideally I would have logged an issue against GitHub Codespaces. Unfortunately I couldn’t figure out where to log an issue for Codespaces for the life of me. (If someone knows where to do this, drop me a comment!!) So this was the next best thing.

[I got a very timely response](https://github.com/kubernetes-sigs/kind/issues/3748#issuecomment-2394490650) that stated:

> “The problem is ipv6 now being enabled in docker (so we don’t get the expected error that ipv6 is disabled) while not actually being functional. It’s not a codespaces specific issue, though IMHO codespaces should really either provide the relevant kernel modules or configure docker to disable ipv6.”

[A fix had been made to address the issue](https://github.com/kubernetes-sigs/kind/issues/3748#issuecomment-2397418630), so I tried it out. Unfortunately, that didn’t work. At least now I knew it was related to IPv6 being enabled in Docker, and that KinD no likie this. Was there something else that I could try on my end?

Perhaps there was a way to disable [IPv6](https://en.wikipedia.org/wiki/IPv6) in Docker globally? I tried following the instructions [here](https://docs.docker.com/engine/daemon/ipv6/), but, lo and behold, I couldn’t find any `/etc/docker/daemon.json` in my dev container image. Much less restart the services by running `sudo systemctl restart docker`. Aside: how the hell does the Docker daemon start in this damn thing then?! (Seriously though…does anyone know??)

Then I looked at the output of the error message. It was trying to create the following Docker network before creating the KinD cluster:

docker network create -d=bridge \\  
  -o com.docker.network.bridge.enable\_ip\_masquerade=true \\  
  -o com.docker.network.driver.mtu=1500 --ipv6 \\  
  --subnet fc00:f853:ccd:e793::/64 kind

What if I ran the above commend, but removed the `--ipv6` flag, and THEN tried to create the KinD cluster? So instead of running this to create the KinD cluster:

\# Create KinD cluster  
kind create cluster - name <cluster\_name>

I would do this:

\# Create networking  
docker network create -d=bridge \\  
  -o com.docker.network.bridge.enable\_ip\_masquerade=true \\  
  -o com.docker.network.driver.mtu=1500 \\  
  --subnet fc00:f853:ccd:e793::/64 kind  
  
\# Create KinD cluster  
kind create cluster - name <cluster\_name>

Well, turns out that that did the trick! So I pushed the changes to my repo and now folks can once again run the lab in GitHub Codespaces!

Since I came up with my workaround, [a new fix](https://github.com/kubernetes-sigs/kind/pull/3759) to address the issue has since been implemented. Until a new build comes out, you can apply it by building KinD from source:

\# Clone latest source  
git clone https://github.com/kubernetes-sigs/kind.git  
  
\# Build from source  
cd kind  
make install  
  
\# Make it executable  
chmod +x ./bin/kind  
sudo mv ./bin/kind /usr/local/bin/kind

This avoids having to manually create the docker network for KinD before creating the cluster.

### **Final Thoughts**

You might be wondering why I’ve bothered telling you about this workaround if, by the time you read this, a new fix is already in place to address the original issue. Well, because there are a few lessons to be learned here today.

**1- I relied too heavily on a specific technology (i.e. GitHub Codespaces) for my solution.** This whole experience forced me to create a dev container for my solution, with the specific capabilities that were required, rather than relying on a (likely bloated) image provided by GitHub Codespaces, which was also not portable. By creating a dev container definition, I freed folks from only being able to run this in GitHub Codespaces.

**2- It reinforced the importance of asking for help.** I sat there in my corner for a good couple of weeks off and on, spinning my wheels on this, and making no progress on the issue. I’m glad that I finally had the good sense to ask for help, even if I wasn’t sure if it was the right place to start. Sometimes you just need to take a chance and start somewhere. I’m glad I did.

**3- Dev containers aren’t quite as consistent as I thought they were.** I mean, they’re still a great tool and take a lot of frustration out of setting up development environments, but holy crap was it ever surprising to see this error show up in GitHub Codespaces and not locally, even though I was running the same devcontainer.json file in both cases.

I hope you’ve learned something not only about dev containers, but about troubleshooting as well!

And now I’ll leave you with a photo of my rat Katie Jr., hanging out in a Kleenex box.

![Light brown pet rat peering out of a pinkish-purplish Kleenex box.](https://cdn-images-1.medium.com/max/800/1*IxolPpEi5N-cSWnyiwxevQ.jpeg)

Katie Jr. is exploring a Kleenex box. Photo by [Adriana Villela](https://adri-v.medium.com).

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [October 16, 2024](https://medium.com/p/9cb5433ea589).

[Canonical link](https://medium.com/@adri-v/that-time-when-kind-stopped-working-in-github-codespaces-9cb5433ea589)

Exported from [Medium](https://medium.com) on June 3, 2026.