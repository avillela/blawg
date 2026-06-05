#!/usr/bin/env node
/**
 * import-talks — CLI tool to import talks from Google Sheets into talks.astro
 *
 * One-time setup:
 *   1. Go to https://console.cloud.google.com
 *   2. Create a project → Enable the Google Sheets API
 *   3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
 *      - Application type: Desktop app
 *      - Authorized redirect URI: http://localhost:9001
 *   4. Download the JSON → save as scripts/import-talks/google-credentials.json
 *   5. npm install  (inside scripts/import-talks/)
 *
 * Usage:
 *   node index.mjs                        interactive — prompts for everything
 *   node index.mjs --url <sheet-url>      skip the URL prompt
 *   node index.mjs --url <url> --tab <t>  skip URL + tab prompts
 *   node index.mjs --dry-run              preview without writing to talks.astro
 *   node index.mjs --all                  import all new items without checkbox
 */

import { google } from "googleapis";
import inquirer from "inquirer";
import checkbox from "@inquirer/checkbox";
import { program } from "commander";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import readline from "node:readline";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env if present
try {
	process.loadEnvFile(path.join(__dirname, ".env"));
} catch { /* .env is optional */ }
const TALKS_FILE = path.resolve(__dirname, "../../src/pages/talks.astro");
const CREDS_FILE = path.join(__dirname, "google-credentials.json");
const TOKEN_FILE = path.join(__dirname, ".oauth-token.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

// ---------------------------------------------------------------------------
// CLI

program
	.name("import-talks")
	.description("Import talks from a Google Sheet into talks.astro")
	.option("-u, --url <url>", "Google Sheet URL or spreadsheet ID")
	.option("-t, --tab <name>", "Sheet tab name to read from")
	.option("-p, --port <number>", "OAuth callback port", "9001")
	.option("--dry-run", "Preview items to import without writing any changes")
	.option("--all", "Import all new items without showing the selection prompt")
	.parse();

const opts = program.opts();
const OAUTH_PORT = parseInt(opts.port, 10);

// ---------------------------------------------------------------------------
// OAuth

function loadCredentials() {
	if (!fs.existsSync(CREDS_FILE)) {
		console.error(
			"\n❌  Missing: scripts/import-talks/google-credentials.json\n\n" +
			"    1. Go to https://console.cloud.google.com\n" +
			"    2. APIs & Services → Credentials → Create OAuth 2.0 Client ID\n" +
			"       Application type: Desktop app\n" +
			"       Authorized redirect URI: http://localhost:3000\n" +
			"    3. Download JSON and save it as scripts/import-talks/google-credentials.json\n"
		);
		process.exit(1);
	}
	const raw = JSON.parse(fs.readFileSync(CREDS_FILE, "utf8"));
	return raw.installed ?? raw.web;
}

async function waitForOAuthCode() {
	return new Promise((resolve, reject) => {
		const server = http.createServer((req, res) => {
			try {
				const url = new URL(req.url, `http://localhost:${OAUTH_PORT}`);
				const code = url.searchParams.get("code");
				if (code) {
					res.writeHead(200, { "Content-Type": "text/html" });
					res.end("<h2 style='font-family:sans-serif'>✅ Authorized — you can close this tab.</h2>");
					server.close();
					resolve(code);
				} else {
					res.writeHead(400);
					res.end("Missing code.");
					reject(new Error("OAuth callback received no code"));
				}
			} catch (err) {
				reject(err);
			}
		});
		server.on("error", (err) => {
			if (err.code === "EADDRINUSE") {
				reject(new Error(`Port ${OAUTH_PORT} is already in use. Stop whatever is running on it and try again.`));
			} else {
				reject(err);
			}
		});
		server.listen(OAUTH_PORT);
	});
}

async function getAuthClient() {
	const { client_id, client_secret } = loadCredentials();
	const auth = new google.auth.OAuth2(client_id, client_secret, `http://localhost:${OAUTH_PORT}`);

	if (fs.existsSync(TOKEN_FILE)) {
		auth.setCredentials(JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8")));
		if (auth.credentials.expiry_date && auth.credentials.expiry_date < Date.now()) {
			const { credentials } = await auth.refreshAccessToken();
			auth.setCredentials(credentials);
			fs.writeFileSync(TOKEN_FILE, JSON.stringify(credentials, null, 2));
		}
		return auth;
	}

	const authUrl = auth.generateAuthUrl({ access_type: "offline", scope: SCOPES });
	console.log("\n🔐  Open this URL in your browser to authorize:\n");
	console.log("    " + authUrl + "\n");

	try {
		const { execSync } = await import("node:child_process");
		const open =
			process.platform === "darwin" ? "open" :
			process.platform === "win32" ? "start" : "xdg-open";
		execSync(`${open} "${authUrl}"`, { stdio: "ignore" });
	} catch { /* user opens manually */ }

	console.log(`    Waiting for Google to redirect to http://localhost:${OAUTH_PORT} ...\n`);
	const code = await waitForOAuthCode();
	const { tokens } = await auth.getToken(code);
	auth.setCredentials(tokens);
	fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
	console.log("    ✅  Authorized. Token cached — you won't need to log in again.\n");
	return auth;
}

// ---------------------------------------------------------------------------
// Sheet selection

function parseSheetId(input) {
	const fromUrl = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
	if (fromUrl) return fromUrl[1];
	if (/^[a-zA-Z0-9_-]{20,}$/.test(input.trim())) return input.trim();
	return null;
}

const DEFAULT_SHEET_URL = process.env.SHEET_URL ?? "";

async function resolveSpreadsheet(sheets) {
	let rawInput = opts.url;

	if (!rawInput) {
		const answer = await inquirer.prompt([{
			type: "input",
			name: "input",
			message: "Google Sheet URL or spreadsheet ID:",
			default: DEFAULT_SHEET_URL,
			validate: (v) => parseSheetId(v) !== null || "Could not parse a spreadsheet ID from that — paste the full URL or just the ID.",
		}]);
		rawInput = answer.input;
	}

	const spreadsheetId = parseSheetId(rawInput);
	if (!spreadsheetId) {
		console.error("\n❌  Could not parse a spreadsheet ID from:", rawInput);
		process.exit(1);
	}

	let metadata;
	try {
		metadata = await sheets.spreadsheets.get({ spreadsheetId });
	} catch (err) {
		console.error("\n❌  Could not open that spreadsheet:", err.message);
		console.error("    Make sure it is shared with your Google account.\n");
		process.exit(1);
	}

	const tabs = metadata.data.sheets.map((s) => s.properties.title);

	let tab = opts.tab;
	if (tab && !tabs.includes(tab)) {
		console.error(`\n❌  Tab "${tab}" not found. Available tabs: ${tabs.join(", ")}\n`);
		process.exit(1);
	}

	if (!tab) {
		const answer = await inquirer.prompt([{
			type: "select",
			name: "tab",
			message: "Which tab contains your talks?",
			choices: tabs,
		}]);
		tab = answer.tab;
	}

	return { spreadsheetId, tab };
}

// ---------------------------------------------------------------------------
// Data fetching & column detection

async function fetchRows(auth) {
	const sheets = google.sheets({ version: "v4", auth });
	const { spreadsheetId, tab } = await resolveSpreadsheet(sheets);

	const res = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range: `${tab}!A:Z`,
	});

	const rows = res.data.values ?? [];
	if (rows.length < 2) {
		console.error("\n❌  The selected tab has no data rows.\n");
		process.exit(1);
	}

	const headers = rows[0].map((h) => String(h).toLowerCase().trim());

	const col = {
		date:     headers.indexOf("date"),
		category: headers.indexOf("category"),
		medium:   headers.indexOf("medium"),
		item:     headers.findIndex((h) => ["item", "title", "talk"].includes(h)),
		link:     headers.findIndex((h) => ["link", "url"].includes(h)),
	};

	const missing = Object.entries(col).filter(([, i]) => i === -1).map(([k]) => k);
	if (missing.length) {
		console.error(
			`\n❌  Missing required column(s): ${missing.join(", ")}\n` +
			`    Headers found: ${rows[0].join(", ")}\n`
		);
		process.exit(1);
	}

	return { rows: rows.slice(1), col };
}

// ---------------------------------------------------------------------------
// talks.astro read / write

function getExistingUrls(content) {
	const urls = new Set();
	for (const m of content.matchAll(/url:\s*["']([^"']+)["']/g)) urls.add(m[1]);
	return urls;
}

function parseTalksArray(content) {
	const m = content.match(/const talks = (\[[\s\S]+\]);[\s\n]*---/);
	if (!m) throw new Error('Could not find "const talks = [...]" in talks.astro');
	const ctx = {};
	vm.runInNewContext(`result = ${m[1]}`, ctx);
	return ctx.result;
}

function serializeTalks(talks) {
	const lines = ["["];
	for (const group of talks) {
		lines.push("\t{");
		lines.push(`\t\tyear: ${group.year},`);
		lines.push("\t\tvideos: [");
		for (const v of group.videos) {
			const t = v.title.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
			const u = v.url.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
			lines.push("\t\t\t{");
			lines.push(`\t\t\t\ttitle: "${t}",`);
			lines.push(`\t\t\t\turl: "${u}"`);
			lines.push("\t\t\t},");
		}
		lines.push("\t\t]");
		lines.push("\t},");
	}
	lines.push("]");
	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main

function extractYear(val) {
	const m = String(val ?? "").match(/\d{4}/);
	return m ? parseInt(m[0]) : null;
}

async function main() {
	console.log("\n🎤  Talks importer\n");

	const auth = await getAuthClient();

	console.log("📊  Fetching sheet data...\n");
	const { rows, col } = await fetchRows(auth);

	const content = fs.readFileSync(TALKS_FILE, "utf8");
	const existingUrls = getExistingUrls(content);

	const candidates = rows
		.map((row) => ({
			date:     String(row[col.date] ?? "").trim(),
			year:     extractYear(row[col.date]),
			category: String(row[col.category] ?? "").trim(),
			medium:   String(row[col.medium]   ?? "").trim(),
			title:    String(row[col.item]      ?? "").trim(),
			url:      String(row[col.link]      ?? "").trim(),
		}))
		.filter((r) => r.title && r.url && r.year && !existingUrls.has(r.url) && r.url.includes("youtube.com"))
		.sort((a, b) => {
			const da = new Date(a.date), db = new Date(b.date);
			const validA = !isNaN(da), validB = !isNaN(db);
			if (validA && validB) return db - da;
			return b.year - a.year;
		});

	if (candidates.length === 0) {
		console.log("✅  Nothing new — all sheet items are already in talks.astro.\n");
		return;
	}

	// Top-level action menu
	const { action } = await inquirer.prompt([{
		type: "select",
		name: "action",
		message: `${candidates.length} new item(s) found. What would you like to do?`,
		choices: [
			{ name: "Select items to import", value: "select" },
			{ name: "Import all new items",   value: "all"    },
			{ name: "Exit",                   value: "exit"   },
		],
	}]);

	if (action === "exit") {
		console.log("\n    Exiting — no changes made.\n");
		return;
	}

	let picks;

	if (action === "all") {
		picks = candidates;
	} else {
		// Wire up 'e' as an exit key alongside the built-in hint bar
		readline.emitKeypressEvents(process.stdin);
		let exitViaKey = false;
		const handleExitKey = (str, key) => {
			if (key?.name === "e" && !key.ctrl && !key.meta && !key.shift) {
				exitViaKey = true;
				setImmediate(() => process.stdin.push("\r")); // defer to avoid re-entering readline generator
			}
		};
		if (process.stdin.isTTY) process.stdin.on("keypress", handleExitKey);

		const selected = await checkbox({
			message: "Select talks to import:",
			pageSize: 20,
			theme: {
				style: {
					keysHelpTip: (keys) => [...keys, ["e", "exit"]]
						.map(([key, action]) => `\x1b[1m${key}\x1b[0m \x1b[2m${action}\x1b[0m`)
						.join("\x1b[2m • \x1b[0m"),
				},
			},
			choices: candidates.map((r, i) => ({
				name: `[${r.year}]  ${r.category} › ${r.medium} › ${r.title}`,
				value: i,
			})),
		});

		if (process.stdin.isTTY) process.stdin.removeListener("keypress", handleExitKey);

		if (exitViaKey) {
			console.log("\n    Exiting — no changes made.\n");
			return;
		}
		if (selected.length === 0) {
			console.log("\n    Nothing selected — no changes made.\n");
			return;
		}
		picks = selected.map((i) => candidates[i]);
	}

	if (opts.dryRun) {
		console.log("\n🔍  Dry run — would import:\n");
		for (const p of picks) console.log(`    • [${p.year}] ${p.title}`);
		console.log();
		return;
	}

	const existing = parseTalksArray(content);
	for (const pick of picks) {
		let group = existing.find((g) => g.year === pick.year);
		if (!group) {
			group = { year: pick.year, videos: [] };
			existing.push(group);
		}
		group.videos.unshift({ title: pick.title, url: pick.url });
	}
	existing.sort((a, b) => b.year - a.year);

	const updated = content.replace(
		/(const talks = )\[[\s\S]+\](;[\s\n]*---)/,
		`$1${serializeTalks(existing)}$2`
	);
	fs.writeFileSync(TALKS_FILE, updated, "utf8");

	console.log(`\n✅  Imported ${picks.length} talk(s) into talks.astro:\n`);
	for (const p of picks) console.log(`    • [${p.year}] ${p.title}`);
	console.log();
}

main().catch((err) => {
	console.error("\n❌ ", err.message ?? err);
	process.exit(1);
});
