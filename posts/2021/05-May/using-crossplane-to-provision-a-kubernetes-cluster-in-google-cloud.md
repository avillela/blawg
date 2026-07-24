---
title: "Using Crossplane to Provision a Kubernetes Cluster in Google Cloud"
slug: using-crossplane-to-provision-a-kubernetes-cluster-in-google-cloud
description: "A data-driven Kubernetes-native approach to provisioning Cloud infrastructure."
added: "May 17, 2021"
tags:
  - technical
  - google-cloud
  - kubernetes
---


![](https://cdn-images-1.medium.com/max/800/1*3FT_chn_ZiocXmf4bgn-CQ.png)

Photo by Dzero Labs

### The New Kid in Town

Ever since a former co-worker pointed me in the direction of [Crossplane](https://crossplane.io/docs/v1.2/getting-started/install-configure.html), I’ve been both obsessed and intrigued. I just HAD to try it out for myself. In case you’re not familiar with it, [Crossplane](https://crossplane.io/docs/v1.2/getting-started/install-configure.html) is an open-source a Kubernetes-native tool for [provisioning Cloud infrastructure](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3). It was [initially released](https://github.com/crossplane/crossplane/releases/tag/v0.1.0) in December 2018.

You might be wondering…with [Terraform](http://terraform.io), [Pulumi](http://pulumi.com), and even [Ansible](https://medium.com/@dee_zero/6fd1910f1700?source=friends_link&sk=2a6334af25a2e16d0c9cc34ad063c63f) in the mix, why should I consider Crossplane?

Fair question! There are a few things that really intrigued me about Crossplane:

*   **It adheres to the principles of** [**Infrastructure as Data**](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3)**.** It’s Kubernetes-native, so you use [Kubernetes Custom Resources](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1) (YAML — i.e. text) to _declaratively_ provision Cloud infrastructure.
*   **No state file.** Unlike [Terraform](http://terraform.io) and [Pulumi](http://pulumi.com), Crossplane doesn’t use a state file. That said, as a [Kubernetes Operator](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1), it has a [controller](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1) to reconcile desired state against current state, making use of [etcd](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1) to do so. Furthermore, unlike [Terraform](http://terraform.io) and [Pulumi](http://pulumi.com), if someone tries to do something sneaky like update a Cloud resource using the CLI or an admin console, [Crossplane won’t let you get away with it](https://blog.crossplane.io/crossplane-vs-terraform/). _It_ is the source of truth.

Okay…enough of me yapping. Let’s dig in!

### Creating a GKE Cluster Using Crossplane

This tutorial will guide you through the creation of a Kubernetes cluster on Google Cloud using Crossplane.

#### Pre-requisites

This tutorial assumes that:

*   You have an existing [Google Cloud](http://cloud.google.com) project
*   You’ve created a [Service Account](https://cloud.google.com/iam/docs/creating-managing-service-accounts#iam-service-accounts-create-gcloud) in Google Cloud
*   You’ve created a Google Kubernetes Engine (GKE) cluster before
*   You have an existing Kubernetes cluster up and running, since we’ll be installing Crossplane on that cluster.
*   You have the `envsubst` command installed on your machine. You can find instructions for Mac and RedHat/CentOS [here](https://kb.novaordis.com/index.php/Envsubst#Mac). On Ubuntu, use `apt-get install gettext`.

#### 1- Clone the tutorial repo

Let’s begin by cloning the tutorial repo:

git clone git@github.com:d0-labs/crossplane-gke.git

#### 2- Set up your environment variables

For your convenience, I’ve created a file called `env_vars.sh` in the `scripts` folder:

Replace the values in `<...>` with your own as follows:

`**<gcp_project_id>**`: This is the name of our Google Cloud project. If you’re wondering what your project name is, use this command:

gcloud projects list

Sample output:

PROJECT\_ID        NAME              PROJECT\_NUMBER  
aardvark-project  aardvark-project  112233445566

Use the value returned in the `PROJECT_ID` column.

`**<gcp_service_account_name>**`: The name of the service account for your Google Cloud project.

`**<gcp_service_account_keyfile>**`: This is the fully-qualified name of the JSON service account private key stored on your local machine. For example, `/home/myuser/my-sa.json`, if your file is located in the `/home/myuser` folder. Or `my-sa.json` if your file is located in your current working directory.

> **Note:** _This JSON_ private key _is generated upon creation of the Service Account, to be sure to store it somewhere safe (and not in version control). Per_ [_Google’s docs on Service Account Keys_](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys)_, “After you download the key file, you cannot download it again.”_

`**<gke_cluster_name>**`: Name of the Kubernetes cluster on Google cloud where you’ll be installing Crossplane.

`**<gke_cluster_zone>**`: Name of the zone in which your Crossplane Kubernetes cluster resides.

> **Note:** _This tutorial assumes that the k8s cluster you’re using to install Crossplane is running on Google Cloud. Feel free to comment out/remove lines 10 and 11 above as needed._

Save your changes, and head on over to the next step. We’re not executing this file at this point.

#### 2- Configure Google Cloud

> **Note:** _If the Kubernetes cluster on which you’re installing Crossplane is not on Google cloud, you can skip this step._

Let’s make sure that you’re all set up properly in Google Cloud. The `1-gcp_config.sh` script activates your Service Account to authenticate against Google Cloud, set your GCP project to the one where your (soon-to-be) Crossplane Kubernets cluster is located, and connects to that cluster.

Run the script:

./scripts/1-gcp\_config.sh

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*QYGrtbv4g7s-1grcWzUurw.png)

#### 3- Install Crossplane on your Kubernetes cluster

Per [Crossplane’s docs](https://crossplane.io/docs/v1.2/getting-started/install-configure.html), you can either install Crossplane on your own Kubernetes cluster, or you can use their [hosted service](https://crossplane.io/docs/v1.2/getting-started/install-configure.html#start-with-a-hosted-crossplane), [Upbound Cloud](https://cloud.upbound.io).

> **Note:** [_Upbound Cloud_](https://cloud.upbound.io) _is nothing more than a Cloud-hosted Kubernetes cluster that already has Crossplane installed for you. This is definitely a very viable option, as it spares you the need to provision a Kubernetes cluster just to run Crossplane._

> _If you choose to use_ [_Upbound Cloud_](https://cloud.upbound.io) _instead, feel free to skip this step._

For our example, we’ll be installing Crossplane on an existing Kubernetes cluster using the `2-install_crossplane.sh` script below:

This script installs Crossplane v1.2.0 on your Kubernetes cluster using [Helm](https://www.digitalocean.com/community/tutorials/an-introduction-to-helm-the-package-manager-for-kubernetes) (lines 6–9). Let’s go ahead and do that:

./scripts/2-install\_crossplane.sh

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*qe-vk2p_BEsDyfGviq8udA.png)

#### 4- Install & Configure the Crossplane GCP Provider

This script installs and configures the [Crossplane GCP provider](https://crossplane.io/docs/v1.2/concepts/providers.html#gcp-provider). A Provider is code used by the Cloud infrastructure provisioning tool (in this case, Crossplane) that allows it to interact with the target Cloud service’s API (in this case, the GCP API). The Cloud service’s API is what’s used to provision the infrastructure. It’s the same concept in [Terraform](http://terraform.io) and [Pulumi](http://pulumi.com).

Line 6 uses `kubectl` to install the GCP Provider. The `Provider` is a [custom resource](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1). We could also use [Crossplane’s CLI](https://crossplane.io/docs/v1.2/getting-started/install-configure.html#install-configuration-package-2) (it’s a `kubectl` plugin) to do that, but I prefer this approach, since it’s one less thing to install, and it’s declarative, so you can keep it version-controlled.

The GCP `Provider` YAML looks like this:

> **Note:** _You can find this YAML in Crossplane’s own_ [_provider-gcp GitHub repo_](https://github.com/crossplane/provider-gcp/blob/master/examples/provider.yaml)_._

After installing the GCP Provider, we must configure the Crossplane provider, by telling it about our GCP project and how to authenticate, so that Crossplane can actually provision infrastructure there. This happens in Line 16 of the shell script.

Although I could’ve hard-coded my GCP Provider configs in a YAML file, I’ve chosen to do some templating instead, using the Linux `[envsubst](https://www.tutorialspoint.com/unix_commands/envsubst.htm)` command (see prerequisites section on how to install). This command replaces environment variables in a specified file (in our case, `provider-config-gcp.template.yml`), with their values. In our script, we set the environment variables in Line 3 of the shell script, when we call `. ./scripts/env_vars.sh`. The appropriate values are then replaced in `provider-config-gcp.template.yml`, and we end up with a new file called `provider-config-gcp.yml`, with the replaced values from `env_vars.sh`.

The `provider-config-gcp.yml` file will look something like this:

In the file above, we’re creating Kubernetes `Secret` which contains our GCP Service Account key file. The `Secret` is used by a `ProviderConfig` [custom resource](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1) to authenticate to our Google Cloud project, `my-gcp-project`. This gives Crossplane permission to create resources in `my-gcp-project`.

Now that we understand what the shell script is doing, let’s go ahead run it, so that we can install and configure the GCP Provider:

./scripts/3-configure-gcp-provider.sh

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*WcFV7oq8bE27e0KaNHTnFQ.png)

#### 4- Provision a GKE cluster

With Crossplane installed and our GCP Provider configured, we can finally provision our cluster! The script below does this for us:

Looking at `gke-install.yml`, we see that this is where the magic happens. Here, we’re provisioning a GKE cluster and nodepool:

If you’ve provisioned a GKE cluster with [Terraform](http://terraform.io), [Pulumi](http://pulumi.com), or [Ansible](https://www.ansible.com/integrations/cloud), the fields may look familiar. Be sure to check out the [GKECluster API docs](https://doc.crds.dev/github.com/crossplane/provider-gcp/container.gcp.crossplane.io/GKECluster/v1beta1@v0.16.0) and the [NodePool API docs](https://doc.crds.dev/github.com/crossplane/provider-gcp/container.gcp.crossplane.io/NodePool/v1alpha1@v0.16.0) for more info on these fields.

> **Note:** _The_ `_GKECluster_` _and_ `_NodePool_` _custom resources are not namespaced (i.e. don’t belong to a namespace)._

To create the cluster, let’s run the script:

./scripts/4-create\_gke\_cluster.sh

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*BD8t4zVv3ejDwe4-tf_nrQ.png)

We can check the status of our cluster:

kubectl describe gkecluster gke-crossplane-cluster

If you scroll down to the end of your output to the `Events` section, you’ll see something like this, which tells us that our cluster is being provisioned:

![](https://cdn-images-1.medium.com/max/800/1*2vjDRk6V3tOzCeTba7nA3Q.png)

If you take a peek at your [Google Cloud Console](http://console.cloud.google.com), under `Kubernetes Engine > Clusters`, you’ll see something like this:

![](https://cdn-images-1.medium.com/max/800/1*6tUZTlfHZ54ivU5HVyGQKQ.png)

And if you click on the cluster, and then the Nodes tab, you’ll see that your node pool is being provisioned as well:

![](https://cdn-images-1.medium.com/max/800/1*NdAigK7wx8CDpGWLTzSczQ.png)

Don’t panic if you see the error and warning messages like the ones above. The node pool is still being created.

To check on the status of the node pool creation:

kubectl describe nodepool gke-crossplane-np

Sample output:

![](https://cdn-images-1.medium.com/max/800/1*6ke4jddU-ieWtljGDeeUzw.png)

It takes a while to create the node pool, so keep running the above command over and over until you get a message like the one highlighted above.

The overall cluster creation process should take about 5–10 minutes.

#### 5- Connect to the cluster

If all goes well, you should now have a brand-spaking-new Kubernetes cluster. Before we can check our cluster, we need to add it to our `kubeconfig`:

gcloud container clusters get-credentials gke-crossplane-cluster --zone us-central1-a --project <your\_project>

Be sure you replace `<your_project>` with your actual GCP project name.

![](https://cdn-images-1.medium.com/max/800/1*F3tojOuiX-fdWSO54-IODA.png)

Now, let’s do a quick spot check. First, let’s make sure that the cluster is in our `kubeconfig`:

kubectl config get-contexts

We should get an output that looks something like this:

![](https://cdn-images-1.medium.com/max/800/1*Z-MunRWmHI-XN2k0qw1aSQ.png)

Yup. There’s our cluster!

Let’s also run a quick command in our cluster to check the namespaces:

kubectl get nodes

Your output should look something like this:

![](https://cdn-images-1.medium.com/max/800/1*gzPfJUXmvoelMRAouSk_Iw.png)

We provisioned 2 nodes, and we see two nodes.

And let’s peek into our namespaces:

kubectl get ns

![](https://cdn-images-1.medium.com/max/800/1*3ABX0ysKjcnr6YOhlkT6hA.png)

There you go! We’ve got ourselvs a GKE cluster!

#### 6- Delete the cluster and nodepool

To delete the cluster, all you need to do is delete the `GKECluster` resource from Kubernetes.

kubectl delete gkecluster gke-crossplane-cluster

![](https://cdn-images-1.medium.com/max/800/1*hgE9jprxCi0rEUQ4_68ojw.png)

The command prompt won’t return until the cluster has been deleted. You can also check deletion status in the [Google Cloud Console](http://console.cloud.google.com).

For good measure, also delete the `NodePool`:

kubectl delete nodepool gke-cluster-np

### Thoughts on Crossplane for Cloud Provisioning

Crossplane hasn’t been around for very long, and it shows. While there’s a lot of support for [AWS resources](https://doc.crds.dev/github.com/crossplane/provider-aws), support for [Google Cloud](https://doc.crds.dev/github.com/crossplane/provider-gcp) and [Azure](https://doc.crds.dev/github.com/crossplane/provider-azure) is rather lacking in comparison. That said, I’m sure that as it picks up steam, the good folks at Crossplane will be adding more resources from those two Cloud Providers (and others) into the mix.

As far as open source software goes, I found it relatively straightforward to get going using their [getting started guide](https://crossplane.io/docs/v1.2/getting-started/install-configure.html). I did run into a bit of a pickle initially, as I found myself reading docs from both version 1.2.0 and 0.7, not realizing it at the time, and wondering why things weren’t working as they should. That was my my fault…but since it happened to me, it could happen to you, so just make sure you’re looking at the right version of the Crossplane docs when you’re trying stuff on your own.

My only complaint with the quickstart is that I really don’t understand why Crossplane suggests installing their [CLI](https://crossplane.io/docs/v1.2/getting-started/install-configure.html#install-crossplane-cli) and then [installing your desired Provider package](https://crossplane.io/docs/v1.2/getting-started/install-configure.html#install-configuration-package-2), when you could easily do it declaratively by applying the Provider YAML ([like for GCP](https://github.com/crossplane/provider-gcp/blob/master/examples/provider.yaml)) using `kubectl`.

I like the fact that Crossplane has the [Upbound Cloud managed Crossplane service](https://cloud.upbound.io/register), so you don’t have to figure out how to set up and configure your own k8s running Crossplane just to be able to provision Cloud infrastructure.

It’s a nice option to have, though I didn’t find it too bad installing it on an existing k8s cluster.

> **Note:** _My example had you installing Crossplane on an existing GKE cluster to provision another GKE cluster (very meta). I’m guessing that this is not a very common use case, and that the makers of Crossplane expect you to either use the_ [_Upbound Cloud managed Crossplane service_](https://cloud.upbound.io/register) _or to install Crossplane on a local k8s cluster like_ [_KinD_](https://kind.sigs.k8s.io/docs/user/quick-start/) _or_ [_MiniKube_](https://minikube.sigs.k8s.io/docs/start/)_._

### Conclusion

Crossplane is a Kubernetes-native tool for provisioning Cloud infrastructure.

Unlike [Terraform](http://terraform.io) and [Pulumi](http://pulumi.com), which keep state files, and let you alter Cloud infrastructure outside the tool (with possibly devastating consequences), Crossplane doesn’t let you get away with that.

Like [Ansible](https://www.ansible.com/integrations/cloud), it adheres to the principles of [Infrastructure as Data](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3), using YAML to declaratively provision Cloud resources. This definitely puts it in my good books. ❤️

Right now, I’m still leaning towards [Ansible for provisioning Cloud resources](https://medium.com/@dee_zero/6fd1910f1700?source=friends_link&sk=2a6334af25a2e16d0c9cc34ad063c63f) in Google Cloud or Azure at the moment, since the number of resources supported by Crossplane for these providers is a fair bit lower compared to AWS. That said, don’t count Crossplane out of the mix. It’s definitely worth keeping an eye on it to see what the future brings!

And now, I will leave you with a picture of our sleepy rat, Susie, in my husband’s arms.

![](https://cdn-images-1.medium.com/max/800/1*es9h0ma9hH0LGkkv8fgfVA.png)

Photo by Dzero Labs

Peace, love, and code.

### Further Reading

Be sure to check out other posts in my Cloud infrastructure series!

[**Shifting from Infrastructure as Code to Infrastructure as Data**  
_A brief intro to Cloud infrastructure, and a dive into why you should take a data-driven approach to provision cloud…_medium.com](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3 "https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3")[](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3)

[**Using Ansible’s GCP Library to Provision a Kubernetes Cluster in Google Cloud**  
_Step aside, Terraform! Learn how to use Ansible’s Google Cloud modules to provision a GKE cluster in an easy and…_medium.com](https://medium.com/dzerolabs/using-ansibles-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud-6fd1910f1700 "https://medium.com/dzerolabs/using-ansibles-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud-6fd1910f1700")[](https://medium.com/dzerolabs/using-ansibles-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud-6fd1910f1700)

### References

*   [Crossplane Getting Started Docs (for v1.2.0)](https://crossplane.io/docs/v1.2/getting-started/install-configure.html)
*   [Crossplane GKECluster API docs for GCP](https://doc.crds.dev/github.com/crossplane/provider-gcp/container.gcp.crossplane.io/GKECluster/v1beta1@v0.16.0)
*   [Crossplane NodePool API docs for GCP](https://doc.crds.dev/github.com/crossplane/provider-gcp/container.gcp.crossplane.io/NodePool/v1alpha1@v0.16.0)
*   [Crossplane provider-gcp on Github (contains examples)](https://github.com/crossplane/provider-gcp/blob/master/examples/gke/gke.yaml)

By [Adriana Villela](https://medium.com/@adri-v) on [May 17, 2021](https://medium.com/p/cf5374d765ee).

[Canonical link](https://medium.com/@adri-v/using-crossplane-to-provision-a-kubernetes-cluster-in-google-cloud-cf5374d765ee)

Exported from [Medium](https://medium.com) on June 3, 2026.