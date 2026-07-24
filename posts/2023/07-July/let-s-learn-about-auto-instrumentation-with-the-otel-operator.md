---
title: "Let’s Learn About Auto-Instrumentation with the OTel Operator!"
slug: let-s-learn-about-auto-instrumentation-with-the-otel-operator
description: "Learn the basics of auto-instrumentation with the OTel Operator, and how to troubleshoot auto-instrumentation issues."
added: "Jul 28, 2023"
tags:
  - technical
  - opentelemetry
  - observability
  - otel-operator
---


![Five Muskoka chairs (2 red, 3 orange) lined up against the backdrop of a ski hill and blue skies in the summer.](https://cdn-images-1.medium.com/max/800/1*NNsloLJSm4CN0fSmsqFJ8g.png)

Muskoka chairs at [Blue Mountain Resort](https://www.bluemountain.ca) in Ontario, Canada. Photo by [Adri V](https://adri-v.medium.com).

So, you’re new to [auto-instrumentation with the OTel Operator](https://opentelemetry.io/docs/kubernetes/operator/automatic/). You’ve just taken your first stab at auto-instrumenting your app using the Operator’s `Instrumentation` [custom resource](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) (CR). You’ve added an auto-instrumentation annotation to your service. But…IT’S. NOT. WORKING! WHYYYY??? 💀

Don’t panic, my friend! I’ve totally been there, and today, I will share some tips on how to troubleshoot auto-instrumentation with the OTel Operator.

> ⚠️ **NOTE:** _In this blog post, when I refer to a “service”, it’s synonymous with application definition, which at a bare minimum includes a_ `[_Deployment_](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)` _and a_ `[_Service_](https://kubernetes.io/docs/concepts/services-networking/service/)`_._

> ⚠️ **NOTE:** _This is_ not _a full-fledged tutorial on auto-instrumentation with the OTel Operator._

### OTel Operator Auto-Instrumentation Primer

When you auto-instrument your application using the OTel Operator, you need to:

*   [Install the OTel Operator in your Kubernetes cluster](https://opentelemetry.io/docs/kubernetes/operator/automatic/#installation).
*   [Install an OTel Collector](https://opentelemetry.io/docs/kubernetes/operator/automatic/#installation). This is done via the OTel Operator’s `OpenTelemetryCollector` custom resource.
*   [Configure auto-instrumentation via the](https://opentelemetry.io/docs/kubernetes/operator/automatic/#configure-automatic-instrumentation)`[Instrumentation](https://opentelemetry.io/docs/kubernetes/operator/automatic/#configure-automatic-instrumentation)` custom resource.
*   [Tell your service to use the auto-instrumentation](https://opentelemetry.io/docs/kubernetes/operator/automatic/#add-annotations-to-existing-deployments).

> _🚨_**NOTE:** _The OTel Collector is totally optional, since you can send instrumentation directly from your application to your Observability back-end; however, using a Collector is_ highly recommended _for production._

#### Instrumentation Custom Resource

The `Instrumentation` CR is used by the OTel Operator to manage auto-instrumentation. Below is an example of a very basic and stripped down`Instrumentation` resource definition, but it gets the job done!

If you want to get fancy, you can configure additional things like [OTel environment variables](https://opentelemetry.io/docs/concepts/sdk-configuration/otlp-exporter-configuration/), and even [language-specific OTel environment variables](https://opentelemetry.io/docs/kubernetes/operator/automatic/#configure-automatic-instrumentation) (e.g. [Python](https://opentelemetry.io/docs/instrumentation/python/automatic/agent-config/#environment-variables)). If you’re looking for an example of what that might look at check out [this example](https://github.com/open-telemetry/opentelemetry-operator/blob/main/tests/e2e/instrumentation-python/00-install-instrumentation.yaml).

The `Instrumentation` resource defines and configures auto-instrumentation; however, your service won’t know about the auto-instrumentation until tell it, by using a special auto-instrumentation annotation.

#### Auto-instrumentation Deployment annotation

The basic auto-instrumentation annotation looks like this:

annotations:  
  instrumentation.opentelemetry.io/inject-python: "true"

The above line says, “Inject Python auto-instrumentation into this service.”

You can also get a bit fancier, too! For example:

annotations:  
  instrumentation.opentelemetry.io/inject-python: "my-instrumentation"

The above says, “Inject Python auto-instrumentation into this service, based on the configuration from an `Instrumentation` resource named `my-instrumentation` located in the service’s namespace.

And if you want to get _really_ fancy:

annotations:  
  instrumentation.opentelemetry.io/inject-python: "my-other-namespace/my-instrumentation"

The above says, “Inject Python auto-instrumentation into this service, based on the configuration from an `Instrumentation` resource named `my-instrumentation` located in the namespace `my-other-namespace`.

That’s all well and good, but where does the auto-instrumentation annotation go? It resides under `spec.template.metadata.annotations` of the service’s `Deployment` definition, like in the one below. Note the auto-instrumentation annotation in lines 20-21.

### Gotchas & Troubleshooting Tips

Seems pretty straightforward, right? You’ve defined your `Instrumentation` resource, and you’ve annotated your service. Woo! You excitedly look for your traces and then…WHERE. ARE. THE. TRACES?? 😱

Never fear! Let’s do some troubleshooting.

#### 1- Did the Instrumentation resource install?

After installing the `Instrumentation` resource, let’s make sure that it _actually_ installed correctly by running this command:

kubectl describe otelinst -n <namespace>

Where `<namespace>` is the namespace in which the `Instrumentation` resource is deployed.

If everything looks good, your output should look something like this:

Name:         python-instrumentation  
Namespace:    application  
Labels:       app.kubernetes.io/managed-by=opentelemetry-operator  
Annotations:  instrumentation.opentelemetry.io/default-auto-instrumentation-apache-httpd-image:  
                ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-apache-httpd:1.0.3  
              instrumentation.opentelemetry.io/default-auto-instrumentation-dotnet-image:  
                ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-dotnet:0.7.0  
              instrumentation.opentelemetry.io/default-auto-instrumentation-go-image:  
                ghcr.io/open-telemetry/opentelemetry-go-instrumentation/autoinstrumentation-go:v0.2.1-alpha  
              instrumentation.opentelemetry.io/default-auto-instrumentation-java-image:  
                ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-java:1.26.0  
              instrumentation.opentelemetry.io/default-auto-instrumentation-nodejs-image:  
                ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-nodejs:0.40.0  
              instrumentation.opentelemetry.io/default-auto-instrumentation-python-image:  
                ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0  
API Version:  opentelemetry.io/v1alpha1  
Kind:         Instrumentation  
Metadata:  
  Creation Timestamp:  2023-07-28T03:42:12Z  
  Generation:          1  
  Resource Version:    3385  
  UID:                 646661d5-a8fc-4b64-80b7-8587c9865f53  
Spec:  
...  
  Exporter:  
    Endpoint:  http://otel-collector-collector.opentelemetry.svc.cluster.local:4318  
...  
  Propagators:  
    tracecontext  
    baggage  
  Python:  
    Image:  ghcr.io/open-telemetry/opentelemetry-operator/autoinstrumentation-python:0.39b0  
    Resource Requirements:  
      Limits:  
        Cpu:     500m  
        Memory:  32Mi  
      Requests:  
        Cpu:     50m  
        Memory:  32Mi  
  Resource:  
  Sampler:  
Events:  <none>

#### 2- Do the OTel Operator logs have any auto-instrumentation errors?

How do the OTel Operator logs look? Anything fishy? To check the logs, run this command:

kubectl logs -l app.kubernetes.io/name=opentelemetry-operator --container manager -n opentelemetry-operator-system --follow

If everything looks good, you shouldn’t see any errors related to auto-instrumentation.

#### 3- Did you deploy things in the right order?

Order matters! You need to deploy your `Instrumentation` resource before you deploy your service, otherwise, the auto-instrumentation won’t work! Why?

Recall our auto-instrumentation annotation:

annotations:  
  instrumentation.opentelemetry.io/inject-python: "true"

The above tells the OTel Operator to look for an `Instrumentation` object in the pod’s namespace. It also tells the Operator to inject Python auto-instrumentation into the pod.

When the pod starts up, the annotation tells the Operator to look for an Instrumentation object in the pod’s namespace, and to inject Python auto-istrumentation into the pod. It adds an [init-container](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/) to the application’s pod, called `opentelemetry-auto-instrumentation`, which is then used to injects the auto-instrumentation into the app container.

But if the `Instrumentation` resource isn’t present by the time your service is deployed, the init-container can’t be created. So if you deploy your service _before_ you deploy your `Instrumentation` resource, the instrumentation will fail.

To make sure that the `opentelemetry-auto-instrumentation` init-container has started up correctly (or has even started up at all), run the following command:

kubectl get events -n <your\_app\_namespace>

If all goes well, then you should see entries that include something like this:

53s         Normal   Created             pod/py-otel-server-7f54bf4cbc-p8wmj    Created container opentelemetry-auto-instrumentation  
53s         Normal   Started             pod/py-otel-server-7f54bf4cbc-p8wmj    Started container opentelemetry-auto-instrumentation

If your output is missing `Created` and/or `Started` entries for `opentelemetry-auto-instrumentation`, then it means that there is an issue with your auto-instrumentation. This can be the result of any of the following:

*   The `Instrumentation` resource wasn’t installed (or wasn’t installed properly).
*   The `Instrumentation` resource was installed _after_ the application was deployed.
*   There’s an error in the auto-instrumentation annotation, or the annotation in the wrong spot — see #4 below.

You might also want to check the output of the events command for any errors, as these might help point to your issue.

#### 4- Is the auto-instrumentation annotation correct?

Okay, you’ve added the auto-instrumentation annotation, but did you do it correctly? Here are a couple of things to check for:

*   **Are you auto-instrumenting for the right language?** In a classic case of copy-pasta, I once tried to auto-instrument a Python application by adding a Javascript auto-instrumentation annotation. 🫠🫠🫠
*   **Did you put the auto-instrumentation annotation in the right spot?** When you’re defining a `Deployment`, there are two spots where you could add annotations: `spec.metadata.annotations`, and `spec.template.metadata.annotations`. The auto-instrumentation annotation needs to be added to `spec.template.metadata.annotations`, otherwise _it won’t work_.

#### 5- Did you configure your auto-instrumentation endpoint properly?

The `Instrumentation` resource has a spot where you can define the destination for your telemetry data: `spec.exporter.endpoint` (see lines 6–8 in the `Instrumentation` resource exmaple above). If you leave that out, it defaults to `[http://localhost:4317](http://localhost:4317.)`. Unfortunately, that won’t send your output anywhere useful.

If you’re sending out your instrumentation to an [OTel Collector](https://opentelemetry.io/docs/collector/) (again…_highly recommended_ that you do so in Production), the value of `spec.exporter.endpoint` should reference the name of your OTel Collector `[Service](https://kubernetes.io/docs/concepts/services-networking/service/)`. If you look at the `Instrumentation` example above (lines 6–8), the Collector endpoint is set to `http://otel-collector.opentelemetry.svc.cluster.local:4318`.

Where `otel-collector` is the name of the OTel Collector Kubernetes `[Service](https://kubernetes.io/docs/concepts/services-networking/service/)`. And because the Collector is running in a different namespace from our application, we must also append `opentelemetry.svc.cluster.local` to the Collector’s service name, where `opentelemetry` is the namespace in which our Collector resides.

If everything _appears_ to be correct in you endpoint definition, there’s one more thing that you should probably look at: are you using the right Collector port? You see, it turns out that you can’t use gRPC with Python auto-instrumentation. This means that the OTel Collector port must be set to `4318` (HTTP) instead of `4317` (gRPC).

### Final Thoughts

The OTel Operator’s auto-instrumentation capability may seem intimidating at first glance, but if you understand the basic concepts, what’s going on behind the scenes, and what to look for when troubleshooting your auto-instrumentation, it’s not so scary! In fact, auto-instrumentation via the OTel Operator is pretty damn cool, if I do say so myself. I was definitely pleasantly surprised. 😀

I have to admit that the OTel Operator docs on Auto-Instrumentation were a bit confusing at times, and had no troubleshooting guidance, so after writing this blog post, I also wanted to make sure that the docs were a bit clearer for newbs such as myself. Check out [my PR to update the docs](https://github.com/open-telemetry/opentelemetry.io/pull/3098). I encourage y’all to do the same. If the docs aren’t clear, whether it’s for OTel or some other open source project, make sure that you contribute to them, so that they benefit the entire community! 🌈

I hope y’all learned something new and cool with this! There’s obviously a LOT more to dig into on this topic, but hopefully this gives you enough of a starting point for auto-instrumentation with the OTel Operator. If you’d like to learn more about the OTel Operator, you should check out [#otel-operator channel](https://cloud-native.slack.com/archives/C033BJ8BASU) in the [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf). The folks on there are super helpful and responsive.

Now, please enjoy this photo of my rat Phoebe, getting some lunchtime cuddles from my husband.

![Light brown and white rat being cradled in a hand.](https://cdn-images-1.medium.com/max/800/1*hmd50gTCFYSLpDsj2ax-fA.png)

Phoebe the rat loves lunchtime cuddles! Photo by [Adri V](https://adri-v.medium.com).

Until next time, peace, love, and code! ✌️💜👩‍💻

Want to learn more about OpenTelemetry? Check out my other OTel content here:

[**OpenTelemetry**  
_Blog posts about OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/92f897d8b31e "https://adri-v.medium.com/list/92f897d8b31e")[](https://adri-v.medium.com/list/92f897d8b31e)

By [Adriana Villela](https://medium.com/@adri-v) on [July 28, 2023](https://medium.com/p/2cdc8a532514).

[Canonical link](https://medium.com/@adri-v/lets-learn-about-auto-instrumentation-with-the-otel-operator-2cdc8a532514)

Exported from [Medium](https://medium.com) on June 3, 2026.