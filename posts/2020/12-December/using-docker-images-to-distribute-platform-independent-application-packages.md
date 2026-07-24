---
title: "Using Docker Images to Distribute Platform-Independent Application Packages"
slug: using-docker-images-to-distribute-platform-independent-application-packages
description: "A (surprisingly) elegant way to distribute your code to others."
added: "Dec 08, 2020"
tags:
  - technical
  - docker
---


![](https://cdn-images-1.medium.com/max/800/1*oLAkPNqwuZgPW63YavoIug.png)

Toronto streetcar at dusk at Avenue Road & St. Clair Avenue. Photo credit: Dzero Labs

This past week, as I continued [my quest for ArgoCD domination](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0), I decided to look more deeply into different technologies to deploy manifests to Kubernetes. Among others, ArgoCD supports the popular kids, [Kustomize](https://argoproj.github.io/argo-cd/user-guide/kustomize/) and [Helm](https://argoproj.github.io/argo-cd/user-guide/helm/). I had actually initially settled on a [combo of Helm + Kustomize](https://jfrog.com/blog/power-up-helm-charts-using-kustomize-to-manage-kubernetes-deployments/), which [can be done with ArgoCD](https://github.com/argoproj/argocd-example-apps/tree/master/plugins/kustomized-helm). (If you’re wondering how it’s done, check out my post [here](https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c)) I was pretty happy with that combo until…I read this post on [Kapitan](https://medium.com/kapitan-blog/let-kapitan-take-the-helm-of-kubernetes-e455e3d9ed08). Well, colour me intrigued. Kapitan seemed to be the one-stop shop that did the things I was doing with Helm + Kustomize, so I decided to give it a whirl.

### Down the Rabbit Hole

Now, I normally do my dev on my beloved MacBook Pro, but in this instance, I needed to do the Kapitan proof-of-concept on a Windows 10 machine. I organized myself as I usually do, with example repos in hand and reference articles on Kapitan ready to go, and proceeded to look up instructions on how to install Kapitan.

The [Kapitan Quickstart](https://github.com/deepmind/kapitan#quickstart) says that Kapitan is available via Docker image, `pip install`, or as a standalone library available only for Linux amd64. The Linux amd64 package was a non-starter for me. Although I could’ve easily gotten the Linux binary running on [WSL](https://docs.microsoft.com/en-us/windows/wsl/about), my target audience were full-on Microsofties who didn’t have WSL set up on their machines, and were more comfortable with PowerShell than with Bash. Plus, I figured that the `pip` install wouldn’t be too bad. Famous last words. Long story short, [it no workie on Windows 10](https://github.com/deepmind/kapitan/issues/466). At least, not without a lot of voodoo. And believe me, I even started trying some of the workarounds for a good 30 minutes before I thought to myself, “Is this even worth it? I mean, I got the Helm + Kustomize thing working pretty well. Let it be.” But no. I am as stubborn as they come, and I do not like being defeated by tech.

So I kept googling. And googling. And googling. No dice. I was still not willing to [go through a stupid song and dance](https://github.com/google/jsonnet/issues/476#issuecomment-488656947) just to install this thing. And so, deflated and looking for answers, I returned to the [Kapitan Quickstart](https://github.com/deepmind/kapitan#quickstart).

### The “A-HA!” Moment

Spoiler alert: the answer was staring me in the face in the [Kapitan Quickstart](https://github.com/deepmind/kapitan#quickstart), and I was just (stubbornly) ignoring it. The first sub-heading in the quickstart is: “[Docker (recommended)](https://github.com/deepmind/kapitan#docker-recommended)”. DUH. Of COURSE! Run this in Docker.

It’s actually brilliantly simple. The docs tell you to do this:

```
docker run -t --rm -v $(pwd):/src:delegated deepmind/kapitan <some_command>
```

Which means: you’re simply using the Docker image to run the Kapitan command-line. Let’s decompose the above command:

*   `--rm` ensures that the container is removed with it exits
*   `-v` maps your current working directory (`$(pwd)`) to the container directory, `/src`, so that the container has access to files from your local filesystem
*   `-t` is Docker’s pseudo-TTY, which lets you run `<some_command>` in Docker

If you take a look at the `deepmind/kapitan` [Dockerfile](https://github.com/deepmind/kapitan/blob/master/Dockerfile), you’ll notice that its `ENTRYPOINT` is the `kapitan` command. Which means that when we run the `docker run` command above, it’s the equivalent of running `kapitan <some_command>`.

Which got me thinking. Why don’t we just alias the `docker run` command? Then it pretty much looks ands acts like having the CLI installed on your machine.

This means that for Mac and Linux folks, we do something like this:

echo "alias kapitan='`docker run -t --rm -v $(pwd):/src:delegated deepmind/kapitan`'" >> ~/.bashrc

source ~/.bashrc

Or for Microsoft PowerShell folks, edit `Microsoft.PowerShell_profile.ps1`, and add the following lines:

```
function Run-Kapitan-CLI {    docker run -t --rm -v $(pwd):/src:delegated deepmind/kapitan}Set-Alias kapitan Run-Kapitan-CLI
```

For the full process, check out [this StackOverflow post](https://stackoverflow.com/a/29806921).

FYI, Microsoft folks, if you have issues with `-v $(pwd):/src:delegated`, you can instead replace that with `--mount type=bind,source=$(pwd),target=/src`.

Et voilà! We now effectively have a platform-independent `kapitan` CLI. No fuss, no muss!

What I love about this solution is that is:

*   Simple
*   Platform-independent
*   Portable
*   You can do it for any CLI that you want to distribute!! YAY!

Most importantly, it’s not at all a new concept. As we’ve already seen, Kapitan uses this approach, and so does [Kaniko](https://github.com/GoogleContainerTools/kaniko#running-kaniko-in-docker).

Many devs already have Docker installed on their systems, and having a CLI containerized pretty much avoids any of the annoying platform-specific problems that you might have when attempting to install a CLI tool. For example, running a zillion versions of Python or Java, and making sure that they all play nice with each other on your machine.

#### Additional Considerations

If you do choose to distribute a CLI à lá Docker image, make sure that you keep the following in mind:

*   Make sure that your image is versioned using semantic versioning. [Using the](https://vsupalov.com/docker-latest-tag/) `[latest](https://vsupalov.com/docker-latest-tag/)` [tag is an invitation for trouble](https://vsupalov.com/docker-latest-tag/).
*   Even though you’re distributing your CLI via Docker image, it’s still an app that you’re distributing, which means that it needs to be well-documented. [Good documentation goes a long way](https://medium.com/dzerolabs/kubernetes-saved-today-f-cked-tomorrow-a-rant-azure-key-vault-secrets-%C3%A0-la-kubernetes-fc3be5e65d18).
*   Keep your image size as small as possible. There are tons of articles in the Interwebs on different things you can do to keep your Docker images small. It’s easy to let the size of your Docker image get out of control, and you don’t want your users downloading a 2GB image for a CLI if you can easily avoid it.
*   Keep image security in mind. Your image’s default user, for example, should never be `root`.

Check out some other Docker best practices [here](https://medium.com/containers-101/docker-anti-patterns-ad2a1fcd5ce1).

#### Bonus

If you’re interested, I put together a quick example in a gist [here](https://gist.github.com/avillela/edf18f4d92f3a150eafcfc353c28cc7e), for dockerizing the ArgoCD CLI.

### And what of Kapitan?

In case you’re wondering what happened to my Kaptian POC after I finally got the CLI going, I got partway through the tutorial, and realized that Kapitan seemed unnecessarily complicated for my liking. So I decided to stick with Helm + Kustomize, as it seemed to be a simpler approach overall.

### Conclusion

The best solutions are the simplest ones. And sometimes, they’re the ones staring you right in the face, if you choose to remove your head out of your ass long enough to see them.

And now, I will reward you with the picture of a cute little duckling. Awwww…

![](https://cdn-images-1.medium.com/max/800/1*HUb0bH6lAAo4mLT9MX5wtA.jpeg)

Photo by [Meg Kannan](https://unsplash.com/@meghankannan4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/duckling?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace.

### Further Reading

Want more ArgoCD goodies? Be sure to check out some of my past ArgoCD-themed blog posts below!

[**Installing Ambassador, ArgoCD, and Tekton on Kubernetes**  
_Configuring your Kubernetes cluster for Kubernetes-native build and release with Tekton and ArgoCD_medium.com](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9 "https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9")[](https://medium.com/dzerolabs/installing-ambassador-argocd-and-tekton-on-kubernetes-540aacc983b9)

[**Using Tekton and ArgoCD to Set Up a Kubernetes-Native Build & Release Pipeline**  
_A Tekton and ArgoCD primer and step-by-step guide for setting up and running build & release workflows with Tekton and…_medium.com](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0 "https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0")[](https://medium.com/dzerolabs/using-tekton-and-argocd-to-set-up-a-kubernetes-native-build-release-pipeline-cf4f4d9972b0)

[**Configuring SSO with Azure Active Directory on ArgoCD**  
_Turbocharging ArgoCD with advanced configuration_medium.com](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b "https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b")[](https://medium.com/dzerolabs/configuring-sso-with-azure-active-directory-on-argocd-d20be4ba753b)

[**Turbocharge ArgoCD with App of Apps Pattern and Kustomized Helm**  
_An SRE’s guide to ArgoCD’s App of Apps pattern, Kustomized Helm, and step-by-step tutorial._medium.com](https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c "https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c")[](https://medium.com/dzerolabs/turbocharge-argocd-with-app-of-apps-pattern-and-kustomized-helm-ea4993190e7c)

By [Adriana Villela](https://medium.com/@adri-v) on [December 8, 2020](https://medium.com/p/da9903013215).

[Canonical link](https://medium.com/@adri-v/a-surprisingly-elegant-way-to-distribute-cli-packages-da9903013215)

Exported from [Medium](https://medium.com) on June 3, 2026.