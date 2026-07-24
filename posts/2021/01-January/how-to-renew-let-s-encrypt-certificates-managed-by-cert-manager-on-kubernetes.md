---
title: "How to Renew Let’s Encrypt Certificates Managed by cert-manager on Kubernetes"
slug: how-to-renew-let-s-encrypt-certificates-managed-by-cert-manager-on-kubernetes
description: "A panic-free how-to guide on what to do when your cert-manager managed Let’s Encrypt certificate expires on Kubernetes."
added: "Jan 15, 2021"
tags:
  - technical
  - kubernetes
  - cert-manager
---

# How to Renew Let’s Encrypt Certificates Managed by cert-manager on Kubernetes

![](https://cdn-images-1.medium.com/max/800/1*iO5Ir_Kfz601nECqVRZbEw.png)

Gibbous moon in September 2020. Shot on Canon 5D Mark III, 200mm at f13 (EF70-200 f2.8L II USM). Photo by Dzero Labs.

So, you’ve set up TLS on your Kubernetes cluster managed by [cert-manager](https://cert-manager.io), serving up [Let’s Encrypt](https://letsencrypt.org) certificates. And then you get an email like this:

![](https://cdn-images-1.medium.com/max/800/1*faKVDL9LLPwtDrBPmbcQ1Q.png)

The dreaded certificate renewal email

If you’re like me and it’s your first experience with [Let’s Encrypt](https://letsencrypt.org) on Kubernetes, maybe you’ve gone into a panic, thinking: “Now WHAT?”

Never fear! Renewing the certificate is actually pretty easy!

First things first. By default, [Let’s Encrypt](https://letsencrypt.org) certificates expire every 90 days. [Let’s Encrypt](https://letsencrypt.org) usually sends an e-mail (like the one above) to the address associated with the [Certificate](https://cert-manager.io/docs/usage/certificate/) resource created in Kubernetes to remind the cluster admin to renew it. As a best practice, certificates should be renewed about 30 days before expiry.

> **NOTE:** _I’m assuming that you’re running Ambassador Edge Stack API Gateway on TLS using_ [_cert-manager_](https://cert-manager.io) _to manage your_ [_Let’s Encrypt_](https://letsencrypt.org) _Certificate. The steps below are based on_ [_this setup_](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9)_. This means that things may be a bit different if you have a different setup and/or are renewing Certificates for another API Gateway or Ingress Controller._

#### 1- Check certificate status

Before we begin, let’s first take a look at our certificate. To check certificate status, run the command below.

kubectl describe certificates ambassador-certs -n ambassador

My output looked like this:

![](https://cdn-images-1.medium.com/max/800/1*Zc8zmJcpcElwFVJDnCCOpg.png)

The certificate is going to expire in March

Let’s take a look at what the highlighted fields mean:

*   `Not After` is the `Certificate`’s expiry date. In our case, it’s `2021–03–12`.
*   `Not Before` is typically the date that the certificate was created. That is, if you didn’t explicitly populate it this field in your `Certificate` resource YAML.
*   `Renewal Time` is the 30-day mark before the `Certificate` expires.

#### 2- Delete the `Certificate` and Secret

In our case, we configured TLS for Ambassador, so we’re deleting both the `Certificate` resource and its accompanying `Secret` resource from the `ambassador` namespace in our cluster.

To check to see TLS is actually disabled, try going to your Ambassador URL using https. For example, https://<my\_domain>.com

If you get something like the screen below, then good. That’s what we expected.

![](https://cdn-images-1.medium.com/max/800/1*AE5it3kHsk84w_QkkhK_mA.png)

#### 3- Re-create the certificate in Kubernetes

Okay, so now that we’ve nuked our `Certificate` and its accompanying `Secret`, we need to recreate it. Here’s the YAML that creates the `Certificate` resource, which we’re calling `ambassador-certs`:

Be sure to replace Line 16 with your Ambassador DNS name or FQDN. Note that IPs will not be accepted.

Now apply it to Kubernetes:

kubectl apply -f ambassador-certificate-definiton.yml

#### 4- Verify

After we apply the above YAML to Kubernetes, it should create both a `Certificate` **_and_** a `Secret`, both of which are called `ambassador-certs` (because that’s how we named them in the YAML in Step 3 – see lines 4 and 10).

It might take a bit of time before the certificate is ready, so wait 30–40 seconds or so before running the command below:

kubectl describe certificates ambassador-certs -n ambassador

If all goes well, you should see something like this:

![](https://cdn-images-1.medium.com/max/800/1*CZsWAM3giQ1ZrjVou3qFgw.png)

The new certificate expires in April

Let’s take a look at the highlighted fields:

*   `Reason` is `Ready` (cert is ready)
*   `Status` is `True` (cert hasn’t gone caca)
*   `Not After` is now `2021–04–13`. The old value was`2021–03–12`. Yay — it’s been updated!

> **NOTE:** _Yes, I probably renewed a little too early, since the only thing I managed to do was buy myself an extra month, but this was for demo purposes only._

Now that we’ve checked on the `Certificate` creation, let’s check on the `ambassador-certs` `Secret` as well. It should have been created automagically when we applied the cert-creation YAML in Step 3 above:

kubectl get secrets -n ambassador 

The output should look something like this:

![](https://cdn-images-1.medium.com/max/800/1*0Ct7whVEWmNNG13C_l5O8g.png)

The accompanying secret has been created successfully

Yes, we have a new secret called `ambassador-certs`, and it’s of type `kubernetes.io/tls`. Just as we expected. Success!

### Keeping it DevOpsy

In order to keep with DevOps principles, we shouldn’t have to be running the above steps manually every time our certificate needs to be renewed. So let’s put it all together into a handy-dandy script:

End-to-end certificate renewal script

> **NOTE:** _If you’re using Bash instead of MacOS/BSD, your date command will be:_`_date_ -d <date_string>`_. Check out this handy reference_ [_here_](https://unix.stackexchange.com/a/170982)_._

Remember that [Let’s Encrypt](https://letsencrypt.org) recommends that you renew your certificates 30 days before expiry. This minimizes service disruption and headaches. Ideally, you should create a cron job that runs every few days to check to see if today’s date is on or before the date on the certificate’s `Renewal Time` field. If it is, then run the above script to regenerate the certificate.

We can get `Renewal Time` like this:

kubectl get certificate -n ambassador -o=jsonpath='{.items\[0\].status.renewalTime}'

### Final Thoughts

We learned today that it’s not terribly complicated to renew [Let’s Encrypt](https://letsencrypt.org) Certificates managed by [cert-manager](https://cert-manager.io).

I recognize that the approach taken today is a bit of a layperson’s approach, but it works! Remember that the best way to keep certificate renewal from creeping up on you is to run a cron job that checks the certificate’s `Renewal Time` before running that handy all-in-one script above.

If you have thoughts on how to improve this process and/or the above script, please share in the comments below!

![](https://cdn-images-1.medium.com/max/800/1*Du0fqaY_0YuR6jQMATKSYQ.png)

Image source [here](https://jamesrayneau.files.wordpress.com/2013/03/party-on-wayne.png)

Peace, love, and code.

### References

*   [Certificate Resource Overview (cert-manager)](https://cert-manager.io/docs/usage/certificate/)
*   [Certificate API Documentation (cert-manager)](https://cert-manager.io/docs/reference/api-docs/#cert-manager.io/v1alpha2.CertificateSpec)
*   [Overview of cert-manager and Let’s Encrypt](https://medium.com/flant-com/cert-manager-lets-encrypt-ssl-certs-for-kubernetes-7642e463bbce)

### Other stories in my ArgoCD journey

Want to know more on how we got here? Check out the other stories in my ArgoCD journey below!

[**Installing Ambassador, ArgoCD, and Tekton on Kubernetes**  
_Configuring your Kubernetes cluster for Kubernetes-native build and release with Tekton and ArgoCD_medium.com](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9 "https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9")[](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9)

[**Using Tekton and ArgoCD to Set Up a Kubernetes-Native Build & Release Pipeline**  
_A Tekton and ArgoCD primer and step-by-step guide for setting up and running build & release workflows with Tekton and…_medium.com](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0 "https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0")[](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0)

[**Configuring SSO with Azure Active Directory on ArgoCD**  
_Turbocharging ArgoCD with advanced configuration_medium.com](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b "https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b")[](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b)

[**Turbocharge ArgoCD with App of Apps Pattern and Kustomized Helm**  
_An SRE’s guide to ArgoCD’s App of Apps pattern, Kustomized Helm, and step-by-step tutorial._medium.com](https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c "https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c")[](https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c)

By [Adriana Villela](https://medium.com/@adri-v) on [January 15, 2021](https://medium.com/p/2a74f9a0975d).

[Canonical link](https://medium.com/@adri-v/how-to-renew-lets-encrypt-certificates-managed-by-cert-manager-on-kubernetes-2a74f9a0975d)

Exported from [Medium](https://medium.com) on June 3, 2026.