---
title: A Beginner’s Guide to OpenStack
slug: a-beginner-s-guide-to-openstack
description: Learn to navigate the Private Cloud with OpenStack.
tags:
  - technical
  - learning
  - "2021"
added: 2021-10-18T00:00:00.000Z
---


![](https://cdn-images-1.medium.com/max/800/1*ig2bKOpuyFXpWZ71Sln8EA.png)

Image by [Adri V](http://adri-v.medium.com)

### The Cloud! The Cloud!

Public Clouds like Amazon’s [AWS](https://aws.amazon.com/), Google’s [GCP](https://cloud.google.com/), and Microsoft’s [Azure](https://azure.microsoft.com/en-ca/) seem to get all the buzz these days, but let’s not forget the unsung hero of the Cloud…the [Private Cloud](https://www.liquidweb.com/kb/difference-private-cloud-premise/). Let’s face it. Many companies out there still run on Private Clouds, whether it’s for regulatory reasons, or due to cost restrictions (left unchecked, cloud bills can be [ridiculously high](https://a16z.com/2021/05/27/cost-of-cloud-paradox-market-cap-cloud-lifecycle-scale-growth-repatriation-optimization/)).

There are two types of Private Clouds: internal, and hosted. Internal Private Clouds are hosted in an organization’s own offices or data center(s). Hosted Private Clouds are owned and operated by a third-party service provider. Hosted Private Clouds can be single-tenant (data centres dedicated to one company), or multi-tenant (data centres hosting multiple companies). Frameworks like [OpenStack](https://www.openstack.org/), [Apache CloudStack](https://cloudstack.apache.org/), [Azure Stack](https://azure.microsoft.com/en-ca/overview/azure-stack/), [IBM Cloud Private](https://www.ibm.com/blogs/cloud-computing/2017/10/31/what-is-ibm-cloud-private/), and others can be used to manage Private Clouds.

When you provision infrastructure in a Public or Private Cloud, you’re hitting an API endpoint that talks to the data centre management frameworks, which in turn provision virtual resources for you (e.g. virtual disks, virtual networks, virtual machines) from their available pool of physical resources.

Today, I’ll be digging into the Private Cloud a bit further, specifically with OpenStack.

OpenStack is an open source framework for managing both Public and Private Clouds.

I have to admit that I’m a total OpenStack newbie. My Cloud experience lies in [GCP](https://cloud.google.com/) and [Azure](https://azure.microsoft.com/en-ca/), so when I heard that we were using OpenStack, I was pretty jazzed! I love me some good learning. 😄 I’ve had the chance to play around with OpenStack for the past few weeks. I’ve bugged various folks on both of my teams about it, and I feel that I now have a pretty decent grasp of the basics.

This has been a rather painful journey. As with many open source goodies, finding out how to do certain things in OpenStack is like a scavenger hunt. Also, working with OpenStack has made me realize that there’s a lot that I take for granted that happens automagically in those big ‘ole Public Clouds. But it also puts me more in touch with all of the things that are in place to make a datacenter work. Very cool.

So, out of my exploration of OpenStack over the past few weeks (I’ve only barely scratched the surface), I wanted to share some of my learnings and gotchas with all y’alls to make your own OpenStack journey run more smoothly. Let’s get started!

### Act 1: OpenStack Core Concepts

Before we get our hands dirty with OpenStack, let’s cover some core concepts first.

OpenStack infrastructure resources are organized into projects. Prior to OpenStack v2 API, Projects were known as Tenants. Projects are typically created by OpenStack admins, who are in charge of allocating resource quotas to a project. Project resources include VCPUs (compute), RAM (memory), number of VM instances, and storage, to name a few. If you try to create resources outside of the quotas defined for your project, well…OpenStack won’t let you. So, if you’ve created 10 VMs in your project, and your VM quota is 10, you can’t create an 11th one.

Within a Project, you can define various resources, such as:

* **Flavours:** VM “hardware” configurations, which include a pre-set combination of RAM and VCPUs. Flavours are typically defined by your OpenStack admins.
* **Images:** VM software configurations. These are the base VM images (e.g. Ubuntu, Windows 10, CentOS, Debian), which can include just the bare-bones OS installations, or they can include some pre-installed software (e.g. DB server, app server) and additional configs. Image visibility can be set to public (accessible by all projects), community, shared, or private (accessible only within your project).
* **Instances:** These are VM instances that use a particular pre-defined image
* **Key Pairs:** Used for public key authentication into your VMs
* **Security Groups:** Contain a collection of firewall rules to control access to/from your virtual machines.
* **Security Group Rules:** Firewall rule definitions. These are associated with a security group.

There are many other resources in OpenStack that we could go into, but they’re outside of the scope of this article.

### Act 2: Client Configuration

And now for the fun part. Now that we’ve covered the basics, we can begin playing with OpenStack!

#### Pre-requisites

This tutorial assumes that:

* You have Python >=3.8 installed on your local machine
* You have access to OpenStack (whether it’s at your own work datacenter or in your own personal little cloud somewhere)
* You already have an OpenStack project (tenant) configured, and you have the ability to create resources
* You already have VM base images and flavours defined in your OpenStack environment

#### 1- Install the OpenStack CLI

Like its Public Cloud cousins, OpenStack has both a UI (called [OpenStack Horizon](https://docs.openstack.org/horizon/latest/)) and a CLI. To install it, you need to have Python >=3.8 installed on your machine. I recommend setting up a Python virtual environment. We can do this by installing the `virtualenv` tool:

pip3 install virtualenv\
virtualenv venv

source venv/bin/activate\
python -m pip install — upgrade pip

In the above command we:

* Install `virtualenv`, and use it to create a virtual environment called `venv` in the current directory
* Activate the virtual environment, so that it becomes our current working Python environment
* Upgrade `pip` in the virtual environment

> **Note:** *You can create a virtual environment in whichever directory you like, and you can name your virtual environment whatever you want.*

Now you’re ready to install the OpenStack CLI:

pip install python-openstackclient

Verify the installation:

openstack --version

You should get output that looks something like this:

![](https://cdn-images-1.medium.com/max/800/0*xz_h5sEElBApBKmt)

#### 2- Connect to OpenStack via openrc.sh

Now that we’ve got the CLI installed, let’s see if we can connect to OpenStack.

The [OpenStack documentation](https://docs.openstack.org/newton/user-guide/common/cli-set-environment-variables-using-openstack-rc.html) tells us that to connect to OpenStack, we need an `openrc.sh` file. This file is nothing more than a bash script that sets a bunch of environment variables that the CLI needs in order to connect to OpenStack. A typical `openrc.sh` file looks something like this:

Let’s find out what these environment variables actually mean:

* `OS_PROJECT_NAME`: The name of your OpenStack project
* `OS_PROJET_DOMAIN_NAME`: The OpenStack domain in which your project exists
* `OS_REGION_NAME`: The region in which your project exists
* `OS_AUTH_URL`: Your OpenStack URL
* `OS_USERNAME`: Your OpenStack LDAP account username
* `OS_PASSWORD`: Your OpenStack LDAP account password
* `OS_USER_DOMAIN_NAME`: Your OpenStack LDAP account domain
* `OS_IDENTITY_API_VERSION`: The version of the OpenStack API to use (at the time of this writing, version 3)

> **Note:** *The above script reads your OpenStack password from an environment variable called* `_OS_PASSWORD_`*, located in a file called* `_.ospwd_`*. Be sure to add this file to your* `_.gitignore_` *so that you don’t accidentally store it in version control. 😳*

Create `.ospwd`, replacing `<your_ldap_password>` with your own LDAP password:

touch .ospwd\
printf “export OS\_PASSWORD=\”\<your\_ldap\_password>\”” >> .ospwd

After setting the appropriate values in your own `openrc.sh`, run the script:

`source openrc.sh`

And then try out a command in OpenStack:

openstack user show \<your\_ldap\_username>

You should see something like this:

![](https://cdn-images-1.medium.com/max/800/0*pgx05tIyYvNc-xrn)

#### 3- Rewind. Install the OpenStack SDK and Configure clouds.yaml

Remember how we set up openrc.sh to connect to OpenStack? Well, it’s not the greatest way to connect to OpenStack, in my opinion. The thing that I find annoying about `openrc.sh` is that you either need to keep multiple versions of it to connect to different projects, or you parametrize the file to connect to different projects. Either way, I find that hugely annoying. Lucky for us, there’s a better way to connect to OpenStack — the OpenStack SDK.

Let’s install the OpenStack SDK:

pip install openstacksdk

Let’s verify our installation:

python -m openstack version

Sample output:

![](https://cdn-images-1.medium.com/max/800/0*m8YCQbKM7XAherry)

With the OpenStack SDK installed, we need to create a file called `clouds.yaml.` This file resides in `~/.config/openstack`:

mkdir -p \~/.config/openstack\
touch \~/.config/openstack/clouds.yaml

And now we can fill out `clouds.yaml`:

You might recognize the `auth` fields as being the same ones we saw in `openrc.sh`…because they are! The nice thing here is that we can define multiple clouds in one file. A cloud refers to a group of configs for a given project. In the sample file above, we’ve defined two clouds: `os_tenant1`, and `os_tenant2`. You can call these whatever you like, even `bob_the_cloud`. Just make sure that it’s something descriptive, and make sure that you reference the proper cloud name when connecting to OpenStack.

> **Note:** *The OpenStack SDK is looking for* `_clouds.yaml_`*, not* `_clouds.yml_`*. If you create a* `_clouds.yml_`*, it won’t work.*

And speaking of connecting to OpenStack…let’s find out how to do that now that we have the OpenStack SDK installed and `clouds.yaml` configured. We can do it in one of two ways.

**Method 1: Set the cloud name in an environment variable**

If we choose this approach, we connect to OpenStack like this:

export OS\_CLOUD=os\_tenant1\
openstack user show \<your\_ldap\_username>

By setting the `OS_CLOUD` environment variable, it ensures that any subsequent calls to the OpenStack CLI will apply to that cloud configuration. Way nicer than having to source that bash script, in my opinion.

**Method 2: Pass the cloud name to the CLI**

openstack --os-cloud=os\_tenant1 user show \<your\_ldap\_username>

If you choose this method, every time you call the openstack command, you need to pass it the `--os-cloud=<cloud_name>` argument.

Either method is sound, so it comes down to a matter of personal preference.

The examples above are super-basic, and for the purposes of this tutorial, they get the job done as far as connecting to OpenStack. There’s a lot more that you can do with clouds.yaml, so if you’d like to play around with the configs check out the official docs [here](https://docs.openstack.org/openstacksdk/latest/user/config/configuration.html).

### Act 3: Resource Creation

Yay! We’re finally at the point where we get to create some resources! Let’s do this!!

#### 1- Create a security group and rules

First things first, you’ll need to create a security group in OpenStack. Remember from **Act 1** that a security group contains a collection of firewall rules. If you want to SSH into your VMs, especially if you’re behind a firewall, you’ll need to create a security group and rules.

By default, you already have a Security Group in your project. It is aptly named `default`. To create a new Security Group and accompanying Security Group Rules, we do the following:

export OS\_CLOUD=”os\_tenant1”

openstack security group create “foo”

openstack security group rule create --ethertype “IPv4” --ingress --dst-port “22” --protocol “TCP” --remote-ip “\<some\_value\_here>” “foo”

Where:

* In the code snippet above, my security group is named `foo`, and the security group rule that I create is associated with the foo security group.
* Security rules can be either `--ingress` or `--egress`.
* `protocol`: Can be one of `tcp`, `udp`, or `icmp`. The default is `tcp`.
* `dst-port`: Can be either a port number (e.g. 22) or port range (e.g. `8000:8080`). This setting applies only to `tcp` and `udp`.
* `remote-ip`: The block of IP addresses to which this rule applies. Supports [CIDR notation](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking).

> **Note\_:\_** *The security group rules that you add depend on what access you need to your VMs. For more on Security Group Rules, check out the OpenStack docs* *[here](https://docs.openstack.org/python-openstackclient/pike/cli/command-objects/security-group-rule.html).*

Once you’ve created your Security Group and Security Group Rules, you can view them like this:

openstack security group show “foo”

Sample output:

![](https://cdn-images-1.medium.com/max/800/0*Y1ZwSyLFD8CmIJFG)

> **Note:** *If you wish to see the output in JSON, append* `_-f json_` *to the command above.*

#### 2- Create your VM instance

We can finally create our VM instance! Woo hoo! But wait…before you do that, there are a few things you must decide on:

* What VM image would you like to use?
* What flavor would you like to use?

If you don’t remember what **flavors** and **images** are, hop on over to **Act 1** above for a refresher.

Not sure what flavor to select? No problem. Let’s get a list of flavors available to us. Remember that your admin will have set these up already.

openstack flavor list

Sample output lists our flavor names, IDs, and machine specs:

![](https://cdn-images-1.medium.com/max/800/0*DKgQQH2bHzifEohD)

We can also list the images available to us:

openstack image list

Sample output lists the image IDs (GUID) and their names:

![](https://cdn-images-1.medium.com/max/800/1*JoIGdcpYrEagOmmS3IoHCQ.png)

If I wanted to see the images from another project, my command would look like this:

openstack --os-cloud=”os\_tenant2”

NOW we’re ready to provision our VM!

openstack server create --image \<image\_name\_or\_id> --flavor \<flavor\_name\_or\_id> --security-group \<security\_group\_name> \<vm\_name>

Where:

* `image` is the name or GUID of your desired base image
* `flavor` is the name or ID desired machine flavor
* `security-group` is the name of the security group that you used to defined access to your machine (see step 1 in this section)
* `<vm_name>` is the name you want to give to your VM

Sample output:

![](https://cdn-images-1.medium.com/max/800/0*_eTMWCm3FV18p3L5)

#### 3- SSH into your machine

Let’s make sure that our machine is accessible by SSHing into it.

VM\_IP=$(openstack server show foo1 -f json | jq '.addresses.\<project\_name>\[0]' | tr -d '"')

ssh \<your\_ldap\_username>@$VM\_IP

First, we needed to find the IP of our newly-created VM. The OpenStack CLI allows us to output the results as JSON, and we use `jq` to parse the JSON output to give us just the IP. Be sure to replace `<project_name>` with your own project name.

To install `jq` on Mac using Homebrew, run:

brew install jq

> **Note:** *To instsall* `_jq_` *on other operating systems, check out the* `_jq_` *docs* *[here](https://stedolan.github.io/jq/download/).*

With IP in hand, we can now SSH into our machine!

![](https://cdn-images-1.medium.com/max/800/0*GTMwHjGEEyFUcmuw)

Success! We got the command prompt for our newly-created VM!

### Act 4: Misc OpenStack CLI Goodies

I thought that it would be worthwhile to mention a few other useful OpenStack CLI goodies.

#### **1- List all of the servers in your project**

openstack server list

#### **2- Delete the specified server from your project**

openstack server delete \<server\_name>

#### **3- List all of the security groups defined in your project**

openstack security group list

#### **4- Return the GUID for the image called \<image\_name>**

openstack image list -f json | jq '.\[] | select(.Name|test("^\<image\_name>")) | .ID' | tr -d '"'

### Conclusion

OpenStack is a pretty cool open source framework for managing Cloud infrastructure. Once you get over some of those initial setup humps, you’re good to go. We’ve learned how to:

* Install the OpenStack CLI
* Connect to OpenStack via CLI using the `open.rc` file
* Connect to OpenStack via CLI using the OpenStackSDK and the `clouds.yaml` file
* Create some resources in OpenStack using the CLI

Hurray! You did it! Give yourself a pat on the back! I shall now reward you with a picture of a cow:

![](https://cdn-images-1.medium.com/max/800/0*YblKJQLhYpD6AUWA)

Photo by [Wolfgang Hasselmann](https://unsplash.com/@wolfgang_hasselmann?utm_source=unsplash\&utm_medium=referral\&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/cow?utm_source=unsplash\&utm_medium=referral\&utm_content=creditCopyText)

Peace, love, and code.

### References

* [OpenStack CLI installation](https://help.dreamhost.com/hc/en-us/articles/235817468-Getting-started-with-the-OpenStack-command-line-client)
* [OpenStack RC](https://docs.openstack.org/newton/user-guide/common/cli-set-environment-variables-using-openstack-rc.html)
* [OpenStack SDK installation](https://docs.openstack.org/openstacksdk/latest/install/index.html)
* [OpenStack SDK connection management](https://docs.openstack.org/openstacksdk/latest/user/guides/connect_from_config.html)
* [Server creation and management (CLI)](https://docs.openstack.org/python-openstackclient/pike/cli/command-objects/server.html#server-create)
* [Image creation and management (CLI)](https://docs.openstack.org/glance/pike/admin/manage-images.html)
* [Flavour creation and management (CLI)](https://docs.openstack.org/nova/latest/admin/flavors.html)
* [Generate a key pair](https://docs.openstack.org/newton/install-guide-rdo/launch-instance.html)
* [Security group creation and management (CLI)](https://docs.openstack.org/python-openstackclient/pike/cli/command-objects/security-group.html)
* [Security group rule creation and management (CLI)](https://docs.openstack.org/python-openstackclient/pike/cli/command-objects/security-group-rule.html)

By [Adriana Villela](https://medium.com/@adri-v) on [October 18, 2021](https://medium.com/p/9bc024f4c4e3).

[Canonical link](https://medium.com/@adri-v/a-beginners-guide-to-openstack-9bc024f4c4e3)

Exported from [Medium](https://medium.com) on June 3, 2026.
