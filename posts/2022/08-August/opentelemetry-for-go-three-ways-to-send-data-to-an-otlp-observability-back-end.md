---
title: "OpenTelemetry for Go: Three Ways to Send Data to an OTLP Observability Back-end"
slug: opentelemetry-for-go-three-ways-to-send-data-to-an-otlp-observability-back-end
description: "The case for OTel Launchers"
added: "Aug 02, 2022"
tags:
  - technical
  - observability
  - opentelemetry
  - lightstep
  - "2022"
---


![Monarch butterfly pollinating small purple flowers.](https://cdn-images-1.medium.com/max/800/0*bYfPih0SoTP5H_7o)

Monarch butterfly pollinating small purple flowers. Photo by [Adri Villela](https://adri-v.medium.com)

In the last couple of weeks, I spent a ton of time looking at different ways to send [OpenTelemetry (OTel)](https://lightstep.com/blog/opentelemetry.io) data to Lightstep.

In case the super-obvious title didn’t tip you off already, there are three different ways to do so:

1.  Direct from application
2.  [OpenTelemetry Collector](https://opentelemetry.io/docs/collector)
3.  Launchers (via Collector or Direct from application)

In this post, I will dig into each of these three approaches in detail, with code snippets which explain how to get data into [Lightstep Observability](https://lightstep.com/blog/app.lightstep.com). Let’s do this!

> **Note:** _If you’re looking for full code listings, don’t panic! You see them in the Lightstep_ [_OTel examples repository_](https://github.com/lightstep/opentelemetry-examples/tree/main/go)_._

Before we continue, here are some things that you’ll need:

*   A basic understanding of [Golang](https://go.dev/doc/tutorial/getting-started)
*   A basic understanding of the [OpenTelemetry Collector](https://lightstep.com/blog/observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry#otel-collector-101)

If you’d like to run the full code examples, you’ll also need:

*   A [Lightstep Observability account](https://app.lightstep.com/signup/developer?signup_source=docs)
*   A [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens) to tell Lightstep what project to send your traces to
*   A working local Golang development environment
*   [Docker](https://docs.docker.com/get-docker) (we’ll need it to run the OTel Collector locally)

Lightstep Observability supports the native [OpenTelemetry Protocol (OTLP)](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md). It can receive data in the OTLP format either via [HTTP](https://opentelemetry.io/docs/concepts/glossary/#http) or [gRPC](https://opentelemetry.io/docs/concepts/glossary/#grpc). You will need to specify which method you wish to use in your code, as we’ll see in the upcoming code snippets.

If you’re curious about using gRPC vs HTTP for OpenTelemetry, check out [these docs](https://docs.lightstep.com/docs/send-otlp-over-http-to-lightstep).

> **Note:** _Other Observability tools that support OTLP include_ [_Honeycomb_](https://www.honeycomb.io/blog/all-in-on-opentelemetry)_,_ [_Grafana_](https://grafana.com/blog/2021/04/13/how-to-send-traces-to-grafana-clouds-tempo-service-with-opentelemetry-collector)_, and_ [_Jaeger_](https://medium.com/jaegertracing/introducing-native-support-for-opentelemetry-in-jaeger-eb661be8183c)_._

### Direct from Application

If you’re getting started with instrumenting your application with OpenTelemetry, this is probably the most common route taken by most beginners. As the name suggests, we are sending data to a given Observability back-end directly from our application code.

![Diagram of application sending OpenTelemetry data directly to Lightstep.](https://cdn-images-1.medium.com/max/800/1*zl6nhfAtLLa8Y1AONFiWBg.png)

Application sending OpenTelemetry data directly to Lightstep. Diagram by [Adri Villela](https://adri-v.medium.com).

To do this, we must do the following:

*   Install the required OpenTelemetry packages, and import them
*   Configure an Exporter
*   Configure a TracerProvider
*   Initialize the Exporter and TracerProvider to send data to Lightstep

Don’t panic if you don’t know what all this means. We’ll be digging in shortly.

> **Note:** _You can see the full example of sending OTel data to Lightstep directly via OTLP over gRPC_ [_here_](https://github.com/lightstep/opentelemetry-examples/blob/main/go/opentelemetry/otlp/server/server.go)_. The HTTP version can be found_ [_here_](https://github.com/lightstep/opentelemetry-examples/blob/main/go/opentelemetry/otlp/server/server-http.go)_._

#### How it Works

**1- Install the required OTel libraries**

These are the libraries that are required **_to send data to an Observability back-end (e.g Lightstep)_**.

In our application code, we’ll need to import the same libraries:

If you wish to use HTTP instead of gRPC, replace `otlptracegrpc` with `otlptracehttp`.

**2- Configure the Exporter**

An **Exporter** is how we send data to OpenTelemetry. As I mentioned earlier, Lightstep accepts data in the OTLP format, so we need to define an OTLP Exporter.

> **Note:** _Some vendors don’t accept data in OTLP format, which means that you will need to use a_ [_vendor-specific exporter_](https://opentelemetry.io/registry/?language=go&component=exporter) _to send data to them._

We configure our Exporter like this:

Some noteworthy items:

*   The `endpoint` is set to `ingest.lightstep.com:443`, which points to Lightstep's public Microsatellite pool. If you are using an on-premise satellite pool, then check out [these docs](https://docs.lightstep.com/docs/test-connectivity-to-microsatellites).
*   You must provide a value for `<LS_ACCESS_TOKEN>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).
*   We are sending data to Lightstep via gRPC. If you wish to use HTTP instead of gRPC, your client connection will look like the snippet below. Notice how we have to add an extra configuration option, `WithURLPath`. This configuration option allows us to [override the default URL path for sending traces](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp#WithURLPath). [The default value is](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#endpoint-urls-for-otlphttp) `/v1/traces`; however, for HTTP connections, Lightstep expects this value to be `traces/otlp/v0.9`.

**3- Configure the TracerProvider**

A `TracerProvider` serves as the entry point of the OpenTelemetry API. It provides access to `Tracer`s. A `Tracer` is responsible for creating a [Span](https://opentelemetry.io/docs/concepts/observability-primer/#spans) to trace the given operation.

We configure our TracerProvider like this:

A few noteworthy items:

*   We define a [Resource](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/sdk.md) to provide OpenTelemetry with a bunch of information that identifies our service. This includes things like `serviceName` and `serviceVersion`, which are required by Lightstep to be set. As the name implies, `serviceName` is the name of the microservice that you are instrumenting.
*   `sdktrace.WithBatcher` tells OpenTelemetry to use the [BatchSpanProcessor](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/sdk.md#batching-processor). That is, it says to export the data in batches. For the purposes of this example, we're not doing anything fancy with this.

**4- Initialize the Exporter and TracerProvider to send data to Lightstep**

We’re finally ready to send data to Lightstep! We do this by calling the `newExporter` and `newTraceProvider` functions above from our `main` function:

#### Try it!

Let’s see the code example in action. In this example, we will run a [Server](https://github.com/lightstep/opentelemetry-examples/blob/main/go/opentelemetry/otlp/server/server.go) with a `/ping` endpoint. The server will send OTel data to Lightstep directly via OTLP over gRPC. We will hit the endpoint using `curl`.

**1- Clone the repo**

```
git clone git@github.com:lightstep/opentelemetry-examples.git
```

**2- Open a terminal window and run the server program**

```
cd opentelemetry-examples/go/opentelemetry/otlp/server export LS_ACCESS_TOKEN = <your_access_token> go run server.go
```

Be sure to replace `<your_access_token>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens)

**3- Open a new terminal window and hit the endpoint**

```
curl http://localhost:8081/ping
```

Side-by-side sample output from the server output and `curl` command:

![Screen capture of server.go and curl output.](https://cdn-images-1.medium.com/max/800/1*7woY67mnHATw0kDsXHOrsQ.png)

Screen capture of server.go and curl output. Image by [Adri Villela](https://adri-v.medium.com).

**4- See it in Lightstep**

![Screen capture of test-go-server-grpc in Lightstep](https://cdn-images-1.medium.com/max/800/1*XXiEh-36FrCCBoE6HCxftA.png)

Sample output of our service in Lightstep. Image by [Adri Villela](https://adri-v.medium.com).

> **Note:** _Want to run the HTTP version? Replace_ `_go run server.go_` _in Step 2 with_ `_go run server-http.go_`_._

### OpenTelemetry Collector

The next approach to sending data to an Observability back-end is by way of the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector). For non-development setups, this is the recommended approach to send OpenTelemetry data to your Observability back-end.

![Diagram depicting application sending OpenTelemetry data to Lightstep via OTel Collector.](https://cdn-images-1.medium.com/max/800/1*OgPYdMooFV9gm-CXZv2maw.png)

Application sending OpenTelemetry data to Lightstep via OTel Collector. Diagram by [Adri Villela](https://adri-v.medium.com).

To send your instrumented data to your Observability back-end via the Collector, we must do the following:

*   Have an OpenTelemetry Collector instance running somewhere (running it locally is easiest)
*   Install the required OpenTelemetry packages, and import them
*   Configure an Exporter
*   Configure a TracerProvider
*   Initialize the Exporter and TracerProvider

Looks almost the same as the Direct approach, doesn’t it? _Almost_…

We’ll get into the differences shortly.

#### How it Works

**1- Install the required OTel libraries**

These are the libraries that are required **_to send data to an Observability back-end (e.g Lightstep)_**.

In our application code, we’ll need to import the same libraries:

If you wish to use HTTP instead of gRPC, replace `otlptracegrpc` with `otlptracehttp`.

**2- Configure the Exporter**

As we saw in the Direct example, we are exporting our data via OTLP (see how the return type is `otlptrace.Exporter`). The difference is that instead of exporting our data directly to Lightstep, we're exporting our data to the OTel Collector, which happens to ingest OTel data from our application in OTLP format as well.

In our Direct example, before we could create a new Exporter, we first needed to create a new Trace Client ( `otlptracegrpc.NewClient`), so that we could tell OpenTelemetry _how_ to send data to Lightstep. We don't need to do this when we use the Collector, because the Collector takes care of creating a Trace Client for us behind the scenes, using the information in the [Collector config YAML](https://github.com/lightstep/opentelemetry-examples/blob/main/collector/vanilla/collector.yml) to do so.

We configure our Exporter like this:

Some noteworthy items:

*   The `endpoint` is your Collector's URL.
*   In the example below, the Collector `endpoint` is set to `localhost:4317`, which means that the OpenTelemetry Collector is [running locally, using Docker](https://github.com/lightstep/opentelemetry-examples/blob/main/collector/vanilla/readme.md), listening on gRPC port `4317`.
*   You do not need to provide a [Lightstep Access token](https://docs.lightstep.com/docs/create-and-manage-access-tokens) as part of this configuration, as that value is set in the [OTel Collector’s](https://lightstep.com/blog/observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry#running-the-webstore-app-locally) configuration [YAML file](https://github.com/lightstep/opentelemetry-examples/blob/main/collector/vanilla/collector.yml).
*   Note that the `WithInsecure` option is set. This is required if you're using the Collector, and only if a certificate isn't configured in the Collector. (That's a blog post for another day. 😜)

**3- Configure the TracerProvider**

Our `TracerProvider` is identical to the one we configured in the Direct example:

**4- Initialize the Exporter and TracerProvider to send data to Lightstep**

We’re finally ready to send data to Lightstep! We do this by calling the `newExporter` and `newTraceProvider` functions above from our `main` function:

Note that this is the same as what we saw in the direct example. Only the underlying code in the `newExporter` function is different.

#### Try it!

Let’s see the code example in action. In this example, we will run a [Server](https://github.com/lightstep/opentelemetry-examples/blob/main/go/opentelemetry/collector/server/server.go) with a `/ping` endpoint. The server will send OTel data to Lightstep through the Collector, over gRPC. We will hit the endpoint using `curl`.

**1- Clone the repo**

```
git clone git@github.com:lightstep/opentelemetry-examples.git
```

**2- Run the Collector**

Open up a new terminal window. First, you’ll need to edit the [collector.yaml](https://github.com/lightstep/opentelemetry-examples/blob/main/collector/vanilla/collector.yml) file. Be sure to replace `${LIGHTSTEP_ACCESS_TOKEN}` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).

Now you can start up the Collector:

```
cd opentelemetry-examples/collector/vanilladocker run -it --rm -p 4317:4317 -p 4318:4318 \    -v $(pwd)/collector.yaml:/otel-config.yaml \    --name otelcol otel/opentelemetry-collector-contrib:0.53.0  \    "/otelcol-contrib" \    "--config=otel-config.yaml"
```

> **Note**_: This may take a little while if it’s the first time you’re pulling the Collector image._

Sample output:

![Screen capture of OTel Collector startup sequence.](https://cdn-images-1.medium.com/max/800/1*Y8jtE7T4j3rDxy4sjhLC5w.png)

OTel Collector startup sequence. Image by [Adri Villela](https://adri-v.medium.com).

**3- Open up a new terminal window and run the server program**

```
cd opentelemetry-examples/go/opentelemetry/collector/servergo run server.go
```

**4- Open third terminal window and hit the endpoint**

```
curl http://localhost:8081/ping
```

Side-by-side sample output from the server output and `curl` command:

![Screen capture of server.go and curl output.](https://cdn-images-1.medium.com/max/800/1*winnhZ6NBStT40NZe3sQ7g.png)

Screen capture of server.go and curl output. Image by [Adri Villela](https://adri-v.medium.com).

And your Collector output should look something like this:

![Screen capture of sample OTel Collector output](https://cdn-images-1.medium.com/max/800/1*QLfyZcp6qMUGgv-dbaKL1w.png)

Sample Collector output. Image by [Adri Villela](https://adri-v.medium.com).

**5- See it in Lightstep**

![](https://cdn-images-1.medium.com/max/800/1*VfLFg904w8oStgN2NdJesw.png)

Sample output of our service in Lightstep. Image by [Adri Villela](https://adri-v.medium.com).

### Launcher

The final approach that we’ll be exploring today is the Launcher. If you’ve perused through the [OpenTelemetry docs](https://lightstep.com/blog/opentelemetry.io/docs) and haven’t seen any mention of a Launcher anywhere, it’s because they’re not part of OTel per se.

You can think of Launchers as wrappers around the OTel SDKs. Launchers were originally created by some of the talented engineers here at [Lightstep](https://lightstep.com/blog/lightstep.com), to provide a way to encapsulate OpenTelemetry setup and configuration. Put simply, the launchers were born out of them being tired of duplicating the SDK setup code. Once again, Developer Laziness for the win! (For the record, I am a firm believer that Developer Laziness is what makes for great software. We just hate repetition!) Launchers also add a layer of validation to give users a better understanding of all the required parameters. For more on Launchers, check out [this article](https://lightstep.com/blog/opentelemetry-launchers-what-they-solve-and-why-we-need-them) by [Ted Young](https://twitter.com/tedsuo).

We currently have Launchers for [Go](https://github.com/lightstep/otel-launcher-go), [Python](https://github.com/lightstep/otel-launcher-python), [Java](https://github.com/lightstep/otel-launcher-java), and [Node.JS](https://github.com/lightstep/otel-launcher-node).

Okay…now that we understand why Launchers exist, let’s find out how to use them to send OTel data to Lightstep.

To do this, we must do the following:

*   Install the required OpenTelemetry and Launcher packages, and import them
*   Configure the Launcher
*   Initialize the Launcher

Looks a bit different than with the other two examples, doesn’t it? As you can see, the Launcher takes care of configuring and initializing the Exporter and TracerProvider.

Let’s dig in.

> _You can see the full example of sending OTel data to Lightstep using the Go Launcher through the Collector over gRPC_ [_here_](https://github.com/lightstep/opentelemetry-examples/blob/main/go/launcher/server/server.go)_. The direct (via Launcher) version can be found_ [_here_](https://github.com/lightstep/opentelemetry-examples/blob/main/go/launcher/server/server-otlp.go)_._

#### How it Works

**1- Install the required OTel libraries**

In our application code, we’ll need to import the same libraries:

Huh…fewer packages to install and import!

**2- Configure the Launcher**

Here, we’re configuring the Launcher, similar to what we did when we configured our Exporter and TracerProvider. Except it’s all encapsulated in this lovely `launcher.ConfigureOpentelemetry`! Super cool. 😎

Some noteworthy items:

*   The `endpoint` is set to `ingest.lightstep.com:443`, which points to Lightstep's public Microsatellite pool. If you are using an on-premise satellite pool, then check out [these docs](https://docs.lightstep.com/docs/test-connectivity-to-microsatellites).
*   You must provide a value for `<LS_ACCESS_TOKEN>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).
*   Launchers use gRPC only. Not a deal-breaker, to be honest.

Ugh…that’s all well and good, but what if you wanted to use a Collector? Didn’t I say that that’s the preferred method for non-developer setups? Yes, I sure did! And not to worry, because you can use Launchers to send OTel data to the Collector instead of directly to Lightstep. To do that, you just need to:

**3- Initialize the Launcher**

All we need to do is call our `newLauncher` function, and we're done!

Overall, the Launcher approach requires less code, compared to the other two sans-Launcher approaches.

#### Try it!

Let’s see the code example in action. In this example, we will run a [Server](https://github.com/lightstep/opentelemetry-examples/blob/main/go/launcher/server/server.go) with a `/ping` endpoint. The server will send OTel data to Lightstep using the Go Launcher through the Collector, over gRPC. We will hit the endpoint using `curl`.

**1- Clone the repo**

git clone [git@github.com](mailto:git@github.com):lightstep/opentelemetry-examples.git

**2- Run the Collector**

Open up a new terminal window. First, you’ll need to edit the [collector.yaml](https://github.com/lightstep/opentelemetry-examples/blob/main/collector/vanilla/collector.yaml) file. Be sure to replace `${LIGHTSTEP_ACCESS_TOKEN}` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).

Now you can start up the Collector:

cd opentelemetry-examples/collector/vanilla  
docker run -it --rm -p 4317:4317 -p 4318:4318 \\  
    -v $(pwd)/collector.yaml:/otel-config.yaml \\  
    --name otelcol otel/opentelemetry-collector-contrib:0.53.0  \\  
    "/otelcol-contrib" \\  
    "--config=otel-config.yaml"

> **Note**_: This may take a little while if it’s the first time you’re pulling the Collector image._

Sample output:

![Screen capture of OTel Collector startup sequence.](https://cdn-images-1.medium.com/max/800/1*Y8jtE7T4j3rDxy4sjhLC5w.png)

OTel Collector startup sequence. Image by [Adri Villela](https://adri-v.medium.com).

**3- Open up a new terminal window and run the server program**

cd opentelemetry-examples/go/launcher/server  
go run server.go

#### 4- Open third terminal window and hit the endpoint

```
curl http://localhost:8081/ping
```

Side-by-side sample output from the server output and `curl` command:

![Screen capture of server.go and curl output.](https://cdn-images-1.medium.com/max/800/1*aYXyvHaJsbND5gMWI9ch2A.png)

Screen capture of server.go and curl output. Image by [Adri Villela](https://adri-v.medium.com).

And your Collector output should look something like this:

![Screen capture of OTel  Collector sample output.](https://cdn-images-1.medium.com/max/800/1*QLfyZcp6qMUGgv-dbaKL1w.png)

Sample Collector output. Image by [Adri Villela](https://adri-v.medium.com).

> **Note:** _Want to run the direct version using the Launcher? Simply skip Step 2. In Step 3 set the_ `_LS_ACCESS_TOKEN_` _environment variable:_ `_export LS_ACCESS_TOKEN=<your_access_token>_`_, where_ `_<your_access_token>_` _is your own_ [_Lightstep Access Token_](https://docs.lightstep.com/docs/create-and-manage-access-tokens)_, and replace_ `_go run server.go_` _with_ `_go run server-otlp.go_`_._

While I was messing around with each of the 3 approaches, I encountered a few gotchas, so I thought I’d share them here.

gRPC is the bane of my existence. Especially when I see that lovely `context deadline exceeded` message. It makes my blood boil. Fortunately, my OTel friends at Lighstep told me about two nice little flags that make gRPC debugging a little easier:

Set these beauties, and you’ll know relatively quickly if you can’t connect to your gRPC endpoint. This is what a successful connection looks like:

```
2022/07/26 16:28:36 Using default LS endpoint ingest.lightstep.com:443 2022/07/26 16:28:36 INFO: [core] [Channel #1] Channel created 2022/07/26 16:28:36 INFO: [core] [Channel #1] original dial target is: "ingest.lightstep.com:443" 2022/07/26 16:28:36 INFO: [core] [Channel #1] parsed dial target is: {Scheme:ingest.lightstep.com Authority: Endpoint:443 URL:{Scheme:ingest.lightstep.com Opaque:443 User: Host: Path: RawPath: ForceQuery:false RawQuery: Fragment: RawFragment:}} 2022/07/26 16:28:36 INFO: [core] [Channel #1] fallback to scheme "passthrough" 2022/07/26 16:28:36 INFO: [core] [Channel #1] parsed dial target is: {Scheme:passthrough Authority: Endpoint:ingest.lightstep.com:443 URL:{Scheme:passthrough Opaque: User: Host: Path:/ingest.lightstep.com:443 RawPath: ForceQuery:false RawQuery: Fragment: RawFragment:}} 2022/07/26 16:28:36 INFO: [core] [Channel #1] Channel authority set to "ingest.lightstep.com:443" 2022/07/26 16:28:36 INFO: [core] [Channel #1] Resolver state updated: { "Addresses": [ { "Addr": "ingest.lightstep.com:443", "ServerName": "", "Attributes": null, "BalancerAttributes": null, "Type": 0, "Metadata": null } ], "ServiceConfig": null, "Attributes": null } (resolver returned new addresses) 2022/07/26 16:28:36 INFO: [core] [Channel #1] Channel switches to new LB policy "pick_first" 2022/07/26 16:28:36 INFO: [core] [Channel #1 SubChannel #2] Subchannel created 2022/07/26 16:28:36 Using default service name test-go-client-grpc 2022/07/26 16:28:36 Using default service version 0.1.0 2022/07/26 16:28:36 Using default environment dev 2022/07/26 16:28:36 INFO: [core] [Channel #1 SubChannel #2] Subchannel Connectivity change to CONNECTING 2022/07/26 16:28:36 INFO: [core] [Channel #1 SubChannel #2] Subchannel picks a new address "ingest.lightstep.com:443" to connect 2022/07/26 16:28:36 INFO: [core] pickfirstBalancer: UpdateSubConnState: 0x14000380100, {CONNECTING <nil>} 2022/07/26 16:28:36 INFO: [core] [Channel #1] Channel Connectivity change to CONNECTING Get "http://localhost:8081/ping": dial tcp [::1]:8081: connect: connection refused 2022/07/26 16:28:37 INFO: [core] [Channel #1 SubChannel #2] Subchannel Connectivity change to READY 2022/07/26 16:28:37 INFO: [core] pickfirstBalancer: UpdateSubConnState: 0x14000380100, {READY <nil>} 2022/07/26 16:28:37 INFO: [core] [Channel #1] Channel Connectivity change to READY
```

If you’re using a Launcher and your Spans not knowing showing up in Lightstep, you can set the `OTEL_LOG_LEVEL` flag before running your code:

Your debug output looks something like this:

```
2022/07/26 15:39:10 debug logging enabled 2022/07/26 15:39:10 configuration 2022/07/26 15:39:10 { "SpanExporterEndpoint": "localhost:4317", "SpanExporterEndpointInsecure": true, "ServiceName": "test-go-client-launcher", "ServiceVersion": "0.1.0", "Headers": null, "MetricExporterEndpoint": "localhost:4317", "MetricExporterEndpointInsecure": true, "MetricExporterTemporalityPreference": "cumulative", "MetricsEnabled": true, "LogLevel": "debug", "Propagators": [ "tracecontext", "baggage" ], ... }
```

When I first started on my OTel journey in 2021 (in my pre-Lightstep days), I sent OTel data to my Observability back-end by way of the [OTel Collector](https://storiesfromtheherd.com/unpacking-observability-the-observability-stack-93d4733e2a72). To me, this was a no-brainer, because the Collector can:

*   Ingest data from multiple sources (including applications and infrastructure metrics)
*   Tack on/remove metadata
*   Mask data
*   Sample data
*   Send data to multiple back-ends at the same time (great if you were evaluating different vendors or transitioning from one vendor to another)

I’m personally a HUGE fan of the Collector, and I stand by my statement that it is good practice to run a OTel Collector in Pre-Prod/Prod environments to send your OpenTelemetry data to an Observability back-end.

BUT…I have to admit that I was thinking about this problem from more of an operational perspective, rather than from a developer’s perspective.

The thing is, when you’re getting started with OTel, chances are, you’re starting from zero. Which means that you’re already having to figure out this whole instrumentation bit. That’s already stressful enough. Add trying to stand up a Collector on top of it all, and you’ve already got too many moving parts and a likely _very_ overwhelmed developer…even if you run it with the simplest configuration (i.e. locally, via Docker). That, and, do you _really_ need to run a Collector when you’re just doing local development? It’s probably more effort than it’s worth.

BUT…I also learned from personal experience that connecting to an Observability back-end through the Direct approach was a royal pain in the arse. Documentation was veeeery sparse. Examples were incomplete. Needless to say, it was a very trying journey. And I had difficulties with using both HTTP and gRPC.

So this all begs the question-what’s a good, easy way to instrument your code and send it to an Observability back-end? Well, this is where the Launchers come into play! Because they give you the best of both worlds. You can connect directly to your Observability back-end, OR you can connect via the OTel Collector. In addition, the Launchers don’t restrict you to using Lightstep as your Observability back-end, because:

1.  If you connect to a Collector from the Launcher, the Collector automagically gives you the ability to send to multiple Observability back-ends
2.  If you choose to connect directly to a [non-Lightstep Observability back-end](https://github.com/lightstep/otel-launcher-go#configure) that accepts OTel data in OTLP format from the Launcher

I have to admit that before I used the Go Launcher, I was quite skeptical about it. After all, it’s not vanilla OTel, which made me think…”Uh-oh…vendor lock-in! Isn’t that what OTel is trying to avoid?”

But two things changed my mind about it. First, the fact that you’re not locked into a specific vendor (see above). Secondly, our friends at Honeycomb have been working to bring Launchers to the community, as per work done [here](https://github.com/honeycombio/otel-launcher-go/pull/1#issuecomment-1191243498), so chances are, launchers may be (vanilla) OTel’s future!

My conclusion: the Launcher wins, due to its flexibility and overall simplicity compared to its counterparts.

We’ve learned about how we can send our OTel data to Lightstep in three different ways:

*   Direct from our application
*   Via the OTel Collector
*   Using Launchers, which can send data directly to Lightstep or by way of the Collector

In non-dev setups, using a Collector is the preferred way to send data to your Observability back-end; however, if you’re just getting started with OTel, sending OTel data directly to your Observability back-end makes the most sense, because you have to deal with fewer moving parts.

That said, using vanilla OTel to do either of the above can be a bit overwhelming, which is where Launchers come in, as they abstract a bunch of that connectivity stuff, therefore making it easier to send data to your Observability back-end, whether it’s direct, or by way of a Collector.

Whew! That was a lot to think about and take in! Give yourself a pat on the back, because we’ve covered a LOT! Now, please enjoy this picture of some goats.

![White goat and black-and-white goat grazing at Blue Mountain, Ontario, Canada.](https://cdn-images-1.medium.com/max/800/1*bURbRy-wHXHM8unGPyL3MA.jpeg)

Goats grazing at Blue Mountain, Ontario, Canada. Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. 🦄 🌈 💫

Got questions about OTel instrumentation with Golang? Contact us! Connect with us through [e-mail](mailto:devrel@lightstep.com) or hit me up on [Twitter](https://twitter.com/adrianamvillela). Hope to hear from y’all!

For more Observability articles, check out my Unpacking Observability series:

[**Unpacking Observability**  
_Stories to help you understand Observability and OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/be1835c6dd23 "https://adri-v.medium.com/list/be1835c6dd23")[](https://adri-v.medium.com/list/be1835c6dd23)

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/observability-mythbusters-send-opentelemetry-data-to-lightstep-3-ways-golang)_._

By [Adriana Villela](https://medium.com/@adri-v) on [August 2, 2022](https://medium.com/p/7dfcf2892003).

[Canonical link](https://medium.com/@adri-v/opentelemetry-to-lightstep-3-ways-in-golang-7dfcf2892003)

Exported from [Medium](https://medium.com) on June 3, 2026.