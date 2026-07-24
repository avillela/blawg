---
title: "How to Run the OpenTelemetry Demo in GitHub Codespaces"
slug: how-to-run-the-opentelemetry-demo-in-github-codespaces
description: "Focus less on setup, and more on learning!"
added: "Jul 02, 2024"
tags:
  - technical
  - opentelemetry
  - devcontainers
---


![](https://cdn-images-1.medium.com/max/800/1*PoHCGH0dNpHj_YEvdi9GEg.png)

Lily after a rainfall. Photo by [Adriana Villela](https://adri-v.medium.com).

If you’re new to [OpenTelemetry](https://opentelemetry.io) and want to see a real-life example of instrumentation, then you should check out the [OpenTelemetry Community Demo](https://github.com/open-telemetry/opentelemetry-demo). It features a distributed online astronomy shop application with services written in multiple languages, and is instrumented with OpenTelemetry. The [OTel docs contain instructions on running Demo on your local environment](https://opentelemetry.io/docs/demo/); however, did you know that you can also run the Demo in [GitHub Codespaces](https://docs.github.com/en/codespaces/overview)?

Today, I will show you how to run the OpenTelemetry Demo using GitHub Codespaces. Let’s do this!

### What is a GitHub Codespace?

A GitHub Codespace is a GitHub-[specific development (dev) container](https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#) —i.e. a containerized development environment. One of the things I love about Codespaces is that they’re [a great way to give your developers a standardized, pre-configured dev environment](https://adri-v.medium.com/onboarding-doesnt-have-to-suck-620094a83ef9).

Keep in mind that while GitHub Codespaces has a free tier, you need to keep an eye on your resource usage so as to avoid losing access (from exhausting your allocated resources) or getting billed for that month. Per their [billing page](https://docs.github.com/en/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces):

> GitHub Codespaces is paid for either by an organization, an enterprise, or a personal account. The Free and Pro plans for personal accounts include free use of GitHub Codespaces up to a fixed amount of usage every month.

I would strongly advise that you disable your Codespace when you’re not using it, or delete it if you don’t need it anymore, so that you don’t exceed your usage limit.

You can do this by going to [https://github.com/codespaces,](https://github.com/codespaces,) and clicking on the three dots to the right of your Codespace name under the list of Codespaces.

![Screen capture of GitHub Codespaces listing, showing context menu with various options for the selected Codespace, including deleting and stopping the Codespace.](https://cdn-images-1.medium.com/max/800/1*8T3S8yG_EeLnXH81x1iybg.png)

Context menu the selected Codespace

### Running the Demo in a Codespace

#### 1- Go to Codespaces

To access GitHub Codespaces, you’ll first need a GitHub account. Once you’ve logged into GitHub, go to [https://github.com/codespaces](https://github.com/codespaces)

#### 2- Create a new Codespace

Click on the `New codespace` button. This opens up a new bowser tab, where you’ll have to input the following information:

*   **Repository:** `open-telemetry/opentelemetry-demo`
*   **Branch:** `main`
*   **Region:** Use whatever the default value is. Mine is `US East`. Yours may be different than mine.
*   **Machine type:** `4-core`. ⚠️ THIS IS IMPORTANT, since the Demo is resource-intensive. This setting ensures that you have enough CPU and RAM in your dev container to run the Demo.

![Screen capture depicting the fields that must be filled out when creating a new GitHub Codespace](https://cdn-images-1.medium.com/max/800/1*PhDalmveZnmTFKzKk8w59Q.png)

New codespace creation screen

Click `Create codespace`. Your new Codespace looks something like this:

![Screen capture depicting a browser-based VSCode development environment for the open-telemetry/opentelemetry-demo repository in GitHub](https://cdn-images-1.medium.com/max/800/1*hMV2CTkOs3p6Y8eW7aDuag.png)

Codespace created for the OpenTelemetry Demo repo

#### 3- Start the OpenTelemetry Demo

Once the Codespace has been bootstrapped, you are ready to start up the OpenTelemetry Demo. Navigate to the terminal window at the bottom of your screen, and type `docker compose up`.

It will take a few minutes to pull the container images from the image repository and to start up the various services for the app.

> **NOTE:** _At the time of this writing, the email service image fails to pull, so you may see a warning around that. Don’t panic, because instead the image is built locally._

#### 4- Access the front-end

Once the Demo is started, you’ll see a bunch of log messages from the various Demo container flying through the terminal. You’ll usually know it’s ready because you’ll see some pop-ups on the bottom corner of the screen related to port-forwarding.

At this point, you should be able to access the OpenTelemetry Demo front-end. To do this, navigate to the `Ports` tab in the terminal window, and find port `8080`. Under the `Forwarded Addresses` heading, there should be a globe icon. Clicking on it will open up a new browser tab with the OTel Demo front-end.

![](https://cdn-images-1.medium.com/max/800/1*_85EeaCOwhCA6UBPjXKuXg.png)

The URI will be different for each person. For example, in one of my Codespaces, I had`https://shiny-couscous-pp56vxjqvq7c6j6p-8080.app.github.dev/`. Gotta love the fun names that Codespaces comes up with! 😁

The resulting screen should look like this, which is the OpenTelemetry Demo’s front-end:

![](https://cdn-images-1.medium.com/max/800/1*iF66yaY-BzRXggCB2-028A.png)

The Demo also includes an installation of [Jaeger](https://www.jaegertracing.io) for trace visualization, and [Grafana](http://grafana.com), for rendering dashboards, metrics, and logs. You can access these by adding on the following to the front-end URI:

*   `/jaeger/ui` to see the Jaeger UI
*   `/grafana` to see the Grafana UI

So with my example URI above, you’d have `https://shiny-couscous-pp56vxjqvq7c6j6p-8080.app.github.dev/jaeger/ui` for Jaeger, and `https://shiny-couscous-pp56vxjqvq7c6j6p-8080.app.github.dev/grafana` for Grafana:

![](https://cdn-images-1.medium.com/max/600/1*25Al633_AtWDyH6qOz1Q5w.png)

![](https://cdn-images-1.medium.com/max/600/1*I0tB-12CmTp7hntue__p0A.png)

Jaeger and Grafana UIs. These are shipped with the OpenTelemetry Demo

That’s it!

### Gotchas

Nothing’s perfect, and sometimes you run into snags, so I wanted to call out a couple of gotchas that I encountered while trying to run the OpenTelemetry Demo in GitHub Codespaces.

#### Port forwarding

It sometimes take a while for all of the port-forwards to show up on the `Ports` tab, so be patient. Port `8080` is usually one of the last ones to show up.

You may sometimes get this pop-up on the bottom-left of your screen before port `8080` is made available:

![Port-forwarding pop-up message: “Over 20 ports have been automatically forwarded. The ‘process’ based automatic port forwarding has been switched to ‘hybrid’ in settings. Some ports may no longer be detected.”](https://cdn-images-1.medium.com/max/800/1*dy5H_oufKK4d9W0u3ShmKQ.png)

Port-forward pop-up message in Codespaces when running the OpenTelemetry Demo

Don’t sweat it. You can either click the `Undo` button, resulting in port `8080` showing up in the ports list, or you can manually add that port by going to the `Ports` tab, clicking `Add Port`, and typing `8080`.

#### Error accessing the Grafana UI

Sometimes attempting to pull up Grafana UI errs out, with a message like this:

upstream connect error or disconnect/reset before headers. reset reason: remote connection failure, transport failure reason: delayed connect error: 111

You have two options. Either wait a bit and try again, or restart everything by hitting `ctrl+c` in the terminal window, followed by:

docker compose down  
docker compose up

I admit that it’s a super cringey workaround and I am totally open to suggestions if anyone comes up with a better way around this!

### Final Thoughts

GitHub Codespaces is a great way to get started with the OpenTelemetry Demo, since the base Codespace image contains all of the tools that you need in order to run the Demo. This means that you don’t have to fuss with installing and configuring additional tooling on your own local machine, therefore giving you more time to explore and learn about OpenTelemetry!

Now, please enjoy this photo of my rat Katie, who hung out with me ever so briefly while I was working.

![Brown fancy rat peering over laptop keyboard.](https://cdn-images-1.medium.com/max/800/1*N7yDx4CyhUYEuFi9IOG5cA.png)

Katie the rat kept me company while I was working…for a hot minute. Photo by [Adriana Villela](https://adri-v.medium.com).

Until next time, peace, love, and code. ✌️❤️👩‍💻

PS: Check out the video tutorial version below:

By [Adriana Villela](https://medium.com/@adri-v) on [July 2, 2024](https://medium.com/p/ccdb5b6512f8).

[Canonical link](https://medium.com/@adri-v/how-to-run-the-opentelemetry-demo-in-github-codespaces-ccdb5b6512f8)

Exported from [Medium](https://medium.com) on June 3, 2026.