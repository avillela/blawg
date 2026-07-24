---
title: "Running OpenTelemetry Demo App in Kubernetes"
slug: running-opentelemetry-demo-app-in-kubernetes
description: "How to deploy the OpenTelemetry Demo App to Kubernetes using Lighstep as your Observability back-end."
added: "Oct 28, 2022"
tags:
  - technical
  - observability
  - opentelemetry
  - kubernetes
  - lightstep  
---

# Running OpenTelemetry Demo App in Kubernetes

![](https://cdn-images-1.medium.com/max/800/1*3WZ5XL9U1Fc7JVoki3TCyQ.png)

Plough. Photo by [Adri Villela](https://adri-v.medium.com)

If you’re new to [OpenTelemetry](http://OpenTelemetry.io) and want to see it in action in a real-life example, the [OpenTelemetry Demo app](https://github.com/open-telemetry/opentelemetry-demo) is a great way to get started quickly. In one of my [previous blog posts](https://lightstep.com/blog/observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry), I showed you how to get the demo app up and running and sending Traces to [Lightstep](https://app.lightstep.com/). That’s all well and good, but we all know that in “The Real World”, we’re not running our containerized workloads locally with Docker Compose. Instead, we’re running them using container orchestrators such as [Kubernetes](https://kubernetes.io/) and [Nomad](https://nomadproject.io/). Keeping that in mind, wouldn’t it be so very very nice if we could run the [OpenTelemetry Demo app](https://github.com/open-telemetry/opentelemetry-demo) in [Kubernetes](http://kubernetes.io)? And wouldn’t it be super extra nice if we could send those Traces to Lightstep?

Well, look no further, my friend, because today, that is exactly what we’re going to do!

Are you ready? Let’s do this!

### Tutorial

#### Pre-Requisites

Before you begin, you will need the following:

*   [A Lightstep account](https://app.lightstep.com/signup/developer?signup_source=docs)
*   A [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens#create-an-access-token) for the Lightstep project you would like to use
*   A Kubernetes cluster
*   [Helm](https://helm.sh/docs/intro/install/)

> **NOTE:** _The version of the OpenTelemetry Demo App used at the time of this writing was version_ `_0.9.6_`_._

#### Steps

**1- Initialize Helm**

helm repo add open\-telemetry https://github.com/open\-telemetry/opentelemetry-helm-charts

**2- Create the values YAML file**

The [OTel Demo App Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo) expects a `values.yaml` file. Now, the one that comes out-of-the-box with the chart is all well and good, but it sends Traces to Jaeger. In our case, since we want to send Traces to Lightstep, we’ll need to modify it a tad. Let’s start by creating our own values YAML file:

touch values-ls.yaml

And then open `values-ls.yaml` and add:

> **NOTE:** _I had originally left out Jaeger and Prometheus configurations for the sake of keeping things simple. If you’d like to see an example of with both, check out this_ [_here_](https://gist.github.com/lakamsani/c329f211bf2a6f3d1c685ae02d4ff828)_. (Thank you_ [_Vamsee Lakamsani_](https://medium.com/u/7f80ff75f838) _for the share!)_

Okay…so what exactly did we do?? So glad you asked!

Well, in a nutshell, we’re overriding the `values.yaml` in the [OpenTelemetry Demo App Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/values.yaml). But we’re only overriding the bits that we need to override — specifically, the OTel Collector configuration, so we can send Traces to Lightstep. It looks an awful lot like the [Collector config YAML](https://github.com/lightstep/opentelemetry-examples/blob/main/collector/vanilla/collector.yaml) that we know and love. But not quite. Because it’s just a partial config of the Collector config. You see, [Demo App Chart uses the OpenTelemetry Collector Helm Chart as a subchart](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/Chart.yaml). All the configuration that the Collector Chart exposes is available to us in the Demo Chart. So when you’re populating [your own version of values.yaml](https://gist.github.com/avillela/ecc6929f60c563febadb305edf006cf4), all you need to do is include the Collector configs that you wish to modify or add to. In our case, we’re doing the following:

*   Configure a new exporter, otlp/ls, which allows us to send traces to Lightstep
*   Add the new exporter to our metrics and traces pipelines
*   Update the logging exporter to use the debug log level.

You’ll notice that in configuring the `otlp/ls` exporter, we’re setting the following header value: `“lightstep-access-token”: “${LS_TOKEN}”`. But where in Space does `${LS_TOKEN}` come from?? Great question! Which brings me to the second noteworthy section.

You may have noticed the `extraEnvs` section in our `opentelemetry-collector` config. Well, this is where we can configure environment variables that are mounted to our Collector pod in Kubernetes. We don’t wish to expose our secret in `values-ls.yaml`, as that would be a security no-no. Instead, we reference a secret called otel-collector-secret, which is mounted as the environment variable, `LS_TOKEN`. Ta-da! 🎉

PS: We’ll create the secret in the next step.

> **_NOTE:_** I am fully aware of the fact that you won’t want to use Kubernetes secrets In Real Life to store your Lightstep Access Token, as they are only [base64-encoded](https://en.wikipedia.org/wiki/Base64). Instead, you’ll want to store your secrets in a secrets manager, such as one that comes with your Cloud provider (e.g. [Azure Key Vault](https://medium.com/dzerolabs/kubernetes-saved-today-f-cked-tomorrow-a-rant-azure-key-vault-secrets-%C3%A0-la-kubernetes-fc3be5e65d18), [Google Secret Manager](https://cloud.google.com/secret-manager)), or [HashiCorp Vault](https://vaultproject.io/).

**3- Deploy the app**

Now that we know what’s up, let’s deploy the app to Kubernetes!

export LS\_TOKEN=”<YOUR\_LS\_TOKEN>”

kubectl create ns otel-demo  
kubectl create secret generic otel-collector-secret -n otel-demo — from-literal=LS\_TOKEN=$LS\_TOKEN

helm upgrade my-otel-demo open-telemetry/opentelemetry-demo -f <path-to-values-ls-file>/values-ls.yaml -n otel-demo --install

Where `<path-to-values-ls-file>` is the path in which your newly-created `values-ls.yaml` is located.

Be sure to replace `<YOUR_LS_TOKEN>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens#create-an-access-token).

**4- Access the OTel Demo App**

You can access the Demo App by Kubernetes port-forward:

kubectl port-forward -n otel-demo svc/otel-demo-app-frontend 8080:8080

To access the front-end, go to [http://localhost:8080](http://localhost:8080/):

![OpenTelemetry demo app front-end at http://localhost:8080](https://cdn-images-1.medium.com/max/800/0*fLHvZ_coQeQMKjtF)

Go ahead and explore the amazing selection of telescopes and accessories, and buy a few. 😉🔭

**5- See traces in Lightstep!**

We can now pop over to Lightstep and check out some [Traces](https://opentelemetry.io/docs/concepts/observability-primer/#understanding-distributed-tracing). Let’s do this by creating a [Notebook](https://docs.lightstep.com/docs/use-notebooks).

First, click on the little page icon on the left nav bar (highlighted in blue, below). That will bring up this page:

![Creating a Lightstep Notebook](https://cdn-images-1.medium.com/max/800/0*HmIar_WviHaxZiAL)

Next, we build our query for our Traces. Let’s look at the traces from the `recommendationservice`. We’ll do by entering `recommendationservice` in the field next to “All telemetry”. Because this is a service, select the second value from the drop-down, which says, “Use ‘recommendationservice’ as service value”, as per below:

![Creating a Lightstep notebook for the recommendationservice traces](https://cdn-images-1.medium.com/max/800/0*odelg4VwzAeLVHYJ)

After you select that value, you’ll see a chart like this:

![Output of Notebook for recommendationservice traces](https://cdn-images-1.medium.com/max/800/0*6Mcrl7kJHBywsk0X)

The little green dots represent trace exemplars from that Service. Hover over one of them to see for yourself!

![Screen shot of Trace exemplars](https://cdn-images-1.medium.com/max/800/0*xsZ3f_6mIl-iEuri)

If you click on one of these dots, you’ll get taken to the Trace view. Before you click, be sure to save your Notebook first (don’t worry, you’ll get a reminder before you navigate away from the page)!

Here’s the Trace view we see when we click on the `get_product_list` dot (Operation) above:

![Trace view for recommendationservice](https://cdn-images-1.medium.com/max/800/0*ZPdJyOCr13tRq0bO)

### Final Thoughts

Today we upped our [OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) game, and moved from running it à la [Docker Compose](https://github.com/open-telemetry/opentelemetry-demo/blob/main/docker-compose.yml), to deploying it to Kubernetes. We did this, thanks to the [OpenTelemetry Demo App Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts), and we used our [own version of values.yaml](https://gist.github.com/avillela/ecc6929f60c563febadb305edf006cf4) so that we could send Traces and Metrics to Lightstep.

This should give you a nice feel for running a full-fledged OTel-instrumented app in Kubernetes!

And now, I shall reward you with a picture of Ollie Octopus painting, drawn by my [superly-talented 14-year-old daughter](https://instagram.com/old_fashion_glazed).

![Drawing of Olly Octopus painting a picture.](https://cdn-images-1.medium.com/max/800/1*HTv4hneV1njtRBW_yEDgzQ.png)

Ollie Octopus is painting. Drawing by [@old\_fashion\_glazed](https://instagram.com@old_fashion_glazed/)

Peace, love, and code. 🦄 🌈 💫

The [OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) is always looking for feedback and contributors. Consider [joining the OTel Community](https://github.com/open-telemetry/community/blob/main/community-membership.md#member) to help make OpenTelemetry AWESOME!

Got questions about today’s blog post? Talk to me! Feel free to connect through e-mail, [Twitter](https://twitter.com/adrianamvillela) or [LinkedIn](https://www.linkedin.com/in/adrianavillela/).

Hope to hear from y’all!

By [Adriana Villela](https://medium.com/@adri-v) on [October 28, 2022](https://medium.com/p/95dccd613e0b).

[Canonical link](https://medium.com/@adri-v/running-opentelemetry-demo-app-in-kubernetes-95dccd613e0b)

Exported from [Medium](https://medium.com) on June 3, 2026.