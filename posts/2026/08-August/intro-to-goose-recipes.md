---
title: Intro to Goose Recipes and Sub-Recipes
slug: intro-to-goose-recipes
description: Using Goose to create re-usable and shareable prompts
tags:
  - technical
  - ai
  - aaif
  - goose
  - '2026'
added: 2026-08-25T00:00:00.000Z
---

![A small, naturally heart‑shaped piece of coral sits on smooth pale sand, with a soft, blurred ocean and cloudy sky in the background.](/images/posts/intro-to-goose-recipes/heart-in-sand.jpg)

Last year, as I was starting my agentic AI journey, a tool called [Goose](https://goose-docs.ai) caught my eye. [I've talked about Goose on a few occasions](/tag/goose/) in the past year. 😄

Goose is an open source AI agent framework [originally created by Block](https://block.xyz/inside/block-open-source-introduces-codename-goose) (the company formerly known as Square), which was recently donated to the [Agentic AI Foundation (AAIF)](https://aaif.io/).

I like Goose because it provides an abstraction layer on top of your LLM (e.g. Claude Sonnet, GPT-5.6 Sol, Gemini Flash) and provider (e.g. Claude, GitHub Copilot, Gemini). This means that you can swap out provider and model combinations but keep your prompts the same. (Well, in theory, anyway...[not all LLMs are created equal](post/prompt-based-reusable-workflows-for-lazy-developers/#lesson-2-llms-are-on-a-spectrum). 🫠) This came in handy for me last year when I was playing around with Goose and ran out of premium tokens on GitHub Copilot and had to switch my model from Claude Sonnet to GPT-4.o. But also, GPT-4.o is no Claude Sonnet.

Anyhooooo...there's another reason why I like Goose: you can use it to create reusable, parameterized agentic workflows, which you can share within and outside of your organization. I like to think of Goose recipes as the [Ansible Playbook](https://www.redhat.com/en/topics/automation/what-is-an-ansible-playbook) of agentic workflows. It also supports sub-recipes. Think of these as helper functions.

And with that in mind, today I'll be digging into how Goose recipes and sub-recipes work. Let's get started!

## Anatomy of a Goose recipe

Below is an example Goose recipe that I wrote called `deploy-local-k8s-cluster.yaml`, which creates a KinD cluster.

```yaml
version: 1.0.0
title: Local Kubernetes Deployment
description: This recipe deploys and configures a local Kubernetes cluster using KinD
instructions: |

  ## Persona

  You are a Platform Engineer. Your role is to deploy and configure infrastructure to be used by developers.

  ## Rules/inputs/constraints

  * Install `kubectl` if it's not already installed.
  * Use KinD to create a local Kubernetes cluster.
    - Install `kind` if it's not already installed.
  * Install `docker` if it's not already installed.


  ## Output format

  Summarize task output as follows:
  * Results in tabular format
  * The summary table should have 2 columns:
    - First column: Component
    - Second column: Details

prompt: |

  ## Objective

  Create a new KinD cluster.

  Tasks:
  * Create a single-node local Kubernetes cluster named {{ cluster_name }}.
    - If the cluster {{ cluster_name }} already exists, delete the old one and create a new one
  * Cluster must be accessible via `kubectl` post-install
  * This task is not considered complete until the kubernetes cluster is up and running. This means:
    - Node status is "Ready"
    - All system pods are running
  * Provide output summary as per output instructions above. Do NOT deviate from the format.

parameters:
  - key: cluster_name
    input_type: string
    requirement: required
    default: "my-cluster"
    description: "Name of the k9s cluster to create"

extensions:
- type: builtin
  name: developer
  display_name: Developer Tools
  description: null
  timeout: 300
  bundled: true
  available_tools: []

settings:
  goose_provider: anthropic
  goose_model: claude-sonnet-5
  temperature: 0.0

author:
  contact: avillela
```

Let's break it down:

* `version`: The version of the recipe (the can be whatever you want).
* `title`: Name of the recipe.
* `description`: What is your recipe about?
* `instructions`: General directives for the model to follow when executing the recipe. These include things like: 

  * **persona**: What role is the model taking on?
  * **rules/inputs/constraints**: This includes things like dos and don'ts, and links to reference documentation.
  * **outputs**: What do you want the model to output in the end, and in what format?

* `prompt`: The actual things you want the recipe to do. I like to provide a task list. Don't try to do too many things in the prompt. You should have one specific goal, and the tasks should be related to that goal.
* `parameters`: Just like you can pass parameters to a script or function, you can pass parameters to a Goose recipe! You must define the parameter name, default value, parameter type, and whether it's mandatory or optional. You reference parameters in the recipe using double curly braces: `{{ parameter_name }}` 
* `settings`: This section is totally optional. If you include it, it overrides the provider settings in `~/.config/goose/config.yaml`. The settings values include:

  - **goose_provider**: In our case, it's set `anthropic`. To use this provider, you will need an `ANTHROPIC_API_KEY`. You are prompted for this value to set up the `anthropic` provider when you run `goose configure`. You can also set it as an environment variable. Be sure to set it before running `goose session` or `goose run --recipe <recipe_name>`, though!
  - **goose_model**: In our case, it's set to `claude-sonnet-5`.
  - **temperature**: In our case, it's `0.0`. Temperature is a value between 0 and 1, and it specifies how much creativity the model should have. The closer to 1, the more creative liberty the model has.
  - **max_turns**: Maximum number of iterations Goose can spend on the prompt. This is handy to prevent Agent Infinite Loop of Doom (TM). The default value is 1000 for the parent recipe, and 25 for sub-recipes. You can set this value globally through the `GOOSE_SUBAGENT_MAX_TURNS` variable in your [Goose config.yaml](~/.config/goose/config.yaml), but remember that setting `max_turns` inside the recipe will override the global value.

* `extensions`: Specify which [extensions](https://goose-docs.ai/docs/getting-started/using-extensions/) you want to include in this recipe. This overrides the extensions configuration in your [Goose config.yaml](~/.config/goose/config.yaml). Extensions are Goose speak for MCP servers registered with Goose. Goose also comes with its own [built-in extensions](https://goose-docs.ai/docs/getting-started/using-extensions/#built-in-extensions). For example, the [developer extension](https://goose-docs.ai/docs/mcp/developer-mcp) enables Goose to do stuff like update files and execute commands in your file system.
* `author`: Author name.

If you want to get really fancy, you can check out some of the other additional [recipe fields](https://goose-docs.ai/docs/guides/recipes/recipe-reference/#extensions). But rest assured, the ones include eveything you need to get started.

I usually put my Goose recipes in a `./goose/recipes` folder:

```text
./goose/
  └── recipes/
      └── deploy-local-k8s-cluster.yaml
```

You can also configure a default recipe location by setting the variable `GOOSE_RECIPE_PATH` either as an environment variable or in your [Goose config.yaml](~/.config/goose/config.yaml). For more on recipe locations, check out the [Goose docs](https://goose-docs.ai/docs/guides/recipes/recipe-reference/#recipe-location).

To run the above recipe from your repository root:

```bash
goose run --recipe goose/recipes/deploy-local-k8s-cluster.yaml
```

This creates a Kubernetes KinD cluster called `my-cluster`, as per the default value of the `cluster_name` paramters.

If you want to override the default value of the `cluster_name` parameter, can pass in the parameter name/value pair at runtime:

```bash
goose run --recipe ./goose/recipes/deploy-local-k8s-cluster.yaml --params cluster_name=my-kind-cluster
```

## Sub-recipes

But wait! There's more!! You can also define sub-recipes. As I said earlier, you can think of sub-recipes as helper functions. Let's take a look at an example by using our KinD cluster example as a base.

Suppose that in addition to creating the KinD cluster, we're also installing the [OTel Operator](/tag/otel-operator) on the cluster. In this case, we should have a parent recipe that calls 2 sub-recipes: one to create the KinD cluster, and one to install the OTel Operator. Our folder structure therefore looks like this:

```text
./goose/
  └── recipes/
      ├── bootstrap-k8s-cluster.yaml
      └── subrecipes/
          ├── create-kind-cluster.yaml
          └── install-otel-operator.yaml
```

And now our root recipe looks like this:

```yaml
version: 1.0.0
title: Local Kubernetes Deployment
description: This recipe deploys and configures a local Kubernetes cluster and installs the OTel Operator
instructions: |

  ## Persona
  
  You are a Platform Engineer. Your role is to deploy and configure infrastructure to be used by developers.

  ## Rules/inputs/constraints

  * Install `kubectl` if it's not already installed.
  * Install `docker` if it's not already installed.
  * Respect the paramters being passed from the main recipe to the sub-recipes.

  ## Output format

  Summarize sub-recipe output as follows:
  * Results in tabular format
  * The summary table should have 2 columns:
    - First column: Component
    - Second column: Details

parameters:
  - key: cluster_name
    input_type: string
    requirement: required
    default: "my-cluster"
    description: "Name of the k9s cluster to create"

sub_recipes:
  - name: "create_kind_cluster"
    path: "./subrecipes/create-kind-cluster.yaml"
  - name: "install_otel_operator"
    path: "./subrecipes/install-otel-operator.yaml"

prompt: |

  ## Objective

  Bootstrap a local kubernetes cluster {{ cluster_name }} by executing the subrecipes in the following order:
    1. create_kind_cluster
    2. install_otel_operator

settings:
  goose_provider: anthropic
  goose_model: claude-sonnet-5
  temperature: 0.0

extensions:
- type: builtin
  name: developer
  display_name: Developer Tools
  description: null
  timeout: 300
  bundled: true
  available_tools: []

author:
  contact: avillela
```

Here, I moved the KinD cluster creation logic out of the parent recipe, and into a sub-recipe called `create_kind_cluster`. For fun and to make this example a little more exciting, I created another sub-recipe called `install_otel_operator`, which installs the [OTel Operator](/tag/otel-operator) in the newly-created KinD cluster.

In the parent recipe, you'll notice a new section called `sub_recipes`:

```yaml
sub_recipes:
  - name: "create_kind_cluster"
    path: "./subrecipes/create-kind-cluster.yaml"
  - name: "install_otel_operator"
    path: "./subrecipes/install-otel-operator.yaml"
```

Which references the two aforementioned sub-recipes. We must also update our prompt to tell Goose to run the sub-recipes in the order specified. 

> ✨ **FUN FACT:** Recipes can run [sequentially](https://goose-docs.ai/docs/guides/recipes/subrecipes/#sequential-processing) or [in parallel](https://goose-docs.ai/docs/tutorials/subrecipes-in-parallel). We're running them sequentially in our example.

```yaml
prompt: |

  ## Objective

  Bootstrap a local kubernetes cluster {{ cluster_name }} by executing the subrecipes in the following order:
    1. create_kind_cluster
    2. install_otel_operator
```

Now let's look at the sub-recipes.

First up, we have the `create_kind_cluster` sub-recipe, which looks more or less like our original `deploy-local-k8s-cluster.yaml` recipe:

```yaml
version: 1.0.0
title: Local Kubernetes Deployment
description: This creates a local Kubernetes cluster using KinD
instructions: |

  ## Persona

  You are a Platform Engineer. Your role is to deploy and configure infrastructure to be used by developers.

  ## Rules/inputs/constraints

  * Use KinD to create a local Kubernetes cluster.
  * Install `kind` if it's not already installed.


  ## Output format

  Follow output format defined in main recipe.

parameters:
  - key: cluster_name
    input_type: string
    requirement: required
    description: "Name of the k8s cluster to create"

prompt: |

  ## Objective

  Create a new KinD cluster.

  Before creating the cluster, tell me the value of {{ cluster_name }}. It was passed in through the command line when the recipe was invoked.


  Tasks:
  * Create a single-node local Kubernetes cluster named {{ cluster_name }}.
  * Cluster must be accessible via `kubectl` post-install
  * This task is not considered complete until the kubernetes cluster is up and running. This means:
    - Node status is "Ready"
    - All system pods are running
  * Provide output summary as per output instructions

settings:
  goose_provider: anthropic
  goose_model: claude-sonnet-5
  temperature: 0.0

extensions:
- type: builtin
  name: developer
  display_name: Developer Tools
  description: null
  timeout: 300
  bundled: true
  available_tools: []

author:
  contact: avillela
```

and then we have `install_otel_operator`:

```yaml
version: 1.0.0
title: Install OTel Operator
description: This installs the OTel Operator in a k8s cluster
instructions: |

  ## Persona

  You are a Platform Engineer. Your role is to deploy and configure infrastructure to be used by developers.

  ## Rules/inputs/constraints

  * Install the OTel Operator via Helm chart
    - Operator Helm chart location: https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator
    - Helm chart version: 0.122.0
  * Install cert-manager via Helm chart
    - cert-manager Helm chart location: https://charts.jetstack.io
    - Helm chart version: v1.21.1

  ## Output format

  Follow output format defined in main recipe.

parameters:
  - key: cluster_name
    input_type: string
    requirement: required
    description: "Target k8s cluster"

prompt: |

  ## Objective

  Install the OTel Operator and its pre-requiste, cert-manager, in the cluster {{ cluster_name }}

  Tasks:
  * Install cert-manager in the Kubernetes Cluster {{ cluster_name }}
    - This task is not considered complete until all pods in the `cert-manager` namespaces are running
  * Install the OTel Operator in the Kubernetes Cluster {{ cluster_name }}
    - This task is not considered complete until the pods in the `otel-operator-system` namespace are running
  * Provide output summary as per output instructions

settings:
  goose_provider: anthropic
  goose_model: claude-sonnet-5
  temperature: 0.0

extensions:
- type: builtin
  name: developer
  display_name: Developer Tools
  description: null
  timeout: 300
  bundled: true
  available_tools: []

author:
  contact: avillela
```

As you can see, there's nothing special about these sub-recipes, other than the fact that they are called from the parent recipe.

> ✨ **NOTE:** As a rule of thumb, sub-recipes should run standalone, meaining that you can (and should) test them without having to run them via the parent recipe.

## Gotchas

While working on the examples for this blog post, I ran into a few issues that sent my head spinning for the better part of the day. I thought I'd share some of my gotchas so that you can avoid my pain and stress.

### Gotcha #1: `claude-acp` provider does not respect Goose

When I first started working on the sub-recipes example, I was using the `claude-acp` provider. Unfortunately, I quickly noticed that when I ran my recipes, many of my Goose-isms were being ignored. It was as if the recipe would load, and then Claude code would take over, ignoring all of the recipe configurations.

A quick conversation with my AI overlord strengthened my suspicions, so I decided to put my theory to the test by switching my provider from `claude-acp` to `anthropic`, and boom. 💥 Problems solved. Check out [this issue](https://github.com/aaif-goose/goose/issues/5559) to feel my pain.

### Gotcha #2: Parameter passing

As I mentioned earlier, you can pass parameteres into a Goose recipe at runtime, which overrides its default value (if any). These should flow through from parent to sub-recipes. 

When I first started running the sub-recipe example, I noticed that Goose was ignoring the value of the runtime paramter and kept trying to use the default value. It was INFURIATING!! 🤬

I spent HOURS trying to figure out WTF was going on. I eventually tracked it down to two things:

FIRST... The `claude-acp` provider was not honouring Goose recipe/sub-recipe constructs, so I switched to the `anthropic` provider.

But that still didn't fully fix the issue. I initially tried to pass the parameter directly to the sub-recipes, as you would with a function call in good 'ole regular code, like this:

```yaml
sub_recipes:
  - name: "create_kind_cluster"
    path: "./subrecipes/create-kind-cluster.yaml"
    values:
      cluster_name: "{{ cluster_name }}"
  - name: "install_otel_operator"
    path: "./subrecipes/install-otel-operator.yaml"
    values:
      cluster_name: "{{ cluster_name }}"
```

But that wasn't working.

So out of pure desperation, I removed the `values` from the `sub_recipes` (it wasn't doing anything anyway), and changed my parent prompt from this:

```yaml
prompt: |

  ## Objective

  Bootstrap a local kubernetes cluster by executing the subrecipes in the following order:
    1. create_kind_cluster
    2. install_otel_operator
```

to this:

```yaml
prompt: |

  ## Objective

  Bootstrap a local kubernetes cluster {{ cluster_name }} by executing the subrecipes in the following order:
    1. create_kind_cluster
    2. install_otel_operator
```

Do you see the difference? It's quite small, actually. All I did was mention `{{ cluster_name }}` in the prompt. FOR REALZ.

OOF. That took way too long.

I still don't know why I couldn't have just passed in the parameter `values` in `sub_recipes`. If you're reading this and happen to know the mysteries of Goose parameter passing, please hit me up. I'm all ears. But for now, at least I found a solution!

## Final thoughts

Goose recipes are a great way to create shareable, reusable workflows within and outside your organization. I did find some ergonomic challenges when setting up my examples, but alas, these are just part of normal growing pains of software, and shouldn't stop you from creating your own.

And now, please enjoy a photo of this cute dachshund puppy, from a puppy yoga class that I attended recently. (Yes, that is actually a thing!!) Isn't he adorable? 🥰

![A small dachshund puppy with a black‑and‑tan face and speckled paws is cradled in someone’s arms, the person wearing a sleeveless top and a light blue smartwatch band, with a soft indoor background behind them.](/images/posts/intro-to-goose-recipes/puppy.jpg)

Until next time, peace, love, and code. 🖖💜👩‍💻