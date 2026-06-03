---
title: "Using Tekton and ArgoCD to Set Up a Kubernetes-Native Build & Release Pipeline"
slug: using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline
description: "A Tekton and ArgoCD primer and step-by-step guide for setting up and running build & release workflows with Tekton and ArgoCD."
added: "Oct 25, 2020"
tags:
  - technical
  - tekton
  - kubernetes
  - argocd
---

# Using Tekton and ArgoCD to Set Up a Kubernetes-Native Build & Release Pipeline

![](https://cdn-images-1.medium.com/max/800/1*Jg9cs_IMAxXSQ3b2xEXpUQ.jpeg)

Summer patio lights. Photo credit: Dzero Labs

### How Did We Get Here?

In my [previous tech post](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9), I talked about how I wanted to create a Kubernetes-native build and release pipeline using [Tekton](https://tekton.dev) and [ArgoCD](https://argoproj.github.io), and I walked you through [how to install Tekton and ArgoCD on your Kubernetes cluster with Ambassador Edge Stack (with TLS) as your API Gateway](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9).

Today, I will talk about the corresponding pipeline. In this post, I will:

*   Revisit the reference architecture from [my previous post](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9)
*   Cover basic [Tekton](https://tekton.dev) and [ArgoCD](https://argoproj.github.io) terms and concepts
*   Walk you through the changes you need to make to the example code to run the pipeline on your own
*   Set up and run the example pipeline

### Getting Started

**_Assumption:_** You have a Kubernetes cluster running on your favorite cloud provider, all set up with [Ambassador Edge Stack](https://www.getambassador.io), [ArgoCD](https://argoproj.github.io), and [Tekton](https://tekton.dev), per my instructions [here](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9). If not, please do that first, so that you can run the example code in this post.

Assuming you’ve got your cluster up and running, go ahead and clone the two GitHub repos that I set up for this example:

*   [Tekton Pipeline Repo](https://github.com/d0-labs/tekton-pipeline-example-pipeline)
*   [Example App Repo](https://github.com/d0-labs/tekton-pipeline-example-app) (a Dockerized 2048 game)

Once you’ve cloned them, I’ll need you to update some of the files, which I’ll guide you through a little later on. Make sure that you’ve set up two corresponding remote Git repos to push your code changes to, since, as [GitOps](https://medium.com/@bhargavshah2011/overview-of-gitops-31e206e19e4e) tools, Tekton and ArgoCD rely on the remote Git repos.

### Reference Architecture Revisited

As I mentioned in my [previous post](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9), my setup is based on the reference architecture below, which comes from [here](https://github.com/ibm-cloud-architecture/node-web-app).

![](https://cdn-images-1.medium.com/max/800/1*6x9zaV0YSu05CEfu32vllg.png)

Reference Architecture. Source: [ibm-cloud-architecture](https://github.com/ibm-cloud-architecture/node-web-app)

I wanted to achieve 3 key things:

1.  Use Tekton for my Dev pipeline (build using [Kaniko](https://github.com/GoogleContainerTools/kaniko), deploy using ArgoCD)
2.  Use ArgoCD to deploy to my non-Dev clusters (e.g. QA, Prod)
3.  Use ArgoCD to deploy my Tekton pipeline

### Tekton Primer

Before we start using Tekton, we should first cover some key concepts:

*   `PipelineResources`
*   `Tasks`
*   `Pipelines` & `PipelineRuns`
*   Triggers (we’re using `TriggerTemplates`, `TriggerBindings`, and `EventListeners`)

I’ll go over each of these at a high level. For more detailed info, check out the links to the Tekton docs in the _References_ section at the end of this post.

#### PipelineResources

When you create a Kubernetes-centric CI/CD pipeline, at a minimum, you’ll want it to:

*   Build a Docker image from a Dockerfile in your remote Git repo
*   Publish it to a Docker registry somewhere

In Tekton, you define your remote Git repo and Docker registry as `PipelineResources`. Below is a sample PipelineResource definition:

Sample Tekton PipelineResource definition

You might be wondering how you authenticate your `PipelineResources`, and the answer to that is by using Kubernetes `Secrets`. Tekton supports [different ways to authenticate](https://github.com/tektoncd/pipeline/blob/master/docs/auth.md). For our example, we’ll be using basic auth.

Here’s a sample Basic Auth `Secrets` defintion for a Git repo:

Sample Git repo Secret definition for Tekton basic auth

And here’s a sample Basic Auth `Secrets` definition for a Docker registry:

Sample Docker registry Secret definition for Tekton basic auth

A few important things to note regarding Tekton authentication:

*   You need to include the `tekton.dev/docker-0` and `tekton-dev/git-0` annotations in your `Secrets` definition to tell Tekton that the authentication is related to the Tekton `PipelineResources` you’ve defined.
*   The `Secrets` type (at least for basic auth) must be `kubernetes.io/basic-auth`. Check out the [Tekton docs for other supported auth types](https://github.com/tektoncd/pipeline/blob/master/docs/auth.md).
*   If you define more than one `Secret` of a particular type (e.g. secrets for more than one Git repo) you’ll need to increment the # in the annotation (e.g. Use `tekton.dev/git-1` to when defining the second Git secret).
*   The annotation must point to the URI of resource (e.g. Git repo or Docker registry).

Finally, you must associate your `Secrets` to a Kubernetes `ServiceAccount`, like this:

The `ServiceAccount` is how the `PipelineRun` gains access to the `Secrets` used to authenticate the `PipelineResources`. More on `PipelineRun` below.

#### Task

A `Task` defines a step or series of steps that you would like to execute. The steps are executed in the order in which you define them in your `Task`. Each step must reference a container image. The execution steps run in the container. It makes perfect sense, when you think about it. Since Tekton is Kubernetes-native, it means that the step needs a container in which to execute. The container you choose depends on what your step does. For example:

*   **_Execute shell scripts:_** use an [Alpine Linux image](https://hub.docker.com/_/alpine)
*   **_Build a Dockerfile:_** use [Google’s Kaniko image](gcr.io/kaniko-project/executor:v0.10.0)
*   **_Run_** `kubectl`**_:_** use the [bitnami/kubectl image](https://hub.docker.com/r/bitnami/kubectl/)
*   **_Do some whacky custom stuff:_** use your own image

`Tasks` can reference values defined in standard Kubernetes `ConfigMap` and `Secret` objects, like this:

For convenience, I created some `ConfigMaps` to define some of the values used by our pipeline `Tasks`. ArgoCD server configs are defined in `[argocd-task-cm.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/resources/argocd-task-cm.yml)`, and Docker build configs are defined in `[build-task-cm.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/resources/build-task-cm.yml)`. More on that later.

I’ve defined two `Tasks` in our [example Tekton pipeline](https://github.com/d0-labs/tekton-pipeline-example-pipeline):

**1- Build task**

*   Uses [Kaniko](https://github.com/GoogleContainerTools/kaniko) to build the [Dockerfile from the sample app](https://github.com/d0-labs/tekton-pipeline-example-app/blob/master/Dockerfile), and publish the image to our Docker registry (more on that later).
*   You can check out our build `Task` definition [here](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/tasks/build-task.yml).

> **NOTE:** [_Kaniko_](https://github.com/GoogleContainerTools/kaniko) _does not play nice with older Docker schema versions,_ [_per this GitHub issue_](https://github.com/GoogleContainerTools/kaniko/issues/509#issuecomment-452900850)_, so if you’re referencing an_ [_old-ass Docker image_](https://docs.docker.com/registry/spec/manifest-v2-1/) _in your Dockerfile, Kaniko will fail with a very non-descriptive_ `_unsupported status code 404; body: 404 page not found_` _error._

**2- Deploy task**

*   Uses ArgoCD to manage the application deployment (to a Kubernetes Dev cluster).
*   You can check out our deploy `Task` definition [here](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/tasks/argocd-task.yml).

In Tekton, you can execute `Tasks` either on their own, or as part of a `Pipeline`. In our example, we’re using `Pipelines`, so that we can string together the `Tasks` we want to execute.

The beauty of Tekton `Tasks` is that they can be reused by other `Pipelines`. More on `Pipelines` in the next section.

#### Pipeline

A `Pipeline` is a collection of `Tasks` that you want to run as part of your workflow. Each `Task` in a `Pipeline` is executed in a Kubernetes pod, which means that by default, they run in parallel. You can, however, specify the order in which your `Tasks` are run. For example, you can say that a task called `deploy` will only execute once a task called `build` is completed, by using `runAfter`, like this:

You can even get super-fancy with `Finally` tasks, which run regardless of whether or not your other `Tasks` succeeded.

Want to see a full `Pipeline` spec? Check out our definition [here](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/pipelines/build-deploy-pipeline.yml).

#### PipelineRun

Whereas a `Pipeline` specifies which `Tasks` to run and in which order to run them, a `PipelineRun` will actually execute those tasks in the order specified in the `Pipeline` definition.

Sample Tekton PipelineRun definition

The `PipelineRun` will also:

*   Provision `PipelineResources` required by `Pipeline`.
*   The `PipelineRun` gains access to the `Secrets` (the ones we defined to authenticate our Docker registry and Git repo) through its associated `ServiceAccount` (recall that we associated our two `Secrets` to our `ServiceAccount`).

Behind the scenes, a `PipelineRun` will actually generate a `TaskRun` (which, as you might correctly assume, is what actually executes a `Task`). The `TaskRun` then kicks off a Kubernetes `Pod` which runs the container specified in your `Task`’s step, along with the command/args/script you want to execute in that container:

![](https://cdn-images-1.medium.com/max/800/1*iH01WhgcxqHJ22VcOHlZVw.jpeg)

How PipelineRun Works

#### Triggers (TriggerTemplates, TriggerBindings, EventListeners)

Triggers are a newer concept in Tekton, and they are really powerful. Before Triggers, you would have to kick off a pipeline manually, by running the `PipelineRun` YAML file using the `kubectl` command like this:

k`ubectl create -f <my_pipelineRun>.yml`

But alas, we don’t need (or want) to do that, because we have Triggers!

Triggers allow us to define templates for our `PipelineResources` and `PipelineRuns`, and use Webhooks to trigger Tekton Events, which in turn kick off our `Pipelines`.

Check out the Tekton Trigger flow below from [Tekton’s Trigger docs](https://tekton.dev/docs/triggers/):

![](https://cdn-images-1.medium.com/max/800/1*xkkP-1PrWI_Gzw7lHo0GDA.png)

Tekton Trigger Flow. Source: tekton.dev/docs/triggers

I’ll provide a brief overview of key Triggers terminology below.

**TriggerTemplates**

*   `TriggerTemplates` act as a blueprint for creating resources
*   They can be used to create `PipelineResources` and `PipelineRuns`, as well as [other](https://tekton.dev/docs/triggers/triggertemplates/) resources
*   `TriggerTemplates` can be used to define parameters that can then be substituted anywhere within the resource template(s) being defined.
*   Example: A parameter called `gitRevision` defined within the `TriggerTemplate` body can be referenced in any of the `TriggerTemplate`’s `resourcetemplates` can be referenced as are then referenced with the prefix `$(tt.params.gitRevision)`. Note that the`tt.params` prefix is required.

**TriggerBindings**

*   `TriggerBindings` capture fields from an event (e.g. a Webhook, as in our case), and store them as parameters
*   These parameters can be referenced by our `TriggerTemplate`.

**EventListeners**

*   `EventListeners` listen in on events (e.g. a Webhook, as in our case).
*   When an `EventListener` is created, Tekton also creates a corresponding Kubernetes `Service` listening on port `8080`.
*   If you name your `EventListener` as `my-event-listener-el`, the corresponding `Service` is called `el-my-event-listener-el` (note the `el-` prefix).
*   When you create a Webhook, you need to send your data to this `Service`. As a result, you need a way to expose the `Service` to the outside world, so that the Webhook can reach it.
*   [Since we’re using Ambassador as our API Gateway](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9), we will expose the `Service` via an Ambassador `Mapping`.

For a complete Triggers definition, including `TriggerTemplate`, `TriggerBinding`, `EventListener`, and Ambassador `Mapping` to expose the `EventListener` service, check out our example [here](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/triggers/build-deploy-trigger.yml).

### ArgoCD Primer

Since [ArgoCD](https://argoproj.github.io) is also part of our workflow, I’m going to give you a brief overview of some key terms and concepts used in our example.

#### Ability to Deploy to Multiple Clusters

The cool thing about ArgoCD is its ability to deploy to multiple Kubernetes clusters. This means that you don’t need to have ArgoCD installed in each cluster to which your app is being deployed.

Ideally, you’ll want to install ArgoCD (and Tekton too) on a completely separate Kubernetes cluster. One reason for doing this is that you don’t want to clutter your application clusters with unnecessary stuff. Imagine if you installed ArgoCD on your Dev cluster. If your Dev cluster went down for some reason, you wouldn’t be able to deploy to your QA and Prod clusters.

Another reason is that it helps keep cluster parity. Your Dev cluster should be set up the same as your QA cluster, which should be set up the same as your Prod cluster. Adding ArgoCD to one of your existing clusters takes away that parity and adds more moving parts and operational complexity.

#### Repo Registration

As a [GitOps](https://medium.com/@bhargavshah2011/overview-of-gitops-31e206e19e4e) tool, ArgoCD is able to determine whether or not the application manifest you’ve deployed to your Kubernetes cluster matches up with the manifest that you’ve defined in version control. To do this, you must register your repo with ArgoCD, and associate that repo with your ArgoCD `Application`, using `argocd repo add`. More details on this command when we run our example later in this post.

argocd repo add <repo\_url>

When a repo is registered with ArgoCD, it is added to a `ConfigMap` called `argocd-cm`, in the `argocd` namespace. It also creates Kubernetes`Secrets` in the `argocd` namespace, for each of the repos added to `argocd-cm`. The Secrets are named `repo-<some_identifier>`.

> **NOTE:** _The_ `_argocd_` _CLI should have been installed as part of your_ [_cluster setup_](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9)_._

#### Application

An `Application` is an ArgoCD custom resource which is responsible for orchestrating the deployment of your application manifest to the target Kubernetes cluster. ArgoCD can deploy Kubernetes manifests using [Kustomize](https://blog.stack-labs.com/code/kustomize-101/) or Helm charts, plus [support for some additional tools](https://argoproj.github.io/argo-cd/user-guide/application_sources/).

We’ll be using [Kustomize](https://blog.stack-labs.com/code/kustomize-101/) for our example. In that case, all you need to do is specify the location of your `kustomization.yml`.

An `Application` is created using the command `argocd app create`. This creates an `Application` resource in argocd namespace, that looks something like this:

ArgoCD Sample Application Spec

More details on this command when we run our example later in this post.

In our example, we will have two ArgoCD Applications:

*   Tekton Pipeline “app”
*   2048 game app

#### Application Sync & Health

When an ArgoCD `Application` is first created, its state is `OutOfSync`. This means that what’s in the Git repo that the ArgoCD `Application` is pointing to doesn’t match up with what’s in the Kubernetes cluster. This makes sense, because creating an ArgoCD `Application` does not automagically deploy it to the target cluster.

![](https://cdn-images-1.medium.com/max/800/1*RBpEIjKBTenL7iRoHTmIbA.jpeg)

OutOfSync Tekton App

To deploy the app to the target cluster, you run `argocd app sync`. At that point, the manifest defined in your remote Git repo is _in sync_ with the manifest deployed to your Kubernetes cluster. More details on this command when we run our example later in this post.

Sometimes an `Application` will deploy successfully and will be healthy (`Pod` starts up successfully), but it will show up as `OutOfSync`. This can happen if your application automagically creates Kubernetes resources, such as `Pods`. Tekton, for example, automagically creates `Pods`, which can cause ArgoCD to think that the app is out of sync. You can fix this by pruning the app when you sync it, either via the UI, or by adding `--prune` when running `argocd app sync`.

You can also add `IgnoreExtraneous` annotation to the resources that you want to exclude, as per the docs [here](https://argoproj.github.io/argo-cd/user-guide/compare-options/). I haven’t had a chance to play around with using this annotation myself, though my guess is that to make this work, you would have add it to your Tekton Pod definition, and it so happens that you can create [Pod templates in Tekton](https://github.com/tektoncd/pipeline/blob/master/docs/podtemplates.md). (If you have a working example of this, please post a link in the comments!)

If ArgoCD successfully deploys an application to the target cluster (i.e. Pod has initialized successfully), the application will register as `Healthy`, and you’ll see a little green heart on your application dashboard:

![](https://cdn-images-1.medium.com/max/800/1*hrPBIJWKnuB3unr0N96rlA.jpeg)

Tekton App is Healthy and Synced

An ArgoCD app can be synced manually, or it can be triggered automagically via Webhook. I haven’t quite figured out how to get [Webhooks working with ArgoCD](https://argoproj.github.io/argo-cd/operator-manual/webhook/), because I was testing originally on Azure DevOps Server, and I have a sneaking suspicion that ArgoCD doesn’t play nice with it, based on [this GitHub Issue](https://github.com/argoproj/argo-cd/issues/3089).

### Tekton Pipeline Configuration (Almost There!)

While I have provided you with [most of the code needed to get you going on the Tekton pipeline example](https://github.com/d0-labs/tekton-pipeline-example-pipeline), you’ll need to fill out your own details (i.e. repo URLs, credentials, etc.) before you can deploy and run the pipeline on your own system. I’ll guide you below.

#### Pipeline Repo Structure

I haven’t found any de-facto guide on how to structure Tekton pipeline definitions, but based on a bunch of GitHub repos that I’ve surveyed in the last little while, I settled on the structure below:

```
tekton-pipeline/├── pipelines/│   └── build-deploy-pipeline.yml├── resources/│   ├── secrets/│   │   ├── argocd_secrets.env (added by user; gitignored)│   │   ├── docker_secrets.env (added by user; gitignored)│   │   └── git_app_secrets.env (added by user; gitignored)│   ├── argocd-task-cm.yml│   ├── build-task-cm.yml│   ├── kustomization.yml│   ├── namespace.yml│   ├── pipeline-admin-role.yml│   ├── secrets.yml│   └── triggers-admin-role.yml├── tasks/│   ├── argocd-task.yml│   └── build-task.yml├── triggers/│   └── build-deploy-trigger.yml└── kustomization.yml
```

![](https://cdn-images-1.medium.com/max/800/1*ATiD4PtQf0vm5ZU3r0zuuw.png)

Tekton Pipeline Repo Structure

#### A few important notes before we begin…

**First and foremost**, I will start by saying that you should NEVER EVER EVER EVER store secrets in version control. The [example Tekton Pipeline GitHub repo](https://github.com/d0-labs/tekton-pipeline-example-pipeline) has a `.gitignore` that ignores any `*_secrets.env` file, so as long as you keep to that naming convention, you should be fine.

**Second**: Kubernetes `Secrets` aren’t the best way to manage secrets; however, I’m using them to keep things simple.

**Third**: You may have noticed above that I have two `kustomization.yml` files above. The one in the `resources` folder is used to create the pipeline `Namespace` and the `Secrets`. I use ArgoCD to deploy the Tekton pipeline, but I can’t include the secrets and namespace creation as part of it, because again, we shouldn’t store secrets in SCM. It’s a bit of a chicken-and-egg situation, unfortunately. Ideally, you’ll want to add secrets and namespace creation to some sort of automated bootstrapping code.

The second `kustomization.yml` is (the rest of) the pipeline’s manifest. This is what ArgoCD will use to deploy the pipeline to our Kubernetes cluster.

Okay…so back to business!

#### 1- Create secrets

You will need to create the following secrets in the `[tekton-pipeline/resources/secrets](https://github.com/d0-labs/tekton-pipeline-example-pipeline/tree/master/tekton-pipeline/resources/secrets)` folder:

a) `argocd_secrets.env`

ARGOCD\_USERNAME=admin  
ARGOCD\_PASSWORD=<admin\_password>

> **NOTE:** _You’ll want to set up_ [_single sign-on (SSO)_](https://argoproj.github.io/argo-cd/operator-manual/user-management/) _on your ArgoCD cluster, with_ [_RBAC_](https://argoproj.github.io/argo-cd/operator-manual/rbac/) _for your users. For the purpose of simplicity, I won’t be getting into that in this post._

b)`docker_secrets.env`

Must be a service account (or service principal in Azure) with access to your container registry. Enter the credentials in the `docker_secrets.env` below:

username=<service\_principal\_id>  
password=<service\_principal\_password>

c) `git_app_secrets.env`

You’ll need to generate a personal access token (PAT), as per your Git provider. Check out the docs for your provider below:

*   [GitHub](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token)
*   [Bitbucket](https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html)
*   [Azure DevOps Services](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=preview-page)
*   [GitLab](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)

Once you’ve generated the PAT, enter them in the `git_app_secrets.env` file:

username=<username>  
password=<personal\_access\_token>

> **NOTE:** _Before y’all get up my butt about using a personal access token for Git repo authentication on a shared pipeline, I agree with you that using a service account is a waaaaay better way to go about this. For the purpose of simplicity, we’re using a PAT for this blog post._

#### 2- Update ArgoCD Task ConfigMaps

Edit `[argocd-task-cm.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/resources/argocd-task-cm.yml)`, and replace the following `ConfigMap` values with your server-specific details:

*   `ARGOCD_SERVER`: replace with your ArgoCD server URL (DNS name or [FQDN value from the initial setup blog post](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9))

#### 3- Update resource URLs

Edit `[secrets.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/resources/secrets.yml)`, and replace the Git URL and Docker registry URLs.

*   Replace `<git_repo_url>`, where with your Git repo’s URL. For example, `[https://github.com/d0-labs/tekton-pipeline-example-app](https://github.com/d0-labs/tekton-pipeline-example-app)`
*   Replace `<docker_registry_url>` with your Docker Registry URL. For example, `https://my-acr.azurecr.io` for Azure, or `https://gcr.io/my-gcr` for gCloud.

#### 4- Update Triggers

Edit `[build-deploy-trigger.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/triggers/build-deploy-trigger.yml)`, and replace the Docker registry name and Trigger Binding JSON.

*   Replace `<docker_registry_name>` with your Docker registry’s name. For example, `my-acr.azurecr.io` for Azure, or `gcr.io/my-gcr` for gCloud.
*   Replace `<json_resource_repo_url_path>` with the path to the JSON resource pointing to your Git repo URL. This will depend on your Git provider.

> **NOTE:**

> _For GitHub, check out_ [_this sample JSON payload_](https://github.com/scottgonzalez/github-event-data/blob/master/push/empty-first.json)_. In this case, you’ll replace_ `_<json_resource_repo_url_path>_` _with_ `_repository.url_`_. The full line in_ `[build-deploy-trigger.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/triggers/build-deploy-trigger.yml)` _will look like this:_ `_value: $(body.repository.url)_`

> _For Azure DevOps Server, check out_ [_this sample JSON payload_](https://gist.github.com/avillela/120883999d9d472996f192bb97efccc9)_. In this case, you’ll replace_ `_<json_resource_repo_url_path>_` _with_ `_resource.repository.remoteUrl_`_. The full line in_ `[build-deploy-trigger.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/triggers/build-deploy-trigger.yml)` _will look like this:_ `_value: $(body.resource.repository.remoteUrl)_`

> _Regardless of what your JSON payload structure is, you need to remember to always include the_ `_body_` _prefix, otherwise, it won’t work. I left a placeholder for that already in the example pipeline code, for your convenience._

### **Create the Pipeline**

Finally!!

As I mentioned earlier, we’re using ArgoCD to create the Tekton pipeline. As I also mentioned earlier, we need to create secrets as part of the pipeline, but we don’t want ArgoCD to do that part, because it would mean that the secrets would be in version control, which we don’t want. So we’ll first need to create our pipeline namespace and our secrets separately, and then use ArgoCD to create the rest of the pipeline. We’re using [Kustomize](https://blog.stack-labs.com/code/kustomize-101/) to do this. Again, that’s why you see two `kustomization.yml` files in the repo:

*   `[tekton-pipeline/resources/kustomization.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/resources/kustomization.yml)` creates the pipeline namespace and secrets
*   `[tekton-pipeline/kustomization.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/kustomization.yml)` creates the rest of the pipeline. ArgoCD will use this file to deploy the pipeline to our cluster.

Let’s get started.

> **Assumption:** _You have the argocd CLI installed, as per the_ [_setup instructions_](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9)_._

#### 1- Register your k8s cluster with ArgoCD

Note that this is not necessary if you’re deploying your application to the same cluster in which ArgoCD is installed, which is totally okay for the purposes of this tutorial. In a real-life situation, however, in a real-life situation, you’ll definitely want to set up a dedicated ArgoCD cluster to deploy apps to your non-prod and prod clusters.

To register a different Kubernetes cluster with ArgoCD, first list all of your clusters:

argocd cluster add

The result can look something like this (obviously these are bogus values, but you get the drift):

![](https://cdn-images-1.medium.com/max/800/1*fuUw9PicZ7M1Q_R3ENv1xw.png)

Sample argocd cluster add output

If you have a cluster called `my-nonprod-cluster`, as in the example above, then you can add it to ArgoCD by running the following command:

```
argocd cluster add my-nonprod-cluster
```

#### 2- Create your Tekton pipeline namespace and secrets

As per above, we’re using [Kustomize](https://blog.stack-labs.com/code/kustomize-101/) to create the namespace and secrets, and ArgoCD to create the Tekton pipeline. From the root of your [Tekton pipeline](https://github.com/d0-labs/tekton-pipeline-example-pipeline) directory, run the following command:

kubectl apply -k tekton-pipeline/resources/.

This will create a namespace called `tekton-argocd-example`, and will create the following 3 secrets in that namespace:

*   ArgoCD secrets (`argocd-env-secret`)
*   Git repo secrets (`basic-git-app-repo-user-pass`)
*   Docker registry secrets, (`basic-docker-user-pass`)

#### 3- Register the two repos with ArgoCD

For our example, we’re creating two ArgoCD `Applications`. One `Application` is our Tekton pipeline. The other is the application that we’re building and deploying (the 2048 game).

As a result, we need to register both repos with ArgoCD, like this:

export SCM\_USERNAME=<git\_repo\_username>  
export SCM\_PAT=<git\_repo\_personal\_access\_token>

argocd repo add <pipeline\_repo\_url> --username $SCM\_USERNAME --password $SCM\_PAT

argocd repo add <app\_repo\_url> --username $SCM\_USERNAME --password $SCM\_PAT

You should be able to see the repos in the ArgoCD Admin UI.

![](https://cdn-images-1.medium.com/max/800/1*vvNIQrKHIDsC0w9pWQGpEw.jpeg)

ArgoCD Repository Registration

#### 4- Create the ArgoCD pipeline Application

Now we can create the pipeline application:

argocd app create tekton-pipeline-app --repo <pipeline\_repo\_url> --path tekton-pipeline --dest-server https://kubernetes.default.svc --dest-namespace tekton-argocd-example

What we did:

*   We’ve registered the Tekton pipeline app with ArgoCD, and named it `tekton-pipeline-app`.
*   The app manifest resides in the repo `<pipeline_repo_url>`. We registered that repo with ArgoCD in Step 3.
*   Since we’re using [Kustomize](https://blog.stack-labs.com/code/kustomize-101/) for deployment, it means that ArgoCD will look for `kustomization.yml` in the `[tekton-pipeline](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/kustomization.yml)` folder.
*   We specified a `--dest-server` value of `https://kubernetes.default.svc`, meaning that the app will be deployed on the same cluster as ArgoCD.
*   We’ve told ArgoCD to deploy the app to the `tekton-argocd-example` namespace, which we created above, as part of Step 2.

Once the application has been created, you’ll see something like this on the home screen of the ArgoCD admin UI:

![](https://cdn-images-1.medium.com/max/800/1*z20OWXfkKkZ2rIp3SdVCgw.jpeg)

ArgoCD tekton-pipeline-app after creation in ArgoCD Admin Dashboard

ArgoCD creates an `Application` resource for the `tekton-pipeline-app` in the `argocd` Kubernetes namespace on your ArgoCD cluster.

#### 5- Create the ArgoCD app for the 2048 game

Now to create the 2048 game app:

argocd app create 2048-game-app --repo <app\_repo> --path kustomize --dest-server https://another.thing.cluster.io:443 --dest-namespace game-2048 --sync-option CreateNamespace=true

What we did:

*   We’ve registered the 2048 game app with ArgoCD, and named it `2048-game-app`
*   Note that it’s the same name that we defined in [argocd-task-cm.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/resources/argocd-task-cm.yml).
*   The app manifest resides in the repo `<app_repo_url>`. We registered this repo with ArgoCD in Step 3.
*   Since we’re using [Kustomize](https://blog.stack-labs.com/code/kustomize-101/) for deployment, it means that ArgoCD will look for `kustomization.yml` in the `[kustomize](https://github.com/d0-labs/tekton-pipeline-example-app/tree/master/kustomize)` folder of the [app repo](https://github.com/d0-labs/tekton-pipeline-example-app).
*   In this example, we’re deploying this app to a different kubernetes cluster than the one in which ArgoCD is installed. We get the `--dest-server` value from running `argocd cluster add`. When we ran it in Step 1, the command returned a `SERVER` value of `https://another.thing.cluster.io:443` for my cluster named `my-nonprod-cluster`. Obviously, it will be a different value for you. 😊 (**_Note:_** You don’t have to deploy to a different cluster for this example — you can specify `https://kubernetes.default.svc`.)
*   The application will be deployed to the `game-2048` namespace. Because we set `--sync-option` to `CreateNamespace=true`, the namespace `game-2048` is created automagically by ArgoCD if it doesn’t already exist on the target cluster.

Once the application has been created, you’ll see something like this on the home screen of the ArgoCD admin UI:

![](https://cdn-images-1.medium.com/max/800/1*RBpEIjKBTenL7iRoHTmIbA.jpeg)

ArgoCD 2048-game-app after creation in ArgoCD Admin Dashboard

ArgoCD creates an `Application` resource for the `2048-game-app` in the `argocd` Kubernetes namespace on your ArgoCD cluster.

#### 6- Sync (deploy) the Tekton pipeline

Time to deploy the Tekton pipeline:

argocd app sync tekton-pipeline-app --prune

As per the ArgoCD primer above, `--prune` is used to remove any extraneous resources. For a first-time app sync, this will do nothing (nothing to prune). But once your Tekton pipeline starts running, you’ll notice right away that ArgoCD will report the `tekton-pipeline-app` to be `OutOfSync`. If you run the `argocd app sync` with the `--prune` option, it means that any old pods automagically created by Tekton will be nuked from your cluster by ArgoCD.

#### 7- Create a Webhook for the Tekton Pipeline

We want our Tekton pipeline to be kicked off by a commit to master, on our [2048-game app repo](https://github.com/d0-labs/tekton-pipeline-example-app), so we’ll need to create a Webhook for that repo.

The Webhook URL look something like this:

`http://<cluster_url>/tekton-argocd-example-build-mapping/`

> **\*\*Don’t forget the trailing** `**/**` **in the URL, or else Ambassador will get mad.**

In case you’re wondering where `tekton-argocd-example-build-mapping` comes from, it’s coming from the `tekton-argocd-example-build-el-mapping` definition in `[build-deploy-trigger.yml](https://github.com/d0-labs/tekton-pipeline-example-pipeline/blob/master/tekton-pipeline/triggers/build-deploy-trigger.yml)`. That’s the `Ambassador` `Mapping` resource that we created so that we could expose the `el-tekton-argocd-example-build-el` Kubernetes `Service`. That `Service` was in turn created by the `tekton-argocd-example-build-el` Tekton `EventListener`, thereby making this Webhook possible.

Please refer to your Git provider’s Webhook documentation for more details on creating Webhooks.

#### 8- Make a change to your app repo, and let ‘er rip!

Go ahead — change some code in the [2048-game app repo](https://github.com/d0-labs/tekton-pipeline-example-app), commit the code, push to `master`, and see some magic happen.

> **NOTE:** _I’ve included screenshots below to give you an idea of what you’ll see in your cluster._ [_k9s_](https://github.com/derailed/k9s) _is my tool of choice for Kubernetes cluster administration._

The code change will trigger the Webhook, which will then kick off our Tekton pipeline.

![](https://cdn-images-1.medium.com/max/800/1*pocgzKUHBVovurFwNBNG6w.jpeg)

Running the build task

The pipeline will build the 2048 game’s `Dockerfile`, and will publish it to your Docker registry using [Kaniko](https://github.com/GoogleContainerTools/kaniko).

![](https://cdn-images-1.medium.com/max/800/1*aOKB9JjXE5jWRsEFpc11uQ.jpeg)

Using Kaniko to build our Dockerfile and push the image to the Docker

Then, it will deploy the 2048 game app to your target Kubernetes cluster using ArgoCD.

![](https://cdn-images-1.medium.com/max/800/1*Jj1wNCM5zZc-WjT8kZuwmg.jpeg)

Running the deploy task (using ArgoCD)

You can check the sample output from my own pipeline below, for taste of what to expect:

![](https://cdn-images-1.medium.com/max/800/1*D4uIjRG8NB4kUQTapX--pQ.jpeg)

App deployment using ArgoCD

If all goes well, your 2048-game should deploy to your cluster, and you’ll see its app status as `Healthy` and `Synced`:

![](https://cdn-images-1.medium.com/max/800/1*hrPBIJWKnuB3unr0N96rlA.jpeg)

2048-game-app after ArgoCD sync via Tekton pipeline

You’ll also be able to reach the app on your web browser via the following URL:

`https://<cluster_url>/2048-game/`

> **\*\*Don’t forget the trailing** `**/**` **in the URL, or else Ambassador will get mad.**

![](https://cdn-images-1.medium.com/max/800/1*NLQhnkP2tN9skz_s98NRXQ.png)

### Conclusion

Are you still with me? In that case, thanks for hanging around this long! I will now reward you with a cute picture of an alpaca. 🦙

![](https://cdn-images-1.medium.com/max/800/1*B1rXZiHlW4EwYF5TBL_5fw.jpeg)

Photo by [Jp Valery](https://unsplash.com/@jpvalery?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/llama?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

You’re a champ!! I know that it was a LOT to take in, but I feel that documentation for these things is super sparse, confusing, requires mind-reading, and the gotchas aren’t fully documented. My goal was for you to have a good overview of ArgoCD and Tekton, and to equip you with enough information to set up a meaningful workflow for Kubernetes-native CI/CD. If you walk away with a better understanding of these tools, and a working example to build on, then my work here is done!

If you find any errors in this tutorial, please let me know, so that I can fix them. Also, if you find any nuggets of info that might help others (like the secrets setup via a key vault, or the ArgoCD Webhooks setup), please post a link to your solution in the comments section!

Happy pipelining!

### Next Up

Check out my next post in the ArgoCD series: [Configuring SSO with Azure Active Directory on ArgoCD](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b)

### References

Check out some useful references:

*   [Kubernetes](https://medium.com/@kumargaurav1247/service-account-in-kubernetes-2287d225eebe) `[ServiceAccounts](https://medium.com/@kumargaurav1247/service-account-in-kubernetes-2287d225eebe)`
*   [Tekton](https://github.com/tektoncd/pipeline/blob/master/docs/resources.md) `[PipelineResources](https://github.com/tektoncd/pipeline/blob/master/docs/resources.md)`
*   [Tekton authentication](https://github.com/tektoncd/pipeline/blob/master/docs/auth.md)
*   [Tekton](https://github.com/tektoncd/pipeline/blob/master/docs/tasks.md#overview) `[Tasks](https://github.com/tektoncd/pipeline/blob/master/docs/tasks.md#overview)`
*   [Tekton](https://github.com/tektoncd/pipeline/blob/master/docs/pipelines.md#pipelines) `[Pipelines](https://github.com/tektoncd/pipeline/blob/master/docs/pipelines.md#pipelines)`
*   [Tekton](https://github.com/tektoncd/pipeline/blob/master/docs/pipelines.md#adding-finally-to-the-pipeline) `[Pipeline](https://github.com/tektoncd/pipeline/blob/master/docs/pipelines.md#adding-finally-to-the-pipeline)` [](https://github.com/tektoncd/pipeline/blob/master/docs/pipelines.md#adding-finally-to-the-pipeline)`[Finally](https://github.com/tektoncd/pipeline/blob/master/docs/pipelines.md#adding-finally-to-the-pipeline)` [tasks](https://github.com/tektoncd/pipeline/blob/master/docs/pipelines.md#adding-finally-to-the-pipeline)
*   [Tekton](https://github.com/tektoncd/pipeline/blob/master/docs/pipelineruns.md#overview) `[PipelineRuns](https://github.com/tektoncd/pipeline/blob/master/docs/pipelineruns.md#overview)`
*   [Tekton](https://tekton.dev/docs/triggers/triggertemplates/#triggertemplates) `[TriggerTemplates](https://tekton.dev/docs/triggers/triggertemplates/#triggertemplates)`.
*   [Tekton](https://tekton.dev/docs/triggers/triggerbindings/) `[TriggerBindings](https://tekton.dev/docs/triggers/triggerbindings/)`
*   [Tekton](https://tekton.dev/docs/triggers/eventlisteners/) `[EventListeners](https://tekton.dev/docs/triggers/eventlisteners/)`
*   [ArgoCD docs](https://argoproj.github.io/argo-cd/core_concepts/)
*   [Kustomize](https://blog.stack-labs.com/code/kustomize-101/) reference

By [Adriana Villela](https://medium.com/@adri-v) on [October 25, 2020](https://medium.com/p/cf4f4d9972b0).

[Canonical link](https://medium.com/@adri-v/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0)

Exported from [Medium](https://medium.com) on June 3, 2026.