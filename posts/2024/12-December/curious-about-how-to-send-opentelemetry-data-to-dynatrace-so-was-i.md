---
title: "Curious About How to Send OpenTelemetry Data to Dynatrace? So Was I!"
slug: curious-about-how-to-send-opentelemetry-data-to-dynatrace-so-was-i
description: "OpenTelemetry Vendor Neutrality for the Win!"
added: "Dec 10, 2024"
tags:
  - technical
  - opentelemetry
  - dynatrace
---



![A close-up image of a tiled surface with a repeating pattern. The tiles are square-shaped with white centers and edges decorated in blue geometric and floral designs. The pattern creates a visual effect where blue diamond shapes appear at the intersections of the white squares. There are visible grout lines between the tiles, and slight imperfections can be seen on the surface, indicating wear or age.](https://cdn-images-1.medium.com/max/800/1*fHiH1rz8nlpdOlhq5vM7Vg.jpeg)

Cool tile pattern from a wall in Portugal. Photo by [Adriana Villela](https://adri-v.medium.com).

**Full disclosure:** I’ve recently changed jobs and now work at [Dynatrace](https://dynatrace.com). As a result, I’ve had to educate myself on how to get [OpenTelemetry (OTel)](https://opentelemetry.io) data into Dynatrace (product name == company name). And now that I’ve figured out how to do it myself, I thought it would be useful to share my learnings, in case you’re interested in sending your OTel data to Dynatrace.

Come learn with me, y’all!

> **NOTE:** This post assumes that you are familiar with OTel and the [OTel Collector](https://opentelemetry.io/docs/collector/).

### OTel is vendor neutral, y’all!

One of the things I love most about OTel is that it is vendor neutral, which means that _you can send the same OpenTelemetry data to different vendors_. In fact, most of the major Observability vendors out there not only support ingesting OpenTelemetry data, they also actively contribute to the project. [Check out the 2023 OpenTelemetry Journey Report](https://www.cncf.io/reports/opentelemetry-project-journey-report/) for more info.

#### Tell me why I should care, will ya?

Why does this matter? Well…I used to work at [Lightstep](https://en.wikipedia.org/wiki/ServiceNow#Acquisitions) (which was acquired by ServiceNow and is now known as ServiceNow Cloud Observability) and many of the OpenTelemetry examples that I played with and blogged about in the last 2 years or so featured sending OTel data to Lightstep. Like [this one](https://medium.com/dev-genius/running-opentelemetry-demo-app-in-kubernetes-95dccd613e0b). And [this one](https://medium.com/faun/auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep-aa1ffaeeb5e6).

Now that I work at Dynatrace, which also [ingests OTLP natively](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/getting-started/otlp-export) (yay!), it probably makes sense that I learn how to send OpenTelemetry data to Dynatrace. You know…because it’s kind of part of my job. 😁 And a great way to learn is to try to run my go-to examples using Dynatrace as the Observability backend. Luckily for me, since OTel is vendor neutral, all I had to do was reconfigure my [OTel Collector](https://opentelemetry.io/docs/collector/) to point to Dynatrace instead of Lightstep to get my examples to work.

> **NOTE:** If you’re evaluating multiple vendors, you can send the same data to different vendors at the same time (à la “vendor bake-off”) to help you determine which vendor best suits your organization’s needs. In case you’re curious, I talk a bit about it [here](https://medium.com/tucows/unpacking-observability-the-path-to-opentelemetry-399f40fd8c4).

Now that we’ve gotten that out of the way, let’s get into the meaty bits.

### Prerequisites for sending data to Dynatrace

In order to send OpenTelemetry data to the Dynatrace, you will need two pieces of information:

*   **Dynatrace instance:** Each user (or, more likely, organization) has an instance, also known as a tenant. You need the instance in order to ensure that you are sending your OTel data to the right place.
*   **Access token:** The access token allows you to send OTel data to your Dynatrace instance. It also specifies what kind of data you’re allowed to send to Dynatrace. You can find more on Dynatrace access tokens [here](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/basics/dynatrace-api-authentication).

BUT…before we get to any of that, you must first have a Dynatrace account. If you already have a Dynatrace account, feel free to skip the section below and fast-forward to me showing you how to get your tenant information and create an access token.

#### Creating a Dynatrace account

If you don’t have a Dynatrace account, the easiest way to get started is to create a free trial account. The free trial is valid for 15 days.

1) Go [here](https://dt-url.net/dt-trial), and click on the `Free trial` button

![Dynatrace.com landing page with “Free trial” buttons highlighted in a red box. One “Free trial” button is on the top right-hand side of the screen. The other “Free trial” button is on the bottom center-right side of the screen.](https://cdn-images-1.medium.com/max/800/1*oVMcynnwI7xNfWmRo68-4g.png)

Free trial signup button at dynatrace.com

2) Enter your email, click on the `Terms of Use` checkbox, and hit `Continue`

![Dynatrace trial account signup page prompting user for their Business email and to accept the “Terms of Use” before proceeding with the next step.](https://cdn-images-1.medium.com/max/800/1*yYnKUMhuq35E7jIDpsw79Q.png)

Enter your email and accept the Terms of Use

3) Enter the rest of the info, and click `Start free trial`. Then, sit back, relax, and wait until you get an email confirming that your account is ready.

![Dynatrace signup form with additional fields mandatory fields to fill out: Password, First name, Last name, Job title, Company, Country/Region, State/Region, Deploy regions. Optional fields: Choose all that apply to your interests, Phone number, Partner or promo code.](https://cdn-images-1.medium.com/max/800/1*CH2PgYFgZlpYo0eRIqpDQA.png)

Fill in the rest of the form fields

Once your account is ready, you’ll see a screen that looks like the one below. Click on the `Launch Dynatrace` button to get started.

![Screen showing that your Dynatrace instance is ready for use. Includes links to: Launch Dynatrace, Resources to get started, Explore free tiral resources](https://cdn-images-1.medium.com/max/800/1*vr60GQfLY1_rLXhxcd_LRw.png)

Your Dynatrace tenant is ready!

This will take you to the Dynatrace login screen.

![Dynatrace login screen. There’s a field to enter your email address, followed by a button labelled “Next”](https://cdn-images-1.medium.com/max/800/1*bUpkTjC3DT44uuG5Hk_lMQ.png)

Dynatrace login screen

#### Your Dynatrace tenant

To find your Dynatrace tenant, log into Dynatrace by going to [dynatrace.com](https://dynatrace.com), and clicking the `Login` button on the top right-hand side of the screen.

This will take you to the sign-in page. Once you sign in, take note of the URL. It should look something like this:

https://<your\_tenant>.apps.dynatrace.com

Take note of the value of `<your_tenant>`, because we’ll need that later.

#### Creating a Dynatrace access token

Making sure that you’re logged into Dynatrace, click `ctrl+k`, and then type `access token`. Next, select `Access Tokens` from the top of the search results.

![Dynatrace search screen with “access token” search term. Access Tokens shows at the top of the search results.](https://cdn-images-1.medium.com/max/800/1*159xOhCrzWcMTLOR5kC9xg.png)

Dynatrace search screen

On the Access tokens screen, click `Generate new token`.

![Dynatrace Access tokens screen. No access tokens are listed. On the top right-hand side of the screen is a “Generate new token” button for generating a new access token.](https://cdn-images-1.medium.com/max/800/1*PBqqZTcoj1zvk-4jlWV3-Q.png)

Dynatrace Access tokens screen

On the `Generate new token screen`, enter:

*   **Token name:** this can be whatever you want (hopefully something useful 😜)
*   **Expiration date:** totally optional
*   **Template:** select `Kubernetes Data Ingest`

You might be wondering why we’re using a template called `Kubernetes Data Ingest` for our token configuration. The name is a bit misleading, but it happens to have all [the token scopes (permissions) that we need to send OpenTelemetry data to Dynatrace](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/collector/configuration):

*   Ingest logs (`logs.ingest`)
*   Ingest metrics (`metrics.ingest`)
*   Ingest OpenTelemetry traces (`opentelemetryTrace.ingest`)

For more information on these and other Dynatrace token scopes, check out [this article](https://docs.dynatrace.com/docs/shortlink/api-authentication#token-scopes).

Once you’re done, click the `Generate token` button on the bottom of the screen.

![Dynatrace Access Token generation screen. Fields: Token name (highlighted in red), Expiration date, Template (highlihghted in red). Generate Token button is highlighted in red.](https://cdn-images-1.medium.com/max/800/1*ZKgC0XkcPcs-rXflX-SWfg.png)

Access token generation screen

The next screen will show your access token. Be sure to copy it before clicking the `Done` button, because after that, it’s gone forever. If you lose that token information, you’ll have to delete the old one (not necessary, but highly recommended — you know…security), and create a new one.

![Access token generation screen showing the generated access token. Next to the access token is a copy button (for copying the newly-generated token) and a Next button. Below the token is a CURL command for generating access tokens programmatically.](https://cdn-images-1.medium.com/max/800/1*DRxt1qzN_vHfqA9G0GIlUw.png)

Access token screen showing generated token

### Configuring the OTel Collector for Dynatrace

Great — we have our tenantand our access token. Now what? Now we can plug this information into our [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/).

> **NOTE:** There are two ways to send OTel data to an Observability backend: direct from application, and via the OTel Collector. There’s a time and place for each, and you can check out my [blog post on OTel Collector Anti-patterns](https://medium.com/@adri-v/otel-collector-anti-patterns-43dca4a857a0) for more info, if you’d like to learn more.

Your OTel Collector config YAML file would look something like this:

Dynatrace accepts telemetry in OTel’s native [OTLP format](https://opentelemetry.io/docs/specs/otlp/) via HTTP by way of the [otlphttp exporter](https://github.com/open-telemetry/opentelemetry-collector/tree/main/exporter/otlphttpexporter), using the following OTLP endpoint: `https://${DT_TENANT}.live.dynatrace.com/api/v2/otlp`. The value of `${DT_TENANT}`, as you may have guessed, is Dynatrace tenant that you (hopefully) wrote down earlier after you logged in to Dynatrace.

And, as you may have guessed, `${DT_TOKEN}` is the value of your Dynatrace access token that you hopefully jotted down and stored in a secrets manager for safekeeping.

Finally,_“Dynatrace requires metrics data to be_ [_sent with delta temporality_](https://docs.dynatrace.com/docs/ingest-from/opentelemetry/getting-started/metrics/limitations#aggregation-temporality "Learn about limits and limitations that apply when sending data via OpenTelemetry to Dynatrace.") _and not cumulative temporality”._ This means that you’ll need to include the [cumulativetodelta processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/cumulativetodeltaprocessor) in:

*   Your Collector configuration (line 8)
*   Your metrics [pipeline](https://opentelemetry.io/docs/collector/configuration/#pipelines) (line 27)

> **REMINDER:** Never ever ever store your Dynatrace token and tenant name in plain text. You should instead store them in a secrets vault (e.g. [HashiCorp Vault](https://www.vaultproject.io), [Google Secret Manager](https://cloud.google.com/security/products/secret-manager)) and pull them from that vault at runtime.

#### Dynatrace and the OTel Operator

If you’re using the [OpenTelemetry Operator](https://adri-v.medium.com/list/opentelemetry-operator-0ee6378d630a) to send OpenTelemetry data to Dynatrace, you’ll need to configure your `[OpenTelemetryCollector](https://github.com/open-telemetry/opentelemetry-operator?tab=readme-ov-file#getting-started)` resource as follows:

You’ll notice that the `spec.config` looks the same as what we defined in the `otelcol-config.yaml` that we saw earlier. The only added thing here is that `DT_TOKEN` and `DT_TENANT` are environment variables pulled from a [Kubernetes Secret](https://kubernetes.io/docs/concepts/configuration/secret/). The `secret` YAML definition looks like this:

apiVersion: v1  
kind: Secret  
metadata:  
  name: otel-collector-secret  
  namespace: <your\_namespace>  
data:  
  DT\_TOKEN: <base64\_encoded\_dynatrace\_token>  
  DT\_TENANT: <base64\_encoded\_dynatrace\_tenant>  
type: "Opaque"

Both `DT_TOKEN` and `DT_TENANT` values must be [base64 encoded](https://bunny.net/academy/http/what-is-base64-encoding-and-decoding/) before being added to the `secrets` YAML. To base64 encode a value and copy the encoded value to your buffer (for easy copy/paste) action:

echo <value\_to\_encode> | base64

Keep in mind that storing `secrets` in Kubernetes (or storing a `secrets` YAML in version control, for that matter), isn’t the greatest idea, because **_base64 does not encrypt your data_**. You should instead consider using [sealed secrets](https://github.com/bitnami-labs/sealed-secrets) or the [Kubernetes Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/) + your favourite secrets provider. For more info on these better alternatives check out [this article](https://auth0.com/blog/kubernetes-secrets-management/).

#### The Dynatrace OTel Collector Distribution

Many vendors have their own [OTel Collector Distributions](http://localhost:1313/ecosystem/distributions/). These distributions are curated with Collector components that are specific to that vendor. They may be a combination of vendor-developed custom components and components from Collector Core and Contrib. Using vendor-specific distributions ensures that you are using just the Collector components that you need, reducing overall bloat. For more information, check out [this article](https://adri-v.medium.com/otel-collector-anti-patterns-43dca4a857a0) that I wrote.

All this to say that…you guessed it…[Dynatrace also has its own Collector distribution](https://github.com/Dynatrace/dynatrace-otel-collector)! (Whaaaaat? 😁) This distribution features a set of Collector components for sending Observability data to Dynatrace from various sources. It stays up-to-date with components of the [opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector) and [opentelemetry-collector-contrib](https://github.com/open-telemetry/opentelemetry-collector-contrib) repos, which means that you’re not getting some Collector that has deviated from OTel. 😅

#### Try it out!

Want to try to send data to Dynatrace yourself? Then check out [my example repo](https://github.com/avillela/otel-target-allocator-talk?tab=readme-ov-file#installation). I created the repo for [a talk on the Target Allocator that I gave at KubeCon in March 2024](https://youtu.be/LJd1pJ0k28g?si=Z9nTsr3dZu3fbakx), and has been updated to include [instructions on configuring the OpenTelemetryCollector resource to send OTel data to Dynatrace](https://github.com/avillela/otel-target-allocator-talk?tab=readme-ov-file#3b--kubernetes-deployment-with-dynatrace-backend). It also still has instructions on how to send [OTel data to Lightstep](https://github.com/avillela/otel-target-allocator-talk?tab=readme-ov-file#3c--kubernetes-deployment-with-servicenow-cloud-observability-backend), so you can compare configurations for the two different backends.

#### OTel Data in Dynatrace

And if you’re curious to see what OTel data looks like in Dynatrace, here are some screenshots of what the UI looks like.

I’m not going in-depth on how to navigate the Dynatrace UI because a) you’re probably tired of reading and b) there are already some great videos on the [Dynatrace YouTube channel](https://www.youtube.com/@dynatrace) that explain this stuff pretty well, so I encourage you to go there for a more in-depth look, if that tickles your fancy.

![Screen shot of the Dynatrace platform’s user interface. It includes a navigation bar on the left side with links various applications. The main screen features list of distributed traces on the top pane, a tracing flame graph on the bottom pane, taking up 3/4 of the screen. The bottom right pane, taking up 1/4 of the screen shows trace attributes.](https://cdn-images-1.medium.com/max/800/1*5ntfQ96rnCr-IiGmMw7FEg.png)

Screen shot of the Dynatrace Distributed Tracing UI

![Screen shot of the Dynatrace platform’s user interface. It includes a navigation bar on the left side with links various applications. The main screen features a graph on the top pane, and a list of log messages on the bottom pane.](https://cdn-images-1.medium.com/max/800/1*SAdM2MJZlulZKt0O_FjpcQ.png)

Screen shot of the Dynatrace Logs UI

![Screen shot of the Dynatrace platform’s user interface. It includes a navigation bar on the left side with links various applications. The main screen features information about a metric called “request\_counter”. It includes metric attributes on the left-hand side of the center pane, and a line graph with a purple line on the right-hand side of the center pane.](https://cdn-images-1.medium.com/max/800/1*rLolEcsPXMgqQD2giqYxnA.png)

Screen shot of the Dynatrace metrics UI

### Final Thoughts

Overall, I found that getting OpenTelemetry data into Dynatrace was fairly straightforward. My only personal hiccup was in generating the application token, but I got that sorted out, and now I have passed on my knowledge and nauseatingly detailed screenshots on to you. 🤘

I have to say that it’s always fun to use product with fresh eyes, a fresh perspective, and a total newbie’s point of view. There’s nothing quite like it. And, having worked at another Observability vendor before, it’s always fun to see the similarities and differences. It’s like learning a new programming language and comparing it to another one that you already know. What a blast!

One final point that I want to make. I don’t want to trivialize things and give you the impression that moving from one Observability vendor to another is simply a matter of repointing your OTel Collector from one vendor backend to another. That is but one aspect of a vendor migration, no matter what vendor you’re moving to/from. You also have to consider the fact that you likely have a bunch of dashboards, alerts, and whatnot that you created with one vendor. When you migrate to another vendor, things things won’t be a 1:1 translation, so keep that in mind.

But that may be a sacrifice that you’re willing to make, because OTel’s vendor neutrality means that all vendors supporting OpenTelemetry are ingesting the same data. What sets them apart is what they do with the same data. And if one vendor does something with your data better than another one, well, damn, don’t you owe it to yourself to check that out? Food for thought.

And now, I will leave you with a picture the lovely Katie Jr, who seems a little unsure about the cuddles that she’s getting.

![A close-up image of a person’s hand holding a small brown rat with a sleek coat and rounded ears. The rat’s eyes are bright and alert, and its small paws are visible as it rests in the palm of the hand. The background shows a dark blue shirt with buttons, indicating the person is likely seated or standing while holding the rat.](https://cdn-images-1.medium.com/max/800/1*ngn9v3LelcfwtSSPWbNTrQ.jpeg)

Until next time, peace, love, and code. ✌️💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [December 10, 2024](https://medium.com/p/842cebb21286).

[Canonical link](https://medium.com/@adri-v/how-do-i-send-opentelemetry-data-to-dynatrace-842cebb21286)

Exported from [Medium](https://medium.com) on June 3, 2026.