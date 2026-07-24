---
title: "Just-in-Time Nomad: Running Temporal on Nomad"
slug: just-in-time-nomad-running-temporal-on-nomad
description: "The trials and tribulations of translating Docker Compose YAML to Nomad jobspecs"
added: "Mar 16, 2022"
tags:
  - technical
  - nomad
  - hashicorp
---

# Just-in-Time Nomad: Running Temporal on Nomad

![](https://cdn-images-1.medium.com/max/800/1*99ij_kBFzYCELzEddce5tg.png)

Princess Llamikins sporting some rad shades. Photo by [Adri Villela](https://adri-v.medium.com).

A couple of weeks ago, I was asked to look at [Temporal](https://temporal.io/). In case you haven’t heard of it, Temporal is a workflow orchestrator. It allows you to define workflows as code, using [Go](https://github.com/temporalio/samples-go), [Java](https://github.com/temporalio/samples-java), [Python](https://github.com/temporalio/samples-python), and [PHP](https://github.com/temporalio/samples-php). How cool is that?! I was excited and ready to dive in. But first, I needed to figure out how to get Temporal up and running. So, of course, I turned to the docs and [Quick Install](https://docs.temporal.io/docs/server/quick-install/) guide. I found instructions for running Temporal [locally via Docker Compose](https://docs.temporal.io/docs/server/quick-install/#docker) and even on [dev/test environments on Kubernetes with Helm](https://docs.temporal.io/docs/cluster/how-to-deploy-temporal-to-kubernetes-for-testing-and-development), but alas, there was nothing for Nomad. Poor, sweet little Nomad. Why aren’t you ever invited to the party? 😭

Not a problem! If the documentation is missing, figure it out, and write your own. Challenge accepted!

### Objective

Today, I will show you step-by-step how to run Temporal on HashiCorp Nomad.

My goal in getting Temporal to run on Nomad was to go for the simplest setup possible. Temporal’s [Quick Install guide](https://docs.temporal.io/docs/server/quick-install/#docker) features a setup using [Docker Compose](https://docs.docker.com/compose/). My idea was to translate the Docker Compose file into a series of Nomad Jobspecs.

In this tutorial, we will:

1.  Learn how to install and run a non-prod setup of Temporal on Nomad
2.  Run a basic “Hello World” Workflow example in Go to validate our installation

> **Note:** _I will not be covering the inner workings of Temporal. I only learned enough about Temporal to be able to run the simple app from the_ [_Temporal Hello World tutorial_](https://docs.temporal.io/docs/go/hello-world-tutorial/)_._

### Assumptions

Before we move on, I am assuming the following:

1.  You have a basic understanding of [HashiCorp Nomad](https://www.nomadproject.io/). If not, mozy on over to my [Nomad intro post](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca).
2.  You have a basic understanding of Temporal. If not, be sure to check out Temporal’s basic overview docs [here](https://docs.temporal.io/docs/external-resources#why-workflow-orchestration) and [here](https://docs.temporal.io/docs/temporal-explained/introduction).
3.  You have a basic understanding of Go. If not, check out [this great tutorial](https://medium.com/@irezyigit/go-from-nothing-to-something-cb0967871053) by [Yiğit İrez](https://medium.com/u/c5632fbf2f8b). I’ve gone through it myself, and it’s very comprehensive.

If you feel lucky in another language, feel free to poach some of the gotchas from my Go example and try the Hello World example in one of the other languages supported by Temporal. You can check out the Hello World tutorials in other languages [here](https://docs.temporal.io/docs/learning-paths/hello-world/).

### Pre-Requisites

> **_Note:_** _If you’ve followed this series, you’ll know that I’m a huge fan of using_ [_HashiQube_](https://github.com/servian/hashiqube) _for my Nomad explorations on my local machine. It is a virtualized environment that runs a bunch of the Hashi tools together, including_ [_Vault_](https://www.vaultproject.io/)_,_ [_Consul_](https://www.consul.io/)_,_ [_Nomad_](https://www.nomadproject.io/)_. I’ll be running the example using HashiQube; however, if you have a different setup, feel free to skip the first step in_ **_“Part 2”_** _below._

In order to run HashiQube, you’ll need the following:

*   [Oracle VirtualBox](https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjVuPag0oL0AhXFnrMKHRjODRYYABAAGgJxbg&ohost=www.google.com&cid=CAASEuRoonvAcnwV4Mde6j85eTiOEQ&sig=AOD64_1N8BIxbnQDEjTDYvtzMR78syE9Bg&q&adurl&ved=2ahUKEwiUpe6g0oL0AhVjTd8KHWTvAkEQ0Qx6BAgCEAE) (version 6.1.32 at the time of this writing)
*   [Vagrant](https://www.vagrantup.com/) (version 2.2.19 at the time of this writing)

In order to run the Hello World example, you need to have the [Go runtime](https://go.dev/doc/install) installed on your machine (version 1.17.2 at the time of this writing).

### Part 1: Setting up Temporal on Nomad

In this section, I’ll describe the basic setup required to run Temporal on Nomad. Don’t worry yet about trying these steps right away, because in **_Part 2_**, you’ll get to get your hands dirty as I run through the steps of booting up your [HashiQube](https://github.com/avillela/hashiqube) VM, deploying Temporal to Nomad, and testing the setup with the Hello World workflow Go example.

As I said earlier, my goal in getting Temporal to run on Nomad was to go for the simplest setup possible.

There are [a few different variations](https://github.com/temporalio/docker-compose) of the Temporal Docker Compose setup. I went with the variation featuring [Temporal + MySQL](https://github.com/temporalio/docker-compose/blob/main/docker-compose-mysql.yml) because it was simple, and because I’ve already set up MySQL on Nomad before. When you’re diving into the Unknown, it’s best to have some familiar things to guide you. Am I right? 😊

Below is the [Docker Compose file](https://github.com/temporalio/docker-compose/blob/main/docker-compose-mysql.yml) from the [Temporal Quick Install Guide](https://docs.temporal.io/docs/server/quick-install/#docker), which served as my starting point.

As you can see from the file above, there are 4 main services:

1.  MySQL database (`mysql` service — [lines 3–11](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L3-L11))
2.  Temporal App (`temporal` service — lines 12–29)
3.  Temporal Admin Tools (`temporal-admin-tools` service — [lines 30–40](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L30-L40))
4.  Temporal UI (`temporal-web` service — [lines 41–52](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L41-L52))

We need everything but the `temporal-admin-tools` service, since that just contains a Docker image of the Temporal CLI, and it doesn’t make sense to me to run that in Nomad.

#### MySQL Setup

When you’re setting up a database in a container orchestrator, whether it’s Nomad or Kubernetes, you need persistent storage. While you _could_ technically set up a DB without persistent storage, it’s not the best idea. The thing, is, when you don’t set up a DB with persistent storage, it means that your data are saved to the container instance’s filesystem. So if/when the container instance goes kaput for whatever reason, you lose your data.

There are a few different ways to do persistent storage in Nomad. I went for using a [host volume](https://learn.hashicorp.com/tutorials/nomad/stateful-workloads-host-volumes?in=nomad/stateful-workloads), since it’s pretty straightforward. To do this, you need to configure the host volume in the Nomad `server.conf` file. In our [HashiQube](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/jobs/my-sql.nomad) setup, this config is done in [lines 40–43](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/nomad.sh#L40-L43) in `[nomad.sh](https://github.com/avillela/hashiqube/blob/179c7ff14e19aa5f81e814dc55ba4c4e6fc16075/hashicorp/nomad.sh)`, and looks like this:

host\_volume "mysql" {  
    path      = "/opt/mysql/data"  
    read\_only = false  
  }

Note how my host volume is named `mysql`.

Now that we have our host volume set up, we need to set up the MySQL Jobspec, which looks like this:

PS: I totally poached the Jobspec file from [here](https://learn.hashicorp.com/tutorials/nomad/stateful-workloads-host-volumes?in=nomad/stateful-workloads#create-the-job-file).

You’ll notice that [lines 24–28](https://github.com/avillela/hashiqube/blob/2aea8a8b511d019d4010230cc9d7010bcce4ea14/hashicorp/nomad/jobs/my-sql.nomad#L24-L28) in `[my-sql.nomad](https://github.com/avillela/hashiqube/blob/2aea8a8b511d019d4010230cc9d7010bcce4ea14/hashicorp/nomad/jobs/my-sql.nomad)` reference our `mysql` host volume defined in `server.conf`:

volume\_mount {  
    volume      = "mysql"  
    destination = "/var/lib/mysql"  
    read\_only   = false  
}

### Traefik Setup

If you’ve followed along in my [Just-in-Time Nomad](https://adri-v.medium.com/list/justintime-nomad-cc5d249a172b) series, you know that all of my examples use Traefik for load-balancing. This is no exception. In previous blog posts involving Traefik, I only had HTTP set up. In this case, however, I needed both HTTP and gRPC. While the `temporal-web` service listens on port 8088, an HTTP port, the `temporal` service (renamed to `temporal-app` in the `[temporal.nomad](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/jobs/temporal.nomad)` Jobspec) listens on port `7233`, which is a [gRPC](https://grpc.io/docs/what-is-grpc/introduction/) port.

Below is our Traefik Jobspec, with gRPC config included. For the purposes of this post, I will only focus on the gRPC config.

Let’s look at the noteworthy items.

**1- gRPC port definition**

We added a new port to the `[network](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L9-L28)` stanza ([lines 24–26](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L24-L26)):

port "grpc" {  
  static = 7233  
}

This means that all gRPC services are mapped to external port `7233`. You’ll notice that in the [Docker Compose](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml) file, the `temporal` service listens on port `7233`([lines 26–27](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L26-L27)). Now, we could’ve set the external port to `4125` (or whatever…as long as it doesn’t conflict with another external port). What matters is that the _internal_ port for the `termporal` service is `7233`, because that’s the port that the `temporal` service listens on. We set that in `[temporal.nomad](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad#L10-L12)`, which we’ll cover later.

This means that when we connect to the `temporal` service, we would be connecting to `<myhost>:7233`. If we chose to set the external port to `4125`, we would connect to `<myhost>:4125`. In both cases, Traefik would route to internal port `7233`.

Clear as mud?

**2- gRPC service definition**

We added a new `service` stanza called `traefik-entrypoint-grpc` ([lines 30–39](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L30-L39)):

service {  
  name = "traefik-entrypoint-grpc"  
  port = "grpc"

  check {  
    type     = "tcp"  
    interval = "10s"  
    timeout  = "5s"  
  }  
}

Note that it is referencing our `[grpc](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L24-L26)` [port](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L24-L26), which we talked about in **1- gRPC port definition** above.

**3- gRPC entrypoint configuration in traefik.toml**

We use the `[template](https://www.nomadproject.io/docs/job-specification/template)` stanza to inject the `traefik.toml` config into our Traefik container instance. The final step to enable gRPC in Traefik is to configure a gRPC entrypoint ([lines 79–80](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L79-L80)):

\[entryPoints\]  
    \[entryPoints.web\]  
    address = ":80"  
    \[entryPoints.metrics\]  
    address = ":8082"  
    \[entryPoints.grpc\]  
    address = ":7233"

The last two lines above are of particular interest to us, since they define the gRPC entrypoint:

\[entryPoints.grpc\]  
address = ":7233"

Note how the gRPC entrypoint points to port `7233`, which we defined earlier, in the `[network](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L24-L26)` stanza.

### Temporal Services Setup

As I mentioned earlier, we only care about the `[temporal](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L12-L29)` and `[temporal-web](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L41-L52)` services from the [Docker Compose file](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml). We can include both of these as two separate tasks in the same Jobspec.

Here’s what our Jobspec looks like:

A few noteworthy items:

**1- Temporal Port Definitions**

From our [Docker Compose YAML](https://github.com/temporalio/docker-compose/blob/main/docker-compose-mysql.yml), we can see that the `temporal` service (which I renamed to `temporal-app` in this Jobspec) listens on port `7233` ([lines 26–27](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L26-L27)) which, you may recall from the Traefik confg section, is a gRPC port. The `temporal-web` service ([lines 51–52](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L51-L52)) listens on port `8088`.

We define these in our `[network](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad#L7-L17)` stanza of `[temporal.nomad](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/jobs/temporal.nomad)`, as per below:

network {  
   mode = "bridge"

   port  "temporal-app"{  
      to = 7233  
   }

   port  "temporal-web"{  
     to = 8088  
   }  
}

**2- Temporal Service Definitions**

In order to do something useful with each port, we must define a service which uses it. This is where the `temporal-app` ([lines 19–28](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad#L19-L28)) and `temporal-web` ([lines 30–40](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad#L30-L40)) services come in.

Let’s start with the `temporal-app` service:

service {  
  name = "temporal-app"  
  tags = \[  
    "traefik.tcp.routers.temporal-app.rule=HostSNI(\`\*\`)",  
    "traefik.tcp.routers.temporal-app.entrypoints=grpc",  
    "traefik.enable=true",  
  \]

  port = "temporal-app"  
}

Note that we’re associating this service to the port named `temporal-app`, which maps to port `7233`.

The `traefik.tcp.routers.temporal-app.entrypoints=grpc` tag tells us to use the Traefik `grpc` entrypoint. (_Hint: Remember when we defined that in lines_ [_79–80_](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L79-L80) _in_ `[_traefik.nomad_](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad)`_?_)

The ``traefik.tcp.routers.temporal-app.rule=HostSNI(`*`)`` is a bit of a weird one. Normally, I’d want to use something like `temporal-app.localhost` instead of `*`. Unfortunately, if you want to use a TCP router (which is what you need to use for gRPC with Traefik) without TLS, [this is the way to go](https://community.traefik.io/t/configuration-of-non-http-port-without-tls/5901/2). If you try to put something other than `*`, Traefik. Will. Scream. At. You. 😱

I don’t have TLS setup (that’s a whole other can of worms), so `*` it is.

Next, we have the `temporal-web` service definition:

service {  
  name = "temporal-web"  
  tags = \[  
     "traefik.http.routers.temporal-web.rule=Host(\`temporal-web.localhost\`)",  
     "traefik.http.routers.temporal-web.entrypoints=web",  
     "traefik.http.routers.temporal-web.tls=false",  
     "traefik.enable=true",  
  \]

   port = "temporal-web"  
}

Note that we’re associating this service to the port named `temporal-web`, which maps to port `8088`.

The `traefik.http.routers.temporal-web.entrypoints=web` tag tells us to use the Traefik `http` entrypoint. (_Hint: That’s defined in lines_ [_75–76_](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad#L75-L76) _of_ `[_traefik.nomad_](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/traefik.nomad)`_._)

The ``traefik.http.routers.temporal-web.rule=Host(`temporal-web.localhost`)``. Unlike its gRPC buddy, we don’t have to deal with wildcard weirdness, because we can explicitly tell Traefik to disable TLS, which we do with this tag: `traefik.http.routers.temporal-web.tls=false`. And no, in case you’re wondering, you can’t disable TLS the same way for the gRPC config. Been there, done that, tried and failed.

**3- temporal-app Task Definition**

This is the `temporal-app` task is defined in lines [42–119](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad#L42-L119) of `[temporal.nomad](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad)`. I will cover the noteworthy items.

First, we have the environment variables definition below.

env {  
   DB = "mysql"  
   DB\_PORT = 3306  
   MYSQL\_USER = "root"  
   MYSQL\_PWD = "password"  
   DYNAMIC\_CONFIG\_FILE\_PATH = "config/dynamicconfig/development.yaml"  
   BIND\_ON\_IP = "0.0.0.0"  
   TEMPORAL\_BROADCAST\_ADDRESS = "127.0.0.1"  
}

These values were poached from environment config section in the [Docker Compose YAML](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml) ([lines 16–22](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L16-L22)).

environment:  
   - DB=mysql  
   - DB\_PORT=3306  
   - MYSQL\_USER=root  
   - MYSQL\_PWD=root  
   - MYSQL\_SEEDS=mysql  
   - DYNAMIC\_CONFIG\_FILE\_PATH=config/dynamicconfig/development\_sql.yaml

It’s mostly the same, except for a couple of items:

1- I added `BIND_ON_IP` and `TEMPORAL_BROADCAST_ADDRESS` after reading [this post](https://github.com/temporalio/temporal/issues/471?utm_source=pocket_mylist#issuecomment-999011873).

2- I had to change the value of `MYSQL_SEEDS`. `MYSQL_SEEDS` (which is a **_terrible_** name, BTW). This weirdly-named environment variable refers to your MySQL host name. Yeah. Riddle me that. But I digress…In Nomad, I could’ve just as easily replaced it with `MYSQL_SEEDS=192.168.56.192` (i.e. the IP address of my HashiQube VM). BUT, that’s not the proper way to do it. Instead, I added the lines below (see [lines 66–74](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad#L66-L74) in [temporal.nomad](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad)):

template {  
   data = <<EOF  
{{ range service "mysql-server" }}  
MYSQL\_SEEDS = "{{ .Address }}"  
{{ end }}  
EOF  
   destination = "local/env"  
   env         = true  
}

What’s happening? I’m dynamically populating the `MYSQL_SEEDS` environment variable using Consul to look up the address of the `mysql-server` service. Wait…what? It’s registered in Consul? Yup! If you’re using HashiQube (see instructions in Part 2), you’ll be able to check out what’s in Consul by going to `[http://localhost:8500](http://localhost:8500.)`, and you’ll see something like this:

![Screen shot of the Consul console showing all registered services](https://cdn-images-1.medium.com/max/800/1*t7DO7um8UTbNhbfheYSOZw.png)

Consul console showing all registered services

How cool is this? The `mysql-server` service got automagically registered in Consul when we deployed it to Nomad. Pretty cool, right?!

3- I inject the contents of `development.yaml` (the config file used by Temporal) into our container instance using the template stanza ([lines 76–117](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad#L76-L117) in `[temporal.nomad](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad)`). I do this in lieu of the volume mapping which makes `development-sql.yaml` on the host machine available to the container instance in [lines 28–29](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L28-L29) of the [Docker Compose YAML](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml).

**4- temporal-web Task Definition**

The `temporal-web` task definition is a little more straightforward. Compared to its buddy. The only major thing of note here is the environment vars definition ([lines 124–127](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad#L124-L127) of `[temporal.nomad](https://github.com/avillela/hashiqube/blob/c66fb61a6300e81f3cf72a20ef4f6cea23cdbe90/hashicorp/nomad/jobs/temporal.nomad)`):

env {  
   TEMPORAL\_GRPC\_ENDPOINT = "127.0.0.1:7233"  
   TEMPORAL\_PERMIT\_WRITE\_API = true  
}

The only thing I want to call out here is the fact that here, we set `TEMPORAL_GRPC_ENDPOINT` to `127.0.0.1:7233`, whereas in the [Docker Compose](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml) version ([line 46](https://github.com/temporalio/docker-compose/blob/5cacb558f2a94ae1a68cd3231f10d6ebf85dc6bc/docker-compose-mysql.yml#L46)), we set it to `temporal:7233`. At the end of the day, the value must be the Temporal hostname. In our case, we can get away with `127.0.0.1`, because inside Nomad, these services are running on `127.0.0.1`.

### Part 2: Running the Temporal Example

I will be using a [modified version of the HashiQube Repo](https://github.com/avillela/hashiqube) (a fork of `[servian/hashiqube](https://github.com/servian/hashiqube)`) for today’s tutorial. It includes all of the source files that you created in **_Part 1_**.

If you’re curious, you can see what modifications I’ve made [here](https://github.com/avillela/hashiqube).

#### 1- Provision a Local Hashi Environment with HashiQube

**Start HashiQube by following the detailed instructions** [**here**](https://github.com/avillela/hashiqube#quickstart)**.**

> **_Note:_** _Be sure to check out the_ **_“_**[**_Gotchas_**](https://github.com/avillela/hashiqube#gotchas)**_”_** _section, if you get stuck._

Once everything is up and running (this will take several minutes, by the way), you’ll see this in the tail-end of the startup sequence, to indicate that you are good to go:

![Final output of the Vagrant VM startup sequence](https://cdn-images-1.medium.com/max/800/0*VTG553-8ZgG7Pihk.png)

Final output of the Vagrant VM startup sequence

You can now access the services below:

*   **Vault:** [http://localhost:8200](http://localhost:8200/)
*   **Nomad:** [http://localhost:4646](http://localhost:4646/)
*   **Consul:** [http://localhost:8500](http://localhost:8500/)
*   **Traefik:** [http://traefik.localhost](http://traefik.localhost/)
*   **Waypoint:** [https://192.168.56.192:9702](https://192.168.56.192:9702/)

#### 2- Install the Temporal CLI & gRPCurl

I highly recommend installing the Temporal CLI, `tctl`. You can use it in lieu of the Temporal Web UI, or in conjunction with it. It can also be very handy for troubleshooting your Temporal installation.

To install `tctl` on Mac via Homebrew:

brew install tctl

For non-Mac folks, check out the instructions [here](https://docs.temporal.io/docs/tctl/how-to-install-tctl).

We’ll also be installing `grpcurl`. The `grpcurl` tool is like `curl`, but for gRPC. This is handy to have, because Temporal runs on gRPC, so we can use it to troubleshoot our Temporal installation.

To install `grpcurl` on Mac via Homebrew:

brew install grpcurl

For non-Mac folks, check out the instructions [here](https://aristanetworks.github.io/openmgmt/examples/gnoi/grpcurl/#install-grpcurl).

#### 3- Deploy the Temporal Jobspec

As we covered in **Part 1** above, our Temporal setup relies on three Nomad Jobspecs:

1.  Traefik
2.  MySQL
3.  Temporal services (main Temporal app, Web UI, and admin tools)

The Traefik and MySQL jobs were already deployed as part of our HashiQube provisioning process, so we can skip those, as we can see per the screen shot below. You can see this by going to `http://localhost:4646`.

![Screen shot of Nomad console showing the Traefik and MySQL jobs that were deployed during the HashiQube VM provisioning.](https://cdn-images-1.medium.com/max/800/1*qD6HRZGv9s3Js_SNGLi1tQ.png)

MySQL and Traefik jobs were already deployed during VM provisioning

This leaves us with just deploying `temporal.nomad`. Let’s do that right now. Open up a terminal window on your host machine (i.e. your non-VM), and make sure that you navigate to the HashiQube directory. Once you’re there, run the following:

nomad job run hashicorp/nomad/jobs/temporal.nomad

You should see something like this:

![Screen shot of the output after deploying the temporal.nomad jobspec](https://cdn-images-1.medium.com/max/800/1*-iZki9qLATtwq_UiLaPc5g.png)

Successful Temporal deployment to Nomad

If you open up your Nomad UI at `http://localhost:4646`, you’ll see something like this:

![Screen shot of the Temporal deployment on the Nomad UI](https://cdn-images-1.medium.com/max/800/1*viBzCPLFTKHKcYpA6ki8ug.png)

Temporal deployment on the Nomad UI

If we take a peek at the temporal job in Nomad, we can see the 2 tasks discussed in Part 1:

1.  `temporal-web` (runs on HTTP)
2.  `temporal-app` (runs on gRPC)

How do we do this? Let’s use the CLI to take a looksie:

export ALLOCATION\_ID=(nomad job allocs -json temporal | jq -r '.\[0\].ID')

nomad alloc status $ALLOCATION\_ID

Which gives you something like this:

![Screen capture of Nomad allocation for Temporal job, after running nomad alloc status $ALLOCATION\_ID](https://cdn-images-1.medium.com/max/800/1*IaDiOg1U4iXDrks2LyhKBQ.png)

Output of Temporal job allocation summary

Hurray! You’ve got temporal installed! But wait…how do we know that it’s actually working??

#### 4- Test the Temporal installation

We can test our Temporal installation in a few ways.

First, let’s see if we can hit that Temporal UI. It connects to the `temporal-app` service defined in [lines 44–128](https://github.com/avillela/hashiqube/blob/2aea8a8b511d019d4010230cc9d7010bcce4ea14/hashicorp/nomad/jobs/temporal.nomad#L44-L128) of `[temporal.nomad](https://github.com/avillela/hashiqube/blob/2aea8a8b511d019d4010230cc9d7010bcce4ea14/hashicorp/nomad/jobs/temporal.nomad)`, so being able to see the UI without any errors is a good start. To view the UI, go to `http://temporal-web.localhost` in your Web browser.

If you see something like the screen shot below, it’s a good start!

![Screen shot of the Temporal UI upon initial deployment](https://cdn-images-1.medium.com/max/800/1*JcyswTaN1p2k1k5TV5BYPQ.png)

Temporal UI upon initial deployment

Another way to test the `temporal-app` service is by using the `grpcurl` command (remember we installed that earlier). Let’s run this:

grpcurl --plaintext temporal-app.localhost:7233 list

If all goes well, you should get something like this:

![Sample output of running grpcurl against the temporal-app service](https://cdn-images-1.medium.com/max/800/1*MFozP_-zFR0hp8WVombalg.png)

Sample output of running grpcurl against the temporal-app service

And finally, we can also use `tctl` to make sure that everything is copacetic:

tctl --address temporal-app.localhost:7233 --context\_timeout 45 namespace list

This is probably the simplest Temporal command (that I’ve found so far) you can to hit the API endpoints on the `temporal-app` service. All it does it list our Temporal namespaces (some default ones are created on startup).

If all goes well, you should see something like this:

![Screen shot of the sample output resulting from running tctl namespace list](https://cdn-images-1.medium.com/max/800/1*beSHSRGEXfWyueWm6rlpkA.png)

Sample output from running tctl namespace list

It’s aliiiiiiive!!

Take careful note of the `--context_timeout` parameter in our `tctl` command used above. While this value is optional (timeout value is specified in seconds), I highly recommend that you include it, especially when running Temporal locally on HashiQube, because for some reason, resolving `temporal-app.localhost` seems to be rather slooooowwwww. 🐌 Without it, the request times out on a local setup, and you get a super-nasty `rpc error: code = DeadlineExceeded desc = context deadline exceeded`, as per the screen shot below:

![Screen capture of the error message that you can get when you don’t specify the --context\_timeout parameter in tctl.](https://cdn-images-1.medium.com/max/800/1*pIeB0f0CpXJuAE4nMMI2Ew.png)

Error message when you don’t specify the `--context_timeout` parameter in `tctl`.

Moral of the story: include `--context_timeout`…Future You will thank you.

#### 5- Run the sample app

Now that we’re reasonably certain that Temporal is running properly, let’s run the sample app. This example is based on the `[temporalio/hello-world-project-template-go](https://github.com/temporalio/hello-world-project-template-go)` GitHub repo.

Let’s start by cloning the sample repo. Open up a terminal window, and run the following command:

git clone git@github.com:avillela/temporal-example.git

The example has a Workflow worker component, and a sample app that kicks off the workflow. First, let’s kick off the worker. To do this, open up a terminal window, making sure that you’re in the `temporal-example` repo root, and then run:

cd example  
go run worker/main.go

If all goes well, you should see something like this:

![Screen capture of the sample output after starting the worker](https://cdn-images-1.medium.com/max/800/1*6ztL7qN3Rozs7_P5vnr0aA.png)

Sample output after starting the worker

Next, let’s start the sample app. To do this, open up a terminal window, making sure that you’re in the `temporal-example` repo root, and then run:

cd example  
go run start/main.go

If all goes well, you should see something like this:

![Screen capture showing sample output after running the Hello World app](https://cdn-images-1.medium.com/max/800/1*kf0Sx8mIuod64dozT6BRDw.png)

Sample output after running the Hello World app

If you head on back to your worker terminal window, you should now see something like this:

![Screen capture of the sample output for the worker after running the Hello World app](https://cdn-images-1.medium.com/max/800/1*zjVHmiQ-zplyUCyoCC7hZQ.png)

Sample output for the worker after running the Hello World app

And if we go to the Temporal UI at `http://temporal-web.localhost`, we should see something like this:

![Screen shot of Temporal UI with completed workflow](https://cdn-images-1.medium.com/max/800/1*2Eu-x3ynEkJ1OXc7r8i5YA.png)

Screen shot of completed Workflow

Ta-da! We have successfully created our first Temporal workflow! 🎉

#### Gotchas

Once I sorted everything out with my Nomad setup, I thought I was for sure in for smooth sailing. I. Was. So. Wrong. Instead, I was gifted a new set of problems, when I attempted to go through the [Temporal Hello World tutorial](https://docs.temporal.io/docs/go/hello-world-tutorial/). Wheeee!

As I mentioned earlier, the above example is based on the `[temporalio/hello-world-project-template-go](https://github.com/temporalio/hello-world-project-template-go)` GitHub repo. Since the example didn’t work right out of the box for me, I needed to make a few adjustments to the code. Hence, the separate repo. I want to highlight my adjustments here, to save Future You from why-is-my-blasted-code-not-working despair. You’re welcome. 😊

The first issue I ran into is that the sample app kept trying to connect to Temporal at `localhost:7233`. Okay…obviously this is configurable, but WHERE does this configuration take place? After a lot of desperate Googling through various samples in the [Temporal Go examples repo](https://github.com/temporalio/samples-go) (different repo from the Hello World sample repo 🤦‍♀️ ), and madly going through the [Temporal API docs](https://pkg.go.dev/go.temporal.io/sdk@v1.13.1), I finally found the culprit!

You see, the Go example starts by creating connection to Temporal, like the snippet below (see for yourself [here](https://github.com/temporalio/hello-world-project-template-go/blob/f9a31424ee9e3010118a7656329f2219633e1fc6/start/main.go#L16)):

c, err := client.NewClient(client.Options{})

When you leave `client.Options` empty, as above, the client connects to `localhost:7233`. To connect to something other than localhost:7233, you have to set a `HostPort` attribute in `client.Options`. `HostPort` rather poorly-named, in my opinion. At first I thought it referred to the port number only, so I kept looking for a `HostName` attribute. Spoiler alert: it doesn’t exist. Turns out that `HostPort` actually refers to the host name AND port number.

Ah, but my woes did not end there! Because alas, even after I connected to the Temporal service, I started getting the dreaded `context deadline exceeded` error. I fixed that by disabling health checks, and that seemed to do the trick.

> **Note:** _I admit that DisableHealthCheck is a rather brute force approach to getting rid of this error, but desperate times call for desperate measures. If you know if a better way to make this error message go away without disabling Health Checks, let me know!_

Sooo…after setting the correct Temporal service host and port, and disabling health checks, our code has gone from this:

c, err := client.NewClient(client.Options{})

To this:

c, err := client.NewClient(client.Options{  
  HostPort:  "temporal-app.localhost:7233",  
  ConnectionOptions: client.ConnectionOptions{  
   DisableHealthCheck: true,  
  },  
 })

To see what this looks like in the full source file, check out [lines 16–21](https://github.com/avillela/temporal-example/blob/8783fa0f2a9445c449ecae967995b03ff50b96c3/examples/worker/main.go#L16-L21) of `[worker/main.go](https://github.com/avillela/temporal-example/blob/8783fa0f2a9445c449ecae967995b03ff50b96c3/examples/worker/main.go)` and [lines 16–21](https://github.com/avillela/temporal-example/blob/8783fa0f2a9445c449ecae967995b03ff50b96c3/examples/start/main.go#L16-L21) of `[start/main.go](https://github.com/avillela/temporal-example/blob/8783fa0f2a9445c449ecae967995b03ff50b96c3/examples/start/main.go)`.

Great. Problem solved, right? Not so fast there, Slick.

While I was now able to successfully connect to the Temporal service thanks to the above modifications, I still kept getting that pesky `context deadline exceeded` error when I ran the sample code.

![Screen shot of the “context deadline exceeded” error.](https://cdn-images-1.medium.com/max/800/1*QEpToWNTzZHvHF62ftQiFg.png)

Arrrgh!!!

This one was a bit harder to find. I actually went into the Temporal Web UI, clicking on the offending workflow to see if I could get anymore insight into what was up.

![Screen shot of the Temporal Web UI, showing workflow listings](https://cdn-images-1.medium.com/max/800/1*SF8giLos9X3Bzr564aAVIQ.png)

And what I saw was this:

![Screen shot of the detailed workflow view in the Temporal Web UI.](https://cdn-images-1.medium.com/max/800/1*6qO47T2AOPdbKm_uhTwmkw.png)

Something is definitely fishy…

Specifically, the `“activity StartToClose timeout”` error message caught my eye.

So, after some panicked Googling, I found the next culprit. This time, it was hiding in `[workflow.go](https://github.com/avillela/temporal-example/blob/8783fa0f2a9445c449ecae967995b03ff50b96c3/examples/workflow.go)`, which is invoked by `[worker/main.go](https://github.com/avillela/temporal-example/blob/main/examples/worker/main.go)`. Below is the original (problem) code (see original source [here](https://github.com/temporalio/hello-world-project-template-go/blob/f9a31424ee9e3010118a7656329f2219633e1fc6/workflow.go#L11-L13)):

options := workflow.ActivityOptions{  
  StartToCloseTimeout: time.Second \* 5,  
 }

To fix it, I included [lines 12–18](https://github.com/avillela/temporal-example/blob/8783fa0f2a9445c449ecae967995b03ff50b96c3/examples/workflow.go#L12-L18) in `[workflow.go](https://github.com/avillela/temporal-example/blob/8783fa0f2a9445c449ecae967995b03ff50b96c3/examples/workflow.go)` when setting the `workflow.ActivityOptions`:

options := workflow.ActivityOptions{  
  StartToCloseTimeout: time.Minute \* 45,  
  HeartbeatTimeout:    time.Minute \* 10,  
  WaitForCancellation: false,  
 }

The initial value of `StartToCloseTimeout` in the original example was 5 seconds, and `HeartbeatTimeout` and `WaitForCancellationTimeout` hadn’t been set at all. My salvation came from [this](https://docs.temporal.io/blog/activity-timeouts/#step-1---workflow-worker) article, which suggested setting all 3 values above, and making them big, beefy values (minutes, as opposed to seconds). After that, no more pesky error! 🎉

### Conclusion

Congratulations! You can now run Temporal on Nomad! Give yourself a pat on the back! We learned how to run Temporal on Nomad. As part of our journey, we learned:

*   How to a MySQL database in Nomad using Host Volumes.
*   How to set up gRPC in Traefik. Very handy, since Temporal uses gRPC.

We were also able to get a simple Temporal Hello World example going, after we got past some nasty gotchas.

All in all, a pretty great day.

Now, please enjoy of my pet rats, Phoebe and Chrissy, as they cuddle together in their hammock. Aren’t they cuuuute?

![Two fancy rats cuddling in a hammock.](https://cdn-images-1.medium.com/max/800/1*PrfeQTZG4vCBKuKo5vwJ3A.jpeg)

Photo by R.I. Maxwell

Peace, love, and code. ☮️ ❤️ 👩‍💻

### Acknowledgements

Big thanks to [David Alfonzo](https://medium.com/u/dc7fdf56954c) for helping me sort out gRPC on Traefik!

### Related Reading

Be sure to check out my other stories on Nomad in my Just-in-Time Nomad series!

### References & Resources

*   [Quick Install Temporal Server for Testing and Local Development](https://docs.temporal.io/docs/server/quick-install)
*   [Temporal CLI Overview](https://docs.temporal.io/docs/tctl/)
*   [Temporal Web UI Overview](https://docs.temporal.io/docs/devtools/web-ui/)
*   [Temporal Go SDK Samples](https://github.com/temporalio/samples-go?utm_source=pocket_mylist)
*   [The Lifecycle of an Activity](https://docs.temporal.io/blog/activity-timeouts/#lifecycle-of-an-activity)
*   [Temporal “Hello World” Tutorial](https://docs.temporal.io/docs/go/hello-world-tutorial/)
*   [Temporal Go Samples Repo on GitHub](https://github.com/temporalio/samples-go)
*   [gRPCurl Installation and Resources](https://aristanetworks.github.io/openmgmt/examples/gnoi/grpcurl/#install-grpcurl)
*   [Stateful Workloads with Nomad Host Volumes](https://learn.hashicorp.com/tutorials/nomad/stateful-workloads-host-volumes?in=nomad/stateful-workloads)
*   [GitHub Issue: temporal Docker fails to bind on multiple interfaces](https://github.com/temporalio/temporal/issues/471?utm_source=pocket_mylist#issuecomment-999011873)
*   [Traefik Forums: Configuration of Non-HTTP Port without TLS](https://community.traefik.io/t/configuration-of-non-http-port-without-tls/5901/2)

[![](https://cdn-images-1.medium.com/max/800/1*BCiLLad3dvZLwBa-B5cAVQ.png)](https://faun.to/bP1m5)

Join FAUN: [**Website**](https://faun.to/i9Pt9) 💻**|**[**Podcast**](https://faun.dev/podcast) 🎙️**|**[**Twitter**](https://twitter.com/joinfaun) 🐦**|**[**Facebook**](https://www.facebook.com/faun.dev/) 👥**|**[**Instagram**](https://instagram.com/fauncommunity/) 📷|[**Facebook Group**](https://www.facebook.com/groups/364904580892967/) 🗣️**|**[**Linkedin Group**](https://www.linkedin.com/company/faundev) 💬**|** [**Slack**](https://faun.dev/chat) 📱**|**[**Cloud Native** **News**](https://thechief.io) 📰**|**[**More**](https://linktr.ee/faun.dev/)**.**

**If this post was helpful, please click the clap 👏 button below a few times to show your support for the author 👇**

By [Adriana Villela](https://medium.com/@adri-v) on [March 16, 2022](https://medium.com/p/5fee139f37ea).

[Canonical link](https://medium.com/@adri-v/just-in-time-nomad-running-temporal-on-nomad-5fee139f37ea)

Exported from [Medium](https://medium.com) on June 3, 2026.