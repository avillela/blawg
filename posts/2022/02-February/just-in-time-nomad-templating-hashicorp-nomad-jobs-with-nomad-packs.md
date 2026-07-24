---
title: "Just-in-Time Nomad: Templating HashiCorp Nomad Jobs with Nomad Packs"
slug: just-in-time-nomad-templating-hashicorp-nomad-jobs-with-nomad-packs
description: "A tutorial on how to create Nomad jobspec templates with Nomad Pack."
added: "Feb 26, 2022"
tags:
  - technical
  - nomad
  - hashicorp
  - "2022"
---


![](https://cdn-images-1.medium.com/max/800/1*qv5zIVZC1OlSRTgabdepCg.jpeg)

Mural at the back of [Osler Fish Market](https://oslerfishmarket.ca), on the West Toronto Rail Path. Photo by [Adri Villela](https://adri-v.medium.com).

If you’re familiar with Kubernetes, chances are, you’ve heard of [Helm](https://helm.sh), a templating and packaging tool for your Kubernetes deployments. Unfortunately, there was no such tool for Nomad…that is, until recently. On November 16th, 2021, HashiCorp [introduced Nomad Pack in Tech Preview](https://www.hashicorp.com/blog/announcing-hashicorp-nomad-1-2), with the announcement of Nomad 1.2.

I love me a good comparison between Kubernetes and Nomad, so I’ve been **_dying_** to try out Nomad Pack since it was announced. But alas, other things have gotten in the way of my explorations. Welp…I finally sat down this week to get a little taste of Nomad Pack, and today, I’ll be sharing my learnings with you!

Are you ready?! LET’S DO THIS!! 💪

### Objective

Today, we will:

1.  Learn Nomad Pack basics
2.  Learn how to install Nomad Pack
3.  Create our own Nomad Pack for an existing Nomad Jobspec

### Assumptions

Before we move on, I am assuming that you have a basic understanding of [HashiCorp Nomad](https://www.nomadproject.io/). If not, mozy on over to my [Nomad intro post](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca).

### Pre-Requisites

> **Note:** _If you’ve followed this series, you’ll know that I’m a huge fan of using_ [_HashiQube_](https://github.com/servian/hashiqube) _for my Nomad explorations on my local machine. It is a virtualized environment that runs a bunch of the Hashi tools together, including_ [_Vault_](https://www.vaultproject.io/)_,_ [_Consul_](https://www.consul.io/)_,_ [_Nomad_](https://www.nomadproject.io/)_. I’ll be running the example using HashiQube; however, if you have a different setup, feel free to skip the_ **“Provision a Local Hashi Environment with HashiQube”** _section below._

In order to run HashiQube, you’ll need the following:

*   [Oracle VirtualBox](https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjVuPag0oL0AhXFnrMKHRjODRYYABAAGgJxbg&ohost=www.google.com&cid=CAASEuRoonvAcnwV4Mde6j85eTiOEQ&sig=AOD64_1N8BIxbnQDEjTDYvtzMR78syE9Bg&q&adurl&ved=2ahUKEwiUpe6g0oL0AhVjTd8KHWTvAkEQ0Qx6BAgCEAE) (version 6.1.30 at the time of this writing)
*   [Vagrant](https://www.vagrantup.com/) (version 2.2.19 at the time of this writing)

### Part 1: Creating a Nomad Pack + An Overview

As I mentioned before, Nomad Pack is a tool for templating your Nomad jobspecs. You might be wondering, “Why in Space would I need such a tool?”The main use case is the ability to use the same Nomad jobspec for different environments. That is, you inject environment-specific configs into a single jobspec. One jobspec to rule them all! MUAHAHAHA! 🦹‍♀️

Now that we’ve got that out of the way…

It’s worth noting that HashiCorp already has a collection of canned Nomad Packs in their [Nomad Pack Community Registry](https://github.com/hashicorp/nomad-pack-community-registry/tree/main/packs/opentelemetry_collector), including one that’s near and dear to my heart: an [OpenTelemetry Collector pack](https://github.com/hashicorp/nomad-pack-community-registry/tree/main/packs/opentelemetry_collector) submitted by fellow Observability geek, [Jason Harley](https://medium.com/u/c48603387acc).

That’s all well and good, but chances are, that you will need to build your own. Lucky for you, I’m here to guide you!

#### Nomad Pack Example

First things first, when you create your own Nomad pack, you need to follow a specific directory structure. It looks like this:

.  
└── README.md  
└── packs/  
    └── <PACK-NAME-A>/  
        └── ...pack contents...  
    └── <PACK-NAME-B>/  
        └── ...pack contents...  
    └── ...packs...

Where `<PACK-NAME-A>` and `<PACK-NAME-B>` are, as you would imagine, the name of your Nomad Packs. Create one pack, or a zillion, but they must all be housed in the `packs` directory.

For our example, we’ll be using…you guessed it…my trusty ‘ole 2048-game!

> **Note:** _You don’t_ have _to create any of the files in this section, since the tutorial repo in Part 2 already has them; however, it might still be good to do, just to get a feel for creating them yourself._

**1- Open up a terminal window, and create a folder for our Nomad Packs project**

mkdir nomad-packs-examples

**2- Navigate over to our newly-created directory above**

cd nomad-packs-examples

**3- Create the Nomad Pack directory structure and bare-bones readme for our example**

mkdir -p packs/2048\_game/templates  
echo "#2048-game Pack" >> packs/2048\_game/README.md

cd packs/2048\_game

Our Nomad Pack, called `2048_game`, resides in a directory inside the `packs` directory, which we called `2048_game`, to keep things consistent. I’ll tell you about the `templates` directory shortly. But first, we need to create some supporting files.

**4- Create** `**metadata.hcl**`

This file contains information about the pack. Here’s what ours looks like:

Let’s create ours from the above gist:

git clone https://gist.github.com/000d887f27cbc7d68d2caf1e17cfdfb5.git

\# Cleanup - move metadata.hcl to our `2048_game` folder  
mv 000d887f27cbc7d68d2caf1e17cfdfb5/metadata.hcl .  
rm -rf 000d887f27cbc7d68d2caf1e17cfdfb5

So…a few things about `metadata.hcl`:

*   `app.url`: The URL of your application. When we deploy the 2048-game app later on, you’ll have it running on `[http://2048-game.localhost](http://2048-game.localhost)`, so that’s what I’m using.
*   `app.author`: The app author’s name. Credit where credit is due. The author of the 2048-game I’ve been using is GitHub user [alexwhen](https://github.com/alexwhen/docker-2048).
*   `pack.name`: The name of your pack. It’s good to keep it consistent with your directory name.
*   `pack.description`: Short description of your pack.
*   `pack.url`: Location of your pack. I’ve added the location of the pack in the GitHub repo I’m using for this tutorial (not the Gist).
*   `pack.version`: Version of the pack. Probably a good idea to keep that up-to-date, for the sake of your users. 😃

> **Note:** _If you’re wondering why we didn’t name our pack_ `_2048_game_` _instead of_ `_game_2048_`_, it’s because you can’t start a pack name with a number. You also can’t use hypens (_`_-_`_) in your pack name._

**5- Create** `**variables.hcl**`

This file contains the variables that you’ll be injecting into your template file. Here’s what ours looks like:

If you’re familiar with Terraform or [Waypoint](https://medium.com/faun/just-in-time-nomad-managing-nomad-application-deployments-using-waypoint-on-hashiqube-467952b23689), the variable definition will look familiar to you. The basic structure looks like this, with a few variations based on data type:

variable "<variable\_name>" {  
  description = "<some\_description>"  
  type        = <some\_datatype>  
  default     = <some\_default\_value>  
}

In our `variables.hcl` above, you’ll notice that we use different variable types, including `object` (map), `list` (array), `number`, and `string`. For more on variable types, I recommend checking out the [Terraform docs](https://www.terraform.io/language/expressions/types), since the concepts translate to Nomad Packs.

Let’s create our `variables.hcl`:

git clone https://gist.github.com/cf98baa82365953e4fb989889a7169d3.git

\# Cleanup - move variables.hcl to our `2048_game` folder  
mv cf98baa82365953e4fb989889a7169d3/variables.hcl .  
rm -rf cf98baa82365953e4fb989889a7169d3

**6- Create** `**outputs.tpl**`

This file prints a nice little output message after your pack is created. Here’s what ours looks like:

You may have noticed some of the funny-looking notation, such as this:

\[\[ .game\_2048.app\_count \]\]

That’s the templating notation. It says, “Look at the `variables.hcl` file, and in the pack called `game_2048`, find me a variable called `app_count`.” The value `game_2048` comes from our `metadata.hcl` file that we created earlier.

> **Pro Tip:** _If the name of the pack in_ `_ouputs.tpl_` _doesn’t match up the value of_ `_pack.name_` _in_ `_metadata.hcl_`_, Nomad Pack will scream at you._

Or, with a more complex example in which we’re referencing a field within a variable of type `object`, we’d reference it like this:

\[\[ .game\_2048.docker\_artifact.image \]\]

And finally, we also have this:

\[\[ .nomad\_pack.pack.name \]\]

Where `.nomad_pack` refers to Nomad Pack system variables.

Let’s create `outputs.tpl` now:

git clone https://gist.github.com/cc8d11d49190f5313ca8483dd2ff1244.git

\# Cleanup - move outputs.tpl to our `2048_game` folder  
mv cc8d11d49190f5313ca8483dd2ff1244/outputs.tpl .  
rm -rf cc8d11d49190f5313ca8483dd2ff1244

**7- Create the jobspec template,** `**2048-game.nomad.tpl**`

The jobspec template mostly looks like a regular ’ole jobspec, except that it has the template notation, like we saw in `outputs.tpl`.

> **Pro Tip:** _Your template file MUST reside in the templates folder, otherwise Nomad Pack will get mad at you._

Here’s what our template looks like:

As you can see, we’ve parameterized a number of values in `[2048-game.nomad.tpl](https://github.com/avillela/hashiqube/blob/de7cc4ec3625ac040a57af1e580805f7ab72caba/hashicorp/nomad/packs/2048_game/templates/2048-game.nomad.tpl)`. You can parameterize as little or as much as you want, depending on your situation.

I also want to highlight [line 4](https://github.com/avillela/hashiqube/blob/de7cc4ec3625ac040a57af1e580805f7ab72caba/hashicorp/nomad/packs/2048_game/templates/2048-game.nomad.tpl#L4) of `[2048-game.nomad.tpl](https://github.com/avillela/hashiqube/blob/de7cc4ec3625ac040a57af1e580805f7ab72caba/hashicorp/nomad/packs/2048_game/templates/2048-game.nomad.tpl)`, since it’s something we didn’t see in `[outputs.tpl](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/packs/2048_game/outputs.tpl)`. If you recall our datacenters variable ([lines 7–11](https://github.com/avillela/hashiqube/blob/de7cc4ec3625ac040a57af1e580805f7ab72caba/hashicorp/nomad/packs/2048_game/variables.hcl#L7-L11)) in `[variables.tpl](https://github.com/avillela/hashiqube/blob/de7cc4ec3625ac040a57af1e580805f7ab72caba/hashicorp/nomad/packs/2048_game/variables.hcl)`, you’ll notice that it’s a list.

variable "datacenters" {  
  description = "A list of datacenters in the region which are eligible for task placement."  
  type        = list(string)  
  default     = \["dc1"\]  
}

To display values from a list, your template looks like this ([line 4](https://github.com/avillela/hashiqube/blob/de7cc4ec3625ac040a57af1e580805f7ab72caba/hashicorp/nomad/packs/2048_game/templates/2048-game.nomad.tpl#L4) of `[2048-game.nomad.tpl](https://github.com/avillela/hashiqube/blob/de7cc4ec3625ac040a57af1e580805f7ab72caba/hashicorp/nomad/packs/2048_game/templates/2048-game.nomad.tpl)`):

datacenters = \[ \[\[ range $idx, $dc := .game\_2048.datacenters \]\]\[\[if $idx\]\],\[\[end\]\]\[\[ $dc | quote \]\]\[\[ end \]\] \]

Basically, it’s just a loop.

If you want to go **_super-fancy_**, you can go wild and create [helper templates](https://learn.hashicorp.com/tutorials/nomad/nomad-pack-writing-packs#helper-templates). (Helm has a similar concept.) These files are aptly named `_helpers.tpl` and reside in the same directory as your jobspec template (i.e. in the `templates` folder). Helper templates let you re-use template snippets and do all sorts of fancy things, like conditionals and loops, much like you can do with [jinja templates](https://realpython.com/primer-on-jinja-templating/) in the world of Python.

> **Note:** _If you’re looking for a really good advanced example of using helper templates, I highly recommend that you check out the_ `[__helpers.tpl_](https://github.com/hashicorp/nomad-pack-community-registry/blob/main/packs/opentelemetry_collector/templates/_helpers.tpl)` _in the_ [_OpenTelemetry Collector Nomad Pack_](https://github.com/hashicorp/nomad-pack-community-registry/tree/main/packs/opentelemetry_collector)_._

Let’s create our `2048-game.nomad.tpl`:

git clone https://gist.github.com/84fd986b73256e1740545de7cd53b349.git

\# Cleanup - move `2048_game`.nomad.tpl to our `2048_game`/templates folder  
mv 84fd986b73256e1740545de7cd53b349/`2048-game`.nomad.tpl templates/.  
rm -rf 84fd986b73256e1740545de7cd53b349

Okay…now that we know the basics, we’ll learn how to run our Nomad Pack in the next section.

### Part 2: Applying a Nomad Pack

I will be using a [modified version of the HashiQube Repo](https://github.com/avillela/hashiqube) (a fork of `[servian/hashiqube](https://github.com/servian/hashiqube)`) for today’s tutorial. It includes all of the source files that you created in **_Part 1_**.

If you’re curious, you can see what modifications I’ve made [here](https://github.com/avillela/hashiqube).

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

#### 2- Install the Nomad Pack Binary

To install the Nomad Pack binary open up a terminal window on your host machine (i.e. your own computer, not the Vagrant VM), and run the following:

git clone [https://github.com/hashicorp/nomad-pack](https://github.com/hashicorp/nomad-pack)

cd ./nomad-pack \\  
  && make dev

export NOMAD\_PACK\_DEST="/usr/local/bin/nomad-pack"  
cp bin/nomad-pack $NOMAD\_PACK\_DEST

Let’s see if it worked! Run the following in your terminal:

nomad-pack registry list

The firs time the above command is run, `nomad-pack` pulls all Packs from the [Nomad Pack community registry repo](https://github.com/hashicorp/nomad-pack-community-registry/tree/main/packs/opentelemetry_collector), and saves them to a local cache. This cache is located at:

*   `$HOME/Library/Caches/nomad/packs` on Mac
*   `$HOME/.nomad/packs` on Linux

Your output will look something like this:

![](https://cdn-images-1.medium.com/max/800/1*3XimFX0tObkTRQ0S4-px4g.png)

Okay! We’re in business! Are you getting excited??

#### 3- Run the Nomad Pack

> **Note:** _We’ll be running our commands assuming that you’re starting from the repo root in your terminal on the host machine (i.e. the_ `_hashiqube_` _directory). If you prefer, you can_ `_cd_` _over directly to the pack directory,_ `_hashicorp/nomad/packs/_2048_game`_. Once you’ve done that, you would replace any occurrences of_ `_hashicorp/nomad/packs/_2048_game` _in the commands below with_ `_._`_._

Before we run the Nomad Pack, let’s do a couple of checks, to make sure that everything is looking good.

First, let’s see if we can get the info about our pack. Run the command below:

nomad-pack info hashicorp/nomad/packs/`2048_game`

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*tfKHS2gHEtl6OCk8yLM8vQ.png)

As you can see, we can see some info about our `game_2048` pack. The `info` command pulls data from our `metadata.hcl` and our `variables.hcl` files, which we learned about in the previous section, **_“Part 1”_**.

Before applying our `game_2048` Pack to Nomad, it’s good idea for us to render our template. This helps us verify whether the Jobspec that we’re posting to Nomad looks the way we expect it to. It also runs some validatons, checking for any boo-boos in our template. We do this by running this command:

nomad-pack render hashicorp/nomad/packs/`2048_game`

> **Note:** _If you’re familiar with Helm, the above command is similar to the_ `[_helm template_](https://helm.sh/docs/helm/helm_template/)` _command._

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*Q-Hdm80xf_9SrYJvfNMRGw.png)

As you can see per the output above, all occurrences of `[[ .game_2048.<var_name> ]]` have been replaced with the appropriate values from our `variables.hcl` file. Pretty neat, huh?

Now that we’ve checked to make sure that things look good, let’s deploy our pack to Nomad by running this command:

nomad-pack run hashicorp/nomad/packs/`2048_game`

![](https://cdn-images-1.medium.com/max/800/1*pVU6psypMnTy49gDU1Hdwg.png)

The above command will:

1.  Render the jobspec (same as the `nomad-pack render` command)
2.  Deploy the jobspec to Nomad (same as the `nomad job run` command)

Upon successful completion of the job in Nomad, it prints a nice message…the same message that we configured in our `outpus.tpl` file. Whaaat? 🤯

We can see that our job has been deployed to Nomad by checking the UI:

![](https://cdn-images-1.medium.com/max/800/1*FaxmkV0QqQ5tf7T8fBPmdQ.png)

Well, hello my prettyyyyy!

Or by running the following command from the CLI:

nomad job status 2048-game

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*xgoe9gg10kANkwM8aYIgng.png)

Thing of beauty!

If you want to nukify your job, you can run this command:

nomad-pack destroy hashicorp/nomad/packs/`2048_game`

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*9VvceY8GxQ562I5n-z6XUA.png)

To check that our job has gone bye-bye:

nomad job status 2048-game

It’s gone!!! 😳

![](https://cdn-images-1.medium.com/max/800/1*jD3TUwzEftpm2uSbmLKDbQ.png)

So there you have it. You have created and deployed your first Nomad Pack! Woo hoo!! 🎉

### Conclusion

Congrats! You’ve just created your very first Nomad Pack! You should be super proud of yourself!! Quick recap of what we’ve done:

*   We’ve learned that Nomad Pack is a templating tool for Nomad jobspecs — like Helm for Kubernetes
*   We learned the anatomy of a Nomad pack by creating our own for the 2048-game
*   We used Nomad Pack to deploy a jobspec to Nomad

Now, please enjoy this photo of a white yak on a brown field.

![](https://cdn-images-1.medium.com/max/800/1*4YvensLMmY3Z7qoKpiM6_Q.jpeg)

Photo by [Jason An](https://unsplash.com/@azybeatlemania?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/yak?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### More from Just-in-Time Nomad

Check out more from my **_Just-in-Time Nomad_** blog series on HashiCorp Nomad.

[**Just-in-Time Nomad**  
_Stories for those new to HashiCorp Nomad_adri-v.medium.com](https://adri-v.medium.com/list/cc5d249a172b "https://adri-v.medium.com/list/cc5d249a172b")[](https://adri-v.medium.com/list/cc5d249a172b)

### References & Further Reading

*   [Introduction to Nomad Pack](https://learn.hashicorp.com/tutorials/nomad/nomad-pack-intro?in=nomad/nomad-pack)
*   [Writing Custom Packs](https://learn.hashicorp.com/tutorials/nomad/nomad-pack-writing-packs?in=nomad/nomad-pack)
*   [Nomad Pack GitHub Repo](https://github.com/hashicorp/nomad-pack)
*   [Nomad Pack Community Registry](https://github.com/hashicorp/nomad-pack-community-registry)
*   [OTel Collector Pack](https://github.com/hashicorp/nomad-pack-community-registry/tree/main/packs/opentelemetry_collector)
*   [Nomad Packs Example Registry Repo](https://github.com/hashicorp/example-nomad-pack-registry.git)

By [Adriana Villela](https://medium.com/@adri-v) on [February 26, 2022](https://medium.com/p/b4fde6a2b7b8).

[Canonical link](https://medium.com/@adri-v/just-in-time-nomad-templating-hashicorp-nomad-jobs-with-nomad-packs-b4fde6a2b7b8)

Exported from [Medium](https://medium.com) on June 3, 2026.