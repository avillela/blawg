---
title: Accessing Azure Key Vault Secrets in Azure Kubernetes
slug: accessing-azure-key-vault-secrets-in-azure-kubernetes
description: How hours of pain taught me how to NOT do Infrastructure-as-Code.
tags:
  - technical
  - azure
added: 2020-11-28T00:00:00.000Z
---

# Accessing Azure Key Vault Secrets in Azure Kubernetes

![](https://cdn-images-1.medium.com/max/800/1*GRmpH8i3ihq9D-kIHxhpHA.png)

Spotted on a Toronto sidewalk. Photo credit: Dzero Labs

### One bad day away from Kubernetes despair

Most days, I really enjoy working with Kubernetes. I really do. But far too often, I find myself in a situation whereby I am thoroughly lost in a deep black hole. The black hole of, “Hey, I want to try this Kubernetes-native thingamaroo and the vendor’s docs make it look soooo easy to follow.” And then it turns out that nothing f\*cking works, and you’re stuck troubleshooting for days, obsessing over the fact that this seemingly simple thing refuses to work. WORK, GODDAMMIT!! Then your mind is flooded with thoughts of, “This is it. THIS is the one problem that I will never ever ever be able to solve.” And suddenly, the heavens open up, and the angels shine a guiding light on the solution. By a stroke of luck, I happen to glean over the obscure log message or GitHub issue post that gives some glimmer of a hint as to why the f\*ck this stupid example from the vendor’s GitHub repo isn’t working. At that point, all of the colour returns to my face, and my heart goes from palpitating, to beating normally.

Has that ever happened to you? Because it has happened to me countless times, and it’s especially true in the wonderful world of Kubernetes.

### The Trigger: Kubernetes Secrets

Now, you may be wondering what on earth brought on this mad rant. Fair question. It all started when I decided to explore better alternatives for managing secrets in Kubernetes in Azure this week. Kubernetes does have a `Secrets` resource for storing passwords, SSH keys, certificates, and all that sensitive stuff; however, as [Gaurav Agarwal](https://medium.com/u/bb53f92ef313) [points out](https://medium.com/better-programming/encrypting-kubernetes-secrets-with-sealed-secrets-fe363149a211), “the problem with Kubernetes secrets is they store sensitive information as a base64 string. Anyone can decode the base64 string to get the original token from the `Secret` manifest.” In an Enterprise environment, that won’t do.

I nixed the idea of HashCorp Vault, because various articles had pointed out how much of a pain in the ass it is to set up. Plus, I was working on AKS, so I wanted to see if I could find something that could leverage secrets stored in [Azure Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/general/basic-concepts).

I was originally going to dive deep into [Azure Key Vault to Kubernetes](https://mrdevops.io/introducing-azure-key-vault-to-kubernetes-931f82364354), but then a serendipitious Google search led me to [Azure Key Vault Provider for Secrets Store CSI Driver](https://github.com/Azure/secrets-store-csi-driver-provider-azure), by Microsoft itself. Hard to pass up.

[Azure Key Vault Provider for Secrets Store CSI Driver](https://github.com/Azure/secrets-store-csi-driver-provider-azure) maps a Kubernetes resource called `SecretProviderClass` to an Azure Key Vault, and lets you select which of that Key Vault’s secrets, keys, and/or certificates you’d like to expose. You can then mount a volume on a `Pod` to access those secrets by referencing the `SecretProviderClass`. To make sure that you don’t have some nefarious character accessing your Key Vault, you use an Azure Managed Identity, and assign it permissions to access your Key Vault on Kubernetes’ behalf. To use the Azure Managed Identity to authenticate your Key Vault, you also need [AAD Pod Identity](https://github.com/Azure/aad-pod-identity) installed on your cluster.

You basically end up with a setup like this:

![](https://cdn-images-1.medium.com/max/1200/1*aJ05NV9N4yCR_f2IAePHAg.png)

Seems relatively simple, right? Well, getting this to work properly took me two days of non-stop work and poring over GitHub repos, blog posts, GitHub issues, StackOverflow posts, YouTube videos, and whatever else I could get my hands on until…I finally cracked the nut.

The thing is, on the most part, the instructions and videos were actually pretty decent. And yet, I could not get this blasted thing to work. And I finally landed on the problem!

Actually, there were two problems. First, the Helm charts used to install the Azure Pod Identity CRDs didn’t match up with the non-helm deployment YAMLs. I went the pure YAML route initially, only to end up with some broken shit in my cluster. Once I solved that problem, I kept getting stuck on an error whereby the logs were claiming that a value in one of my YAML manifests didn’t exist. It was then that I realized that the version is of the Azure Pod Identity YAML manifests that I was using had the wrong case for a bunch of the fields. It took me two hours to chase down the problem.

Wut. The. F\*ck.

#### **Skeletons in the Closet**

That was when I realized the brittle nature of this Kubernetes stuff. Actually, it’s not just Kubernetes, but Infrastructure-as-Code (IaC) in general. The problem is, I might have solved a problem for setting up thing-a-ma-whatchit-x using a set of APIs and CLI commands one day, but then a day later, some breaking change may be harmlessly introduced without much fanfare, causing my beautiful house of cards setup to topple. That actually happened to me this past August, and it took me a good couple of hours to realize that a set of Kubernetes CRDs that I’d installed in my cluster on Monday stopped working on Tuesday, when I decided to nuke and recreate my cluster before a demo. It turned out that I was referencing the latest package (rather than a versioned package) for my installs.

Which leads me to my point. IaC is great and all, but it all goes to hell because it’s not treated more respect.

To make IaC less brittle, it should follow these principles:

#### **1- Repeatable**

I should not be scared of creating and destroying my infrastructure many times over, because I know that I’ll get the same results each time

#### **2- Ephemeral**

It should be all or nothing. None of this maintaining state crap, where you’re accumulating layers upon layers of changes. If you’re making changes to your infrastructure, you nuke the old infra and re-create it with the new stuff. Don’t add on to the old infra, because you have no idea what Franken-infra you’re creating.

#### **3- Simple**

The minute you start getting overly-elaborate with your infrastructure, where you find yourself trying to jam a square peg in a round hole, STOP. For example, if you find yourself manipulating Terraform state files, it’s time to back up, buddy, and start from scratch.

#### **4- API-Based**

Your infrastructure should be designed and documented like an API. This means proper versioning and error-checking, so you don’t get weird-ass error messages from the ether. For example, when I encountered that case-sensitivity issue with my YAML, that should’ve been caught when I tried to apply it to the cluster, by some sort of validation. Not AFTER the fact. Similarly, I should, by default, be forced to specify a particular version of a CRD that I’m installing to my cluster, rather than have the Helm charts default to the latest.

A little bit of standardization goes a long way. Much better than documenting steps that can soon become outdated.

### I’ll still give you a solution: Azure Key Vault Access via Azure Key Vault Provider for Secret Store with Azure Pod Identity

For what it’s worth, I still want to post a solution here, in case it helps someone down the road, even if Microsoft ends up introducing breaking changes to subsequent updates to [Azure Key Vault Provider](https://github.com/Azure/secrets-store-csi-driver-provider-azure) and [AAD Pod Identity](https://github.com/Azure/aad-pod-identity), which will inevitably happen.

> **Assumptions:***1. You have an Kubernetes cluster running in Azure (AKS)2. You’ve installed Helm 3 on your local machine3. You’ve created your AKS cluster using a Service Principal*

You can also see the source code in the accompanying GitHub repo [here](https://github.com/d0-labs/aks-azure-keyvault).

> **NOTE:** *If you run into a pickle when installing AAD Pod Identity and/or Secrets Store CSI Driver for Azure, check out some alternate ways to install the CRDs* *[here](https://gist.github.com/avillela/3ff18b3bde4347ced4a0917bb70c90dd).*

#### 1- Set up Env Vars & Login to Azure

Fill out the values in the file below, and save it locally.

Don’t run this on its own. It will be used in the next few steps.

If you’re wondering what your Azure Subscription ID is, you can get it like this:

az login -u <username> -p <password>\
export AZ\_SUBSCRIPTION\_ID=$(az account show --query id -o tsv)

Now that you’ve got all the info to fill out your environment vars above, let’s login to Azure and make sure your Kubernetes cluster is added to your `kubectl` file:

. ./0-env\_vars.sh

az login -u $AZ\_USERNAME -p $AZ\_PASSWORD

az aks get-credentials --resource-group=$RESOURCE\_GROUP --name=$AKS\_CLUSTER\_NAME --overwrite-existing

#### 2- Install Secrets Store CSI Driver for Azure v0.0.10 in Kubernetes

Use Helm 3 to install version 0.0.10 of the Secrets Store CSI Driver:

helm repo add --insecure-skip-tls-verify csi-secrets-store-provider-azure [https://raw.githubusercontent.com/Azure/secrets-store-csi-driver-provider-azure/master/charts](https://raw.githubusercontent.com/Azure/secrets-store-csi-driver-provider-azure/master/charts)

helm repo update

kubectl create ns csi-driver

\# Helm chart v0.0.6 installs Secrets Store CSI Driver for Azure v0.0.10\
helm install csi-secrets-store-provider-azure csi-secrets-store-provider-azure/csi-secrets-store-provider-azure --version 0.0.6 -n csi-driver

#### 3- Install Azure Pod Identity v1.7.1 in Kubernetes

This allows us to use an Azure Managed Identity to authenticate from k8s to the Azure Key Vault.

Use Helm 3 to install version 1.7.1 of the AAD Pod Identity:

helm repo add --insecure-skip-tls-verify aad-pod-identity [https://raw.githubusercontent.com/Azure/aad-pod-identity/master/charts](https://raw.githubusercontent.com/Azure/aad-pod-identity/master/charts)

helm repo update

kubectl create ns aad-pod-id

\# Helm chart v3.0.0 installs AAD Pod Identity v1.7.1\
helm install aad-pod-identity aad-pod-identity/aad-pod-identity --version 3.0.0 -n aad-pod-id

#### 4- Create a Key Vault in Azure

The script below will do the following:

* Create a Resource Group in Azure
* Create a Key Vault in the Resource Group
* Grant the given user ID permissions on the keys and secrets in the Key Vault
* Create 2 secrets in the Key Vault

To run the script:

./1-keyvault\_creation.sh

#### 5- Create the Managed Identity & Set Permissions

Create an Azure Managed Identity. We need to give it the following permissions:

* Permission to access our Key Vault
* Permission to access the secrets and keys in our Key Vault

Since the cluster was created with a Service Principal, we must also grant the Service Principal `Managed Identity Operator` and `Virtual Machine Contributor` roles.

To run the script:

./2-aks\_setup.sh

#### 6- Configure the AzureIdentity & AzureIdentity Binding Resources

The `AzureIdentity` resource was created as part of the [Azure Pod Identity](https://github.com/Azure/aad-pod-identity) installation in Step 3. It references the Azure Managed Identity created via `az identity create` in Step 5.

The `AzureIdentityBinding` resource was created as part of the [Azure Pod Identity](https://github.com/Azure/aad-pod-identity) installation in Step 3. It references the Azure Managed Identity created via `az identity create` in Step 5.

It serves as a glue to bind the `AzureIdentity` to a `Pod`. This is done via the `selector` field. This field is refernced as a label in a `Pod`’s definition.

You’ll need to configure your own `AzureIdentity` and `AzureIdentityBinding` resources as follows:

**AzureIdentity**

The `resourceID` field references the `id` field of the Managed Identity created above. Get the `id` by running the command below:

az identity show --resource-group $RESOURCE\_GROUP --name $AZ\_ID\_NAME --query id -o tsv

The `clientID` field references the `clientId` field of the Managed Identity created above. Get the `clientId` by running the command below:

az identity show --resource-group $RESOURCE\_GROUP --name $AZ\_ID\_NAME --query clientId -o tsv

**AzureIdentityBinding**

The `azureIdentity` field refers to the name given to the `AzureIdentity` resource.

The `selector` field can be whatever you want; however, the same value must be referenced in your `Pod` definition as a label. More on that later.

We won’t be applying this manifest to Kubernetes just yet.

#### 7- Configure the SecretProviderClass

The `SecretProviderClass` resource was created as part of the [Secrets Store CSI Driver](https://github.com/Azure/secrets-store-csi-driver-provider-azure) installation.

It points your Key Vault, and allows you to specify the keys, secrets, and certificates that you want to expose.

The `usePodIdentity` field must be true so that `SecretProviderClass` can use the Azure Managed Identity (created in Step 5 and referenced in the `AzureIdentity` spec) to give Kubernetes access to the Key Vault.

The `useVMManagedIdentity` and `userAsignedIdentityID` must be `false` and `””`, respectively.

Additional Fields:

* `keyvaultName` is the name of the Key Vault being accessed.
* `resourceGroup` is the name in which the Key Vault resides
* `subscriptionId` is the Key Vault’s subscription ID
* `tenantId` is the Azure Tenant ID
* `objects` lists the secrets/keys/certificates from the specified Key Vault in `keyvaultName` to be made available to the `Pod`.

Again, we won’t be applying this manifest to Kubernetes just yet.

#### 8- Configure the Deployment

Our Deployment references the Key Vault secrets by mounting a volume containing the secrets. The volume definition points to the `SecretProviderClass` defined in Step 7, which gives us access to the secrets that we exposed there. But how do we ensure that we have access to the secrets referenced in the Key Vault? That’s where the label `aadpodidbinding: pod-id-binding` comes into play. You may recall that we defined `pod-id-binding` in the `selector` field of the `AzureIdentityBinding` YAML (see Step 6).

We won’t be applying this manifest to Kubernetes just yet.

#### 9- Putting it all together

NOW, we can apply all of the YAML files to Kubernetes. You can use the script below.

Run the script using the command below, making sure that the Kubernetes manifests are in the same directory as the above script:

./3-run\_sample.sh

You’ll notice that if all goes well, you should see a few things:

* When you run `kubectl get AzureAssignedIdentities`, you’ll see a reference to our 2048-game `Pod`.
* When you run `kubectl -n az-keyvault-demo exec -it $(kubectl -n az-keyvault-demo get pods -o jsonpath=’{.items[0].metadata.name}’) -- ls /mnt/secrets-store`, you’ll see a listing of the secret names (not values, because they’re secret!) that you exposed in Step 7

### Conclusion

IaC is cool, but it’s a real bitch if it doesn’t adhere to software engineering principles. Remember:

* Keep your IaC code simple
* Make your infrastructure ephemeral
* Make sure that your infrastructure creation is repeatable
* Treat your IaC code like an API — well-designed and well-documented

If you stick to these principles, you’ll save yourself and others many headaches many times over.

Thanks for putting up with my rants. Here are some penguins for you to enjoy.

![](https://cdn-images-1.medium.com/max/800/1*w12qCWWw37zhwdbfH7gyOw.jpeg)

Photo by [Derek Oyen](https://unsplash.com/@goosegrease?utm_source=unsplash\&utm_medium=referral\&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/penguin?utm_source=unsplash\&utm_medium=referral\&utm_content=creditCopyText)

Peace out.

### References:

* [Secrets Store CSI Driver](https://github.com/Azure/secrets-store-csi-driver-provider-azure)
* [AAD Pod Identity](https://github.com/Azure/aad-pod-identity)
* [Cloud IQ — Implementing Azure AD Pod Identity in AKS Cluster](https://www.cloudiqtech.com/implementing-azure-ad-pod-identity-in-aks-cluster/)
* [Medium — Using AAD Pod Identity in an AKS Cluster](https://medium.com/@kimvisscher/using-aad-pod-identity-in-an-aks-cluster-117c08565692)
* [Secrets Store CSI Driver with Pod Identity Tutorial](https://github.com/HoussemDellai/aks-keyvault)

By [Adriana Villela](https://medium.com/@adri-v) on [November 28, 2020](https://medium.com/p/fc3be5e65d18).

[Canonical link](https://medium.com/@adri-v/kubernetes-saved-today-f-cked-tomorrow-a-rant-azure-key-vault-secrets-%C3%A0-la-kubernetes-fc3be5e65d18)

Exported from [Medium](https://medium.com) on June 3, 2026.
