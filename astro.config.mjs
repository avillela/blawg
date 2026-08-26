import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// https://astro.build/config
export default defineConfig({
	site: "https://adrianavillela.netlify.app/",
	base: "/",
	integrations: [sitemap()],
	markdown: {
		shikiConfig: {
			theme: "material-theme-darker",
			langs: [],
		},
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					test: ["h2", "h3", "h4"],
					behavior: "append",
					properties: { className: ["heading-anchor"], ariaLabel: "Link to this section" },
					content: { type: "text", value: " #" },
				},
			],
		],
	},
});
