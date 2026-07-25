---
title: "I Can See Your Goose!"
slug: goose-with-otel
description: "Making AAIF's Goose Observable with OpenTelemetry"
added: "2026-07-24"
tags:
  - technical
  - ai
  - aaif
  - goose
  - open-telemetry
  - "2026"
---

![Two geese stand on grass under a blue sky—one white, one a Canada goose—with a cartoon telescope shown in a speech bubble between them.](/public/images/posts/goose-with-otel/goose-hero-image.png)

If you’ve used AI agents for tech-y things (software development, SRE type stuff, etc), you’ve probably found yourself in a yelling match at some point with your agent trying to understand why the hell it decided to take a particular course of action. Especially if that course of action is destructive or mischievous, like making code changes without permission, for example. Which is why having observable agents is important. 

Now, this is a fairly broad topic. There are lots of different agentic ecosystems out there. So today, I’ll dig into one specific use case: enabling [OpenTelemetry (OTel)](https://opentelemetry.io) on [AAIF's Goose](https://goose-docs.ai) to help make your Goose agents observable.

Let's dig in!

## Goose Overview


## Enabling OTel on Goose

For your convenience, I have [a lovely GitHub repository](https://github.com/avillela/goose-otel-enablement) to accompany this tutorial, including the [dev container](/tag/devcontainers) configuration. If you choose to use the dev container, you will have all of the tools that you need for this tutorial.

### Set up Goose

The instructions in this section are for setting up Goose with with the [Claude ACP](https://goose-docs.ai/docs/guides/acp-providers#claude-acp) provider, which is a wrapper for Claude Code.

> ✨ **FUN FACT:** ACP stands for Agent Client Protocol. It's an open standard that allows AI agents to talk to each other.

#### 1. Install Goose

First things first, you need to set up Goose. When the dev container first builds, it donwloads and installs Goose, and then Goose prompts you to set it up.

You don't need to run the code snippet below, as it's already done for you on dev container initial build, but I've included it for you so you can see how it's being installed.

```bash
GOOSE_RELEASE="v1.43.0"
curl -fsSL https://github.com/aaif-goose/goose/releases/download/${GOOSE_RELEASE}/download_cli.sh | bash
```

#### 2. Configure your provider

These steps show you how to set up Goose with the Claude Code provider.

> **NOTE:** If you need to configure your provider again, run `goose configure`

![select goose provider](/public/images/posts/goose-with-otel/goose-provider.png)

* **How would you like to set up your provider?**: `Manual Configuration`

![select model provider](/public/images/posts/goose-with-otel/goose-model-provider.png)

* **Which model provider should we use?**: `Claude Code CLI`

![set Claude Code CLI command](/public/images/posts/goose-with-otel/goose-claude-code-cli-command.png)

* **Provider Claude Code CLI requires CLAUDE_CODE_COMMAND, please enter a value**: `claude`

![select Claude model](/public/images/posts/goose-with-otel/goose-claude-model.png)

* **Select model**: `claude-sonnet-4-6`

![select thinking effort](/public/images/posts/goose-with-otel/goose-thinking-effort.png)

* **Select thinking effort**: `Low - Better latency, lighter reasoning`

![Goose config success](/public/images/posts/goose-with-otel/goose-config-success.png)

Success!!

Unfortunately, as you were making your selection, you may have noticed that the Claude CLI is deprecated. On top of that, we don't have the option to select `Claude ACP`. ARRGH!! Fortunately, I found a workaround.

First, open your [`Goose config.yaml`](~/.config/goose/config.yaml) file, and locate the code snipped below:

```yaml
active_provider: claude-code
providers:
  claude-code:
    enabled: true
    model: claude-sonnet-4-6
    configured: true
```

Replace `claude-code` with `claude-acp`. Your modified block should look like this:

```yaml
active_provider: claude-acp
providers:
  claude-acp:
    enabled: true
    model: sonnet
    configured: true
```

You also need to globally install the Claude ACP npm package:

```bash
npm install -g @agentclientprotocol/claude-agent-acp
```

For more info, check out out the [Goose ACP docs](https://goose-docs.ai/docs/guides/acp-providers/#claude-acp-configuration).

#### 3. Login to Claude

Open a new terminal window, then start a Claude Code session via the Claude CLI by typing `claude`, and following the login instructions provided.

#### 4. Start Goose

Once Claude is authenticated, open a new terminal window and start Goose:

```bash
goose session
```

![goose session startup](/public/images/posts/goose-with-otel/goose-session.png)

Feel free to ask it a test question. I always like to ask "how many folders in my directory?".

### Enabling OpenTelemetry for Goose

Fun fact: Goose is written in Rust, and is it so happens that it ships with built-in OpenTelemetry instrumentation, courtesy of the [Rust OTel SDK](https://opentelemetry.io/docs/languages/rust/). This allows Goose to emit OTel traces, logs, and metrics.

But you need to enable it.

### 1. Enable telemetry

Upon initial setup, Goose may have given you the following option:

`Enable or disable anonymous usage data collection`

It's kind of confusing, and if you're like me, you might have disabled it initially. It turns out that you need this setting enabled for OTel telemetry emission. Never fear, because there's a way to enable it after the fact. 

Open [`~/.config/goose/config.yaml`](~/.config/goose/config.yaml), and find the configuration called `GOOSE_TELEMETRY_ENABLED`, and set it to `true`:

```yaml
# Before
GOOSE_TELEMETRY_ENABLED: false

# After
GOOSE_TELEMETRY_ENABLED: true
```

But that's only part of the story. We also need to configure a few OTel environment variables.

### 2. Configure environment variables

The OTel environment variables tell OTel where to send the telemetry. These are the ones we need:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
```

Where:
* `OTEL_EXPORTER_OTLP_ENDPOINT` is the destination of our telemetry. In our case, we're sending the telemetry to an [OTel Collector](https://opentelemetry.io/docs/collector/). The Collector is configured to send telemetry data to [Jaeger](https://www.jaegertracing.io/) (traces only) and [Dynatrace](https://dt-url.net/dt-trial) (traces, logs, metrics).
* `OTEL_EXPORTER_OTLP_PROTOCOL` is the protocol we're using for sending our OTel data. OTel supports both gRPC and HTTP. In this case, we're using HTTP. If we were sending via gRPC, the value of `OTEL_EXPORTER_OTLP_PROTOCOL` would be `grpc`, and our endpoint would be `http://localhost:4317` (the OTel Collector listens on port `4317` for gRPC).

> **Full disclosure:** I work at Dynatrace and therefore have access to a Dynatrace environment. Obviously, you don't have to go that route. To make things easier, I have split off the Dynatrace configuration so that you can exclude it if you won't want to use it.

To configure the environment variables, create a copy of [`.env.example`](.env.example):

```bash
cp .env.example .env
```

If you don't want to go the Dynatrace route, you don't need to make any other environment variable configurations.

If you choose to also use [Dynatrace](https://dt-url.net/dt-trial) as your observability backend, uncomment and replace the details for the following environment variables:

* `DT_ENDPOINT`: [your Dynatrace endpoint](https://www.dynatrace.com/news/blog/send-opentelemetry-data-to-dynatrace/#your-dynatrace-tenant)
* `DT_API_TOKEN`: [your Dynatrace API token](https://www.dynatrace.com/news/blog/send-opentelemetry-data-to-dynatrace/#create-a-dynatrace-access-token)

### 3. Start OTel components

Now we're ready to start the OTel Collector and Jaeger. This is done via a [`docker-compose.yaml`](https://github.com/avillela/goose-otel-enablement/blob/main/docker-compose.yml), which starts two containers:

| Service | Image | Exposed ports |
|---|---|---|
| `otel-collector` | `otel/opentelemetry-collector-contrib:0.128.0` | `4317` (gRPC), `4318` (HTTP) |
| `jaeger` | `jaegertracing/jaeger:2.7.0` | `16686` (UI) |


> **NOTE:** If you would like to exclude the Dynatrace components, comment out lines referencing the Dynatrace Collector configuration from [`docker-compose.yaml`](https://github.com/avillela/goose-otel-enablement/blob/main/docker-compose.yml):

Before:

```yaml
otel-collector:
  image: otel/opentelemetry-collector-contrib:0.128.0
  command:
    - "--config=/etc/otel/config.yaml"
    - "--config=/etc/otel/config-dt.yaml"
  volumes:
    - ./src/otel/otel-collector-config.yaml:/etc/otel/config.yaml
    - ./src/otel/otel-collector-config-dt.yaml:/etc/otel/config-dt.yaml
```

After:

```yaml
otel-collector:
  image: otel/opentelemetry-collector-contrib:0.128.0
  command:
  - "--config=/etc/otel/config.yaml"
  # - "--config=/etc/otel/config-dt.yaml"
  volumes:
    - ./src/otel/otel-collector-config.yaml:/etc/otel/config.yaml
    # - ./src/otel/otel-collector-config-dt.yaml:/etc/otel/config-dt.yaml
```

Now you'rea ready to run the script:

```bash
./src/scripts/start-otel.sh .env
```

This starts up Jaeger and the OTel Collector.

**Jaeger UI:** http://localhost:16686

**Dynatrace UI:** https://<your_tenant_id>.live.dynatrace.com

### 5. Start Goose with OTel

You'll need to ensure that the values from your `.env` file are loaded before you start your Goose session, which you can do like this:

```bash
export $(grep -v '^#' .env | xargs) && goose session
```

Then ask Goose a question! I asked my favourite question:

```text
how many folders in my directory?
```

In your observability backend, you will be able to see traces, logs, and metrics for Goose, by filtering on attribute `service.name` = `goose`.

Goose prompts and results are captured in OTel [spans](https://opentelemetry.io/docs/concepts/signals/traces/#spans) (children of a [trace](https://opentelemetry.io/docs/concepts/signals/traces/)): 
* Prompts are stored in the `trace_input` and `user_message` fields of the span
* Prompt results are stored in the `trace_output`
* The prompt input span is disconnected from the prompt output trace (i.e. they're not part of the same trace)
* All prompts in the same Goose session have the same `sesison.id`

Here's a sample trace output from Jaeger:

!["OTel trace in Jaeger from a prompt within a Goose session - request"](/public/images/posts/goose-with-otel/jaeger-goose-trace-request.png)

!["OTel trace in Jaeger from a prompt within a Goose session - response"](/public/images/posts/goose-with-otel/jaeger-goose-trace-response.png)

Here's a sample trace output from Dynatrace using [Dynatrace Query Language (DQL)](https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language) in a [Notebook](https://docs.dynatrace.com/docs/analyze-explore-automate/dashboards-and-notebooks/notebooks):

!["OTel trace in Dynatrace from a prompt within a Goose session"](/public/images/posts/goose-with-otel/dt-goose-trace.png)

As you can see, in both Jaeger and Dynatrace, there are separate traces for the request (prompt) and response (result), which kind of sucks for correlation.

Goose also emits logs, which you can see in Dynatrace. Again, I used DQL in a Notebook:

!["OTel logs in Dynatrace from a prompt within a Goose session"](/public/images/posts/goose-with-otel/dt-goose-logs.png)

And of course, metrics (again, in Dynatrace using DQL in a Notebook):

!["OTel metrics in Dynatrace from a prompt within a Goose session"](/public/images/posts/goose-with-otel/dt-goose-metrics.png)

The metrics don't look particularly useful in this format because it's just the metric name and metadata. I wasn't looking to do anything fancy other than see that the metrics were being emitted. You'll find them more useful in a timeseries.

## Final Thoughts

Being able to capture telemetry from a Goose session is very useful, especially when you're running your agents in autonomous mode via [Goose Recipes](https://goose-docs.ai/docs/guides/recipes/). You might not be able to keep your agent from doing something completely dumb, but you can at least understand what the hell led to that decision, and most importantly, *what* it did.

As far as Goose telemetry goes, I didn't find the Goose logs particularly useful. Most of the meaty bits for my personal use cases were in the spans. As I noted earlier, the only thing that I found annoying is how the prompt trace is not correlated to the prompt output trace, which means that you can't really correlate them easily unless your observability backend can support fancy querying. Jaeger can't. Dynatrace may likely be able to, but I have to play around with it a bit more. That's another adventure for another day!

And now, I will leave you with a very on-theme photo of a goose living its best life. Photo taken by my daughter.

![A goose stands on grass near a metal fence, head lowered, with a bright water fountain spraying behind it.](/public/images/posts/goose-with-otel/goose-canadas-wonderland.jpg)

Until next time, peace, love, and code. 🖖💜👩‍💻