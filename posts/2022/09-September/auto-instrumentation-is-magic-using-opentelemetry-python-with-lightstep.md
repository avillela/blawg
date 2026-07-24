---
title: "Auto-Instrumentation Is Magic: Using OpenTelemetry Python with Lightstep"
slug: auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep
description: "A quick way to get started with OpenTelemetry for Python"
added: "Sep 09, 2022"
tags:
  - technical
  - opentelemetry
  - observability
---

# Auto-Instrumentation Is Magic: Using OpenTelemetry Python with Lightstep

![Fuzzy bumblebee pollinating a pink flower](https://cdn-images-1.medium.com/max/800/0*FCmDKtYfC5Y5Rffc)

Bumblebee pollinating a flower. Photo by [Adri Villela](http://adri-v.medium.com).

In my [last OpenTelemetry blog post](https://blog.devgenius.io/opentelemetry-to-lightstep-3-ways-in-golang-7dfcf2892003), I talked about how to send [OpenTelemetry (OTel)](https://lightstep.com/blog/opentelemetry.io) data to [Lightstep](https://lightstep.com/blog/app.lightstep.com) using Golang. That’s all well and good if you’re a Golang developer, but what if you use Python? Well, my friend, you’re in luck, because today, I’ll be looking at how to send OpenTelemetry data to Lightstep using Python.

As with the OTel Golang post, we can send OTel data to Lightstep (or any other Observability tool that supports [OpenTelemetry Protocol (OTLP)](https://blog.devgenius.io/opentelemetry-to-lightstep-3-ways-in-golang-7dfcf2892003), for that matter) in one of 3 ways:

1.  Direct from application
2.  [OpenTelemetry Collector](https://opentelemetry.io/docs/collector)
3.  Launchers

In this post, I will dig into each of these three approaches in detail, with code snippets which explain how to get data into [Lightstep Observability](http://app.lightstep.com). Let’s do this!

Lightstep Observability supports the native [OpenTelemetry Protocol (OTLP)](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md). It can receive data in the OTLP format either via [HTTP](https://opentelemetry.io/docs/concepts/glossary/#http) or [gRPC](https://opentelemetry.io/docs/concepts/glossary/#grpc). You will need to specify which method you wish to use in your code, as we’ll see in the upcoming code snippets.

If you’re curious about using gRPC vs HTTP for OpenTelemetry, check out [these docs](https://docs.lightstep.com/docs/send-otlp-over-http-to-lightstep).

> **Note:** _Other Observability tools that support OTLP include_ [_Honeycomb_](https://www.honeycomb.io/blog/all-in-on-opentelemetry)_,_ [_Grafana_](https://grafana.com/blog/2021/04/13/how-to-send-traces-to-grafana-clouds-tempo-service-with-opentelemetry-collector)_, and_ [_Jaeger_](https://medium.com/jaegertracing/introducing-native-support-for-opentelemetry-in-jaeger-eb661be8183c)_._

One thing that’s super cool about using OTel to instrument your Python code is that Python offers automatic (auto) instrumentation. What does this mean? At a high level, it means that you can run a Python OpenTelemetry binary (called `[opentelemetry-instrument](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation)`) that wraps around your Python application, to automagically instrument it. 🪄

More specifically, auto-instrumentation uses shims or bytecode instrumentation agents to intercept your code at runtime or at compile-time to add tracing and metrics instrumentation to the libraries and frameworks you depend on. The beauty of auto-instrumentation is that it requires a minimum amount of effort. Sit back, relax, and enjoy the show. A number of popular Python libraries are auto-instrumented, including [Flask](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-flask) and [Django](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation/opentelemetry-instrumentation-django). You can find the full list [here](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation).

Manual instrumentation requires adding spans, context propagation, attributes, etc. to your code. It’s akin to commenting your code or writing tests.

Does this mean that you shouldn’t manually instrument? Not at all! Start with auto-instrumentation if it’s available. If the auto-instrumentation isn’t sufficient for your use case (most often it’s not), then add in the manual instrumentation. For example, auto-instrumentation doesn’t know your business logic-it only knows about frameworks and languages-in which case you’ll want to manually instrument your business logic, so that you get that visibility.

### Pre-Requisites

Before we start our tutorial, here are some things that you’ll need:

*   A basic understanding of [Python](https://www.python.org/) and [Python virtual environments](https://realpython.com/python-virtual-environments-a-primer)
*   A basic understanding of the [OpenTelemetry Collector](https://lightstep.com/blog/observability-mythbusters-how-hard-is-it-to-get-started-with-opentelemetry#otel-collector-101)
*   A basic understanding of how to use [Lightstep Observability](https://lightstep.com/blog/app.lightstep.com)

If you’d like to run the full code examples, you’ll also need:

*   A [Lightstep Observability account](https://app.lightstep.com/signup/developer?signup_source=docs)
*   A [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens) to tell Lightstep what project to send your traces to
*   A working installation of [Python](https://www.python.org/downloads)
*   Docker (to run the OTel Collector locally)

### Direct from Application

If you’re getting started with instrumenting your application with OpenTelemetry, this is probably the most common route taken by most beginners. As the name suggests, we are sending data to a given Observability back-end directly from our application code.

![Application sending OpenTelemetry data directly to Lightstep](https://cdn-images-1.medium.com/max/800/1*zl6nhfAtLLa8Y1AONFiWBg.png)

Application sending OpenTelemetry data directly to Lightstep. Diagram by [Adri Villela](https://adri-v.medium.com/).

Our sample application is a Flask application. We will be leveraging both automatic and manual instrumentation.

Let’s look at this in greater detail below.

#### 1- Set up your environment

Let’s set up our working directory and our Python virtual environment

```
mkdir otel_pythoncd otel_python
```

```
python3 -m venv .source ./bin/activatetouch server.py
```

Open `server.py`, and paste the following:

#### 2- Install the required OTel libraries

These are the libraries that are required to send data to an **_Observability back-end_** (e.g Lightstep).

```
# OTel-specificpip install opentelemetry-distropip install 
```

```
# App-specificpip install flaskpip install requests
```

A few noteworthy items:

*   Installing `opentelemetry-distro` will install a number of other dependent packages for instrumenting code, including `opentelemetry-api` and `opentelemetry-sdk`, and our auto-instrumentation wrapper binary, `opentelemetry-instrument`.
*   The `opentelemetry-exporter-otlp` package is used to send OTel data to your Observability back-end (e.g. Lightstep). Installing it in turn installs `opentelemetry-exporter-otlp-proto-grpc` (send data via gRPC) and `opentelemetry-exporter-otlp-proto-http` (send data via HTTP).

#### 3- Install auto-instrumentation

As you may recall from earlier in this post, Python auto-instrumentation includes a binary that wraps our Python application and automagically adds some high-level instrumentation for us. But that’s only part of the picture. There are [Python auto-instrumentation libraries](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation) available for a number of popular Python libraries (e.g. Flask, requests). Using these auto-instrumentation libraries, along with `opentelemetry-instrument`, gives us auto-instrumentation superpowers. 💪

So how do we install these auto-instrumentation libraries? Well, there’s a handy little tool for that, called `opentelemetry-bootstrap`. It was installed as part of our installation of `opentelemetry-distro`.

Let’s run it:

```
opentelemetry-bootstrap -a install
```

So what does this do? The above command will read through the packages installed in your active `site-packages` folder, and will install the applicable auto-instrumentation libraries. For example, if you already installed the `flask` and `requests` packages (as we did in Step 2), running `opentelemetry-bootstrap -a install` will install `opentelemetry-instrumentation-flask` and `opentelemetry-instrumentation-requests` for you. If you leave out `-a install`, it will simply list out the recommended auto-instrumentation packages to be installed.

For more information on `opentelemetry-bootstrap`, check out the [official OpenTelemetry docs](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap).

#### 4- Run the app

Here’s where it gets interesting! Normally to run this app, we’d run it like this:

```
python server.py
```

But if we did that, we wouldn’t be sending any OTel data to Lightstep. So we must instead do this:

```
export OTEL_EXPORTER_OTLP_TRACES_HEADERS="lightstep-access-token=<LS_ACCESS_TOKEN>"
```

opentelemetry-instrument \\  
           --traces\_exporter console,otlp\_proto\_grpc \\  
           --metrics\_exporter console,otlp\_proto\_grpc \\  
           --service\_name `test-py-auto-otlp-grpc-server` \\  
           --exporter\_otlp\_endpoint "ingest.lightstep.com:443" \\  
           python server.py

Some noteworthy items:

*   Replace `<LS_ACCESS_TOKEN>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).
*   `--traces_exporter` and `--metrics_exporter` tell us where to send our traces and metrics to, respectively. In this case, we want to send them to `console` (stdout) and `otlp_proto_grpc`. The `otlp_proto_grpc` option tells `opentelemetry-instrument` that we want to send it to an endpoint that accepts OTLP over gRPC. You could also use `otlp` instead, as it is an alias for `otlp_proto_grpc`. The full list of available options for `--traces_exporter` can be found [here](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation).
*   `--exporter_otlp_endpoint` tells `opentelemetry-instrument` the OTLP endpoint to send our traces directly to Lightstep, at `ingest.lightstep.com:443`.
*   `--service_name` sets the name of our service. This is the value that we'll see in the Lightstep service explorer.
*   Note that the last line is `python server.py`, which is where we run our app. Here `opentelemetry-instrument` is wrapping the call to `python server.py`

Sample output:

![Screen capture of server.py startup sequence output.](https://cdn-images-1.medium.com/max/800/1*E6IcfC8OuLBWUfqRboNVpQ.png)

Screen capture of server.py startup sequence output. Screenshot by [Adri Villela](http://adri-v.medium.com).

Want to use HTTP instead of gRPC? First, you need to make sure that the `pip` package `opentelemetry-exporter-otlp-proto-http` is installed (should be automagically installed as part of installing `opentelemetry-exporter-otlp`).

Next, your `opentelemetry-instrument` command would look like this:

opentelemetry-instrument \\  
  --traces\_exporter console,otlp\_proto\_http \\  
  --metrics\_exporter console \\  
  --service\_name `test-py-auto-otlp-server` \\  
  --exporter\_otlp\_traces\_endpoint "https://ingest.lightstep.com:443/traces/otlp/v0.9" \\  
  python server.py

Some noteworthy items:

*   The `traces_exporter` uses `otlp_proto_http` instead of `otlp_proto_grpc`.
*   The `exporter_otlp_traces_endpoint` is `https://ingest.lightstep.com/traces/otlp/v0.9` (see [docs](http://localhost:4000/docs/test-connectivity-to-microsatellites), instead of `ingest.lightstep.com:443`).
*   There is currently no metrics support for `otlp_proto_http` and there is no `exporter_otlp_metrics_endpoint` option, which is why metrics are being sent to `console` only. Run `opentelemetry-instrument --help` for the full list of options.

#### 5- Call the /rolldice service

Open up a new terminal window, and run the following:

```
curl http://localhost:8082/rolldice
```

Running the above line will return a random number between 1 and 6. Nothing too remarkable there. But if you look over at the terminal window for `server.py`, you'll notice something in the output:

![Screen capture of server.py output after calling /rolldice endpoint, showing trace output as JSON.](https://cdn-images-1.medium.com/max/800/1*mZJhO3cvpEU7J10eOWZAtw.png)

Screen capture of server.py output after calling /rolldice endpoint. Screenshot by [Adri Villela](http://adri-v.medium.com).

We see the trace from `server.py`! Why are we seeing this here? Because we set the `--traces_exporter` flag to `console,otlp_proto_grpc`, which exports to Lightstep via OTLP _and_ to the console.

#### 6- See it in Lightstep

![Screen capture of test-py-auto-otlp-server service in Lightstep.](https://cdn-images-1.medium.com/max/800/1*N_oIDZ2TiIG6S6JoZfnSgA.png)

Screen capture of test-py-auto-otlp-server service in Lightstep. Screenshot by [Adri Villela](http://adri-v.medium.com).

### OpenTelemetry Collector

The next approach to sending data to an Observability back-end is by way of the [OpenTelemetry (OTel) Collector](https://opentelemetry.io/docs/collector). For non-development setups, this is the recommended approach to send OpenTelemetry data to your Observability back-end.

![Application sending OpenTelemetry data to Lightstep via OTel Collector.](https://cdn-images-1.medium.com/max/800/1*OgPYdMooFV9gm-CXZv2maw.png)

Application sending OpenTelemetry data to Lightstep via OTel Collector. Diagram by [Adri Villela](https://adri-v.medium.com/).

Sending OTel data via the OTel Collector is _almost identical_ to what we did in the Direct from Application example above. The only difference is that:

*   We need to run an OTel Collector
*   When we run `opentelemetry-instrument`, our options are slightly different

Let’s look at this in greater detail below.

#### 1- Follow Steps 1–3 from the “Direct from Application” example

#### 2- Run the Collector

First, we need to configure our Collector for sending data to Lightstep. We do this by grabbing `collector.yml` from Lightstep's `opentelemetry-examples` repo.

```
git clone git@github.com:lightstep/opentelemetry-examples.git
```

Open up a new terminal window. First, you’ll need to edit the `collector.yaml` file. Be sure to replace `${LIGHTSTEP_ACCESS_TOKEN}` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).

Now you can start up the Collector:

```
cd opentelemetry-examples/collector/vanilla
```

```
docker run -it --rm -p 4317:4317 -p 4318:4318 \    -v $(pwd)/collector.yaml:/otel-config.yaml \    --name otelcol otel/opentelemetry-collector-contrib:0.53.0  \    "/otelcol-contrib" \    "--config=otel-config.yaml"
```

Sample output:

![Screen capture of OTel Collector startup sequence.](https://cdn-images-1.medium.com/max/800/1*Y8jtE7T4j3rDxy4sjhLC5w.png)

Screen capture OTel Collector startup sequence. Screenshot by [Adri Villela](https://adri-v.medium.com/).

#### 3- Run the app

```
opentelemetry-instrument \   --traces_exporter console,otlp \   --metrics_exporter console,otlp \   --service_name test-py-auto-collector-server \   python server.py
```

Notice that the endpoint isn’t specified. That’s because it assumes that you are using the default Collector gRPC endpoint, `0.0.0.0:4317`. The above command is the equivalent of saying:

opentelemetry-instrument \\  
  --traces\_exporter console,otlp \\  
  --metrics\_exporter console,otlp\\  
  --service\_name `test-py-auto-collector-server` \\  
  --exporter\_otlp\_endpoint "0.0.0.0:4317" \\  
  --exporter\_otlp\_insecure true \\  
  python server.py

If you specify the endpoint, you must also specify `--exporter_otlp_insecure true` if a certificate isn’t configured with your Collector.

Some additional noteworthy items:

*   `otlp`, used in configuring `traces_exporter` and `metrics_exporter`, is equivalent to using `otlp_proto_grpc`
*   To use a different Collector endpoint, simply replace it with your own. Remember to add `--exporter_otlp_insecure true` if you don’t have a Certificate configured with your Collector.
*   You don’t need to set `OTEL_EXPORTER_OTLP_TRACES_HEADERS`, because that's already configured in the Collector's [config.yml](https://github.com/lightstep/opentelemetry-examples/blob/main/collector/vanilla/collector.yml) file.

If you wish to use HTTP instead of gRPC, the command would then look like this:

opentelemetry-instrument \\  
  --traces\_exporter console,otlp\_proto\_http \\  
  --metrics\_exporter console,otlp\_proto\_http \\  
  --service\_name `test-py-auto-collector-server` \\  
  python server.py

Which is the same as saying:

opentelemetry-instrument \\  
  --traces\_exporter console,otlp\_proto\_http \\  
  --metrics\_exporter console,otlp\_proto\_http \\  
  --service\_name `test-py-auto-collector-server` \\  
  --exporter\_otlp\_endpoint "http://0.0.0.0:4318" \\  
  --exporter\_otlp\_insecure true \\  
  python server.py

Again, if you wish to use your own Collector endpoint, simply replace the value in `exporter_otlp_endpoint`, making sure that you prefix it with `http://` or `[https://](https://.)`. Remember to add `--exporter_otlp_insecure true` if you don’t have a Certificate configured with your Collector.

Okay. Enough banter. Let’s look at the sample output:

![Screen capture of server.py startup sequence output.](https://cdn-images-1.medium.com/max/800/1*E6IcfC8OuLBWUfqRboNVpQ.png)

Screen capture of server.py startup sequence output. Screenshot by [Adri Villela](http://adri-v.medium.com).

#### 4- Call the /rolldice service

Open up a new terminal window, and run the following:

```
curl http://localhost:8082/rolldice
```

Sample output:

![Screen capture of server.py output after calling /rolldice endpoint.](https://cdn-images-1.medium.com/max/800/1*mZJhO3cvpEU7J10eOWZAtw.png)

Screen capture of server.py output after calling /rolldice endpoint. Screenshot by [Adri Villela](http://adri-v.medium.com).

Again, we see the trace for `server.py` because we set the --traces\_exporter flag to console,otlp, which exports to the Collector via OTLP _and_ to the console.

#### 5- See it in Lightstep

![Screen capture of test-py-auto-collector-server service in Lightstep.](https://cdn-images-1.medium.com/max/800/1*NR2-hFMqY6INZ9PjVCZNVg.png)

Screen capture of test-py-auto-collector-server service in Lightstep. Screenshot by [Adri Villela](http://adri-v.medium.com).

### Launcher

If you thought it was easy-peasey to send OTel data to Lightstep à la auto-instrumentation binary, then it’s even easier to do it via the [OTel Python Launcher](https://github.com/lightstep/otel-launcher-python)! Think of it as an OTel wrapper to make it extra-easy to send data to Lightstep, by having a bunch of things pre-configured for you to lower that barrier to entry.

Sending OTel data via the Launcher is _almost identical_ to what we did in the Direct from Application example above, with a few minor differences:

*   We have fewer packages to (yay!)
*   When we run `opentelemetry-instrument`, our options are slightly different

Let’s see it in action shall we?

#### 1- Follow Steps 1–3 from the “Direct from Application” example

Minor change: replace the libraries from Step 2 with these:

```
# OTel-specificpip install opentelemetry-launcherpip install protobuf==3.20.1
```

```
# App-specificpip install requestspip install flask
```

We need to force a specific version of `protobuf` because of Launcher compatibility issues with newer versions. This was [already fixed](https://github.com/open-telemetry/opentelemetry-python/pull/2720) in [opentelemetry-python](https://github.com/open-telemetry/opentelemetry-python).

#### 2- Run the app

Be sure to replace `<LS_ACCESS_TOKEN>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).

```
export LS_ACCESS_TOKEN="<LS_ACCESS_TOKEN>"
```

```
opentelemetry-instrument \    --service_name test-py-auto-launcher-server \    python server.py
```

Looks like we have fewer options, don’t we? Let’s dig in a bit to some noteworthy items:

*   We don’t need to specify an `--exporter_otlp_traces_endpoint`, because that's already implicitly done for us, and as set to `ingest.lightstep.com:443`.
*   Instead of setting a messy-looking environment var for our [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens) (`export OTEL_EXPORTER_OTLP_TRACES_HEADERS="lightstep-access-token=<LS_ACCESS_TOKEN>"`), we just have to do this: `export LS_ACCESS_TOKEN="<LS_ACCESS_TOKEN>"`, which looks way cleaner.

If you wish to send your OTel data to Lightstep via a Collector, rather than direct from your application, you would do this instead:

```
opentelemetry-instrument \    --service_name test-py-auto-launcher-server \    --exporter_otlp_traces_endpoint "0.0.0.0:4317" \    --exporter_otlp_traces_insecure true \    python server.py
```

Noteworthy items:

*   Do not set `LS_ACCESS_TOKEN`, since that's already configured in the Collector's [config.yml](https://github.com/lightstep/opentelemetry-examples/blob/main/collector/vanilla/collector.yml) file.
*   If you attempt to override `exporter_otlp_endpoint` to send traces to a Collector, the traces will be sent directly to `ingest.lightstep.com:443` instead of via the Collector. Instead, you need to override `exporter_otlp_traces_endpoint`,
*   `exporter_otlp_traces_endpoint` sends traces to a Collector running on `0.0.0.0:4317` (gRPC). If you wish to use a different Collector address, simply include `exporter_otlp_traces_endpoint`, using your own Collector’s endpoint.
*   `exporter_otlp_traces_insecure` is set to `true`. This is required if you are using a Collector **_and_** if a certificate isn’t configured in the Collector.
*   There is currently no HTTP support for Python Launchers.

Sample output:

![Screen capture of server.py startup sequence output after calling /rolldice endpoint.](https://cdn-images-1.medium.com/max/800/1*E6IcfC8OuLBWUfqRboNVpQ.png)

Screen capture of server.py startup sequence output after calling /rolldice endpoint. Screenshot by [Adri Villela](http://adri-v.medium.com).

#### 3- Call the /rolldice service

Open up a new terminal window, and run the following:

```
curl http://localhost:8082/rolldice
```

Sample output:

![Screen capture of server.py output (Launcher version).](https://cdn-images-1.medium.com/max/800/1*BbiLVaW2LjxWwpnfJx8XyQ.png)

Screen capture of server.py output (Launcher version). Screenshot by [Adri Villela](http://adri-v.medium.com).

Notice that since our `opentelemetry-instrument` call didn't specify a `--traces_exporter`, it's the equivalent of saying `--traces_exporter otlp_proto_grpc`. I also means that there's no trace output to the console (stdout).

#### 4- See it in Lightstep

![Screen capture of test-py-auto-launcher-server service in Lightstep.](https://cdn-images-1.medium.com/max/800/1*iG3XLplBCkfqIecrosNvFg.png)

Screen capture of test-py-auto-launcher-server service in Lightstep. Screenshot by [Adri Villela](http://adri-v.medium.com).

### Should I always use the auto-instrumentation binary?

Is `opentelemetry-instrument` still helpful even if you're not using a Python library that's not auto-instrumented? Personally, I think so! Consider this file, `client.py`:

Let’s run the above program with the auto-instrumentation binary. Be sure to replace `<LS_ACCESS_TOKEN>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).

```
export OTEL_EXPORTER_OTLP_TRACES_HEADERS="lightstep-access-token=<LS_ACCESS_TOKEN>"
```

```
opentelemetry-instrument \    --traces_exporter console,otlp \    --service_name test-py-auto-client \    --exporter_otlp_endpoint "ingest.lightstep.com:443" \    python client.py test
```

Notice that aside from creating spans in `client.py`, there's no OTel configuration in there. You don't configure the service name, the exporter, or the endpoint. That's all taken care of when you run `opentelemetry-instrument`. Plus, if your code happens to use a library that is auto-instrumented, you don't have to do anything else.

> **Note:** _If you’re wondering why we’re executing the command_ `_python client.py test_`_, it's because_ `_client.py_` _takes a single parameter, which in this case is called_ `_test_`_._

### gRPC Debugging

Do you ever wonder if your gRPC calls are going into a black hole? I definitely do! When I was mucking around with gRPC for the Golang OTel libraries, I learned about some gRPC debug flags that would make my life easier for troubleshooting gRPC connectivity issues. Which of course got me wondering if there was a Python equivalent. Turns out there is. Set these environment variables before running your app, and you’re golden:

```
export GRPC_VERBOSITY=debugexport GRPC_TRACE=http,call_error,connectivity_state
```

This means that when we start up our `server.py`, we get something like this:

![Screen capture of server.py startup sequence output with gRPC debugging enabled.](https://cdn-images-1.medium.com/max/800/1*tZ6ScueNtakuuEInYIzruQ.png)

Screen capture of server.py startup sequence output with gRPC debugging enabled. Screenshot by [Adri Villela](http://adri-v.medium.com).

And then when we call our endpoint via `curl`, we get this:

![Screen capture of server.py output after calling /rolldice endpoint showing successful gRPC call.](https://cdn-images-1.medium.com/max/800/1*fMDtuiMFNWg_WKC3cSNELQ.png)

Screen capture of server.py output after calling /rolldice endpoint showing successful gRPC call. Screenshot by [Adri Villela](http://adri-v.medium.com).

The part highlighted above tells me that our gRPC call was successful!

### Final Thoughts

Auto-instrumentation in Python is pretty freaking awesome, and it really lowers the barrier to entry for OpenTelemetry. As we saw with the Direct from Application and Collector examples, the code stays pretty much the same. The only difference is that you need to change up some flags so that the auto-instrumentation binary knows where to send your traces to. Nice and easy!

In case you’re wondering, there is a totally pure OTel Python manual instrumentation approach, which I will cover in a future blog post, so stay tuned! For now, bask in the fact that you learned something super cool today about OTel Python auto-instrumentation!

And now, I will reward you with a picture of my rat Phoebe getting some cuddles.

![](https://cdn-images-1.medium.com/max/800/1*0PGDzfy0nYVxmQ_7eJ5T2Q.jpeg)

Phoebe the rat getting some nice cuddles from her humans. Photo by [Adri Villela](http://adri-v.medium.com).

Peace, love, and code. 🦄 🌈 💫

Got questions about OTel instrumentation with Python? Talk to me! Feel free to connect through [e-mail](mailto:devrel@lightstep.com), or hit me up on [Twitter](https://twitter.com/adrianamvillela) or [LinkedIn](https://www.linkedin.com/in/adrianavillela). Hope to hear from y’all!

For more Observability articles, check out my Unpacking Observability series:

[**Unpacking Observability**  
_Stories to help you understand Observability and OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/be1835c6dd23 "https://adri-v.medium.com/list/be1835c6dd23")[](https://adri-v.medium.com/list/be1835c6dd23)

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep)_._

![](https://cdn-images-1.medium.com/max/800/0*ZkIPcvOhIVD_xG4i.png)

#### If this post was helpful, please click the clap 👏 button below a few times to show your support for the author 👇

#### 🚀Developers: Learn and grow by keeping up with what matters, [JOIN FAUN.](https://faun.to/8zxxd)

By [Adriana Villela](https://medium.com/@adri-v) on [September 9, 2022](https://medium.com/p/aa1ffaeeb5e6).

[Canonical link](https://medium.com/@adri-v/auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep-aa1ffaeeb5e6)

Exported from [Medium](https://medium.com) on June 3, 2026.