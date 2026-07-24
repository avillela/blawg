---
title: "Multi-Architecture Builds Are Possible With Docker Compose…Kind Of"
slug: multi-architecture-builds-are-possible-with-docker-compose-kind-of
description: "Workarounds of an Apple Silicon Mac user"
added: "Feb 21, 2025"
tags:
  - technical
  - docker
---

# Multi-Architecture Builds Are Possible With Docker Compose…Kind Of

#### Workarounds of an Apple Silicon Mac user

![A yellow fire hydrant is partially buried in snow. The hydrant has a face drawn on it with black marker, including eyes, a nose, and a mouth. The background shows a snow-covered ground and a gray wall. The image presents a whimsical scene where a fire hydrant appears to have a playful expression in a snowy setting.](https://cdn-images-1.medium.com/max/800/1*b-noISvl4P9AySVhcj8Hrw.jpeg)

This fire hydrant is hamming it up for the camera. Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

Having an [Apple Silicon](https://en.wikipedia.org/wiki/Apple_silicon) Mac (which uses [ARM architecture](https://en.wikipedia.org/wiki/ARM_architecture_family)) can be both a blessing and a curse. On the one hand, it’s fast, doesn’t overheat on my lap, and I can load it up with a bunch of [Development (Dev) Containers](https://containers.dev) running simultaneously. (Which, incidentally, I’m doing as I write this post.) On the other hand, it seems like every other day I hit some sort of technical snag because `<insert thing I’m trying to do>` isn’t supported for ARM architectures. ARGH! 😖

One snag that I hit pretty early on in my Apple Silicon journey was building Docker images. One Friday night, I was messing around on Kubernetes. I was trying to deploy an Python app to a Kubernetes cluster running on Google Cloud. I built the image locally, and pushed it to my container registry of choice. I created a Kubernetes `[deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)`, referencing the image that I’d pushed to the container registry. It failed. Why?

Because the image had been built using on an ARM64 machine (my Apple Silicon machine). My Kubernetes cluster, however, was running on a node in which the underlying virtual machine was an AMD64 machine. Crap.

Luckily, there was a solution: `docker buildx`.

### What is docker buildx?

Never heard of `docker buildx`? Neither had I, until I started playing around with multi-architecture Docker builds out of necessity (see: my sob story above). Big shoutout to [this post](https://blog.jaimyn.dev/how-to-build-multi-architecture-docker-images-on-an-m1-mac/), which put in the right path on this little adventure.

Fun fact: `docker build` is actually an alias for `docker buildx build`. The [buildx](https://docs.docker.com/build/concepts/overview/#buildx) command interprets the build options and sends the build request to this thing called the [BuildKit](https://docs.docker.com/build/concepts/overview/#buildkit). The BuildKit is does the actual work — i.e. executes the build workloads.

By default, Docker comes installed with one builder. So, running `docker bulildx ls` on a machine with newly-installed Docker, you would expect to see one builder:

NAME/NODE               DRIVER/ENDPOINT                   STATUS    BUILDKIT   PLATFORMS  
default                 docker                                                   
 \\\_ default              \\\_ default                       running   v0.18.2    linux/arm64, linux/ppc64le, linux/s390x, linux/riscv64, (5 more)

One builder means that Docker can only build for one architecture at a time. If I wanted to build for more than one architecture at a time, say AMD64 and ARM64, I would need…TWO builders.

Fortunately, Docker lets us add more builders, like this: `docker buildx create --use`. Now when we run `docker buildx ls` again, we end up with two builders:

NAME/NODE               DRIVER/ENDPOINT                   STATUS    BUILDKIT   PLATFORMS  
relaxed\_driscoll\*       docker-container                                         
 \\\_ relaxed\_driscoll0    \\\_ unix:///var/run/docker.sock   running   v0.20.0    linux/arm64, linux/ppc64le, linux/s390x, linux/riscv64, (5 more)  
default                 docker                                                   
 \\\_ default              \\\_ default                       running   v0.18.2    linux/arm64, linux/ppc64le, linux/s390x, linux/riscv64, (5 more)

Note that `relaxed_driscoll` is a totally random name. Expect that your second builder name will be totally different from mine. Now that we have two builders, we can execute two builds in parallel: one for each architecture. Cool. But how do we do that?

Like this:

docker buildx build \\  
    --push \\  
    -t <my\_image\_tag> \\  
    --platform=linux/arm64,linux/amd64 \\  
    <dockerfile\_path>

This builds images for both ARM64 and AMD64 architectures, and then pushes both images to the configured Docker registry.

> ⚠️ **NOTE:** Remember that before you can push the image to a registry, you must log into that registry first. For example, to log into [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) (GHCR): `echo $GH_TOKEN | docker login ghcr.io -u $GH_USER --password-stdin`. Where `$GH_TOKEN` is your [GitHub personal access token](https://github.com/settings/tokens) and `$GH_USER` is your GitHub user ID or organization name.

### Cool. Can I do this with Docker Compose too?

That’s all well and good, but what if I need to build multiple containers? I mean, I can run `docker buildx build` on each Dockerfile, but UGHHHHH…that’s so annoying.

[Docker Compose](https://docs.docker.com/compose/) is much nicer and cleaner when it comes to building Docker images. After all, all you have to do is run `docker compose build`, and it will build all of the images in your `docker-compose.yaml` file. Or you can specify which images from your `docker-compose.yaml` you want it to build. So elegant.

Which begs the question: _can we do multi-architecture builds with Docker Compose_? The answer is: _yes-ish_. 🙃

So, here’s the deal. You can’t run multi-architecture builds using the `docker compose` command. If you run `docker compose build -h`, you’ll notice that there’s no `--platform` flag. Crap.

But…you can can run a command called `docker buildx bake` to build images from your `docker-compose.yaml`!

Now, before you get all excited, you need to tweak your `docker-compose.yaml` file first. Namely, you need to add an `x-bake` section and a `tags` section to the `build` configuration, like this:

services:  
  my-awesome-service:  
    container-name: my-awesome-service-container  
    image: my-awesome-image-name  
    build:  
      context: <dockerfile\_context>  
      dockerfile: Dockerfile  
      tags:  
        \- ghcr.io/<your\_github\_user\_or\_org>/<image\_name>:<image\_version>  
      x-bake:  
        platforms:  
          \- linux/amd64  
          \- linux/arm64  
...

Let’s dissect this a bit:

*   **tags.** Since we’re pushing to an container registry, we need to tag the image according to the requirements of your container registry. For example, for GHCR, you would tag it as: `ghcr.io/<user_github_user_or_org>/<image_name>:<image_version>`.
*   **x-bake**: The `x-bake` fields are read by `docker buildx bake --push` (more on that shortly), and allow you to specify the target platforms to build for. More info on x-bake [here](https://stackoverflow.com/a/77958767).

Once you’ve made the required updates, you can build and push your images as follows:

\# Run this if you only have one builder. Check by running \`docker buildx ls\`  
\# Otherwise, you can skip this.  
docker buildx create --use  
  
\# Build and push the image to your container registry  
docker buildx bake --push

Note that the the `docker-compose.yaml` file is conspicuously absent from the bake command. Where did it go? Well, `docker buildx bake --push` looks for `docker-compose.yaml` in the current directory. Alternatively, you could specify the location of that file like this:

docker buildx bake --push -f <path\_to\_docker\_compose\_yaml>

Again, make sure that you’ve authenticated against your container registry before running `docker buildx bake --push`.

Once you’ve built and pushed your images, you can check them out in your container registry. This is what one of my multi-architecture images looked like in GHCR:

![Webpage displaying version 0.1.0 of the ‘py-otel-server’ package from the ‘green-collector’ repository. It includes a SHA256 hash and Docker pull commands for linux/amd64, linux/arm64, and unknown/unknown architectures, each with a unique SHA256 hash.](https://cdn-images-1.medium.com/max/800/1*8CXmR8BhgfsTxwqCvvd3EQ.png)

Multi-architecture build of the same Docker image

### Final Thoughts

It’s nice to know that even though it can be infuriating to deal with the differences between ARM64-based machines and AMD64-based machines, there are nice ways to work around some of these issues that won’t make you want to tear your hair out.

It’s funny…I learned about `docker buildx` a couple of years back, when I first ran into the multi-architecture build issue, but I didn’t full appreciate it until I needed to search for a more elegant way to build multiple Docker images at once. (Mostly because I’m lazy.) Anyway, I we were as excited about this solution as I was!

And now, please enjoy this photo of Katie Jr, hamming it up for the camera.

![A person is gently holding a small, dark-colored rat in both hands. The rat’s face is visible, with its ears perked up and whiskers prominent. The person is wearing a red, ribbed sweater, and a silver ring is visible on one of the person’s fingers. The image captures a moment of interaction between a human and their pet, highlighting the gentle and careful handling of the small animal.](https://cdn-images-1.medium.com/max/800/1*8HCV9L8hdL88Z2gaifOYMA.jpeg)

Katie Jr. is such a ham of a rat. ❤️

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [February 21, 2025](https://medium.com/p/2a4e8d166c56).

[Canonical link](https://medium.com/@adri-v/multi-architecture-builds-are-possible-with-docker-compose-kind-of-2a4e8d166c56)

Exported from [Medium](https://medium.com) on June 3, 2026.