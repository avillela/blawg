---
title: "OpenTelemetry OpAMP for You and Me"
slug: opentelemetry-opamp-for-you-and-me
description: "The OTel OpAMP primer that we all desperately needed"
added: "Jan 31, 2026"
tags:
  - technical
  - observability
  - opentelemetry
  - opamp
  - "2026"
---



![Concrete wall with a grid of square openings casting geometric shadows and light patterns from outside.](https://cdn-images-1.medium.com/max/800/1*nLQNHCk-D3uaT4yskPmVBQ.jpeg)

View from the Tate Modern in London, UK, looking outside. Photo by author.

**_with contributions from_** [**_Aakansha Priya_**](https://www.linkedin.com/in/aakansha-priya/)

In 2022, [OpenTelemetry (OTel)](https://opentelemetry.io) announced a new network protocol called the [Open Agent Management protocol (OpAMP)](https://opentelemetry.io/docs/specs/opamp/) as a means of managing fleets of data collection agents. By data collection agents, I mean any configurable agent that ingests, processes, and exports data to a destination for processing and analysis. Translation: you can use OpAMP for managing Prometheus configurations, an Observability vendor’s proprietary agent, and, of course, the [OpenTelemetry (OTel) Collector](https://github.com/open-telemetry/opentelemetry-collector-contrib). I’ll use the term “agent” going forward to refer to “data collection agents”, as it’s less of a mouthful. 😜

The thing with OpAMP is that, while powerful, it remains confusing to many, and while it is fairly extensively documented, it’s not exactly easy to understand. There are a few OpAMP tutorials out there, but I personally found that they only scratched the surface. And so, today, I will unravel the mysteries of OpAMP for you, so that you can walk off with a better understanding of how it works. It might even inspire you to look at implementing it at your own organization!

### OpAMP Basics

At its core, OpAMP describes how clients and servers talk to each other. They exchange messages via either [WebSockets or HTTP](https://opentelemetry.io/docs/specs/opamp/#communication-model).

[WebSockets](https://en.wikipedia.org/wiki/WebSocket) provide a persistent bi-directional connection from the client to the server. Think of it as making a phone call to a friend, and neither of you ever hangs up.

[HTTP](https://en.wikipedia.org/wiki/HTTP) provides stateless client/server communication, opening up a connection when a client makes a request, and closing it after the server sends a response to the client. Think of it as making calls to your friend every time you need to ask them about something, and then hanging up after your friend gives you an answer.

As you may have gathered, OpAMP is made up of 2 main components: an OpAMP Server, and an OpAMP Client. OpAMP Clients and Servers implement the [OpAMP Agent to Server](https://opentelemetry.io/docs/specs/opamp/#agenttoservercapabilities) and [OpAMP Server to Agent](https://opentelemetry.io/docs/specs/opamp/#servertoagentcapabilities) protobuf protocol specs, respectively.

### OpAMP Server

The OpAMP Server manages one or more OpAMP Clients. It sends configuration updates, packages, and instructions to the Clients.

There are a few existing OpAMP Server implementations that you can play with yourself. You can also write your own OpAMP Server, by implementing the [OpAMP protobuf specs](https://opentelemetry.io/docs/specs/opamp/). Some OpAMP Server implementations include:

*   [Go OpAMP Example Server from OpenTelemetry](https://github.com/open-telemetry/opamp-go/tree/main/internal/examples/server)
*   [Python OpAMP Server by Adam Gardner](https://github.com/agardnerIT/opamp-server-py)
*   [Elixir OpAMP Server by Jacob Aronoff](https://github.com/jaronoff97/opamp-elixir/tree/main)

> **🚨NOTE:** The above may not be production-ready servers, so please use with caution!

### OpAMP Client

The OpAMP Client is the thing being managed by the Server. It registers itself with the Server, so the Server knows to manage it. The Client can implement capabilities that include but are not limited to:

*   Reporting status
*   Receiving remote configuration from the server
*   Applying updates

Note that of the above capabilities, only “Reporting status” is the only mandatory capability that must be implemented by OpAMP Clients. Check out the full list of Client capabilities [here](https://github.com/open-telemetry/opamp-spec/blob/main/specification.md#agenttoservercapabilities).

Just as with OpAMP Servers, you can also write your own OpAMP Client or turn an existing agent into an OpAMP Client by implementing the [OpAMP protobuf specs](https://opentelemetry.io/docs/specs/opamp/), we’ll see that later with the OTel Collector.

### Collector Management with OpAMP

As you may recall, the OpAMP specification isn’t Collector-specific, and it can, in theory, be used to manage any data collection agent. The Collector is just one of the things that can be managed by OpAMP.

But why use OpAMP with the Collector? So you can take advantage of OpAMP’s ability to manage OTel Collectors at scale. As organizations increase their adoption of OpenTelemetry, they find themselves having to manage not one, not two, not five Collectors, but perhaps tens or even hundreds of them. How do you keep track of all of that?

While GitOps and CI/CD processes can certainly help with that, and while pre-OpAMP these were the only option available, they aren’t designed with agent management in mind. Reasons to use OpAMP for bulk Collector management:

*   **Centralized Collector management:** Enables live, centralized management of Collectors across multiple deployment types, such as clusters, VMs, and containerized environments
*   **Real-time Collector visibility:** Allows operators to see the real-time state of every Collector, including health, version, and effective configuration
*   **Dynamic, real-time control:** Collectors can report status and receive updates dynamically, allowing operators to react more quickly when things go caca, like backend throttling, traffic spikes, or cost pressures
*   **Flexible updates:** Configuration updates, binary upgrades, and restarts can be applied incrementally or in bulk, without relying on redeployments or pipeline runs

Out of the box, the OTel Collector isn’t an OpAMP Client. We must turn it into one. But how?

For this, we need the [OpAMP Extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/opampextension#example) and [OpAMP Supervisor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/opampsupervisor/README.md#installing-the-supervisor).

#### OpAMP Extension

The OpAMP Extension turns the OTel Collector into an OpAMP Client. As its name implies, the OpAMP Extension extends the OTel Collector’s capabilities. More specifically, it pulls information out of the Collector (version, operating system, Collector config, etc.), and sends it to the OpAMP Server.

You can think of it this way: Collector + OpAMP Extension == read-only OpAMP Client.

![Diagram showing a centralized OpAMP Server managing multiple OpenTelemetry Collectors, each with an OpAMP Extension. Red lines connect the server to four Collectors, illustrating remote configuration and status reporting.](https://cdn-images-1.medium.com/max/800/1*iZ8-o0UQSeZN7-UHsc1bww.png)

Using the OpAMP Extension turns the Collector into an OpAMP Client. Diagram by author.

![Diagram showing an OpAMP Server communicating with an OpenTelemetry Collector that includes an OpAMP Extension. The extension reads configuration from a file labeled “config.yaml,” illustrating the flow of configuration data via the OpAMP protocol.](https://cdn-images-1.medium.com/max/800/1*SGQTfHXyhCYjqznVgHhZ0Q.png)

A detailed look at the OpAMP Extension. Image source: [GitHub](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/f4661d486acbbef5c4fb071adafe5818035d2512/cmd/opampsupervisor/specification/extension-diagram.png)

**Configuring the OpAMP Extension**

Since the OpAMP Extension turns the OTel Collector into an OpAMP Client, it stands to reason that if you don’t configure the OpAMP Extension, the OpAMP Server won’t know about your Collector.

To configure the OpAMP Extension, start by adding it to the extensions section of the OTel Collector config YAML:

extensions:  
  opamp:  
    server:  
      ws:  
        endpoint: wss://opamp-server:4320/v1/opamp  
        tls:  
          insecure\_skip\_verify: true  
    capabilities:  
      reports\_effective\_config: true

Let’s take a closer look:

*   `opamp.server.ws.endpoint`: The WebSocket address of the OpAMP Server. In this example, the OpAMP Server is listening in on port `4320`, and its API endpoint is `/v1/opamp`. Port `4320` is used by the [Go OpAMP Server](https://github.com/open-telemetry/opamp-go); however, if you’re using a different OpAMP Server implementation, your port number may vary. Similarly, a different OpAMP Server may append the `/v1/opamp` suffix automatically to the endpoint, so check your server documentation. The `wss://` prefix means that it’s a secure WebSocket, which means it’s expecting an SSL certificate. If you want to bypass that, like I am, add `server.tls.insecure_skip_verify: true`. Please don’t do that in production.

Great. The above snippet configures the OpAMP Extension. To _enable_ it, you must add it to the Collector config’s `service` block:

service:  
 extensions: \[opamp\]

Remember how I said that the OpAMP Extension turns the Collector into a read-only OpAMP Client? This means two things:

*   The **_Extension is implementing the bare minimum OpAMP Client capability_**. Remember, how I said that the only mandatory OpAMP Client capability is “Report status”? Yeah, it’s doing that.
*   The **_OpAMP Server can only see your Collector configurations_**, along with general information about your Collector.

![Web interface of an OpAMP Server showing detailed telemetry agent data, including agent status, system attributes (OS, architecture, version), and current configuration settings with editable fields.](https://cdn-images-1.medium.com/max/800/1*ydPHcr2TqREFAt8WWScilQ.png)

Screen shot of the Go OpAMP Server, drilling down on the configuration for a Collector

You can’t, however, make any changes to your Collector. From a practical standpoint, that’s not really super useful for managing a fleet of Collectors. If you want to do things like push Collector configurations and Collector restarts, you need the [OpAMP Supervisor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/opampsupervisor/README.md#installing-the-supervisor).

#### OpAMP Supervisor

The [OpAMP Supervisor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/opampsupervisor/specification) was created specifically for the OTel Collector. In fact, if you look at [the Supervisor source code](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/opampsupervisor), it resides in the [Collector’s GitHub repository](https://github.com/open-telemetry/opentelemetry-collector-contrib). The Supervisor implements the additional OpAMP capabilities on top of what the OpAMP Extension provides. Think of it as a sidecar of sorts for your OTel Collector, extending its functionality. This means that you run **_one Supervisor per Collector_**. 🤯 I don’t know about, you, but that one came as a bit of a surprise to me. When I started on this OpAMP journey, I was sure that there was one Supervisor managing multiple Collectors. I was clearly wrong.

Not only that, Supervisor launches the Collector as a managed subprocess. That, along with the fact that the Supervisor is part of the Collector repo means that _you need to make sure that your Supervisor version matches up with your Collector version_.

![Diagram of an OpAMP architecture showing a central OpAMP Server connected to multiple OpAMP Supervisors. Each Supervisor manages an OpenTelemetry Collector with an embedded OpAMP Extension, illustrating hierarchical agent management.](https://cdn-images-1.medium.com/max/800/1*MsA5bBT_oVsvnrgQQg7EhQ.png)

The OpAMP Supervisor extends the Exension’s functionality, turning the Collector into a more capability-rich OpAMP Client. Diagram by author.

Now, remember that the Supervisor _extends_ the functionality of the OpAMP Extension. (Confused yet?) This means that the “Report status” functionality is already handled by the Extension. Which means that **_the Supervisor still requires the OpAMP Extension_**. BUT: you don’t, however, need to configure the OpAMP Extension yourself when you’re using the Supervisor. That’s because the Supervisor automagically injects an OpAMP Extension into the managed Collector’s configuration YAML.

Under the covers, the Supervisor runs an OpAMP Client and an OpAMP Server:

*   When you send configuration changes, restart requests, and so on from the OpAMP Server, the Supervisor’s OpAMP Client receives and applies these requests to the Collector
*   The Supervisor’s OpAMP Server connects to the OTel Collector via the OpAMP Extension to get Collector runtime information

![Architecture diagram of an observability system using OpenTelemetry and OpAMP. It shows an OpAMP Backend and Telemetry Backend at the top, a Supervisor in the middle with embedded OpAMP Client and Server, and an OpenTelemetry Collector at the bottom. Configuration flows through YAML files, and telemetry data is sent via OTLP, illustrating control, configuration, and data flow across components.](https://cdn-images-1.medium.com/max/800/1*RAL5xweEJX_zJULgbX8DpA.png)

The OpAMP Supervisor under the covers. Image source: [GitHub](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/f4661d486acbbef5c4fb071adafe5818035d2512/cmd/opampsupervisor/specification/supervisor-diagram.png)

**Configuring the OpAMP Supervisor**

The OpAMP Supervisor is configured via YAML:

server:  
 endpoint: wss://opamp-server:4320/v1/opamp  
 tls:  
 insecure\_skip\_verify: true  
capabilities:  
 reports\_effective\_config: true  
 reports\_own\_metrics: true  
 reports\_own\_logs: true  
 reports\_health: true  
 accepts\_remote\_config: true  
 reports\_remote\_config: true  
agent:  
 executable: /otelcolcontrib  
 config\_files:  
 \- /otelcol-config.yaml  
  
storage:  
 directory: /etc/otel/supervisor-data/

Let’s take a closer look:

*   `server.endpoint`: The WebSocket address of the OpAMP Server. In this example, the OpAMP Server is listening in on port `4320`, and its API endpoint is `/v1/opamp`. Port `4320` is used by the [Go OpAMP Server](https://github.com/open-telemetry/opamp-go); however, if you’re using a different OpAMP Server implementation, your port number may vary. Similarly, a different OpAMP Server may append the `/v1/opamp` suffix automatically to the endpoint, so check your server documentation. The `wss://` prefix means that it’s a secure WebSocket, which means it’s expecting an SSL certificate. If you want to bypass that, like I am, add `server.tls.insecure_skip_verify: true`. Please don’t do that in production.
*   `capabilities`: [OpAMP capabilities](https://opentelemetry.io/docs/specs/opamp/#agenttoservercapabilities) to be made available. You can find a full list of Supervisor-supported capabilities [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/f4661d486acbbef5c4fb071adafe5818035d2512/cmd/opampsupervisor/specification/README.md#supervisor-configuration).
*   `agent.executable`: The location of OTel Collector executable being managed. This is often a location accessible to your Supervisor on your local filesystem. You can also include the Supervisor and Collector binaries in the same container, in which case you would point to the Collector binary’s location in the container. If this seems at all confusing to you, an example is coming your way.
*   `agent.config_files`: The location of the Collector’s config YAML. If you exclude it, a default value is applied. Please please please explicitly specifying the Collector config’s location to avoid any surprises.

Check out some sample Supervisor configurations [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/f4661d486acbbef5c4fb071adafe5818035d2512/cmd/opampsupervisor/examples).

#### Example Supervisor Scenarios

Let’s look at two scenarios: one with the Supervisor running on a bare-metal host and one with the Supervisor running inside a container.

You can check out the example GitHub repository [here](https://github.com/avillela/opamp-demo). I set up a [Development (Dev) Container](https://containers.dev/) for the tutorial, which includes all of the components that you need. You can run the Dev Container either locally (e.g. via the [VSCode Dev Container Extension](https://code.visualstudio.com/docs/devcontainers/containers)) or using [GitHub Codespaces](https://docs.github.com/en/codespaces).

Start by cloning the GitHub repo:

git clone git@github.com:avillela/opamp-demo.git  
cd opamp-demo

**SCENARIO 1: Running the Supervisor and Collector as Local Executable Binaries**

In this scenario, both the OpAMP Supervisor and the OpenTelemetry Collector run as native binaries on your local machine. This is the simplest way to understand how the Supervisor manages a Collector and is ideal for both local development and configuring production-ready Supervisors on VMs or bare-metal servers.

**1\. Start up the OpAMP Server**

We’ll be running the OpAMP Go server. I’ve gone ahead and containerized it, and put it into a [Docker Compose](https://github.com/avillela/opamp-demo/blob/c848d87d524a24bb20beb98fca3e535e5704f5e8/docker-compose.yaml#L20-L32) file to make it easier to build and start up.

Open up a new terminal window and start up the OpAMP Server. Note that the first time you run this, it will build the image if it doesn’t already exist.

docker compose up opamp-server

Sample output:

Attaching to opamp-server  
opamp-server | 2026/01/29 09:35:27.955323 \[MAIN\] OpAMP Server starting…  
opamp-server | 2026/01/29 09:35:27.955892 \[MAIN\] OpAMP Server running…  
opamp-server | 2026/01/29 09:38:29.696623 \[OPAMP\] Agent disconnected: websocket: close 1000 (normal): Normal closure

The OpAMP Server should be accessible at `[http://localhost:4321](http://localhost:4321)`:

![Web interface of an OpAMP Server showing an empty Agents table with a single column labeled “Instance ID.”](https://cdn-images-1.medium.com/max/800/1*MD5yaGvdFvdL-pvYEZrZsA.png)

The Go OpAMP server!

Note that there are no OpAMP Clients running…yet.

**2\. Start the OpAMP Supervisor binary**

If you’re running this in a Dev Container, the OpAMP Supervisor and OTel Collector were installed in `[install-otel-components.sh](https://github.com/avillela/opamp-demo/blob/main/.devcontainer/install-otel-components.sh)` on initial Dev Container build.

If you’re running this in the Dev Container, the will have been installed on initial Dev Container build. If you’re not running this using the Dev Container, install the OpAMP Supervisor and OTel Collector binaries on your local filesystem by running:

./.devcontainer/install-otel-components.sh

Now you can start up the OpAMP Supervisor binary by opening up a new terminal window and running:

opampsupervisor - config ./src/opamp-supervisor/supervisor-3.yaml

The Supervisor will launch the Collector as a managed subprocess and begin reporting health, logs, metrics, and effective configuration over OpAMP.

Sample output:

{"level":"info","ts":1769680036.7547185,"logger":"supervisor","caller":"supervisor/supervisor.go:349","msg":"Supervisor starting","id":"019bfb31-cfe2–7090-b2fd-e3675a48cfc7"}  
{"level":"info","ts":1769680036.8028882,"logger":"supervisor","caller":"supervisor/supervisor.go:672","msg":"Connected to the server."}  
Note this log message: {"level":"info","ts":1769680036.7547185,"logger":"supervisor","caller":"supervisor/supervisor.go:349","msg":"Supervisor starting","id":"019bfb31-cfe2–7090-b2fd-e3675a48cfc7"}

And more specifically, take note of the value of the `id` field, `019bfb31-cfe2–7090-b2fd-e3675a48cfc7`. This is the ID of the Collector launched by the Supervisor.

When we refresh the OpAMP Server, we’ll see that same Collector ID listed:

![Alt text: OpAMP Server web interface displaying a single connected agent in a table, with one clickable Instance ID listed under the “Agents” section.](https://cdn-images-1.medium.com/max/800/1*vfjxYCgvuwokv6laifm6CA.png)

OTel Collector registered with the OpAMP Server

And if we click on it, we’ll see this:

![Alt text: OpAMP Server web interface displaying detailed information for a connected agent, including its instance ID, uptime, system attributes, and a full effective configuration section with editable additional configuration and a “Save and Send to Agent” button.](https://cdn-images-1.medium.com/max/800/1*0Mp6jaQ8ed6GrLnfplD_dQ.png)

Drilling into the OTel Collector config on the OpAMP Server. Note that the OpAMP extension was injected into the Collector config.

Note that the OpAMP Extension is there, even though it’s missing from our [Collector config](https://github.com/avillela/opamp-demo/blob/main/src/otel-collector/otelcol-config-3.yaml):

receivers:  
  otlp:  
    protocols:  
      grpc: {}  
      http: {}  
  
processors:  
  batch: {}  
  
exporters:  
  debug:  
    verbosity: detailed  
  
service:  
  pipelines:  
    traces:  
      receivers: \[ otlp \]  
      processors: \[ batch \]  
      exporters: \[ debug \]  
    metrics:  
      receivers: \[ otlp \]  
      processors: \[ batch \]  
      exporters: \[ debug \]  
    logs:  
      receivers: \[ otlp \]  
      processors: \[ batch \]  
      exporters: \[ debug \]

This shows us that the Supervisor injects that OpAMP Extension into our Collector config for us! 🪄🪄🪄

Now let’s take a look at our [Supervisor YAML](https://github.com/avillela/opamp-demo/blob/main/src/opamp-supervisor/supervisor-3.yaml):

server:  
  endpoint: wss://localhost:4320/v1/opamp  
  tls:  
    insecure\_skip\_verify: true  
  
capabilities:  
  reports\_effective\_config: true  
  reports\_own\_metrics: true  
  reports\_own\_logs: true  
  reports\_health: true  
  accepts\_remote\_config: true  
  reports\_remote\_config: true  
  
agent:  
  executable: /usr/local/bin/otelcol-contrib  
  config\_files:  
      \- src/otel-collector/otelcol-config-3.yaml  
  
  
storage:  
  directory: src/opamp-supervisor/supervisor-data-2/

Taking a closer look:

*   `server.endpoint` is `wss://localhost:4320/v1/opamp`, which means that our server endpoint is available through localhost.
*   `agent.executable` is pointing to the OTel Collector binary on our local filesystem, which in this case is `/usr/local/bin/otelcol-contrib`
*   `agent.config_files` is pointing to this [Collector YAML](https://github.com/avillela/opamp-demo/blob/main/src/otel-collector/otelcol-config-3.yaml) on our local filesystem, located at `src/otel-collector/otelcol-config-3.yaml`

Now let’s go back to the Collector config in the OpAMP Server, and try to update the Collector configuration in the “Additional Configuration” text box, by changing the [Debug Exporter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/debugexporter/README.md) verbosity from `detailed` to `basic`.

exporters:  
  debug:  
    verbosity: basic

![OpAMP Server web interface showing a connected agent’s details, including its instance ID, uptime, system attributes, and a full effective configuration display alongside an editable “Additional Configuration” panel with a save button.](https://cdn-images-1.medium.com/max/800/1*o1QkQ1gxgwgdd19mkDnSAA.png)

Before updating the debug exporter config.

Click “Save and Send to Agent”, and refresh the screen. After you refresh, you should see this:

![OpAMP Server web interface showing a connected agent’s status, system attributes, and effective configuration, with an editable “Additional Configuration” panel on the right and a button to apply changes.](https://cdn-images-1.medium.com/max/800/1*hbkmwwr41g5R_nW0H5suew.png)

The updated Debug Exporter configuration.

**SCENARIO 2: Single Docker image with the Supervisor and Collector**

In this scenario, your Collector and Supervisor binaries reside in the same Docker image, which means that your Supervisor YAML will be pointing to a Collector location that _only exists inside the container_.

Here is the [Dockerfile](https://github.com/avillela/opamp-demo/blob/main/src/docker/Dockerfile.opamp-supervisor):

\# OpAMP Supervisor image  
FROM otel/opentelemetry-collector-opampsupervisor:latest as supervisor  
  
\# OpenTelemetry collector image  
FROM otel/opentelemetry-collector-contrib:latest AS col  
  
\# Final stage  
FROM alpine:latest  
  
\# Copy Supervisor binary  
COPY - from=supervisor /usr/local/bin/opampsupervisor ./opampsupervisor  
  
\# Copy Collector binary  
COPY - from=col /otelcol-contrib /otelcol-contrib  
EXPOSE 4317 4318  
ENTRYPOINT \["./opampsupervisor", " - config", "supervisor.yaml"\]

Notice how we’re building a Docker image in which we copy the Supervisor binary and the Collector binary into the same `Dockerfile`.

The [Docker Compose](https://github.com/avillela/opamp-demo/blob/c848d87d524a24bb20beb98fca3e535e5704f5e8/docker-compose.yaml#L20-L31) for that piece then looks like this:

  opamp-supervisor-2:  
    container\_name: opamp-supervisor-2  
    image: opamp-supervisor:latest  
    command: \["--config", "/etc/otel/supervisor.yaml"\]  
    build:  
      context: ./src/docker  
      dockerfile: Dockerfile.opamp-supervisor  
    volumes:  
      \- ./src/opamp-supervisor/supervisor-2.yaml:/etc/otel/supervisor.yaml  
      \- ./src/otel-collector/otelcol-config-2.yaml:/otelcol-config.yaml  
    networks:  
      \- opamp-network  
    restart: unless-stopped

Notice that the `volumes` configuration includes paths to the following files, which are mounting our local YAML config files to a location in the container filesystem:

*   Supervisor config, `supervisor-2.yaml`, mounted as `supervisor.yaml` in the container
*   Collector config, `otelcol-config-2.yaml`, mounted as `otelcol-config.yaml` in the container

Technically both YAML files could’ve been copied over as part of the container build as well.

Let’s run the example.

**1\. Start up the OpAMP Server**

Open up a new terminal window and start up the OpAMP Server if it isn’t already running from the previous example:

docker compose up opamp-server

Sample output:

Attaching to opamp-server  
opamp-server | 2026/01/29 09:35:27.955323 \[MAIN\] OpAMP Server starting…  
opamp-server | 2026/01/29 09:35:27.955892 \[MAIN\] OpAMP Server running…  
opamp-server | 2026/01/29 09:38:29.696623 \[OPAMP\] Agent disconnected: websocket: close 1000 (normal): Normal closure

The OpAMP Server should be accessible at `[http://localhost:4321](http://localhost:4321)`:

![OpAMP Server web interface listing one connected agent in a table, each represented by a clickable Instance ID under the “Agents” heading.](https://cdn-images-1.medium.com/max/800/1*vfjxYCgvuwokv6laifm6CA.png)

The Collector from our previous example.

If you have the previous example still running, you’ll already see a Collector listed on there, like I have.

**2\. Start the OpAMP Supervisor + Collector Container**

Open up a new terminal window and run the following command. Note that the first time you run this, it will build the image if it doesn’t already exist.

docker compose up opamp-supervisor-2

Sample output:

Attaching to opamp-supervisor-2  
opamp-supervisor-2 | {"level":"info","ts":1769790488.4444625,"logger":"supervisor","caller":"supervisor/supervisor.go:349","msg":"Supervisor starting","id":"019be791-e9c0–7707–9636-dfe4aaca0f83"}  
opamp-supervisor-2 | {"level":"info","ts":1769790488.453619,"logger":"supervisor","caller":"supervisor/supervisor.go:672","msg":"Connected to the server."}

Again, the Supervisor (in the container) will launch the Collector (in the same container) as a managed subprocess.

If you go to the OpAMP Server at `[http://localhost:4321](http://localhost:4321)`, you’ll see both Collectors now (one from the previous scenario and one from this scenario):

![OpAMP Server web interface listing two connected agents in a table, each represented by a clickable Instance ID under the “Agents” heading.](https://cdn-images-1.medium.com/max/800/1*SQ8K09VRaXVpYU2Mon5xXA.png)

Two managed Collectors

The ID of the new Collector that was started up is `019be791-e9c0–7707–9636-dfe4aaca0f83`, as we saw from the Supervisor startup logs.

The [Supervisor YAML](https://github.com/avillela/opamp-demo/blob/main/src/opamp-supervisor/supervisor-2.yaml) looks like this:

server:  
  endpoint: wss://opamp-server:4320/v1/opamp  
  tls:  
    insecure\_skip\_verify: true  
  
capabilities:  
  reports\_effective\_config: true  
  reports\_own\_metrics: true  
  reports\_own\_logs: true  
  reports\_health: true  
  accepts\_remote\_config: true  
  reports\_remote\_config: true  
  
agent:  
  executable: /otelcol-contrib  
  config\_files:  
      \- /otelcol-config.yaml  
  
  
storage:  
  directory: /etc/otel/supervisor-data/

Let’s take a closer look:

*   `server.endpoint` is `wss://opamp-server:4320/v1/opamp`. We’re running the OpAMP Server and Client in Docker, and in order for them to be able to see each other, I created a Docker network called `opamp-network` inside [Docker Compose](https://github.com/avillela/opamp-demo/blob/c848d87d524a24bb20beb98fca3e535e5704f5e8/docker-compose.yaml#L1-L3), and both the [OpAMP Server](https://github.com/avillela/opamp-demo/blob/c848d87d524a24bb20beb98fca3e535e5704f5e8/docker-compose.yaml#L44-L45) and [Supervisor](https://github.com/avillela/opamp-demo/blob/c848d87d524a24bb20beb98fca3e535e5704f5e8/docker-compose.yaml#L30-L31) are part of that network. So when I configure the Supervisor to point to the OpAMP Server, the Server’s endpoint is its [Docker Compose service name](https://github.com/avillela/opamp-demo/blob/c848d87d524a24bb20beb98fca3e535e5704f5e8/docker-compose.yaml#L34), `opamp-server`.
*   `agent.executable` is pointing to the OTel Collector binary on our local filesystem, which in this case is `/usr/local/bin/otelcol-contrib`
*   `agent.config_files` is pointing to this [Collector YAML](https://github.com/avillela/opamp-demo/blob/main/src/otel-collector/otelcol-config-3.yaml) on our local filesystem, located at `src/otel-collector/otelcol-config-3.yaml`

Here’s what the [Collector YAML](https://github.com/avillela/opamp-demo/blob/main/src/otel-collector/otelcol-config-2.yaml) looks like. Again, we didn’t configure an OpAMP Extension for it.

receivers:  
  otlp:  
    protocols:  
      grpc: {}  
      http: {}  
  
processors:  
  batch: {}  
  
exporters:  
  debug:  
    verbosity: basic  
  
service:  
  pipelines:  
    traces:  
      receivers: \[ otlp \]  
      processors: \[ batch \]  
      exporters: \[ debug \]  
    metrics:  
      receivers: \[ otlp \]  
      processors: \[ batch \]  
      exporters: \[ debug \]  
    logs:  
      receivers: \[ otlp \]  
      processors: \[ batch \]  
      exporters: \[ debug \]

And yet, again, we see the Extension showing up when we see it on the OpAMP Server.

![OpAMP Server web interface showing a connected agent’s details, including its instance ID, uptime, system attributes, and the full effective configuration, along with an empty “Additional Configuration” box and a button to save changes.](https://cdn-images-1.medium.com/max/800/1*Aipw8KjuYOOcL7vmsbawcA.png)

Again, OpAMP Extension is injected into our Collector’s config

This time, our Collector’s Debug Exporter’s verbosity is set to basic, so let’s change it to detailed on the OpAMP Server:

exporters:  
  debug:  
    verbosity: detailed

![OpAMP Server web interface displaying a connected agent’s details, including its instance ID, uptime, system attributes, and effective configuration, alongside an editable “Additional Configuration” panel with a save button.](https://cdn-images-1.medium.com/max/800/1*gTdbPsf62olnrimYBoCgqw.png)

Let’s update the Debug Exporter configuration.

After we click on “Save and Send to Agent” and refresh the page, we see the changes:

![OpAMP Server web interface showing a connected agent’s status, system attributes, and effective configuration, along with an editable “Additional Configuration” panel and a button to apply changes.](https://cdn-images-1.medium.com/max/800/1*DUX-X_P5Ar-XvE1gex4EJA.png)

Updated the Debug Exporter from “basic” to “detailed”

Ta-da!

### OpAMP Bridge

As we saw with the above examples, the OpAMP Supervisor works well if your Supervisor and Collector on bare metal or VMs, or if they both run in the same container. But what if we have a Supervisor running in one container, and a Collector running in a _separate_ container? Can that Supervisor manage that Collector? Nope. But do you know what can?

The OpAMP Bridge! The [OpAMP Bridge](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/operator-opamp-bridge) is a component of the [OpenTelemetry Operator](https://github.com/open-telemetry/opentelemetry-operator), one of my favourite OTel components. (Don’t believe me? Check out my [various writings on the Operator](https://adri-v.medium.com/list/opentelemetry-operator-0ee6378d630a). 😁)

You can think of the OpAMP Bridge as a replacement of sorts for the OpAMP Supervisor, with a few key differences:

*   It manages OTel Collectors in a Kubernetes-native way
*   It manages multiple Collectors at once, whereas the Supervisor manages one Collector at a time
*   It manages _only_ OTel Collectors managed by the OTel Operator

To configure the OpAMP Bridge, you must define a Kubernetes custom resource (CR) called `OpAMPBridge`. Below is an example taken from the [OpAMP Bridge readme on GitHub](https://github.com/open-telemetry/opentelemetry-operator/tree/main/cmd/operator-opamp-bridge#opampbridge-crd).

apiVersion: opentelemetry.io/v1alpha1  
kind: OpAMPBridge  
metadata:  
  name: opamp-bridge  
spec:  
  endpoint: "<OPAMP\_SERVER\_ENDPOINT>"  
  capabilities:  
    AcceptsRemoteConfig: true  
    ReportsEffectiveConfig: true  
    ReportsHealth: true  
    ReportsRemoteConfig: true  
  componentsAllowed:  
    receivers:  
      \- otlp  
    processors:  
      \- memory\_limiter  
      \- batch  
    exporters:  
      \- otlphttp

Note that you still need to run an OpAMP Server, which you specify in the `spec.endpoint` configuration.

You must also “register” your OTel Collectors with the OpAMP Bridge. The equivalent of doing this with the Supervisor was by specifying a path to your OTel Collector binary and the Collector Config. With the OpAMP Bridge, you need to add a special label to the `OpenTelemetryCollector` resources you want managed by the OpAMP Bridge. Remember _that this ONLY works for OTel Collectors managed by the OTel Operator_.

There are two different types of labels:

opentelemetry.io/opamp-reporting \= true  
opentelemetry.io/opamp-managed \= true | <name\_of\_bridge\_resource>

You use one or the other.

Use the `opentelemetry.io/opamp-reporting: true` label to enable reporting only (basically what the OpAMP Extension does).

Use the `opentelemetry.io/opamp-managed: true | <name_of_bridge_resource>` label to enable reporting AND management (basically what the Supervisor does). If you have multiple `OpAMPBridge` instances, use `<name_of_bridge_resource>` (coming from the OpAMPBridge’s `metadata.name` field) instead of `true`.

Here is a sample `OpenTelemetryCollector` resource configured with an OpAMP Bridge label:

apiVersion: opentelemetry.io/v1beta1  
kind: OpenTelemetryCollector  
metadata:  
  name: opamp-reporting-collector  
  labels:  
    opentelemetry.io/opamp-reporting: "true"  
spec:  
...

This is by no means an exhaustive example, but it should give you an idea of what is involved in configuring the `OpAMPBridge` resource.

Learn more about the OpAMP Bridge [here](https://docs.google.com/document/d/1M8VLNe_sv1MIfu5bUR5OV_vrMBnAI7IJN-7-IAr37JY/edit?usp=sharing), and keep an eye out for a proper OpAMP Bridge example in the near future!

### Final Thoughts

OpAMP provides a powerful standard for managing agents at scale, including OTel Collectors. As companies evolve their OTel adoption, OpAMP will be critical in helping them manage large fleets of Collectors without operators pulling their hair (or at least minimizing it). It can, however, be tricky to grasp, as it has many moving parts, has a large learning curve, and is sparsely documented.

OpAMP has been in beta state since July 2022, and is very much usable in production, so you shouldn’t be afraid to use it! What makes it challenging right now is that many of the OpAMP Servers out there aren’t necessarily production ready. In addition, OpAMP’s beta status means that users will experience some usability issues as the specification and implementations continue to evolve.

So if you want to use OpAMP to manage your fleet of Collectors, what do you do? Well, you can certainly write your own OpAMP Server. Otherwise, only company I know of that uses OpAMP and provides a production-ready solution is [Bindplane](https://bindplane.com), whose sole focus is building a product around OpAMP to make it usable.

I hope that this overview has given you a better understanding of OpAMP. I found that once I finally understood what was going on, OpAMP was WAAAAAAY less scary. For me, personally, it was quite a learning journey that started with many wrong assumptions, doing some hands-on experiments, and asking questions. I’d like to thank [Jacob Aronoff](https://www.linkedin.com/in/jaronoff97/) (my former co-worker from [Lightstep](https://www.linkedin.com/search/results/all/?keywords=lightstep&origin=RICH_QUERY_SUGGESTION&spellCorrectionEnabled=false&heroEntityKey=urn%3Ali%3Aorganization%3A7595344&position=0) and who is now at [Tero](https://www.linkedin.com/company/usetero/), doing some exciting work in the OpAMP space), [Evan Bradley](https://www.linkedin.com/in/evan-bradley-a817a4154/) (one of my [Dynatrace](https://dynatrace.com) co-workers), and [Adnan Rahić](https://www.linkedin.com/in/adnanrahic/) and [Andy Keller](https://www.linkedin.com/in/andrewjkeller/) (both of Bindplane) for keeping me honest for this post. And to the folks in the [#otel-opamp](https://cloud-native.slack.com/archives/C02J58HR58R) channel on [CNCF Slack](https://communityinviter.com/apps/cloud-native/cncf), who took the time to [answer my newbie questions](https://cloud-native.slack.com/archives/C02J58HR58R/p1768934954089969).

This is just the beginning for OpAMP. As it continues to evolve, I can’t wait to see Observability back-ends embrace OpAMP natively and to use it to manage their own proprietary agents.

And now, I will leave you with a photo of Barbie, hamming it up for the camera.

![White rat with dark eyes standing on a dark fabric surface, with a blue cushion and patterned gray‑and‑white blanket in the background.](https://cdn-images-1.medium.com/max/800/1*dy2e9x5xeCC7-yt13MxT8g.jpeg)

Hi, Barbie!

Until next time, peace, love, and code. 🖖💜👩‍💻

By [Adriana Villela](https://medium.com/@adri-v) on [January 31, 2026](https://medium.com/p/dcc6f84a2e32).

[Canonical link](https://medium.com/@adri-v/opentelemetry-opamp-for-you-and-me-dcc6f84a2e32)

Exported from [Medium](https://medium.com) on June 3, 2026.