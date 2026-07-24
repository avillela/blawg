---
title: "OpenTelemetry for Python: Manual Configuration & Context Propagation"
slug: opentelemetry-for-python-manual-configuration-context-propagation
description: "Instrumenting your Python application with OpenTelemetry through manual configuration and manual context propagation using an OTLP back-end"
added: "Sep 23, 2022"
tags:
  - technical
  - observability
  - opentelemetry
  - lightstep
  - "2022"
---


![](https://cdn-images-1.medium.com/max/800/1*_Lca7zZ3wgAGSsFZF-IHzg.jpeg)

Gears for opening/closing locks at the Rideau Canal in Ottawa. Photo by [Adri Villela](https://adri-v.medium.com).

In my [last blog post](https://lightstep.com/blog/auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep), I showed y’all how to instrument Python code with [OpenTelemetry (OTel)](https://lightstep.com/blog/opentelemetry.io), à la [auto-instrumentation](https://lightstep.com/blog/auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep#automatic-instrumentation--python). You may also recall from that post that I [recommended using the Python auto-instrumentation binary](https://lightstep.com/blog/auto-instrumentation-is-magic-using-opentelemetry-python-with-lightstep#should-i-always-use-the-auto-instrumentation-agent) even for non-auto-instrumented libraries, because it abstracts all that pesky OTel config stuff so nicely. When you use it, along with any applicable Python auto[\-instrumentation libraries](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/instrumentation) (installed courtesy of [opentelemetry-bootstrap](https://github.com/open-telemetry/opentelemetry-python-contrib/tree/main/opentelemetry-instrumentation#opentelemetry-bootstrap)), it takes care of context propagation across related services for you.

All in all, it makes life nice ‘n easy for us!

Well, today, my friends, we’re going to torture ourselves a weeeee bit, because we’re going to put that auto-instrumentation binary aside, and will instead dig into super-duper manual OpenTelemetry instrumentation for Python. Since we don’t have auto-instrumentation as our security blanket, we will have to learn how to do the following:

*   Configure OpenTelemetry for Python to send instrumentation data to an Observability back-end that supports [OTLP](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md). Spoiler alert: we’ll be using [Lightstep](http://app.lightstep.com) as our Observability back-end. ✅
*   Propagate context across related services so that they show up as part of the same trace ✅

> _I won’t go into how to create Spans with OTel for Python, since the_ [_official OTel docs_](https://opentelemetry.io/docs/instrumentation/python) _do a mighty fine job of it._

Are you scared? Well don’t be, because I’ve figured it all out so that you don’t have to!

Are you readyyyyy? Let’s do this!!

### Pre-Requisites

Before we start our tutorial, here are some things that you’ll need:

*   A basic understanding of [Python](https://www.python.org/) and [Python virtual environments](https://realpython.com/python-virtual-environments-a-primer)
*   A basic understanding of [OpenTelemetry](https://lightstep.com/blog/opentelemetry.io). I suggest checking out the [official OTel Docs](http://opentelemetry.io/docs) for refresher, if you need one.

If you’d like to run the full code examples in Part 2, you’ll also need:

*   A [Lightstep Observability account](https://app.lightstep.com/signup/developer?signup_source=docs)
*   A [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens) to tell Lightstep what project to send your traces to
*   A basic understanding of how to use [Lightstep Observability](http://app.lightstep.com/)
*   A working installation of [Python](https://www.python.org/downloads)

### Part 1: What’s Happening?

We’ll be illustrating Python manual instrumentation with OpenTelemetry with a client and server app. The client will call a `/ping` endpoint hosted by the server.

The example in this tutorial can be found in the [lightstep/opentelemetry-examples](https://github.com/lightstep/opentelemetry-examples/tree/main/python/opentelemetry/manual_instrumentation) repo. We will be working with three main files:

*   [common.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/common.py) — OTel configuration and connectivity (to connect to Lightstep)
*   [client.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/client.py) — Connect to our server’s `/ping` endpoint
*   [server.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/server.py) — Host the `/ping` endpoint

Before we run the example code, we must first understand what it’s doing.

#### 1- OTel Libraries

In order to send OpenTelemetry data to an Observability back-end (e.g Lightstep), you need to install the following **_OpenTelemetry packages_**, which are included in [requirements.txt](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/requirements.txt):

```
opentelemetry-apiopentelemetry-sdkopentelemetry-exporter-otlp-proto-grpc
```

As you can see, we’re installing the OpenTelemetry API and SDK packages, along with `opentelemetry-exporter-otlp-proto-grpc`, which is used to send OTel data to your Observability back-end (e.g. Lightstep) via [gRPC](https://opentelemetry.io/docs/concepts/glossary/#grpc).

#### 2- OTel Setup and Configuration (common.py)

In our example, OTel setup and configuration is done in [common.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/common.py). We split things out into this separate file so that we don’t have to duplicate this code in [client.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/client.py) and [server.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/server.py).

First, we must import the required OTel packages:

```
from opentelemetry import tracefrom opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporterfrom opentelemetry.sdk.resources import SERVICE_NAME, Resourcefrom opentelemetry.sdk.trace import TracerProviderfrom opentelemetry.sdk.trace.export import BatchSpanProcessor
```

Next, we must configure the Exporter. An **Exporter** is how we send data to OpenTelemetry. As I mentioned earlier, Lightstep accepts data in the OTLP format, so we need to define an OTLP Exporter.

> _Some vendors don’t accept data in OTLP format, which means that you will need to use a_ [_vendor-specific exporter_](https://opentelemetry.io/registry/?language=go&component=exporter) _to send data to them._

We configure our Exporter in Python like this:

```
def get_otlp_exporter():   ls_access_token = os.environ.get("LS_ACCESS_TOKEN")   return OTLPSpanExporter(       endpoint="ingest.lightstep.com:443",       headers=(("lightstep-access-token", ls_access_token),),   )
```

Some noteworthy items:

*   The `endpoint` is set to `ingest.lightstep.com:443`, which points to Lightstep's public Microsatellite pool. If you are using an on-premise satellite pool, then check out [these docs](http://localhost:4000/docs/test-connectivity-to-microsatellites).
*   You will need to set the `LS_ACCESS_TOKEN` environment variable with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).

Finally, we configure the Tracer Provider. A `TracerProvider` serves as the entry point of the OpenTelemetry API. It provides access to `Tracer`s. A `Tracer` is responsible for creating a [Span](https://opentelemetry.io/docs/concepts/observability-primer/#spans) to trace the given operation.

We configure our Tracer Provider in Python like this:

A few noteworthy items:

*   We define a [Resource](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/sdk.md) to provide OpenTelemetry with a bunch of information that identifies our service, including [service name](https://github.com/open-telemetry/opentelemetry-python/blob/41b9e26d8324ae0496c85326b35e92bf617932d9/opentelemetry-semantic-conventions/src/opentelemetry/semconv/resource/__init__.py#L415) and [service version](https://github.com/open-telemetry/opentelemetry-python/blob/41b9e26d8324ae0496c85326b35e92bf617932d9/opentelemetry-semantic-conventions/src/opentelemetry/semconv/resource/__init__.py#L433). (You can see a full list of Resource attributes that you can set [here](https://github.com/open-telemetry/opentelemetry-python/blob/main/opentelemetry-semantic-conventions/src/opentelemetry/semconv/resource/__init__.py#L433).) As the name implies, _service name_ is the name of the microservice that you are instrumenting, and _service version_ is the version of the service that you are instrumenting. In this example, we get the service name and service version are passed in as key/value in the environment variable, [OTEL\_RESOURCE\_ATTRIBUTES](https://opentelemetry.io/docs/reference/specification/sdk-environment-variables/#general-sdk-configuration) (we’ll see some example values in Part 2). If that environment variable is not present, we then set a default service name, `"test-py-manual-otlp"`.
*   We are using the [BatchSpanProcessor](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/sdk.md#batching-processor), which means that we are telling OTel to export the data in batches. For the purposes of this example, we’re not doing anything beyond a basic configuration.

#### 3- Initialization (client.py and server.py)

We’re finally ready to send data to Lightstep! All we need to do is call [common.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/common.py)’s `get_tracer` function from `client.py` (Lines [17-20](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/client.py#L17-L20)) and `server.py` (Lines [17](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/server.py#L17) and [29](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/server.py#L29)), like this:

```
from common import get_tracer...tracer = get_tracer()...
```

With initialization done, we need to instrument our code, which means that we’ll need to create Spans. I won’t go into the specifics of Span creation here, since [the OTel docs](https://opentelemetry.io/docs/instrumentation/python) do a pretty good job of it, and as I mentioned in the intro, it’s outside of the scope of this post.

I will, however, briefly mention that there are a couple of ways to instrument our code in Python, and you’ll see both ways of Span creation in the example code: [using the with statement](https://opentelemetry.io/docs/instrumentation/python/manual/#creating-spans), and [using function decorators](https://opentelemetry.io/docs/instrumentation/python/manual/#creating-spans-with-decorators).

You can see an example of creating a Span using the [with statement](https://opentelemetry.io/docs/instrumentation/python/manual/#creating-spans) in [client.py, Lines 23–32](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/client.py#L23-L32). Below is the full function listing:

The Span is initialized with the line, `with tracer.start_as_current_span("client operation"):`, and everything below that line is within the scope of that Span.

You can see an example of creating a Span using a [function decorator](https://opentelemetry.io/docs/instrumentation/python/manual/#creating-spans-with-decorators) in [server.py Line 78](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/server.py#L78). Below is the full function listing:

A few noteworthy items:

*   The line `@tracer.start_as_current_span("pymongo_integration")` starts the Span for the `pymongo_integration` function. Everything in that function is within the scope of that Span.
*   You may have also noticed that we initialize another span in there, with the line, `with tracer.start_as_current_span("server pymongo operation"):`, ([server.py, Line 89](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/server.py#L89)). This means that we end up with [nested Spans](https://opentelemetry.io/docs/instrumentation/python/manual/#creating-nested-spans) (a Span within a Span).

#### 5- Context Propagation

As I mentioned in the intro, one of the advantages of using Python auto-instrumentation is that it takes care of context propagation across services for you. If you don’t use auto-instrumentation, however, you have to take care of context propagation yourself. Great. Just great.

But before we dig into how to do that, we need to first understand context propagation.

Definition time!

**Context** represents the information that correlates Spans across process boundaries.

**Propagation** is the means by which context is bundled and transferred in and across services, often via HTTP headers.

This means that when one service calls another, they will be linked together as part of the same [Trace](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces). If you go the pure manual instrumentation route (like we’re doing today), however, you have to make sure that your context is propagated across services that call each other, otherwise you’ll end up with separate, unrelated-even-though-they-should-be-related) Traces.

I have to admit that I was wracking my brains trying to figure out this context propagation stuff. After much time spent Googling and asking folks around here for clarification, I finally got it, so I’m going to share this piece with you here to hopefully spare you some stress.

> _Although the OpenTelemetry documentation does provide some insight into how to do_ [_manual context propagation in Python_](https://opentelemetry.io/docs/instrumentation/python/cookbook/#manually-setting-span-context)_, the documentation needs a little work. I’m actually part of the_ [_OpenTelemetry Comms SIG_](https://github.com/open-telemetry/opentelemetry.io)_, so I am using this as motivation to improve the docs around this topic…stay tuned for updates to the OTel docs too! 😎_

Okay, so how do we do this manual context propagation? First, let’s remind ourselves of what’s happening in our example app. We have a [client](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/client.py) service and a [server](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/server.py) service. The client service calls the `/ping` endpoint on the server service, which means that we expect them to be part of the same Trace. This in turn means that we have to ensure that they both have the same Trace ID in order to be seen by Lightstep (and other Observability back-ends) as being related.

At a high level, we accomplish this by:

*   Getting the Trace ID of the client
*   Injecting the Trace ID into the HTTP header before the client calls the server
*   Extracting the client’s Trace ID from the HTTP header on the server side

Easy peasey! Now let’s look at the code that needs to make this happen.

First, we need to start with something called a `carrier`. A `carrier` is just a key-value pair containing a Trace ID, and it looks something like this:

```
{'traceparent': '00-a9c3b99a95cc045e573e163c3ac80a77-d99d251a8caecd06-01'}
```

Where `traceparent` is the key, and the value is your Trace ID. Note that the above is just an example of what a Trace ID might look like. Obviously, your own Trace ID will be different (and will be different each time you run the code).

Okay, great. Now how do we obtain said `carrier`?

First, we need to import a `TraceContextTextMapPropagator` in [client.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/client.py):

```
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
```

Next, we must populate the carrier:

```
carrier = {}TraceContextTextMapPropagator().inject(carrier)
```

If you were to inspect the value of `carrier` after this line, you would see that it would look something like this:

```
{'traceparent': '00-a9c3b99a95cc045e573e163c3ac80a77-d99d251a8caecd06-01'}
```

Look familiar? 🤯

Now that we have the `carrier`, we need to put it into our HTTP header before we make a call to the server.

```
header = {"traceparent": carrier["traceparent"]}res = requests.get(url, headers=header)
```

And voilà! Your carrier is in the HTTP request!

Now that we know what all of these snippets do, let’s put it all together. Here’s what our client code looks like:

For the full code listing, check out [client.py](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/client.py).

Okay…we’ve got things sorted out on the client side. Yay! Now let’s go to the server side and pluck our `carrier` from the HTTP request.

In [server.py](https://github.com/lightstep/opentelemetry-examples/blob/main/python/opentelemetry/manual_instrumentation/server.py), we pull the value of `traceparent` from our header like this:

```
traceparent = get_header_from_flask_request(request, "traceparent")
```

Where we define `get_header_from_flask_request` as:

```
def get_header_from_flask_request(request, key):    return request.headers.get_all(key)
```

Now we can build our `carrier` from this information:

```
carrier = {"traceparent": traceparent[0]}
```

We use that to extract the context from this `carrier`:

```
ctx = TraceContextTextMapPropagator().extract(carrier)
```

Now we can create our Span with the context, `ctx`:

```
with tracer.start_as_current_span("/ping", context=ctx):
```

Here, we are passing `ctx` to a named parameter called `context`. This ensures that our `"/ping"` Span knows that it's part of an existing Trace (the one originating from our client call).

It is worth noting that any child Spans of the `"/ping"` Span do not require us to pass in a context, since that's passed in implicitly (see [server.py, Line 81](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/server.py#L81), for example).

Now that we know what all of these snippets do, let’s put it all together. Here’s what our server code looks like:

For the full code listing, check out [server.py](https://github.com/lightstep/opentelemetry-examples/blob/49f018f2cb529a5c0def6109c7e0bfda791e1164/python/opentelemetry/manual_instrumentation/server.py).

### Part 2: Try it!

Now that we know the theory behind all of this, let’s run our example!

#### 1- Clone the repo

```
git clone https://github.com/lightstep/opentelemetry-examples.git
```

#### 2- Setup

Let’s first start by setting up our Python virtual environment:

```
cd python/opentelemetry/manual_instrumentationpython3 -m venv .source ./bin/activate# Install requirements.txtpip install -r requirements.txt
```

#### 3- Run the Server app

We’re ready to run the server. Be sure to replace `<LS_ACCESS_TOKEN>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).

```
export LS_ACCESS_TOKEN="<LS_ACCESS_TOKEN>"
```

```
export OTEL_RESOURCE_ATTRIBUTES=service.name=py-opentelemetry-manual-otlp-server,service.version=10.10.9
```

```
python server.py
```

Remember how I told you that we’d see an example of values passed into [OTEL\_RESOURCE\_ATTRIBUTES](https://opentelemetry.io/docs/reference/specification/sdk-environment-variables/#general-sdk-configuration)? Well, here it is! Here, we’re passing in the service name `py-opentelemetry-manual-otlp-server`, and service version `10.10.9`. The service name will show up in the Lightstep explorer.

Your output will look something like this:

![Screen capture of Python server.py server startup sequence output.](https://cdn-images-1.medium.com/max/800/0*d1STIMKIosVbnXyQ)

Screen capture of Python server.py server startup sequence output. Screens shot by [Adri Villela](https://adri-v.medium.com).

#### 4- Run the Client app

Open up a new terminal window, and run the client app. Be sure to replace `<LS_ACCESS_TOKEN>` with your own [Lightstep Access Token](https://docs.lightstep.com/docs/create-and-manage-access-tokens).

PS: Make sure you’re in `python/opentelemetry/manual_instrumentation` in the `opentelemetry-examples` repo root.

```
export LS_ACCESS_TOKEN = "<LS_ACCESS_TOKEN>"
```

```
export OTEL_RESOURCE_ATTRIBUTES =service.name=py-opentelemetry-manual-otlp-client,service.version= 10.10.10 
```

```
python client.py test
```

Note how we’re passing in the service name `py-opentelemetry-manual-otlp-client`, and service version `10.10.10`. The service name will show up in the Lightstep explorer.

When you run the client app, it will continuously call the `/ping` endpoint. Let it run a few times (maybe 5-6 times-ish?), and kill it (à la `ctrl+c`). Sample output:

![Screen capture of sample client.py output.](https://cdn-images-1.medium.com/max/800/0*MH3wYISbmVdLpv8W)

Screen capture of sample client.py output. Screen shot by [Adri Villela](https://adri-v.medium.com).

If you peek over at the terminal running `server.py`, you will likely notice a super-ugly stack trace. DON'T PANIC! The `/ping` service makes calls to [Redis](https://redis.com) and [MongoDB](https://www.mongodb.com), and since neither of these services is running, you end up getting some nasty error messages like this:

![Screen capture of sample server.py program output run with error.](https://cdn-images-1.medium.com/max/800/0*ODjidrYSJKjQuLt_)

Screen capture of sample server.py program output run with error. Screen shot by [Adri Villela](https://adri-v.medium.com).

#### 5- See it in Lightstep

If you go to your trace view in Lightstep by selecting the `py-opentelemetry-manual-otlp-client` service from the explorer (you could also see the same thing by going to the `py-opentelemetry-manual-otlp-server` service), you'll see the end-to-end trace showing the client calling the server, and the other functions called within the server.

And remember that stack trace in Step 4? Well, it shows up as an error in your Trace. Which is cool, because it tells you that you have a problem, and pinpoints to where it’s happening! How cool is that??

![Screen capture of end-to-end trace sample of server.py and client.py in Lightstep.](https://cdn-images-1.medium.com/max/800/0*0ekS3DtcJ2SavO9i)

Screen capture of end-to-end trace sample of server.py and client.py in Lightstep. Screen shot by [Adri Villela](https://adri-v.medium.com).

And remember how we never passed our context to the `redis_integration` and `server redis operation` Spans, you can see that `server redis operation` rolls up to `redis_integration`, which rolls up to `/ping`, just like I said it would. Magic! 🪄

### Final Thoughts

Today we learned how to manually configure OpenTelemetry for Python to connect to Lightstep (this also works for any Observability back-end that ingests the [OTLP format](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md)). We also learned how to link related services together through manual context propagation.

Now, if you ever find yourself in a situation whereby you need to either connect to your Observability back-end without the use of the Python auto-instrumentation binary and/or need to manually propagate context across services, you will know how to do it!

Now, please enjoy this cuddly little pile of rats. From front to back: Phoebe, Bunny, and Mookie. They were nice enough to sit still for the camera while my husband held them.

![](https://cdn-images-1.medium.com/max/800/0*LFxHUDMZkavZKpvW)

Pile ‘o rats! Front to back: Phoebe, Bunny, and Mookie. Photo by [Adri Villela](https://adri-v.medium.com).

Peace, love, and code. 🌈 🦄 💫

Got questions about OTel instrumentation with Python? Talk to me! Feel free to connect through [e-mail](mailto:devrel@lightstep.com), or hit me up on [Twitter](https://twitter.com/adrianamvillela) or [LinkedIn](https://www.linkedin.com/in/adrianavillela). Hope to hear from y’all!

For more Observability articles, check out my Unpacking Observability series:

[**Unpacking Observability**  
_Stories to help you understand Observability and OpenTelemetry_adri-v.medium.com](https://adri-v.medium.com/list/be1835c6dd23 "https://adri-v.medium.com/list/be1835c6dd23")[](https://adri-v.medium.com/list/be1835c6dd23)

_Originally published at_ [_https://lightstep.com_](https://lightstep.com/blog/opentelemetry-for-python-the-hard-way)_._

By [Adriana Villela](https://medium.com/@adri-v) on [September 23, 2022](https://medium.com/p/aa3507b87343).

[Canonical link](https://medium.com/@adri-v/opentelemetry-for-python-the-hard-way-aa3507b87343)

Exported from [Medium](https://medium.com) on June 3, 2026.