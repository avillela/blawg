---
title: "So You Built A Custom Collector with the OpenTelemetry Collector Builder…Now What?"
slug: so-you-built-a-custom-collector-with-the-opentelemetry-collector-builder-now-what
description: "Things nobody tells you when you build your own OTel Collector distribution"
added: "Mar 14, 2025"
tags:
  - technical
  - observability
  - opentelemetry
  - otel-collector
---

# So You Built A Custom Collector with the OpenTelemetry Collector Builder…Now What?

#### Things nobody tells you when you build your own OTel Collector distribution

![A street scene at dusk with a clear sky transitioning from orange to blue. The street is lined with parked cars on both sides and a few cars driving down the road. Bare trees with no leaves are visible, and streetlights hang from wires above the street. There are houses and buildings along the sides of the street, and a stop sign is visible on the right side of the image. The image captures the calm and quiet atmosphere of a residential neighborhood during sunset.](https://cdn-images-1.medium.com/max/800/1*j_QBQhOP3XUqzIvu-TzB9g.jpeg)

Water tower at dusk.

There are plenty of blog posts out there that explain how to build your own [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector/) distribution, and you can even find the steps in the [official OpenTelemetry documentation](https://opentelemetry.io/docs/collector/custom-collector/).

Unfortunately, when I went to build my own Collector distribution, I was left with a few blanks to fill on my own. Today, I’ll discuss to do it myself, I ran into a few snags that we’re covered in any of the places I looked. (Maybe I didn’t look hard enough? 🤷‍♀️) So today, I will share with you some of the snags that I hit when I attempted to build my own Collector distribution, and what I learned along the way.

### Building a Collector distribution

To build an OpenTelemetry Collector distribution, you need to install the OpenTelemetry Collector Builder (OCB) tool. I followed the instructions in the OTel docs, and it worked pretty well.

My goal is to eventually run my Collector image in Kubernetes, so when I build my Collector image, I want to be able to build it in both `linux/arm64` and `linux/amd64` architectures, so I started with this:

if \[ $(uname -m) = x86\_64 \]; then  
    DISTRO="amd64"  
elif \[ $(uname -m) = aarch64 \]; then  
    DISTRO="arm64"  
fi  
  
echo "Distro is ${DISTRO}"  
  
curl --proto '=https' --tlsv1.2 -fL -o ocb \\  
https://github.com/open-telemetry/opentelemetry-collector/releases/download/cmd%2Fbuilder%2Fv0.102.1/ocb\_0.102.1\_linux\_${DISTRO}  
chmod +x ocb  
sudo mv ocb /usr/local/bin/ocb

#### Gotcha #1

Take note of the version of the OCB. I wanted to build a distribution based on version 0.102.1 of the Collector, so I had to make sure that the binary I pulled from GitHub was version 0.102.1

#### Gotcha #2

Oh, by the way, you also need to make sure that you [install Go](https://go.dev/doc/install) on your machine, because the OCB tool uses Go to build the Collector distribution. I was using a [Development (Dev) Container](https://containers.dev/) for my work, and guess what I didn’t have installed in my Dev Container? You guessed it: Go!

#### Gotcha #3

The OCB builds a Collector distribution based on a YAML configuration file which lists the Collector components (i.e. [extensions](https://opentelemetry.io/docs/collector/configuration/#service-extensions), [connectors](https://opentelemetry.io/docs/collector/configuration/#connectors), [receivers](https://opentelemetry.io/docs/collector/configuration/#receivers), [processors](https://opentelemetry.io/docs/collector/configuration/#processors), and [exporters](https://opentelemetry.io/docs/collector/configuration/#exporters)) that you wish to include.

Per the docs, I created a file called `builder-config.yaml`, and included the components that I needed. Mine looks like this:

\# Go modules for Collector core: https://pkg.go.dev/go.opentelemetry.io/collector  
\# Go modules for Collector contrib: https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib  
  
dist:  
  name: otelcol-kepler-benchmark  
  description: OTel Collector benchmark for Kepler  
  output\_path: ./\_build/col  
  
  
receivers:  
  \- gomod: go.opentelemetry.io/collector/receiver/otlpreceiver v0.102.1  
  \- gomod: github.com/open-telemetry/opentelemetry-collector-contrib/receiver/prometheusreceiver v0.102.0  
  \- gomod: github.com/open-telemetry/opentelemetry-collector-contrib/receiver/k8sobjectsreceiver v0.102.0  
  \- gomod: github.com/open-telemetry/opentelemetry-collector-contrib/receiver/k8sclusterreceiver v0.102.0  
  \- gomod: github.com/open-telemetry/opentelemetry-collector-contrib/receiver/kubeletstatsreceiver v0.102.0  
  
processors:  
  \- gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/cumulativetodeltaprocessor v0.102.0  
  \- gomod: go.opentelemetry.io/collector/processor/batchprocessor v0.102.1  
  \- gomod: go.opentelemetry.io/collector/processor/memorylimiterprocessor v0.102.1  
  \- gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/transformprocessor v0.102.0  
  \- gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/k8sattributesprocessor v0.102.0  
  \- gomod: github.com/open-telemetry/opentelemetry-collector-contrib/processor/resourceprocessor v0.102.0  
  
exporters:  
  \- gomod: go.opentelemetry.io/collector/exporter/otlpexporter v0.102.1  
  \- gomod: go.opentelemetry.io/collector/exporter/otlphttpexporter v0.102.1  
  \- gomod: go.opentelemetry.io/collector/exporter/debugexporter v0.102.1

If you look closely at my file, you’ll notice that I use a combination of components from the [Core](https://github.com/open-telemetry/opentelemetry-collector), and [Contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) Collector distributions.

You’ll notice that the components from the Core distribution come from the following Go package:

`go.opentelemetry.io/collector/exporter/otlpexporter`

The Contrib components, however, come from a _different_ Go package:

`github.com/open-telemetry/opentelemetry-collector-contrib`

Yeah. That threw me for a bit of a loop. Also, remember how I’m building based on `v0.102.1` of the Collector? Well, `v0.102.1` is available for the _Core_ components. Not so for the Contrib components. I had to use `v0.102.0`, because that was the closest version to what I needed.

How did I find this? I have enough Go knowledge to be dangerous, and I started rooting around in the OTel Go packages. [This one for Core](https://pkg.go.dev/go.opentelemetry.io/collector), and [this one for Contrib](https://pkg.go.dev/github.com/open-telemetry/opentelemetry-collector-contrib). Be sure to bookmark these, because they’re handy. You can find the component names and versions.

> **_💡_ REFRESHER:** _The_ _Core distribution is a bare-bones distribution of the Collector, and contains a base set of_ [_extensions_](https://opentelemetry.io/docs/collector/configuration/#service-extensions)_,_ [_connectors_](https://opentelemetry.io/docs/collector/configuration/#connectors)_,_ [_receivers_](https://opentelemetry.io/docs/collector/configuration/#receivers)_,_ [_processors_](https://opentelemetry.io/docs/collector/configuration/#processors)_, and_ [_exporters_](https://opentelemetry.io/docs/collector/configuration/#exporters)_. The Contrib distribution extends the Core distribution, and includes components created by third-parties (including vendors and individual community members), that are useful to the OpenTelemetry community at large._

### I built it…now what?

Cool. I built my Collector distribution. Yayyyyy! It created a Collector binary for me. Double-yayyyyy! But…um…I need to run this thing in Kubernetes. Which means that it needs to be containerized. And guess what? I couldn’t find any documentation on how to build a Collector container.

But I did find the Collector Dockerfile in the [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/otelcontribcol/Dockerfile) repository on GitHub:

FROM alpine:latest AS prep  
RUN apk --update add ca-certificates  
  
FROM scratch  
  
ARG USER\_UID=10001  
ARG USER\_GID=10001  
USER ${USER\_UID}:${USER\_GID}  
  
COPY --from=prep /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt  
COPY otelcontribcol /  
EXPOSE 4317 55680 55679  
ENTRYPOINT \["/otelcontribcol"\]  
CMD \["--config", "/etc/otel/config.yaml"\]

This Dockerfile copies the OpenTelemetry Collector binary that I built with the OCB into the Dockerfile. Short and sweet.

#### Gotcha #4

Uh…but I built my Collector distribution on an arm64 machine. I need to do a multi-arch Docker build, so that I can run this both locally and also on Kubernetes. My Kubernetes nodes are amd64, so I need to build a Docker image that is for arm64 WITH a Go binary built for arm64 architectures as well. Awwww, CRAP. 💩

LUCKILY! My former colleague and friend, [Jacob Aronoff](https://medium.com/u/d943403d097d), who is one of the maintainers of the [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/), came to my rescue with this Dockerfile:

Here, we build the Collector distribution INSIDE the Dockerfile, so the Go binary gets built using the correct architecture. No fuss, no muss.

I won’t pretend to understand all the fancy Dockerfile stuff going on, but I can admire the fact that the resulting image is as minimalistic as possible, because it uses [multi-stage Docker builds](https://docs.docker.com/build/building/multi-stage/). Very elegant!

#### Gotcha #5

Unfortunately, it didn’t work out of the box, because of how I configured my `builder-config.yaml` file. My builder produces a binary called `otelcol-kepler-bechmark` inside a folder called `_build/col`.

So I altered the file and ended up with this as my final Dockerfile:

What’s different?

*   **Updated** `**lines 8 and 9**` **(original file)**: My builder config file was called `builder-config.yaml`, not `manifest.yaml`, and my Collector config file is called `otelcol-config.yaml`, not `config.yaml`, so I updated the names accordingly.
*   **Removed** `**lines 9, 10, 11**` **(original file):** Jacob said that I probably didn’t need those lines, and he was right!
*   **Added** `**line 12**`**.** I don’t know why, but Docker was complaining that `./_build/col` didn’t exist, so I created that directory, and that made Docker happy.
*   **Added some more ports on** `**line 30**`**.** The Dockerfile from opentelemetry-collector-contrib also included ports `55680` and `55679`, so I threw them in for good measure.
*   **Fixed the entrypoint on** `**line 25**`**:** After a lot of Dockerfile debugging (i.e. me logging into the container instance and rooting around), I realized that my binary was actually located at `/otelcol/otelcol-kepler-benchmark`, and not at `/otelcol`, so I fixed that.
*   **Removed** `**line 15**` **(original file):** That validation step was causing me issues, so I removed it. In hindsight, it’s probably because the path to the validator was wrong. I have a feeling that the line should be:

RUN --mount=type\=cache,target=/root/.cache/go-build ./\_build/col/otelcol-kepler-benchmark validate --config config.yaml

I haven’t tried it. It’s 2:15am on [Pi Day](https://en.wikipedia.org/wiki/Pi_Day) (aka the best day of the year, because PIE IS AWESOME) as I write this and I’m sleepy. But I also wanted to do this brain dump ASAP before I forgot all the cool stuff I learned. Anyway, feel free to give it a whirl and see if it works.

### Built, at last!

Finally, finally, I was able to build my Dockerfile. Since I needed to do a multi-architecture build, I did it like this:

GH\_TOKEN=<your\_github\_token>  
GH\_USERNAME=<your\_github\_username>  
  
echo $GH\_TOKEN | docker login ghcr.io -u $GH\_USERNAME --password-stdin  
cd src/ocb  
  
\# Enable Docker multi-arch builds  
docker run -it --rm --privileged tonistiigi/binfmt --install all  
docker buildx create --name mybuilder --use  
  
\# Build Docker file for linux/arm64 and linux/amd64  
docker buildx build --push \\  
  -t ghcr.io/${GH\_USERNAME}/otelcol-kepler-benchmark-0.102.1:0.1.0 \\  
  --platform=linux/arm64,linux/amd64 .

The last line of this script will perform a multi-architecture build of the Dockerfile, and then will push it to [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry). If you use a different Container registry you’ll need to alter it accordingly.

Also, when you reference this image in your Kubernetes manifest, make sure that your registry either public, or if you’re using a [private registry, make sure that you do the appropriate setup in Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) (sorry, that’s out of scope for this blog post).

In my case, I’m deploying my OpenTelemetry Collector via the [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/), so I’m sticking the image name in my [OpenTelemetryCollector resource](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api/opentelemetrycollectors.md#opentelemetryiov1beta1). You can check out [OpenTelemetryCollector YAML](https://gist.github.com/avillela/dc37ff0853a12200567f961ef28fa6fc). The Collector image is `line 15`. It’s a long-ass file, so I’m not embedding the whole file.

💡 Want to learn more about the OTel Operator? Check out my blog series on the OTel Operator:

[**OpenTelemetry Operator**  
_Edit description_adri-v.medium.com](https://adri-v.medium.com/list/0ee6378d630a "https://adri-v.medium.com/list/0ee6378d630a")[](https://adri-v.medium.com/list/0ee6378d630a)

#### Gotcha #6

I initially had trouble (translation: Adriana spent 3 hours banging her head against the wall) getting the multi-architecture build working on my work M3 Mac running [Podman](https://podman.io), so I finally relented and ran the build on my personal M1 Mac running Docker Desktop with no issues.

A few days later, I updated my Podman and also cleaned up my Podman volumes, and “micraculously” (translation: Adriana should’ve done this sooner but was too lazy to do it), my multi-architecture build worked.

Moral of the story, update your software and clean up your damned volumes on your containerization tool.

### Did the build actually work?

You probably want to test your newly-built Docker image (always a good idea). In which case I would suggest that you build the image and output it to Docker (so you can run it locally). And probably before you push it to your container registry.

\# Build image without pushing to your container registry  
docker buildx build --no-cache --load \\  
  -t ghcr.io/${GH\_USERNAME}/otelcol-kepler-benchmark-0.102.1:0.1.0 \\  
  --platform=linux/arm64 .

At build time, the Dockerfile copies a Collector `config.yaml` into the image, and passes it in as runtime parameter. It’s bare bones and doesn’t test all of the components (in the real world, you probably should feed it a config with all of the components you’re including). I just wanted to make sure that it didn’t blow up completely.

Here’s my bare bones `config.yaml`:

\# Minimalistic OTel Collector Config file to test the Collector build  
receivers:  
  otlp:  
    protocols:  
      grpc: {}  
      http: {}  
  
  
processors:  
  cumulativetodelta: {}  
  batch: {}  
  
  \# Prevent out of memory (OOM) situations on the Collector  
  memory\_limiter:  
    check\_interval: 1s  
    limit\_percentage: 70  
    spike\_limit\_percentage: 30  
  
  
exporters:  
  debug:  
    verbosity: detailed  
  
service:  
  pipelines:  
    traces:  
      receivers: \[ otlp \]  
      processors: \[ memory\_limiter, batch \]  
      exporters: \[ debug \]  
    metrics:  
      receivers: \[ otlp \]  
      processors: \[ memory\_limiter, cumulativetodelta, batch \]  
      exporters: \[ debug \]  
    logs:  
      receivers: \[ otlp \]  
      processors: \[ memory\_limiter, batch \]  
      exporters: \[ debug \]

And after I built my Dockerfile, I fired up my brand-new Collector:

docker run -it --rm -p 4317:4317 -p 4318:4318 \\  
  ghcr.io/avillela/otelcol-kepler-benchmark-0.102.1:0.1.1 \\  
  "bin/bash"

Because the `config.yaml` was copied into the image at build time, I don’t need to specify a `config.yaml`. But if you can totally override it. So if you want to test it out with a your own `config.yaml`, you’d run it like this:

docker run -it \--rm -p 4317:4317 -p 4318:4318 \\  
    -v /path/to/config.yaml:/etc/otelcol-contrib/config.yaml \\  
    \--name otelcol \\  
    ghcr.io/avillela/otelcol-kepler-benchmark\-0.102.1:0.1.1  \\  
    "--config=/etc/otelcol-contrib/config.yaml"

Keep in mind that your Collector image name would be different from mine.

### Final Thoughts

I’ve got to admit that this little exercise took a lot longer than I expected. I’m doing this work as part of a [talk that I’m giving at KubeCon EU](https://kccnceu2025.sched.com/event/1txEL/how-green-is-my-opentelemetry-collector-nancy-chauhan-student-adriana-villela-dynatrace) in April, alongside the very awesome [Nancy Chauhan](https://medium.com/u/293018a515fb), and while this was definitely a deeper rabbit hole than I planned to jump into, I am super grateful for the learning experience. My brain is fried, but my heart is happy, because I learned cool things, and I get to share them with y’all.

And that’s a wrap. Thanks for hanging out. I will now leave you with a photo of lovely, yet rarely-photographed Buffy:

![A curious pet rat with soft, light brown fur and large, dark eyes peers out from a cozy nest made of shredded paper and fabric. Its delicate whiskers are forward, and its tiny paws rest on the edge of its nest, showing its inquisitive nature.](https://cdn-images-1.medium.com/max/800/1*y0pFSfs5gLy30qRZWRoTXQ.jpeg)

Buffy is enjoying some time with her favourite humans.

Until next time, peace, love, and code. ✌️❤️👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [March 14, 2025](https://medium.com/p/6588952ee6c5).

[Canonical link](https://medium.com/@adri-v/so-you-built-a-custom-collector-with-the-opentelemetry-collector-builder-now-what-6588952ee6c5)

Exported from [Medium](https://medium.com) on June 3, 2026.