# import-talks

CLI tool that reads talks from a private Google Sheet and lets you selectively import them into `src/pages/talks.astro`.

## Prerequisites

- Node.js 22+
- A Google Cloud project with the Sheets API enabled (see setup below)

## Setup

### 1. Install dependencies

```bash
cd scripts/import-talks
npm install
```

### 2. Configure your default sheet URL (optional)

Copy `.env.example` to `.env` and fill in your sheet URL:

```bash
cp .env.example .env
```

```env
SHEET_URL=https://docs.google.com/spreadsheets/d/your-sheet-id/edit
```

`.env` is gitignored — it will never be committed. If omitted, the script will prompt you for the URL each time.

### 2. Set up Google OAuth (first-time only)

#### a. Create a Google Cloud project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Give it a name (e.g. `import-talks`) and click **Create**

#### b. Enable the Google Sheets API

1. With your project selected, go to **APIs & Services → Library**
2. Search for **Google Sheets API** and click **Enable**

#### c. Create OAuth credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth 2.0 Client ID**
3. If prompted to configure the consent screen:
   - Choose **External**, click **Create**
   - Fill in App name (anything works, e.g. `import-talks`), user support email, and developer contact email
   - Click **Save and Continue** through the remaining steps
   - Under **Test users**, add your own Google account email, then click **Save**
4. Back on the Credentials page, click **+ Create Credentials → OAuth 2.0 Client ID** again
   - Application type: **Desktop app**
   - Name: anything (e.g. `import-talks`)
   - Click **Create**
5. In the dialog that appears, click **Download JSON**
6. Save the downloaded file as `scripts/import-talks/google-credentials.json`

> `google-credentials.json` is gitignored and will never be committed.

#### d. Authorize on first run

Run the script (see Usage below). It will:

1. Print a Google authorization URL and attempt to open it in your browser
2. Ask you to sign in with your Google account and grant access
3. Redirect to `http://localhost:9001` — the script catches this automatically
4. Save a token to `scripts/import-talks/.oauth-token.json`

After this, the token is reused automatically. You won't need to log in again unless the token expires or is deleted.

---

## Usage

```bash
cd scripts/import-talks
node index.mjs
```

The script will prompt you for:

1. **Google Sheet URL** — paste the full URL or just the spreadsheet ID (defaults to the configured sheet)
2. **Tab** — select which tab contains your talks
3. **Action** — choose to select individual items, import all, or exit

### Options

| Flag | Description |
|------|-------------|
| `-u, --url <url>` | Skip the URL prompt by passing the sheet URL or ID directly |
| `-t, --tab <name>` | Skip the tab prompt by passing the tab name directly |
| `-p, --port <number>` | OAuth callback port (default: `9001`) |
| `--dry-run` | Preview what would be imported without writing any changes |
| `--help` | Show all options |

### Examples

```bash
# Fully interactive
node index.mjs

# Skip the URL prompt
node index.mjs --url "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"

# Skip both URL and tab prompts
node index.mjs --url "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit" --tab "Talks"

# Preview without writing
node index.mjs --dry-run
```

---

## Sheet format

The script expects these column headers (case-insensitive) in the selected tab:

| Column | Description |
|--------|-------------|
| `Date` | Date of the talk (`yyyy-mm-dd`) |
| `Category` | Talk category (e.g. Conference, Podcast) |
| `Medium` | Talk medium (e.g. Talk, Webinar, Interview) |
| `Item` | Title of the talk |
| `Link` | URL — only YouTube links are imported |

Items already present in `talks.astro` (matched by URL) are automatically excluded from the selection list.

---

## Files

```
scripts/import-talks/
  index.mjs                 ← the script (executable)
  package.json
  README.md
  google-credentials.json   ← you provide this (gitignored)
  .oauth-token.json         ← auto-created on first login (gitignored)
  node_modules/             ← gitignored
```
