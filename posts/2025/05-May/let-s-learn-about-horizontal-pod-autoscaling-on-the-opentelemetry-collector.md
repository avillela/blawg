---
title: "Let’s Learn About Horizontal Pod Autoscaling on the OpenTelemetry Collector"
slug: let-s-learn-about-horizontal-pod-autoscaling-on-the-opentelemetry-collector
description: "Configuring HPA on Collectors managed by the OpenTelemetry Operator"
added: "May 24, 2025"
tags:
  - technical
  - kubernetes
  - opentelemetry
  - observability
  - otel-operator
  - otel-collector
  - "2025"
---



![A close-up image of a dandelion seed head. The dandelion is in full seed stage, with numerous white, fluffy seeds radiating from the center. The background consists of green leaves and grass, slightly out of focus, highlighting the intricate details of the dandelion seeds.](https://cdn-images-1.medium.com/max/800/1*C_4HUG9iBM6_Wwd3Am8A_A.jpeg)

Close-up for a dandelion. Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

A couple of weeks back, I learned that [OpenTelemtry (OTel) Collector](https://opentelemetry.io/docs/collector/) managed by the [OTel Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/) have built-in support for [horizontal pod autoscaling](https://spacelift.io/blog/kubernetes-hpa-horizontal-pod-autoscaler), or HPA. In case you’re not familiar, HPA enables you to increase or decrease the number of replicas (copies) of your Kubernetes pods, based on a set of metrics. These metrics are typically CPU and/or memory consumption.

HPA is super handy because it ensures that you can scale up when demand on resources is higher (think Black Friday or Christmas shopping season), and scale down when demand on resources is low. This not only reduces unnecessary costs, it’s also good for the environment.

Having the OTel Operator manage HPA functionality for the OTel Collector is super convenient, because it means that you don’t have to create a separate Kubernetes `HorizontalPodAutoscaler` resource yourself, for autoscaling your Collector.

Autoscaling the Collector is fairly straightforward, but for an HPA newbie like me, it was a bit of a learning curve, and I ran into some snags. So today I will share my learnings with you, so that your journey to OTel Collector HPA managed by the OTel Operator is a bit smoother than mine. ✨

Let’s do this!

### Autoscaling the Collector

Since the OTel Collector is managed by the OTel Operator, we will be defining our HPA configurations in the `OpenTelemetryCollector` resource that comes with the Operator.

To configure autoscaling, you must first start by defining your [resource requests and limits](https://sysdig.com/blog/kubernetes-limits-requests/) by adding a `spec.resources` configuration section to your `OpenTelemetryCollector` YAML:

resources:  
  limits:  
    cpu: 100m  
    memory: 128Mi  
  requests:  
    cpu: 100m  
    memory: 64Mi

The `limits` configuration says that the container (the Collector container, in our case) can’t consume more than 100 millicores (0.1 core) of CPU, and 128Mi (mebibytes, where 1 mebibyte == 1024 kilobytes).

The `requests` configuration specifies the minimum guaranteed amount of resources allocated for the container. In our case, 100 millicores of CPU and 64 mebibytes of RAM.

> **✨ NOTE:** The values you set for limits and requests depend on your own setup.

And then you can configure your autoscaling rules, by adding a `spec.autoscaler` configuration to your `OpenTelemetryCollector` resource YAML, like this:

autoscaler:  
  minReplicas: 1  
  maxReplicas: 2  
  targetCPUUtilization: 50  
  targetMemoryUtilization: 60

The above configuration says that we will start with 1 replica, and scale up to 2 replicas if the pod’s CPU utilization exceeds 50% **_OR_** the pod’s memory utilization exceeds 60%.

> **✨ NOTE:** The values you set for autoscaling depend on your own setup.

Keep in mind that [HPA only applies to StatefulSets and Deployments in Kubernetes](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/), so make sure that your Collector’s `spec.mode` is either `deployment` or `statefulset`.

Putting it all together, the start of yor `OpenTelemetryCollector` YAML should look something like this:

apiVersion: opentelemetry.io/v1beta1  
kind: OpenTelemetryCollector  
metadata:  
  name: otelcol  
  namespace: opentelemetry  
spec:  
  mode: statefulset  
  image: otel/opentelemetry-collector-contrib:0.126.0  
  serviceAccount: otelcontribcol  
  autoscaler:  
    minReplicas: 1  
    maxReplicas: 2  
    targetCPUUtilization: 50  
    targetMemoryUtilization: 60  
  resources:  
    limits:  
      cpu: 100m  
      memory: 128Mi  
    requests:  
      cpu: 100m  
      memory: 64Mi  
...

For the full Collector YAML, [check out my code on GitHub](https://github.com/avillela/how-green-is-my-otel-collector/blob/cc9e53c88f209a9d1fba9bcd68aca6bb6ca0edbe/src/k8s/02-otel-collector-dt.yaml#L16-L27).

Once you deploy an `OpenTelemetryCollector` with HPA enabled, the Operator will create a `HorizontalPodAutoscaler` resource for your Collector in Kubernetes.

This the screen shot (I’m using [k9s](https://k9scli.io)) shows the output of `kubectl describe hpa` for the `HorizontalPodAutoscaler` resource created as part of my `OpenTelemetryCollector` resource deployment:

![Kubernetes Horizontal Pod Autoscaler (HPA) status for the OpenTelemetry Collector in k9s, showing metrics, scaling limits, current/desired replicas, conditions, and events.](https://cdn-images-1.medium.com/max/800/1*MJ3o6Iz5PGBjJCX1K_190A.png)

Running “kubectl describe hpa”

### Gotchas

As I said before, I’m a bit of a newbie when it comes to HPA, and I ran into a few snags along the way before I got HPA working for my Collector.

The main thing I learned is that in order for HPA to work, you need a [Metrics Server](https://github.com/kubernetes-sigs/metrics-server) installed in your Kubernetes cluster. Some fun facts:

*   Managed Kubernetes clusters like Google’s [GKE](https://cloud.google.com/kubernetes-engine?hl=en) and Microsoft Azure’s [AKS](https://azure.microsoft.com/en-us/products/kubernetes-service) will install one automagically as part of cluster provisioning.
*   [EKS (AWS) doesn’t come installed with a Metrics Server by default](https://resources.realtheory.io/docs/how-to-verify-the-metrics-server-is-installed-in-the-cluster).
*   If you provision your own Kubernetes clusters manually (i.e. not a managed service) or run Kubernetes locally à la [MiniKube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Fx86-64%2Fstable%2Fbinary+download) or [KinD](https://kind.sigs.k8s.io), then you’ll have to install a Metrics Server yourself.

> **NOTE:** If your managed Kubernetes cluster doesn’t come with a Metrics Server installed, [check out this article from Spacelift](https://spacelift.io/blog/kubernetes-hpa-horizontal-pod-autoscaler).

To [check if your Metrics Server is installed on your Kuberntes cluster](https://resources.realtheory.io/docs/how-to-verify-the-metrics-server-is-installed-in-the-cluster), you can run:

kubectl get pods --all-namespaces | grep metrics-server

The Metrics Server pod is typically found in the `kube-system` namespace.

Unfortunately, in my case, the Metrics Server was installed, but it was erring out, which meant that HPA wasn’t working. When I peered into on the Metrics Server’s pod logs, I saw this error:

"Failed to scrape node" err\="request failed, status: \\"401 Unauthorized\\""

Googling the above error message did NOTHING for me. I did at one point question whether or not it was an issue with my GKE version (which it wasn’t, though initial signs seemed to point that way), but after a bit of experimentation, it turns out that my Metrics Server was erring out after I disabled logging on my GKE cluster. I’d done that because those logs really cause up Google Cloud costs to skyrocket, I was trying not to burn through my free cloud credits. So much for that.

Anyway, I hope this saves you a bit of stress if you ever encounter this issue.

### Final Thoughts

Scaling your OTel Collector pods using the Horizontal Pod Autoscaler is super handy for ensuring that your Collector isn’t strapped for resources when things get super busy, or isn’t idling away when things are less busy. Plus it’ll save you money and the environment at the same time. And being able to configure it directly on the `OpenTelemetryCollector` resource is super handy because it means fewer moving parts to worry about.

And now I will leave you with a photo of this very sassy Canada Goose.

![A Canada goose stands on a grassy area with wings spread wide. The goose has a black head and neck with a white patch on its face, and a grayish-brown body. The background includes a large tree trunk and scattered yellow dandelions among the green grass and foliage.](https://cdn-images-1.medium.com/max/800/1*9mG6U0E_RCOxUqu8U0g2pA.jpeg)

Canada Goose flapping its wings. Photo by [Adriana Villela](https://instagram.com/adrianamvillela).

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [May 24, 2025](https://medium.com/p/8f3b7cb54409).

[Canonical link](https://medium.com/@adri-v/lets-learn-about-horizontal-pod-autoscaling-on-the-opentelemetry-collector-8f3b7cb54409)

Exported from [Medium](https://medium.com) on June 3, 2026.