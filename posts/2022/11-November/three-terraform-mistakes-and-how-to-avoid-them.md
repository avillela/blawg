---
title: "Three Terraform Mistakes, and How to Avoid Them"
slug: three-terraform-mistakes-and-how-to-avoid-them
description: "Learn about Terraform gotchas, and how to solve them, so that you will hopefully be spared utter despair and panic"
added: "Nov 21, 2022"
tags:
  - technical
  - hashicorp
  - terraform
  - "2022"
---


![Painting of a sailboat in blue water, surrounded by a fiery red sky. Painting by Maria Helena Villela.](https://cdn-images-1.medium.com/max/800/0*uyJYaaAB_kfJYoKz)

Painting by my late mother, Maria Helena Villela

In my [last blog post last blog post](https://lightstep.com/blog/observability-as-code-with-kubernetes-and-lightstep) , I talked about how [Ana Margarita Medina Ana Margarita Medina](https://lightstep.com/blog/authors/ana-margarita-medina) and I used to show off [Observability-Landscape-as-Code Observability-Landscape-as-Code](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code) in practice, leveraging the [OpenTelemetry Demo App OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) to do so. The Demo App showcases instrumentation of and of different services written in different languages using [OpenTelemetry OpenTelemetry](https://opentelemetry.io) (OTel). Our Terraform code did the following:

*   Created a Kubernetes cluster
*   Deployed the Demo App to [Kubernetes](https://kubernetes.io/)
*   Deployed [OpenTelemetry Collector](https://opentelemetry.io/docs/collector) to [Kubernetes](https://kubernetes.io/), and configured it to send Traces and Metrics to [Lightstep](https://app.lightstep.com/)
*   Created dashboards in Lightstep

Now, I’m a fan of beautiful code, so we organized our code using [Terraform Modules Terraform Modules](https://developer.hashicorp.com/terraform/language/modules) . We used a module for provisioning the Kubernetes cluster, one for deploying the OTel Demo App and the OTel Collector, and one for creating the Lightstep dashboards.

We also leveraged the following Terraform [Providers](https://developer.hashicorp.com/terraform/language/providers):

*   [Google Cloud Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs) for spinning up a Kubernetes Cluster in [Google Cloud Platform (GCP)](https://cloud.google.com/)
*   The [Kubernetes Provider](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs) and the [Helm Provider](https://registry.terraform.io/providers/hashicorp/helm/latest/docs) for deploying the app to Kubernetes
*   The [Lightstep Provider](https://registry.terraform.io/providers/lightstep/lightstep/latest/docs) for creating the dashboards in Lightstep

All good, right? Except for one teeeensy little problem…the last time I’d touched Terraform was in early 2021, and even then, I was just tweaking code. So I kinda had to teach myself Terraform all over again. And I hit up a few snags along the way. Cue. The. Panic.

![Home Alone meme: Kevin with hands to his face screaming. Text: “OMG Terraform is mad at me”](https://cdn-images-1.medium.com/max/800/1*iDXjBTHAkQBZrxz-UVf3ZA.jpeg)

Image source [here](https://imgflip.com/i/709pup)

Fortunately, Google came through, and we were able to resolve the issues. In today’s blog post, I will cover THREE Terraform gotchas that Ana and I hit, and how we solved them, so that you will hopefully be spared our utter despair and panic. 😅

Let’s do this!

> **NOTE:** _If you want to follow along to see the full Terraform source code, you can check it out_ [_here_](https://github.com/lightstep/unified-observability-k8s-kubecon/tree/main/gke-otel-demo)_. Even though the source code is specific to the_ [_Observability-Landscape-as-Code_](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code) _use case, the main Terraform concepts in this blog post can be ported over to other scenarios._

### Gotcha #1: The Chicken-and-Egg Scenario

After creating a Kubernetes cluster, we needed to create a Kubernetes resource before we could apply the Helm chart to install the OpenTelemetry demo app. The [Demo App’s Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo) deploys an OpenTelemetry Collector. We wanted to configure the Collector to send OTel data to Lightstep. To do so, you need to add a [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens) , which is stored as a [Kubernetes secret](https://kubernetes.io/docs/concepts/configuration/secret). You can learn more about the specifics of this setup [here](https://medium.com/dev-genius/running-opentelemetry-demo-app-in-kubernetes-95dccd613e0b).

To create the secret in Kubernetes before running the Helm Chart, we used the [Kubernetes Provider](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs) . In order to use this provider, Terraform needs to know information about your cluster, so that it knows what cluster to apply the manifest to. To do this, I needed to store the cluster information in the `data` stanza, like this:

data "google\_client\_config" "default" {  
}  
   
data "google\_container\_cluster" "primary" {  
 name     = var.cluster\_name  
 location \= var.region  
}  
   
   
provider "kubernetes" {  
 host  = "https://${data.google\_container\_cluster.primary.endpoint}"  
 token = data.google\_client\_config.default.access\_token  
 cluster\_ca\_certificate \= base64decode(  
   data.google\_container\_cluster.primary.master\_auth.0.cluster\_ca\_certificate  
 )  
}

Easy peasey, right? Unfortunately, when I ran `terraform apply`, I kept getting the following errors:

Error: Invalid template interpolation value

and

Error: Attempt to index null value

Basically, Terraform was trying to evaluate the contents of the `data` stanza (which were null) before it had any information about the Kubernetes cluster. Which of course it didn't, because the cluster didn't yet exist!! Hence the null contents.

I frantically Googled this one for a while, spinning my wheels. And then, the “aha” moment hit me, when I saw somewhere in one of my searches that I could use the `depends_on` attribute in the `data` stanza. So I added `depends_on = [module.k8s_cluster_create]` to both my `data` stanzas, which basically says, "Hey buddy, don't try to evaluate this until AFTER the `k8s_cluster_create module` (i.e. the module in which the Kubernetes cluster is created) is run. So now, after adding `depends_on`, my [providers.tf (lines 32-49)](https://github.com/lightstep/unified-observability-k8s-kubecon/blob/450333c0132e1a0ee99f4633af2d48a06c4ad8dd/gke-otel-demo/terraform/providers.tf#L32-L49) code looked like this:

data "google\_client\_config" "default" {  
 depends\_on = \[module.k8s\_cluster\_create\]  
}  
   
data "google\_container\_cluster" "primary" {  
 depends\_on = \[module.k8s\_cluster\_create\]  
 name     = var.cluster\_name  
 location \= var.region  
}  
   
   
provider "kubernetes" {  
 host  = "https://${data.google\_container\_cluster.primary.endpoint}"  
 token = data.google\_client\_config.default.access\_token  
 cluster\_ca\_certificate \= base64decode(  
   data.google\_container\_cluster.primary.master\_auth.0.cluster\_ca\_certificate  
 )  
}

And after making that change, all was well with the world. Huzzah!

### Gotcha #2: Using Modules with depends\_on

While the above problem went away, I then found myself face-to-face with yet another conundrum. When I initially wrote my Terraform code, everything was in one big file, and it worked just fine. So OF COURSE I just assumed that when I prettified my code and moved things into modules, I could just get away defining my in the Modules themselves. Well, you can. That is…if you don’t use the `depends_on` attribute in your Module call.

So basically, when I tried to say that the Module `lightstep_dashboards` depended on `k8s_cluster_create` like this:

module "k8s\_cluster\_create" {  
   source = "./modules/k8s"  
   
   cluster\_name = var.cluster\_name  
   project\_id \= var.project\_id  
   region \= var.region  
   network \= var.network  
   subnet \= var.subnet  
}  
   
module "deploy\_otel\_demo\_app" {  
   source = "./modules/otel\_demo\_app"  
   
   otel\_demo\_namespace = var.otel\_demo\_namespace  
   ls\_access\_token \= var.ls\_access\_token  
   cluster\_name \= var.cluster\_name  
   project\_id \= var.project\_id  
   region \= var.region  
   network \= var.network  
   subnet \= var.subnet  
}  
   
module "lightstep\_dashboards" {  
   source = "./modules/lightstep"  
   depends\_on = \[module.k8s\_cluster\_create\]  
   
   lightstep\_project = var.ls\_project  
}

I kept getting this error when I ran `terraform apply`:

Error: Module is incompatible with count, for\_each and depends\_on

This error occurs when the [Child Module](https://developer.hashicorp.com/terraform/language/modules#child-modules) contains a `provider` block and the Module that you're trying to call is using `count`, `depends_on`, and/or `for_each`. Why? Because `provider` blocks inside a [Child Module](https://developer.hashicorp.com/terraform/language/modules#child-modules) are not allowed when your Module call is using `count`, `depends_on`, and/or `for_each`. You can read up more on this [here](https://github.com/hashicorp/terraform/issues/31081#issuecomment-1131908824).

Well, it turns out that correct practice is to define your `provider` block in the [Root Module](https://developer.hashicorp.com/terraform/language/modules#the-root-module) , as Providers are automagically passed down to the [Child Modules](https://developer.hashicorp.com/terraform/language/modules#child-modules) . So to make the above error go away, I [moved all of my Provider definitions to the Root Module](https://github.com/lightstep/unified-observability-k8s-kubecon/blob/main/gke-otel-demo/terraform/providers.tf), and was able to [keep depends\_on in my Module call](https://github.com/lightstep/unified-observability-k8s-kubecon/blob/main/gke-otel-demo/terraform/main.tf). If I didn't have any dependencies, I could've left out the `depends_on` block, but I wouldn't really be following the recommended practice.

> **NOTE:** _You can learn more about Providers and Modules_ [_here_](https://developer.hashicorp.com/terraform/language/modules/develop/providers)_._

### Gotcha #3: Referencing a Partner Provider in a module

Two problems down. Awesome! Unfortunately, my problems were not over. I continued to anger the Module Gods, because I encountered yet another issue when I moved my non-modularized code into Modules. This time, it had to do with using the [Lightstep Provider](https://registry.terraform.io/providers/lightstep/lightstep/latest/docs) . You see, this Provider comes from a third-party (i.e. not HashiCorp), which in this case is Lightstep. Lightstep is what is known as a [Partner Provider](https://developer.hashicorp.com/terraform/registry/providers#provider-tiers-namespaces). This means that in the [Provider Registry](https://registry.terraform.io/browse/providers), the Provider is named `lightstep/lightstep`, where the first `lightstep` means that the Provider is created and maintained by Lightstep, and the second `lightstep` is the actual Provider name. For comparison, the `hashicorp/google` provider is an [Official Provider](https://developer.hashicorp.com/terraform/registry/providers#provider-tiers-namespaces), because it is created and maintained by HashiCorp.

Now here’s the odd part. When I tried to run `terraform init`, I was graced with this error:

Error: Failed to query available provider packages  
  
Could not retrieve the list of available versions for provider hashicorp/lightstep 

Um…what? This did not compute, because in my `providers.tf` file, I [CLEARLY said that the Provider name was lightstep/lightstep](https://github.com/lightstep/unified-observability-k8s-kubecon/blob/450333c0132e1a0ee99f4633af2d48a06c4ad8dd/gke-otel-demo/terraform/providers.tf#L12-L15) , so where oh where was it getting this `hashicorp/lightstep` business from?? LOOK ⬇️⬇️⬇️

terraform {  
 required\_providers {  
...  
   lightstep = {  
     source = "lightstep/lightstep"  
     version = ">=1.70.0"  
   }  
...  
}

O Google gods, help meeeeee!!

Well, it turns out that when using a Partner Provider in a Module, Terraform assumes the Provider is an Official Provider, and is therefore automagically given a `hashicorp` suffix when passing it down to the Module. So Terraform basically thought that the Provider was called `hashicorp/lightstep`, even though I _clearly_ defined it correctly in the [Providers section of the Root Module](https://github.com/lightstep/unified-observability-k8s-kubecon/blob/450333c0132e1a0ee99f4633af2d48a06c4ad8dd/gke-otel-demo/terraform/providers.tf#L12-L15).

To fix this issue, I ended up having to define a `required_providers` stanza in the Root Module, as I had already done, AND I also had to add a [required\_providers stanza to my Child Module](https://github.com/lightstep/unified-observability-k8s-kubecon/blob/main/gke-otel-demo/terraform/modules/lightstep/providers.tf), as per the snippet below:

terraform {  
 required\_providers {  
   lightstep = {  
     source = "lightstep/lightstep"  
     version = ">=1.70.0"  
   }  
 }  
}

After that, my `terraform init` stopped screaming at me!

![Jimmy Fallon meme: Jimmy standing in front of blue curtain. Text: PHEW!](https://cdn-images-1.medium.com/max/800/1*7BP_J-6mJJMAluisG9gYpQ.jpeg)

Image link [here](https://images.app.goo.gl/7XyDJJ88DHzcXhrJ7)

### Final Thoughts

Today we learned that Terraform can be a wee finicky. We learned that:

*   Adding `depends_on` to the `data` stanza used to capture your Kubernetes cluster configuration data ensures that Terraform doesn't try to evaluate the `data` stanza until AFTER the cluster is created, thereby avoiding some serious Terraform Anger™.
*   If you want to use `depends_on` in a Module call, the Provider configuration must be done in the Root Module. Also, it's the recommended practice even if you don't want to use `depends_on`.
*   If you have a Module that references a Partner Provider, you need to define a `required_providers` stanza in both the Root Module and the Child Module.

I hope that these tips prevent you from experiencing Terraform Anguish™ next time you find yourself Terraformin’. And now, I shall reward you with a picture of my rat Mookie, who is seen below peering out of an authentic [Wisconsin Cheese Head](https://cheesehead.com) hat.

![Mookie the rat peering out of a Cheese Head hat](https://cdn-images-1.medium.com/max/800/1*S09HuJEC3DCx1k0vsCPiWQ.jpeg)

Mookie the rat peering out of a Cheese Head hat. Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. 🦄 🌈 💫

Got questions about Terraform or Observability-Landscape-as-Code? Talk to me! Feel free to connect through e-mail, or hit me up on [Twitter](https://twitter.com/adrianamvillela), [Mastodon](https://hachyderm.io/web/@adrianamvillela#), or [LinkedIn](https://www.linkedin.com/in/adrianavillela). Hope to hear from y’all!

Catch my talk about this topic on YouTube:

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/three-terraform-mistakes-and-how-to-avoid-them)_._

By [Adriana Villela](https://medium.com/@adri-v) on [November 21, 2022](https://medium.com/p/58973d7573bf).

[Canonical link](https://medium.com/@adri-v/three-terraform-mistakes-and-how-to-avoid-them-58973d7573bf)

Exported from [Medium](https://medium.com) on June 3, 2026.