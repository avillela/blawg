---
title: "Just-in-Time Nomad: Running Traefik on Hashicorp Nomad with HashiQube"
slug: just-in-time-nomad-running-traefik-on-hashicorp-nomad-with-hashiqube
description: "Deploying ThoughtWorks Tech Radar to Nomad using the Traefik Load Balancer"
added: "Nov 06, 2021"
tags:
  - technical
  - nomad
  - hashiqube
  - hashicorp
  - "2021"
---


![](https://cdn-images-1.medium.com/max/800/1*BrHy6EIT4Qcy2N_h9mKYTg.png)

Photo by [Adri V](http://adri-v.medium.com)

The best way to dig into a new technology is to give yourself an interesting project to work on. It’s the advice that I give to my direct reports, mentees, and most importantly, it’s advice that I follow myself. It hasn’t failed me yet!

If you read my first [Just-in-Time Nomad](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca) story, you saw how easy it was to run Nomad and my flagship [2048-game example](https://gist.github.com/avillela-tc/02d22e849f0bd842903bb7ebd92e083d) on your local machine. But, as we learned in that [same post](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca), that’s not a practical real-life setup. In a real-life setup, you’d typically want:

*   [Nomad](https://www.nomadproject.io) (job scehduler)
*   [Vault](https://www.vaultproject.io) (secrets management)
*   [Consul](https://www.consul.io) (service mesh + key/value store)
*   A load-balancer

Fortunately, I didn’t have to reinvent the wheel, because of [HashiQube](https://hashiqube.com/#/)! This little hidden gem gives you a nice little HaishCorp sandbox environment running client and server instances [Nomad](https://www.nomadproject.io), [Vault](https://www.vaultproject.io), and [Consul](https://www.consul.io), along with [Fabio](https://github.com/fabiolb/fabio) for load-balancing, plus some other tools. It all runs in a VM provisioned with [Vagrant](https://www.vagrantup.com).

If you come from a Kubernetes background, you can think of HashiQube as the Hashi-world’s equivalent of [MiniQube](https://github.com/kubernetes/minikube), [KiND](https://kind.sigs.k8s.io/docs/user/quick-start/), or any of those other local dev versions of Kubernetes…but better…because it more closely mimics a prod setup of Nomad. Bottom line: it makes local dev easier. And it makes it easier to make sure that your stuff will work when you deploy to a prod setup, therefore reducing nasty surprises.

But wait! There’s more!

I wanted to take my example to the next level by challenging myself as follows:

*   Using an example other than the [2048-game](https://gist.github.com/avillela-tc/02d22e849f0bd842903bb7ebd92e083d) (_the horror!!_)
*   Using [Traefik](https://traefik.io) for load-balancing instead of [Fabio](https://github.com/fabiolb/fabio)
*   Running a Nomad job which pulls a Docker image from a private Docker repository

Okay…let’s get started!

### Pre-Requisites

In order to run the example in this tutorial, you’ll need the following:

*   [Oracle VirtualBox](https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjVuPag0oL0AhXFnrMKHRjODRYYABAAGgJxbg&ohost=www.google.com&cid=CAASEuRoonvAcnwV4Mde6j85eTiOEQ&sig=AOD64_1N8BIxbnQDEjTDYvtzMR78syE9Bg&q&adurl&ved=2ahUKEwiUpe6g0oL0AhVjTd8KHWTvAkEQ0Qx6BAgCEAE)
*   [Vagrant](https://www.vagrantup.com)
*   [A GitHub account and personal access token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) — we’ll be building a Docker image and uploading it to the [GitHub Container Registry (GHCR)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

> **Note:** _You are more than welcome to try this example with a different container registry instead._

### App Selection

For my app selection, I chose the [Technology Radar](https://www.thoughtworks.com/radar) tool by [ThoughtWorks](https://www.thoughtworks.com). You can think of this tool as an architecture maturity model of sorts. You start by listing your various technologies, and putting each one under one of the following categories:

*   Techniques (e.g. Kanban, Cert Rotation)
*   Tools (e.g. GitHub Actions, ArgoCD)
*   Platforms (e.g. Terraform, Pulumi)
*   Languages & Frameworks (e.g. FastAPI, Golang)

You then further categorize them into one of four adoption rings: Adopt (currently using), Trial (checking it out), Hold (not for me, bruh), Assess (hmmm…looks interesting).

The end result is a nice holicstic picture of your tech roadmap that looks something like this:

![](https://cdn-images-1.medium.com/max/800/1*lnsrJK5Kb-1o9oGHejohtw.png)

Sample output from the [TechRadar](https://radar.thoughtworks.com) tool, using their sample [Google Sheet](https://docs.google.com/spreadsheets/d/1OMQvrnN3qwzfBx8y6I77EskuTf10iESeh1Wpvw8hz_4/edit#gid=0)

To get a pretty picture like the one above, you must feed either a CSV or a Google Sheet into the [tool](https://radar.thoughtworks.com) (see ThoughtWorks’ own sample sheet [here](https://docs.google.com/spreadsheets/d/1OMQvrnN3qwzfBx8y6I77EskuTf10iESeh1Wpvw8hz_4/edit#gid=0)).

It’s a neat little tool, because it forces you to take stock of your technology inventory, and helps you think about new technologies that might want to introduce to your organization.

Now, you can use either the [SaaS version of the tool](https://radar.thoughtworks.com), or you can run your own instance of it. And we’re going for…you guessed it: the self-hosted version!

You can find their GitHub repo [here](https://github.com/thoughtworks/build-your-own-radar).

![](https://cdn-images-1.medium.com/max/800/1*WHzM2Ep8Nl1M-0PdnjVByA@2x.jpeg)

Photo by [Adri V](http://adri-v.medium.com). Taken at the West Toronto Rail Path.

### Running the Tech Radar App Locally in Docker

Before deploying to Nomad, I wanted to make sure that I could run the Docker image instance locally. By running it locally first, I ensure that I am starting off with a working Docker image before trying to add a layer of complexity by running it in Nomad. This is very beneficial, especially since Nomad is new to me.

> **Note:** _If you just want to get on with the Nomad stuff, then by all means, feel free to skip ahead to the next section. I won’t be offended. 😀_

The Tech Radar tool has a Docker image available on [Docker Hub](https://hub.docker.com/r/wwwthoughtworks/build-your-own-radar/), so my first thought was to download the image and run it locally. Unfortunately, when I tried to run it, the image wouldn’t launch properly. (Maybe that’s not the case anymore??) Since that was a dud, I did the next best thing: I built the image from the [GitHub repo](https://github.com/thoughtworks/build-your-own-radar).

This time, things went way better.

#### 1- Build the image

Before you build the image, you’ll need to modify `webpack.config.js`, since the version from the ThoughtWorks repo doesn’t play nice with Traefik. Found this out through blood, sweat, tears, and [StackOverflow](https://stackoverflow.com/a/43647767). You’ll need to set `disableHostCheck: true`. The section starts on line 116:

devServer: {  
    ...  
    disableHostCheck: true,  
    ...  
}

Now you can build the Dockerfile!

git clone git@github.com:thoughtworks/build-your-own-radar.git

cd build-your-own-radar

docker build --no-cache -t tech-radar .

I added the `--no-cache` flag because this newer version of the Docker engine seems to do some mega-caching, and I wanted to make sure that my image cache is clean. If you don’t care about that, leave out the flag.

#### 2- Run the container instance

docker run -it --rm -p 8080:8080 tech-radar

I like to run it in interactive mode (`-it` flag) because I’m a control freak/for debugging purposes in case things go south, but you don’t have to.

Once you have it up and running, you should see something like this:

![](https://cdn-images-1.medium.com/max/800/1*Dj9SOzv7MZ-2_DUst3cs2g.png)

Woo hoo! We’re in business. You can now access the Tech Radar tool: [http://localhost:8080](http://localhost:8080)

![](https://cdn-images-1.medium.com/max/800/1*TzpiJ9mpfuHLlrSLssn-Og.png)

Okay. So now we’ve proven that this thing runs from a local Docker image. Time to pop this thing into Nomad!

![](https://cdn-images-1.medium.com/max/800/1*2CWjcM8OX_mUnAXPOUFUvg@2x.jpeg)

Photo by [Adri V](http://adri-v.medium.com). Taken near the West Toronto Rail Path.

### Running the Tech Radar App Locally in Nomad

Time to build on what we’ve done. We know that the Docker image runs locally, as we saw above. Now we can pop this into Nomad.

#### 1- Publish the image to GHCR

Is expecting to pull an image from a Docker repo, so let’s publish our image. And since in most real-life scenarios we’ll be publishing to a private Docker repo, we’ll do that here too.

echo <your\_gh\_pat> | docker login ghcr.io -u <your\_gh\_username> --password-stdin  
  
\# Tag image  
docker image tag tech-radar ghcr.io/<your\_gh\_username>/tech-radar  
  
\# Push image to GitHub container registry  
docker image push ghcr.io/<your\_gh\_username>/tech-radar

Where:

*   `<your_gh_pat>` is your GitHub Personal Access Token, obtained [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). Ensure that you give yourself the following access: (`read:packages`,`write:packages`,`delete:packages`)
*   `<your_gh_username>` is your GitHub username.

> **Note:** _Later, we’ll talk about a better way of authenticating to GHCR._

#### 2- Create the Nomad jobspec

The resulting jobspec isn’t too bad. We’re just running one service, and it’s running on port 8080. So our jobspec will look like this:

You will need to replace the following values with your own:

*   `<your_gh_username>`: your GitHub username on lines 17 and 21
*   `<your_gh_password>`: your own GitHub password on line 22

If you recall from [my previous post](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca), Nomad can run a number of different types of workloads, including but not limited to containerized workloads, virtualized workloads, Java, and even IIS. Since we’re running a containerized workload here, we must ensure that we specify the following:

*   Tell Nomad that we’re running a Docker task. That’s what we see on line 14: `driver = "docker"`.
*   Specify the location of our Docker image. That’s what we see on line 17: `image = "ghcr.io/<your_gh_username>/tech-radar"`. If you’re hosting your image on a private Docker repository, you’ll need to add lines 20–23, so that you can authenticate into the repo.
*   Specify the port that the app is listening on: 8080 (line 9). We’re using a static port in this case, as we’re not going through a load balancer. When we get to the HashiQube example, we’ll be using dynamic ports, which I’ll talk about later.

> **WARNING:** _It is SUPER DUPER DUPER important that you specify a resources stanza (memory, in the very least). If you don’t, Nomad won’t allocate the appropriate amount of RAM (MB) or CPU (Hz), and you’ll be rocking yourself back-and-forth in the fetal position wondering why Nomad hates you so much. I found this out the hard way! (Thank you_ [_sneaky StackOverflow post_](https://stackoverflow.com/a/47143457) _about DigitalOcean.)_

#### 3- Run Nomad locally, and deploy the app

Let’s start up Nomad locally in dev mode:

nomad agent -dev -bind 0.0.0.0 -log-level DEBUG

Once the startup sequence is complete, let’s deploy the app:

cd <your\_cwd>  
nomad job run tech-radar-local.nomad

![](https://cdn-images-1.medium.com/max/800/1*Fa8og2TndFpdQ2qeChzn2Q.png)

> **Pro Tip:** _Make sure that you killed the Docker container instance in the standalone Docker example…otherwise you’re gonna have a helluva time trying to deploy the jobspec due to the port conflict._

If everything goes well, you should be able to see the job running in the Nomad UI. To bring up the Nomad UI, run:

nomad ui

Which will bring up this:

![](https://cdn-images-1.medium.com/max/800/1*aJ2cEMJVOAJMxL9K5lBP4g.png)

And the app running in your browser at `http://localhost:8080`:

![](https://cdn-images-1.medium.com/max/800/1*TzpiJ9mpfuHLlrSLssn-Og.png)

Ta-da! You’re running the Tech Radar job in Nomad!

![](https://cdn-images-1.medium.com/max/800/1*NaveCoYHmD2g5gHNlDKEyw@2x.jpeg)

Photo by [Adri V](http://adri-v.medium.com). Taken at the West Toronto Rail Path.

### Running the Tech Radar App in HashiQube

Okay folks…this is the moment y’alls have been waiting for! The one…the only…HashiQube! Yay!! Let’s do this!

#### 1- Clone HashiQube

git clone https://github.com/servian/hashiqube.git

#### 2- Modify the Vagrantfile

The `Vagrantfile` (located in the `hashiqube` root folder) includes everything that you need to define and configure your virtual machine. It specifies:

*   VM memory and CPU
*   Port mappings (so that your host machine can access ports on the guest machine)
*   Machine name
*   Software installation and configuration on the VM

For my purposes, I only want to run [Nomad](https://www.nomadproject.io), [Vault](https://www.vaultproject.io), and [Consul](https://www.consul.io), so I’m excluding the other tools from the `Vagrantfile`. To make it easy on you, my dear reader, I’ve supplied the modified Vagrantfile below. You’re welcome. 😉

The main things to note are that:

*   Lines 58–64 only include the port-forwarding for the 3 tools I want, plus port 80, which I’ll need for the [Traefik](https://doc.traefik.io/traefik/routing/services/) dashboard, and port 8082, for [Traefik](https://doc.traefik.io/traefik/routing/services/) metrics
*   Lines 119–137: The lines for provisioning the other tools have been removed (cuz I don’t need them)
*   Lines 141–147 only include info for the services that I’m running. I’ve replaced the [Fabio](https://fabiolb.net) URI with the [Traefik](https://doc.traefik.io/traefik/routing/services/) one

#### 3- Modify nomad.sh

The `nomad.sh` file is used to install and configure Nomad. Again, I’ve provided the modified file for your convenience. The file is located in the `hashicorp` folder.

Remember that in our local Nomad example above, I included Docker repo authentication in the jobspec. That’s all well and good, but it’s a terrible idea to include plaintext credentials in a jobspec. Jobspecs should always be version-controlled, but you should **_NEVER EVER EVER_** commit plaintext files to version control. You’ve been warned.

So…what do you do? Luckily for us, Nomad has a pretty dope of handling this! All we have to do is configure a Docker `plugin` stanza in the Nomad client config file. When you include a private Docker repo in your jobspec without an `auth` stanza, Nomad will look for the credentials in the client config file. Now, you have one place for your credentials! Woo hoo!

So where’s this Nomad client config file? In the case of HashiQube, since we’re running the client and server on the same machine, it’s located in `server.conf`. If you’re running Nomad in a public or private cloud, you’ll have client configs in each of your Nomad clients.

Take a gander at lines 42–48 in `nomad.sh` above:

```
plugin "docker" {  config {    auth {      config = "
```

Here we’re telling Nomad to look for the docker credentials file, `dockercfg.json` in `/etc/docker`.

And in case you’re wondering WHERE we set up `dockercfg.json`, it’s in lines 61–75:

chmod +x /vagrant/hashicorp/nomad  
cd /vagrant/hashicorp/nomad  
. ./secret.sh  
export GH\_AUTH\_B64=$(echo "${GH\_USER}:${GH\_TOKEN}" | tr -d '\[\[:space:\]\]' | base64)

mkdir -p /etc/docker  
cat <<EOF | sudo tee /etc/docker/dockercfg.json  
{  
  "auths" : {  
    "ghcr.io" : {  
      "auth": "${GH\_AUTH\_B64}"  
    }  
  }  
}

A few important things to note:

*   It pulls two environment variables from `secret.sh`: `GH_USER` and `GH_TOKEN`
*   The `auth` section in `dockercfg.json` expects a base64-encoded auth token made up of your GitHub username and GitHub password as follows: `${GH_USER}:${GH_TOKEN}`
*   Be sure to add `secret.sh` to your `.gitignore` so that you don’t accidentally commit it to version control.

And speaking of which, for your convenience, you can create `secret.sh` like this:

cat hashicorp/nomad/secret.sh  
echo "export GH\_USER=<your\_gh\_username>" > hashicorp/nomad/secret.sh  
echo "export GH\_TOKEN=<your\_gh\_pat>" >> hashicorp/nomad/secret.sh

Be sure to replace `<your_gh_username>` with your own GitHub username and `<your_gh_pat>` with your own GitHub PAT.

> **Note:** _In real life, you’d be using a configuration management tool such as_ [_Ansible_](https://www.ansible.com) _to inject secrets from HashiCorp Vault into your client config at setup time._

Okay…we’ve sorted our Docker authentication configuration in Nomad. Now we have to install Traefik. That’s done in line 125. More on that next!

#### 4- Create traefik.nomad

I have to admit that I was a bit scared about installing Traefik. Especially since HashiQube included a Fabio installation, so wasn’t that good enough? Luckily, it was pretty straightforward! HashiCorp has a pretty good [Nomad/Traefik tutorial](https://learn.hashicorp.com/tutorials/nomad/load-balancing-traefik), which was a super helpful starting point.

Turns out that all you need to do is to run Traefik as a Nomad job! If you come from Kubernetes-land, this isn’t at all surprising, as we have a similar dealio with the likes of Nginx and Ambassador. The main difference is that with Kubernetes, you’d have to install an operator to install Nginx, Ambassador, etc. Not so with Nomad. Just run the jobspec, et voilà! Mind blown. 🤯

So, with the [Hashi learn tutorial](https://learn.hashicorp.com/tutorials/nomad/load-balancing-traefik) as my starting point, I created a `traefik.nomad` file, which I saved to the`nomad/jobs`folder.

The main thing I want to point out here is that once you deploy the jobspec, you can access Traefik by going to `[http://traefik.localhost](http://traefik.localhost.)`, which we configure via `tags` in the `service` stanza. This particular configuration is found on line 32. Tags are like [annotations in Kubernetes](https://medium.com/dzerolabs/just-in-time-kubernetes-namespaces-labels-annotations-and-basic-application-deployment-f62568a9eaaf), in that they mean something to Traefik, and therefore the Traefik executable knows what to do with them.

The `traefik.localhost` bit threw me for a loop, because to be honest, I didn’t even know that you could PUT something in front of `localhost`, like `blah.localhost`. I just assumed that the Laws of the Universe didn’t allow for that. Well, you know what they say about assume… 😉 Turns out I was wrong, and I learned something new. Hope you did too!

> **Fun fact:** _You can’t just run Nomad and Traefik together. You also need Consul. This is because the tags in lines 30–34 above are actually key/value pairs stored in Consul._

#### 5- Release the kraken!

We are finally ready to deploy our modified HashiQube VM via Vagrant! Woo hoo! To deploy the VM:

cd hashiqube # if you aren't already there  
vagrant up

Now wait patiently for Vagrant to provision and configure your VM.

Once everything is up and running (this will take several minutes, by the way), you’ll see this in the tail-end of the startup sequence, to indicate that you are good to go:

![](https://cdn-images-1.medium.com/max/800/1*ZMkAIGxPtEzi46bDJ0nxWQ.png)

Go ahead and check to make sure that you can access the various services:

*   Vault: [http://localhost:8200](http://localhost:8200/)
*   Nomad: [http://localhost:4646](http://localhost:4646/)
*   Consul: [http://localhost:8500](http://localhost:8500/)
*   Traefik: [http://traefik.localhost](http://localhost:8081/)

Here’s what your Traefik dashboard should look like:

![](https://cdn-images-1.medium.com/max/800/1*793nmpxhwyYL5gl-Vyjgjg.png)

#### 6- Deploy the Tech Radar app

Now that our VM is up and running, we can finally deploy the Tech Radar app! But first, we need to make a few modifications. Since we’re using Traefik as our load balancer, our jobspec now looks like this:

Save it to `hashicorp/nomad/jobs`, and deploy to Nomad:

nomad job run vagrant/hashicorp/nomad/jobs/tech-radar-traefik.nomad

There are a few differences to note between this version and the local Nomad version from the earlier example.

First off, our `group` stanza is different. We’ve specified “bridge” as our `network.mode`, and our port config, while still 8080, is `port.to`, not `port.static`. We used port.static in the Nomad local version, telling Nomad to map Docker port 8080 to localhost port 8080. In the Traefik version, we’re letting Traefik manage this stuff for us. So we’re saying, the app listens on port 8080 in Docker, but uses whatever port that Traefik uses when we access the app on the browser. In our case, we’ve configured Traefik to listen on port 80.

PLUS, we also configured our `service.tags` to tell Traefik that the app is available at `http://tech-radar.localhost`. Go ahead…give it a whirl!

![](https://cdn-images-1.medium.com/max/800/1*TzpiJ9mpfuHLlrSLssn-Og.png)

Now, I wanted to point out the tag configs in lines 17–2- above:

"traefik.http.routers.tech-radar.rule=Host(\`tech-radar.localhost\`)",

"traefik.http.routers.tech-radar.entrypoints=web",

"traefik.http.routers.tech-radar.tls=false",

Note that they start with `traefik.http.routers.tech-radar`. Realistically, we could use `foo` in lieu of `tech-radar` (same idea goes for the traefik jobspec config in the previous section). I could’ve also chosen to name my endpoint `bob.localhost` if I wanted to.

### Shut ‘er down!

When you’re done with HashiQube, you can shut down your VM by running:

vagrant halt

This powers down your VM, and keeps your configurations and data intact next time you run `vagrant up`.

Or you can nukify your VM by running:

vagrant destroy 

This will delete your VM completely, which means that the next time you run `vagrant up`, it will re-provision everything from scratch (i.e. re-create the VM and re-configure it).

### Gotcha: DNS Resolution Issues with \*.localhost

If you’re using a Mac and are running into an issue whereby you try to `curl` the Traefik endpoint and are getting an error like this:

$ curl -H "Host: traefik.localhost" [http://traefik.localhost](http://traefik.localhost)  
curl: (6) Could not resolve host: traefik.localhost

Or can’t access `[http://traefik.localhost](http://traefik.localhost)` on Safari, but can on Chrome, then be sure to check out [this solution using dnsmasq](https://github.com/avillela/hashiqube#dns-resolution-issues-with-localhost).

### Reference Repo

If you’d like to see the complete HashiQube config example (minus the [Tech Radar jobspec](https://gist.github.com/avillela-tc/5cf2fe280c2593a8bb10818e54a7dcaa#file-traefik-nomad)), check out the HashiQube fork that I created [here](https://github.com/avillela/hashiqube).

### Conclusion

Today we’ve learned that:

*   HashiQube is to the Hashi-world as what [MiniKube](https://minikube.sigs.k8s.io/docs/start/), [KiND](https://kind.sigs.k8s.io/docs/user/quick-start/), etc., are to the Kubernetes world.
*   HashiQube is a great way to simulate a real-ish-life Nomad-Consul-Vault setup, taking you beyond the simplistic (and rather impractical) setup of just running Nomad locally.
*   You can’t just run Nomad and Traefik together. You also need Consul running as a pre-requisite.
*   Setting up Traefik on Nomad is not super-scary. That is, once you’ve got the Nomad-Consul-Vault thing going, and HashiQube helps with that. A lot! After that, it’s as simple as deploying a jobspec. Take THAT, Kubernetes and your Operators.
*   Specifying resources (RAM usage in the very least) in your Nomad jobspec will save you a lot of grief.
*   You can configure Docker repo credentials in your Nomad client config, so that you don’t need to specify auth details in your jobspec.
*   `<something>.localhost` is a thing! Who knew?!

Congratulations! You survived this super-duper-duper long tutorial! I hope you learned a ton. I definitely learned a ton on this journey!

Give yourself a pat on the back! And now I shall reward you with a picture of a yak.

![](https://cdn-images-1.medium.com/max/800/1*hd6hj504-9q3qW87e9FgVQ.jpeg)

Photo by [Shane Aldendorff](https://unsplash.com/@pluyar?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/yak?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

### Related Reading

[**Just-in-time Nomad**  
_A Kubernetes practitioner’s guide to understanding HashiCorp Nomad_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca "https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca")[](https://adri-v.medium.com/just-in-time-nomad-80f57cd403ca)

[**Just-in-Time Nomad: Configuring HashiCorp Nomad/Vault integration on HashiQube**  
_A step-by-step guide to configuring HashiCorp Nomad and Vault to allow Nomad to pull Vault secrets_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a "https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a")[](https://adri-v.medium.com/just-in-time-nomad-configuring-hashicorp-nomad-vault-integration-on-hashiqube-388c14cb070a)

[**Just-in-Time Nomad: Running the OpenTelemetry Collector on Hashicorp Nomad with HashiQube**  
_An in-depth look into the Nomad OTel Collector jobspec using Traefik as a load balancer and pulling API keys from Vault_adri-v.medium.com](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382 "https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382")[](https://adri-v.medium.com/just-in-time-nomad-running-the-opentelemetry-collector-on-hashicorp-nomad-with-hashiqube-4eaf009b8382)

### Acknowledgements

Big shout-out to [Ibrahim Buamod](https://www.linkedin.com/in/ibrahim-buamod-91b41443/), who introduced me to HashiQube, and who provided me with the stripped down the Vagrantfile that I used in this tutorial.

### References

*   [Introducing the HashiQube](https://servian.dev/introducing-the-hashiqube-b84ab4d95a31)
*   [HashiQube Official Site](https://hashiqube.com/#/)
*   [HashiQube on GitHub](https://github.com/servian/hashiqube)
*   [HashiCorp Traefik Tutorial](https://learn.hashicorp.com/tutorials/nomad/load-balancing-traefik)
*   [Using Nomad with private Docker repositories](https://technicallyshane.com/2020/10/31/using-nomad-with-private-docker-repositories.html?utm_source=pocket_mylist)

By [Adriana Villela](https://medium.com/@adri-v) on [November 6, 2021](https://medium.com/p/7d6dfd8ef9d8).

[Canonical link](https://medium.com/@adri-v/just-in-time-nomad-running-traefik-on-hashiqube-7d6dfd8ef9d8)

Exported from [Medium](https://medium.com) on June 3, 2026.