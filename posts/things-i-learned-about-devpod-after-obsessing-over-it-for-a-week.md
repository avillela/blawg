---
title: "Things I Learned About DevPod After Obsessing Over it for a Week"
slug: things-i-learned-about-devpod-after-obsessing-over-it-for-a-week
description: "Running A Dev Container for the OpenTelemetry Demo with DevPod"
added: "Jul 26, 2024"
tags:
  - technical
  - devcontainers
---

# Things I Learned About DevPod After Obsessing Over it for a Week

#### Running A Dev Container for the OpenTelemetry Demo with DevPod

![Sidewalk art of a snapping black hand in a white background](https://cdn-images-1.medium.com/max/800/1*WDpuElwnEPqRgxO6zr86wg.png)

Photo by [Adriana Villela](https://adri-v.medium.com).

_This is Part 2 of my exploration of dev containers. You can check out Part 1_ [_here_](https://medium.com/womenintechnology/things-i-learned-from-creating-a-dev-container-for-the-opentelemetry-demo-9535ae8621ce).

When I set out to create a [development (dev) container](https://containers.dev/) for the [OpenTelemetry (OTel) Demo](https://adri-v.medium.com/things-i-learned-from-creating-a-dev-container-for-the-opentelemetry-demo-9535ae8621ce), my goal was to be able to run it locally using the [VSCode Dev Containers plugin](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers), and in [GitHub Codespaces](https://github.com/codespaces). As I got deeper into this experiment, I decided that I also wanted to try to run my dev container in [DevPod](https://devpod.sh). I’ve known about DevPod for a while, and I’d read that DevPod was a vendor-agnostic alternative to GitHub Codespaces. Now that I was messing around with dev containers, it seemed like an appropriate time to dig into DevPod.

This was originally supposed to be a part of my [_Things I Learned from Creating a Dev Container for the OpenTelemetry Demo_](https://medium.com/womenintechnology/things-i-learned-from-creating-a-dev-container-for-the-opentelemetry-demo-9535ae8621ce) post. But I soon realized that the DevPod stuff alone was turning into a bit of a beast, so I decided to split things up.

Today I will share some of the interesting things that I’ve learned in trying to get the OTel Demo running on DevPod.

### Overview and installation

DevPod allows you to run your dev containers either locally on your machine, or in the cloud. This is done through a [DevPod provider](https://devpod.sh/docs/managing-providers/what-are-providers), which allows you to create, manage, and run your dev container (workspace). There are a number of out-of-the box providers that you can use with DevPod, or, if you feel adventurous, you can [create your own provider](https://devpod.sh/docs/developing-providers/quickstart).

[I installed DevPod](https://devpod.sh/docs/getting-started/install) on my M1 Mac (which was very straightforward), along with the [DevPod CLI](https://devpod.sh/docs/getting-started/install#optional-install-devpod-cli), since I’m a CLI gal for life. Plus it’s much easier to convey instructions with CLIs rather than screen shots of GUIs. ✨

### Interesting things that I learned

#### DevPod Configs

Local DevPod configurations can be found in the `$HOME/.devpod` folder. Your workspace and provider configurations are in the `$HOME/.devpod/contexts` folder, so you can poke around there to see what the JSON configurations look like.

#### Running locally with DevPod

The first thing I did when installed DevPod was try to run my dev container locally using the Docker provider. You can create a Docker provider using the DevPod CLI:

devpod provider add docker --name docker

This will add a Docker provider named `docker`. You could call it `bob` if you wanted to; however, I always recommend a descriptive name. 😁

#### Running in the cloud with DevPod

There are a number of official DevPod maintained cloud providers: AWS, Azure, Google Cloud, Civo, and DigitalOcean. There are also a number of [community cloud providers](https://devpod.sh/docs/managing-providers/add-provider#community-providers). DevPod cloud providers spin up VM for you, and this is where your dev container lives.

I did mess around with trying to spin up DevPod on my work’s Google Cloud account. DevPod was able to successfully create a compute instance for me. It was looking up. Unfortunately, I got stuck at the workspace creation step. SSH was failing. After a lot of debugging, it turned out that there was a firewall rule blocking all ingress, and that included SSH. Rightfully so — security is important, y’all!

My friend [Abdel](https://x.com/boredabdel), who works at Google Cloud suggested using [Identity Aware Proxy (IAP) for for TCP forwarding](https://cloud.google.com/iap/docs/using-tcp-forwarding). It’s a safer way to provide access without opening yourself up to opening up unnecessary firewall rules:

\# Enable IAP  
gcloud compute firewall-rules create allow-ssh-ingress-from-iap \\  
  --direction=INGRESS \\  
  --action=allow \\  
  --rules=tcp:22 \\  
  --source-ranges=35.235.240.0/20  
  
\# SSH with IAP flag  
gcloud compute ssh --zone <your\_zone> <your\_compute\_instance\_name> --project <your\_project\_name> --tunnel-through-iap

SSH now works! The only problem is that you need to SSH into your machine using the `--tunnel-through-iap` flag, and I don’t think there’s a way to pass that flag to the `devpod up` command. (SOMEONE PLEASE PROVE ME WRONG!!)

I was planning try again with my personal Google Cloud account, but I’m also not keen on opening myself up to potential security crap. Plus then I ADHDed into trying another approch — using the Kubernetes provider.

#### Running in Kubernetes with DevPod

If you prefer Kubernetes (k8s), you can check out DevPod’s Kubernetes provder. This provider creates a workspace in the Kubernetes cluster of your choice, whether it’s a local cluster (e.g. [KinD](https://kind.sigs.k8s.io/)), one hosted by your favourite cloud provider, or one in your home lab.

A couple of important notes around the default Kubernetes provider.

**1- You must create your own Kubernetes cluster beforehand**

The DevPod Kubernetes provider doesn’t create your Kubernetes cluster for you. You need to have one already up and runnng. The Kubernetes provider needs the location of your [kube config file](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) and your [Kubernetes Context](https://aptakube.com/blog/complete-guide-to-kubeconfig-kubernetes-contexts) (i.e. what Kubernetes cluster to use). You can get the list of contexts by running:

kubectl config get-contexts

Sample output:

CURRENT   NAME                                         CLUSTER                                      AUTHINFO                                     NAMESPACE  
          Default                                      local                                        user                                           
          gke\_adriana\-project\_us\-central1\-c\_devpod\-1   gke\_adriana\-project\_us\-central1\-c\_devpod\-1   gke\_adriana\-project\_us\-central1\-c\_devpod\-1     
\*         gke\_adriana\-project\_us\-central1\-c\_devpod\-3   gke\_adriana\-project\_us\-central1\-c\_devpod\-3   gke\_adriana\-project\_us\-central1\-c\_devpod\-3

The context name can be found in the `NAME` column. With your context name in hand, you can now create your Kubernetes provider:

devpod provider add kubernetes --name <provider\_name\> -o KUBERNETES\_CONFIG=<path\_to\_kubeconfig\> -o KUBERNETES\_CONTEXT=<k8s\_context\>

Where:

*   `<name>` can be whatever you want to call your provider. Again, it can be `bob` if you want; however, I recommend something meaningful.
*   `<path_to_kubeconfig>` is the path to your kube config file.
*   `<k8s_context>` is your Kubernetes context. For example, my context would be `gke_adriana-project_us-central1-c_devpod-3`, as per the output of my `kubectl config get-contexts` command above.

**2- Make sure that your Kubernetes cluser’s nodes have sufficient resources required by your workspace**

Seems obvious, doesn’t it? For context: I was trying to bootstrap a dev container workspace on Kubernetes using DevPod and it kept crapping out at various points through the build. I _of course_ ignored the “low memory” warnings from [k9s](https://k9scli.io/topics/install/) (if you don’t use k9s, you should totally check it out) and after hitting my head against the wall (because again, ignoring error messages with conveniently spelled-out-for-me error codes), I _finally_ decided to look up the error code which pointed to an out of memory (OOM) error. At which point I went, “OH, DUH. I should check the VM specs on the node”.

This is what I had:

![Screen capture of Google Cloud console showing GKE cluster: 1 node with 2 CPUs and 4GB RAM](https://cdn-images-1.medium.com/max/800/1*fzL7nEGOgS2ZDiD9P4q3rA.png)

I had provisioned a single-node GKE cluster (I didn’t need more than 1 node for this). That node had 2 CPUs and 4GB RAM. The [dev container that I was trying to build](https://github.com/avillela/opentelemetry-demo/blob/avillela-add-devcontainer/.devcontainer/devcontainer.json) required 4 CPUs and 16GB RAM. My poor dev container never stood a chance. 🫠

**3- Stopping the workspace nukes your dev container**

This means that _your dev container needs to be re-created every time your workspace is started up_. That is, unless you [pre-build your workspace](https://devpod.sh/docs/developing-in-workspaces/prebuild-a-workspace). More on pre-builds shortly.

#### Creating your workspace

Once you have your provider, you can then create your workspace. You can create a new workspace in DevPod by running the following command:

devpod up <source\> --id <workspace\_name> --provider <provider\_name> --ide openvscode

Where:

*   `<source>` points to your source code: either a local path, a GitHub repo, or a Docker image. If you’re going the GitHub Repo route, you can also specify a branch, like this: `github.com/<your_name>/<your_repo_name>@<your_branch>`.
*   `<workspace_name>` is the name of your workspace. If that name doesn’t exist, DevPod will create a new one for you with that name. If that name already exists, it will spin up an existing workspace.
*   `<provider_name>` is the name of your provider.

By default, DevPod opens up your workspace in [OpenVSCode](https://github.com/gitpod-io/openvscode-server), unless you say otherwise. I still specified it in the command, because I like full transparency. OpenVSCode is a web-based version of VSCode, and I have to say that it is surprisingly fast. If you used GitHub Codespaces, you’ve likely experienced a browser-based VSCode. While I don’t think that GitHub Codespaces uses OpenVSCode, it’s a very similar experience.

You can also tell it to use the desktop version of VSCode by specifying `--ide vscode`, or [JetBrains IDEs](https://devpod.sh/docs/developing-in-workspaces/connect-to-a-workspace#jetbrains-suite-goland-pycharm-intellij-etc).

If you’re running a workspace from the command line, hitting `ctrl+c` won’t actually kill your workspace (at least, not properly). You’ll have to explicitly stop it:

devpod stop <workspace\_name>

#### Pre-builds

Pre-builds build your dev container image so that you don’t have to re-build it every time you spin up your workspace. This is a similar concept to [pre-builds in GitHub Codespaces](https://docs.github.com/en/codespaces/prebuilding-your-codespaces).

If you use the Docker provider, DevPod builds your dev container image directly onto your machine. Give it a go! After your workspace is built with the DevPod Docker provider, run `docker images`. You’ll see the image built by DevPod listed in the output. This means that the next time you bring up your workspace using the Docker provider, it won’t need to re-build the image. Which is great, especially if your image takes an hour to build, like mine.

> **NOTE:** _Before folks start getting all up my butt over the size of my dev container image, the OTel Demo runs using Docker Compose, so I need Docker in there. If I were \*just\* running the OTel Demo, that would be enough. But my goal is to use it as a developmet environment for folks contributing to the demo. Since it’s a microservices app written in multiple languages, it requires multiple language runtimes. Hence its beefy size._

As I mentioned earlier, if you use the Kubernetes provider, you’ll have to explicitly set up a pre-build, otherwise DevPod will re-build your dev container every single time.

Pre-build only works with the Docker driver. If you run your pre-build using the Kubernetes provider, you’ll need to make sure that it’s using the Docker driver. To do this, you’ll need to edit your Kubernetes provider:

sed -i' ' 's/"driver": "custom"/"driver": "docker"/g' $HOME/.devpod/contexts/default/<provider\_name>/provider.json

Be sure to replace `<provider_name>` with your provider’s name.

Note that you’ll have to change it back before starting up your workspace, otherwise it won’t launch the workspace in Kubernetes (at least, that’s what was happening to me):

sed -i' ' 's/"driver": "driver"/"driver": "custom"/g' /Users/avillela/Downloads/blah.json

Or better yet, use a separate provider just for pre-builds, like the Docker provider.

In addition, before you pre-build your image, you’ll need to make sure that you’re logged in to your container registry. Once the build is done, DevPod will push the image to your registry. And when you run your workspace and tell it to look for a pre-build, it will attempt to pull the image from the registry.

If you use [GitHub Container Registry (GHCR)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), your command would look like this:

echo <your\_github\_token> | docker login ghcr.io -u <your\_github\_username> --password-stdin

Where `<your_github_token>` is your [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic).

Now you’re ready to run the pre-build:

devpod build <source\> --repository <your\_docker\_registry> --provider <provider\_name> --platform=linux/arm64,linux/amd64 --debug

Where:

*   `<source>` points to your source code: either a local path, a GitHub repo, or a Docker image. If you’re going the GitHub Repo route, you can also specify a branch, like this: `github.com/<your_name>/<your_repo_name>@<your_branch>`.
*   `<your_docker_registry>` is where you’re publishing your image. If you’re using GHCR, it would be: `ghcr.io/<your_user>/<your_image_name>`.
*   `<provider_name>` is the name of your provider.

I want to call special attention to the `--platform=linux/arm64,linux/amd64` flag. This flag ensures that the image is built for ARM64 and AMD64 architectures. If you’re using an Intel-based machine, you don’t need this; however, I’m building on an M1 Mac, and running my workspace on a Kubernetes cluster running an AMD64 node. ARM64 images do not play nice on AMD64 machines. Also note that your build will take twice as long, because it’s building for two different types of architectures.

> **NOTE:** _If you’re using GHCR, by default, when the image is pushed to GHCR is a private image. I didn’t want to fuss around with image pull secrets in my Kubernetes cluster, so I just changed it to public._

After the image builds, you can point to it when you bring up your workspace:

devpod up <source> \--id <workspace\_name> \--prebuild-repository <your\_docker\_registry> \--provider <provider\_name> \--debug

Where:

*   `<source>` points to your source code: either a local path, a GitHub repo, or a Docker image. If you’re going the GitHub Repo route, you can also specify a branch, like this: `github.com/<your_name>/<your_repo_name>@<your_branch>`.
*   `<workspace_name>` is the name of your workspace.
*   `<your_docker_registry>` is where you’re publishing your image. If you’re using GHCR, it would be: `ghcr.io/<your_user>/<your_image_name>`.
*   `<provider_name>` is the name of your provider.

If you have a pre-build image and you specify the `--prebuild-repository` flag, DevPod will look for the image in your specified registry. From the [DevPod docs](https://devpod.sh/docs/developing-in-workspaces/prebuild-a-workspace):

_“Based on the_ `_devcontainer.json_` _configuration, DevPod will generate a hash in the form of_ `_devpod-HASH_` _and use this as a tag for the created docker image. You can then reference docker image repositories, where DevPod will search this tag and if found uses it instead of building the image itself.”_

If it doesn’t find the hash, DevPod will build the image on the spot. When I first played around with pre-builds, I couldn’t get DevPod to pick up my pre-build image for the life of me. The logs kept showing messages like this one:

18:08:08 debug Try to find prebuild image devpod-elb8bde840dfd424a8513d1cc3587ce in repositories ghcr.io/avillela/opentelemetry-demo  
18:08:09 debug Error trying to find prebuild image gher.io/avillela/opentelemetry-demo:devpod-e1b8bde840dfd4e24a8513d1cc3587ce: retrieve image ghcr.io/avillela/ opentelemetry-demo:devpod-e1b8bde840dfd4e24a8513d1cc3587ce: GET https://ghcr.io/v2/avillela/opentelemetry-demo/manifests/devpod-e1b8bde840dfd4e24a8513d1cc3587ce  
: MANIFEST\_UNKNOWN: manifest unknown

Meanwhile, running `docker images` gave me this:

REPOSITORY                                  TAG                                       IMAGE ID       CREATED          SIZE  
vsc-content-b14b8                           devpod-521dd51e82dc1bf5f5cf438c5141d5b9   5d40b1d45062   51 minutes ago   3.8GB  
ghcr.io/avillela/opentelemetry-demo         devpod-521dd51e82dc1bf5f5cf438c5141d5b9   5d40b1d45062   51 minutes ago   3.8GB  
moby/buildkit                               buildx-stable-1                           40af8daa4aed   31 hours ago     206MB

The `devpod build` command generated the `devpod-521dd51e82dc1bf5f5cf438c5141d5b9` tag, while the `devpod up` command was expecting the `devpod-elb8bde840dfd424a8513d1cc3587ce` tag. Clearly the tags didn’t match. But why? Turns out that the architecture (AMD64 vs ARM64) also contributes to how the hash is generated. Lesson learned.

#### Caching

If you notice any funny business where DevPod seems to be caching values, then check the `~/.devpod/contexts/default/locks` folder. DevPod saves `*.lock` files there which save state, and sometimes that causes some annoyances and hours of headaches.

#### Nukify

I’m a big fan of being able to create and destroy environments to prove that my configurations actually work and aren’t the result of lucky/caching/divine intervention/angelic beings. Which is why it’s important to know some DevPod nukification commands.

Deleting workspaces:

devpod delete <workspace\_name> \--force \--debug

Deleting providers:

devpod provider delete <provider\_name>

Please that you need to delete your workspaces under a particular provider _before_ you delete that provider.

### Final Thoughts

Okay…that was A LOT to take in. When I started playing around with DevPod, I had no idea that it would turn into a week-long obsession taking up my every waking moment (and possibly my dreams). But this was a really fun obsesison and I learned a ton of cool things.

The overall verdict is that I really like DevPod. There are a few areas where documentation could be a bit clearer, but let’s face it: documentation is HARD. Speaking from experience.

DevPod is a solid product. I especially love the idea that I can choose to run my development environments either locally or remotely, and that I’m not beholden to GitHub Codespaces in order to run my dev containers remotely. If you haven’t checked it out, I definitely recommend that you do so.

Also, I can’t leave without giving a shoutout to Loft Labs’ (makers of DevPod) [Hrittik Roy](https://x.com/hrittikhere), who patiently addressed my wall of text Twitter DMs. 🤘

Now, please enjoy this photo of our dearly departed first pet rat, Susie, from 2021.

![Caramel colored rat on a gray cushion getting cuddles from her humans.](https://cdn-images-1.medium.com/max/800/1*WkTVSNIszsgTZCXvBsLhYw.png)

Susie the rat loved cuddles.

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [July 26, 2024](https://medium.com/p/678c71148793).

[Canonical link](https://medium.com/@adri-v/things-i-learned-about-devpod-after-obsessing-over-it-for-a-week-678c71148793)

Exported from [Medium](https://medium.com) on June 3, 2026.