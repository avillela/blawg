---
title: "Onboarding Doesn’t Have to Suck"
slug: onboarding-doesn-t-have-to-suck
description: "Elevating Developer Onboarding with Platform Engineering"
added: "Apr 17, 2024"
tags:
  - technical
  - platform-engineering
  - thought-leadership
  - "2024"
---


_with Ana Margarita Medina_

![Pancake with googly eyes, a chocolate chip nose, and bananas for a smile](https://cdn-images-1.medium.com/max/800/0*gWbWkVQz45nRAx8N.png)

A smiley face pancake! Photo by [Adri Villela](https://instagram.com/@adrianamvillela).

### Onboarding can be frustrating…

New jobs can be both scary and exciting. A new workplace means a fresh start, with new opportunities. But it also means that you are starting over again. Making new work friends. Building relationships with your new manager and new co-workers. Learning new processes. Familiarizing yourself with a new tech stack. Even if you’re a seasoned software engineer, it can get pretty overwhelming. Not only do you need to learn about internal processes, you also need to make sure that your machine is set up in just the right way so that you can start being productive as quickly as possible.

That process can be a pain in the butt on a good day, and downright stressful on a bad day. Sometimes installing the right tools and getting the right access to install said tools can take hours, if not days, depending on where you work. This type of thing can leave a poor first impression, which is not a great look for that company.

Today, we’ll talk about the challenges that developers face when onboarding, and the importance of creating a good onboarding experience for developers. We’ll also examine available tooling, and onboarding models.

### The many faces of onboarding…

One of the challenges when setting up a developer machine is software installation. Many organizations provide new employees with machines having a “base image”, containing a common set of software tools used by everyone at the company, regardless of their role. This software includes but is not limited to:

*   Browser
*   Email client
*   Productivity tools (e.g. docs, spreadsheets, presentations)
*   Collaboration software (e.g. Slack, Teams)
*   Video conferencing software (e.g. Zoom, Teams, WebEx)
*   Security software (e.g. VPN, anti-virus software)

This means that developers must often install development tools on their own. And depending what type of organization they work at, the installation experience can be very different. It can be one of the following…

#### The Vault

![Sea otters working on computers at a bank vault. Image generated with AI via Dalle3.](https://cdn-images-1.medium.com/max/800/0*uA1OnBub2XZ-fnuE.jpeg)

Sea otters at a bank vault. Image generated with AI via Dalle3.

Sea otters at a bank vault. Image generated with AI via Dalle3.

*   Developers are allowed to install software only if it’s from an approved list
*   Usually managed by the security team, and approvals for software might take a REALLY REALLY REALLY long time
*   Common in organizations that maintain high levels of security and compliance because they’re dealing with really sensitive data
*   e.g. finance and healthcare

#### Red Tape Tango

![Sea otters dancing the tango with red tape while in front of a computer. Oil pastel, galaxy vibe. Image generated with AI via Dalle3.](https://cdn-images-1.medium.com/max/800/0*74oN6QCJwB1gdWIP.png)

Sea otters dancing the tango with red tape while in front of a computer. Image generated with AI via Dalle3.

Sea otters dancing the tango with red tape while in front of a computer. Image generated with AI via Dalle3.

*   Although developers can only install software from an approved list, they can go through a white-listing process to add more software to the approved list
*   Might not be quite as locked down as “The Vault”, but due to processes and policies, approvals for software might take a while
*   Common in organizations that maintain high security and compliance standards, but have more wiggle room
*   e.g. SaaS companies, consulting companies

#### Wild Wild West

![Sea otters in a wild west scene, wearing cowboy hats while working on computers. Image generated with AI via Dalle3.](https://cdn-images-1.medium.com/max/800/0*lnvrnPpqVVS5KWQA.jpeg)

Sea otters in a wild west scene, wearing cowboy hats while working on computers. Image generated with AI via Dalle3.

Sea otters in a wild west scene, wearing cowboy hats while working on computers. Image generated with AI via Dalle3.

*   It’s a free-for-all! Developers can install whatever they want
*   Usually lacks processes or guides on how to get started
*   Common in small, fledgling organizations, where security isn’t a concern…at least, not yet
*   e.g. small startups

### What goes into a developer environment?

That’s all well and good, but what exactly goes into a developer environment? The list below is by no means exhaustive, but it should give you a good idea of the types of tooling that developers want/need:

*   **Language-specific software development kits (SDK)**, such as the ones for Python, Go, and Java. After all, you need a compiler or interpreter for your code, a package manager, etc.
*   An **integrated development environment (IDE)** and plugins, so you can write your code efficiently
*   A **terminal and default shell**, with the ability for developers to install/configure their favourite shell
*   **Git** for source control management
*   Various **command-line interface (CLI) tools**, depending on what your team does. These may include things like [kubectl](https://kubernetes.io/docs/reference/kubectl/) and CLI for the cloud provider used at the organization (e.g. [gcloud](https://cloud.google.com/sdk/gcloud) for Google Cloud, and [az](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) for Azure)
*   **Virtual environment tools**, such as [Docker](http://docker.com/) and [VirtualBox](http://virtualbox.org/).
*   Supporting tools required by your team, such as [OpenSSL](http://openssl.org/), [cURL](https://en.wikipedia.org/wiki/CURL), [Wget](https://en.wikipedia.org/wiki/Wget), [Postman](https://www.postman.com/), and [Homebrew](https://brew.sh/)

In addition, developers need access to certain SaaS tooling. Although these tools are not physically installed on a developer’s machine, they are likely required by developers as part of their day-to-day work. These may include:

*   Access to cloud provider accounts (e.g. Google Cloud, AWS, Azure) and resources (e.g. Kubernetes clusters, storage buckets, etc.)
*   Remote Git repo access and CI/CD workflow tooling access (e.g. [GitHub](https://github.com/), [GitLab](https://gitlab.com/), [BitBucket](https://bitbucket.org/))
*   Access to Observability back-ends (e.g. [ServiceNow Cloud Observability](https://www.servicenow.com/products/observability.html), [Honeycomb](https://honeycomb.io/), [New Relic](https://newrelic.com/), [Splunk](https://splunk.com/), [Grafana](https://grafana.com/))
*   Other system access

Now, wouldn’t it be nice if there was a way for developers to:

*   Install the tools that they need
*   Make customizations to their liking (within reason)
*   Have access to all of the systems that they need in order to do their jobs

…ON DAY ONE?

### Platform engineering to the rescue!

Fortunately, this is absolutely possible, thanks to platform engineering.

While there are many different interpretations and definitions of platform engineering, our favorite interpretation defines platform engineering as the next step in the evolution of DevOps.

**_DevOps_** gives us the fundamental principles of collaboration, Codify All The Things™, Automate All The Things™, and rapid feedback loops.

**_SRE_** applies DevOps principles, with a focus on customer impact and reliability.

**_Platform engineering_** is an extension of SRE. While SRE is focused with external customers, platform engineering takes things a step further and also focuses on internal customers — that is, the developer.

Developer experience, or DevEx, is one aspect of platform engineering that we’re exploring today. But what is DevEx?

**_DevEx_** is about how developers feel, think, and value what they do.

But why does it matter?

### Why DevEx Matters

According to the [DevEx in Action: A study of its tangible impacts](https://queue.acm.org/detail.cfm?id=3639443) report by [Dr. Nicole Forsgren](https://nicolefv.com/) et al., published on [ACMQueue](https://queue.acm.org/):

> “Developers who find their tools and work processes intuitive and easy to use feel they are 50 percent more innovative compared with those with opaque or hard-to-understand processes. Unintuitive tools and processes can be both a time sink and a source of frustration — in either case, a severe hindrance to individuals’ and teams’ creativity.”

Furthermore the report highlights that:

> **“**…there is a difference between simply writing code and writing code in an environment that is optimized for writing code. _Environments that are optimized for writing code are efficient, effective, and conducive to well-being, and rely on the right mix of tools, practices, processes, and social structures. These environments help developers:_

> \* Get into the flow and minimize interruptions so they can focus and solve complex tasks.

> \* Foster connections and collaborations so they and their teams can be creative when it matters most.

> \* Receive high-quality feedback so they can make progress.”

With that in mind, let’s look at some onboarding approaches and tools that can improve DevEx for onboarding.

### Environment Setups & Tooling

Before we get into tooling, let’s look at two types of environment setups.

#### Self-contained environments

*   Developer machine has base tooling only
*   Developer tools are accessed via containerized or virtualized environment
*   Runs either locally, on the cloud, or a combination of both (e.g. cloud-hosted [dev container](https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers) and local IDE)
*   e.g. [GitHub Codespaces](https://docs.github.com/en/codespaces/overview) (containerized), [Vagrant](https://vagrantup.com/) (virtualized)

#### Local environments

*   Developer tools installed and accessed on local machine
*   Requires more local compute and storage, compared to running a self-contained dev environment on the cloud, where your workstation is basically just a terminal
*   A configuration management tool (e.g. Ansible) can be used to configure and install developer tools locally

The above environment setups can be supported by some of the tools below.

**_Note:_** _The tools listed below are listed alphabetically and are a subset of available tooling supporting DevEx._

[**Ansible**](https://www.ansible.com/) is an automation tool by [RedHat](https://redhat.com/), with both [community](https://www.ansible.com/community) and [paid offerings](https://www.redhat.com/en/technologies/management/ansible). Ansible can do all kinds of automations, including deployment orchestration, configuration management, and even [Terraform](https://terraform.io/)\-esque things like [deploying and configuring cloud infrastructure](https://medium.com/dzerolabs/using-ansibles-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud-6fd1910f1700).

[**Backstage**](https://backstage.io/) is an open source framework for creating developer portals, and is part of the [Cloud Native Computing Foundation (CNCF)](https://cncf.io/). It also offers a paid SaaS version, through [Roadie.io](https://roadie.io/). It has a wide variety of plugins available through its [plugin directory](https://backstage.io/plugins), and also allows users to [develop their own](https://backstage.io/docs/plugins).

[**DevPod**](https://devpod.sh/) is an open source tool by [Loft Labs](https://loft.sh/) that allows you to create containerized development environments ([dev containers](https://containers.dev/#:~:text=A%20development%20container%20%28or%20dev,in%20continuous%20integration%20and%20testing.)) running on various types of infrastructure (e.g. Docker, Kubernetes, or various cloud providers). DevPod can be linked to your favourite IDE, whereby the IDE runs on your local machine.

[**Codespaces**](https://docs.github.com/en/codespaces/overview) is a cloud-hosted containerized development environment by [GitHub](https://github.com/). Think of it as running a full-fledged containerized development environment in your browser tab, including [VSCode](https://code.visualstudio.com/).

[**Kratix**](https://kratix.io/) is an open source framework by [Syntasso](https://syntasso.io/) for building platforms which provides Kubernetes-native API-as-a-service out of the box. Kratix allows SRE teams to deliver pre-configured, reliable, consistent, and compliant Kubernetes resources via an API that is easily consumed by developers. This is accomplished through a Kratix Promise. A Promise is an encapsulation of a software capability.

[**Port**](https://getport.io/) is a SaaS developer portal tool. Like Backstage, it also offers a [plugin directory](https://www.getport.io/integrations), and allows users to [create their own](https://github.com/port-labs/ocean).

[**Vagrant**](https://vagrantup.com/) is a tool by [HashiCorp](https://hashicorp.com/) that’s used to manage and build virtual machine environments. Like Ansible, it has both [community](https://www.vagrantup.com/community) and [paid](https://app.vagrantup.com/boxes/search) offerings. Vagrant has the concept of a [provider](https://opensource.com/resources/vagrant#:~:text=Box%3A%20A%20box%20is%20a,case%20like%20a%20Docker%20container.), which refers to the location in which the virtual environment runs. Out of the box, Vagrant ships with support for [VirtualBox](https://www.virtualbox.org/), [Hyper-V](https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/about/), and [Docker](https://docker.io/) [providers](https://developer.hashicorp.com/vagrant/docs/providers); however, Vagrant is extensible and allows you to write your own providers for other types of virtualized environments.

### Sample onboarding workflows

How do we apply these tools for developer onboarding? Let’s look at two example workflows.

#### Self-contained onboarding workflow

![Self-contained onboarding workflow showing 3 onboarding steps for a developer to create a dev environment on GitHub Codespaces](https://cdn-images-1.medium.com/max/800/0*VB48Bx_kLV0Ol1HC.png)

“Self-contained” onboarding workflow

“Self-Contained” onboarding workflow

The above diagram shows the onboarding flow for a self-contained developer environment, using GitHub Codespaces.

With [GitHub Codespaces](https://docs.github.com/en/codespaces/overview), the platform engineering team is responsible for creating the Codespaces configurations, and environments can be easily spun up and brought down. Since the whole environment is remote, you don’t need to worry about having the right amount of processing power, storage space, and developer tooling running on your local machine. The tradeoff here is that you will probably need to manage different codespaces for different repos or even different branches.

The Developer arrives for onboarding day, and then:

1.  Kicks off the onboarding process by going to a designated wiki, which takes them to the a GitHub repo
2.  From there, they’re able to bootstrap a virtual environment running on the cloud hosted by GitHub. This environment contains all of the tools and configurations needed to start adding value to the team.
3.  Once their environment is created, they are able to work on their first PR.

#### Local install onboarding workflow

![Sequence diagram showing sample developer onboarding workflow for installing dev tools on a local machine](https://cdn-images-1.medium.com/max/800/0*rDPktTsopE1taeHY.png)

“Local Install” onboarding workflow

“Local Install” onboarding workflow

The above diagram shows the flow for a local install onboarding workflow.

Remember that unlike in the self-contained onboarding workflow that we saw above, the developer does all of the work on their own developer machine, so making sure that you have a good amount of storage and compute power is essential. But it also means that you have all of your tools at your disposal all in the same place, and you don’t need to rely on a network connection to do development work.

Here, we’re making use of a developer portal tool (e.g. [Backstage](http://backstage.io/), [Port](http://getport.io/)). The developer portal tool uses [GitHub Action](https://docs.github.com/en/actions)to orchestrate the onboarding, and [Ansible](http://ansible.com/) to install and configure tooling onto the developer workstation. Note that instead of Ansible, you could use any other configuration management tool. Similarly, you could use another CI/CD tool in lieu of GitHub Actions.

In this flow, the developer will:

1.  Kick off the onboarding process from a developer portal
2.  The developer portal tool triggers a GitHub Action
3.  The GitHub Action in turn kicks off an Ansible playbook
4.  The Ansible playbook installs and configures tools on the developer machine, in much the same way as it would do on some production server
5.  The playbook also sets up the appropriate permissions and access to various systems and services that the developer will need to access during their time on that team
6.  At this point the developer also has the option to kick off workflows to install additional corporate-sanctioned developer tools via the same developer portal, following a similar process to the initial onboarding setup, via steps 7–9 above.

### Final Thoughts

Before we wrap up, we wanted to leave you with some tips for building a better onboarding experience for your developers.

**Keep Balance in mind.** Balance the ease of installation of software with security and compliance constraints. Are you a Vault, Red Tape Tango, or Wild West setup? Do you want to provide your developers with a self-contained or local dev environment setup?

**Remember that DevEx is never done.** There’s always room for improvement, so check in with your newly-hired developers to get feedback on their recent onboarding experience while it’s still fresh in their minds. Similarly, check in with all developers a couple of times per year to get their thoughts on onboarding.

**Don’t work in isolation.** DevEx is a team sport. You need feedback from InfoSec to ensure that you address security requirements. You also need to work with developers to understand what types of tools they need, and why. Finally, talk to other platform engineers outside of your organization to see if you can pick up any interesting tips, tricks, and best practices

D**on’t forget the humans**!! Use the “buddy system” for onboarding, pairing a new hire with a seasoned employee as the go-to source for onboarding questions. You’ll also want to ensure that you create and foster relationships in between your new hires, and leadership, along with some teammates in other key departments (e.g. sales, marketing, product). Remember that it’s always great to make friends in other departments, because you never know when these friendships may come in handy. Finally, fave a place (e.g. Slack channel) where new hires can talk to one another, meet each other and ask questions

By keeping DevEx in mind, choosing the right tools that suit your organization, and having good onboarding practices in place, you’ll be well on your way to providing a great onboarding experience to your developers.

Now please enjoy this lovely photo of Adriana’s rat, Katie Jr.

![Light-colored fancy rat being cuddled by one of her humans](https://cdn-images-1.medium.com/max/800/0*-s0tFWYLYkFGo1V-.jpeg)

Say hello to Katie Jr.!

Until next time, peace, love, and code. ☮️ ❤️👩‍💻

PS: check out this fun little 1-minute video that Ana and I put together.

By [Adriana Villela](https://medium.com/@adri-v) on [April 17, 2024](https://medium.com/p/620094a83ef9).

[Canonical link](https://medium.com/@adri-v/onboarding-doesnt-have-to-suck-620094a83ef9)

Exported from [Medium](https://medium.com) on June 3, 2026.