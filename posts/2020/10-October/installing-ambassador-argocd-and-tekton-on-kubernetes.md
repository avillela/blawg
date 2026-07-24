---
title: "Installing Ambassador, ArgoCD, and Tekton on Kubernetes"
slug: installing-ambassador-argocd-and-tekton-on-kubernetes
description: "Configuring your Kubernetes cluster for Kubernetes-native build and release with Tekton and ArgoCD"
added: "Oct 06, 2020"
tags:
  - technical
  - argocd
  - kubernetes
  - tekton
  - "2020"
---


![](https://cdn-images-1.medium.com/max/800/1*bZxXCJOqyxpyH_XzAwp32g.jpeg)

Subway tunnel. Photo credit: Dzero Labs

As a developer, I spend hours poring through half-baked vendor documentation, StackOverflow questions with “Hey, I have the same problem!” followed by a bunch of crappy, voodoo-esque answers, blog posts that end abruptly, and GitHub repos with partially-working examples…all of which I ultimately “Sherlock Holmes” (used as a verb 😊) to finally stitch together a working example of the something-or-other that I’m working on. (I’m sure you do too!) This blog post has DETAILS, with the aim of sparing you some of the pain and suffering I went through, if only for but a small cross-section of Kubernetes setup.

### Background

In the past couple of weeks, I’ve been on a mission to set up a Kubernetes-native build and release pipeline. After much research and discussion with my SRE friends, I landed on using [Ambassador Edge Stack](https://www.getambassador.io), [ArgoCD](https://argoproj.github.io), and [Tekton](https://tekton.dev) for my pipeline.

The purpose of this post is to:

1.  Explain the reasoning behind the tools selection
2.  Provide a high-level overview of the reference architecture used for my setup
3.  Provide detailed instructions and supporting code for installing [Ambassador](https://www.getambassador.io) with TLS (using [Cert-Manager](https://cert-manager.io)), [ArgoCD](https://argoproj.github.io), and [Tekton](https://tekton.dev) on Kubernetes.

**_Disclaimer:_** My setup applies to a Kubernetes cluster running on Azure. On the most part, that shouldn’t matter. The only part that’s Azure-specific is the FQDN setup.

Feel free to skip over to the section that applies most to you, or to read this post in gory details.

**_Assumptions:_**

*   You already have a Kubernetes cluster set up
*   `kubectl` is installed on your system

### Tools Selection

Now, you may be wondering why I’ve gone with this particular toolset, and I feel that it’s important to elaborate on this, before we move on.

#### Ambassador

Ambassador is an API Gateway. If you deal with APIs (i.e REST calls, gRPC, GraphQL, SOAP), chances are, you need an API Gateway. API Gateways differ from Ingress Controllers in that Ingress Controllers simply serve up pages and route traffic. API Gateways, on the other hand, will do things like limit requests and manage authentication. They basically act as a proxy for your traffic.

Ambassador also has integration with the Kubernetes Ingress Controller, meaning that it abstracts, or takes over that Ingress Controller.

I chose Ambassador for a few reasons:

*   It’s Kubernetes-native and is built on [Envoy](https://www.envoyproxy.io)
*   It plays nice with service meshes such as [Istio](https://istio.io) and [Linkerd](https://linkerd.io)
*   It supports [Canary releases](https://www.getambassador.io/docs/latest/topics/using/canary/), [traffic shadowing](https://www.getambassador.io/docs/latest/topics/using/shadowing/), and lets you configure [circuit breakers](https://www.getambassador.io/docs/latest/topics/using/circuit-breakers/) quite nicely
*   [Supports TLS](https://www.getambassador.io/docs/latest/topics/running/tls/) with [cert-manager](https://cert-manager.io/docs/)
*   It’s fairly simple to set up and configure

I set up TLS on my cluster because honestly, if you’re going to have a prod-ready Kubernetes cluster, you need to secure your traffic. Period.

#### ArgoCD

Understanding the need for [ArgoCD](https://argoproj.github.io/argo-cd/) took me a bit to wrap my head around, because initially, my thought was, “Well, I can just use Kustomize or Helm to deploy an application to a cluster.” I actually argued with [Bernard Otu](https://medium.com/u/2cce98ae7530) over this one, because I JUST. DIDN’T. GET. IT.

But now I do, and I want to make sure that you do too! The thing is, running Kubernetes is more than just application deployment. You’re looking at scaling pods, tweaking resources, managing traffic. In short, you need to look at the system holistically. ArgoCD gives you that holistic system view, and a holistic way to manage your deployments.

A tool like ArgoCD supports GitOps. GitOps, in a nutshell, is all about making Git the source of truth, whether you’re using Git to define your infrastructure code or your application code.

Because of ArgoCD’s mega Git love, it means that ArgoCD knows when your Kubernetes manifests are different from what you have in version control. It’s like Santa Claus — it knows if you’ve been bad or good! 😁

A few other things worth mentioning about ArgoCD:

*   Facilitates Canary Deployments, Blue/Green Deployments, and rollbacks
*   Lets you deploy to multiple Kubernetes clusters
*   Lets your see all of your deployments in one place
*   Lets you know about application health (i.e. did your app deploy successfully to the cluster?)
*   Gives you a cool network diagram of your application deployments (see below)

![](https://cdn-images-1.medium.com/max/800/1*w6qmyeBvZdc81MvVZpyLtA.jpeg)

ArgoCD sample app deployment

#### Tekton

Now, you might be wondering why the heck I would choose Tekton for my pipeline orchestration when there are already tons of tools out there that do this, like CircleCI, Jenkins, Bitbucket Pipelines, GitHub Actions, etc. Here’s why:

*   Tekton is Kubernetes-native. You simply define your Tekton pipelines as Kubernetes resources.
*   If you’re already working in Kubernetes, rather than use yet ANOTHER tool, just stay in the Kubernetes family. As they say, _When in Rome…_
*   (I cringe a little to say this, but here goes) If you ever decide to move your Kubernetes home to another cloud provider, or universe forbid, go the multi-cloud route, Tekton is pretty easy to port over, and you won’t need to fuss around with too many cloud provider settings.
*   Tekton is a GitOps tool, which means that Git repo pushes and pull requests can trigger your pipeline via Webhook. AWESOME!
*   [Tekton Pipelines are ephemeral](https://medium.com/dzerolabs/how-to-fix-your-broken-enterprise-devops-145be3d52ae2) — if you accidentally nuke your pipeline, you can recreate it easily!
*   Tekton gives you Kubernetes on Kubernetes love by orchestrating tasks all inside your Kubernetes cluster. Because it runs these tasks as Kubernetes `Job` resources, once the job is done, the pod is no longer running. Again…[Ephemeral](https://medium.com/dzerolabs/how-to-fix-your-broken-enterprise-devops-145be3d52ae2)!

### Reference Architecture

My setup is based on the reference architecture below, which comes from [this GitHub repo](https://github.com/ibm-cloud-architecture/node-web-app) (be sure to check it out…it’s pretty useful, though the README is a tad out of date, FYI).

![](https://cdn-images-1.medium.com/max/800/1*6x9zaV0YSu05CEfu32vllg.png)

Reference Artitecture

**_NOTE:_** For best results, I recommend using the [Ephemeral Release Forking branching strategy](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea) (ERF), or at least something like Gitflow. ERF is based on the workflow for contributing to open-source projects. New to ERF? Be sure to check out our reference articles below:

*   [Go Fork Yourself](https://medium.com/dzerolabs/go-fork-yo-self-c8b69aa655ea)
*   [Wut the Fork?](https://medium.com/dzerolabs/wut-the-fork-e875ed525979)

The diagram above basically translates to:

**1- Use Tekton for my Dev pipeline**

*   Trigger the Tekton dev build & deploy pipeline via Webhook to Tekton. The Webhook is triggered by a merge to the integration branch (e.g. `develop` branch).
*   Build & publish a container image to our Docker registry via [Kaniko](https://cloud.google.com/blog/products/gcp/introducing-kaniko-build-container-images-in-kubernetes-and-google-container-builder-even-without-root-access) Tekton task.
*   Deploy a containerized application to our Kubernetes dev cluster via `argocd app sync` Tekton task.

**2- Use ArgoCD to deploy to my non-Dev clusters**

*   Trigger a QA and/or UAT deploy manually
*   Trigger the prod deploy via Webhook to ArgoCD. The Webhook is triggered by a merge to the `master` branch on the [golden repo](https://medium.com/dzerolabs/wut-the-fork-e875ed525979).
*   Deploy a containerized application to our Kubernetes non-dev cluster via `argocd app sync`.

**3- Use ArgoCD to deploy my Tekton pipeline**

*   And why not? After all, Tekton pipelines are nothing more than Kubernetes manifests, at the end of the day

Now, because ArgoCD lets you deploy to multiple Kubernetes clusters, best practices dictate that ArgoCD be installed on its own Kubernetes cluster. Why? Suppose you installed ArgoCD on your dev cluster. If that cluster went down, there goes your ability to deploy to prod. Sucks to be you.

Tekton should only be installed on your dev cluster, because we’re only using Tekton for build (via Kaniko) and deploy (via ArgoCD) to dev. For QA and Prod, we’ll be using ArgoCD only, as we’re following the [“build once, deploy many” mantra of ERF](https://medium.com/dzerolabs/wut-the-fork-e875ed525979).

### Setup

For your reference, I’ve packaged all this neatly into a GitHub repo as well. Be sure to check it out [here](https://github.com/d0-labs/ambassador-argo-tekton).

#### Ambassador Setup

First, I set up [Ambassador](https://www.getambassador.io) (with TLS) as my API gateway. Why? For two reasons:

*   To expose the ArgoCD dashboard and API server
*   To expose Tekton Trigger EventListener services, so that I could trigger a Tekton pipeline via a Webhook

I set up TLS on Ambassador using Cert-Manager.

**1- Install Ambassador ≥**v1.7.3

To install Ambassador on your cluster, run the commands below:

kubectl apply -f [https://www.getambassador.io/yaml/aes-crds.yaml](https://www.getambassador.io/yaml/aes-crds.yaml) && kubectl wait --for condition=established --timeout=90s crd -lproduct=aes && kubectl apply -f [https://www.getambassador.io/yaml/aes.yaml](https://www.getambassador.io/yaml/aes.yaml) && kubectl -n ambassador wait --for condition=available --timeout=90s deploy -lproduct=aes

Among other things, the installation will create an `ambassador` namespace, and Ambassador custom resources.

If all goes well, you should be able to hit the Ambassador page on your cluster. To get the load balancer IP, run the following command:

AMBASSADOR\_IP=$(kubectl get -n ambassador service ambassador -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")

And then open up a browser window with the following address: `http://$AMBASSADOR_IP`, replacing `$AMBASSADOR_IP` with the value from the command above.

![](https://cdn-images-1.medium.com/max/800/1*tuZox59YvBWIzfzW4lPfqQ.jpeg)

Ambassador homepage on your cluster

**2- Install Cert-Manager v1.0.0**

To get started with our TLS setup, you first need to install `cert-manager` on your cluster, by running the commands below:

kubectl apply -f [https://github.com/jetstack/cert-manager/releases/download/v1.0.0/cert-manager.crds.yaml](https://github.com/jetstack/cert-manager/releases/download/v1.0.0/cert-manager.crds.yaml)

helm repo add jetstack [https://charts.jetstack.io](https://charts.jetstack.io) && helm repo update

kubectl create ns cert-manager

helm install cert-manager --namespace cert-manager jetstack/cert-manager

Among other things, the installation will create a `cert-manager` namespace, and cert-manager custom resources.

**3- Configure FQDN on your cluster (AKS only)**

This step applies to setting up an FQDN on AKS only. You’ll need to check your cloud service provider docs to find out how to set up DNS or FQDN on your cluster. For GKE folks, you may want to check out [this post](https://medium.com/faun/dns-and-gke-network-configuration-on-google-cloud-platform-1bfdc74fe2e). I’ve bookmarked this for myself to try in GKE at a later point, though I haven’t tried it myself. Perhaps it may have some useful nuggets for you.

**_Note:_** You’ll need to have the Azure CLI installed, in order for the above to work. Instructions on how to install it can be found [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli). After your install the Azure CLI, you’ll also have to have the Azure AKS CLI installed, by running:

az aks install-cli

Check out the Microsoft reference docs [here](https://docs.microsoft.com/en-us/azure/aks/ingress-tls#add-an-a-record-to-your-dns-zone) for more info on the FQDN setup below.

\# Public IP address of your ingress controller  
IP=$(kubectl get -n ambassador service ambassador -o "go-template={{range .status.loadBalancer.ingress}}{{or .ip .hostname}}{{end}}")  
echo $IP

\# Name to associate with public IP address  
DNSNAME="some-cool-name"

\# Get the resource-id of the public ip -> some delay here!!  
PUBLICIPID=$(az network public-ip list --query "\[?ipAddress!=null\]|\[?contains(ipAddress, '$IP')\].\[id\]" --output tsv)  
echo $PUBLICIPID

\# Update public ip address with DNS name  
az network public-ip update --ids $PUBLICIPID --dns-name $DNSNAME

\# Display the FQDN  
FQDN=$(az network public-ip show --ids $PUBLICIPID --query "\[dnsSettings.fqdn\]" --output tsv)  
echo $FQDN

> **Note:** _You may see some delay in getting the_ `_PUBLICPID_`_. Just keep trying to run the command until eventually returns a value. I’ve had some instances where I keep trying for 10 minutes. Other times, I get a value right away._

Now you should be able to hit the Ambassador home page by going to `[http://$FQDN](http://$FQDN,)`[,](http://$FQDN,) where is `FQDN` is the value of the last command execution in the above snippet.

![](https://cdn-images-1.medium.com/max/800/1*tuZox59YvBWIzfzW4lPfqQ.jpeg)

Ambassador homepage on your cluster

**4- Configure TLS on Ambassador**

First, we create the CertificateIssuer and Certificate, and create corresponding Service and Ambassador Mappings:

Be sure to replace the following values before applying to Kubernetes:

1.  `<you@address.com>` should be replaced with your email address
2.  `<my_fqdn_replace_me>` should be replaced with the FQDN value from Step 3

Now we can apply it to our Kubernetes cluster:

kubectl apply -f ambassador-tls-cert-issuer.yml

Let’s check our pods to make sure everything is good:

kubectl get pods -n cert-manager

You should see a pod called `cert-manager-<XYZ123>`.

![](https://cdn-images-1.medium.com/max/800/1*pP7vkZtBKCVsT6zeu0e9KQ.jpeg)

Output of kubectl get-pods -n cert-manager

You can peek into the logs by running:

kubectl logs cert-manager-<XYZ123> -n cert-manager

Check to make sure that our Certificate was created correctly:

kubectl describe certificates ambassador-certs -n ambassador

This can take a few minutes to set up fully. When setup is completed, you should see `Reason: Ready` and `Status: True` as part of the describe output.

![](https://cdn-images-1.medium.com/max/800/1*bGdL-fcWJGX_RgwtODFQ9Q.jpeg)

Result of kubectl describe certificates ambassador-certs -n ambassador

Next, check to make sure that your secrets have been created:

kubectl get secrets -n ambassador

You should see a secret called `ambassador-certs` of type `Kubernetes.io/tls`.

![](https://cdn-images-1.medium.com/max/800/1*wkk8ivp24S793gD0lfqqsg.jpeg)

ambassador-certs created

Finally, we update Ambassador so that it uses TLS, listens on port 443, and redirect `http` requests to `https`:

Apply the file:

kubectl apply -f ambassador-tls-ambassador-service.yml

If all goes well, we should be able to check everything by going to `https://$FQDN`. This should now display your Ambassador homepage with a lock next to it. Now when you try to hit the HTTP version of the page, you should now be redirected to the HTTPS version of the page.

**_References:_**

*   [https://www.getambassador.io/docs/latest/howtos/cert-manager/](https://www.getambassador.io/docs/latest/howtos/cert-manager/)
*   [https://auth0.com/blog/kubernetes-tutorial-managing-tls-certificates-with-ambassador/](https://auth0.com/blog/kubernetes-tutorial-managing-tls-certificates-with-ambassador/)

#### ArgoCD v1.7.6 Installation

This is where I got really stuck. The ArgoCD docs give you all sorts of instructions for exposing the dashboard and API server with all sorts of ingress controllers, but zilch for Ambassador. I pulled many hairs trying to get this setup right. And then, I found this [great little miracle tool on the Ambassador site, the Ambassador Initalizer tool](https://app.getambassador.io/initializer/). It actually generated the configs that I needed. The funny thing is that I found this tool after some seriously desperate Googling, as a result of landing on [this Medium article](https://itnext.io/deploy-argo-cd-with-ingress-and-tls-in-three-steps-no-yaml-yak-shaving-required-bc536d401491). LIFESAVER.

Don’t worry…I won’t be a jerk and make you scour the links to figure things out for yourself. I’ve got some code for you. 😊

**1- Install ArgoCD**

Run the commands below to install ArgoCD on your cluster:

kubectl create namespace argocd

kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v1.7.6/manifests/install.yaml

Among other things, the installation will create an `argocd` namespace, and ArgoCD custom resources.

**2- Use some magic to use Ambassador to expose ArgoCD services**

The YAML below is what’s needed to expose the ArgoCD services to the outside world.

You basically need to:

*   Create an Ambassador `host` definition
*   Modify the ArgoCD `deployment` (specifically lines 45–47)
*   Define a Ambassador `mapping` so that you can hit the service externally

**_Note:_** The code above was based on the YAML files generated by the [Ambassador Initializer Tool](https://app.getambassador.io/initializer/). The tool generated more than I needed, so I just plucked out the relevant stuff. Be sure to bookmark this tool, because it is friggin’ handy!!

Apply the file:

kubectl apply -f argocd-ambassador.yml

If all goes well, you should now be able to hit the following URLs:

*   `[https://$FQDN/argo-cd](https://$FQDN/argo-cd)` (Admin dashboard)
*   `https://$FQDN/argo-cd/swagger-ui` (API reference)
*   `https://$FQDN/argo-cd/api/webook` (Webhook URL)

![](https://cdn-images-1.medium.com/max/800/1*VHJ3URyBnMydhr0FjEMeQA.jpeg)

ArgoCD Admin Dashboard

**3- Install the ArgoCD CLI**

You’ll need the CLI so that you can create repo links and apps and users and whatnot on ArgoCD. Yes, you can also do it on the GUI, but eeewww.

To install the CLI using Homebrew on Mac:

brew install argocd

For all you non-Mac folks, follow the instructions [here](https://argoproj.github.io/argo-cd/cli_installation/).

**4- Change the admin password, and login to ArgoCD**

By default, the ArgoCD admin password is the same as the `argocd-server` podname:

kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o name | cut -d'/' -f 2

BUT…because we updated the ArgoCD deployment above, the ArgoCD pod restarted, and now has a new name. So if you try to use the command above, you will be SOL.

Luckily, [there IS a solution](https://github.com/argoproj/argo-cd/blob/master/docs/faq.md#i-forgot-the-admin-password-how-do-i-reset-it), and it’s not rocket science. To change the password, edit the `argocd-secret` secret and update the `admin.password` field with a new bcrypt hash. You can use a site like [the Bcrypt online password generator](https://www.browserling.com/tools/bcrypt) to generate a new hash. Just enter your password, and hit the `Bcrypt!` button to generate your hash, as per below:

![](https://cdn-images-1.medium.com/max/800/1*z-wzJy118YbH4BS6unQaJA.png)

Sample Bcrypt Password Generator output

My example plaintext password of `KubernetesIsCool` generated the hash below:

$2a$10$rCcULJ2BXfPutS25bBcu2OTgC2BU.3oTO67bckf6YqCpUZZxpXGAu

Now, simply patch the ArgoCD secret like this:

kubectl -n argocd patch secret argocd-secret \\  
  -p '{"stringData": {  
    "admin.password": "$2a$10$rCcULJ2BXfPutS25bBcu2OTgC2BU.3oTO67bckf6YqCpUZZxpXGAu",  
    "admin.passwordMtime": "'$(date +%FT%T%Z)'"  
  }}'

Now login using `admin` as the username, along with the plaintext password value you came up with above (in my case, `KubernetesIsCool`). You’ll be prompted when you run the command below:

argocd login $FQDN --grpc-web-root-path /argo-cd

If you ever need to change your admin password again, you can either follow the above instructions, or, if you actually know/remember your password, just use the ArgoCD CLI per below. You’ll be prompted to provide the old and new values:

argocd account update-password

#### **Tekton v0.16.0 and Tekton Triggers v0.8.1 Installation**

Finally, we’re ready to install Tekton! Tekton Triggers are not part of the main Tekton installation. We’ll be installing both.

**1- Install Tekton & Tekton Triggers**

To install Tekton triggers, run the commands below:

kubectl apply -f [https://storage.googleapis.com/tekton-releases/pipeline/previous/v0.16.0/release.yaml](https://storage.googleapis.com/tekton-releases/pipeline/previous/v0.16.0/release.yaml)

kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/previous/v0.8.1/release.yaml

Among other things, the installation will create a \`tekton\` namespace, and Tekton and Tekton Trigger custom resources.

**2- Configure persistent volume for Tekton**

We need this because Tekton needs temporary space to clone git repos and build Dockerfiles:

kubectl create configmap config-artifact-pvc \\  
\--from-literal=size=10Gi \\  
\--from-literal=storageClassName=manual \\  
\-o yaml -n tekton-pipelines \\  
\--dry-run=true | kubectl replace -f -

You can do fancier storage setups if you’d like. I haven’t explored this yet, so I don’t have any nuggets of wisdom. But if you’re interested, be sure to check the Tekton docs on this subject [here](https://github.com/tektoncd/pipeline/blob/master/docs/install.md#configuring-a-persistent-volume).

### Aaaaaand…we’re done! For now…

Ummmm…wut? All this work and no sample Tekton or ArgoCD goodies?

That was a lot to take in, for one blog post. Adding an example to this post will just make your brain explode (mine’s about to). Soooo…when you’re ready for some more Tekton and ArgoCD action, check out the next posts in this series:

*   [How to set up a Kubernetes-native build and release pipeline with Tekton and ArgoCD](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0)
*   [Configuring SSO with Azure Active Directory on ArgoCD](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b)

By [Adriana Villela](https://medium.com/@adri-v) on [October 6, 2020](https://medium.com/p/540aacc983b9).

[Canonical link](https://medium.com/@adri-v/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9)

Exported from [Medium](https://medium.com) on June 3, 2026.