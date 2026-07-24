---
title: "HashiCorp Stack in a Box: Running HashiQube Using the Vagrant Docker Provider"
slug: hashicorp-stack-in-a-box-running-hashiqube-using-the-vagrant-docker-provider
description: "Running HashiQube on Apple Silicon Macs, with some tweaks to Traefik, Nomad/Vault integration, and more!"
added: "Nov 25, 2022"
tags:
  - technical
  - hashicorp
  - hashiqube
  - "2022"
---


![](https://cdn-images-1.medium.com/max/800/1*XUcrghwCHX910Q2FMRfefA.png)

Spider web covered in snow. Photo by [Adri Villela](https://adri-v.medium.com).

If you follow my [writings on HashiQube](https://medium.com/@adri-v/list/hashiqube-bfdcb9c84e10), you know that I am a HUGE fan of it. For the uninitiated, [HashiQube](https://github.com/servian/hashiqube) provisions a full-on [HashiCorp](https://HashiCorp.com) stack including but not limited to [Nomad](https://www.nomadproject.io/), [Vault](https://www.vaultproject.io), and [Consul](https://consul.io), using [Vagrant](https://vagrantup.com).

It’s been a few months since I last touched HashiQube 😭, and during my HashiQube hiatus, I got myself a 14" M1 Mac. OBVIOUSLY I was super stoked to try HashiQube on my new machine. But here’s the rub: [at the time, VirtualBox didn’t run on Apple Silicon (M1/M2) processors](https://apple.stackexchange.com/questions/422565/does-virtualbox-run-on-apple-silicon). Luckily my panic was very short-lived, because [Riaan Nolan](https://medium.com/u/6787fe1d57a5), one of the maintainers of [HashiQube](https://github.com/servian/hashiqube), found a solution: running HashiQube on Docker. You see, while most folks commonly run Vagrant using the [VirtualBox Vagrant Provider](https://developer.hashicorp.com/vagrant/docs/providers/virtualbox), you can also use the [Vagrant Docker Provider](https://developer.hashicorp.com/vagrant/docs/providers/docker). [Riaan has a great blog post](https://medium.com/@riaan.nolan/running-hashiqube-on-multi-arch-arm-and-x86-multi-os-linux-mac-windows-with-docker-desktop-4695e152cacb) that talks about some of the tweaks that he made to HashiQube so that it can run using the Docker Provider, and [you should definitely check it out](https://medium.com/@riaan.nolan/running-hashiqube-on-multi-arch-arm-and-x86-multi-os-linux-mac-windows-with-docker-desktop-4695e152cacb). As an added bonus, this solution works for M1 and non-M1 (e.g. Intel) processors alike.

I’m not here to re-hash Riaan’s solution. The purpose of this post is to highlight the following:

*   My experience with running HashiQube using the Vagrant Docker Provider.
*   Some of the modifications that I made to it for my own nerdy purposes, which you may find useful too!
*   Some of the gotchas that I encountered in my journey.

Let’s do this!

> **NOTE:** _It appears that_ [_VirtualBox now supposedly runs on M1/M2 Macs_](https://osxdaily.com/2022/10/22/you-can-now-run-virtualbox-on-apple-silicon-m1-m2/)_. I haven’t tried it myself, though a co-worker of mine who tried running Windows in VBox on his M1 Mac was unsuccessful._

### Setup

When I started playing around with HashiQube back in 2021, I [created my own HashiQube fork](https://github.com/avillela/hashiqube). I haven’t contributed back to the [upstream repo](https://github.com/servian/hashiqube), however, since it contains a few of my own customizations.

My [existing HashiQube tutorials](https://medium.com/@adri-v/list/hashiqube-bfdcb9c84e10) are based on [my fork](https://github.com/avillela/hashiqube), and in order to ensure that these don’t break, I created a new branch in my fork, called `[m1_main](https://github.com/avillela/hashiqube/tree/m1_main)`. This branch is based on the more recent work in the [upstream HashiQube repo](https://github.com/servian/hashiqube), which uses the Vagrant Docker Provider.

Below are some of my modifications.

#### Detour — What’s New in Traefik?

Before I get into my [Traefik](https://traefik.io) modifications, I would like to point out that Traefik has changed a fair bit since I last used it with Nomad, and I’m glad that Riaan did all the heavy-lifting to get the latest and greatest version of Traefik working with Nomad on HashiQube. Gotta love the Open Source community! 💜

So what’s changed? For one thing, [Traefik is now fully-integrated with Nomad](https://traefik.io/blog/traefik-proxy-fully-integrates-with-hashicorp-nomad/). In the Before Times, you needed to run Consul with Nomad in order to take advantage of Traefik’s service-discovery. Now, the Consul middle man is out of the picture.

In order to enable Traefik Service Discovery for a particular service, you’ll need to do the following in your `service` stanza, as per the snippet below:

*   Add the Traefik tags that we know and love
*   Add `provider = "nomad"` to your configuration

service {  
  name = "traefik-dashboard"  
  provider = "nomad"  
  tags = \[  
    "traefik.enable=true",  
    "traefik.http.routers.dashboard.rule=Host(\`traefik.localhost\`)",  
    "traefik.http.routers.dashboard.service=api@internal",  
    "traefik.http.routers.dashboard.entrypoints=web",  
  \]  
  
  port = "http"  
  
  check {  
    type     = "tcp"  
    interval = "10s"  
    timeout  = "5s"  
  }  
}

For a full example, [see lines 23–49 of traefik.nomad](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L32-L49).

Another thing that changed is the Traefik configuration in the `traefik.nomad` job. In the Before Times, Traefik was configured via a [TOML](https://en.wikipedia.org/wiki/TOML) file which was fed into the Traefik container instance via the `template` stanza, like this (see [old traefik.nomad, lines 72–100](https://github.com/avillela/hashiqube/blob/2916a65f2dfb4764102ad48bd5cf69941ff5c483/hashicorp/nomad/jobs/traefik.nomad#L72-L100)):

      template {  
        data = <<EOF  
\[entryPoints\]  
    \[entryPoints.web\]  
    address = ":80"  
    \[entryPoints.metrics\]  
    address = ":8082"  
    \[entryPoints.grpc\]  
    address = ":7233"  
  
  
\[api\]  
    dashboard = true  
    insecure  = true  
  
\[log\]  
    level = "DEBUG"  
\# Enable Consul Catalog configuration backend.  
\[providers.consulCatalog\]  
    prefix           = "traefik"  
    exposedByDefault = false  
  
    \[providers.consulCatalog.endpoint\]  
      address = "http://localhost:8500"  
      scheme  = "http"  
EOF  
  
  
        destination = "local/traefik.toml"  
      }

Now, it looks way cleaner, like this (see [new traefik.nomad lines 69–86](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L69-L86)):

    task "server" {  
      driver = "docker"  
      config {  
        image = "traefik:v2.8.0-rc1"  
        ports = \["admin", "http", "api", "metrics", "grpc"\]  
        args = \[  
          "--api.dashboard=true",  
          "--api.insecure=true", \### For Test only, please do not use that in production  
          "--log.level=DEBUG",  
          "--entrypoints.web.address=:${NOMAD\_PORT\_http}",  
          "--entrypoints.traefik.address=:${NOMAD\_PORT\_admin}",  
          "--entrypoints.metrics.address=:${NOMAD\_PORT\_metrics}",  
          "--entrypoints.grpc.address=:${NOMAD\_PORT\_grpc}",  
          "--providers.nomad=true",  
          "--providers.nomad.endpoint.address=http://10.9.99.10:4646" \### IP to your nomad server   
        \]  
      }  
    }

As you can see, the configurations are now passed into the container instance as `args`. But what’s the dealio with these`NOMAD_PORT_xyz` values in the args (e.g. `NOMAD_PORT_http`)? Well, they are simply references to ports defined in the Traefik Jobspec’s `network` stanza. For example, say we define a port called `http` per below ([see traefik.nomad, lines 11–13](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L11-L13)):

network {  
  port  "http"{  
     static = 80  
  }  
...  
}

This port can be referenced elsewhere in the Jobspec as `${NOMAD_PORT_http}` in our Jobspec. Pretty. Frickin’. Cool. 😎

#### Traefik Jobspec Tweaks

Now that y’all understand what the new Traefik configs look like, it’s time for me to talk about what I changed from the [upstream traefik.nomad](https://github.com/servian/hashiqube/blob/master/hashicorp/nomad/jobs/traefik.nomad) file. I made two changes:

1.  Use gRPC with Traefik
2.  Make the Traefik dashboard available through port 80

Let’s dig in.

**Use gRPC with Traefik**

Why bother with this? Because tons of services use gRPC nowadays, and I wanted to be able to run services in Nomad that use gRPC. Since Traefik is my load-balancer, I needed to make the congurations in Traefik to make this happen.

One service that I run that uses gRPC is the [OpenTelemetry Collector](https://docs.lightstep.com/otel/quick-start-collector). The OpenTelemetry Collector can ingest instrumentation data both via HTTP and [gRPC](https://grpc.io), and I wanted both methods to be available.

In order to use gRPC with Traefik, I first had to define a gRPC port in `traefik.nomad` ([lines 26–28](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L26-L28)):

network {  
  ...  
  port "grpc" {  
    static = 7233  
  }  
  ...  
}

Next, in the Traefik `task` stanza, I needed to make Traefik aware of the gRPC port. This is done via [line 73](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L73) and [line 81](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L81) in `traefik.nomad`:

task "server" {  
  driver = "docker"  
  config {  
    image = "traefik:v2.8.0-rc1"  
    ports = \["admin", "http", "api", "metrics", "grpc"\]  
    args = \[  
      ...  
      "--entrypoints.grpc.address=:${NOMAD\_PORT\_grpc}",  
      ...  
    \]  
  }

You also need to configure your service’s Jobspec to use gRPC. In my case, it meant configuring the [OpenTelemetry Collector Jobspec](https://github.com/avillela/hashiqube/blob/m1_main/hashicorp/nomad/jobs/otel-collector.nomad), which I’ll cover later in this post.

**Make the Traefik dashboard available through port 80**

[When I first added Traefik to HashiQube](https://medium.com/@adri-v/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8), I made the Traefik dashboard accessible through `[http://traefik.localhost](http://traefik.localhost.)`. I wanted to do the same in my `m1_main` branch. I did this by configuring my `traefik-dashboard` service as follows:

service {  
  name = "traefik-dashboard"  
  provider = "nomad"  
  tags = \[  
    "traefik.enable=true",  
    "traefik.http.routers.dashboard.rule=Host(\`traefik.localhost\`)",  
    "traefik.http.routers.dashboard.service=api@internal",  
    "traefik.http.routers.dashboard.entrypoints=web",  
  \]  
  ...  
}

Noteworthy items:

*   `traefik.http.routers.dashboard.entrypoints=web` tells us that the dashboard is available on the web port (which we configured to be port `80` courtesy of [this config](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L11-L13) and this [config](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L78))
*   ``traefik.http.routers.dashboard.rule=Host(`traefik.localhost`)`` configuration says that the Traefik dashboard will be available to us at `[http://traefik.localhost](http://traefik.localhost.)`.

You can check out the full Jobspec listing [here](https://github.com/avillela/hashiqube/blob/m1_main/hashicorp/nomad/jobs/traefik.nomad).

#### Configure Nomad to allow it to pull Docker images from private GitHub Container Registry

Do you need to pull Docker images from a private [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) in your Jobspec? No problem! I added [some configurations to nomad.sh](https://medium.com/@adri-v/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8) to enable this functionality. This is based on [my earlier work on HashiQube](https://medium.com/@adri-v/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8), and is simply a port of that same configuration over to the my new `[m1_main](https://github.com/avillela/hashiqube/tree/m1_main)` branch. For more check out [this blog post](https://medium.com/@adri-v/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8) (skip on over to Step 3 of the **_Running the Tech Radar App in HashiQube_** section).

#### Configure Nomad/Vault Integration

There are times when you’ll want to access Vault secrets from your Nomad Jobspec. To do this, I [configured nomad.sh and vault.sh](https://medium.com/@adri-v/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a) to enable Nomad to pull Vault secrets. Again, this is based on [my earlier work on HashiQube](https://medium.com/@adri-v/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a), and is simply a port of that same configurations over to the my new `[m1_main](https://github.com/avillela/hashiqube/tree/m1_main)` branch. For more details, check out [this blog post](https://medium.com/@adri-v/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a).

#### OpenTelemetry Collector Jobspec

When I first added the [OpenTelemetry Collector Jobspec to HashiQube](https://medium.com/tucows/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382), it only ingested telemetry data through HTTP. In this update, it supports both HTTP and [gRPC](https://grpc.io). I’ve also updated the Jobspec to play nice with the updated version of Traefik.

To configure the Collector Jobspec for use with HTTP and gRPC, I needed to add the following ports were added to the `network` stanza of `otel-collector.nomad` (see lines [31–36](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/otel-collector.nomad#L31-L36)):

network {  
  ...  
  port "otlp" {  
    to = 4317  
  }  
  port "otlphttp" {  
    to = 4318  
  }  
  ...  
}

The Collector ingests HTTP via port `4318`, and gRCP via port `4317`, which the above port definitions reflect.

I also need to define `service` stanzas for each port, in `otel-collector.nomad` (see [lines 169–188](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/otel-collector.nomad#L169-L188)):

service {  
  provider = "nomad"  
  tags = \[  
    "traefik.tcp.routers.otel-collector-grpc.rule=HostSNI(\`\*\`)",  
    "traefik.tcp.routers.otel-collector-grpc.entrypoints=grpc",  
    "traefik.enable=true",  
  \]          
  port = "otlp"  
}  
  
  
service {  
  provider = "nomad"  
  tags = \[  
    "traefik.http.routers.otel-collector-http.rule=Host(\`otel-collector-http.localhost\`)",  
    "traefik.http.routers.otel-collector-http.entrypoints=web",  
    "traefik.http.routers.otel-collector-http.tls=false",  
    "traefik.enable=true",  
  \]  
  port = "otlphttp"  
}

The above configurations will now allow programs to send OpenTelemetry data to the Collector via both HTTP and gRPC.

> **NOTE:** _Since we’re using the new and improved version of Traefik, you’ll notice that we’re also setting_ `_provider = "nomad"_`_._

**To call the OTel Collector via HTTP**, your endpoint would be `otel-collector-http.localhost`. Why? First, because ``traefik.http.routers.otel-collector-http.rule=Host(`otel-collector-http.localhost`)`` says that the endpoint’s host is `otel-collector-http.localhost`. The port is `80` because the configuration `traefik.http.routers.otel-collector-http.entrypoints=web` says to map the container port `4318` to port `80`, which we [exposed as our HTTP port in traefik.nomad](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L11-L13).

To see what this looks like with a real-life example, check out [this sample Go code](https://github.com/avillela/go-otel-instrumentation/blob/7bd3cf52c586a489a49aaf7415c6d653ede14d84/server.go#L33).

**To call the OTel Collector via gRPC**, your endpoint would be `otel-collector-grpc.localhost:7233`. Why? First, because ``traefik.tcp.routers.otel-collector-grpc.rule=HostSNI(`*`)`` says that the endpoint’s host is `*` . Normally, I’d want to use something more specific, like `otel-collector-grpc.localhost` instead of `*`. Unfortunately, if you want to use a TCP router (which is part of the configuration that you need in order to use for gRPC with Traefik) without TLS, [this is the way to go](https://community.traefik.io/t/configuration-of-non-http-port-without-tls/5901/2). If you try to put something other than `*` in the configuration, Traefik. Will. Scream. At. You. 😱 But what this also means is that in your calling code, you can put whatever you want as the hostname, and it will work. So I’ve chosen to call my endpoint `otel-collector-grpc.localhost`, so that follows the same naming convention as my HTTP endpoint. But while the port # for our HTTP endpoint is `80`, for gRPC, the port is `7233`. Why not `4317`? Because in our service configuration, the `traefik.tcp.routers.otel-collector-grpc.entrypoints=grpc` tag says to map the container port `4317` to port `7233`, which we [exposed as our gRPC port in traefik.nomad](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/hashicorp/nomad/jobs/traefik.nomad#L26-L28).

To see what this looks like with a real-life example, check out [this sample Go code](https://github.com/avillela/go-otel-instrumentation/blob/7bd3cf52c586a489a49aaf7415c6d653ede14d84/server-grpc.go#L32).

#### Name resolution

So, remember how we defined a bunch of endpoints in our Traefik configs:

*   `otel-collector-grpc.localhost`
*   `otel-collector-http.localhost`
*   `traefik.locahost`

Welp, these endpoints won’t resolve unless you add them to your `/etc/hosts` file as follows:

127.0.0.1   traefik.localhost  
127.0.0.1   otel-collector-http.localhost  
127.0.0.1   otel-collector-grpc.localhost

Why are we mapping these to `127.0.0.1`? Well, when Vagrant provisions HashiQube, it starts up a Docker image that runs Nomad, Consul, and Vault (amont other things), which are available to us via `[http://localhost:4646](http://localhost:4646/)`, `[http://localhost:8500](http://localhost:8500,)`, and `[http://localhost:8200](http://localhost:8200,)`, respectively. This means that for all intents and purposes, it’s as if Nomad, Consul, and Vault were all running on `localhost`. So, when we update our `/etc/hosts` file, we map our hostnames to the localhost IP, `127.0.0.1`.

#### Exposing ports

Wait…we’re not quite done on this endpoint stuff yet. Because we still need to expose our HTTP and gRPC ports in our `Vagrantfile`, otherwise we won’t actually be able to hit them from our guest machine. To do this, simply add these lines to your `Vagrantfile` (see [line 110](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/Vagrantfile#L110) and [line 112](https://github.com/avillela/hashiqube/blob/f77e72bf9a4343e02f3c04e786ba012c2da1de3b/Vagrantfile#L112)):

...  
config.vm.network "forwarded\_port", guest: 80, host: 80 \# traefik dashboard  
...  
config.vm.network "forwarded\_port", guest: 7233, host: 7233 \# gRPC (traefik config)  
...

And now we’re ready to start up HashiQube!

### Running HashiQube

#### Pre-Requisites

*   [Docker](https://www.docker.com/) (version 20.10.17 at the time of this writing)
*   [Vagrant](https://www.vagrantup.com/) (version 2.3.1 at the time of this writing)
*   [A GitHub Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

#### Startup

Before you fire up HashiQube, I wanted to point out a few important things.

First off, if you have the `DOCKER_DEFAULT_PLATFORM` environment variable set to `linux/amd64`, you must **_unset_** it before you start up HashiQube, it won’t provision correctly. I only point this out because mine is set to `DOCKER_DEFAULT_PLATFORM=linux/amd64` by default, because I need that my OpenTelemetry work, and that little setting messed me up initially when firing up HashiQube.

Secondly, I wanted to quickly point out that when you read through the [Quickstart](http://cd%20hashiqube%20#%20if%20you%20aren%27t%20already%20there%20vagrant%20up%20--provision-with%20basetools,docker,vault,consul,nomad%20--provider%20docker), you’ll notice that Vagrant provisioning command looks like this:

vagrant up \--provision-with basetools,docker,vault,consul,nomad \--provider docker

The `--provision-with` flag allows me to specify the services that I want to bootstrap in HashiQube. Leaving out the flag would bootstrap a ton of other tools that I don’t necessarily want or need. In my case, I just wanted to bring up Vault, Consul, and Nomad. But then why also include `basetools` and `docker`? I need `basetools` to configure the base Docker image used by HashiQube. I need `docker` so that I can use Nomad to run containerized workloads. Nomad, as you may recall, [supports a variety of different workloads that aren’t only limited to containers](https://medium.com/tucows/just-in-time-nomad-80f57cd403ca). Also, it is important to note that Vault, Consul, and Nomad have to be provisioned in this order. Consul depends on Vault, and Nomad depends on Vault and Consul.

Okay…time to fire up HashiQube. To get going, [follow the instructions here](http://cd%20hashiqube%20#%20if%20you%20aren%27t%20already%20there%20vagrant%20up%20--provision-with%20basetools,docker,vault,consul,nomad%20--provider%20docker). Once the HashiQube startup sequence is done, you should see something like this:

![Screen capture of the tail-end of the HashiQube startup sequence, printing the URLs for Nomad, Consul, Vault, and Traefik.](https://cdn-images-1.medium.com/max/800/1*BQSUHBB4Rd1OtoeyH6Hv-g.png)

Screen capture of the tail-end of the HashiQube startup sequence.

It can take upwards of 10 minutes to start everything up, so be patient. 😁

Let’s do a little spot check to make sure that everything is peachy-keen. First, let’s check out Nomad, by going to `[http://localhost:4646](http://localhost:4646:)`[:](http://localhost:4646:)

![Screen capture of the Nomad UI, with Traefik deployed.](https://cdn-images-1.medium.com/max/800/1*sn6auBdRJuUzz6ND5xzJxw.png)

Screen capture of the Nomad UI, with Traefik deployed.

Notice that the Traefik job is deployed. Which means that we can fire up the Traefik dashboard, by going to `[http://traefik.localhost](http://traefik.localhost:)`[:](http://traefik.localhost:)

![Screen capture of the Traefik dashboard at http://traefik.localhost](https://cdn-images-1.medium.com/max/800/1*EPpqAeSUltp3WG0L-Awqkw.png)

Screen capture of the Traefik dashboard at http://traefik.localhost

And there you have it! You are now running HashiQube with the Vagrant Docker Provider! The best part is that you can run this code whether you’re using an Intel machine or an M1 Mac. Woo hoo!! 🎉

### Final Thoughts

I was pleasantly surprised by how straightforward it was to run the latest version of HashiQube on my M1 Mac with the [Vagrant Docker Provider](https://developer.hashicorp.com/vagrant/docs/providers/docker). It’s nice to know that you’ve got an option beyond the [VirtualBox Vagrant Provider](https://developer.hashicorp.com/vagrant/docs/providers/virtualbox), that works just as well! Also, I found that using the upstream repo as my baseline, I was able to incorporate my own modifications with relative ease.

I’ve got a few little Nomad projects that I’ve been itching to start, and now I finally can. I can’t wait to share these with y’all! And I hope that this gets you excited about HashiQube on the M1 (and beyond) as well!

I will now reward you with a photo of my lovely little furry friends, Bunny (RIP, my little firecracker), Mookie, and Phoebe.

![Three rats peering out of a cage. A white rat (Bunny), a dark brown and white rat (Mookie), and a light brown rat (Phoebe).](https://cdn-images-1.medium.com/max/800/1*O1nugyiH4c86KrC59oyQsA.png)

Furry friends: Bunny, Mookie, and Phoebe. Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. 🦄 🌈 💫

![Peace sign, heart, and bash terminal screen](https://cdn-images-1.medium.com/max/800/1*l8XnAlMJVQZguFEqHWkQzw.png)

By [Adriana Villela](https://medium.com/@adri-v) on [November 25, 2022](https://medium.com/p/3e551c0eca97).

[Canonical link](https://medium.com/@adri-v/running-hashiqube-using-the-vagrant-docker-provider-3e551c0eca97)

Exported from [Medium](https://medium.com) on June 3, 2026.