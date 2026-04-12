---
name: twitter-updates
description: "Scrape X (Twitter) home feed and lists, filter for tech/AI/startup/software content, and produce formatted Obsidian update notes in 01 Updates/. Use when asked to check Twitter, get X feed updates, or summarize what's happening on X/Twitter."
user_invocable: true
---

# Twitter Updates

Scrapes X (Twitter) home feed and curated lists using Playwright with a persistent browser session, filters for tech/AI/startup/software content, and produces formatted Obsidian update notes with inline tweet embeds.

## Requirements

**Vault structure** — the skill expects this folder inside the Obsidian vault:

| Folder | Purpose |
|---|---|
| `01 Updates/` | Where feed update notes land |

**CLI tools:**

| Tool | Purpose | Install |
|---|---|---|
| `node` | Runtime for scraper | `brew install node` |
| `playwright` | Browser automation | Installed in `scripts/node_modules` |

**Browser session** — stored at `~/.x-feed-profile/`. On first run, the user must log into X in a headed browser window. Session persists for weeks/months and is reused for headless runs.

## Configuration

```
VAULT_ROOT     = $VAULT_ROOT        # auto-detected from workspace
UPDATES_DIR    = 01 Updates
SCROLL_COUNT   = 10                 # scrolls per target (env override: SCROLL_COUNT)
HEADLESS       = 1                  # env var: run headless (no GUI needed)
```

### Scrape targets

Defined in `scripts/scrape.js`:

| Target | URL | Output |
|---|---|---|
| Home Feed | `https://x.com/home` | `/tmp/x-feed-raw.json` |
| Builders List | `https://x.com/i/lists/1777861731693519275` | `/tmp/x-builders-raw.json` |

To add more lists, add entries to the `TARGETS` array in `scripts/scrape.js`.

## Trigger

When the user asks to check Twitter/X, get feed updates, see what's trending in tech on X, or run the twitter-updates skill.

## Step 1: Run the scraper

The agent runs the scraper directly in headless mode. A saved browser session at `~/.x-feed-profile/` is required (the user must have logged in at least once before).

### Setup (if Playwright is not installed)

If `playwright` is not found, install it to a temp working directory:

```bash
mkdir -p /tmp/x-scraper
cp <skill_dir>/scripts/scrape.js /tmp/x-scraper/
cd /tmp/x-scraper && npm init -y && npm install playwright
npx playwright install chromium
```

Then run the scraper from `/tmp/x-scraper/` instead of `<skill_dir>/scripts/`.

### Running the scraper

```bash
HEADLESS=1 node <skill_dir>/scripts/scrape.js
```

Or if using the temp install:

```bash
cd /tmp/x-scraper && HEADLESS=1 node scrape.js
```

The script scrapes all configured targets sequentially and outputs JSON files to `/tmp/`.

### First-time login (session not found)

If `~/.x-feed-profile/Default` does not exist, the user has never logged in. In this case, tell the user to run the scraper manually **without** `HEADLESS=1` so the browser window opens for login:

```bash
node <skill_dir>/scripts/scrape.js
```

After they log in and the scrape completes, future runs can be headless.

## Step 2: Read and filter raw data

Read each output JSON file. Each tweet has this structure:

```json
{
  "author": "Display Name\n@handle\n·\ntime_ago",
  "text": "tweet content",
  "time": "ISO datetime",
  "tweetLink": "https://x.com/handle/status/id",
  "metrics": { "replies": "...", "reposts": "...", "likes": "...", "views": "..." },
  "externalLinks": [],
  "hasImage": true,
  "hasVideo": false
}
```

### Filter criteria

**Include** tweets about:
- AI tools, models, launches, and research
- Software engineering practices and tools
- Developer workflows and productivity
- Startups, products, and launches
- Tech industry trends and signals
- Notable takes from builders/engineers generating discussion

**Exclude:**
- Pure politics (unless directly about tech policy)
- Memes, jokes, and shitposts with no substance
- Ads and promoted content (empty `time` field = promoted)
- Crypto/trading unless tied to tech infrastructure
- Personal life, lifestyle, sports, entertainment
- Tweets that are too short to have signal (e.g., "True", "lol", "this")

## Step 3: Categorize filtered tweets

Group tweets into sections. Use whichever sections have content — skip empty ones:

| Section | Emoji | Content |
|---|---|---|
| New Launches & Products | 🚀 | Product launches, new features, tool releases |
| AI Ideas & Insights | 🧠 | AI concepts, research, architecture ideas |
| Trending in Tech | 🔥 | Hot takes with big engagement, debates |
| Workflow Tips & Tools | ⚡ | Actionable tips, dev tools, productivity hacks |
| Industry Signals | 📡 | Hiring trends, market moves, notable people/events |
| Startups & Business | 🏢 | Startup culture, org design, fundraising |

## Step 4: Generate update notes

Create one note per scrape target in `$VAULT_ROOT/$UPDATES_DIR/`.

### Filenames

- Home Feed: `YYYY-MM-DD - X Feed.md`
- Builders List: `YYYY-MM-DD - X Builders List.md`

### Note structure

```markdown
---
created: YYYY-MM-DDT00:00
updated: YYYY-MM-DDT00:00
type: feed-update
source: <target URL>
tweets_scanned: <total count>
tweets_relevant: <filtered count>
unread: true
---

> [!tldr]
> [3-5 sentence overview of key themes and notable items from this batch]

## 🚀 New Launches & Products

### [Descriptive title of what this tweet is about]
![](https://x.com/handle/status/id)

[2-3 sentence AI summary with insight. Add context, connect dots, note why it matters.]

---

### [Next tweet title]
![](https://x.com/handle/status/id)

[Summary and insight]

## 🧠 AI Ideas & Insights

[... same pattern ...]

---

*Scraped from <target name> · <date> · X tweets scanned, Y relevant*
```

### Formatting rules

1. **No `# Title` heading** — Obsidian shows filename as title
2. **`> [!tldr]`** for the overview callout
3. **Tweet embeds** — use `![](tweet_url)` for inline tweet previews (native Obsidian feature since v1.3.2)
4. **No @handle attribution lines** — the tweet embed shows the author
5. **No blockquote of tweet text** — the tweet embed shows the content
6. **Each entry has only**: a `### title`, the `![](url)` embed, and an AI-written summary paragraph
7. **Horizontal rules** (`---`) between entries within a section
8. **Skip empty sections** — only include sections that have tweets
9. **Footer** with scrape metadata

### Summary writing guidelines

- Focus on **why it matters**, not restating what the tweet says
- Connect dots between related tweets (e.g., "Related to Harrison Chase's post below")
- Add context the tweet doesn't provide (who the person is, what their company does)
- Flag actionable items with 📌 (e.g., "📌 Worth watching")
- Note engagement levels when they signal something (e.g., "280 replies signal real debate")
- Keep summaries to 1-3 sentences — dense, not fluffy

## Key rules

1. **Always run the scraper first** — never generate updates from stale data
2. **Agent runs the scraper headless** — using `HEADLESS=1`. Only ask the user to run manually for first-time login
3. **Install Playwright if missing** — use `/tmp/x-scraper/` as a temp working directory
4. **Filter aggressively** — only tech/AI/startup/software content passes
5. **Tweet embeds only** — no redundant @handle lines or blockquoted tweet text
6. **One note per target** — separate files for feed vs. lists
7. **Date-prefixed filenames** — `YYYY-MM-DD - X <Target>.md` for chronological sorting
8. **Set `unread: true`** on every note created
