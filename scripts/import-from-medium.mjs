#!/usr/bin/env node
/**
 * Converts a Medium export ZIP (or extracted folder) into Markdown posts
 * compatible with this Astro/TinaCMS blog.
 *
 * Usage:
 *   node scripts/import-from-medium.mjs <path-to-medium-export.zip>
 *   node scripts/import-from-medium.mjs <path-to-extracted-medium-folder>
 *
 * The script reads HTML files from the Medium export's "posts/" subdirectory,
 * converts each to Markdown, and writes .md files into ./posts/ with the
 * required frontmatter (title, slug, description, added, tags).
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
	const input = process.argv[2];
	if (!input) {
		console.error("Usage: node scripts/import-from-medium.mjs <medium-export.zip|folder>");
		process.exit(1);
	}

	// Install deps if needed
	for (const dep of ["cheerio", "turndown"]) {
		try {
			await import(dep);
		} catch {
			console.log(`Installing ${dep}…`);
			execSync(`npm install --no-save ${dep}`, { stdio: "inherit" });
		}
	}

	const { load } = await import("cheerio");
	const TurndownService = (await import("turndown")).default;

	const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

	// Keep <figure> content as a block
	turndown.addRule("figure", {
		filter: "figure",
		replacement(content) {
			return `\n\n${content}\n\n`;
		},
	});

	// Resolve input — if ZIP, extract to a temp dir
	let extractedDir = input;
	if (input.endsWith(".zip")) {
		extractedDir = input.replace(/\.zip$/, "_extracted");
		if (!fs.existsSync(extractedDir)) {
			console.log("Extracting ZIP…");
			execSync(`unzip -q "${input}" -d "${extractedDir}"`);
		}
	}

	// Medium puts HTML posts inside a "posts/" subdirectory of the export
	const postsDir = fs.existsSync(path.join(extractedDir, "posts"))
		? path.join(extractedDir, "posts")
		: extractedDir;

	const htmlFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".html"));
	if (!htmlFiles.length) {
		console.error(`No HTML files found in ${postsDir}`);
		process.exit(1);
	}

	const outDir = path.resolve("./posts");
	fs.mkdirSync(outDir, { recursive: true });

	let converted = 0;
	let skipped = 0;

	for (const file of htmlFiles) {
		// Skip actual drafts by filename prefix
		if (file.startsWith("draft_")) {
			console.log(`  skip (draft): ${file}`);
			skipped++;
			continue;
		}

		const html = fs.readFileSync(path.join(postsDir, file), "utf8");
		const $ = load(html);

		// --- Extract metadata ---
		// Medium export uses h1.p-name for the page title, h3.graf--title inside article
		const title =
			$("h1.p-name").first().text().trim() ||
			$(".graf--title").first().text().trim() ||
			$("title").text().replace(/ – Medium$| - Medium$/, "").trim() ||
			path.basename(file, ".html");

		// Published date — Medium export uses <time class="dt-published" datetime="...">
		const dateRaw =
			$("time.dt-published").attr("datetime") ||
			$("time").first().attr("datetime") ||
			new Date().toISOString();
		const published = new Date(dateRaw);
		const added = published.toLocaleDateString("en-US", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		}); // e.g. "Jan 01 2024"

		// Tags — Medium export puts them in .postList as <li> items
		const tags = [];
		$(".postList li, ul.tags li, a.tags__link").each((_, el) => {
			const tag = $(el).text().trim().toLowerCase();
			if (tag) tags.push(tag);
		});
		if (!tags.length) tags.push("imported");

		// Slug — derive from filename (Medium uses date-prefixed slugs like 2024-01-01_my-post-abc123.html)
		const slug = path
			.basename(file, ".html")
			.replace(/^\d{4}-\d{2}-\d{2}_/, "") // strip date prefix
			.replace(/_/g, "-")
			.toLowerCase()
			.replace(/-[a-f0-9]{8,}$/, ""); // strip trailing Medium hash

		// Subtitle / description — Medium export uses section[data-field="subtitle"].p-summary
		const description =
			$('section[data-field="subtitle"]').first().text().trim() ||
			$(".p-summary").first().text().trim() ||
			$("p").first().text().trim().slice(0, 160) ||
			"";

		// --- Extract body ---
		// Remove the title and subtitle elements so they don't duplicate in the body
		$(".graf--title, section[data-field=\"subtitle\"], .postMetaInline, .section-divider").remove();

		const articleHtml =
			$("article, .section-content, .e-content").html() || $("body").html() || "";
		let markdown = turndown.turndown(articleHtml);

		// Clean up excessive blank lines
		markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();

		// --- Build frontmatter ---
		const tagsYaml = tags.map((t) => `  - ${t}`).join("\n");
		const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
slug: ${slug}
description: "${description.replace(/"/g, '\\"').slice(0, 300)}"
added: "${added}"
tags:
${tagsYaml}
---

`;

		const outFile = path.join(outDir, `${slug}.md`);
		if (fs.existsSync(outFile)) {
			console.log(`  skip (exists): ${slug}.md`);
			skipped++;
			continue;
		}

		fs.writeFileSync(outFile, frontmatter + markdown, "utf8");
		console.log(`  ✓ ${slug}.md`);
		converted++;
	}

	console.log(`\nDone. ${converted} posts converted, ${skipped} skipped.`);
	console.log(`Posts written to: ${outDir}`);
	console.log("\nNext steps:");
	console.log("  1. Review the generated .md files — check frontmatter and formatting.");
	console.log("  2. Run `npm run dev` to preview the blog.");
	console.log("  3. Fix any posts with missing descriptions or wrong tags.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
