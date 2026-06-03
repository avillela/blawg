#!/usr/bin/env node
/**
 * Cleanup script for imported Medium posts.
 * 1. Deletes posts that are clearly Medium comments/responses (not real articles).
 * 2. Renames remaining files to clean slugs (collapse multiple dashes, strip trailing dashes).
 * 3. Updates the `slug` field in each file's frontmatter to match the new filename.
 *
 * Usage: node scripts/cleanup-posts.mjs [--dry-run]
 */

import fs from "fs";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const POSTS_DIR = path.resolve("./posts");

// ---------------------------------------------------------------------------
// Comment detection — titles that are clearly conversational responses
// ---------------------------------------------------------------------------
const COMMENT_TITLE_PREFIXES = [
	"absolutely",
	"a better way to run nomad locally",
	"actually,",
	"fair points",
	"good catch",
	"good to know",
	"great read",
	"hey paulo",
	"hey william",
	"hey! thanks for reading",
	"hey! you can dm me",
	"hi garg",
	"hi sathyajith",
	"i believe that you should be able to",
	"i can't say i've ever experienced",
	"i didn't say ignore logs",
	"i did try the management route",
	"if you'd read the entire post",
	"i haven't had any experience using their product",
	"i have to admit that the terminology",
	"i'm honestly so blown away",
	"in the ansible gcp modules",
	"it depends",
	"it's an older post",
	"it's comforting to know",
	"it's funny you should mention",
	"i worked at a non-observability company",
	"many companies are moving to otel",
	"obrigada",
	"ooh, glad you enjoyed",
	"oooh, definitely an interesting comparison",
	"ps: loved your o11ycast",
	"spot on",
	"super glad to hear",
	"technically increasing the count",
	"thank you for sharing",
	"thank you for your feedback",
	"thank you for your kind words",
	"thank you garg",
	"thank you! i'm glad",
	"thank you so much",
	"thanks for saving me",
	"thanks for sharing",
	"thanks for the shout-out",
	"that's a great question",
	"that's something you do yourself",
	"the behaviour you're seeing is expected",
	"the only reason why i don't consider tf",
	"the pleasure is mine",
	"vcluster on nomad is on my list",
	"very glad to hear",
	"well, observability puts more",
	"yeah, you're totally right",
	"yay! happy to help",
	"yes, i think they are",
	"yes, observability-landscape-as-code is a thing", // keep — this is a real article
	"yes, you're totally right re:",
	"you're welcome",
];

// Exact titles that ARE real posts despite looking conversational (normalized, no apostrophes)
const KEEP_TITLES = new Set([
	"yes, observability-landscape-as-code is a thing",
]);

function normalize(str) {
	return str
		.toLowerCase()
		// Remove all apostrophe/single-quote variants (including curly quotes from Medium)
		.replace(/[‘’ʼ']/g, "")
		// Normalize double-quote variants
		.replace(/[“”]/g, '"')
		.trim();
}

function isComment(title) {
	const norm = normalize(title);
	if (KEEP_TITLES.has(norm)) return false;
	return COMMENT_TITLE_PREFIXES.some((prefix) => norm.startsWith(normalize(prefix)));
}

// ---------------------------------------------------------------------------
// Slug cleaning
// ---------------------------------------------------------------------------
function cleanSlug(raw) {
	return raw
		.replace(/-{2,}/g, "-")   // collapse multiple dashes
		.replace(/^-+|-+$/g, ""); // strip leading/trailing dashes
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

const toDelete = [];
const toRename = [];

for (const file of files) {
	const filePath = path.join(POSTS_DIR, file);
	const content = fs.readFileSync(filePath, "utf8");

	// Extract title from frontmatter
	const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
	const title = titleMatch ? titleMatch[1].replace(/\\"/g, '"') : "";

	if (isComment(title)) {
		toDelete.push({ file, title });
		continue;
	}

	// Clean up slug
	const baseName = path.basename(file, ".md");
	const cleanedSlug = cleanSlug(baseName);
	if (cleanedSlug !== baseName) {
		toRename.push({ file, oldSlug: baseName, newSlug: cleanedSlug, title });
	}
}

console.log(`\n=== DELETING ${toDelete.length} comment posts ===`);
for (const { file, title } of toDelete) {
	console.log(`  delete: ${file}`);
	console.log(`          "${title}"`);
	if (!DRY_RUN) fs.unlinkSync(path.join(POSTS_DIR, file));
}

console.log(`\n=== RENAMING ${toRename.length} posts (slug cleanup) ===`);
for (const { file, oldSlug, newSlug, title } of toRename) {
	console.log(`  ${oldSlug}`);
	console.log(`  → ${newSlug}`);
	console.log(`    "${title}"`);

	if (!DRY_RUN) {
		const oldPath = path.join(POSTS_DIR, file);
		const newPath = path.join(POSTS_DIR, `${newSlug}.md`);
		let content = fs.readFileSync(oldPath, "utf8");

		// Update slug field in frontmatter
		content = content.replace(
			/^slug:\s*.+$/m,
			`slug: ${newSlug}`
		);

		fs.writeFileSync(newPath, content, "utf8");
		fs.unlinkSync(oldPath);
	}
}

if (DRY_RUN) {
	console.log("\n[dry-run] No files were changed. Remove --dry-run to apply.");
} else {
	console.log(`\nDone. ${toDelete.length} deleted, ${toRename.length} renamed.`);
}
