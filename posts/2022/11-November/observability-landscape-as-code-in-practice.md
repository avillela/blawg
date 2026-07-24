---
title: "Observability-Landscape-as-Code in Practice"
slug: observability-landscape-as-code-in-practice
description: "Learn how to put Observability-Landscape-as-Code in this hands-on tutorial."
added: "Nov 16, 2022"
tags:
  - technical
  - observability
  - thought-leadership
  - opentelemetry
---


![Laser lights](https://cdn-images-1.medium.com/max/800/1*AfqbFvheCe4bUFNlpZUjxw.png)

Laser lights. Taken at [Casa Loma’s Legends of Horror](https://legendsofhorror.ca). Photo by [Adri Villela](https://adri-v.medium.com).

**_with_** [**_Ana Margarita Medina_**](https://lightstep.com/blog/authors/ana-margarita-medina)

If you follow [Adriana’s writings on Observability Adriana’s writings on Observability](https://lightstep.com/blog/authors/adriana-villela) , you may recall a post from back in June introducing the concept of [Observability-Landscape-as-Code (OLaC) Observability-Landscape-as-Code (OLaC)](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code) .

An Observability Landscape is made up of the following pieces:

*   Application instrumentation
*   Collecting and storing application telemetry
*   An Observability back-end
*   A set of meaningful SLOs
*   Alerts for on-call Engineers

![](https://cdn-images-1.medium.com/max/800/0*royFtT-JdO3eva7E)

Keeping that in mind, OLaC is simply the codification of your Observability Landscape, thereby ensuring consistency, maintainability, and reproducibility.

That’s all well and good, but how about seeing this thing in action? Well, my friend, you’ve come to the right place, because today, you get to see a tutorial featuring a number of OLaC practices in action!

1.  [**Collecting & storing application telemetry** **Collecting & storing application telemetry**](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code#use-the-otel-collector--codify-its-deployment)
2.  **How:** [OpenTelemetry Collector OpenTelemetry Collector](https://docs.lightstep.com/otel/quick-start-collector) is deployed via code (Helm chart), alongside the various services that make up the [OpenTelemetry Demo App OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) .
3.  [**Codifying your Observability back-end configuration** **Codifying your Observability back-end configuration**](https://lightstep.com/blog/observability-mythbusters-observability-landscape-as-code#codify-observability-back-end-configuration)
4.  **How:** Using the [Lightstep Terraform Provider Lightstep Terraform Provider](https://registry.terraform.io/providers/lightstep/lightstep/latest/docs) to create dashboards in [Lightstep](https://app.lightstep.com/).

We wanted to showcase OLaC principles with a real-life example using modern cloud-native tooling…Which means using [Kubernetes](https://kubernetes.io) for our cloud infrastructure with [Google Cloud Google Cloud’s](https://cloud.google.com/gcp) Kubernetes offering. Now, since we are good practitioners of OLaC and SRE, we won’t just be setting things up through the clickity click of a UI. No sirreee. Instead, we’ll be #automatingAllTheThings using [HashiCorp](https://hashicorp.com/) [Terraform](https://terraform.io/). Terraform allows us to do infrastructure-as-code (IaC), and gives us tons of added benefits like better control over our resources and standardization. These are key principles in OLaC and IaC.

We will be deploying [OpenTelemetry Demo App OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) to our cluster. The Demo App has been instrumented using [OpenTelemetry OpenTelemetry](https://opentelemetry.io) , and will send and through the [OpenTelemetry Collector OpenTelemetry Collector](https://docs.lightstep.com/otel/quick-start-collector) to Lightstep.

Are you ready??? Let’s get started!

### Tutorial

#### Pre-Requisites

Before you begin, you will need the following:

*   A [Lightstep account](https://app.lightstep.com/signup/developer?signup_source=docs) so you can see application Traces, and Metrics dashboards
*   A [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens#create-an-access-token) for the [Lightstep](https://app.lightstep.com/) project you would like to use
*   A [Lightstep API key](https://docs.lightstep.com/docs/create-and-manage-api-keys) for creating dashboards in [Lightstep](https://app.lightstep.com/).
*   [Terraform CLI](https://www.terraform.io/downloads) to run the Terraform scripts
*   A [Google Cloud](https://cloud.google.com/gcp) account, so you can create a Kubernetes cluster ([GKE](https://cloud.google.com/kubernetes-engine))
*   [gcloud CLI](https://cloud.google.com/sdk/docs/install-sdk) to interact with Google Cloud
*   [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux) to interact with Kubernetes

### Steps

**1- Clone the example repo**

Let’s start by cloning the example repo:

git clone https://github.com/lightstep/unified-observability-k8s-kubecon.git

**2- Initialize Sub-Modules**

This project makes use of a few \[Git submodules\]([https://git-scm.com/book/en/v2/Git-Tools-Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)), so in order to ensure that things work nicely, you’ll need to pull them in:

cd unified-observability-k8s-kubecon  
git submodule init && git submodule update

**3- Google Cloud Login**

Before we can create a GKE cluster you must authenticate your Google Cloud account:

gcloud auth application-default login --no-launch-browser

You will be presented with a link which you need to open up in a browser, to authenticate your Google ID. Once you are authenticated, the browser will display an authorization token for you to paste in the command line, as follows:

![Results of gcloud auth command](https://cdn-images-1.medium.com/max/800/1*AK7zbAKEauOkygf-wP9hTg.png)

**4- Create terraform.tfvars**

Now that you’re authenticated, let’s get ready to Terraform! Before you can do that, we need to create a `terraform.tfvars` file.

Lucky for you, we have a handy-dandy template that you can use to get started:

cd k8s-cluster-with-otel-demo/terraform  
cp terraform.tfvars.template terraform.tfvars

Next populate the following values in the file:

*   `<your_gcp_project>`: The name of your Google Cloud project. Don't know your project name? No problem! Just run `gcloud config get-value project` to find out what it is!
*   `<your_gke_cluster_name>`: The name you wish to give your GKE cluster. Make sure it follows Kubernetes cluster naming conventions (i.e. no underscores `_` or special characters).
*   `<your_lightstep_access_token>`: Your [Lightstep Access Token Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens#create-an-access-token) . This is used to send Traces to your [Lightstep Project Lightstep Project](https://docs.lightstep.com/docs/create-projects-for-your-environments) .
*   `<your_lightstep_api_key>`: Your [Lightstep API key Lightstep API key](https://docs.lightstep.com/docs/create-and-manage-api-keys) . This is used to create our Metrics dashboards.
*   `<your_lightstep_org_name>`: Your Lightstep organization name. Not sure what your organization is called? No problem! Log into Lightstep,and click on the person icon on the bottom left of your screen. This will pop up a little menu. The organization name can be found under the "Account Management" heading, like this:

![Lightstep UI showing where to get the Lightstep Org Name](https://cdn-images-1.medium.com/max/800/1*MM3PVK1VlUFRufA7s0bhNg.png)

Notice that my organization is called “LightStep”. Yours will be different. Note also that Organization names are case-sensitive.

> **Note:** `_terraform.tfvars_` _is in_ `_.gitignore_` _and won't be put into version control._

**5- Run Terraform**

This step will initialize Terraform (install providers locally), and then will apply the Terraform plan.

It will:

*   Create a Kubernetes cluster
*   Deploy the [OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) using the [OpenTelemetry Demo Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-demo)
*   Create dashboards in Lightstep

Before running the commands below, make sure that you’re already in the `k8s-cluster-with-otel-demo/terraform` folder.

Please note that this step may take up to 30 minutes, depending on GKE’s disposition. Be patient. 😄

**6- Update your kubeconfig**

Now that the cluster is created, you can add it to your `kubeconfig` file! By default, the file is saved at `$HOME/.kube/config`.

Before you can update your `kubeconfig`, you first need to make sure that you have the [gke-gcloud-auth-plugin gke-gcloud-auth-plugin](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl#install_plugin) installed:

gcloud components install gke-gcloud-auth-plugin  
gke-gcloud-auth-plugin --version  
echo "export USE\_GKE\_GCLOUD\_AUTH\_PLUGIN=True" >> ~/.bashrc

Now we can add the cluster to `kubeconfig`:

gcloud container clusters get-credentials $(terraform output -raw kubernetes\_cluster\_name) --region $(terraform output -raw region)

This gets the `kubernetes_cluster_name` and `region` output values from Terraform (that's the `terraform output -raw` stuff), and plunks those into your `gcloud container clusters get-credentials` command.

Or, if you closed the terminal in which you were running Terraform and lost your output values, you can also do this:

gcloud container clusters get-credentials <cluster\_name> --region <region>

Where `<cluster_name>` and `<region>` correspond to the values you entered in Step 3 in your `terraform.tfvars` file.

**7- Check out the OTel Demo app**

If you run `kubectl get ns`, you'll notice that there's now a new namespace called `otel-demo`:

This is where we deployed the OTel Demo app. Let’s look into this namespace to see what we’ve created. First, let’s look at the pods with `kubectl get pods -ns otel-demo`:

![](https://cdn-images-1.medium.com/max/800/1*zEYADaK-IlxeTtKsc1MbHQ.png)

Notice how we deployed a bunch of different services that make up the OTel Demo App, including `adservice`, `cartservice`, `recommendationservice`, etc.

We also deployed an [OTel Collector OTel Collector](https://docs.lightstep.com/otel/quick-start-collector) . Its configuration YAML is stored in a configmap. We can take a peek by running `kubectl describe configmap otel-demo-app-otelcol -n otel-demo`:

![](https://cdn-images-1.medium.com/max/800/1*VmsSyCAVkFKOOhHnVkM9zw.png)

You can see that we also reference a variable called `${LS_TOKEN}` which represents your [Lightstep Access Token Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens#create-an-access-token) , which you set in `terraform.tfvars`. But where is it? The secret is mounted to the OTel Collector container instance as a secret called `otel-collector-secret`. Let's take a look at the secret by running `kubectl describe secret otel-collector-secret -n otel-demo`:

![Results of running “kubectl describe secret otel-collector-secret -n otel-demo”](https://cdn-images-1.medium.com/max/800/1*UAIfDhvYB9Sfxu5tv4y1gQ.png)

All this magic happens in [otel-demo-app-values-ls.yaml otel-demo-app-values-ls.yaml](https://github.com/lightstep/unified-observability-k8s-kubecon/blob/main/gke-otel-demo/terraform/configs/otel-demo-app-values.yaml) . This is a version of [values.yaml values.yaml](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo/values.yaml) from the [OTel Demo App Helm Chart OTel Demo App Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-demo) with updates to the Collector configs so that we can configure the OTel Collector to send Traces to Lightstep.

**8- Run the OTel Demo App**

Okay…enough Kubernetes talk. Let’s look at the [OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo)! You can access the Demo App by Kubernetes port-forward:

kubectl port-forward -n otel-demo svc/otel-demo-app-frontend 8080:8080

To access the front-end, go to [http://localhost:8080](http://localhost:8080/):

![](https://cdn-images-1.medium.com/max/800/1*Z23Mk3RJZGfZKtfA1TSTMg.png)

Go ahead and explore the amazing selection of telescopes and accessories, and buy a few. 😉🔭

**9- See Traces in Lightstep**

We can now pop over to Lightstep and check out some . Let’s do this by creating a [Notebook](https://docs.lightstep.com/docs/use-notebooks).

First, click on the little page icon on the left nav bar (highlighted in blue, below). That will bring up this page:

![](https://cdn-images-1.medium.com/max/800/1*C9TId5CGkig6dlaIH0jF-Q.png)

Next, we build our query for our Traces. Let’s look at the traces from the `recommendationservice`. We'll do by entering `recommendationservice` in the field next to "All telemetry". Because this is a service, select the second value from the drop-down, which says, "Use 'recommendationservice' as service value", as per below:

![Lightstep Notebook — selecting the recommendationservice](https://cdn-images-1.medium.com/max/800/1*IP-8gYSXxtQYzqO3T8pThA.png)

After you select that value, you’ll see a chart like this:

![](https://cdn-images-1.medium.com/max/800/1*qcAs6dlRd3UmHGF67f_XSA.png)

The little green dots represent trace exemplars from that Service. Hover over one of them to see for yourself!

![](https://cdn-images-1.medium.com/max/800/1*sM8xpOopoLwLfwuCn59oPQ.png)

If you click on one of these dots, you’ll get taken to the Trace view. Before you click, be sure to save your Notebook first (don’t worry, you’ll get a reminder before you navigate away from the page)!

Here’s the Trace view we see when we click on the `get_product_list` dot (Operation) above:

![](https://cdn-images-1.medium.com/max/800/1*w49AKaVmMgQRDpc2hCQofA.png)

Pretty cool, amirite?

**10- See Kubernetes Metrics in Lightstep**

Remember when you ran `terraform apply`? Well, not only did it create a Kubernetes cluster, deploy the OTel Demo App (and OTel Collector), it also created some handy-dandy Metrics dashboards for us.

You can check out the newly-created Metrics dashboards by going to the Dashboards icon (the icon with 4 little squares) on the left navigation bar:

![](https://cdn-images-1.medium.com/max/800/1*EBiLrr6z0nMfdfq7hRdpNw.png)

First, let’s check out the **Kubernetes / Compute Resources / Cluster** dashboard. This dashboard lets you see the state of your cluster.

![](https://cdn-images-1.medium.com/max/800/1*TWGcug_fVEUMvkOF6oeH0w.png)

We then have various other Metrics called **Kubernetes Workload Metrics**. These are the dashboards with names that start with “ **Kubernetes / Compute Resources / Workload**”. These dashboards are specific to the services you are running. They take into account the Kubernetes Workloads in your various namespaces, using [kube-state-metrics kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) . For a closer look, check out [otel\_demo\_app\_k8s\_dashboard.tf otel\_demo\_app\_k8s\_dashboard.tf](https://github.com/lightstep/unified-observability-k8s-kubecon/blob/main/gke-otel-demo/terraform/modules/lightstep/otel_demo_app_k8s_dashboard.tf) .

We used [Lightstep’s Prometheus Kubernetes OpenTelemetry Collector Lightstep’s Prometheus Kubernetes OpenTelemetry Collector](https://github.com/lightstep/prometheus-k8s-opentelemetry-collector) to get these Metrics into Lightstep. This Helm chart is inspired by [kube-prometheus-stack kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) , but with one crucial difference — no Prometheus! We’re able to use recent enhancements to the [OpenTelemetry Operator for Kubernetes OpenTelemetry Operator for Kubernetes](https://github.com/open-telemetry/opentelemetry-operator) such as support for Service Monitors in order to scrape Prometheus metrics from pods, system components, and more.

> **_Note:_** _You can learn more about the_ [_Prometheus Kubernetes OpenTelemetry Collector Prometheus Kubernetes OpenTelemetry Collector_](https://github.com/lightstep/prometheus-k8s-opentelemetry-collector) _by checking out the docs ._

For example, the **Kubernetes / Compute Resources / Workload / otel-demo-app-cartservice** dashboard displays metrics for the OTel Demo App’s cartservice. In it we can see how our containers and pods are doing based on Metrics such as those for CPU and Memory.

![Screen capture of dashboard for otel-demo-app-cartservice, created by the lightstep/lightstep Terraform provider.](https://cdn-images-1.medium.com/max/800/1*0BXSJRl5sLpFx_HE5IhHDw.png)

### 11- See Application Metrics in Lightstep

Ah…but we’re not done with Metrics just yet! If you go back to the dashboard view and scroll to the very end of the list, you’ll see the **OTel Demo App — Application Metrics** dashboard.

![Screen capture of the list of dashboards created by the lightstep/lightstep Terraform provider](https://cdn-images-1.medium.com/max/800/1*EBiLrr6z0nMfdfq7hRdpNw.png)

Let’s click on it to take a quick little peek!

![Screen capture of OTel Demo App dashboards created by the lightstep/lightstep Terraform provider](https://cdn-images-1.medium.com/max/800/1*ddigPbjlXYY4qWiW36gV1Q.png)

The latest version of the OTel Demo App emits both auto-instrumented and manually-instrumented Metrics. In today’s demo, we wanted to highlight some of the from the `recommendationservice`.

First, we have the auto-instrumented Python Metrics, which are captured from the Python runtime:

*   `runtime.cpython.cpu_time`: Track the amount of time being spent in different states of the CPU. This includes user (time running application code) and system (time spent in the operating system). This metric is represented as total elapsed time in seconds.
*   `runtime.cpython.memory`: Memory utilization
*   `runtime.cpython.gc_count`: Number of times the garbage collector has been called.

We also have one manually-instrumented Metric:

For more on the `recommendationservice` , check out . For more on captured by other services, check out the [OTel Demo App service docs OTel Demo App service docs](https://github.com/open-telemetry/opentelemetry-demo/tree/main/docs/services) .

**12- Teardown**

terraform destroy -auto-approve

If you’re no longer using this environment, don’t forget to tear down its resources, to avoid running up a huge cloud bill. You’re welcome. 😉

This step can take up to 30 minutes, so please be patient! Also, you’ll probably notice that on first run, you’ll see the following error:

Error: uninstall: Release not loaded: otel-operator: release not found

> **Don’t panic!** _If you run_ `_terraform destroy -auto-approve_` _again, it will finish nukifying all the things._

### Final Thoughts

Today we got to see some aspects of Observability-Landscape-as-Code (OLaC) in practice! Specifically, we looked at the following elements:

*   Application instrumentation with [OpenTelemetry](https://opentelemetry.io/)
*   Collecting and storing application telemetry via the OTel Collector
*   Configuring an Observability back-end (i.e. [Lightstep](https://app.lightstep.com/)) through code

We showcased this by using Terraform to:

*   **Deploy the OpenTelemetry Demo App to Kubernetes.** The Otel Demo App showcases the [Traces](https://opentelemetry.io/docs/concepts/observability-primer/#understanding-distributed-tracing) and [Metrics](https://opentelemetry.io/docs/concepts/observability-primer/#reliability--metrics) instrumentation of different services in different languages using OpenTelemetry.
*   **Deploy an OpenTelemetry Collector to Kubernetes (part of the Demo App deployment).** The Collector is used to send application Traces and Metrics to Lightstep.
*   **Configure Lightstep dashboards.** The Lightstep Terraform provider allowed us to codify this.

Codifying our Observability Landscape means that we can tear down and recreate our application, Collector, and dashboards as needed, knowing that we’ll have consistency across the board every single time. Plus, it means that we can version control it, so that it’s not lost in the ether somewhere, or sitting in a secret server under Bob’s desk. Bonus!

Hopefully this gives you a nice little flavour of the power of OLaC, and will inspire you to go out there and start OLaC-ing too! (I just made up a new verb. You’re welcome.)

Whew! That was a lot to think about and take in! Give yourself a pat on the back, because we’ve covered a LOT! Now, please enjoy this picture of Adriana’s rat, Bunny, enjoying an almond!

![](https://cdn-images-1.medium.com/max/800/1*PfJ05UalvKMYoPfxWgmYAQ.jpeg)

Bunny the rat enjoying an almond. Sadly, we lost bunny shortly after this photo was taken. 😭Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. 🦄 🌈 💫

The [OpenTelemetry Demo App OpenTelemetry Demo App](https://github.com/open-telemetry/opentelemetry-demo) is always looking for feedback and contributors. Please consider joining the [OTel Community OTel Community](https://github.com/open-telemetry/community/blob/main/community-membership.md#member) to help make OpenTelemetry AWESOME!

Got questions about Observability-Landscape-as-Code? Talk to us! Feel free to connect with us through [e-mail](http://devrel@lightstep.com), or:

*   Connect with Adriana on [Twitter](https://twitter.com/adrianamvillela), [Mastodon](https://hachyderm.io/@adrianamvillela), or [LinkedIn](https://www.linkedin.com/in/adrianavillela)
*   Connect with Ana on [Twitter](https://twitter.com/Ana_M_Medina), [Mastodon](https://hachyderm.io/web/@anamedina#), or [LinkedIn](https://www.linkedin.com/in/anammedina).

Hope to hear from y’all!

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/observability-as-code-with-kubernetes-and-lightstep)_._

By [Adriana Villela](https://medium.com/@adri-v) on [November 16, 2022](https://medium.com/p/732743e201b2).

[Canonical link](https://medium.com/@adri-v/observability-landscape-as-code-in-practice-732743e201b2)

Exported from [Medium](https://medium.com) on June 3, 2026.