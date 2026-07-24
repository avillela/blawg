---
title: "How to Write an Awesome Technical “How-To” Blog Post"
slug: how-to-write-an-awesome-technical-how-to-blog-post
description: "Tips and tricks for writing a technical “how-to” tutorial-style blog post that will blow your readers’ socks off."
added: "Nov 29, 2021"
tags:
  - technical
  - advice
  - thought-leadership
  - "2021"
---


![](https://cdn-images-1.medium.com/max/800/1*TuleSczPIB7Z3McSDKIaCA@2x.jpeg)

Photo by [Adri V](https://adri-v.medium.com)

Over the past few weeks, I’ve been coaching my teammates and mentees on writing technical blog posts. For many of them, writing technical blog posts is new to them, so there’s usually a big learning curve involved. It’s not only about conveying a complex technical topic in a succinct manner. It’s also about the authors finding their writing voice.

I actively encourage all of my teammates to blog. I also make it a part of their jobs, and not some extra-curricular thing. I think that blogging is a great way for tech folks to build their personal brand, develop leadership skills (no better way to demonstrate leadership than to communicate effectively), and to give back to the tech community. As tech folks, we all rely heavily on blog posts (and [StackOverflow](https://stackoverflow.com)!) to get our jobs done. It’s always nice to be able to pay it forward by sharing it with the world when we figure out how to do something that was gnawing at us for weeks. On a more selfish note, it’s also a great way to do a brain dump. It has the added benefit of giving your brain room to learn new stuff, and also serves as a great reference for yourself. I can’t tell you how many times I’ve gone back to my own technical articles to look things up.

This week, while helping out one of my teammates with his technical blog post, he said to me, “If you wrote a blog post on how to write a technical blog post, I would definitely read it.” 💡 Heeeey….not a bad idea! What a great opportunity to not only help my teammates write better blog posts, but to also share my experience and learnings with others.

### Showtime!

I highly recommend following _all_ of the points below when writing a technical how-to tutorial-style post, in order to ensure maximum effectiveness. As an author, you goal is to convey a complex technical concept in an easily-understandable manner. You want to make sure that your readers come out feeling like they learned something useful and/or that you helped them solve a gnarly problem.

> **Note:** _This article is aimed at folks who are writing a technical how-to tutorial-style post, which involves detailed code examples and explanations. You can use many of the concepts covered here for technical non-how-to posts as well._

So…without further ado, behold…my tips on writing a kick-ass technical blog post!

#### 1- Come up with a meaningful title

Your title should be descriptive enough to signal to the reader what to expect. While it may be fun to come up with a witty or catchy title, that won’t get you found on Google or some other search engine.

#### 2- Include an eye-catching at the start

The picture doesn’t have to be related to your post. You can find tons of cool royalty-free photos on [unsplash.com](http://unsplash.com/). Just make sure you attribute the photographer. I often use my own personal photos for my posts. For your own photos, attribute yourself as the photographer. Do whatever tickles your fancy, but include a photo.

#### 3- Start with a catchy opener

Nothing sucks more than a boring opener for a blog post. Start with a fun personal story, or a scenario. Beware of having a long opener — if you beat around the bush too much with your intro, your reader may lose interest.

#### 4- State your objectives

What are you trying to accomplish with your post? Who is this post aimed at?Make it super clear, so that the reader knows what to expect. It also helps to keep you in check too!

#### 5- State your assumptions

_Know your audience!_ When writing a technical post, you can’t be everything to everyone. If you’re writing a more advanced technical post about Kubernetes on GCP, for example, state that you’re assuming that the reader is familiar with setting up Kubernetes on GCP.

#### 6- List your pre-requisites

When writing a technical post, especially a tutorial, it’s super important to list what tools are needed to run the tutorial. If possible, include commands for installing certain tools, or provide links to the tool site’s installation instructions. Don’t forget to indicate what version of the tool(s) you’re using.

#### 7- Provide a recap of key terms/concepts if needed

Sometimes it’s helpful to provide recaps of certain terms in your post, to avoid having your readers go back-and-forth between your post and Google to define a key term. For example, when writing a technical how-to post on [OpenTelemetry](http://opentelemetry.io), consider including a quick definition of [Observability](https://adri-v.medium.com/unpacking-observability-a-beginners-guide-833258a0591f) and [OpenTelemetry](http://opentelemetry.io).

#### 8- Don’t be afraid to write a long post

You’re writing a technical blog post. You need details. If that means that you end up with a 10- or 15-minute read, then so be it. The key is to make sure that you are clear and concise, while providing enough detail for your readers.

#### 8a- Keep your post focused

While I am giving you permission to write a long post to convey your point, what I do advise against is trying to cover too many different things in a post. Make sure that the post is laser-focused. It’s fine to do an overview of core concepts and terminology, but if you find yourself meandering into another topic, then STOP, and ask yourself what you’re trying to accomplish with the post.

![](https://cdn-images-1.medium.com/max/800/1*OYCbIHOn7y4R5zAiWK5ivw.png)

Photo by [Adri V](https://adri-v.medium.com)

#### 9- Break up the wall of text

Just because a post is long doesn’t mean it should be one big wall of text. Include diagrams (where applicable), photos from [Unsplash](https://unsplash.com), your own photos, or fun animated gifs (e.g. from [giphy.com](http://giphy.com)) to break up the text a bit. If you’re including diagrams or images, always provide attribution in the caption, whether it’s from an external source, or it’s something that you created yourself. Careful not to sprinkle too many memes or animated gifs in your post, otherwise it starts to look tacky.

#### 10- Provide all the gory details

I absolutely hate reading technical posts where it’s clear that the author got bored halfway through, got lazy, and decided that it wasn’t worth the time and effort to explain a concept in detail, instead leaving it to the reader to figure out what in Space they’re talking about. It’s irritating, and if you’re new to a particular technology or concept, it can be deflating.

So, when you’re writing a technical post, make sure that you include the following:

*   **Code snippets.** When writing a technical how-to tutorial-style post, it is important to include code snippets. Be sure to explain what the code does, and call out specific lines of code that highlight a point that you’re trying to make. If the code has variables or parameters, explain what these are. If you’re writing on Medium, you can do this by embedding [GitHub Gists](https://blog.medium.com/yes-we-get-the-gist-1c2a27cdfc22).
*   **A sample git repo.** Yes, it’s a pain in the buttocks to set up an example repo (almost as much work as writing the tech post itself), but it’s soooo worth it! Whether you host your code on GitHub, GitLab, Bitbucket, or wherever, it doesn’t matter. Having an end-to-end working example that readers can clone and try on their own is super-duper handy. Having blog posts with example code repos has saved my hide tons of times.
*   **Versions of the things that you’re using!** If you’re using a tool, framework, programming language, etc., be sure to explicitly indicate what version you’re using. I can’t tell you how many times I’ve tried following a coding example, only to find out that the version of the tool in the example was older than the version I was using, resulting things not working because in version 1.2 of a framework, there was a field called get\_cats, and in version 1.3, the field was renamed getCats.
*   **Sample output.** If you’re giving an example of a command, show some sample output so that your reader knows what to expect when they run that command.
*   **Gotchas.** It’s likely that you’ve run into issues when trying out a new technology. When blogging about it, share some of the issues you ran into. Chances are, your readers may have encountered the same thing. It may also save them from archaeological digs through [Stack Overflow](https://stackoverflow.com).
*   **Define key terms and avoid lame-o definitions.** I hate it when I’m reading a blog post whereby the author defines a term, and it’s clearly swiped from Wikipedia or user docs or whatever. To me it shows that they don’t fully understand the term, and are just parroting a definition. Make an effort to understand key terms/concepts that you’re blogging about, by providing definitions that are easy to understand. Include examples if possible.

#### 11- Edit, edit, and edit some more!

Just because you’re done writing, it doesn’t mean that the post is ready to be published. I always give my posts a read (sometimes multiple reads) after I finish writing them. It’s best to re-read your post the next day, or even a couple of days later, to give your brain a break from the post.

As part of your editing process, you may have to re-arrange sections, or scrap whole sections altogether. It can sometimes be heart-wrenching to do so, especially if you need to delete a section that had a kick-ass paragraph or sentence. Never fall in love with your writing. Be prepared to let it go for the greater good.

Also be prepared for the fact that you may very well spend as much time editing your piece as you did writing it.

#### 12- Get an extra set of eyes (or two) on your writing

I never publish a blog post without having at least one other person review it. If it’s a super-duper technical post, I usually try to get 1–2 people with expertise in that area to review, to make sure that I’m not spewing hooey in my posts. If I’m writing an intro post, I also try to get someone who is technical, but who isn’t familiar with the topic I’m writing about, to read the post, so that I can gauge whether or not I’ve got the right level of detail in there.

#### 13- Don’t be afraid to revise after publishing

Just because you publish a post doesn’t mean it’s set in stone. I’ve found myself tweaking a post days, weeks, or even months after publishing. My goal is to ensure that my posts are clear and accurate. Sometimes I’ll get a comment or question from a reader on a topic that I thought I covered in enough detail in the post. After re-reading the section in question, I may decide that it requires further clarification, in which case I’ll revise the section to add clarity. Don’t be afraid to go in and revise your post to clarify things. I see technical blog posts as living documents.

#### 14- Always include a conclusion

Don’t just end a post. That sucks, and gives your reader no closure. I love closure. 😊

Your conclusion should summarize what you’ve covered in your post. I like including bullet points to capture the main things that I’ve talked about.

#### 15- Provide references

If you used a bunch of resources to research your post, include them. It’s super handy to folks who might be in the same boat. References to include:

*   Blog posts you relied on for your research
*   Links to StackOverflow posts that you encountered as part of your research
*   Cool books or articles to check out on your chosen topic

#### 16- Promote the heck out of it

If you’re on social media, MILK IT, my friend! Post links to your article on [LinkedIn](http://linkedin.com), [Twitter](http://twitter.com), [Facebook](http://Facebook.com), and [Instagram](http://instagram.com) (if applicable). Share with your friends. Ask your tech friends and co-workers to show their support by following you and by liking your posts.

![](https://cdn-images-1.medium.com/max/800/1*rE7bf4Q1aNLSWsNfy6DBIA.png)

Photo by [Adri V](https://adri-v.medium.com)

### Conclusion

Writing a technical how-to blog post doesn’t have to be rocket science. Just stick with the above rules, and you’ll be writing kick-ass blog posts in no time! Key takeaways:

*   Include a descriptive title, and an attention-grabbing opener with an eye-catching pic.
*   Clearly state your objectives, assumptions, and prerequisites.
*   Be nauseatingly detailed (code examples, definitions, screen outputs). Nothing sucks more than a technical post where the author gets lazy partway through. It shows.
*   Edit the heck out of your post, and ask a friend (or more) to review to validate flow and technical accuracy.
*   Break up the wall of text with fun pictures and relevant diagrams.
*   Promote your post on social media so that it gets seen!

So, my friend…you are now ready to write your very own technical post. Go forth and spread tech bloggy goodness!

Now, please enjoy this photo of a yak chillin’ in the mountains.

![](https://cdn-images-1.medium.com/max/800/1*9_NEniikgbX9XkWGpCpkcg.jpeg)

Photo by [Sanjay Hona](https://unsplash.com/@sssanjaya?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/yak?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)

Peace, love, and code.

[![](https://cdn-images-1.medium.com/max/800/1*BCiLLad3dvZLwBa-B5cAVQ.png)](https://faun.to/bP1m5)

Join FAUN: [**Website**](https://faun.to/i9Pt9) 💻**|**[**Podcast**](https://faun.dev/podcast) 🎙️**|**[**Twitter**](https://twitter.com/joinfaun) 🐦**|**[**Facebook**](https://www.facebook.com/faun.dev/) 👥**|**[**Instagram**](https://instagram.com/fauncommunity/) 📷|[**Facebook Group**](https://www.facebook.com/groups/364904580892967/) 🗣️**|**[**Linkedin Group**](https://www.linkedin.com/company/faundev) 💬**|** [**Slack**](https://faun.dev/chat) 📱**|**[**Cloud Native** **News**](https://thechief.io) 📰**|**[**More**](https://linktr.ee/faun.dev/)**.**

**If this post was helpful, please click the clap 👏 button below a few times to show your support for the author 👇**

By [Adriana Villela](https://medium.com/@adri-v) on [November 29, 2021](https://medium.com/p/7e8cde9e354a).

[Canonical link](https://medium.com/@adri-v/16-tips-for-writing-an-awesome-technical-how-to-blog-post-7e8cde9e354a)

Exported from [Medium](https://medium.com) on June 3, 2026.