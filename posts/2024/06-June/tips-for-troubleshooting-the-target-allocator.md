---
title: "Tips for Troubleshooting the Target Allocator"
slug: tips-for-troubleshooting-the-target-allocator
description: "What to do when your metrics aren’t being scraped by the OTel Operator’s Target Allocator"
added: "Jun 25, 2024"
tags:
  - technical
  - opentelemetry
  - observability
  - otel-collector
  - otel-operator
---


![Glass pyramid at the Louvre](https://cdn-images-1.medium.com/max/800/1*RDoJeOKpyqvdYe9NGtS04w.png)

Looking up at the glass pyramid at the Louvre, as seen from the inside. Photo by [Adriana Villela](https://adri-v.medium.com).

If you’ve enabled [Target Allocator](https://adri-v.medium.com/lets-learn-about-the-otel-operator-s-target-allocator-47a2b1f07562) service discovery on the [OTel Operator](https://adri-v.medium.com/list/opentelemetry-operator-0ee6378d630a), and the Target Allocator is failing to discover scrape targets, then there are a few troubleshooting steps that you can take to help you understand what’s going on and to get things back on track. I put these together based on some of my own experience. May these help you on your own journey!

### Troubleshooting Steps

Before we start, be sure to check out [this repo](https://github.com/avillela/otel-target-allocator-talk), which, among other things, includes examples of configuring the `OpenTelemetryCollector` custom resource (CR) to use the Target Allocator’s service discovery functionality, along with examples of `[ServiceMonitor](https://prometheus-operator.dev/docs/operator/design/#servicemonitor)` and `[PodMonitor](https://prometheus-operator.dev/docs/user-guides/getting-started/#using-podmonitors)` resource definitions.

#### 1- Did you deploy all of your resources to Kubernetes?

Okay…you may be laughing at me for how obvious this sounds, but it totally happened to me. In fact, it happened while I was adding the `[PodMonitor](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/04a-pod-monitor.yml)` example to [my repo](https://github.com/avillela/otel-target-allocator-talk).

After checking to see if the service discovery was working per step 2 below (spoiler: it wasn’t), I went through all of the other troubleshooting steps. Except for this one, of course. 🤬 According to the [API documentation](https://github.com/prometheus-operator/prometheus-operator/blob/main/Documentation/api.md#monitoring.coreos.com/v1.PodMonitor), all of my configurations _looked_ correct. Yeah…too bad the resource wasn’t actually deployed.

In a flash of inspiration, I decided to check to make sure that the `PodMonitor` was _actually deployed to my Kubernetes cluster_, and lo and behold…it was missing. After I deployed the `PodMonitor` (for realsies, this time), it worked. At least I take comfort in the fact that my configurations were correct the whole time! 🫠

So yeah…moral of the story: make sure you actually deploy your resources.

#### 2- Do you know if metrics are actually being scraped?

After you’ve deployed all of your resources to Kubernetes, make sure that the Target Allocator is discovering scrape targets from your `[ServiceMonitor](https://prometheus-operator.dev/docs/operator/design/#servicemonitor)`(s) or `[PodMonitor](https://prometheus-operator.dev/docs/user-guides/getting-started/#using-podmonitors)`(s).

After you’ve deployed all of your resources to Kubernetes, check to make sure that the Target Allocator is actually picking up your `[ServiceMonitor](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/#:~:text=The%20ServiceMonitor%20is%20used%20to,build%20the%20required%20Prometheus%20configuration.)`(s) and/or `[PodMonitor](https://prometheus-operator.dev/docs/user-guides/getting-started/#using-podmonitors)`(s). Fortunately, you can check this pretty easily.

Let’s suppose that you have this `ServiceMonitor` definition:

apiVersion: monitoring.coreos.com/v1  
kind: ServiceMonitor  
metadata:  
  name: sm-example  
  namespace: opentelemetry  
  labels:  
    app.kubernetes.io/name: py-prometheus-app  
    release: prometheus  
spec:  
  selector:  
    matchLabels:  
      app: my-app  
  namespaceSelector:  
      matchNames:  
        \- opentelemetry  
  endpoints:  
    \- port: prom  
      path: /metrics  
    \- port: py-client-port  
      interval: 15s  
    \- port: py-server-port

and this `Service` definition:

apiVersion: v1  
kind: Service  
metadata:  
  name: py-prometheus-app  
  namespace: opentelemetry  
  labels:  
    app: my-app  
    app.kubernetes.io/name: py-prometheus-app  
spec:  
  selector:  
    app: my-app  
    app.kubernetes.io/name: py-prometheus-app  
  ports:  
    \- name: prom  
      port: 8080

First, set up a `port-forward` in Kubernetes, so that you can expose the Target Allocator service:

kubectl port-forward svc/<otel\_collector\_resource\_name>-targetallocator -n <namespace> 8080:80

Where `<otel_collector_resource_name>` is the value of `metadata.name` in your `OpenTelemetryCollector` CR, and `<namespace>` is the namespace to which the `OpenTelemetryCollector` CR is deployed.

> **NOTE:** _You can also get the service name by running_ `_kubectl get svc -l app.kubernetes.io/component=opentelemetry-targetallocator -n <namespace>_`_._

Based on [the example repository](https://github.com/avillela/otel-target-allocator-talk), yours would look like this:

kubectl port-forward svc/otelcol-targetallocator -n opentelemetry 8080:80

Next, get a list of jobs registered with the Target Allocator:

curl localhost:8080/jobs | jq

Your sample output should look something like this:

{  
  "serviceMonitor/opentelemetry/sm-example/1": {  
    "\_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F1/targets"  
  },  
  "serviceMonitor/opentelemetry/sm-example/2": {  
    "\_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F2/targets"  
  },  
  "otel-collector": {  
    "\_link": "/jobs/otel-collector/targets"  
  },  
  "serviceMonitor/opentelemetry/sm-example/0": {  
    "\_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets"  
  },  
  "podMonitor/opentelemetry/pm-example/0": {  
    "\_link": "/jobs/podMonitor%2Fopentelemetry%2Fpm-example%2F0/targets"  
  }  
}

Where `serviceMonitor/opentelemetry/sm-example/0` represents one of the `Service` ports that the `ServiceMonitor` picked up:

*   `opentelemetry` is the namespace in which the `ServiceMonitor` resource resides
*   `sm-example` is the name of the `ServiceMonitor`
*   `0` is one of the port endpoints matched between the `ServiceMonitor` and the `Service`

We see a similar story with the `PodMonitor`, which shows up as `podMonitor/opentelemetry/pm-example/0` in the `curl` output.

This is good news, because it tells us that the scrape config discovery is working!

You might also be wondering about the `otel-collector` entry. You might also be wondering about the `otel-collector` entry. This is happening because `[spec.config.receivers.prometheusReceiver](https://github.com/avillela/otel-target-allocator-talk/blob/4c0eb425c90187d584c9d03b51ad918b377014a3/src/resources/02-otel-collector.yml#L28-L32)` in the example `OpenTelemetryCollector` resource (which is named `otel-collector`) has self-scrape enabled:

prometheus:  
  config:  
    scrape\_configs:  
      \- job\_name: 'otel-collector'  
        scrape\_interval: 10s  
        static\_configs:  
        \- targets: \[ '0.0.0.0:8888' \]

We can take a deeper look into `serviceMonitor/opentelemetry/sm-example/0`, to see what scrape targets are getting picked up by running `curl` against the value of the `_link` output above:

curl localhost:8080/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F0/targets | jq

Sample output:

{  
  "otelcol-collector-0": {  
    "\_link": "/jobs/serviceMonitor%2Fopentelemetry%2Fsm-example%2F1/targets?collector\_id=otelcol-collector-0",  
    "targets": \[  
      {  
        "targets": \[  
          "10.244.0.11:8082"  
        \],  
        "labels": {  
          "\_\_meta\_kubernetes\_endpointslice\_name": "py-otel-client-svc-znvrz",  
          "\_\_meta\_kubernetes\_pod\_label\_app": "my-app",  
          "\_\_meta\_kubernetes\_pod\_node\_name": "otel-target-allocator-talk-control-plane",  
          "\_\_meta\_kubernetes\_endpointslice\_label\_endpointslice\_kubernetes\_io\_managed\_by": "endpointslice-controller.k8s.io",  
          "\_\_meta\_kubernetes\_service\_labelpresent\_app": "true",  
          "\_\_meta\_kubernetes\_endpointslice\_address\_target\_kind": "Pod",  
          "\_\_meta\_kubernetes\_endpointslice\_endpoint\_conditions\_terminating": "false",  
          "\_\_meta\_kubernetes\_pod\_container\_port\_number": "8082",  
          "\_\_meta\_kubernetes\_endpointslice\_labelpresent\_app": "true",  
          "\_\_meta\_kubernetes\_pod\_label\_pod\_template\_hash": "776d6686bb",  
          "\_\_meta\_kubernetes\_pod\_container\_image": "otel-target-allocator-talk:0.1.0-py-otel-client",  
          "\_\_meta\_kubernetes\_pod\_ip": "10.244.0.11",  
          "\_\_meta\_kubernetes\_pod\_controller\_name": "py-otel-client-776d6686bb",  
          "\_\_meta\_kubernetes\_pod\_controller\_kind": "ReplicaSet",  
          "\_\_meta\_kubernetes\_pod\_label\_app\_kubernetes\_io\_name": "py-otel-client",  
          "\_\_meta\_kubernetes\_endpointslice\_annotationpresent\_endpoints\_kubernetes\_io\_last\_change\_trigger\_time": "true",  
          "\_\_meta\_kubernetes\_service\_annotationpresent\_kubectl\_kubernetes\_io\_last\_applied\_configuration": "true",  
          "\_\_meta\_kubernetes\_pod\_ready": "true",  
          "\_\_meta\_kubernetes\_endpointslice\_endpoint\_conditions\_serving": "true",  
          "\_\_meta\_kubernetes\_pod\_annotation\_instrumentation\_opentelemetry\_io\_inject\_python": "true",  
          "\_\_meta\_kubernetes\_endpointslice\_port\_protocol": "TCP",  
          "\_\_meta\_kubernetes\_endpointslice\_label\_app": "my-app",  
          "\_\_meta\_kubernetes\_pod\_name": "py-otel-client-776d6686bb-7mchc",  
          "\_\_meta\_kubernetes\_pod\_annotationpresent\_instrumentation\_opentelemetry\_io\_inject\_python": "true",  
          "\_\_meta\_kubernetes\_endpointslice\_endpoint\_conditions\_ready": "true",  
          "\_\_meta\_kubernetes\_pod\_host\_ip": "172.24.0.2",  
          "\_\_meta\_kubernetes\_namespace": "opentelemetry",  
          "\_\_meta\_kubernetes\_pod\_labelpresent\_pod\_template\_hash": "true",  
          "\_\_meta\_kubernetes\_endpointslice\_port\_name": "py-client-port",  
          "\_\_meta\_kubernetes\_pod\_phase": "Running",  
          "\_\_meta\_kubernetes\_endpointslice\_label\_app\_kubernetes\_io\_name": "py-otel-client",  
          "\_\_meta\_kubernetes\_endpointslice\_port": "8082",  
          "\_\_meta\_kubernetes\_endpointslice\_address\_target\_name": "py-otel-client-776d6686bb-7mchc",  
          "\_\_meta\_kubernetes\_pod\_container\_name": "py-otel-client",  
          "\_\_meta\_kubernetes\_pod\_container\_port\_name": "py-client-port",  
          "\_\_meta\_kubernetes\_endpointslice\_address\_type": "IPv4",  
          "\_\_meta\_kubernetes\_pod\_uid": "bd68fa78-13f6-4377-bcfd-9bb95553f1f4",  
          "\_\_meta\_kubernetes\_service\_name": "py-otel-client-svc",  
          "\_\_meta\_kubernetes\_service\_label\_app\_kubernetes\_io\_name": "py-otel-client",  
          "\_\_meta\_kubernetes\_pod\_labelpresent\_app": "true",  
          "\_\_meta\_kubernetes\_service\_labelpresent\_app\_kubernetes\_io\_name": "true",  
          "\_\_meta\_kubernetes\_endpointslice\_label\_kubernetes\_io\_service\_name": "py-otel-client-svc",  
          "\_\_meta\_kubernetes\_endpointslice\_annotation\_endpoints\_kubernetes\_io\_last\_change\_trigger\_time": "2024-06-14T21:04:36Z",  
          "\_\_address\_\_": "10.244.0.11:8082",  
          "\_\_meta\_kubernetes\_endpointslice\_labelpresent\_kubernetes\_io\_service\_name": "true",  
          "\_\_meta\_kubernetes\_endpointslice\_labelpresent\_endpointslice\_kubernetes\_io\_managed\_by": "true",  
          "\_\_meta\_kubernetes\_service\_annotation\_kubectl\_kubernetes\_io\_last\_applied\_configuration": "{\\"apiVersion\\":\\"v1\\",\\"kind\\":\\"Service\\",\\"metadata\\":{\\"annotations\\":{},\\"labels\\":{\\"app\\":\\"my-app\\",\\"app.kubernetes.io/name\\":\\"py-otel-client\\"},\\"name\\":\\"py-otel-client-svc\\",\\"namespace\\":\\"opentelemetry\\"},\\"spec\\":{\\"ports\\":\[{\\"name\\":\\"py-client-port\\",\\"port\\":8082,\\"protocol\\":\\"TCP\\",\\"targetPort\\":\\"py-client-port\\"}\],\\"selector\\":{\\"app.kubernetes.io/name\\":\\"py-otel-client\\"}}}\\n",  
          "\_\_meta\_kubernetes\_pod\_labelpresent\_app\_kubernetes\_io\_name": "true",  
          "\_\_meta\_kubernetes\_pod\_container\_port\_protocol": "TCP",  
          "\_\_meta\_kubernetes\_service\_label\_app": "my-app",  
          "\_\_meta\_kubernetes\_endpointslice\_labelpresent\_app\_kubernetes\_io\_name": "true"  
        }  
      }  
    \]  
  }  
}

> **NOTE:** _The query parameter_ `_collector_id_` _in the_ `__link_` _field of the output above states that these are the targets pertain to_ `_otelcol-collector-0_` _(the name of the_ `_StatefulSet_` _created for the_ `_OpenTelemetryCollector_` _resource)._

_PS: Shoutout to_ [_this blog post_](https://trstringer.com/opentelemetry-target-allocator-troubleshooting/) _for educating me about this troubleshooting technique._

#### **3- Is the Target Allocator enabled? Is Prometheus service discovery enabled?**

If the `curl` commands above don’t show a list of expected `ServiceMonitor`s and `PodMonitor`s, then it’s time to dig a bit deeper.

One thing to remember is that just because you include the `targetAllocator` section in the `OpenTelemetryCollector` CR doesn’t mean that it’s enabled. You need to explicitly enable it. Furthermore, if you want to use [Prometheus service discovery](https://adri-v.medium.com/prometheus-opentelemetry-better-together-41dc637f2292), you must explicitly enable it:

*   Set `spec.targetAllocator.enabled` to `true`
*   Set `spec.targetAllocator.prometheusCR.enabled` to `true`

So that your `OpenTelemetryCollector` resource looks like this:

apiVersion: opentelemetry.io/v1beta1  
kind: OpenTelemetryCollector  
metadata:  
  name: otelcol  
  namespace: opentelemetry  
spec:  
  mode: statefulset  
  targetAllocator:  
    enabled: true  
    serviceAccount: opentelemetry-targetallocator-sa  
    prometheusCR:  
      enabled: true  
...

📝 See the full `OpenTelemetryCollector` [resource definition](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/02-otel-collector.yml).

#### **4- Did you configure a ServiceMonitor (or PodMonitor) selector?**

If you configured a `[ServiceMonitor](https://observability.thomasriley.co.uk/prometheus/configuring-prometheus/using-service-monitors/#:~:text=The%20ServiceMonitor%20is%20used%20to,build%20the%20required%20Prometheus%20configuration.)` selector, it means that the Target Allocator only looks for `ServiceMonitors` having a `metadata.label` that matches the value in `[serviceMonitorSelector](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr-1)`.

Suppose that you configured a `[serviceMonitorSelector](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr-1)` for your Target Allocator, like in the following example:

apiVersion: opentelemetry.io/v1beta1  
kind: OpenTelemetryCollector  
metadata:  
  name: otelcol  
  namespace: opentelemetry  
spec:  
  mode: statefulset  
  targetAllocator:  
    enabled: true  
    serviceAccount: opentelemetry-targetallocator-sa  
    prometheusCR:  
      enabled: true  
      serviceMonitorSelector:  
        matchLabels:  
          app: my-app  
...

By setting the value of `spec.targetAllocator.prometheusCR.serviceMonitorSelector.matchLabels` to `app: my-app`, it means that your `ServiceMonitor` resource must in turn have that same value in`metadata.labels`:

apiVersion: monitoring.coreos.com/v1  
kind: ServiceMonitor  
metadata:  
  name: sm-example  
  labels:  
    app: my-app  
    release: prometheus  
spec:  
...

📝 For more detail, see the `ServiceMonitor` [resource definition](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/04-service-monitor.yml).

In this case, the `OpenTelemetryCollector` resource's `spec.targetAllocator.prometheusCR.serviceMonitorSelector.matchLabels` is looking only for `ServiceMonitors` having the label `app: my-app`, which we see in the previous example.

If your `ServiceMonitor` resource is missing that label, then the Target Allocator will fail to discover scrape targets from that `ServiceMonitor`.

> **NOTE:** _The same applies if you’re using a_ [_PodMonitor_](https://prometheus-operator.dev/docs/user-guides/getting-started/#using-podmonitors)_. In that case, you would use a_ `[_podMonitorSelector_](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollectorspectargetallocatorprometheuscr)` _instead of a_ `_serviceMonitorSelector_`_._

#### 5- Did you leave out the serviceMonitorSelector and/or podMonitorSelector configuration altogether?

As we learned above, setting mismatched values for `serviceMonitorSelector` and `podMonitorSelector` results in the Target Allocator failing to discover scrape targets from your `ServiceMonitors` and `PodMonitors`, respectively.

Similarly, in `[v1beta1](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector-1)` of the `OpenTelemetryCollector` CR, leaving out this configuration altogether also results in the Target Allocator failing to discover scrape targets from your `ServiceMonitors` and `PodMonitors`.

As of `v1beta1` of the `OpenTelemetryOperator`, you must include a `serviceMonitorSelector` and `podMonitorSelector`, even if you don’t intend to use it, like this:

  
prometheusCR:  
  enabled: true  
  podMonitorSelector: {}  
  serviceMonitorSelector: {}

This configuration means that it will match on all `PodMonitor` and `ServiceMonitor` resources. See [the full example](https://github.com/avillela/otel-target-allocator-talk/blob/4c0eb425c90187d584c9d03b51ad918b377014a3/src/resources/02-otel-collector.yml#L15-L17).

I just learned this today, as I was updating my `OpenTelemetryCollector` YAML from `[v1alpha1](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector)` to `[v1beta1](https://github.com/open-telemetry/opentelemetry-operator/blob/main/docs/api.md#opentelemetrycollector-1)`.

#### 6- Do your labels, namespaces, and ports match for your ServiceMonitor and your Service (or PodMonitor and your Pod)?

The `ServiceMonitor` is configured to pick up Kubernetes [Services](https://kubernetes.io/docs/concepts/services-networking/service/) that match on:

*   Labels
*   Namespaces (optional)
*   Ports (endpoints)

Suppose that you have this `ServiceMonitor`:

apiVersion: monitoring.coreos.com/v1  
kind: ServiceMonitor  
metadata:  
  name: sm-example  
  labels:  
    app: my-app  
    release: prometheus  
spec:  
  selector:  
    matchLabels:  
      app: my-app  
  namespaceSelector:  
      matchNames:  
        \- opentelemetry  
  endpoints:  
    \- port: prom  
      path: /metrics  
    \- port: py-client-port  
      interval: 15s  
    \- port: py-server-port

The previous `ServiceMonitor` is looking for any services that have:

*   the label `app: my-app`
*   reside in a namespace called `opentelemetry`
*   a port named `prom`, `py-client-port`, _or_ `py-server-port`

So for example, the following `Service` resource would get picked up by the `ServiceMonitor`, because it matches the above criteria:

apiVersion: v1  
kind: Service  
metadata:  
  name: py-prometheus-app  
  namespace: opentelemetry  
  labels:  
    app: my-app  
    app.kubernetes.io/name: py-prometheus-app  
spec:  
  selector:  
    app: my-app  
    app.kubernetes.io/name: py-prometheus-app  
  ports:  
    \- name: prom  
      port: 8080

Conversely, the following`Service` resource would NOT, because the `ServiceMonitor` is looking for ports named `prom`, `py-client-port`, _or_ `py-server-port`, and this `Service`’s port is called `bleh`.

apiVersion: v1  
kind: Service  
metadata:  
  name: py-prometheus-app  
  namespace: opentelemetry  
  labels:  
    app: my-app  
    app.kubernetes.io/name: py-prometheus-app  
spec:  
  selector:  
    app: my-app  
    app.kubernetes.io/name: py-prometheus-app  
  ports:  
    \- name: bleh  
      port: 8080

> **NOTE:** _If you’re using_ `_PodMonitor_`_, the same applies, except that it picks up Kubernetes_ pods _that match on labels, namespaces, and named ports. For example, see this_ `_PodMonitor_` [_resource definition_](https://github.com/avillela/otel-target-allocator-talk/blob/main/src/resources/04a-pod-monitor.yml)_._

### Final Thoughts

With a little know-how, troubleshooting Target Allocator issues goes from scary to manageable. And don’t forget to actually deploy your resources first, to save yourself a lot of heartache and embarrassment. 🫥

I’d also like to add that I have [contributed this guide to the OTel docs](https://github.com/open-telemetry/opentelemetry.io/pull/4708), because I think that [contributing stuff like this back to the source of truth for open source projects is important](https://medium.com/@adri-v/sharing-is-caring-how-to-be-a-good-open-source-citizen-97e2e1206e89).

If you’d like to dig into other aspects of the OpenTelemetry Operator, such as OTel Operator’s auto-instrumentation capability, along with some troubleshooting tips, be sure to [check out my post on this topic](https://blog.devgenius.io/lets-learn-about-auto-instrumentation-with-the-otel-operator-2cdc8a532514). I’ve also got a [PR on the troubleshooting guide for this](https://github.com/open-telemetry/opentelemetry.io/pull/4724).

And now, I will leave you with a rare photo in which you can see both of my rats, Katie and Buffy, TOGETHER! Pardon the fuzziness. It’s a screen cap of a video. 🙃

![Man in maroon shirt cradling two rats in his hands. The rat on the left is light brown. The rat on the right is very dark brown.](https://cdn-images-1.medium.com/max/800/1*Lv0pFMZa1HMohfg-7kyszw.jpeg)

Katie and Buffy were still(ish) enough for a photo op together. Photo by [Adriana Villela](https://adri-v.medium.com).

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [June 25, 2024](https://medium.com/p/de9eca2b78b4).

[Canonical link](https://medium.com/@adri-v/tips-for-troubleshooting-the-target-allocator-de9eca2b78b4)

Exported from [Medium](https://medium.com) on June 3, 2026.