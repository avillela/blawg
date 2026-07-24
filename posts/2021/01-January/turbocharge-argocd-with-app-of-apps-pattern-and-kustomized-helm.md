---
title: "Turbocharge ArgoCD with App of Apps Pattern and Kustomized Helm"
slug: turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm
description: "An SRE’s guide to ArgoCD’s App of Apps pattern, Kustomized Helm, and step-by-step tutorial."
added: "Jan 12, 2021"
tags:
  - technical
  - argocd
  - kubernetes
---

# Turbocharge ArgoCD with App of Apps Pattern and Kustomized Helm

![](https://cdn-images-1.medium.com/max/800/1*xMuhoheW7huxZQIu7JePoA.png)

Sculpture at Montserrat, Spain. Photo by Dzero Labs.

Well folks, it’s been a few months now since we’ve started on the [ArgoCD journey](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9) together, and it’s been a wild ride. But we’re not done yet!

If you’ve been following along at home, we’ve gone from [setting up ArgoCD and Tekton on Kubernetes](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9), to [creating a Kubernetes-native build and release pipeline with Tekton and ArgoCD](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0), to configuring [SSO with Active Directory on ArgoCD](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b).

### Application Deployments Revisited

So what’s next? Well, we did a simple app deployment with ArgoCD when we did the [Tekton + ArgoCD example](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0), which was a good start.

[As you may recall](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0), ArgoCD lets us define an `Application` resource, which is responsible for orchestrating the deployment of an application manifest to the target Kubernetes cluster.

> **NOTE:** _When I say “application manifest”, I mean all the YAML definitions that make your microservice run in Kubernetes. For example,_ `_Service_` _resource definition and a_ `_Deployment_` _resource definition._

The `Application` definition points to a folder where the manifests are located. Out of the box, ArgoCD supports plain ’ole YAML, [Kustomize](https://argoproj.github.io/argo-cd/user-guide/kustomize/), [Helm](https://argoproj.github.io/argo-cd/user-guide/helm/), and [Jsonnet](https://argoproj.github.io/argo-cd/user-guide/jsonnet/). (Note: [Ksonnet is deprecated as of the time of this writing](https://argoproj.github.io/argo-cd/user-guide/ksonnet/).)

That’s all well and good, but what about when we have to do something a bit more complicated? Like deploy a bunch of related microservices??

Stick around, because I’ll explain all of that, AND I’ll have a short tutorial at the end that you can try out for yourself.

To follow along in the tutorial, you’ll need to have a Kubernetes cluster with ArgoCD installed. If you need help installing ArgoCD on Kubernetes, DON’T PANIC! Check out my blog post on [how to install ArgoCD on an existing Kubernetes cluster on a TLS-enabled Ambassador API Gateway](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9).

### The App of Apps Pattern

Since we’re using ArgoCD, we need to create an `Application` definition for each microservice being deployed. But, since they’re part of an app bundle, it would be nice if we had a way to ArgoCD know that.

> **NOTE:** _I refer to “app bundle” as a group of related microservices._

This is where the [App of Apps Pattern](https://argoproj.github.io/argo-cd/operator-manual/cluster-bootstrapping/#app-of-apps-pattern) comes into play. And lucky for us, it’s not rocket science!

Put plainly, the [App of Apps Pattern](https://argoproj.github.io/argo-cd/operator-manual/cluster-bootstrapping/#app-of-apps-pattern) lets us define a root ArgoCD `Application` (Root App). Rather than point to an application manifest, the Root App points to a folder which contains the `Application` YAML definition for each microservice that’s point of the app bundle (Child Apps). Each microservice’s `Application` YAML then points to a directory containing the application manifests.

Let’s consider the Guestbook app, which is based on an example from [ArgoCD’s own docs](https://argoproj.github.io/argo-cd/operator-manual/cluster-bootstrapping/#app-of-apps-pattern) (repo can be found [here](https://github.com/argoproj/argocd-example-apps)):

![](https://cdn-images-1.medium.com/max/800/1*WUlOWlNQyIkcMJeCtene3w.png)

App of Apps Pattern for the Guestbook Application

The diagram above depicts four component microservices which make up the Guestbook App.

The Root App’s definition looks like this:

ArgoCD App of Apps: Sample Root App Definition

Line 14 tells ArgoCD to look into the `[apps](https://github.com/argoproj/argocd-example-apps/tree/master/apps)` folder of the [source repo](https://github.com/argoproj/argocd-example-apps) for the Kubernetes manifests. It so happens that the manifests in that folder are `Application` definitions for the Child Apps.

Looking at a sample Child App definition, we see something like this:

ArgoCD App of Apps: Sample Child App Definition

In the sample Child App above, when we look at Line 14, it tells ArgoCD to look in the `[helm-guestbook](https://github.com/argoproj/argocd-example-apps/tree/master/helm-guestbook)` folder of the [source repo](https://github.com/argoproj/argocd-example-apps) for Kubernetes manifests. In this case, it’s the folder where a Helm Chart is defined. The folder could’ve easily contained a Kustomization or plain old Kubernetes YAML files.

One thing I’d also like to point out is Line 11, which states that the destination cluster is `dev-cluster`. This is different from Line 11 in the Root App definition, whose destination value is `in-cluster`. This is because the Root app must be deployed to the cluster in which ArgoCD is installed (i.e. `in-cluster`). The Child App, however, will most likely be deployed to a different cluster — like your DEV, QA, or PROD cluster.

In case you’re wondering how to find the cluster name, simply run this command:

argocd cluster add

The output will show something like this:

CURRENT        NAME         CLUSTER        SERVER  
\*              dev-cluster  dev-cluster    https://<some\_ip>  
               qa-cluster   qa-cluster     https://<some\_other\_ip>

The value from the `NAME` field in the output above is what you need.

#### App of Apps Best Practices

It’s worth noting a few best practices around the App of Apps pattern.

**1- Create a project for each app bundle**

[ArgoCD projects](https://argoproj.github.io/argo-cd/user-guide/projects/#projects) provide a logical grouping of applications. They can also be used to:

*   Define trusted Git repos (so you can’t deploy apps pointing to just any old git repo and potentially wreak havoc)
*   Define what types of resources can be created on a cluster (maybe you don’t want someone to be creating `RoleBindings` willy-nilly?)
*   Define who has access to the project, and therefore, to the `Applications` in the project.
*   Restrict what clusters you can deploy an app to. Our good ‘ole separation of concerns at work here.

ArgoCD projects are defined using special ArgoCD resource called `AppProject`.

You can check out a sample ArgoCD `AppProject` definition below:

The above is a very simple definition and therefore doesn’t take advantage of all of the `AppProject` goodies listed above, but it gives you a good start.

**2- Create environment-specific app bundles and projects**

So, we agree that we should create an `AppProject` per application bundle. Let’s take it a step further and create an `AppProject` per application bundle per _environment_. When you think about it, it makes sense. You’ll have to create a separate application bundle definition for each target environment anyway, since you’d need to target different clusters each time you deploy to a different environment.

And yes, you can for sure get fancy and do some templating to create your `Application` definitions.

**3- Keep Application definitions in a separate repo**

My personal preference is to have the ArgoCD `Application` and `AppProject` definitions in a separate repo from the source code repo.

Why? Because chances are, the team managing application deployment to Kubernetes via ArgoCD is different from the team writing the actual application code.

If you’re still not sure right now, don’t worry. You’ll get a better idea of the setup when we get to the example below.

### Kustomized Helm

So, we know that ArgoCD supports [Helm](https://helm.sh) and [Kustomize](https://blog.stack-labs.com/code/kustomize-101/), but what about when we want to do something fancier, like [Kustomized Helm](https://jfrog.com/blog/power-up-helm-charts-using-kustomize-to-manage-kubernetes-deployments/)?

First, why would I want to do [Kustomized Helm](https://jfrog.com/blog/power-up-helm-charts-using-kustomize-to-manage-kubernetes-deployments/)? Well, Helm is great at some things, and not so great at other things. Same goes for Kustomize.

Helm is great for templating.

Kustomize is great for:

*   Applying common configs to a set of YAML files at once (e.g.labels, namespaces, annotations)
*   Overriding values by applying selective changes to YAML files

So when we talk about [Kustomized Helm](https://jfrog.com/blog/power-up-helm-charts-using-kustomize-to-manage-kubernetes-deployments/), it means that we apply a Helm template first, followed by a [Kustomize overlay](https://blog.stack-labs.com/code/kustomize-101/), so you end up with the best of both worlds.

Fortunately, enabling Kustomized Helm on ArgoCD is not hard at all. All we need to do is update the `argocd-cm.yml` definition by adding an entry for a new plugin, and call it `kustomized-helm`, like so:

Okay…so what the heck does this do?

We’re telling ArgoCD to run the command on Line 19 if we _choose_ to use the newly-created plugin called `kustomized-helm`:

helm template ../../helm\_base — name-template $ARGOCD\_APP\_NAME — include-crds > ../../helm\_base/all.yml && kustomize build

The above command is doing the following:

**1- Render the chart template locally**

To do this, we use the `helm template` command, which, per the above command, saves the output to `all.yml`.

We’re telling ArgoCD to look for the `Chart.yaml` in the `helm_base` folder. This means that our repo must have a `helm_base` folder in order for this to work.

**2- Apply a Kustomization to** `**all.yml**`

To do this, Kustomize expects a `kustomization.yml`. In this case, the `kustomization.yml` must be in the `helm_base` folder.

Here’s what our sample `kustomization.yml` would look like:

Now, if you’ve seen [ArgoCD’s sample argocd-cm.yml for configuring Kustomized Helm](https://github.com/argoproj/argocd-example-apps/blob/master/plugins/kustomized-helm/README.md), you’d notice right away that mine differs slightly, in that I “force” you to have this `helm_base` folder in your repo. The reason why I do this is because I want to make use of Kustomize’s overlays, which is perfect if I want to use different values for different environments to which I’m deploying my app. I basically end up with a file structure like this:

![](https://cdn-images-1.medium.com/max/800/1*UJABjTbHQ1M-Tj_7d6OdsA.png)

And if I want to define an ArgoCD Application to use the `dev` overlay, I end up with something like this:

Sample ArgoCD Application definition using Kustomized Helm

Note that on Line 14, we set the path to `kustomized_helm/overlays/dev`. Referring back to our file structure diagram above, ArgoCD will look in `kustomized_helm/overlays/dev` for a `kustomization.yml` file, which looks something like this:

Line 5 refers to our `helm_base` folder, which is where our base `kustomization.yml` is located (the one that references the resource `all.yml`).

So when we run `argocd app sync`, the process looks something like this:

![](https://cdn-images-1.medium.com/max/800/1*w5EGI6F8vNA8fBqb9bQqNA.png)

Kustomized Helm in action

Okay…so now that we know what the heck this mysterious plugin is doing, let’s apply it to our ArgoCD cluster so that it’s available:

kubectl apply -f argocd-cm.yml

Now that we have this plugin defined, how do we use it? To do so, you simply refer to the plugin in your ArgoCD `Application` spec:

plugin:  
  name: kustomized-helm

Where `kustomized-helm` is the name that we gave the plugin that we defined above in Line 13 in `argocd-cm.yml`.

The full `Application` YAML looks like this:

### An Example

Now that you’ve got a good idea on how the App of Apps Pattern works, let’s put it into practice, shall we?

I’ve basically got the following setup:

**1-** [**App of Apps Parent App repo**](https://github.com/d0-labs/argocd-app-of-apps-parent)

[This repo](https://github.com/d0-labs/argocd-app-of-apps-parent) contains the YAML manifests which define the following for DEV, QA, and PROD environments:

*   The ArgoCD project in which the app will reside
*   The ArgoCD root app
*   The ArgoCD child apps (2048-game and Guestbook)

**2-** [**App of Apps Child App: 2048-game repo**](https://github.com/d0-labs/argocd-app-of-apps-child-2048-game)

Our good ‘ole friend the 2048 game makes a return appearance! Here I’ll be demonstrating what a Kustomized Helm deployment looks like.

**3-** [**App of Apps Child App: Guestbook repo**](https://github.com/d0-labs/argocd-app-of-apps-child-guestbook)

This is based on one of the examples from the [ArgoCD example repo](https://github.com/argoproj/argocd-example-apps/tree/master/kustomize-guestbook), and I just have it here to show what it looks like to deploy two “apps” with the App of Apps pattern. Don’t expect this app to function on its own.

#### Prerequisites

To run the example below, you’ll need the following:

*   A Kubernetes cluster
*   ArgoCD running on the Kubernetes cluster

If you need help installing ArgoCD on Kubernetes, DON’T PANIC! Check out my blog post on [how to install ArgoCD on an existing Kubernetes cluster on a TLS-enabled Ambassador API Gateway](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9).

#### 1- Login to ArgoCD

To login to ArgoCD, replace the values in `<…>` with your own values, and run the snippet below:

export ARGOCD\_USERNAME=<argocd\_username>  
export ARGOCD\_PASSWORD=<argocd\_password>  
export ARGOCD\_SERVER=<argocd\_server>

argocd login $ARGOCD\_SERVER --username $ARGOCD\_USERNAME --password $ARGOCD\_PASSWORD

#### 2- Register the repos with ArgoCD

We need to register our repos ArgoCD, so let’s add the 3 repos:

export GIT\_TOKEN=<git\_personal\_access\_token>

argocd repo add [https://github.com/d0-labs/argocd-app-of-apps-parent](https://github.com/d0-labs/argocd-app-of-apps-parent) --username git --password $GIT\_TOKEN

argocd repo add [https://github.com/d0-labs/argocd-app-of-apps-child-2048-game](https://github.com/d0-labs/argocd-app-of-apps-child-2048-game) --username git --password $GIT\_TOKEN

argocd repo add [https://github.com/d0-labs/argocd-app-of-apps-child-guestbook](https://github.com/d0-labs/argocd-app-of-apps-child-guestbook) --username git --password $GIT\_TOKEN

![](https://cdn-images-1.medium.com/max/800/1*XlIblub6V_tJt-Ok-fiCTQ.png)

Registering our repos with ArgoCD

You can now list your repos:

argocd repo list

Which will give you an output that looks something like this:

![](https://cdn-images-1.medium.com/max/800/1*j-2UlNE-fN44L0uTYmGwZQ.png)

Sample list of repos registered in ArgoCD

Or if you want to check it out in the GUI, go into the ArgoCD console and click on the gear icon on the left-hand pane, and then click on Repositories:

![](https://cdn-images-1.medium.com/max/800/1*ATzU7ZBulvmDsFkIN9_tKA.png)

Newly-registred repositories in ArgoCD

#### 3- Create the Dev Project

Now that we’ve got our repos registered, let’s create our project. Again, we’re creating a project to encapsulate our application. We’re also sticking with our best practice of having a different project per environment.

> **NOTE:** _For this tutorial, we’re creating all resources for the DEV environment._

kubectl apply -f argocd/projects/project-dev.yml

Hurray! We’ve created a new project, which you can see by going into the ArgoCD console and clicking on the gear icon on the left-hand pane, and then clicking on Projects:

![](https://cdn-images-1.medium.com/max/800/1*4R0tXSSysAmbsN1pN20CLw.png)

Your newly-created ArgoCD project

Or, if you’re a CLI-lover like me, you can run:

argocd proj list

Which gives you something like this:

![](https://cdn-images-1.medium.com/max/800/1*u-kfOhYEhLZFIcwpXkHXog.png)

Sample list of ArgoCD projects

#### 4- Create the Root App

We are now ready to create our Root App in ArgoCD. We can do it with `kubectl`, since, an ArgoCD `Application` is a (custom) Kubernetes resource:

kubectl apply -f argocd/root-app-dev.yml

As soon as we create our app, we can see it on the ArgoCD console:

![](https://cdn-images-1.medium.com/max/800/1*eKj_xf69UnMW_pWJTh-7ww.png)

Our newly-created Root App

But we’re not done yet. You’ll notice that the status says `Missing` and `OutOfSync`.

If we click on that tile, we’ll see this:

![](https://cdn-images-1.medium.com/max/800/1*IUBZULGb_M9qYj2NLCp79w.png)

Okay…so ArgoCD recognizes the Root App and its two children! It means that it knows that there are `Application` manifests for the two children, and also even found them, but they haven’t actually been created in Kubernetes. In order to do that, we must run an `argocd app sync`.

Let’s go ahead and do that now.

#### 5- Sync the Root App and its children

First, let’s sync the Root App:

argocd app sync root-appbundle-app-dev

We immediately see that the child Applications have been created!

![](https://cdn-images-1.medium.com/max/800/1*saimkyUbkECSEKc1T48A6w.png)

But they haven’t been synced. So if we drill into each of these apps, we see this:

![](https://cdn-images-1.medium.com/max/800/1*EcR2ve6FUQ7sdikQaP-yoQ.png)

2048-game hasn’t been synced

![](https://cdn-images-1.medium.com/max/800/1*hpdJX_0tdCCmW9xfyOBqxA.png)

Guestbook app hasn’t been synced

So let’s sync the two child apps with this command:

argocd app sync -l app.kubernetes.io/instance=root-appbundle-app-dev

Note how we don’t even list the individual child apps by name! That’s because we use the special ArgoCD label, `app.kubernetes.io/instance`, and give it the value `root-appbundle-dev`, the name of our Root App! That means that if your app consists of 10 apps, you’ll only ever need the above two sync commands (one for the Root App, and one for the Children)!

If everything syncs correctly, you’ll see something like this:

![](https://cdn-images-1.medium.com/max/800/1*OlyZwbaZ7KPA43fkjYrMgA.png)

And drilling into each Child App, we see this:

![](https://cdn-images-1.medium.com/max/800/1*iuPRsOgitR7619gKtJhF2Q.png)

2048-game has been successfully deployed

![](https://cdn-images-1.medium.com/max/800/1*Xl_65Xr3L3GOD-iS0NsYMw.png)

helm-guestbook app has been successfully deployed

#### Cleanup

One of the coolest things about using the App of Apps pattern is that when you delete the Root App, by default it deletes the Child Apps and all of their resources, in one fell swoop! That includes namespaces too. So you end up with a very clean delete.

To delete our Root App and all of its children:

argocd app delete root-appbundle-app-dev

More on the `argocd app delete` command [here](https://argoproj.github.io/argo-cd/user-guide/app_deletion/#deletion-using-argocd).

Note that the above command does NOT delete projects and repos. Those need to be done separately.

Deleting our repos from ArgoCD:

argocd repo rm [https://github.com/d0-labs/argocd-app-of-apps-parent](https://github.com/d0-labs/argocd-app-of-apps-parent)

argocd repo rm [https://github.com/d0-labs/argocd-app-of-apps-child-2048-game](https://github.com/d0-labs/argocd-app-of-apps-child-2048-game)

argocd repo rm [https://github.com/d0-labs/argocd-app-of-apps-child-guestbook](https://github.com/d0-labs/argocd-app-of-apps-child-guestbook)

Deleting our project from ArgoCD:

argocd proj delete appbundle-project-dev

> **NOTES:**

> _You can’t delete a repo unless you delete all apps associated with that repo first._

> _Similarly, you can’t delete a project until you delete all apps associated with that project first. If your project has associated repos, you must delete those before you can delete the repo._

### Gotchas!

It’s worth noting an ArgoCD app deployment gotcha that has caused me a bit of grief in the past. Hopefully this section will save you some hair-pulling.

Sometimes you might notice that when you deploy an application, it will show up as `Healthy`, but the Sync Status is `Unknown`. Kind of like this:

![](https://cdn-images-1.medium.com/max/800/1*gf5fAnvkj7nPqJ56mQSkxw.png)

Looks good, but it ain’t!

This is not good. It means that something went caca, and most likely your `Application` definition has an error.

When we click on the tile above to drill in, we see this:

![](https://cdn-images-1.medium.com/max/800/1*U-CVJM9TiqvfjBXk4PFoCQ.png)

Yup, we definitely have an error!

We definitely see an error (see above, highlighted), because we don’t see the Child Apps. This means that ArgoCD didn’t find the manifests in version control for them. Something is definitely stanky.

We should be seeing something to the diagram below.

![](https://cdn-images-1.medium.com/max/800/1*IUBZULGb_M9qYj2NLCp79w.png)

What we SHOULD be seeing

You can click on the `Error` to see what’s up. It reveals this:

![](https://cdn-images-1.medium.com/max/800/1*S9IomeoBaLQiOYxuOf-qhw.png)

Uh…okay…thanks…

You can also see what’s going on by tapping into our good buddy, `kubectl describe` command for our app, `root-appbundle-app-dev`:

kubectl describe application -n argocd root-appbundle-app-dev

> **NOTE:** _All ArgoCD applications are created in the_ `_argocd_` _namespace._

Which gives us output that may look something like this:

![](https://cdn-images-1.medium.com/max/800/1*yePyjDfPEs6wmx_baq08kg.png)

In our case, it’s pointing to some sort of authentication issue. Upon closer look, the repo we’re referring to in the spec, `d0-argocd-app-of-apps-parent` is wrong. We don’t have such a repo registered. We registered `argocd-app-of-apps-parent`(i.e. no `d0-` prefix). Sunofa…

![](https://cdn-images-1.medium.com/max/800/1*JzUm_Eae2a7eVqxIDVuCKA.jpeg)

Classic Picard facepalm. Image source: [CNET](https://cnet3.cbsistatic.com/img/gw3zsHSUTpgK5oG4GdH5_UvpRxM=/109x127:1440x873/1092x614/2019/05/22/1b710a6b-5f4d-4987-a046-c23674b221a3/picard-meme-facepalm.jpg).

After your fix the error, I recommend that you just nuke the `Application` from ArgoCD either via the GUI or `argocd app delete`, and recreate it again using `kubectl`.

### That’s a wrap!

Okay…we’ve learned a lot today!

We learned that:

*   The App of Apps pattern is great for bundling related applications together.
*   Creating a separate project in ArgoCD for each App of Apps bundle, per target Kubernetes environment (DEV, QA, PROD) is good.
*   Kustomize + Helm make a hell of a tag-team!
*   When you need to nuke your App of Apps app bundle, deleting the Root App in ArgoCD by default does a cascade delete, which cleans up all Child App resources, including namespaces, so you don’t lose your mind doing cleanup.
*   App deletion in ArgoCD does not nukify projects and repos.

And because you’ve put up with yet another long-ass blog post, here’s a picture of a cuddly little [silkie chicken](https://en.wikipedia.org/wiki/Silkie). (Silkies, by the way, are the cutest chickens EVER.)

![](https://cdn-images-1.medium.com/max/800/1*SqapQalnPecjS1onQtuAkQ.jpeg)

Photo by [Paige Cody](https://unsplash.com/@paige_cody?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/silkie-chicken?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### One more thing…

In the spirit of DevOpsyness, it would be cool if we had a cleaner way of creating all of the App of Apps manifests and Kustomized Helm templates discussed here, without having to do it manually, right?

I’m currently working on a follow-up blog post to discuss just that. In the meantime, check out our [newly-open-sourced tool](https://github.com/d0-labs/argocd-app-bootstrap) that does a bunch of that ArgoCD magic. And stay tuned for the follow-up blog post!

### Other stories in my ArgoCD journey

Want to know more on how we got here? Check out the other stories in my ArgoCD journey below!

[**Installing Ambassador, ArgoCD, and Tekton on Kubernetes**  
_Configuring your Kubernetes cluster for Kubernetes-native build and release with Tekton and ArgoCD_medium.com](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9 "https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9")[](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9)

[**Using Tekton and ArgoCD to Set Up a Kubernetes-Native Build & Release Pipeline**  
_A Tekton and ArgoCD primer and step-by-step guide for setting up and running build & release workflows with Tekton and…_medium.com](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0 "https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0")[](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0)

[**Configuring SSO with Azure Active Directory on ArgoCD**  
_Turbocharging ArgoCD with advanced configuration_medium.com](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b "https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b")[](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b)

By [Adriana Villela](https://medium.com/@adri-v) on [January 12, 2021](https://medium.com/p/ea4993190e7c).

[Canonical link](https://medium.com/@adri-v/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c)

Exported from [Medium](https://medium.com) on June 3, 2026.