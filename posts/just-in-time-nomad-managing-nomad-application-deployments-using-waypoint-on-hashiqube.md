---
title: "Just-in-Time Nomad: Managing Nomad Application Deployments Using Waypoint on HashiQube"
slug: just-in-time-nomad-managing-nomad-application-deployments-using-waypoint-on-hashiqube
description: "A beginner’s guide to installing and using HashiCorp Waypoint"
added: "Jan 25, 2022"
tags:
  - technical
  - nomad
  - hashiqube
  - hashicorp
---

# Just-in-Time Nomad: Managing Nomad Application Deployments Using Waypoint on HashiQube

![](https://cdn-images-1.medium.com/max/800/1*o4Z1v1ASewXvsfF1LPNTsQ.jpeg)

New leaf growing on a mini palm tree. Photo by [Adri Villela](https://adri-v.medium.com).

### Can we get some Nomad Love Here?

Let’s face it — Kubernetes gets ALL the love. Although Nomad is a GREAT product, it has a much, much smaller user base. As a result, there are fewer tools geared toward supporting it.

One thing that is lacking in the Nomad ecosystem is tooling for managing Nomad deployments.

Believe me…I spent a looooong time time Googling far and wide, using search terms like “GitOps for Nomad”, “Tool like ArgoCD for Nomad”, “CD tools for Nomad”, and so on. I stumbled upon [a post in this discussion](https://discuss.hashicorp.com/t/gitops-workflow-with-nomad/31200/23) which points to a list of [CI/CD tools which integrate with Nomad](https://github.com/jippi/awesome-nomad#ci--cd). Unfortunately, the tools listed on there didn’t really fit the bill.

Having spent several months in late 2020/early 2021 [neck-deep in Kubernetes](https://adri-v.medium.com/list/kubernetes-090db256e52b) and developing a deployment strategy around ArgoCD ([I have a whole series of blog posts just on ArgoCD](https://adri-v.medium.com/list/argocd-2af5f37e1209)), I understand the importance of having a good deployment management (also known as Continuous Delivery or CD) tool for your container orchestrator. This is ESPECIALLY important when you’ve got an SRE team whose job includes overseeing the health of dozens and dozens of microservices deployed to your container orchestrator cluster(s) across multiple regions. IT. ADDS. UP. A deployment management tool like ArgoCD gives you that holistic system view, and a holistic way to manage your deployments.

At the end of the day, as far as I can tell, the only two big-ish commercial deployment management tool offerings for Nomad are:

*   [Spinnaker](http://spinnaker.io), an open-source tool which was [developed at Netflix](https://thenewstack.io/netflix-built-spinnaker-high-velocity-continuous-delivery-platform/)
*   [Waypoint](https://www.waypointproject.io), which is developed by HashiCorp

I was personally drawn to Waypoint, because, as a HashiCorp product, it means that it plays nice with other HashiCorp products. Most importantly, it can run natively on Nomad, as a Nomad job, just like ArgoCD runs natively on Kubernetes! Spinnaker, on the other hand, [cannot run natively on Nomad](https://spinnaker.io/docs/setup/install/).

> **Fun fact:** _Waypoint can also_ [_manage deployments to Kubernetes_](https://learn.hashicorp.com/tutorials/waypoint/get-started-kubernetes?in=waypoint/get-started-kubernetes)_, and_ [_can run natively in Kubernetes_](https://www.waypointproject.io/commands/server-install#kubernetes-options)_. I think the Kubernetes features for Waypoint came out before the Nomad features._

Now, keep in mind that Waypoint is pretty new. It was first launched on [October 15, 2020](https://www.hashicorp.com/blog/announcing-waypoint). The latest version of Waypoint, v0.7.0, was launched on [January 13th, 2022](https://www.hashicorp.com/blog/waypoint-0-7-reimagines-ui-and-extends-deployment-workflows). That’s pretty fresh.

So, is Waypoint up to snuff? Well, let’s find out, as we explore the ins and outs of Waypoint!

### Objective

In today’s tutorial, we will:

1.  Learn how to install Waypoint on Nomad using my favourite local Hashi-in-a-box local dev environment, [HashiQube](https://github.com/servian/hashiqube).
2.  Learn how to use Waypoint to deploy a group of related apps to Nomad. This is very basic. I will not get into more advanced concepts like [workspaces](https://www.waypointproject.io/docs/workspaces) and [triggers](https://www.waypointproject.io/docs/triggers).
3.  Discuss Waypoint as a deployment management tool.

### Assumptions

Before we move on, I am assuming that you have a basic understanding of:

*   **Nomad**. If not, mozy on over to my [Nomad intro post](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca).
*   **HashiQube**. It’s basically a virtualized environment that runs a bunch of Hashi tools together. I recommend that you mozy on over to my [HashiQube post](https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8) for more deeets.

### Pre-Requisites

In order to run the example in this tutorial, you’ll need the following:

*   [Oracle VirtualBox](https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjVuPag0oL0AhXFnrMKHRjODRYYABAAGgJxbg&ohost=www.google.com&cid=CAASEuRoonvAcnwV4Mde6j85eTiOEQ&sig=AOD64_1N8BIxbnQDEjTDYvtzMR78syE9Bg&q&adurl&ved=2ahUKEwiUpe6g0oL0AhVjTd8KHWTvAkEQ0Qx6BAgCEAE) (version 6.1.30 at the time of this writing)
*   [Vagrant](https://www.vagrantup.com/) (version 2.2.19 at the time of this writing)

### Tutorial Repo

I will be using a [Modified HashiQube Repo](https://github.com/avillela/hashiqube) (fork of `[servian/hashiqube](https://github.com/servian/hashiqube)`) for today’s tutorial.

### Waypoint Installation Overview

In this section, I’ll explain how to install Waypoint. But don’t worry yet about trying these steps right away, because in the next section, **_Running the Waypoint Example on HashiQube_**, you’ll get to do it as I run through the steps of booting up your HashiQube VM and deploying your app bundle to Nomad using Waypoint.

During the Vagrant VM provisioning process on HashiQube, Waypoint is installed by way of the `[waypoint.sh](https://github.com/avillela/hashiqube/blob/master/hashicorp/waypoint.sh)` file.

At the time of this writing, [the latest version of Waypoint is **v0.7.0**](https://www.hashicorp.com/blog/waypoint-0-7-reimagines-ui-and-extends-deployment-workflows). Please note that the Waypoint provisioning scripts in this example will always pull whatever the latest version is. If you want to lock that down, please update [line 14](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/waypoint.sh#L14) of [waypoint.sh](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/waypoint.sh) to:

LATEST\_URL="https://releases.hashicorp.com/waypoint/0.7.0/waypoint\_0.7.0\_linux\_amd64.zip"

With the Waypoint binary in hand, it’s time to install. This happens on [line 23](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/waypoint.sh#L23):

waypoint install -platform=nomad -nomad-dc=dc1 -accept-tos -nomad-host-volume="mysql"

The above line will install the Waypoint server on Nomad (so that it runs natively as Nomad job). Since Waypoint needs a database to keep track of deployments, we must create a host volume in Nomad. I’m using [MySQL as the host volume](https://learn.hashicorp.com/tutorials/nomad/stateful-workloads-host-volumes?in=nomad/stateful-workloads).

> **Note:** _You can use either a_ [_Container Storage Interface (CSI) Volume_](https://learn.hashicorp.com/tutorials/nomad/stateful-workloads-csi-volumes?in=nomad/stateful-workloads) _or a_ [_Host Volume_](https://learn.hashicorp.com/tutorials/nomad/stateful-workloads-host-volumes?in=nomad/stateful-workloads) _to store the Waypoint Server’s DB. More details_ [_here_](https://www.waypointproject.io/docs/server/install#nomad-platform)_._

We need to have a DB in place **_before_** running the Waypoint server installation, otherwise the install will barf out. This means that I had to deploy the MySQL DB during the Nomad provisioning process. During the Nomad provisioning process, I had to do 2 things.

First, I configured the host volume in the Nomad `server.conf` file. This happened in [lines 40–43](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/nomad.sh#L40-L43) in `[nomad.sh](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/nomad.sh)`:

host\_volume "mysql" {  
    path      = "/opt/mysql/data"  
    read\_only = false  
  }

Note how my host volume is named `mysql`. This is the same volume name referenced in the `nomad-host-volume` flag of the `waypoint install` command:

waypoint install -platform=nomad -nomad-dc=dc1 -accept-tos -nomad-host-volume="mysql"

I also had to deploy the MySQL database to Nomad. This happens at the end of the Nomad provisioning process, in [line 140](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/nomad.sh#L140) of `[nomad.sh](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/nomad.sh#L140)`:

nomad job run -detach my-sql.nomad

The Nomad jobspec for MySQL can be found [here](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/jobs/my-sql.nomad).

After installing the Waypoint server, you can see the job running on Nomad (`[http://localhost:4646](http://localhost:4646)`):

![](https://cdn-images-1.medium.com/max/800/1*R-TXYj8e7OlxuCe7v9QIfQ.png)

> **Note:** _You can see that the_ `_mysql-server_` _job is also running. Remember that this was deployed during the Nomad provisioning step._

You can also check to see that the `waypoint-server` is running using Nomad CLI:

nomad job allocs -json waypoint-server

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*-XKNN8jZOzbB-nfrfK1kuw.png)

But we’re not done yet — we need to bootstrap the server. This happens on [line 24](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/waypoint.sh#L24) of `[waypoint.sh.](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/waypoint.sh)`

waypoint server bootstrap -server-addr=${VAGRANT\_IP}:9701 -server-tls-skip-verify

This is technically supposed to happen automagically, but for some reason it doesn’t (haven’t figured out why yet, so any suggestions are welcome). I found out about the above command from looking in the server logs of the Waypoint server job running on Nomad. Hope this saves you a ton of grief if you run into a similar situation!! 😊

![](https://cdn-images-1.medium.com/max/800/1*E4ZHnEsY39-8XuugMuddgw.png)

Thank you super-helpful log message on Waypoint server!

Again, if you prefer the Nomad CLI (make sure you have `[jq](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjlwOiaycv1AhU-mWoFHeb6AuIQFnoECAkQAQ&url=https%3A%2F%2Fstedolan.github.io%2Fjq%2Fdownload%2F&usg=AOvVaw3slgb87iOXHTa_aY2y7CR8)` installed):

export ALLOCATION\_ID=(nomad job allocs -json waypoint-server | jq -r '.\[0\].ID')

nomad alloc logs $ALLOCATION\_ID server

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*3hAf8_q-XYlm0hOKsXSeHA.png)

Now that we understand how Waypoint is installed, let’s actually install it, shall we?

### Running the Waypoint Example on HashiQube

I will be using a [modified version of the HashiQube Repo](https://github.com/avillela/hashiqube) (a fork of `[servian/hashiqube](https://github.com/servian/hashiqube)`) for today’s tutorial. If you’re curious, you can see what modifications I’ve made [here](https://github.com/avillela/hashiqube).

#### 1- Provision a Local Hashi Environment with HashiQube

**Start HashiQube by following the detailed instructions** [**here**](https://github.com/avillela/hashiqube#quickstart)**.**

> **Note:** _Be sure to check out the_ **“**[**Gotchas**](https://github.com/avillela/hashiqube#gotchas)**”** _section, if you get stuck._

Once everything is up and running (this will take several minutes, by the way), you’ll see this in the tail-end of the startup sequence, to indicate that you are good to go:

![](https://cdn-images-1.medium.com/max/800/0*ejQnpI2J10_8XjHI.png)

Final output of the Vagrant VM startup sequence

You can now access the services below:

*   **Vault:** [http://localhost:8200](http://localhost:8200/)
*   **Nomad:** [http://localhost:4646](http://localhost:4646/)
*   **Consul:** [http://localhost:8500](http://localhost:8500/)
*   **Traefik:** [http://traefik.localhost](http://traefik.localhost/)
*   **Waypoint:** [https://192.168.56.192:9702](https://192.168.56.192:9702/)

If you look at the Waypoint URL above, you’ll notice two things:

1.  The endpoint is `https`, not `http`. This is because the Waypoint UI only runs on `https`.
2.  We’re using the [Vagrant VM’s IP](https://github.com/avillela/hashiqube/blob/b918c182b143164d29c960013364446b24eb654f/Vagrantfile#L26) to connect to the Waypoint UI instead of `localhost`, because it doesn’t work with `[https://localhost:9702](https://localhost:9702)` (even though [we exposed port 9702 in the Vagrantfile](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/Vagrantfile#L60). My guess is that it has something to do with the fact that the Waypoint UI is using `https`. Anyone else have any thoughts on this?

When you hit the UI, you’ll see a bunch of security warnings. Once you bypass all the warnings, you’ll see this:

![](https://cdn-images-1.medium.com/max/800/1*QQb55IJGvN1seTX6j7iVyA.png)

Isn’t it pretty? 😃

> **Note:** _In a production environment, you will want to set up TLS and all that good stuff. This is outside of the scope of this discussion. But if you want some guidance on how to do this, check out_ [_this post_](https://dalfonzo.medium.com/traefik-in-nomad-using-consul-and-tls-5be0007794ee) _by_ [_David Alfonzo_](https://medium.com/u/dc7fdf56954c)_, who got this working with TLS + Traefik._

#### 2- Install the Waypoint CLI on your host machine

If your Host machine (i.e. the non-VM) is a Mac, you can install the Waypoint CLI via Homebrew like this:

brew tap hashicorp/tap  
brew install hashicorp/tap/waypoint

While not needed for the purposes of this tutorial, you can also install the Vault and Nomad CLIs if it tickles your fancy:

brew install hashicorp/tap/vault  
brew install hashicorp/tap/nomad

If you’re not on a Mac, you can find your OS-specific instructions for installing [Waypoint](https://www.waypointproject.io/downloads), [Vault](https://www.vaultproject.io/downloads), and [Nomad](https://www.nomadproject.io/downloads) CLIs. Note that these are the binary installs for the apps themselves, and they also contain the CLIs.

#### 3- Configure the Waypoint CLI

Now that the Waypoint CLI is installed, we need to configure it so that it knows to talk to the Waypoint server running on HashiQube. How do we do that?

During the Waypoint provisioning process of our Vagrant VM, in [line 64](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/waypoint.sh#L64) of `[waypoint.sh](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/waypoint.sh)`, we generate a Waypoint token:

export WAYPOINT\_USER\_TOKEN=$(waypoint user token)

And save it to a text file, per [line 66](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/waypoint.sh#L66):

echo $WAYPOINT\_USER\_TOKEN > /vagrant/hashicorp/waypoint/waypoint\_user\_token.txt

This file is also accessible to the host machine at `<repo_root>/hashicorp/waypoint/waypoint_user_token.txt`. I’ve `gitignored` the file so that you don’t accidentally push it to version control. You’re welcome. 😉

Armed with a user token, we can login to our newly-provisioned Waypoint server via the CLI on your host machine. Remember that you must be in the `hashiqube` repo root in order for the line below to work.

waypoint login \\  
   -token=$(cat ./hashicorp/waypoint/waypoint\_user\_token.txt) \\  
   ${VAGRANT\_IP}

> **Note:** `_VAGRANT_IP_` _refers to the IP address of your Vagrant VM (see_ [_line 26_](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/Vagrantfile#L26) _in the_ `[_Vagrantfile_](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/Vagrantfile)`_._

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*2bZig4J7c6c5CHJYzsqmdQ.png)

Logging into Waypoint for the first time creates a Context. A Waypoint Context is similar in concept to a Kubernetes Context — it represents a Waypoint server that you’re connecting to. If you need to connect to another Waypoint server, you’d simply switch the context before running any operations against that server via the CLI.

And in case you’re wondering how you can view your list of current contexts:

waypoint context list

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*7VxM7s0FDTDqdoK2kEIDEg.png)

As you can see from the output above, the context name is `bootstrap-1642044178`. This name was auto-generated, courtesy of Waypoint.

If you want to use a specific context, you would run:

waypoint context <context\_name>

Where `<context_name>` is the name of the context you want to change to — i.e. one of the `NAME` values output from running `waypoint context list`.

If you wanted to create a context, you would run:

waypoint context create \\  
   -server-addr=${VAGRANT\_IP}:9701 \\  
   -server-auth-token=<waypoint\_token> \\  
   -server-require-auth=true \\  
   -set-default <context\_name>

Where `<waypoint_token>` is your Waypoint token, and `<context_name>` is the name that you want to give your new context (it can be whatever you want).

In case you’re wondering where Waypoint stores your context, you can find out by running:

waypoint context inspect

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*kcL1_BW2wWl-szo7qe4JsA.png)

If I poke around at the config path listed above, I see a few files in there:

*   `_default.hcl` (points to your default Waypoint Context — it’s a symlink)
*   `bootstrap-1642044178.hcl` (yours will be named the same as your Context name)

You may see more files in there than what I have — one per Context you’ve configured, plus `_default.hcl`.

Now that you’ve logged into Waypoint via the UI, you can also do this:

waypoint ui -authenticate

This automagically auto-authenticates you into the Waypoint UI. Again, remember to bypass all the security warnings so that you can get to the UI:

![](https://cdn-images-1.medium.com/max/800/1*mvquYSZCGdYlz12ktvmKsg.png)

Woo hoo! You’re in!

#### 4- Deploy a project to Nomad using Waypoint (an example)

We are now ready to run a Waypoint example! If you’ve been following along in my blog posts, you know that I use my trusty 2048-game example. So _of course_ I will use this app in the example here. Since Waypoint gives you the ability to deploy multiple related apps at the same time, I will demonstrate how to deploy two apps under a single Waypoint project. As you may have guessed, a project is a group of one or more related applications.

> **Note:** _Although the two apps in the example are not at all related, I’ve schlepped them together into to illustrate the concept of deploying two apps in the same project._

To run the example, let’s navigate to our examples directory (assuming you’re starting from the repo root, `hashiqube`):

cd hashicorp/waypoint/examples/sample-app  
waypoint init

The `waypoint init` command looks for a `waypoint.hcl` in the directory from which you run `waypoint init`. In our case, we were in `hashicorp/waypoint/examples/sample-app`, so Waypoint looked for (and found) our `waypoint.hcl` there. If Waypoint finds a `waypoint.hcl` file, it validates it to make sure that your HCL is well-formed and that you’re not trying to do anything funky and non-Waypoint-y.

If Waypoint doesn’t find a `waypoint.hcl`, it will scaffold a `waypoint.hcl` for you, which you can fill out to your heart’s content.

The `waypoint init` command also creates a `.waypoint` directory in the directory where your `waypoint.hcl` is located (make sure that you `gitignore` that directory, as I did in the example repo.

Here is our `[waypoint.hcl](https://github.com/avillela/hashiqube/blob/master/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl)`:

The `[waypoint.hcl](https://github.com/avillela/hashiqube/blob/master/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl)` file starts with a `project` definition. Per [line 1](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl#L1) above, our project is aptly named `sample-proj`.

In the file above, we are defining two applications:

*   `2048-game` ([lines 26–43](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl#L26-L43))
*   `otel-collector` ([lines 45–61](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl#L45-L61))

The label you use for the `app` stanza can be whatever you want — you can use `uss-enterprise` and `battlestar-gallactica`, if you want. Obviously, the more descriptive (with regards to what the app actually does), the better. 😁

In our example, each `app` definition has two sections: `build`, and `deploy`. We define how we want to build and how we want to deploy by using [plugins](https://www.waypointproject.io/plugins). Waypoint has a bunch of canned plugins that you can use. You can also define your own. For what we want to do, we can use the existing canned plugins.

Let’s start with the `build` stanza.

The `build` stanza can do one of two things:

*   Build a `Dockerfile` and publish it to a given Docker registry
*   Pull a `Dockerfile` from a given Docker registry

I don’t particularly find the first use case all that useful to me. In my opinion, building a Docker image and publishing it to a registry should be left to a CI tool like [Jenkins](https://www.jenkins.io/), [CircleCI](https://circleci.com), or [GitHub Actions](https://github.com/features/actions). A deployment management tool like Waypoint should pull an existing Docker image and deploy it to whatever target(s) I specify. **_Build once, deploy many._**

> **Note:** _The CI tools listed above can also deploy to Nomad, Kubernetes, etc. That said, they aren’t well-suited for giving you a holistic view of your app deployments across multiple environments and clusters, like a deployment management tool would._

So, keeping in mind that we want to grab an existing Docker image to deploy to a specific Nomad environment, we use the `[docker-pull](https://www.waypointproject.io/plugins/docker#docker-pull-builder)` plugin, which includes the info you need to pull the specified Docker image and tag from a given Docker registry.

To deploy each app, I use the `deploy` stanza with the `[nomad-jobspec](https://www.waypointproject.io/plugins/nomad#nomad-jobspec-platform)` plugin. Waypoint supports two Nomad-native ways to deploy to Nomad: using the `[nomad](https://www.waypointproject.io/plugins/nomad#nomad-platform)` plugin, and the `[nomad-jobspec](https://www.waypointproject.io/plugins/nomad#nomad-jobspec-platform)` plugin. The `nomad` plugin basically creates a [Nomad jobspec](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca) on-the-fly based on a bunch of parameters that you set. Unfortunately, if you want to do anything more advanced (like [using Traefik for load-balancing](https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8)), you’re kinda screwed. Lucky for us, the `nomad-jobspec` plugin gives us more flexibility. This plugin lets you feed an existing [Nomad jobspec file](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca) into Waypoint. YUM. That’s what we see in [line 37–39](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl#L37-L39) and [line 56–58](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl#L56-L58) of our `[waypoint.hcl](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl)`.

Let’s look at the `nomad-jobpsec` config for the `2048-game` app:

jobspec = templatefile("${path.app}/2048-game.nomad.tpl", {  
    docker\_artifact = "${var.game\_2048\_docker}",  
})

The above snippet says that we’re using a `templatefile` called `2048-game.nomad.tpl` located at `${path.app}`. The Waypoint variable `${path.app}` is your working directory (i.e. where `waypoint.hcl` is located). The template file, `2048-game.nomad.tpl` could very well have been called `2048-game.nomad`, or `2048-game.hcl`. The `.tpl` extension is just a convention indicating that it is a template file (i.e. we’re passing in some parameterized to that file).

So what parameters are we sending over to `2048-game.nomad.tpl` above? It looks like we’re sending a parameter called `docker_artifact`, and that it’s getting its value from something called `var.game_2048_docker`, an object made up of an `image` field and a `tag` field.

If we look up at [lines 3–12](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl#L3-L12) of `[waypoint.hcl](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/waypoint.hcl)`, we can see that it’s `game_2048_docker` is defined there:

variable "game\_2048\_docker" {  
  type = object({  
    image = string  
    tag   = string  
  })  
  default = {  
      image = "alexwhen/docker-2048"  
      tag   = "latest"  
  }  
}

This particular variable is of type `object` (i.e. a map), but you can also define variables of type `string` and `number`. More info [here](https://www.waypointproject.io/docs/waypoint-hcl/variables/input#declaring-an-input-variable).

When we pass it to the template specified in the `nomad-jobspec` plugin, we reference it as `${var.game_2048_docker}`, where `var` tells us that it’s a Waypoint variable. And we’re assigning it to `docker_artifact` as we pass it it into our template, `2048-game.nomad.tpl`. If you look at [line 37](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/2048-game.nomad.tpl#L37) of `[2048-game.nomad.tpl](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/waypoint/custom-examples/sample-app/2048-game.nomad.tpl)`, we reference `docker_artifact` like this:

image = "${docker\_artifact.image}:${docker\_artifact.tag}"

Since `docker_artifact` is made up of an `image` field and a `tag` field, we reference the fields as `docker_artifact.image` and `docker_artifact.tag`, respectively.

> **Note:** `_waypoint.hcl_` _also supports a_ `[_release_](https://www.waypointproject.io/docs/waypoint-hcl/release)` _stanza, but as far as I can tell, the_ `_deploy_` _stanza takes care of the release part for us, since the Nomad jobspec takes care of the stuff that the release stanza is supposed to do, so it’s moot as far as our example is concerned. Please feel free to correct me if I’m wrong._

Now that we know what’s going on…let’s deploy the project:

waypoint up

> **Note:** _It’s typically a good idea to always run_ `_waypoint init_` _followed by_ `_waypoint up_` _every time you make a change to your_ `_waypoint.hcl_`_. That way, Waypoint can catch any boo-boos in the_ `_waypoint.hcl_` _file._

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*Fh4IkqAoqR0kJUmTM-4lhQ.png)

If we mozy on over to our Waypoint UI by way of `waypoint ui -authenticate`, we’ll see a new project called `sample-proj`:

![](https://cdn-images-1.medium.com/max/800/1*BtJ3-_UURxdJzZZE7hQ9Yg.png)

If we drill down (by clicking on `sample-proj`), we’ll see that it’s deployed both apps in our bundle — `2048-game` and `otel-collector`:

![](https://cdn-images-1.medium.com/max/800/1*R25FYx1cmJRkg_POE4ZWTg.png)

And if you click on `2048-game`, you’ll see this:

![](https://cdn-images-1.medium.com/max/800/1*46BM0G42YaDSmWrknVOmww.png)

According to Waypoint, the app has been deployed to Nomad! Let’s check Nomad to make sure that that’s the case by going to `[http://localhost:4646](http://localhost:4646)`:

![](https://cdn-images-1.medium.com/max/800/1*05486XhLr5Sc9ax29k-XXg.png)

Unfortunately, if something goes caca with the Nomad deployment, Waypoint doesn’t tell you, which honestly sucks. When I compare to the fact that my beloved ArgoCD does that and more, it makes me sad. 😢

#### 5- Deleting a project

If you wish to delete the apps deployed under your project, you can do so by running:

waypoint destroy -auto-approve

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*XbFZk4QCwglC7sW7XAlf2A.png)

This nukes all apps in our project, so it means that the `otel-collector` and `2048-game` apps are gonzo from Nomad. The Waypoint UI is not so great at showing destroyed deployments:

![](https://cdn-images-1.medium.com/max/800/1*isl_nO5ydvxBgtYv9n-IRQ.png)

This section probably needs a little more love.

### Thoughts on Waypoint

If you’re part of an SRE organization, you need a tool to manage your deploymens. Why? **Because you _need_ to have a holistic view of all the apps deployed across all of your container orchestrators** — whether it’s Kubernetes, Nomad, Docker Swarm, or whatever else. Deployment management tools answer the following questions:

*   What apps are deployed to what clusters?
*   What apps are part of the same bundle (project)?
*   Did any apps barf out at the time of deployment?
*   Did any previously-running apps suddenly start to barf out?
*   Do I have a good mechanism for rolling back my deployments?

So does Waypoint fit the bill?

Waypoint is a GREAT first step at a deployment management tool for Nomad. There aren’t too many such tools available for Nomad, and it’s nice to see that HashiCorp is throwing its hat into the ring and giving its own container orchestrator some much-needed love. ❤️

[Having spent a chunk of 2020 and 2021 digging deep into ArgoCD](https://adri-v.medium.com/list/argocd-2af5f37e1209), I’ve definitely been spoiled by its vast capabilities, and unfortunately, I don’t see many of the features I’ve grown to love from ArgoCD in Waypoint…yet.

As an SRE, here is my Waypoint wish list:

*   **Project deletion.** [Waypoint doesn’t currently support Project deletion](https://discuss.hashicorp.com/t/how-to-delete-the-project/16465/4), so if you want to delete a project, you’re outta luck. The only way to “delete” a project in Waypoint is to nuke your whole installation. Ugh.
*   **A holistic view of deployments.** It’s awesome that I can see what apps are deployed as part of a project, but I would love to see a high-level summary of my deployments without having to drill down into each app in the UI.
*   **A dashboard of application health.** When deploying a group of related apps (project), I’d like to see which apps were deployed successfully from the UI. Right now, I still have to go into Nomad to check up on the health of my apps. I don’t want to do that.
*   **Not being forced build step in** `**waypoint.hcl**`**.** To be honest, forcing me include a `build` stanza all the time doesn’t make a whole lot of sense to me, because I deploy to Nomad using the `nomad-jobspec` plugin for the `deploy` phase, and as far as I can tell, in the Nomad deploy phase, it pulls the image from the Docker registry all over again. (Please correct me if I’m wrong.) Unfortunately, when I tried to purposely exclude the `build` stanza from the `waypoint.hcl`, it caused Waypoint to err out on `waypoint init` and `waypoint up` with the error `'build' stanza required;`.
*   **Better documentation.** I find that the Waypoint docs are a bit sparse. The code examples are just snippets, which makes it a bit difficult to piece things together. especially when given code examples. I would’ve benefitted from seeing a full `waypoint.hcl` file and a full Nomad jobspec in the `[nomad-jobspec](https://www.waypointproject.io/plugins/nomad#examples-1)` [example](https://www.waypointproject.io/plugins/nomad#examples-1), for instance.

### Conclusion

We have covered a lot today, so give yourself a pat on the back! You survived my long-ass blog post! Here are the highlighs:

*   We learned what Waypoint does
*   We installed Waypoint in the HashiQube Vagrant VM
*   We deployed a sample project (group of apps) using Waypoint

Waypoint is a great first step by HashiCorp to provide a Nomad-native tool that manages deployments to Nomad. Heck — there are no other Nomad-native tools that even do this. While [Spinnaker](http://spinnaker.io) has a [Nomad plugin](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwihodXZu8v1AhVjl2oFHZHeAQAQFnoECAoQAQ&url=https%3A%2F%2Fgithub.com%2Fspinnaker-plugin-examples%2FnomadPlugin&usg=AOvVaw11l9r3P0DPoblfrpJP-62M) which enables you to deploy apps to Nomad, it doesn’t run natively on Nomad. I can’t, however, speak for how Spinnaker compares to managing Nomad deployments, as I haven’t had a chance to play with it (yet).

Waypoint has a lot of potential to be a kick-ass deployment management tool. Will it give your SRE team the super-holistic view of app deployments? Not at the moment. The pickings are slim in the deployment management space for Nomad. It’s nice to see that HashiCorp is investing in this space for its own container orchestrator (Nomad), and not just in Kubernetes. Seeing how much work that HashiCorp has put into growing this product since its initial release in 2020, I’d say that the future is promising. I’m excited to see what the next release of Waypoint holds in store!

I will now reward you with a photo of a snowy yak.

![](https://cdn-images-1.medium.com/max/800/1*Orz5pxh2uvkk2AK3enFLUw.jpeg)

Photo by [Pete Walls](https://unsplash.com/@pjwphoto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/yak?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### Related Reading

Be sure to check out my other articles in the **_Just-in-Time Nomad_** series!

[**Just-in-time Nomad**  
_A Kubernetes practitioner’s guide to understanding HashiCorp Nomad_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca "https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca")[](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca)

[**Just-in-Time Nomad: Running Traefik on Hashicorp Nomad with HashiQube**  
_Deploying ThoughtWorks Tech Radar to Nomad using the Traefik Load Balancer_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8 "https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8")[](https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8)

[**Just-in-Time Nomad: Running the OpenTelemetry Collector on Hashicorp Nomad with HashiQube**  
_An in-depth look into the Nomad OTel Collector jobspec using Traefik as a load balancer and pulling API keys from Vault_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382 "https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382")[](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382)

[**Just-in-Time Nomad: Configuring HashiCorp Nomad/Vault integration on HashiQube**  
_A step-by-step guide to configuring HashiCorp Nomad and Vault to allow Nomad to pull Vault secrets_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a "https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a")[](https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a)

### Acknowledgements

Big thanks to the following folks for your continued support:

*   My team of engineers on my Platform team — you’ve let me pick your brains and have made a Nomad lover out of this Kubernetes gal.
*   [riaan Nolan](https://medium.com/u/6787fe1d57a5) for your support and encouragement, and for your amazing work on [HashiQube](https://github.com/servian/hashiqube)!
*   The Hashi community, for featuring my posts!
*   My dear readers, who continue coming back for more content! ❤️

### References

*   [CI/CD tools which integrate with Nomad](https://github.com/jippi/awesome-nomad#ci--cd)
*   [Installing Waypoint](https://www.waypointproject.io/commands/install)
*   [Waypoint Built-in Plugins](https://www.waypointproject.io/plugins)
*   [Waypoint Input Variables](https://www.waypointproject.io/docs/waypoint-hcl/variables/input#declaring-an-input-variable)
*   [Waypoint Nomad Job Plugin](https://www.waypointproject.io/plugins/nomad#nomad-jobspec-platform)
*   [Waypoint Git Integration](https://www.waypointproject.io/docs/projects/git)
*   [HashiCorp Waypoint Examples Repo on GitHub](https://github.com/hashicorp/waypoint-examples)
*   [Waypoint App Promotion without re-build (Hashi forums)](https://discuss.hashicorp.com/t/app-promotion-without-re-build/16382/10)
*   [GitOps Workflow with Nomad (Hashi forums)](https://discuss.hashicorp.com/t/gitops-workflow-with-nomad/31200/23)
*   [Deleting projects on Waypoint (GitHub PR)](https://github.com/hashicorp/waypoint/pull/1847)
*   [Nomad On-Demand Runners for Waypoint (Hashi forums)](https://discuss.hashicorp.com/t/gitops-workflow-with-nomad/31200/23)
*   [Can’t Ping to Vagrant Box](https://superuser.com/a/1016731)

[![](https://cdn-images-1.medium.com/max/800/1*BCiLLad3dvZLwBa-B5cAVQ.png)](https://faun.to/bP1m5)

Join FAUN: [**Website**](https://faun.to/i9Pt9) 💻**|**[**Podcast**](https://faun.dev/podcast) 🎙️**|**[**Twitter**](https://twitter.com/joinfaun) 🐦**|**[**Facebook**](https://www.facebook.com/faun.dev/) 👥**|**[**Instagram**](https://instagram.com/fauncommunity/) 📷|[**Facebook Group**](https://www.facebook.com/groups/364904580892967/) 🗣️**|**[**Linkedin Group**](https://www.linkedin.com/company/faundev) 💬**|** [**Slack**](https://faun.dev/chat) 📱**|**[**Cloud Native** **News**](https://thechief.io) 📰**|**[**More**](https://linktr.ee/faun.dev/)**.**

**If this post was helpful, please click the clap 👏 button below a few times to show your support for the author 👇**

By [Adriana Villela](https://medium.com/@adri-v) on [January 25, 2022](https://medium.com/p/467952b23689).

[Canonical link](https://medium.com/@adri-v/just-in-time-nomad-managing-nomad-application-deployments-using-waypoint-on-hashiqube-467952b23689)

Exported from [Medium](https://medium.com) on June 3, 2026.