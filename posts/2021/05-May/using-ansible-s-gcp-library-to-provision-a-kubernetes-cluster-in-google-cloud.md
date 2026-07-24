---
title: "Using Ansible’s GCP Library to Provision a Kubernetes Cluster in Google Cloud"
slug: using-ansible-s-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud
description: "Step aside, Terraform! Learn how to use Ansible’s Google Cloud modules to provision a GKE cluster in an easy and declarative manner."
added: "May 09, 2021"
tags:
  - technical
  - google-cloud
  - kubernetes
---


![](https://cdn-images-1.medium.com/max/800/1*pEGiqxzrNssYHNMf8mgUlA.png)

Heart sign at Toronto’s Trinity Bellwoods Park. Image by Dzero Labs

### Double-take

A few years ago during a job interview, someone asked me the difference between [Ansible](http://ansible.com) and [Terraform](http://terraform.io). I confidently told them that Ansible is used for configuration management, and Terraform is used for infrastructure provisioning. For example, you could use Terraform to create a VM instance in the cloud, and use Ansible to install apps and configure the VM.

Imagine my surprise when, this week, I discovered that Ansible has a [library of modules for provisioning resources for various Cloud providers](https://www.ansible.com/integrations/cloud)!

![](https://cdn-images-1.medium.com/max/800/1*mg_rZQ7CVKO5sPcBWiAh9Q.jpeg)

Image credit: [RoxanneModafferi.net](http://roxannemodafferi.net/RBlog/2016/04/11/visiting-moms-family-amherst-training-at-old-gym-baby-party-narrowly-avoided-disaster/whaaa-minion/)

Maybe this isn’t new to you, but for me this was a HUGE SHOCK! I was so shocked that at first I didn’t believe what I was reading. So I decided to do some some digging. It turns out that Ansible has been at this since _at least 2018_ ([Ansible 2.6](https://docs.ansible.com/ansible/latest/roadmap/ROADMAP_2_6.html?extIdCarryOver=true&sc_cid=701f2000001OH7EAAW)), when it [partnered with Google to create Google Cloud Platform modules](https://developers.redhat.com/blog/2020/05/06/using-ansible-to-automate-google-cloud-platform/). Well then…

My shock was then replaced by a burning desire to try this thing out for myself. So I decided to create a little test project to use Ansible to create a Kubernetes cluster in Google Cloud.

Ready? Let’s do this!

### Creating a GKE Cluster Using Ansible

#### Pre-Requisites

This tutorial assumes that:

*   You have an existing [Google Cloud](http://cloud.google.com) project
*   You have an understanding of [Docker](https://www.docker.com), and have it [installed](https://docs.docker.com/get-docker/) on your local machine
*   You’ve created a [Service Account](https://cloud.google.com/iam/docs/creating-managing-service-accounts#iam-service-accounts-create-gcloud) in Google Cloud
*   You’ve created a Google Kubernetes Engine (GKE) cluster before
*   You’ve used Ansible before, and are familiar with [Ansible roles](https://docs.ansible.com/ansible/latest/user_guide/playbooks_reuse_roles.html)

The last time I used Ansible was sometime in early 2020, so it took me a bit of time to re-acclimate myself with it. That said, I was really surprised by how smoothly things went overall!

In order to make this easier, I’ve gone ahead and created a self-contained, containerized environment for running this tutorial.

#### 1- Clone the tutorial repo

Let’s begin by cloning the tutorial repo:

git clone git@github.com:d0-labs/ansible-gke.git

#### 2- Set up your environonment variables

Now that we’ve cloned the project, let’s open up `setup.sh`. Replace the values in `<…>` with your own values.

`**<gcp_project_name>**`: This is the name of our Google Cloud project. If you’re wondering what your project name is, use this command:

gcloud projects list

Sample output:

PROJECT\_ID        NAME              PROJECT\_NUMBER  
aardvark-project  aardvark-project  112233445566

Use the value returned in the `NAME` column.

`**<service_account_name>**`: The name of the service account for your Google Cloud project.

`**<service_account_private_key_json>**`: This is the fully-qualified name of the JSON service account private key stored on your local machine. For example, `/home/myuser/my-sa.json`, if your file is located in the `/home/myuser` folder. Or `my-sa.json` if your file is located in your current working directory.

> **Note:** _This JSON_ private key _is generated upon creation of the Service Account, to be sure to store it somewhere safe (and not in version control). Per_ [_Google’s docs on Service Account Keys_](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys)_, “After you download the key file, you cannot download it again.”_

Next, run the following script:

./setup.sh

This script uses the Linux `envsubst` command to replace the values you set above with your own GCP project’s values in `ansible/playbook.template.yml` and creates `ansible/playbook.yml`. Similarly, it replaces values in `docker/startup.template.sh`, and creates `docker/startup.sh`.

#### 3- Build the Dockerfile

The Dockerfile below has everything you need to run the example tutorial. It installs:

*   The `gcloud` CLI
*   The `kubectl` CLI
*   Ansible
*   The Ansible GCP modules

Let’s build the Dockerfile:

docker build -t docker-ansible:1.0.0 docker

Remember — the `Dockerfile` is located in the `docker` folder of our project, which is why the context is set to `docker` when building.

#### 4- Take a look at the playbook

The `playbook.yml` file (located in the `ansible` directory) is our Ansible playbook. It doesn’t do much, other than set up some Google Cloud variables, and call a role called `gke-test`. The role is where the real magic happens.

Nothing to do here specifically. I just wanted you to look at the file.

#### 5- Take a look at gke-test/tasks/main.yml

The `main.yml` file located in the `ansible/gke-test/tasks` directory is where the cluster is created and configured.

This is the task file for our `gke-test` role. It does three things:

*   Creates and configures our Kubernetes cluster (`google.cloud.gcp_container_cluster` module from the `google.cloud` collection that we installed in Step 3)
*   Creates and configures a node pool for the Kubernetes cluster (`google.cloud.gcp_container_node_pool` module from the `google.cloud` collection that we installed in Step 3)
*   Adds the newly-created cluster to our local `[kubeconfig](https://medium.com/dzerolabs/just-in-time-kubernetes-a-beginners-guide-to-kubernetes-core-concepts-19ee7acbafa1)` file

The cluster is created in the first task, and then the cluster info is passed to the node pool creation task to create the node pool in the cluster.

> **Note:** _Both tasks are required for creating a Kubernetes cluster in Google Cloud. If you exclude the node pool task, once your cluster is created, it will show up as having 0 nodes, which means that it’s pretty much useless._

If you’ve used [Terraform](http://terraform.io) or [Pulumi](http://pulumi.com) before, the parameters in the above tasks may look familiar. These parameters are used to configure your cluster. For example:

*   `initial_cluster_version` (cluster task) sets the version of the GKE cluster to 1.19.x
*   `initial_node_count` (cluster task) is the number of nodes to create when creating the cluster
*   `config.machine_type` (node pool task) sets the type of VM to use for our cluster nodes

For more info on what these parameters mean, check out the `[google.cloud.gcp_container_cluster](https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_container_cluster_module.html#parameters)` [module documentation](https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_container_cluster_module.html#parameters) and the `[google.cloud.gcp_container_node_pool](https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_container_node_pool_module.html#parameters)` [module documentation](https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_container_node_pool_module.html#parameters).

Note also the `state` parameter on lines 30 and 60. If `state: present`, then Ansible will attempt to create the cluster and node pool. If `state: absent`, then Ansible deletes the cluster and node pool when you run the playbook. We’re parametrizing it in this task. More on that below.

#### 6- Create the cluster

Now we’re ready to create our cluster! To create it, let’s spin up our container instance:

docker run -it --rm \\  
  -v $(pwd)/ansible:/workdir/ansible \\  
  docker-ansible:1.0.0 /bin/bash

You should see a prompt that looks something like this:

root@57236f71a22c:/workdir#

At the prompt, run the command below from the root folder of your project:

./startup.sh && ansible-playbook -vv --extra-vars cluster\_state=present ansible/playbook.yml

This command will set your project and authentication (via service account) in Google cloud, and then will run the Ansible playbook.

Note that we’re setting the command-line variable `cluster_state` to `present`. This gets replaced in lines 30 and 60 of the file in Step 6, telling Ansible to create the cluster and the node pool.

This may take a few minutes. Mine took about 10 minutes using the setup above.

You’ll notice that it’ll appear to be stuck on the “Create a GKE cluster” task for a while. **Don’t panic!** Ansible is creating your GKE cluster. For a little peace of mind, you can check things out on your Google Cloud Console by going to `Kubernetes Engine > Clusters` from the left-hand menu:

![](https://cdn-images-1.medium.com/max/800/1*6TZy-5sByWiZqZNSfqxNFg.png)

Take note of the lovely spinning circle (outlined by the red box in the image above). This is Google telling you that your cluster is being created!

Similarly, once the cluster is created, Ansible will appear to be stuck on the node pool task. Again, you can go to the Google Cloud console to see what’s going on, by clicking on your cluster and then selecting the Nodes tab:

![](https://cdn-images-1.medium.com/max/800/1*ETl33op-GZvSR7vTf-3I_g.png)

Once the cluster and node pools are created, you should see output that looks something like this:

![](https://cdn-images-1.medium.com/max/800/1*VQVwk6CenBXcYxw4At8kYg.png)

> **Note:** _If you use_ `_-vvv_` _instead of_ `_-vv_`_, you get a more verbose output, and the cluster creation summary block (the stuff in yellow in the screen shot above) is formatted as JSON._

#### 8- Connect to the cluster

If all goes well, you should now have a brand-spaking-new Kubernetes cluster. Let’s do a quick spot check. First, let’s make sure that the cluster is in our `kubeconfig`:

kubectl config get-contexts

We should get an output that looks something like this:

![](https://cdn-images-1.medium.com/max/800/1*yeMdGHVRlUxmgcMcNw8YVA.png)

Yup. There’s our cluster!

Let’s also run a quick command in our cluster to check the namespaces:

kubectl get nodes

Your output should look something like this:

![](https://cdn-images-1.medium.com/max/800/1*82Hqg5b8sListYWhF06jbA.png)

And let’s peek into our namespaces:

kubectl get ns

![](https://cdn-images-1.medium.com/max/800/1*3ABX0ysKjcnr6YOhlkT6hA.png)

There you go! We’ve got ourselvs a GKE cluster!

#### 9- Delete the cluster

To delete the cluster, you simply re-run the playbook, setting the `cluster_state` `extra-var` to `absent`:

./startup.sh && ansible-playbook -vv --extra-vars cluster\_state=absent ansible/playbook.yml

This gets replaced in lines 30 and 60 of the file in Step 6, telling Ansible to delete the cluster.

Again, it’ll take a few minutes to run the task. When all is said and done, you’ll get an output that looks something like this:

![](https://cdn-images-1.medium.com/max/800/1*kDZpO1BiNlV3eG8Fm3xCRw.png)

Sample Ansible output after deleting a GKE cluster.

### Thoughts on Ansible for Cloud Provisioning

Honestly, I am shocked by how easy it was to create a Kubernetes cluster in Google Cloud using Ansible’s GCP library. When I embarked on this little experiment, I fully-expected this to take a chunk of my afternoon.

Personally speaking, there were only two time-consuming things:

#### 1- Remembering how to use Ansible

I hadn’t used Ansible in a while, so I had to remember a bunch of syntax, and I had to remind myself how roles worked.

#### 2- Sparse documentation

The documentation for the Ansible cloud libraries is rather sparse and somewhat vague, so I had to do a big of digging around to make sure I was using the libraries correctly. Honestly, Ansible’s own docs turned out to be pretty decent, but I think I can say this because I’ve messed around with other Cloud infrastructure provisioning tools like Terraform and Pulumi, so I wasn’t going in completely blind.

When I tried to search for solutions on creating Cloud infrastructure using Ansible _outside_ of Ansible’s own docs, I found a whole lotta nothing. Most posts out there use Ansible to provision Cloud infrastructure the hard way, resorting to making calls to the target Cloud’s Provider’s CLI. The modules are waaaay nicer, and are fully-declarative.

#### Other thoughts

After creating the cluster initially, I decided to try a little experiment. I changed the number of initial cluster nodes from 3 to 4, and re-ran the playbook with `--extra-vars cluster_state=present`. If I had done this in Terraform or Pulumi, those tools would have seen this as a modification of state, and would’ve proceeded to delete and recreate the cluster. This didn’t happen with Ansible.

Instead, when I re-ran the playbook after making the parameter change, Ansible told me that there were no changes to the cluster.

![](https://cdn-images-1.medium.com/max/800/1*vvhZ7wzJrNPHizRz9dVYaQ.png)

For you Terraform and Pulumi folks, this may be a glaring issue. Not for me. I’m actually glad that it does that. Infrastructure creation/modification should not be taken for granted. We must always be vigilant of our infrastructure. If we make changes to it, we should explicitly destroy and recreate it. We must treat it as ephemeral, so that we have full confidence in the repeatability of infrastructure creation.

### Conclusion

There are two big lessons from this Ansible experiment:

1.  Technology is always evolving, so it’s always good to revisit old techs that you’ve touched years or months earlier, to see where it’s at — it may surprise you!
2.  Ansible is actually a good, easy-to-use tool for provisioning Cloud infrastructure. Plus, it’s declarative, which gets bonus points in my book!

And now, I shall reward you with a Susie the rat being cuddled by my other half!

![](https://cdn-images-1.medium.com/max/800/1*lukKfitag04VEuSEANGQ9g.png)

Susie the rat likes cuddles and declarative infrastructure provisioning.

Peace, love, and code.

### Related Reading

[**Shifting from Infrastructure as Code to Infrastructure as Data**  
_A brief intro to Cloud infrastructure, and a dive into why you should take a data-driven approach to provision cloud…_medium.com](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3 "https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3")[](https://medium.com/dzerolabs/shifting-from-infrastructure-as-code-to-infrastructure-as-data-bdb1ae1840e3)

### References

*   [Cloud Support with Ansible](https://www.ansible.com/integrations/cloud)
*   [Google Cloud Platform Guide (Ansible.com)](https://docs.ansible.com/ansible/latest/scenario_guides/guide_gce.html)
*   [GCP Container Cluster Module (Ansible.com)](https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_container_cluster_module.html)
*   [GCP Container Node Pool Module (Ansible.com)](https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_container_node_pool_module.html#parameters)

By [Adriana Villela](https://medium.com/@adri-v) on [May 9, 2021](https://medium.com/p/6fd1910f1700).

[Canonical link](https://medium.com/@adri-v/using-ansibles-gcp-library-to-provision-a-kubernetes-cluster-in-google-cloud-6fd1910f1700)

Exported from [Medium](https://medium.com) on June 3, 2026.