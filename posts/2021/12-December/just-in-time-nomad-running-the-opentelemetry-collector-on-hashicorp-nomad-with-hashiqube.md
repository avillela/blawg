---
title: "Just-in-Time Nomad: Running the OpenTelemetry Collector on Hashicorp Nomad with HashiQube"
slug: just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube
description: "An in-depth look into the Nomad OTel Collector jobspec using Traefik as a load balancer and pulling API keys from Vault"
added: "Dec 14, 2021"
tags:
  - technical
  - nomad
  - opentelemetry
  - hashiqube
  - hashicorp
  - "2021"
---


![The nomad logo on a dark Tucows blue background](https://cdn-images-1.medium.com/max/800/1*G8wbr34pitzjc6AuBpGitA.png)

### Why should Kubernetes get all the love?

There are tons of examples out there on how to deploy the [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) to Kubernetes. When it comes to deploying the OTel Collector on Nomad, however, you don’t see a lot of stuff out there. Sure, you might see some sample Nomad jobspecs to get you started, but no comprehensive examples.

Well, never fear, my friends! I am here to help!

Are you psyched?! Let’s do this!

### Objective

In today’s tutorial, you will learn how to:

*   Run the OTel Collector on [Nomad](http://nomadproject.io) using the [Traefik](http://traefik.io) load balancer
*   Run a sample app to send trace data to not one, not two, but **_three_** Observability back-ends: [Lightstep](http://lightstep.com), [Datadog](http://datadog.com), and [Honeycomb](http://honeycomb.io).
*   Pull API keys from [Vault](http://vaultproject.io) and inject them into your Nomad jobspec.

All this will be done using [HashiQube](https://github.com/servian/hashiqube) to stand up a virtualized Hashi environment (à la [Vagrant](https://www.vagrantup.com)) on your local machine to run [Nomad](https://www.nomadproject.io), [Vault](https://www.vaultproject.io), [Consul](https://www.consul.io) and [Traefik](https://traefik.io). This will mimic a real-world Hashi environment setup in your ([Public or Private](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3)) Cloud.

### Assumptions

Before we move on, I am assuming that you have a basic understanding of:

*   **Nomad**. If not, mozy on over to my [Nomad intro post](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca).
*   **Obserability (o11y) and OpenTelemetry (OTel)**. If not, mozy on over to my [Observability & OTel post](https://storiesfromtheherd.com/unpacking-observability-the-observability-stack-93d4733e2a72).
*   **You have a trial account set up for one (or all of) these Observability tools**: [Lightstep](http://lightstep.com), [Honeycomb](http://honeycomb.io), [Datadog](http://datadog.com), and have some sort of inkling as to how to use these tools to view traces.

### Pre-Requisites

In order to run the example in this tutorial, you’ll need the following:

*   [Oracle VirtualBox](https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjVuPag0oL0AhXFnrMKHRjODRYYABAAGgJxbg&ohost=www.google.com&cid=CAASEuRoonvAcnwV4Mde6j85eTiOEQ&sig=AOD64_1N8BIxbnQDEjTDYvtzMR78syE9Bg&q&adurl&ved=2ahUKEwiUpe6g0oL0AhVjTd8KHWTvAkEQ0Qx6BAgCEAE) (version 6.1.30 at the time of this writing)
*   [Vagrant](https://www.vagrantup.com/) (version 2.2.19 at the time of this writing)
*   [Docker](https://www.docker.com/get-started) (version 20.10.10 at the time of this writing)
*   API keys for [Lightstep](http://lightstep.com) (see docs [here](https://docs.lightstep.com/docs/create-and-manage-api-keys))
*   API keys for [Honeycomb](http://honeycomb.io) (see docs [here](https://docs.honeycomb.io/api/api-keys/))
*   API keys for [Datadog](http://datadog.com) (see docs [here](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token))

> **Note:** _While you don’t have to use all Observability vendors, it’s a worthwhile exercise to get a feel of using each of these three tools for_ [_Distributed Tracing_](https://medium.com/dzerolabs/observability-journey-understanding-logs-events-traces-and-spans-836524d63172)_, especially if you’re getting started with Observability._

### Tutorial Repos

Below are the repos that we’ll be using for today’s tutorial:

*   [Modified HashiQube Repo](https://github.com/avillela/hashiqube) (fork of `[servian/hashiqube](https://github.com/servian/hashiqube)`)
*   [Sample Go app with OTel Instrumentation](https://github.com/avillela/go-otel-instrumentation)

> **Note:** _Although we’re using a Go app to send trace data to the OTel Collector, I have set things up such that you don’t need to install Go or know how to program in Go in order to be able to successfully run the sample app. If you’re interested in an in-depth tutorial on OTel instrumentation with Go, check out_ [_David Alfonzo_](https://medium.com/u/dc7fdf56954c)_’s post_ [_here_](https://storiesfromtheherd.com/opentelemetry-hands-on-instrumentation-f1b423c323c0)_._

### HashiQube Setup

I will be using a [modified version of the HashiQube Repo](https://github.com/avillela/hashiqube) (a fork of `[servian/hashiqube](https://github.com/servian/hashiqube)`) for today’s tutorial. If you’re curious, you can see what modifications I’ve made [here](https://github.com/avillela/hashiqube).

#### 1- Provision a Local Hashi Environment with HashiQube

**Start HashiQube by following the detailed instructions** [**here**](https://github.com/avillela/hashiqube#quickstart)**.**

> **_Note:_** _Be sure to check out the_ **_“_**[**_Gotchas_**](https://github.com/avillela/hashiqube#gotchas)**_”_** _section, if you get stuck._

Once everything is up and running (this will take several minutes, by the way), you’ll see this in the tail-end of the startup sequence, to indicate that you are good to go:

![Screen shot of the end of the Vagrant VM startup sequence](https://cdn-images-1.medium.com/max/800/0*jSC93s0c4_xw1e6C.png)

Final output of the Vagrant VM startup sequence

Final output of the Vagrant VM startup sequence

You can now access the services below:

*   **Vault:** [http://localhost:8200](http://localhost:8200/)
*   **Nomad:** [http://localhost:4646](http://localhost:4646/)
*   **Consul:** [http://localhost:8500](http://localhost:8500/)
*   **Traefik:** [http://traefik.localhost](http://traefik.localhost/)
*   **Waypoint:** [https://192.168.56.192:9702](https://192.168.56.192:9702/)

#### 2- Install the Nomad and Vault CLIs on your host machine

If you’re using a Mac, you can install the Vault and Nomad CLIs via Homebrew like this:

brew tap hashicorp/tap  
brew install hashicorp/tap/vault  
brew install hashicorp/tap/nomad

If you’re not using a Mac, you can find your OS-specific instructions for Vault [here](https://www.vaultproject.io/downloads) and for Nomad [here](https://www.nomadproject.io/downloads). Note that these are binary installs, and they also contain the CLIs.

#### 3- Add your Observability vendor API keys to Vault

API keys should never _ever_ _ever_ _ever_ be committed to version control. Instead, they should be safely stored in a key vault. Lucky for us, we’ve got HashiCorp Vault for that. Our Nomad jobspec will be pulling the API keys from Vault.

Nomad/Vault integration isn’t available by default on HashiQube. Lucky for you, I’ve enabled that setup for you, so all you need to do is add the vendor API keys to Vault.

Before we can add our API keys to Vault, we must set some environment variables on our host (i.e. not your Vagrant VM) machine.

First, set the `VAULT_ADDR` environment variable:

export VAULT\_ADDR=http://localhost:8200

Next, set the `VAULT_TOKEN` environment variable.

In case you’re wondering where the heck that value comes from, let’s recall the output we got when the Vagrant VM startup sequence was completed:

![Screen shot of the end of the Vagrant VM startup sequence, highlighting the Vault root token.](https://cdn-images-1.medium.com/max/800/1*l-QL2yLPOav-1YZCciW31A.png)

Final output of the Vagrant VM startup sequence

Just copy that Root Token value, and set your `VAULT_TOKEN` like this:

export VAULT\_TOKEN="<initial\_root\_token>"

But what if you cleared your terminal after the startup sequence? Then what? (I do that rather obsessively, so I’m definitely in that category.) Never fear! You can still get that token value. It is located in `/etc/vault/init.file` on the guest (i.e. Vagrant VM) machine.

Log in to your guest machine:

vagrant ssh

From the guest machine, get the root token value:

cat /etc/vault/init.file | grep Root | rev | cut -d' ' -f1 | rev > /vagrant/hashicorp/token.txt

The above snippet saves the token to `token.txt` (which is `.gitignored`), and is accessible to both the host machine (`/vagrant/hashicorp/token.txt`) and the guest machine (`hashicorp/token.txt`).

Now open a terminal on your host machine, and run the following:

export VAULT\_TOKEN=$(cat hashicorp/token.txt) && \\  
rm hashicorp/token.txt

Notice how we deleted `hashicorp/token.txt`…just to be safe. 😉

> **Note:** _In real life, you would never use the root token to set_ `_VAULT_TOKEN_`_. But we’re on our own dev environment, so it’s not the end of the world._

NOW, we can add our API keys like this:

vault kv put kv/otel/o11y/honeycomb api\_key="<HC\_API\_KEY>"

vault kv put kv/otel/o11y/lightstep api\_key="<LS\_API\_KEY>"

vault kv put kv/otel/o11y/datadog api\_key="<DD\_API\_KEY>"

Be sure to replace the following with your actual API key values:

*   `<HC_API_KEY>`: Your Honeycomb API key
*   `<LS_API_KEY>`: Your Lightstep API key
*   `<DD_API_KEY>`: Your Datadog API key

Let’s take a look at it in Vault! Go to `[http://localhost:8200](http://localhost:8200)` on your host machine. You’ll get this lovely screen:

![Screen shot of HashiCorp Vault sign-in screen](https://cdn-images-1.medium.com/max/800/1*DhLimS4Wns_2v5vzA7iBeA.png)

Use that root token to log in — the one from the `VAULT_TOKEN` environment variable.

> **Note:** _In real life, you would never use the root token to log into Vault. But we’re on our own dev environment, so it’s not the end of the world._

Once logged in, we can see this:

![Screen shot of HashiCorp Vault Secrets Engine interface](https://cdn-images-1.medium.com/max/800/1*X_azgfY6vGhKtc71Y55twg.png)

They key vault (`kv` folder) was [created automagically](https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a) for you during the bootstrapping process. You’re welcome.

Now, click on `kv`, and in the search window (highlighted below) type `otel/olly`, and hit tab (don’t hit enter!!). This should result in the following output:

![Screen shot of HashiCorp Vault secrets path for OpenTelemetry](https://cdn-images-1.medium.com/max/800/1*CWMdLIuPvdYMGtM2OQLVhg.png)

You can see the configs created for each vendor per the output above.

If you click on `datadog`, for example, you can see the contents:

![Screen shot of HashiCorp Vault Datadog API key secret created for consumption by the OpenTelemetry Collector](https://cdn-images-1.medium.com/max/800/1*MV69iG1nOAIb-odjgaDB8g.png)

Or, if you prefer the command line like I do, let’s take a look at our Datadog API key in Vault:

vault kv get kv/otel/o11y/datadog

Which gives us:

![Screen shot of the output resulting from running “vault kv get kv/otel/o11ydatadog” command](https://cdn-images-1.medium.com/max/800/1*OCeAu1uasRZVSsoSzW26Hg.png)

#### 7- Deploy the OTel Collector to Nomad

Yay! We’re finally ready to deploy the Collector! Below is our OTel Collector jobspec, `[otel-collector.nomad](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/jobs/otel-collector.nomad)`.

I’ll break it down for you a little later on. For now, let’s just deploy it. Open up a terminal window on your host machine, and run this:

nomad job run hashicorp/nomad/jobs/otel-collector.nomad

Sample output:

![Screen shot of deployment of the OTel Collector Nomad jobspec](https://cdn-images-1.medium.com/max/800/1*TFOJFWUKSVv4Q079HOk6VA.png)

Let’s take a look at the Nomad logs to see how our deployment is doing. Upon deployment, Nomad attempts to allocate (schedule) your job, and it assigns it an allocation ID. So to be able to see our logs, we need to get our job’s allocation ID:

nomad status otel-collector

Sample output:

![Screen shot of the result of running “nomad status otel-collector”, specifically highlighting the job’s allocation ID](https://cdn-images-1.medium.com/max/800/1*Y9p_7gNiv7fuAXM54V0ihQ.png)

In the above example, the allocation ID is `2a0de141`. Let’s pop it into an environment variable:

export ALLOCATION\_ID="<your\_allocation\_id>"

In the above example, `<your_allocation_id>` would be `2a0de141`.

Or, if you’re using Nomad CLI ≥1.2, you can do some CLI magic and get the allocation ID into an environment variable:

export ALLOCATION\_ID=$(nomad job allocs -json otel-collector | jq -r '.\[0\].ID')

\*\*_Big thanks to_ [_Luiz Aoqui_](https://twitter.com/luiz_aoqui) _for_ [_pointing this out_](https://twitter.com/luiz_aoqui/status/1471291304407711746)_!_

Now that we have our allocation ID, we can do a few useful things. For example, we can see the status of our allocation:

nomad alloc status $ALLOCATION\_ID

Sample output:

![Screen shot of the result of running “nomad alloc status $ALLOCATION\_ID”, highlighting the status of the given allocation.](https://cdn-images-1.medium.com/max/800/1*JiDXQBBEGyzYhd6UEBmVvA.png)

The section under Recent Events can be super helpful, as it provides you with an event log as Nomad attempts to start up the container instance.

We can also check our OTel Collector logs as it’s starting up (as long as the container was initialized successfully, that is):

nomad alloc logs -stderr $ALLOCATION\_ID svc

The OTel Collector pipes logs to stderr, which is why we’re specifying the `-stderr` flag in the above command. If you wanted to look at `stdout` instead, just leave out the `-stderr` flag.

Sample output:

![Sample output resulting from running “nomad alloc logs -stderr $ALLOCATION\_ID svc”](https://cdn-images-1.medium.com/max/800/1*ZuXKckmYME1vZabbhB_OYQ.png)

You can also tail your logs:

nomad alloc logs -stderr -tail -f $ALLOCATION\_ID svc

> **Note:** _If you’re interested in seeing what this looks like in the GUI, check out_ [_this article by HashiCorp_](https://learn.hashicorp.com/tutorials/nomad/web-ui-workload-info?in=nomad/web-ui)_._

#### 8- Test the Collector

It’s all well and good that we deployed the OTel Collector. We know that it’s deployed successfully because we saw that in the logs that the startup sequence was successful, as per the `Everything is ready. Begin running and processing data.` message from our logs.

BUT…how do we know that it actually WORKS? We don’t. So let’s test it by using a simple program to send a trace to our Observability vendors!

Lucky for you, I have a repo with a sample Go program instrumented using OpenTelemetry. It is a fork of [David Alfonzo](https://medium.com/u/dc7fdf56954c)’s sample `[go-otel-instrumentation](https://github.com/dalfonzo-tc/go-otel-instrumentation)` repo. Since I wanted to showcase the OTel Collector and not have you fuss around with Go, I’ve gone ahead and containerized the application for you.

The app is made up of two components: a [client](https://github.com/avillela/go-otel-instrumentation/blob/main/client.go), and a [server](https://github.com/avillela/go-otel-instrumentation/blob/main/server.go), both of which are instrumented using OpenTelemetry. They are both configured to send trace data via HTTP to the OTel Collector running on `otel-collector-http.localhost` (i.e. our setup from Step 7).The client calls the server, and if everything goes as expected, the trace from client to server will by captured by the OTel Collector, and which will send it off to all three of our Observability back-ends.

Let’s get started!

> **Note:** _All of the commands are executed from your host machine (i.e. not the Vagrant VM)._

First, we build the Dockerfiles (one for the [server](https://github.com/avillela/go-otel-instrumentation/blob/main/server.dockerfile), and one for the [client](https://github.com/avillela/go-otel-instrumentation/blob/main/client.dockerfile)):

docker build -f server.dockerfile -t otel-example-server:1.0.0 .  
  
docker build -f client.dockerfile -t otel-example-client:1.0.0 .

The initial build may take a few minutes as Docker pulls the [golang image](https://hub.docker.com/_/golang) from [Docker Hub](http://hub.docker.com).

Next, we start up the container instances. Let’s start with the server:

docker run -it -p 9000:9000 \\  
    -h go-server otel-example-server:1.0.0

Wait for the server to start up. It will take a few seconds, so be patient! If all goes well, you’ll see the output below:

![Screen shot resulting from running the Dockerized go server example](https://cdn-images-1.medium.com/max/800/1*j6f13xppnuwfbaB-3zd4YA.png)

While you wait for the server to start up, open up a new terminal window, and tail the OTel Collector log. Remember to take note of your allocation ID and export it to the `ALLOCATION_ID` environment variable before running the command below.

nomad alloc logs -stderr -tail -f $ALLOCATION\_ID svc

Open a third terminal window on your host machine, and start up the client:

docker run -it --rm \\  
    --network="host" -h go-client \\  
    otel-example-client:1.0.0

It may take a few seconds, so be patient! The client will call an API endpoint, and both the client and server will send trace data to the OTel Collector. Once the client is done running, the client container instance will terminate. The server container instance will keep running until you kill it. Your client output should look like this:

![Screen shot resulting from running the Dockerized go client example](https://cdn-images-1.medium.com/max/800/1*JyFdCmqGL6IdW_p_EXlupw.png)

Over on the server container instance terminal window, you’ll see these additional two lines:

![Sample output from the go client example](https://cdn-images-1.medium.com/max/800/1*NbdqC2J3RJvJkj9h9CEMaQ.png)

And in your OTel Collector log tail you will see something like this:

![Sample output from the OTel Collector logs in Nomad](https://cdn-images-1.medium.com/max/800/1*ATIdwtHdVFyVEPhZ-Z-rmw.png)

We can also check out our traces in our respective Observability back-ends.

This is what the client trace looks like in Lightstep:

![Sample trace in the Lightstep UI](https://cdn-images-1.medium.com/max/800/1*n6beN4gw8s29PU-TweVDRA.png)

Client trace in Lightstep

This is what the client trace looks like in Honeycomb:

![Sample trace in the Honeycomb UI](https://cdn-images-1.medium.com/max/800/1*o0WLUhDRUvAdMO6Ky6Pt5Q.png)

Client trace in Honeycomb

This is what the client trace looks like in Datadog:

![Sample trace in the Datadog UI](https://cdn-images-1.medium.com/max/800/1*C8JX4nOhSj0sz5JcMqlRPw.png)

Client trace in Datadog

Pretty freakin’ cool that we sent traces to **_all three Observability clients at the same time_**!! 🤯

### OTel Collector Jobspec Explained

Now that we’ve got the OTel Collector up and running in Nomad, I’d like to spend a bit of time explaining the `[otel-collector.nomad](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/jobs/otel-collector.nomad)` jobspec, so that you can understand all its moving parts.

The jobspec in this tutorial is based on the OTel Collector jobspecs from the offical HashiCorp GitHub repo, [nomad-opentelemetry-getting-started](https://github.com/hashicorp/nomad-open-telemetry-getting-started/tree/main/examples/nomad), with a few modifications, of course. 😊 The main mods:

*   I use Traefik for load balancing
*   My Observability endpoints are Lightstep, Honeycomb, Datadog, and Logging (more on that later).
*   I pull the API keys from Vault

Here is my OTel Collector jobspec again for your reference:

This is a really long file, so let’s break it down a bit.

#### Traefik Config

[**Line 35**](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L35)**:** In the `service` stanza, the tag `traefik.http.routers.collector.rule=Host` tells us that the OTel Collector will be available at `otel-collector-http.localhost`, which is a `web` port ([line 36](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L36)). The `web` port was initially configured on [lines 62–63](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/traefik.nomad#L62-L63) in `[traefik.nomad](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/traefik.nomad#L62)`— i.e. port `80` — which exposes any services using `traefik.http.routers.<my_label>.entrypoints=web` externally via port `80`.

[**Line 41**](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L41)**:** We reference a port called `otlp-http`. This was defined on [line 18](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L18), and says that this service is associated to the internal (container) port `4318` (see next bullet point).

[**Line 18**](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L18)**:** In the `network.port` stanza, we define a port called `otlp-http`, and we set it to `4318`. This is the default port that the OTel Collector listens on for HTTP requests. We could’ve called that port `blah` or `darth-vader`. It doesn’t matter. But we have to remember to reference it by the correct name later on when we’re using it (e.g. on [line 41](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L41)).

[**Line 14**](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L14)**:** We define an `otlp-grpc` port, listening in on port `4317`. This is the standard port used by the OTel Collector to listen on for grpc requests.

> **Note:** _We’re not doing anything with the grpc port (_`_otlp-grpc_`_) right now (maybe in a later post)._

#### OTel Collector Docker Image

[**Line 62**](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L62)**:** We’re using version `0.40.0` of the `otel-collector-contrib` Docker image. I recommend using a specific version instead of `latest`, as you don’t want any unwelcome breaking changes messing your lovely setup that was working perfectly just yesterday. (Been there, done that, bought the t-shirt.)

I would also like to point out that there are technically two OTel Collector images that you can choose from: `otel-collector-contrib`, and `otel-collector`. The difference is that `otel-collector` is the OTel Collector’s core distribution. The `otel-collector-contrib` image includes whatever’s in `otel-collector`, plus a bunch of add-on [receivers](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver), [processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor), and [exporters](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter) contributed by various vendors (or users of these vendors). In our example, we’re using the [Datadog Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/datadogexporter), which is only available as part of the `otel-collector-contrib` image.

#### OTel Collector Config YAML

[**Lines 86–128**](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L86-L128)**:** This is where we define the OTel Collector configs (`otel-collector-config.yaml`).

receivers:  
  otlp:  
    protocols:  
      grpc:  
      http:  
        endpoint: "0.0.0.0:4318"  
processors:  
  batch:  
    timeout: 10s  
  memory\_limiter:  
    # 75% of maximum memory up to 4G  
    limit\_mib: 1536  
    # 25% of limit up to 2G  
    spike\_limit\_mib: 512  
    check\_interval: 5s  
exporters:  
  logging:  
    logLevel: debug  
  otlp/hc:  
    endpoint: "api.honeycomb.io:443"  
    headers:  
       "x-honeycomb-team": "{{ with secret "kv/data/otel/o11y/honeycomb" }}{{ .Data.data.api\_key }}{{ end }}"  
      "x-honeycomb-dataset": "av-collector-test"  
  otlp/ls:  
    endpoint: ingest.lightstep.com:443  
    headers:  
       "lightstep-access-token": "{{ with secret "kv/data/otel/o11y/lightstep" }}{{ .Data.data.api\_key }}{{ end }}"  
  datadog:  
    service: dd\_trace\_example  
    tags:  
      - env:local\_dev\_env  
    api:  
      key: "{{ with secret "kv/data/otel/o11y/datadog" }}{{ .Data.data.api\_key }}{{ end }}"  
      site: datadoghq.com  
service:  
  pipelines:  
    traces:  
      receivers: \[otlp\]  
      exporters: \[logging, otlp/ls, otlp/hc, datadog\]

If we zero in on the configs, you’ll notice that I’ve defined an `otlp` [receiver](https://opentelemetry.io/docs/collector/configuration/#receivers) on [lines 87–91](https://github.com/avillela/hashiqube/blob/a917d4c678b7f9fbf0dd336ae5ed478a1f4e892b/hashicorp/nomad/jobs/otel-collector.nomad#L87-L91) because the OTel Tracing libraries send data in OTLP format. I technically could’ve omitted [line 91](https://github.com/avillela/hashiqube/blob/a917d4c678b7f9fbf0dd336ae5ed478a1f4e892b/hashicorp/nomad/jobs/otel-collector.nomad#L91), because if you leave out the endpoint altogether, the OTel Collector assumes that you’re using the default HTTP endpoint (`0.0.0.0:4318`). Similarly, by leaving the `[grpc](https://github.com/avillela/hashiqube/blob/a917d4c678b7f9fbf0dd336ae5ed478a1f4e892b/hashicorp/nomad/jobs/otel-collector.nomad#L89)` config blank, the OTel Collector assumes that you’re using the default GRPC endpoint (`0.0.0.0:4317`).

> **Note:** _You only need to define the endpoint if you’re using a port other than the default port. In which case you would need to alter your_ `_network.port_` _configuration on_ [_line 18_](https://github.com/avillela/hashiqube/blob/a917d4c678b7f9fbf0dd336ae5ed478a1f4e892b/hashicorp/nomad/jobs/otel-collector.nomad#L18)_, for example._

receivers:  
  otlp:  
    protocols:  
      grpc:  
      http:  
        endpoint: "0.0.0.0:4318"

Notice that I’ve defined `[exporters](https://opentelemetry.io/docs/collector/configuration/#exporters)` for [Lightstep](http://lightstep.com) (`otlp/ls`), [Honeycomb](http://honeycomb.io) (`otlp/hc`), and [Datadog](http://datadog.com) (`datadog`).

Both Lightstep and Honeycomb receive data in OTLP format. If I was only using one OTLP target, I could’ve gotten away with just calling it `otlp`. Because I have two OTLP targets, I need a way to differentiate them. I could’ve called them `otlp` and `otlp/2`, or `otlp/bob` and `otlp/garfield`. The point is that if I want to make it more descriptive, I need to add the suffix `/<some_descriptor>` following `otlp`.

exporters:  
  logging:  
    logLevel: debug  
  otlp/hc:  
    endpoint: "api.honeycomb.io:443"  
    headers:  
       "x-honeycomb-team": "{{ with secret "kv/data/otel/o11y/honeycomb" }}{{ .Data.data.api\_key }}{{ end }}"  
      "x-honeycomb-dataset": "av-collector-test"  
  otlp/ls:  
    endpoint: ingest.lightstep.com:443  
    headers:  
       "lightstep-access-token": "{{ with secret "kv/data/otel/o11y/lightstep" }}{{ .Data.data.api\_key }}{{ end }}"  
  datadog:  
    service: dd\_trace\_example  
    tags:  
      - env:local\_dev\_env  
    api:  
      key: "{{ with secret "kv/data/otel/o11y/datadog" }}{{ .Data.data.api\_key }}{{ end }}"  
      site: datadoghq.com

[**Lines 104–105**](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L104-L105)**:** We’re defining a `logging` exporter.

logging:  
    logLevel: debug

This is totally not needed, but comes in super handy when debugging your trace outputs in the OTel Collector, like we saw when we were tailing the OTel Collector logs earlier:

![Sample Logger exporter output in the OTel Collector](https://cdn-images-1.medium.com/max/800/1*DAV0Rtfx8GEoYAaHN7LRjA.png)

Sample Logger exporter output in the OTel Collector

[**Lines 124–128**](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L124-L128)**:** This is where we define our `[pipelines](https://opentelemetry.io/docs/collector/configuration/#service)`. We’re defining a trace pipeline here ([lines 126–128](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L126-L128)). We could also define a metrics pipeline if we were pulling metrics from our infrastructure and/or from our language runtimes. The trace pipeline ingests data in the `otlp` format from our application code using the OTel Tracing libraries, and exports data via the following exporters: Logging (`logging`), OTLP for Lightstep and Honeycomb (`otlp/ls` and `otlp/hc`), and Datadog (`datadog`) exporters. We’re not doing anything special with our data before sending it off to our Observability back-ends, so we haven’t included any processors in our pipeline config.

service:  
  pipelines:  
    traces:  
      receivers: \[otlp\]  
      exporters: \[logging, otlp/ls, otlp/hc, datadog\]

> **Note:** _If you don’t wish to send data to all 3 Observability back-ends, comment out the relevant lines in the_ `_exporters_` _definition section (starting on_ [_line 103_](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L103)_), and remove the exporters you don’t want from the_ `_exporters_` _section of the_ `_pipelines_` _definition (_[_line 128_](https://github.com/avillela/hashiqube/blob/ce0ad37694687ae575c7c1a068610776c38524e9/hashicorp/nomad/jobs/otel-collector.nomad#L128)_)._

### Conclusion

Holy cow…this was a monster post. We had a lot to cover! Let’s recap:

*   We used [HashiQube](https://github.com/servian/hashiqube) to stand up a local HashiCorp environment so that we could run a Nomad OTel Collector job using [Traefik](http://traefik.io) as our load balancer.
*   We took advantage of Nomad/Vault integration (pre-configured by Yours Truly) to pull our Observability vendor API keys from Vault into our Nomad job. This keeps our API keys out of version control, and makes InfoSec happy. 😃
*   We learned how to view OTel Collector job logs in Nomad.
*   We learned how to configure the OTel Collector to send trace data to three Observability vendors at the same time ([Lightstep](http://lightstep.com), [Honeycomb](http://honeycomb.io), and [Datadog](http://datadog.com))!
*   We tested our OTel Collector deployment by running a sample Go client/server app, and we saw our trace data show up in all three Observability vendors.

I will now break from tradition of showing cuddly animal photos and will instead reward you with a photo of me with a Sound-of-Music-themed cow in Salzburg, Austria. Photo taken on [Kodak Advantix film](https://en.wikipedia.org/wiki/Advanced_Photo_System) in 2000. Man, I feel old!

![Picture of author standing behind a cow statue in Salzburg, Austria, painted with the “Sound of Music” theme](https://cdn-images-1.medium.com/max/800/1*ciJ-LTJ20vLZb-fnHVVU9Q.jpeg)

Photo of author in Salzburg, Austria, in 2000. Servus!

Peace, love, and code.

### Related Reading

[**OpenTelemetry: Hands-on Instrumentation**  
_How to Instrument Golang code with OpenTelemetry_dalfonzo.medium.com](https://dalfonzo.medium.com/opentelemetry-hands-on-instrumentation-f1b423c323c0 "https://dalfonzo.medium.com/opentelemetry-hands-on-instrumentation-f1b423c323c0")[](https://dalfonzo.medium.com/opentelemetry-hands-on-instrumentation-f1b423c323c0)

[**Fix Disjointed Traces with Context Propagation**  
_Connecting an OTel-Instrumented Service to a Service Instrumented with Datadog Tracing Libraries_storiesfromtheherd.com](https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0 "https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0")[](https://storiesfromtheherd.com/fix-disjointed-traces-with-context-propagation-ebcbe81788e0)

### References

*   [Getting Started with OpenTelemetry on HashiCorp Nomad](https://github.com/hashicorp/nomad-open-telemetry-getting-started)
*   [Wildcard DNS in Localhost Development](https://gist.github.com/eloypnd/5efc3b590e7c738630fdcf0c10b68072)
*   [Access Application Logs for Troubleshooting](https://learn.hashicorp.com/tutorials/nomad/jobs-accessing-logs?in=nomad/manage-jobs)

By [Adriana Villela](https://medium.com/@adri-v) on [December 14, 2021](https://medium.com/p/4eaf009b8382).

[Canonical link](https://medium.com/@adri-v/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382)

Exported from [Medium](https://medium.com) on June 3, 2026.