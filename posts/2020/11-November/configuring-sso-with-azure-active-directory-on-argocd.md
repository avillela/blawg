---
title: "Configuring SSO with Azure Active Directory on ArgoCD"
slug: configuring-sso-with-azure-active-directory-on-argocd
description: "Turbocharging ArgoCD with advanced configuration"
added: "Nov 14, 2020"
tags:
  - technical
  - azure
  - argocd
  - "2020"
---


![](https://cdn-images-1.medium.com/max/800/1*Bzyh-IAVchoer9X916OYJQ.png)

Ceiling of the Atrium on Bay, Toronto. Photo credit: Dzero Labs

### Now entering the Big Leagues…

In [my last tech post](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0), I walked you through [how to create a Kubernetes-native build & release pipeline with Tekton and ArgoCD](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0). Today, I want to focus on configuring [ArgoCD](https://argoproj.github.io) so that it can be used by you and others in your organization.

For that, we need to step beyond the default `admin` account created by [ArgoCD](https://argoproj.github.io) at installation time, and set up user accounts and role-based access control (RBAC). While ArgoCD does come with the ability to create local users, the last thing you want to do is create yet another userid and password that you have to keep track of. Fortunately for us, [ArgoCD supports single sign-on (SSO) with Microsoft, GitHub, Google, Auth0, and others](https://argoproj.github.io/argo-cd/operator-manual/user-management/#sso). Today, I’ll be focusing on configuring SSO and RBAC on ArgoCD to work with Microsoft’s [Azure Active Directory (AAD)](https://azure.microsoft.com/en-ca/services/active-directory/).

I won’t lie. This was a royal pain in the ass to configure. While I love ArgoCD as a product, their docs are another story. They are VERY poorly-written, and require special clairvoyant abilities to decipher. Add that to Microsoft’s equally-paltry doc-writing skills, and you have a match made in hell. Which is why, after figuring this out, I wanted to share my findings in excruciating detail with all y’alls. Here we go!

### Assumptions

Before we move on, I’m assuming that you have the following in place:

*   A Kubernetes cluster running on [Azure](https://azure.microsoft.com/en-ca/free/), all set up with [Ambassador Edge Stack](https://www.getambassador.io), [ArgoCD](https://argoproj.github.io), and [Tekton](https://tekton.dev), per my instructions [here](/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9).
*   The [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).

### Tutorial Repo

You can check out the accompanying GitHub repo for this tutorial [here](https://github.com/d0-labs/argocd-sso-aad-setup).

### Configuring SSO with AAD

ArgoCD’s docs say that you can configure SSO with AAD in [one of three ways](https://argoproj.github.io/argo-cd/operator-manual/user-management/microsoft/). I chose the [Azure AD App Registration Auth using OIDC](https://argoproj.github.io/argo-cd/operator-manual/user-management/microsoft/#azure-ad-app-registration-auth-using-oidc) method, because it looked relatively simple, and because I got it to work. 😁

Please note that your userid will need to be permission to to create [App Registrations in Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app), so if you currently don’t have those permissions, please speak with your AAD admin and convince them (plead) that you need this.

At a high level, [when setting up ArgoCD for Microsoft SSO with OIDC](https://argoproj.github.io/argo-cd/operator-manual/user-management/microsoft/#azure-ad-app-registration-auth-using-oidc) we need to do the following:

*   Create an Azure application, setting up API permissions, and groups claim for the app, pointing to the ArgoCD callback URL, `https://$ARGOCD_SERVER/argo-cd/auth/callback` (more on this below).
*   Create and associate an Active Directory group to the newly-created app
*   Add the OIDC configs to the `argocd-cm` ConfigMap
*   Add the Azure application secret to the `argocd-secret` Secret
*   Configure roles for user access in `argocd-rbac-cm`

#### **1- Create & configure a new Azure AD app**

The first thing you need before you can set up your ArgoCD cluster for SSO with Azure Active Directory is to create an Azure Application.

Most documentation out there (including Microsoft’s official docs) has instructions chalk full of screen shots on how to do this via the GUI. But that’s very anti-DevOps. So I decided to embark on the long journey of trying to figure out how to do this in a repeatable script. It took me 3 weeks of off and on obsessing over this before I arrived at a fully-scripted result that involved using the Azure CLI and [Microsoft’s Azure REST API](https://docs.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0). This was no small feat. I don’t get Microsoft’s obsession with GUIs. And I don’t get Microsoft’s hate on for poor documentation.

I’ve put everything together into a lovely bash script for everyone’s convenience and sanity.

> **Disclaimer:** _I am by no means a bash guru (nor do I want to be) — I just know enough bash to be dangerous. The script below does the job, and it doesn’t involve clicking through GUIs, so it’s a win in my books! 😊_

You’ll need to have [jq](https://stedolan.github.io/jq/download/) installed on your local machine before running the script below. To install it on Mac via Homebrew:

brew install jq

For all other systems, check out [this page](https://stedolan.github.io/jq/download/).

Please take special note of the fact that `line 20` above references a file called `required_resource_accesses.json`, which is listed below. Just make sure that you save it to your local filesystem (same directory as `az_app_creation.sh`) before running the bash script.

Run the bash script as follows:

export AZURE\_USERID=<azure\_userid>  
export AZURE\_PASSWORD=<azure\_password>  
export ARGOCD\_SERVER=<argocd\_server\_name>  
export AZURE\_APP\_PASSWORD=<azure\_app\_password>

./az\_app\_creation.sh $AZURE\_USERID $AZURE\_PASSWORD $ARGOCD\_SERVER $AZURE\_APP\_PASSWORD

Notes on the values above:

*   `AZURE_USERID`: Your Azure userid
*   `AZURE_PASSWORD`: Your Azure password
*   `ARGOCD_SERVER`: DNS or FQDN of your ArgoCD server (e.g. argocd.domain.com). Pay special attention to the fact that we have the `argo-cd` suffix as part of our URL, because of the way we did our [ArgoCD setup, per my previous post](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9). The `ARGOCD_SERVER` value is used to construct the ArgoCD callback URL (done by the above bash script), which looks like this: `https://$ARGOCD_SERVER/argo-cd/auth/callback`.
*   `AZURE_APP_PASSWORD`: The password you want to use for the Azure app you’re creating

> **NOTES:**

> _If you forget your app’s password, you can always regenerate a new one using_ `_az ad app credential reset -id <your_app_id>_`

> _Sometimes Azure takes a while to create the app, so the subsequent steps of updating app configs following app creation may fail. If this happens, you can either increase the_ `_sleep_` _value in the script (the number is in seconds), or re-run the script, in which case it will patch (update) the existing app you just created._

> _The_ [_ArgoCD Microsoft OIDC config docs_](https://argoproj.github.io/argo-cd/operator-manual/user-management/microsoft/#azure-ad-app-registration-auth-using-oidc) _state that you need to grant admin consent to the Microsoft Graph_ `_User.Read_` _API permission; however,_ **this is not necessary**_. Things will work just fine without this admin consent, because_ `_User.Read_` _itself_ **does not** _require admin consent. Believe me, I’ve tried it. 😊_

#### **2- Assign a group to your app**

One thing missing from [ArgoCD’s Microsoft OIDC setup documentation](https://argoproj.github.io/argo-cd/operator-manual/user-management/microsoft/#azure-ad-app-registration-auth-using-oidc) is the fact you need to associate an Azure AD group to your newly-created Azure application. You need this for role assignments in the ArgoCD RBAC configurations (more on that later). At a minimum, you’ll want to create a group with elevated privileges for the ArgoCD admin folks, typically an SRE group. It goes without saying that you can assign multiple Azure groups to your Azure App.

**_Of course_** Microsoft made it excruciating to assign a group to an Azure application via non-GUI means. Lucky for you, I found the CLI/REST API combo to make this happen, via the bash script below:

Run the bash script as follows:

export AZURE\_USERID=<azure\_userid>  
export AZURE\_PASSWORD=<azure\_password>  
export AZURE\_GROUP\_NAME=<azure\_group\_name>

./az\_app\_group\_assignment.sh $AZURE\_USERID $AZURE\_PASSWORD $AZURE\_GROUP\_NAME

Notes on the values above:

*   `AZURE_USERID`: Your Azure userid
*   `AZURE_PASSWORD`: Your Azure password
*   `AZURE_GROUP_NAME`: Name of the group to associate to the Azure app. The above script will create this group, and will associate it to the app.

You can add users to the newly-created group as follows:

az ad group member add --group <group\_name> --member-id <member\_id>

Wondering how to get the userID for a given user? Run the command below:

az ad user list --filter "displayname eq 'Jane Doe'" | jq .\[0\].objectId | tr -d '"'

#### 3- Update the argocd-cm ConfigMap

Now that we have our Azure Application all set up, we can finally get to the ArgoCD configs side of things. The first thing you need to do is update the `argocd-cm.yml` `ConfigMap`.

Below is the file you’ll be using to do this:

Before you apply the manifest to Kubernetes, you’ll need to update the following values:

*   `<argocd_server>`: DNS or FQDN of your ArgoCD server (e.g. argocd.domain.com). Again, pay special attention to the fact that we have the `argo-cd` suffix as part of our URL, because of the way we did our [ArgoCD setup, per my previous post](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9).
*   `<tenant_id>`: Tenant ID of your Azure subscription
*   `<azure_ad_application_id>`: Application ID of your newly-created Azure Application

You can get the `<tenant_id>` by logging in with your own credentials:

az login -u $AZURE\_USERID -p $AZURE\_PASSWORD | jq .\[0\].homeTenantId | tr -d '"'

You can get the `<azure_ad_application_id>` by running this command:

az ad app list --filter "displayname eq 'argocd-sso'" | jq .\[0\].appId | tr -d '"'

Now, apply the manifest to Kubernetes:

kubectl apply -f argocd-cm.yml

#### 4- Edit `argocd-secret`

You may have noticed that `argocd-cm.yml` references a value called `$oidc.azure.clientSecret`. You’ll need to add this value to `argocd-secret`. First, we’ll need to base64-encode the secret for the Azure Application that we created in `Step 1` (the value entered for `AZURE_APP_PASSWORD` when configuring the Azure Application):

echo <azure\_app\_password> | base64

Now, edit the `argocd-secret`:

kubectl edit secret argocd-secret -n argocd

This will open the manifest for `argocd-secret` in your default system text editor (e.g. VI on Mac, or Notepad on Windows). Simply add the new `$oidc.azure.clientSecret` secret to this file. The updated YAML will look something like this:

apiVersion: v1  
kind: Secret  
data:  
  oidc.azure.clientSecret: <base64\_encoded\_secret>  
  ...

Save the changes, and close the editor. You’ll see the changes reflected in Kubernetes when you run this:

kubectl get secret argocd-secret -n argocd

#### 5- Update argocd-rbac-cm ConfigMap

We’re at the home stretch! The last thing we need to do is set up RBAC, so we can control who has access to what.

Earlier, we created an Azure Active Directory group for your SRE team, who will be managing your ArgoCD cluster. I’ll walk you through a setup whereby we’ll grant admin access to the SRE AAD group, and set up read-only access for everyone else.

Below is the file you’ll be using to do this:

Before you apply the manifest to Kubernetes, you’ll need to update the following value:

*   `<your_azure_ad_group_id>`: The ID of the Azure Active Directory group

To get the group ID, run the following Azure CLI command, replacing `<azure_group_name>` in `argocd-rbac-cm.yml` with the group name you chose in `Step 2`:

az ad group show --group <azure\_group\_name> --query objectId --out tsv

Now, apply the manifest to Kubernetes:

kubectl apply -f argocd-rbac-cm.yml

For more on ArgoCD RBAC configuration check out the docs [here](https://argoproj.github.io/argo-cd/operator-manual/rbac/).

> **Note:** _The_ [_ArgoCD docs_](https://argoproj.github.io/argo-cd/operator-manual/user-management/microsoft/#azure-ad-app-registration-auth-using-oidc) _tell you to add the line_ `_scopes: ‘[roles, email]’_` _to_ `_argocd-rbac-cm_`_: “If you want to map the roles from the jwt token to match the default roles (readonly and admin) then you must change the scope variable in the rbac-configmap.” DON’T. DO. IT. It somehow causes the RBAC configuration for your Azure group to be ignored. No good._

#### 6- Restart the ArgoCD pods

For good measure, re-start all 5 ArgoCD pods. First you’ll need to get the pod names:

kubectl get pod -n argocd

Then you can delete them:

kubectl delete pod argocd-application-controller-<xxxxxxx> -n argocd  
kubectl delete pod argocd-dex-server-<xxxxxxx> -n argocd  
kubectl delete pod argocd-redis-<xxxxxxx> -n argocd  
kubectl delete pod argocd-repo-server-<xxxxxxx> -n argocd  
kubectl delete pod argocd-server-<xxxxxxx> -n argocd

This will delete the pods, and will create new ones. You can check pod status:

kubecrtl get pod -n argocd

#### 7- Log in to ArgoCD UI using SSO

Once the ArgoCD pods have been re-started, you can log ArgoCD.

> **Note:** _It may take a few minutes for settings to kick in, so if you see some wonky behaviour when you first try to log in, just give it some time. You might also want to log out of your Microsoft account completely, if you’re logged in somewhere in your browser. To do this, open a new browser tab and enter the following address:_ `[_https://login.microsoftonline.com_](https://login.microsoftonline.com,)`_. Log out by clicking on the circle icon on the top right-hand corner (which may have your avatar or initials), and click_ `_Sign Out_`_._

You’ll now see an option to log into ArgoCD with Azure from your admin UI (`http://<argocd_server>/argo-cd`):

![](https://cdn-images-1.medium.com/max/800/1*MnhhUpHjfFAekz1C1ilDTw.jpeg)

Click `**LOGIN VIA AZURE**` button to log in with your Azure Active Directory account. If you’re not already logged into your Microsoft Azure Active Directory account, you will be prompted to enter your credentials. If you are already logged into your Microsoft account, you’ll see the ArgoCD applications screen after clicking the `**LOGIN VIA AZURE**` button:

![](https://cdn-images-1.medium.com/max/800/1*EHi36ANwh-w00hmBKkM2uQ.png)

If you click on the user icon (2nd from the bottom, right side of the screen), you’ll see something like this:

![](https://cdn-images-1.medium.com/max/800/1*iyYAyIH5v3G856Paj_LQDw.png)

This tells us that you’re logged in using your Azure Active Directory user. It should display your AAD user ID, the URI will have your Tenant ID, and Groups will have your group’s Object ID (same group you created in `Step 2`).

> **Note:** _When you log out of ArgoCD with your AAD account, it won’t actually log you out of your AAD account. If you want to log out completely, you’ll need to open a new browser tab and enter the following address:_ `[_https://login.microsoftonline.com_](https://login.microsoftonline.com,)`_. Log out by clicking on the circle icon on the top right-hand corner (which may have your avatar or initials), and click_ `_Sign Out_`_._

### Final Thoughts

Congratulations — you did it! I will now reward you with a picture of a cute bunny:

![](https://cdn-images-1.medium.com/max/800/1*ob3cls5KdV92dktX1c2fTg.jpeg)

Photo by [Waranya Mooldee](https://unsplash.com/@anyadiary?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/bunny?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Let’s review what we’ve learned today:

*   GUI sucks, scripting rocks (this one’s for you, Microsoft!)
*   Half-written vendor docs lead to many headaches and hours of detective work
*   How to set up Azure Applications via the Azure CLI and REST API
*   How to configure SSO on ArgoCD using OIDC to access your Azure Application
*   How to configure RBAC on ArgoCD after setting up SSO

Keep an eye out for my next ArgoCD blog post (coming soon), on how to set up and use the [ArgoCD App of Apps pattern](https://argoproj.github.io/argo-cd/operator-manual/cluster-bootstrapping/). Until next time!

### References

*   [ArgoCD User Management](https://argoproj.github.io/argo-cd/operator-manual/user-management/)
*   [ArgoCD SSO with Microsoft](https://argoproj.github.io/argo-cd/operator-manual/user-management/microsoft/)
*   [ArgoCD RBAC Configuration](https://argoproj.github.io/argo-cd/operator-manual/rbac/)
*   [Microsoft’s Azure REST API](https://docs.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0)
*   [GitRepo for this tutorial](https://github.com/d0-labs/argocd-sso-aad-setup)

### Acknowledgements

Special thanks as always, to my amazing tech partner, [Bernard Otu](https://medium.com/u/2cce98ae7530), for help with troubleshooting.

By [Adriana Villela](https://medium.com/@adri-v) on [November 14, 2020](https://medium.com/p/d20be4ba753b).

[Canonical link](https://medium.com/@adri-v/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b)

Exported from [Medium](https://medium.com) on June 3, 2026.