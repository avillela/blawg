---
title: "Just-in-Time Nomad: Configuring HashiCorp Nomad/Vault integration on HashiQube"
slug: just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube
description: "A step-by-step guide to configuring HashiCorp Nomad and Vault to allow Nomad to pull Vault secrets"
added: "Dec 17, 2021"
tags:
  - technical
  - nomad
  - hashiqube
  - hashicorp
---

# Just-in-Time Nomad: Configuring HashiCorp Nomad/Vault integration on HashiQube

![](https://cdn-images-1.medium.com/max/800/1*i_NjvabZdPTGzRoBw8PNZQ.png)

Maple leaf. Photo by [Adri V](http://adri-v.medium.com)

### Down the Rabbit Hole

As part of my dabblings with [HashiQube](https://github.com/servian/hashiqube), I recently found myself writing a jobspec that required me to needed to pull secrets from Vault. I soon realized that while HashiQube bootstraps [Nomad](https://www.nomadproject.io), [Vault](https://www.vaultproject.io), [Consul](https://www.consul.io) (à la [Vagrant](https://www.vagrantup.com)) on my local machine, it does not configure Vault/Nomad integration.

No integration? No problem! This was the perfect opportunity for me to learn how to configure Vault/Nomad integration, and now, my dear readers, I wish to share my learnings with you!

Are you psyched?! Let’s do this!

### Objective

In today’s tutorial, you will learn how to configure Vault/Nomad integration, so that you can pull Vault secrets from your Nomad jobspecs.

I will demonstrate this by using [HashiQube](https://github.com/servian/hashiqube) to do this configuration on a Vagrant VM running [Vault](https://www.vaultproject.io/), [Consul](https://www.consul.io/), and [Nomad](https://www.nomadproject.io/).

### Assumptions

Before we move on, I am assuming that you have a basic understanding of:

*   **Nomad**. If not, mozy on over to my [Nomad intro post](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca).
*   **HashiQube**. If not, mozy on over to my [HashiQube post](https://adri-v.medium.com/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8).

### Pre-Requisites

In order to run the example in this tutorial, you’ll need the following:

*   [Oracle VirtualBox](https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjVuPag0oL0AhXFnrMKHRjODRYYABAAGgJxbg&ohost=www.google.com&cid=CAASEuRoonvAcnwV4Mde6j85eTiOEQ&sig=AOD64_1N8BIxbnQDEjTDYvtzMR78syE9Bg&q&adurl&ved=2ahUKEwiUpe6g0oL0AhVjTd8KHWTvAkEQ0Qx6BAgCEAE) (version 6.1.30 at the time of this writing)
*   [Vagrant](https://www.vagrantup.com/) (version 2.2.19 at the time of this writing)

### Tutorial Repo

I will be using a [Modified HashiQube Repo](https://github.com/avillela/hashiqube) (fork of `[servian/hashiqube](https://github.com/servian/hashiqube)`) for today’s tutorial.

### Vault/Nomad Integration Explained

Although HashiQube installs Vault and Nomad, it doesn’t configure them to talk to each other right out of the box. Not to worry, because I’ll explain everything step-by-step for all y’alls. All of the source files are also in the [tutorial repo](https://github.com/avillela/hashiqube), which I reference throughout this post.

The Vault/Nomad integration magic happens in two files: [nomad.sh](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad.sh), and [vault.sh](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault.sh).

### Vault Configuration

First, let’s look at [vault.sh](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault.sh):

That is one monster file! Not to worry. Let’s zero in on the stuff that we care about, which takes place in [lines 171–190](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/vault.sh#L170-L190).

#### **1- Set the** `**VAULT_TOKEN**` **environment variable**

This happens on [line 171](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/vault.sh#L171). We pull the root token from `/etc/vault/init.file`, thanks to some fancy Linux footwork (fancy for me, anyway 😉 ):

export VAULT\_TOKEN=$(cat /etc/vault/init.file | grep Root | rev | cut -d' ' -f1 | rev)

#### **2- Create Vault policies**

First we create the `nomad-server-policy` ([line 175](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/vault.sh#L175)), which gives Nomad permission to access Vault. More specifically, we will be generating a token which will be used by Nomad for the express purpose of accessing Vault. This token will be granted the permissions in `nomad-server-policy`.

vault policy write nomad-server /vagrant/hashicorp/vault/config/nomad-server-policy.hcl

The `[nomad-server-policy.hcl](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault/config/nomad-server-policy.hcl)` file referenced above looks like this:

In case you’re wondering how I came up with that policy file, I got it from the Hashi docs [here](https://learn.hashicorp.com/tutorials/nomad/vault-postgres?in=nomad%2Fintegrate-vault&utm_source=pocket_mylist#write-a-policy-for-nomad-server-tokens).

We will also be creating app-specific policies ([lines 178–179](https://github.com/avillela/hashiqube/blob/7408bafd2bf62e7bc9ac9c9265b3e8e835208100/hashicorp/vault.sh#L178-L179)). For today’s example, let’s just look at the `2048-game` policy, which set on ([line 179](https://github.com/avillela/hashiqube/blob/7408bafd2bf62e7bc9ac9c9265b3e8e835208100/hashicorp/vault.sh#L179)):

vault policy write 2048-game /vagrant/hashicorp/vault/config/2048-policy.hcl

The `[2048-policy.hcl](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault/config/2048-policy.hcl)` file referenced above looks like this:

path "kv/data/2048-game/\*" {  
  capabilities = \["read", "update", "create"\]  
}

The above policy states that Nomad has `read`, `update`, and `create` permissions to any secrets created under the path `kv/2048` in Vault. If you’re wondering why I said `kv/2048-game` and not `kv/data/2048-game`, it’s because the `data` portion indicates that we’re using [secrets engine version 2](https://www.vaultproject.io/docs/secrets/kv/kv-v2) (more on that below). When you see the path in the vault UI or reference it in the CLI, `data` is omitted from the path.

#### **3- Create the Nomad token role**

This happens on [line 182](https://github.com/avillela/hashiqube/blob/7408bafd2bf62e7bc9ac9c9265b3e8e835208100/hashicorp/vault.sh#L182). The Nomad token role tells you what Vault policies your Nomad jobs can access:

vault write /auth/token/roles/nomad-cluster @/vagrant/hashicorp/vault/config/nomad-cluster-role.json

The `[nomad-cluster-role.json](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault/config/nomad-cluster-role.json)` file referenced above looks like this:

{  
  "disallowed\_policies": "nomad-server",  
  "token\_explicit\_max\_ttl": 0,  
  "name": "nomad-cluster",  
  "orphan": true,  
  "token\_period": 259200,  
  "renewable": true  
}

The above role states that jobs running under Nomad have access to every polic _except_ the `nomad-server` policy defined in Step 2. We do this because we don’t want to give our Nomad jobs super duper access to do (potentially damaging/unwanted) stuff on Vault. This also means that Nomad has access to the `2048-game` policy defined in Step 2.

FYI — I swiped the above policy JSON from the Hashi docs [here](https://www.nomadproject.io/docs/integrations/vault-integration?utm_source=pocket_mylist#vault-token-role-configuration).

#### 4- Enable the Secrets Engine

This happens on [line 185](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/vault.sh#L185).

vault secrets enable -version=2 kv

The Vault Secrets Engine is used to store, generate, and encrypt data. It’s not enabled by default, so we need to enable it before we can use it. You may have noticed from the command above that we’re enabling [version 2 of the Secrets Engine](https://www.vaultproject.io/docs/secrets/kv/kv-v2), which is the newer version.

We do we need to do this? Because by default the Vault secrets engine is not enabled.

#### 5- Create the token

With all this talk about tokens, you might be wondering where this magical token comes from. The token is created as follows:

vault token create -policy nomad-server -period 72h -orphan -format json

Which gives us an output that looks something like this:

Key             Value  
\---             -----  
token           f02f01c2-c0d1-7cb7-6b88-8a14fada58c0  
token\_accessor  8cb7fcb3-9a4f-6fbf-0efc-83092bb0cb1c  
token\_duration  259200s  
token\_renewable true  
token\_policies  \[default nomad-server\]

That’s all well and good, but it sucks for automation, which is why I used my mad Linux skillz to do this, which we see in [lines 188–189](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/vault.sh#L188-L189):

export VAULT\_TOKEN\_INFO=$(vault token create -policy nomad-server -period 72h -orphan -format json)

export VAULT\_TOKEN=$(echo $VAULT\_TOKEN\_INFO | jq .auth.client\_token | tr -d '"')

**_Translation_**: we capture the output of our `vault token create` command as a JSON string, and parse it using `jq` to grab the field we need, which is `auth.client_token`. Here’s the JSON version of the `vault token create` output for your reference:

{  
  "request\_id": "db79684a-3686-04ba-a1ca-cedc0986d7d4",  
  "lease\_id": "",  
  "lease\_duration": 0,  
  "renewable": false,  
  "data": null,  
  "warnings": \[  
    "period of \\"72h\\" exceeded the effective max\_ttl of \\"10h\\"; period value is capped accordingly"  
  \],  
  "auth": {  
    "client\_token": "f02f01c2-c0d1-7cb7-6b88-8a14fada58c0",  
    "accessor": "8cb7fcb3-9a4f-6fbf-0efc-83092bb0cb1c",  
    "policies": \[  
      "default",  
      "nomad-server"  
    \],  
    "token\_policies": \[  
      "default",  
      "nomad-server"  
    \],  
    "identity\_policies": null,  
    "metadata": null,  
    "orphan": true,  
    "entity\_id": "",  
    "lease\_duration": 36000,  
    "renewable": true  
  }  
}

Interestingly enough, the JSON looks TOTALLY different from the tabular output.

Welp, that’s it for the Vault configuration. Now we need to make sure that Nomad can talk to Vault.

### Nomad Configuration

Let’s take a looksie at `[nomad.sh](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad.sh)`:

There’s a lot of stuff happening there. Let’s zero in on what we need. This one’s actually pretty short and sweet. All we need to do is enable Vault connectivity from Nomad, which happens on [lines 64–71](https://github.com/avillela/hashiqube/blob/72c05a59d41f4c1a3e68d51b1a91839399d086c2/hashicorp/nomad.sh#L64-L71):

vault {  
  enabled = true  
  address = "[http://${VAGRANT\_IP}:8200](http://$%7BVAGRANT_IP%7D:8200)"  
  task\_token\_ttl = "1h"  
  create\_from\_role = "nomad-cluster"  
  token = "${VAULT\_TOKEN}"  
  tls\_skip\_verify = true  
}

Highlights from the above snippet:

*   Enable Vault integration
*   Tell us where Nomad can find Vault
*   Tell Nomad which security policy (Step 3 from the previous section) it can use to access Vault
*   The token used to let Nomad talk to Vault (Step 5 from the previous section)

And that’s it! Now let’s test everything!

### Showtime! Running on HashiQube

Now that we understand the Nomad/Vault integration configurations, it’s time to put things into practice by standing up our environment using HashiQube. To make sure that everything works, we will be creating a secret in Vault, and then we’ll deploy an app that uses the secret. The app will be my time-honoured favourite app, the [2048-game](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/jobs/2048-game.nomad).

I will be using a [modified version of the HashiQube Repo](https://github.com/avillela/hashiqube) (a fork of `[servian/hashiqube](https://github.com/servian/hashiqube)`) for today’s tutorial. If you’re curious, you can see what modifications I’ve made [here](https://github.com/avillela/hashiqube).

#### 1- Provision a Local Hashi Environment with HashiQube

**Start HashiQube by following the detailed instructions** [**here**](https://github.com/avillela/hashiqube#quickstart)**.**

> **_Note:_** _Be sure to check out the_ **_“_**[**_Gotchas_**](https://github.com/avillela/hashiqube#gotchas)**_”_** _section, if you get stuck._

Once everything is up and running (this will take several minutes, by the way), you’ll see this in the tail-end of the startup sequence, to indicate that you are good to go:

![](https://cdn-images-1.medium.com/max/800/0*boxJZXWEq2_TXaMW.png)

Final output of the Vagrant VM startup sequence

You can now access the services below:

*   **Vault:** [http://localhost:8200](http://localhost:8200/)
*   **Nomad:** [http://localhost:4646](http://localhost:4646/)
*   **Consul:** [http://localhost:8500](http://localhost:8500/)
*   **Traefik:** [http://traefik.localhost](http://traefik.localhost/)
*   **Waypoint:** [https://192.168.56.192:9702](https://192.168.56.192:9702/)

#### 2- Install the Nomad and Vault CLIs on your host machine

If you’re on a Mac, you can install the Vault and Nomad CLIs via Homebrew like this:

brew tap hashicorp/tap  
brew install hashicorp/tap/vault  
brew install hashicorp/tap/nomad

If you’re not on a Mac, you can find your OS-specific instructions for Vault [here](https://www.vaultproject.io/downloads) and for Nomad [here](https://www.nomadproject.io/downloads). Note that these are binary installs, and they also contain the CLIs.

#### 3- Add our secret to the vault

Before we can add our secret to vault, we must set some environment variables on our host machine.

First, set the `VAULT_ADDR` environment variable:

export VAULT\_ADDR=http://localhost:8200

Next, set the `VAULT_TOKEN` environment variable.

In case you’re wondering where the heck that value comes from, let’s recall the output we got when the Vagrant VM startup sequence was completed:

![](https://cdn-images-1.medium.com/max/800/1*l-QL2yLPOav-1YZCciW31A.png)

Final output of the Vagrant VM startup sequence

Just copy that Root Token value, and set your `VAULT_TOKEN` like this:

export VAULT\_TOKEN="<initial\_root\_token>"

But what if you cleared your terminal after the startup sequence? (I do that rather obsessively, so I’m definitely in that category.) Then what? Never fear! You can still get that token value. It is located in `/etc/vault/init.file` on the guest machine.

Log in to your guest machine:

vagrant ssh

From the guest machine, get the root token value:

cat /etc/vault/init.file | grep Root | rev | cut -d' ' -f1 | rev > /vagrant/hashicorp/token.txt

The above snippet saves the token to `token.txt` (which is `.gitignored`), and is accessible to both the host machine (`/vagrant/hashicorp/token.txt`) and the guest machine (`hashicorp/token.txt`).

Now switch over to the host machine. Run the following:

export VAULT\_TOKEN=$(cat hashicorp/token.txt) && \\  
rm hashicorp/token.txt

Notice how we deleted `hashicorp/token.txt`…just to be safe. 😉

> **Note:** _In real life, you would never use the root token to set_ `_VAULT_TOKEN_`_. But we’re on our own dev environment, so it’s not the end of the world._

NOW, we can add our API keys like this:

vault kv put kv/2048-game greeting="Hello, I'm a secret!"

Result:

![](https://cdn-images-1.medium.com/max/800/1*cQQCUH59ddUxZzMZl6f5lw.png)

Let’s take a look at it in Vault! Go to `[http://localhost:8200](http://localhost:8200)` on your host machine. You’ll get this lovely screen:

![](https://cdn-images-1.medium.com/max/800/1*DhLimS4Wns_2v5vzA7iBeA.png)

Use that root token to log in — the one from the `VAULT_TOKEN` environment variable.

> **Note:** _In real life, you would never use the root token to log into vault. But we’re on our own dev environment, so it’s not the end of the world._

Once logged in, we can see this:

![](https://cdn-images-1.medium.com/max/800/1*X_azgfY6vGhKtc71Y55twg.png)

They key vault (`kv` folder) was created automagically for you during the bootstrapping process, when we [enabled the secrets engine](https://github.com/avillela/hashiqube/blob/4cedd19ac4162c0297c7c008077564912d098b01/hashicorp/vault.sh#L184).

Now, click on `kv`. You’ll see something like this:

![](https://cdn-images-1.medium.com/max/800/1*KJt4oloYbunh9ZmZLi20Tw.png)

And then click on `2048-game` followed by `stuff` to see the `greeting` secret we just created:

![](https://cdn-images-1.medium.com/max/800/1*2Pa-iqHnig5CBf9Gu6_mlg.png)

Or, if you prefer the command line:

vault kv get kv/2048-game/stuff

Which gives us something like this:

![](https://cdn-images-1.medium.com/max/800/1*1Ui_qiSSpsWQ8EvXCxOkNw.png)

#### 4- Deploy the Sample app

Now let’s deploy our [2048-game job](https://github.com/avillela/hashiqube/blob/master/hashicorp/nomad/jobs/2048-game.nomad) so that we can see those secrets. Here’s the jobspec:

There are a few key items to take special note of.

First, [Lines 8–10](https://github.com/avillela/hashiqube/blob/7408bafd2bf62e7bc9ac9c9265b3e8e835208100/hashicorp/nomad/jobs/2048-game.nomad#L8-L10) specify a Vault policy. It means that the job only has access to secrets in Vault that meet the requirements of the 2048-game policy.

vault {  
      policies  = \["2048-game"\]  
}

Recall that our policy tells Nomad that it has `read`, `update`, and `create` permissions to any secrets created under the path `kv/2048` in Vault.

Second, [lines 51–58](https://github.com/avillela/hashiqube/blob/7408bafd2bf62e7bc9ac9c9265b3e8e835208100/hashicorp/nomad/jobs/2048-game.nomad#L51-L58) specify a [template stanza](https://www.nomadproject.io/docs/job-specification/template) in our Nomad jobspec in which we pull our secret from Vault, and save it to `local/2048-game.txt` in the container instance. The `template` stanza provides us with a way to pull configs from the likes of environment variables, Consul data, and Vault data. It’s kind of like when configure volume mounts in your Kubernetes `Deployments` to access `Secrets` and `ConfigMaps`.

template {  
        data   = <<EOF

my secret: "{{ with secret "kv/data/2048-game/stuff" }}{{ .Data.data.greeting }}{{ end }}"

EOF  
        destination = "local/2048-game.txt"  
      }

When we reference the secret, note that we say that it’s located at `kv/data/2048-game/stuff`. Again, using `data` in the path tells us that we’re using [version 2 of the Secrets Engine](https://www.vaultproject.io/docs/secrets/kv/kv-v2). When we pull the value from the greeting field, note that we need to prefix it with `.Data.data`. Again, this is a [Secrets Engine v2](https://www.vaultproject.io/docs/secrets/kv/kv-v2) thing.

The `local/2048-game.txt` file should contain the following once we deploy the jobspec:

my secret: "Hello, I'm a secret!"

Okay…we’re ready to deploy! Open up a terminal window on your host machine, and run this:

nomad job run hashicorp/nomad/jobs/2048-game

You’ll see something like this:

![](https://cdn-images-1.medium.com/max/800/1*IgFRkMaxNbJF19joXbsQIA.png)

Woo hoo! It’s deployed!

#### 5- Test the secret

It’s all well and good that we deployed this app, but how do we know that it worked? Good question! Let’s find out!

Since all we did was store the secret to the container instance’s filesystem, we can’t really verify anything from pulling up the app (i.e. at http://2048-game.localhost). The only way to test this is to take a peek into the container instance.

Upon deployment, Nomad attempts to allocate (schedule) your job, and it assigns it an allocation ID. So to be able to peek into our container, we first need to get our job’s allocation ID:

export ALLOCATION\_ID=$(nomad job allocs -json otel-collector | jq -r '.\[0\].ID')

Now we can peek into the container instance:

nomad alloc exec -i -t -task 2048 $ALLOCATION\_ID /bin/sh

You’ll see this:

![](https://cdn-images-1.medium.com/max/800/1*ctSitym7bNUUlK5y9c5HcA.png)

At the `#` prompt type:

cat local/2048-game.txt

Remember that `local/2048-game.txt` is where we saved our secret to in the container instance, per [line 57](https://github.com/avillela/hashiqube/blob/7408bafd2bf62e7bc9ac9c9265b3e8e835208100/hashicorp/nomad/jobs/2048-game.nomad#L57) of our jobspec. You should see the following output:

![](https://cdn-images-1.medium.com/max/800/1*M8LpfGtElVU4p0xagrmkbA.png)

Ta-da! Congratulations! You have successfully configured Nomad/Vault integration, and were able to successfully pull a secret from Vault from your Nomad Job!

### Conclusion

Whew! We made it! Nomad/Vault integration wasn’t so bad, was it? Here’s a recap of what we learned about configuring Nomad/Vault integration:

*   We created a policy to allow Nomad and Vault to talk to each other (defined in `[nomad-server-policy.hcl](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault/config/nomad-server-policy.hcl)`)
*   We created a policy specific to our 2048 game (defined in `[2048-policy.hcl](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault/config/2048-policy.hcl)`).
*   We created a Nomad role to tell Nomad what Nomad jobs can and can’t do
*   We created a special token for Nomad to be able to talk to Vault
*   We enabled the [Secrets Engine (v2)](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault/config/2048-policy.hcl)

In our sample app:

*   We limited where it could access its secrets from by binding the jobspec to a policy (defined in `[2048-policy.hcl](https://github.com/avillela/hashiqube/blob/master/hashicorp/vault/config/2048-policy.hcl)`)
*   We used the `template` stanza to pull our secret and save it to a text file in the container instance.

And now, I shall reward you with a picture of a yak against a lovely mountainous backdrop:

![](https://cdn-images-1.medium.com/max/800/0*Z8lr_FEOZezegsv3)

Photo by [Sergio Capuzzimati](https://unsplash.com/@sergio_capuzzimati?utm_source=medium&utm_medium=referral) on [Unsplash](https://unsplash.com?utm_source=medium&utm_medium=referral)

Peace, love, and code.

### Related Reading

### References

*   [Vault Policies](https://learn.hashicorp.com/tutorials/vault/policies)
*   [KV Secrets Engine — Version 2](https://www.vaultproject.io/docs/secrets/kv/kv-v2)
*   [Nomad: Vault Integration](https://www.nomadproject.io/docs/integrations/vault-integration)
*   [Vault Integration & Retrieving Dynamic Secrets](https://learn.hashicorp.com/tutorials/nomad/vault-postgres?in=nomad%2Fintegrate-vault)
*   [Wildcard DNS in Localhost Development](https://gist.github.com/eloypnd/5efc3b590e7c738630fdcf0c10b68072)
*   [Nomad Integration with Vault](https://medium.com/hashicorp-engineering/nomad-integration-with-vault-42b0e5feca78)

By [Adriana Villela](https://medium.com/@adri-v) on [December 17, 2021](https://medium.com/p/388c14cb070a).

[Canonical link](https://medium.com/@adri-v/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a)

Exported from [Medium](https://medium.com) on June 3, 2026.