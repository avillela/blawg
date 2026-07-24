---
title: "Shifting from Infrastructure as Code to Infrastructure as Data"
slug: shifting-from-infrastructure-as-code-to-infrastructure-as-data
description: "A brief intro to Cloud infrastructure, and a dive into why you should take a data-driven approach to provision cloud resources."
added: "May 04, 2021"
tags:
  - technical
  - sre
  - thought-leadership
  - "2021"
---


![](https://cdn-images-1.medium.com/max/800/0*qVwPYXBviS39p0br)

Photo by Dzero Labs

### IaC on the brain

I’ve always been drawn to the idea of Infrastructure as Code (IaC). Back in 2014, I took on a role whereby I had to help a team install a new version of a vendor product. That included not only installing the new software, but also included provisioning new hardware. Since these were pre-Cloud days (at least in the org where I worked), it meant provisioning new VMs through a very painful and manual process which required tons of paperwork followed by even more approvals. Although we managed to get the VMs provisioned and the software installed, it wasn’t without its technical and political hurdles.

At the time I remember thinking, “This was really fun! (Errr…maybe not the politics…) It would be really great if I could find a job where I could provision and configure hardware, and still apply my software skills.” I feel like I was onto something… 😉

Fast-forward to 2021. We are now in the Cloud Era, and you simply wouldn’t dream of provisioning and managing IT infrastructure (networking, virtual machines, Kubernetes clusters, load balancers, etc.) without doing so programmatically. Enter Infrastructure as Code (IaC).

### Infrastructure out of thin air?

![](https://cdn-images-1.medium.com/max/800/0*hdteDjuVjISOomBJ)

Photo by [Sanketh Hiremath](https://unsplash.com/@sanketh07?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/cloud?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

It’s important to understand that when we use IaC to provision infrastructure, that infrastructure is not being created out of thin air. Let’s dig a little deeper…

Many of us have heard of Public Cloud. Public Cloud Providers include Amazon’s [AWS](https://aws.amazon.com/), Google’s [GCP](https://cloud.google.com/), Microsoft’s [Azure](https://azure.microsoft.com/en-ca/), Oracle’s [OCI](https://www.oracle.com/ca-en/cloud/), [IBM Cloud](https://www.ibm.com/cloud), and more. Under the covers, these Public Clouds are nothing more than a massive network of data centres all across the globe. These data centres have mountains of hardware, all of which are managed with the Cloud Provider’s own frameworks.

[Private Clouds](https://www.liquidweb.com/kb/difference-private-cloud-premise/) also have finite, physical infrastructure — though again…the infrastructure may be perceived as infinite.. There are two types of Private Clouds: internal, and hosted. Internal Private Clouds are hosted in an organization’s own offices or data center(s). Hosted Private Clouds are owned and operated by a third-party service provider. Hosted Private Clouds can be single-tenant (data centres dedicated to one company), or multi-tenant (data centres hosting multiple companies). Frameworks like [OpenStack](https://www.openstack.org/), [Apache CloudStack](https://cloudstack.apache.org/), [Azure Stack](https://azure.microsoft.com/en-ca/overview/azure-stack/), [IBM Cloud Private](https://www.ibm.com/blogs/cloud-computing/2017/10/31/what-is-ibm-cloud-private/), and others can be used to manage Private Clouds.

When you provision infrastructure in a Public or Private Cloud, you’re hitting an API endpoint that talks to the data centre management frameworks, which in turn provision virtual resources for you (e.g. virtual disks, virtual networks, virtual machines) from their available pool of physical resources.

### Best Practices

When provisioning Cloud infrastructure, there are some key practices that you should always follow to ensure a happy and stress-free (or less stressful) existence:

#### 1- Ephemerality

Cloud infrastructure should _always_ be thought of as ephemeral. If you need to make a change to your infrastructure, tear it down, and recreate it. If that change is manual, all the more reason to do so. And update your config files and version control those files, so that you don’t lose track of the changes.

You should NEVER EVER be scared of creating and destroying your infrastructure many times over. If you do a good job of defining your infrastructure, you _know_ that it will behave the same way each time you recreate it, so why be scared?

> **Note:** _Infrastructure should be immutable, and stateless components should be ephemeral, but stateful components are not. Databases and event hubs  
> can’t just be torn-down and reprovisoned willy-nilly. The process should be  
> fully automated but it can be very complex and disruptive to reprovision a  
> database or especially an event hub like Kafka._

#### 2- Versioning

Always version-control your infrastructure definitions, so that you can easily recreate your resources should you ever need to (you will and you should).

#### 3- Simplicity

The minute you start getting overly-elaborate with your infrastructure automation process, where you find yourself trying to jam a square peg in a round hole, STOP. For example, if you find yourself working outside the confines of an API or an infrastructure provisioning tool, it’s time to back up, buddy, and rethink your strategy.

### Infrastructure as Data

Best practices aside, there’s still one thing that we haven’t yet addressed when it comes to provisioning Cloud infrastructure. When we write code to provision Cloud infrastructure, are we actually _writing_ code? The answer is no. 😱

Let’s return to my story in the beginning. Back when I had to provision infrastructure the old-fashioned way, I had to put together a set of specs, or manifest, to hand over to the team who would fulfill my request. For Cloud-based infrastructure, we’re pretty much doing the same — except this time, our specs are passed to and fulfilled by an API, rather than by a person. And you know what else? You don’t care how that request is being fulfilled: only that it’s being fulfilled accurately.

For example, say you’re provisioning a Kubernetes cluster. You want a 5-node cluster. Your workloads on that cluster will be memory-intensive, so you want your nodes to have high RAM and mid-range compute capacity. When you tell Google to spin up what GKE cluster, you tell it just that — 5 RAM-heavy compute nodes. When you spin up that cluster, you don’t give a fig about what’s happening behind the scenes, so long as you end up with the cluster that you asked for.

So, if all we need to do is just _describe_ the resources that we want to create, it means that we should describe them using some common format like JSON or YAML. And what are JSON and YAML? They’re just plain text that represent…_data_. 🤯

This concept isn’t new, either. In fact, Michael DeHaan, [creator of Ansible](https://en.wikipedia.org/wiki/Ansible_%28software%29), said as much in a [2013 blog post](http://radar.oreilly.com/2013/08/the-rise-of-infrastructure-as-data.html):

> “…Infrastructure is best modeled not as code, nor in a GUI, but as a text-based, middle-ground, data-driven policy.”

Later in the article, he coins the term “Infrastructure as Data” (IaD) to describe this concept.

IaD is a declarative approach to infrastructure — that is, you say what you want, without specifying the precise actions or steps for how to achieve it. This is very much the concept behind [Kubernetes Controllers](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1), many CI/CD tools like [GitHub Actions](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions), and of course, [Ansible](https://www.ansible.com/).

### Who cares?

At this point, you might be wondering why I’m expending so much energy in trying to convince you that IaD is a better paradigm than IaC. Fair point.

Honestly? It boils down to one word: _simplicity_. I’ve spent enough time provisioning Cloud infrastructure on both Google Cloud and Azure to tell you that things can get very complicated very fast when you start scaling your infrastructure.

Sure, you want to provision and manage your infrastructure in a nice, structured manner. Dude…that’s what JSON is for. But writing code to do it? Honestly, it makes no sense. Infrastructure is static. Plus, infrastructure is not an application.

Treating infrastructure as _code_ can open the doors to technical debt. Remember that not all code is created equal, and bad code can make your life a living hell.

It also leads to unnecessary complexity. Why do you need to manage a whole bunch of code to define your infrastructure, when all you need to do is _describe_ it?

### Ways to Provision Cloud Infrastructure

Let’s put IaD aside for a moment, and switch gears to talk about provisioning Cloud infrastructure. I promise that there’s a point to this, so bear with me.

There are many ways to provision Cloud intrastructure. When you provision, it executes your code or some framework code that interprets your infrastructure definition. Let’s look at some different approaches at a very high level.

#### Terraform

[Terraform](https://www.terraform.io/), by [Hashicorp](https://www.hashicorp.com/), is very popular platform-agnostic tool for provisioning infrastructure for various Public Cloud and Private Cloud frameworks. It uses its own proprietary JSON-esque language, [Hashicorp Configuration Language (HCL)](https://github.com/hashicorp/hcl) for defining your infrastructure. It supports some very crude loops and conditionals, as well as variables. Terraform relies on a JSON [_state file_](https://www.infrastructurecode.io/blog/the-terraform-state-file-an-overview) to keep track of the infrastructure that it created. Think of this file as a structured log.

#### Pulumi

[Pulumi](https://www.pulumi.com/) was started by a couple of [ex-Microsoft guys](https://www.zdnet.com/article/former-microsoft-midori-team-members-launch-pulumi-an-open-source-cloud-development-company/), taking aim at the vast Terraform market. It too, is platform-agnostic. It borrows many concepts from Terraform, including the state file. The major difference is that Pulumi lets you create infrastructure by using a regular ‘ole programming language. Languages currently supported by Pulumi include: TypeScript, Javascript, Python, Go, and C#.

> **Note:** _Terraform recently hit back at Pulumi, by launching the Pulumi-esque_ [_Terraform CDK_](https://github.com/hashicorp/terraform-cdk)_._

#### Ansible

While it may have started out as a configuration management tool, Ansible can now also be used to [provision and manage Cloud infrastructure](https://www.ansible.com/integrations/cloud). Unlike Terraform and Pulumi, Ansible uses YAML to define infrastructure. Also unlike Terraform and Pulumi, Ansible is stateless. Check out my exploration of using Ansible to provision a GKE cluster [here](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3).

#### Crossplane

[Crossplane](https://crossplane.io/) is a cloud-agnostic tool that runs on Kubernetes, and is used to provision Cloud resources outside of Kubernetes. (I know…messes with your mind a bit!) Because it’s Kubernetes-native, it is declarative, and uses YAML to describe the infrastructure being provisioned. Crossplane is still pretty new, and as a result, it supports many [AWS resources](https://doc.crds.dev/github.com/crossplane/provider-aws), and supports fewer types of resources for other Cloud Providers, like [Azure](https://doc.crds.dev/github.com/crossplane/provider-azure) and [GCP](https://doc.crds.dev/github.com/crossplane/provider-gcp). Check out my exploration of using Crossplane to provision a GKE cluster [here](https://medium.com/dzerolabs/using-crossplane-to-provision-a-kubernetes-cluster-in-google-cloud-cf5374d765ee).

#### Cloud Provider CLIs

I think that it’s worth mentioning Cloud Provider CLIs as another popular means of provisioning infrastructure. When I say “Cloud Provider CLIs”, I mean something like the [az](https://docs.microsoft.com/en-us/cli/azure/) CLI for Azure, and the [gcloud](https://cloud.google.com/sdk/gcloud) CLI for Google Cloud Platform. Other cloud providers have similar CLIs. These CLIs have one thing in common: they provide you with a means of interacting with the Cloud Provider’s API to create and manage resources. If you go this approach, you would need to write wrapper code/scripts to make the different CLI calls to provision your infrastructure.

### Which tool is best?

![](https://cdn-images-1.medium.com/max/800/0*xECjCA0gmKVn9Jle)

Image credit: [wearearmadillo.com](https://wearearmadillo.com/wp-content/uploads/2019/10/the-matrix-red-or-blue-pill_original-1.jpg)

Of all the tools I listed above, I’d say that only two truly honour Infrastructure as Data and best practices for provisioning Cloud infrastructure: _Ansible and Crossplane_.

Why?

Terraform (declarative) and Pulumi (code-based) **both use state files**. I realize that I’m probably one of the few people bothered by this. State files exist to keep track of what resources have been created by Terraform, so that they don’t accidentally get recreated unnecessarily. While that’s a valiant idea, I find that this goes against the ephemerality principle of Cloud infrastructure — you _should_ recreate it.

On that same vein, say you start out by creating 3 Cloud resources with Terraform. Then you add another resource. Because the original 3 resources were in your state file, they’ll stay as-is, and only the new resource gets added. But how do you know that these 4 resources actually exist in harmony? You don’t. Not until you delete all 4, and recreate all of them together from scratch.

And finally…say you create a Cloud resource using Terraform. Then, you go and modify it using your Cloud’s admin console or CLI. Guess what? Terraform has no idea that this has happened. The state file is no longer in sync with the _actual_ state of the resource. You’re borked.

As a personal preference, Terraform is a no-no for me because of HCL. I find HCL to be absolute garble to read. (Sorry Hashi fans!) Also, I don’t like Terraform’s attempts at control flow and looping. For me, it just makes my head spin. Yuck. 🤢

As a software engineer, I’m much more drawn to Pulumi — I’ll take it over Terraform any day. From an SRE standpoint, however, it’s not declarative by design. And while programming languages can be nice, they can also be an invitation to automation abuse over-complication. Remember: there is such a thing as bad code, and bad code can lead to technical debt.

Cloud Provider CLIs are stateless, which I like, but they too, are not declarative. Also, in order for them to be even remotely effective, they need to be wrapped in code or scripts. Hard pass.

Which leaves us with Ansible and Crossplane. By definition, Ansible is both declarative and stateless, and uses YAML, which is super-easy to read — much easier to read than JSON, even. Win! Also, to my surprise, Ansible was _surprisingly_ easy to get going to create Cloud infrastructure using with its various Cloud provider libraries.

Crossplane, being Kubernetes-native is declarative as well, but not quite stateless. You see, because Crossplane runs on Kubernetes, it takes advantage of [etcd](https://medium.com/pradpoddar/about-etcd-the-data-backbone-of-kubernetes-e86ea1d4feeb), Kubernetes’ distributed key-value store. Any time you change your Crossplan infrastructure definitions, it’s recorded in etcd. Which would lead you to believe that it acts like the Terraform/Pulumi statefile. Except that it’s a bit different. Per [Crossplane’s blog](https://blog.crossplane.io/crossplane-vs-terraform/), “It constantly observes and corrects an organisation’s infrastructure to match its desired configuration whether changes are expected or not.” I can’t tell you how much I _love_ this!

### Conclusion

Damn…that was a lot to take in! Let’s review what we’ve learned:

*   Resources created in the Cloud (whether Public or Private) aren’t just created out of thin air. They are virtual resources created out of allocating bits from existing (finite) physical resources.
*   Cloud-based infrastructure should be ephemeral, simple, and versioned.
*   Infrastructure should best be treated as data, and not as code
*   Infrastructure as Data (IaD) is not a new concept — it dates back to at least 2013!
*   Most Cloud provisioning tools out there are ill-suited for IaD. The only two that meet the mark are Ansible and Crossplane.

And now I shall reward you with an image of Susie the Rat.

![](https://cdn-images-1.medium.com/max/800/0*TXRqmwyrUBmSLkV_)

Susie the Rat loves cuddles..and Infrastructure as Data! Photo by Dzero Labs.

Peace, love, and code.

### Related Articles

[**Using Ansible’s GCP Library to Provision a Kubernetes Cluster in Google Cloud**  
_Step aside, Terraform! Learn how to use Ansible’s Google Cloud modules to provision a GKE cluster in an easy and…_medium.com](https://medium.com/dzerolabs/using-ansibles-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud-6fd1910f1700 "https://medium.com/dzerolabs/using-ansibles-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud-6fd1910f1700")[](https://medium.com/dzerolabs/using-ansibles-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud-6fd1910f1700)

[**Using Crossplane to Provision a Kubernetes Cluster in Google Cloud**  
_A data-driven Kubernetes-native approach to provisioning Cloud infrastructure._medium.com](https://medium.com/dzerolabs/using-crossplane-to-provision-a-kubernetes-cluster-in-google-cloud-cf5374d765ee "https://medium.com/dzerolabs/using-crossplane-to-provision-a-kubernetes-cluster-in-google-cloud-cf5374d765ee")[](https://medium.com/dzerolabs/using-crossplane-to-provision-a-kubernetes-cluster-in-google-cloud-cf5374d765ee)

### Further Reading

*   [Breaking Silos Using the Power of Infrastructure as Data in Kubernetes (ReadHat.com)](https://www.redhat.com/en/blog/breaking-silos-using-power-infrastructure-data-kubernetes)
*   [I do declare! Infrastructure automation with Configuration as Data (cloud.google.com)](https://cloud.google.com/blog/products/containers-kubernetes/understanding-configuration-as-data-in-kubernetes)
*   [The Rise of Infrastructure as Data (radar.oreilly.com)](http://radar.oreilly.com/2013/08/the-rise-of-infrastructure-as-data.html)

By [Adriana Villela](https://medium.com/@adri-v) on [May 4, 2021](https://medium.com/p/bdb1ae1840e3).

[Canonical link](https://medium.com/@adri-v/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3)

Exported from [Medium](https://medium.com) on June 3, 2026.