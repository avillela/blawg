---
title: "How to Convert Kubernetes Manifests into Nomad Jobspecs"
slug: how-to-convert-kubernetes-manifests-into-nomad-jobspecs
description: "A beginner’s guide to migrating apps from Kubernetes to Nomad"
added: "Dec 19, 2022"
tags:
  - technical
  - kubernetes
  - nomad
---

# How to Convert Kubernetes Manifests into Nomad Jobspecs

![Cattails in the foreground, with a blue pond in the background.](https://cdn-images-1.medium.com/max/800/0*64xxAgjBbvhvXmsO)

Cattails at Toronto’s Don Valley Golf Course. Photo by [Adri Villela](https://adri-v.medium.com).

Ever since I started [exploring Nomad](https://medium.com/@adri-v/list/justintime-nomad-cc5d249a172b), one of the things that I’ve enjoyed doing is taking [Docker Compose files](https://www.baeldung.com/ops/docker-compose) and [Kubernetes manifests](https://stackoverflow.com/a/55132302), and translating them into [HashiCorp Nomad](https://nomadproject.io/) [jobspec](https://developer.hashicorp.com/nomad/docs/job-specification). I did it for [Temporal back in March 2022,](https://medium.com/faun/just-in-time-nomad-running-temporal-on-nomad-5fee139f37ea) and also for an [early version of Tracetest, back in the summer of 2022](https://github.com/lightstep/tracetest-nomad).

In my latest Nomadification Project (TM), I got the [OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) to run on Nomad (with [HashiQube](https://medium.com/@adri-v/list/hashiqube-bfdcb9c84e10), _of course_). To do this, I used the [OpenTelemetry Demo App Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo) as my guide. In doing this, and other Nomadifications, I realized that I’ve never gone through the process of explaining the conversion process from Kubernetes manifests to Nomad jobspecs.

So, as you may have guessed, today, I will go through the process of converting Kubernetes manifests to Nomad jobspecs, so that if you ever find yourself in a situation whereby you’re thinking, “Gee, it would be nice to see this Kubernetes stuff running on Nomad,” you now have a process!

I’ll use examples from the work I did recently in converting the [OpenTelemetry Demo App Helm Charts](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo) into Nomad jobspecs to illustrate the process.

Are you ready? Let’s do this!

### Manifests and Helm Charts and Jobspecs…oh my!

While I like working with both Kubernetes and Nomad alike, there is one thing that I find exceedingly irritating in Kubernetes Land: the fact that a Kubernetes manifest for an app deployment is made up of a scavenger hunt of YAML definitions of various Kubernetes objects. Nomad, however, takes a different approach, using a single [HashiCorp Configuration Language (HCL)](https://github.com/hashicorp/hcl) [jobspec](https://developer.hashicorp.com/nomad/docs/job-specification) file as a one-stop shop for defining your app. I personally find Nomad HCL a lot easier to manage, since there are fewer moving parts, and when it comes to converting Kubernetes manifests to Nomad jobspecs, I find that having a single file to work with makes things a lot simpler.

In order to convert a Kubernetes manifest into a Nomad jobspec, we first need to start with a basic Nomad jobspec. This will serve as a template for deploying our application in Nomad.

Let’s start with our template jobspec below. Please bear in mind that this is a starting point for our conversion. After all, some services are more complex than others, so while for some services, we need all of the components below to be included in our jobspec, for other services, we may end up with a more pared down version of the jobspec.

job "<service\_name>" {  
  type        = "service"  
  datacenters = \["dc1"\]  
  
  group "<service\_name>" {  
    count = 1  
  
    network {  
      mode = "host"  
  
      port "<port\_name>" {  
        to = <port\_number>  
      }  
    }  
  
    service {  
      name = "<service\_name>"  
      port = "<port\_name>"  
      tags = \[<tags\_here>\]  
  
      check {  
        <service\_check\_here>  
      }  
    }  
  
   
    task "<service\_name>" {  
      driver = "docker"  
   
      config {  
        image = "<image\_name>"  
        image\_pull\_timeout = "25m"  
        args = \[<args\_go\_here>\]  
        ports = \["<port\_name>"\]  
      }  
  
      restart {  
        attempts = 10  
        delay    = "15s"  
        interval = "2m"  
        mode     = "delay"  
      }  
  
      env {  
          <env\_vars\_here>  
      }        
  
      template {  
        data = <<EOF  
<env\_vars\_derived\_from\_consul>  
EOF  
        destination = "local/env"  
        env         = true  
      }  
  
      resources {  
        cpu    = 60  
        memory = 650  
      }  
  
    }  
  }  
}

Great…so now we’ve got our jobspec template. Yay! But we need to fill in the blanks, don’t we? So…where do we start?

Since we’re going from Kubernetes to Nomad, we need to look at the application’s Kubernetes manifest. Fortunately, we can grab this info easily from the [OTel Helm Charts Repo](https://github.com/open-telemetry/opentelemetry-helm-charts), which, as you may have guessed, has a [Helm Chart for the OTel Demo App](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo). It also contains the rendered YAML manifests available to us [here](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/examples/default/rendered/component.yaml).

The OpenTelemetry Demo App is made up of a number of services. The process of converting the Kubernetes manifest of each service to its corresponding Nomad jobspec is very similar, so in the interest of not boring you to death, I’ll be choosing one service to illustrate the conversion: the [featureflagservice](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/featureflagservice).

### Conversion Process

With the Nomad jobspec template and Kubernetes manifest in hand, we are ready to begin the conversion!

> **NOTE:** _You can find the repo with all of the OpenTelemetry Demo App jobspec files_ [_here_](https://github.com/avillela/nomad-conversions/tree/main/otel-demo-app)_._

#### 1- Grab the Kubernetes manifests

As I mentioned earlier, the rendered YAML manifests for the OpenTelemetry Demo App are available to us here. Since, for the purposes of this tutorial, we only care about the [featureflagservice](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/featureflagservice)’s Kubernetes manifest, I’ve gone ahead and grabbed the manifest pertaining to the [featureflagservice](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/featureflagservice), which is made up of a [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) and a [Service](https://kubernetes.io/docs/concepts/services-networking/service/), as per below.

Here is the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901):

\---  
\# Source: opentelemetry-demo/templates/component.yaml  
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: example-featureflagservice  
  labels:  
    helm.sh/chart: opentelemetry-demo-0.14.3  
    app.kubernetes.io/name: example  
    app.kubernetes.io/instance: example  
    app.kubernetes.io/component: featureflagservice  
    app.kubernetes.io/version: "1.2.1"  
    app.kubernetes.io/part-of: opentelemetry-demo  
    app.kubernetes.io/managed-by: Helm  
spec:  
  selector:  
    matchLabels:  
      app.kubernetes.io/name: example  
      app.kubernetes.io/instance: example  
      app.kubernetes.io/component: featureflagservice  
  template:  
    metadata:  
      labels:  
        app.kubernetes.io/name: example  
        app.kubernetes.io/instance: example  
        app.kubernetes.io/component: featureflagservice  
    spec:  
      containers:  
        \- name: featureflagservice  
          image: 'ghcr.io/open-telemetry/demo:v1.2.1-featureflagservice'  
          imagePullPolicy: IfNotPresent  
          ports:  
            
          \- containerPort: 50053  
            name: grpc  
          \- containerPort: 8081  
            name: http  
          env:  
          \- name: OTEL\_SERVICE\_NAME  
            valueFrom:  
              fieldRef:  
                apiVersion: v1  
                fieldPath: metadata.labels\['app.kubernetes.io/component'\]  
          \- name: OTEL\_K8S\_NAMESPACE  
            valueFrom:  
              fieldRef:  
                apiVersion: v1  
                fieldPath: metadata.namespace  
          \- name: OTEL\_K8S\_NODE\_NAME  
            valueFrom:  
              fieldRef:  
                apiVersion: v1  
                fieldPath: spec.nodeName  
          \- name: OTEL\_K8S\_POD\_NAME  
            valueFrom:  
              fieldRef:  
                apiVersion: v1  
                fieldPath: metadata.name  
          \- name: FEATURE\_FLAG\_GRPC\_SERVICE\_PORT  
            value: "50053"  
          \- name: FEATURE\_FLAG\_SERVICE\_PORT  
            value: "8081"  
          \- name: OTEL\_EXPORTER\_OTLP\_TRACES\_PROTOCOL  
            value: grpc  
          \- name: DATABASE\_URL  
            value: ecto://ffs:ffs@example-ffspostgres:5432/ffs  
          \- name: OTEL\_EXPORTER\_OTLP\_ENDPOINT  
            value: http://example-otelcol:4317  
          \- name: OTEL\_RESOURCE\_ATTRIBUTES  
            value: service.name=$(OTEL\_SERVICE\_NAME),k8s.namespace.name=$(OTEL\_K8S\_NAMESPACE),k8s.node.name=$(OTEL\_K8S\_NODE\_NAME),k8s.pod.name=$(OTEL\_K8S\_POD\_NAME)  
          resources:  
            limits:  
              memory: 175Mi

Here is the [Service YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L121-L147):

\---  
\# Source: opentelemetry-demo/templates/component.yaml  
apiVersion: v1  
kind: Service  
metadata:  
  name: example-featureflagservice  
  labels:  
    helm.sh/chart: opentelemetry-demo-0.14.3  
    app.kubernetes.io/name: example  
    app.kubernetes.io/instance: example  
    app.kubernetes.io/component: featureflagservice  
    app.kubernetes.io/version: "1.2.1"  
    app.kubernetes.io/part-of: opentelemetry-demo  
    app.kubernetes.io/managed-by: Helm  
spec:  
  type: ClusterIP  
  ports:  
    \- port: 50053  
      name: grpc  
      targetPort: 50053  
    \- port: 8081  
      name: http  
      targetPort: 8081  
  selector:  
    app.kubernetes.io/name: example  
    app.kubernetes.io/instance: example  
    app.kubernetes.io/component: featureflagservice

Yikes! This all looks pretty overwhelming, doesn’t it? Fortunately, it’s not as scary as it looks. Don’t worry…I’ll guide you along. Let’s keep going.

#### 2- Prepare the jobspec

With our Kubernetes YAMLs in hand, let’s go back to our jobspec template from earlier, and fill in some blanks. Since we know that we’re working with the [featureflagservice](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/featureflagservice), I’ve gone ahead and replaced `<service_name>` with `featureflagservice`, which means that now our template looks like this:

job "featureflagservice" {  
  type        = "service"  
  datacenters = \["dc1"\]  
  
  group "featureflagservice" {  
    count = 1  
  
    network {  
      mode = "host"  
  
      port "<port\_name>" {  
        to = <port\_number>  
      }  
    }  
  
    service {  
      name = "<service\_name>"  
      port = "<port\_name>"  
      tags = \[<tags\_here>\]  
  
      check {  
        <service\_check\_here>  
      }  
    }  
  
   
    task "featureflagservice" {  
      driver = "docker"  
   
      config {  
        image = "<image\_name>"  
        image\_pull\_timeout = "25m"  
        args = \[<args\_go\_here>\]  
        entrypoint = \[<entrypoints\_go\_here>\]  
        ports = \["<port\_name>"\]  
      }  
  
      restart {  
        attempts = 10  
        delay    = "15s"  
        interval = "2m"  
        mode     = "delay"  
      }  
  
      env {  
          <env\_vars\_here>  
      }        
  
      template {  
        data = <<EOF  
<env\_vars\_derived\_from\_consul>  
EOF  
        destination = "local/env"  
        env         = true  
      }  
  
      resources {  
        cpu    = 60  
        memory = 650  
      }  
  
    }  
  }  
}

> **NOTE:** _You could technically give different names to your job, task and group, such as_ `_featureflagservice-job_`_,_ `_featureflagservice-task_` _and_ `_featureflagservice-group_` _(or really anything you want), but for the sake of simplicity (with a sprinkling of lack of originality), I decided to give them all the same name:_ `_featureflagservice_`_._

Some useful terminology:

*   `job` is the unit of control. The job is the thing that you start, stop, and update.
*   `group` is the unit of scale. The group defines how many instances you are running.
*   `task` is the unit of work. The task is what you actually want to run.

#### 3- Port definitions

The next set of blanks that we need to fill in are in the [network](https://developer.hashicorp.com/nomad/docs/job-specification/network) stanza. More specifically, the `<port_name>` and `<port_number>` values in the port stanza.

If we look at the [featureflagservice](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/featureflagservice)’s [Service YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L121-L147) above, you’ll notice that it exposes two ports: `50053` (gRPC) and `8081` (HTTP), per `spec -> ports -> targetPort`. Let’s plug these into our jobspec:

network {  
  mode = "host"  
  
  port "http" {  
    to = 8081  
  }  
  port "grpc" {  
    to = 50053  
  }  
}

As you can see per the snippet above, we labeled (named) our ports `http` and `grpc`. These labels will allow us to refer to those ports by a human-friendly label, rather than by number. Which means that if one or both of the port numbers change, we only need to make the change in one place. And spoiler alert: we will be referring to those ports elsewhere in the jobspec.

> **NOTE:** _Feel free to label your ports anything you want–just make sure that it’s reasonably descriptive._

#### 4- Service Definition

Now that we’ve defined our ports, we need to register our services, which is done by way of the [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) stanza. Since we have two ports in the [network](https://developer.hashicorp.com/nomad/docs/job-specification/network) stanza above, we need to define two [service](https://developer.hashicorp.com/nomad/docs/job-specification/service)s: one per port.

The [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) definition for the `http` port looks like this:

service {  
  name = "featureflagservice-http"  
  port = "http"  
  tags = \[  
    "traefik.http.routers.otel-collector-http.rule=Host(\`featureflag.localhost\`)",  
    "traefik.http.routers.otel-collector-http.entrypoints=web",  
    "traefik.http.routers.otel-collector-http.tls=false",  
    "traefik.enable=true",  
  \]  
  
  check {  
    type     = "tcp"  
    interval = "10s"  
    timeout  = "5s"  
  }  
}

Noteworthy items:

*   By default, the [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) is registered to [Consul](https://consul.io/). Although we don’t explicitly say so, it’s the equivalent of adding a `provider = “consul”` attribute to the [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) stanza. [You can register your services to either Nomad or Consul](https://developer.hashicorp.com/nomad/docs/job-specification/service#provider).
*   The [port](https://developer.hashicorp.com/nomad/docs/job-specification/service#port) attribute is the [network](https://developer.hashicorp.com/nomad/docs/job-specification/network) port label to which the [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) applies. You could totally use the port # of you wanted to as well.
*   The [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) is called `featureflagservice-http`. Again, you can call it whatever you want, though a descriptive name is always helpful.
*   We’re exposing this [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) to the outside world via [Traefik](https://traefik.io/), and the service is accessible via the URL: [http://featureflag.localhost](http://featureflag.localhost/) (since I’m [running this locally, using HashiQube](https://opentelemetry.io/blog/2022/otel-demo-app-nomad/)). Keep in mind that you also need to deploy the [Traefik jobspec](https://github.com/avillela/nomad-conversions/blob/main/otel-demo-app/jobspec/traefik.nomad) alongside the [featureflagservice jobspec](https://github.com/avillela/nomad-conversions/blob/main/otel-demo-app/jobspec/featureflagservice.nomad) in order to expose this service to the outside world. To learn more about running Traefik on Nomad, check out [this post](https://medium.com/@adri-v/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8) and [this post](https://medium.com/dev-genius/running-hashiqube-using-the-vagrant-docker-provider-3e551c0eca97).
*   The [check](https://developer.hashicorp.com/nomad/docs/job-specification/check) stanza runs a health check on the service Since the [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) is registered to Consul, the health check runs on Consul. The above health check is configured to run every 10 seconds, and is given 5 seconds for the health check query to succeed. Health checks in Nomad are similar to [Kubernetes liveness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-command). Setting the `on_update` attribute creates something closer to a [Kubernetes readiness probe](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes).

The service for the `grpc` port looks like this:

service {  
  name = "featureflagservice-grpc"  
  port = "grpc"  
  
  check {  
    type     = "tcp"  
    interval = "10s"  
    timeout  = "5s"  
  }  
}

Noteworthy items:

*   Since we’re not exposing any outside services, we don’t need the tags attribute with the Traefik configurations.
*   The port attribute refers to the grpc port that we defined in the network stanza earlier.
*   We’re doing the same health check that we did for the `http` port.

For additional examples health checks, check out:

*   A gRPC health check in the [recommendationservice jobspec](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/recommendationservice.nomad#L25-L30)
*   A command-based health check to check database connectivity in the [ffspostgres jobspec](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/ffspostgres.nomad#L63-L74)

#### 5- Task Definition

Okay…now we’re ready to define our [task](https://developer.hashicorp.com/nomad/docs/drivers/docker). Since we’re running a containerized workload, our task uses the [Docker driver](https://developer.hashicorp.com/nomad/docs/drivers/docker).

**Config Stanza**

Since we’re using the [Docker driver](https://developer.hashicorp.com/nomad/docs/drivers/docker), we need to provide the following information to Nomad via the config stanza:

*   **Name of the Docker image.** We get this information from [spec -> template -> spec -> containers -> image](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L858) in the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901). In this case, the image name is `ghcr.io/open-telemetry/demo:v1.2.1-featureflagservice`.
*   **Ports being used by the Docker image.** We get this information from [spec -> template -> spec -> containers -> ports](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L860-L865) in the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901). In this case, the image requires ports `50053` and `8081`, which we named http and grpc, respectively, in our jobspec’s [network](https://developer.hashicorp.com/nomad/docs/job-specification/network) stanza

apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: example-featureflagservice  
...  
spec:  
...  
    spec:  
      containers:  
        \- name: featureflagservice  
          image: 'ghcr.io/open-telemetry/demo:v1.2.1-featureflagservice'  
...

This translates to the `config` stanza of the `featureflagservice` [task](https://developer.hashicorp.com/nomad/docs/drivers/docker) looking like this:

config {  
  image = "ghcr.io/open-telemetry/demo:v1.2.1-featureflagservice"  
  image\_pull\_timeout = "25m"  
  ports = \["http", "grpc"\]  
}

A few noteworthy items:

*   Since there are no [args](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#define-a-command-and-arguments-when-you-create-a-pod) present in the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901), we’re omitting `args` from this jobspec. If you’d like to see an example of a jobspec that uses `args`, check out the [Prometheus jobspec](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/prometheus.nomad#L27-L40), and its corresponding [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/2e467f23fdb6a236abc7effb037ef9330bbbb9f1/charts/opentelemetry-demo/examples/default/rendered/prometheus/deploy.yaml#L38-L46).
*   Since there is no [command](https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#define-a-command-and-arguments-when-you-create-a-pod) present in the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901), we’re omitting the `entrypoint` from this jobspec. If you’d like to see an example of a jobspec that uses an `entrypoint`, check out the [OTel Collector jobspec](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/otel-collector.nomad#L54-L58), and its corresponding [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/opentelemetry-collector/deployment.yaml#L41-L46).
*   [image\_pull\_timeout](https://developer.hashicorp.com/nomad/docs/drivers/docker#infra_image_pull_timeout) is set to 25 minutes. This is an optional value, and if you leave it out, it defaults to 5 minutes. I set it to a high value because sometimes you just never know if your network decides to give you the finger, and [I don’t want the job to fail because it wasn’t able to pull the image](https://danielabaron.me/blog/nomad-tips-and-tricks/#increase-docker-pull-timeout) within the allotted time.

**Env Stanza**

We’re not quite done with configuring our featureflagservice [task](https://developer.hashicorp.com/nomad/docs/drivers/docker). If you look at the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901), you’ll notice that there are a number of environment variables under the `env` tag:

env:  
  \- name: OTEL\_SERVICE\_NAME  
    valueFrom:  
      fieldRef:  
        apiVersion: v1  
        fieldPath: metadata.labels\['app.kubernetes.io/component'\]  
  \- name: OTEL\_K8S\_NAMESPACE  
    valueFrom:  
      fieldRef:  
        apiVersion: v1  
        fieldPath: metadata.namespace  
  \- name: OTEL\_K8S\_NODE\_NAME  
    valueFrom:  
      fieldRef:  
        apiVersion: v1  
        fieldPath: spec.nodeName  
  \- name: OTEL\_K8S\_POD\_NAME  
    valueFrom:  
      fieldRef:  
        apiVersion: v1  
        fieldPath: metadata.name  
  \- name: FEATURE\_FLAG\_GRPC\_SERVICE\_PORT  
    value: "50053"  
  \- name: FEATURE\_FLAG\_SERVICE\_PORT  
    value: "8081"  
  \- name: OTEL\_EXPORTER\_OTLP\_TRACES\_PROTOCOL  
    value: grpc  
  \- name: DATABASE\_URL  
    value: ecto://ffs:ffs@example-ffspostgres:5432/ffs  
  \- name: OTEL\_EXPORTER\_OTLP\_ENDPOINT  
    value: http://example-otelcol:4317  
  \- name: OTEL\_RESOURCE\_ATTRIBUTES  
    value: service.name=$(OTEL\_SERVICE\_NAME),k8s.namespace.name=$(OTEL\_K8S\_NAMESPACE),k8s.node.name=$(OTEL\_K8S\_NODE\_NAME),k8s.pod.name=$(OTEL\_K8S\_POD\_NAME)

You can ignore the ones that start with `OTEL_K8S_`, as they are Kubernetes-specific; however we do care about these:

*   `OTEL_SERVICE_NAME`
*   `FEATURE_FLAG_GRPC_SERVICE_PORT`
*   `FEATURE_FLAG_SERVICE_PORT`
*   `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`
*   `DATABASE_URL`
*   `OTEL_EXPORTER_OTLP_ENDPOINT`
*   `OTEL_RESOURCE_ATTRIBUTES`

So how do we configure these in Nomad? Through the [task](https://developer.hashicorp.com/nomad/docs/drivers/docker)’s [env](https://developer.hashicorp.com/nomad/docs/job-specification/env) stanza. Which means that our environment variables look like this:

env {  
  FEATURE\_FLAG\_GRPC\_SERVICE\_PORT = "${NOMAD\_PORT\_grpc}"  
  FEATURE\_FLAG\_SERVICE\_PATH\_ROOT = "\\"/feature\\""  
  FEATURE\_FLAG\_SERVICE\_PORT = "${NOMAD\_PORT\_http}"  
  OTEL\_EXPORTER\_OTLP\_TRACES\_PROTOCOL = "grpc"  
  OTEL\_RESOURCE\_ATTRIBUTES = "service.name=featureflagservice"  
}

A few noteworthy items:

*   Rather than hard-coding the value of `FEATURE_FLAG_GRPC_SERVICE_PORT` to `50053` and `8081`, we’re using `NOMAD_PORT_grpc` and `NOMAD_PORT_http`. These are actually [runtime environment variable](https://developer.hashicorp.com/nomad/docs/runtime/environment), which follow the `NOMAD_PORT_<label>` naming convention. This prevents you from hard-coding the port number, which comes in handy if the port number changes in the [network](https://developer.hashicorp.com/nomad/docs/job-specification/network) stanza for whatever reason, as you only need to change the number in one spot.
*   If you look at the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901), you’ll notice that `OTEL_RESOURCE_ATTRIBUTES` is set to `service.name=$(OTEL_SERVICE_NAME),k8s.namespace.name=$(OTEL_K8S_NAMESPACE),k8s.node.name=$(OTEL_K8S_NODE_NAME),k8s.pod.name=$(OTEL_K8S_POD_NAME)`. But I only set `OTEL_RESOURCE_ATTRIBUTES` to `service.name=featureflagservice`. Why? Well, because the other attributes in the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901) were Kubernetes-related, so I left them out.

**Template Stanza**

Wait…but why are `DATABASE_URL` and `OTEL_EXPORTER_OTLP_ENDPOINT` missing?? Well, if you look at the [Deployment YAML](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/6fdb0d3d0e22e550c30c0d5c61f428bbe8ed3aa1/charts/opentelemetry-demo/examples/default/rendered/component.yaml#L829-L901), you’ll notice that the values for the above two environment variables are `ecto://ffs:ffs@example-ffspostgres:5432/ffs` and `http://example-otelcol:4317`, respectively.

Which begs the question…how does this translate to Nomad-speak? `example-ffspostgres` and `example-otelcol`, are the service names in Kubernetes for [PostgreSQL](https://www.postgresql.org/) and the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/), respectively, so if we tried to use those same names in our jobspec definition, you’d get a big ‘ole nasty error from Nomad.

We could use the IP addresses of those services, but that’s not such a great idea, because IP addresses for services are bound to change, so if and when that address changes, your jobspec will fail to deploy.

What we need is a way to dynamically get a service’s IP address, given the service’s name. This is where [Consul](https://consul.io/) comes in. Among other things, [Consul offers service discovery](https://developer.hashicorp.com/consul/docs/concepts/service-discovery), which does exactly what we need.

To use Consul service-discovery, we need the following:

1.  The name of the [service](https://developer.hashicorp.com/nomad/docs/job-specification/service) that we’re referencing
2.  The [Nomad template stanza](https://developer.hashicorp.com/nomad/docs/job-specification/template)

The Nomad [template](https://developer.hashicorp.com/nomad/docs/job-specification/template) stanza is very reminiscent of a [Kubernetes ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/). Per the [Nomad docs](https://developer.hashicorp.com/nomad/docs/job-specification/template), templates let you “ship configuration files that are populated from environment variables, Consul data, Vault secrets, or just general configurations within a Nomad task.” In our case, we’re using a template to query Consul services, so that we can find the IP address and port number of these services, so that we can populate our to populate our two remaining environment variables, `DATABASE_URL` and `OTEL_EXPORTER_OTLP_ENDPOINT`. The code for that looks like this:

template {  
  data = <<EOF  
{{ range service "ffspostgres-service" }}  
DATABASE\_URL = "ecto://ffs:ffs@{{ .Address }}:{{ .Port }}/ffs"  
{{ end }}  
  
{{ range service "otelcol-grpc" }}  
OTEL\_EXPORTER\_OTLP\_TRACES\_ENDPOINT = "http://{{ .Address }}:{{ .Port }}"  
{{ end }}  
EOF  
  destination = "local/env"  
  env         = true  
}

Noteworthy items:

*   The [template](https://developer.hashicorp.com/nomad/docs/job-specification/template) stanza is defined inside the [task](https://developer.hashicorp.com/nomad/docs/drivers/docker) stanza.
*   The line `destination = “local/env”` can technically be anything (it’s basically a label), but what’s really important is `env = true`, which tells Nomad to export these as environment variables
*   The line `{{ range service “ffspostgres-service” }}` tells Nomad to look for a service in Consul called `ffspostgres-service`. Once it finds the service name, we can pull the service’s IP address and port number using `{{ .Address }}` and `{{ .Port }}`, respectively.
*   Similarly, the line `{{ range service “otelcol-grpc” }}` tells Nomad to look for a service called `otelcol-grpc`. Once it finds the service name, we can pull the service’s IP address and port number using `{{ .Address }}` and `{{ .Port }}`, respectively.

But wait…where the heck do these service names come from?? Well, remember when we defined [services](https://developer.hashicorp.com/nomad/docs/job-specification/service) in **Step 4** above, we gave each of our services a name?

`ffspostgres-service` is the name of the [PostgreSQL service](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/ffspostgres.nomad#L59-L74). You can check out the Nomad service definition [here](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/ffspostgres.nomad#L59-L74). (**Aside:** Take note of the [service](https://developer.hashicorp.com/nomad/docs/job-specification/service)’s [command-based health check to check database connectivity](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/ffspostgres.nomad#L63-L74).)

Similarly, `otelcol-grpc` is the name of the [gRPC service of the OpenTelemetry Collector](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/otel-collector.nomad#L190-L199). You can check out the service definition [here](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/otel-collector.nomad#L190-L199).

For more info on Consul service discovery, check out [this HashiCorp discussion forum](https://discuss.hashicorp.com/t/i-dont-understand-networking-between-services/24470/3). In addition, Nomad now has native service discovery sans Consul. For more info, check out docs [here](https://developer.hashicorp.com/nomad/docs/networking/service-discovery).

For an example of using the [template](https://developer.hashicorp.com/nomad/docs/job-specification/template) stanza for configuration files, check out the OpenTelemetry Collector’s jobspec [here](https://github.com/avillela/nomad-conversions/blob/ed12ec3d4092a7816aadd2d761a98f9ef51dfb74/otel-demo-app/jobspec/otel-collector.nomad#L89-L143).

**Restart Rules**

Unlike [Docker Compose](https://docs.docker.com/compose/compose-file/compose-file-v3/#depends_on), you can’t specify service dependency in Nomad (same goes with Kubernetes). So, in order to ensure that `Service X` doesn’t die on you because it’s dependent on `Service Y`, which hasn’t started yet, you can put a [restart](https://developer.hashicorp.com/nomad/docs/job-specification/restart) policy into place. Below is the [restart](https://developer.hashicorp.com/nomad/docs/job-specification/restart) policy that I configured for [featureflagservice](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/featureflagservice):

restart {  
 attempts = 10  
 delay = "15s"  
 interval = "2m"  
 mode = "delay"  
}

The above [restart](https://developer.hashicorp.com/nomad/docs/job-specification/restart) policy states that Nomad will try to restart the job 10 times in the span of 2 minutes. It will wait 15 seconds between restarts. If, after 10 attempts at a restart. By default, if the job still hasn’t started successfully, Nomad will fail the deployment and the job will be dead. This is dictated by the [mode](https://developer.hashicorp.com/nomad/docs/job-specification/restart#mode-values) attribute, which defaults to [fail](https://developer.hashicorp.com/nomad/docs/job-specification/restart#fail). That’s not what we want, so instead we must set our [mode](https://developer.hashicorp.com/nomad/docs/job-specification/restart#mode-values) to [delay](https://developer.hashicorp.com/nomad/docs/job-specification/restart#delay-1). This tells Nomad to restart the job another 10 times. This cycle continues on until the job finally starts up successfully.

**Resource Allocations**

If you follow my [writings on Nomad](https://adri-v.medium.com/list/justintime-nomad-cc5d249a172b), you’ll know that I am a HUGE fan of using [HashiQube](https://rubiksqube.com/#/) for running a Hashi environment on my local machine. This, of course, means that I have way less computing power than if I was, say, running this in Nomad in a datacenter. Which means that I have to be very mindful of the resources that I use, both for CPU and memory.

To get the correct values for CPU and memory usage, I had to play around a little. First, I started by deploying the jobspecs without any resource allocations, and checked out the jobs in Nomad to see if I either over-allocated or under-allocated resources.

For memory utilization, I looked at the resources consumed under the service’s allocation dashboard:

![Screen capture of the Nomad UI, showing CPU and memory utilization for a given allocation in Nomad. The graphs for CPU and memory utilization have a red box around them.](https://cdn-images-1.medium.com/max/800/0*625G90BvTghQm4IB)

If you look at the above screen capture for the [featureflagservice](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/featureflagservice), you can see that I’m using about 60% of the memory that I allocated to this jobspec, which is pretty decent. If I deploy a service and see that it’s getting close to 100% memory usage (anything at 80% or above), I bump up the amount of memory used.

[If you prefer the command line](https://developer.hashicorp.com/nomad/tutorials/manage-jobs/jobs-utilization), you can run:

export ALLOCATION\_ID=$(nomad job allocs -json featureflagservice | jq -r '.\[0\].ID')  
nomad alloc status -stats $ALLOCATION\_ID

Sample output:

…  
Task "featureflagservice" is "running"  
Task Resources:  
CPU Memory Disk Addresses  
0/55 MHz 151 MiB/250 MiB 300 MiB   
Memory Stats  
Cache Swap Usage  
0 B 0 B 151 MiB  
CPU Stats  
Percent Throttled Periods Throttled Time  
2.89% 0 0  
…

As you can see from the printout above CPU utilization is at `0 MHz`out of `55 MHz`, and memory utilization is at `151 MiB` out of `250 MiB`.

For CPU utilization, I look at Nomad’s [Topology dashboard](https://www.hashicorp.com/blog/see-your-entire-cluster-at-once-with-nomad-s-topology-visualization).

![Screen capture of the Nomad UI showing the Topology view. This shows 75% memory used out of the 9.28GB RAM allocated to the Nomad, and 60% compute power out of the 2 GHz compute power allocated to Nomad.](https://cdn-images-1.medium.com/max/800/0*JLgBQorpXm-bWtM-)

Per the screen shot above, you can see that for all of my services, I am using a grand total of `1.21 GHz` of CPU for all of my jobspecs (all OTel Demo App jobspecs), out of my allotted `2 GHz` (if you’re curious, I configured this setting [here](https://github.com/avillela/hashiqube/blob/9dd8e08febcb295b44d2a834e9f5e024841a9d00/hashicorp/nomad.sh#L59-L60) in HashiQube). By looking at my service’s CPU utilization from the allocation’s Resource Utilization dashboard, and by looking at how much compute power I have from the Topology dashboard, I can play around with the CPU utilization to reach a value that won’t exhaust my allocated resources. As a general rule of thumb, I like to make sure that all of my services are using 60–75% of the allotted resources.

So, with all that in mind, below are my [resources](https://developer.hashicorp.com/nomad/docs/job-specification/resources) settings for the [featureflagservice](https://github.com/open-telemetry/opentelemetry-demo/tree/main/src/featureflagservice), where CPU is measured in GHz, and memory is measured in MiB ([mebibytes](https://www.majordifferences.com/2018/03/differences-between-megabyte-and.html)).

resources {  
 cpu = 55  
 memory = 250  
}

#### 6- Putting it all together…

Now that we’ve got all of our pieces in place, our final jobspec looks like this:

job "featureflagservice" {  
  type        = "service"  
  datacenters = \["dc1"\]  
  
  group "featureflagservice" {  
    count = 1  
  
    network {  
      mode = "host"  
  
      port "http" {  
        to = 8081  
      }  
      port "grpc" {  
        to = 50053  
      }  
    }  
  
    service {  
      name = "featureflagservice-http"  
      port = "http"  
      tags = \[  
        "traefik.http.routers.featureflagservice.rule=Host(\`feature.localhost\`)",  
        "traefik.http.routers.featureflagservice.entrypoints=web",  
        "traefik.http.routers.featureflagservice.tls=false",  
        "traefik.enable=true",  
      \]  
  
      check {  
        type     = "tcp"  
        interval = "10s"  
        timeout  = "5s"  
      }  
    }  
  
    service {  
      name = "featureflagservice-grpc"  
      port = "grpc"  
  
      check {  
        type     = "tcp"  
        interval = "10s"  
        timeout  = "5s"  
      }  
    }  
  
    task "featureflagservice" {  
      driver = "docker"  
   
      config {  
        image = "otel/demo:v1.1.0-featureflagservice"  
        image\_pull\_timeout = "10m"  
        ports = \["http", "grpc"\]  
      }  
  
      restart {  
        attempts = 10  
        delay    = "15s"  
        interval = "2m"  
        mode     = "delay"  
      }  
  
      env {  
        FEATURE\_FLAG\_GRPC\_SERVICE\_PORT = "${NOMAD\_PORT\_grpc}"  
        FEATURE\_FLAG\_SERVICE\_PATH\_ROOT = "\\"/feature\\""  
        FEATURE\_FLAG\_SERVICE\_PORT = "${NOMAD\_PORT\_http}"  
        OTEL\_EXPORTER\_OTLP\_TRACES\_PROTOCOL = "grpc"  
        OTEL\_SERVICE\_NAME = "featureflagservice"  
      }  
  
      template {  
        data = <<EOF  
{{ range service "ffspostgres-service" }}  
DATABASE\_URL = "ecto://ffs:ffs@{{ .Address }}:{{ .Port }}/ffs"  
{{ end }}  
  
{{ range service "otelcol-grpc" }}  
OTEL\_EXPORTER\_OTLP\_TRACES\_ENDPOINT = "http://{{ .Address }}:{{ .Port }}"  
{{ end }}  
EOF  
        destination = "local/env"  
        env         = true  
      }  
  
      resources {  
        cpu    = 55  
        memory = 250  
      }  
  
    }  
  }  
}

Ta-da!! 🎉

### Final Thoughts

Whew! We covered a lot today! At the end of the day, I hope that this shows you that converting a Kubernetes manifest to a Nomad jobspec is not rocket science! It just takes a little bit of knowledge and patience.

Although this was by no means an exhaustive conversion, I hope that this little tutorial has given you the confidence to go from, “I wish that there was an example of how to run this on Nomad,” to, “I can get this to run in Nomad myself!”

I shall now reward you with a picture of Phoebe and our dearly departed Bunny, peering out of their cage.

![Two rats peering out of a cage: a white rat on the left, and a light brown and white rat on the right.](https://cdn-images-1.medium.com/max/800/0*1v4t_Iv1g1zHufdL)

Bunny (left) and Phoebe (right) wish to say hello! Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. 🦄 🌈 💫

![Peace sign, heart, and terminal](https://cdn-images-1.medium.com/max/800/0*tSk_26Q8eRprFiPf)

For more blog posts on Nomad, please check out my reading list below:

[**Just-in-Time Nomad**  
_Stories for those new to HashiCorp Nomad_adri-v.medium.com](https://adri-v.medium.com/list/cc5d249a172b "https://adri-v.medium.com/list/cc5d249a172b")[](https://adri-v.medium.com/list/cc5d249a172b)

Got questions about Observability and/or [OpenTelemetry](https://opentelemetry.io)? Want to collaborate on the OTel Demo App for Nomad? Talk to me! Feel free to connect through [e-mail](mailto:devrel@lightstep.com), or hit me up on [Mastodon](https://hachyderm.io/@adrianamvillela) or [LinkedIn](https://www.linkedin.com/in/adrianavillela). Hope to hear from y’all!

By [Adriana Villela](https://medium.com/@adri-v) on [December 19, 2022](https://medium.com/p/7a58d2fa07a0).

[Canonical link](https://medium.com/@adri-v/how-to-convert-kubernetes-manifests-into-nomad-jobspecs-7a58d2fa07a0)

Exported from [Medium](https://medium.com) on June 3, 2026.