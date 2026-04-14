---
name: acquire-curate
description: "Scrape Acquire.com listings matching buyer criteria, AI-curate the top 20 startups for sale, deep-dive each one, and produce a ranked Obsidian report in 01 Updates/Acquire/. Use when asked to check Acquire, find startups to buy, or run the acquire-curate skill."
user_invocable: true
---

# Acquire Curate

Scrapes Acquire.com listings using Playwright with a persistent browser session, applies buyer criteria to filter and rank startups, deep-dives the top candidates, and produces a formatted Obsidian acquisition report.

## Requirements

**Vault structure:**

| Folder | Purpose |
|---|---|
| `01 Updates/Acquire/` | Where acquisition reports land |

**CLI tools:**

| Tool | Purpose | Install |
|---|---|---|
| `node` | Runtime for scraper | `brew install node` |
| `playwright` | Browser automation | Installed in `/tmp/acquire-scraper/node_modules` |

**Browser session** — stored at `~/.acquire-profile/`. On first run, the user must log into Acquire.com in a headed browser window. Session persists and is reused for headless runs.

## Paths

All paths used by this skill:

```
SKILL_DIR      = ~/.claude/skills/acquire-curate
SCRIPTS_DIR    = $SKILL_DIR/scripts
CRITERIA_FILE  = $SKILL_DIR/criteria.json
WORK_DIR       = /tmp/acquire-scraper          # where scripts run (has node_modules)
PROFILE_DIR    = ~/.acquire-profile            # persistent browser session
```

**Important:** Scripts must always run from `$WORK_DIR` (`/tmp/acquire-scraper/`) because that's where Playwright's `node_modules` are installed. Copy fresh scripts there before each run.

## Configuration

```
VAULT_ROOT     = $VAULT_ROOT        # see Step 0c for detection
UPDATES_DIR    = 01 Updates/Acquire
SCROLL_COUNT   = 20                 # scrolls on criteria page (env override: SCROLL_COUNT)
HEADED         = 0                  # set to 1 only for first-time login (headless by default)
```

### Buyer criteria

All buyer criteria are defined in **`criteria.json`** (at `$SKILL_DIR/criteria.json`). This is the **single source of truth** — the `set-criteria.js` script reads it directly and pushes the values to Acquire.com on every run.

To change criteria, edit `criteria.json` directly. The fields are:

| Field | Description | Example |
|---|---|---|
| `startupTypes` | Array of types to select | `["SaaS", "Ecommerce", "AI"]` |
| `askingPriceMin/Max` | Asking price range | `"0"` / `"10000"` |
| `revenueMultipleMin/Max` | Revenue multiple slider (0-20) | `"1"` / `"7"` |
| `profitMultipleMin/Max` | Profit multiple slider (0-20) | `"1"` / `"5"` |
| `ttmRevenueMin/Max` | TTM gross revenue range | `"1"` / `"1000000"` |
| `ttmProfitMin/Max` | TTM net profit range | `"1"` / `"200000"` |
| `interests` | Array of interest tags to set | `["TypeScript", "Python", ...]` |
| `highlights` | Array of highlight filters | `[]` (none) |
| `arrMin/Max` | Annual recurring revenue range | `""` (no filter) |
| `growthRateMin/Max` | Annual growth rate range | `""` (no filter) |
| `startupAgeMin/Max` | Startup age slider (0-9) | `"0"` / `"9"` |
| `numberOfCustomers` | Array of customer count checkboxes | `["All"]` |
| `criteriaMode` | Flexible or Strict matching | `"Flexible"` |

**Note:** `countries` is stored in `criteria.json` but is **not currently synced** to Acquire.com by the script. Country filtering must be set manually on the site.

### Personal preferences (for AI curation)

The goal of Rung 1 is **learning, not income**. Prioritize stable,
understandable, boring businesses over hot/trendy ones. The first
acquisition is tuition — it should teach operations without betting
the savings.

When narrowing from ~100 listings to the top 20, prioritize in this order:

1. **Profit multiple under 4x** — market median is ~3.9x. Above this
   is overpriced; well below this is either a steal or a lemon.
2. **Positive growth rate** — flat (0–10%) is acceptable for Rung 1;
   declining is disqualifying regardless of price.
3. **Low churn (<5% monthly)** — single best predictor of a durable
   business. >10% is a hard red flag.
4. **Real customer base (25+ paying customers)** — PMF signal. Avoid
   businesses with a handful of whale customers (concentration risk).
5. **Understandable niche** — if you can't explain in one sentence who
   pays for this and why, skip it. You need to credibly market it.
6. **Tech stack you can maintain solo** — TypeScript, Node.js, Python,
   PostgreSQL. Avoid unfamiliar stacks, heavy infra, or exotic runtimes.
7. **Low owner-dependence** — documented processes, automated billing,
   no "founder is the product" situations.
8. **Bootstrapped** — no investor cap table complications.
9. **B2B over B2C** — B2B churn is lower, prices are higher,
   support volume is lower, customers are more rational.
10. **Boring > trendy** — a dull accounting tool with 3 years of
    flat revenue beats a hot AI wrapper with 6 months of hockey stick.

**Hard disqualifiers** (cut even if everything else looks good):
- Declining revenue (negative growth)
- Churn >10% monthly
- <12 months of operating history
- Single-customer concentration >30% of revenue
- Requires regulated domain expertise (healthcare, legal, financial advice)
- Crypto-native, dropshipping, MLM-adjacent, or adult
- "AI" as the only differentiator with no moat
- Founder is the primary sales channel (personal brand dependency)

## Trigger

When the user asks to check Acquire.com, find startups to buy, see what's available, or run the acquire-curate skill.

## Step 0: Bootstrap check

### 0a. Check Playwright installation and copy scripts

```bash
SKILL_DIR="$HOME/.claude/skills/acquire-curate"

# Check if Playwright is installed in the work directory
if [ ! -d /tmp/acquire-scraper/node_modules/playwright ]; then
  echo "MISSING: playwright — installing..."
  mkdir -p /tmp/acquire-scraper
  cd /tmp/acquire-scraper && npm init -y && npm install playwright
  npx playwright install chromium
fi

# Always copy fresh scripts from skill dir
cp "$SKILL_DIR/scripts/scrape.js" /tmp/acquire-scraper/scrape.js
cp "$SKILL_DIR/scripts/set-criteria.js" /tmp/acquire-scraper/set-criteria.js
```

### 0b. Check browser session

```bash
[ -d ~/.acquire-profile/Default ] && echo "Session exists" || echo "MISSING: session"
```

If session is missing, **do NOT run the scraper yourself.** Tell the user to run this in their terminal:
```bash
cd /tmp/acquire-scraper && HEADED=1 node scrape.js listings
```
The browser will open for login. After they log in and the scrape completes, future runs are headless. **Stop and wait** for the user to confirm login is done before proceeding.

### 0c. Resolve vault root

```bash
vault=""
if [ -n "$VAULT_ROOT" ]; then
  vault="$VAULT_ROOT"
else
  dir="$PWD"
  while [ "$dir" != "/" ]; do
    if [ -d "$dir/.obsidian" ]; then vault="$dir"; break; fi
    dir="$(dirname "$dir")"
  done
fi
echo "Vault: ${vault:-NOT FOUND}"
```

If no vault is found, ask the user: **"What's the absolute path to your Obsidian vault?"**

Create the output directory if it doesn't exist:
```bash
mkdir -p "$VAULT_ROOT/01 Updates/Acquire"
```

## Step 1: Sync criteria to Acquire.com

Push the criteria from `criteria.json` to Acquire.com before scraping. The script reads `criteria.json` directly from `$SKILL_DIR` (hardcoded path `~/.claude/skills/acquire-curate/criteria.json`).

```bash
cd /tmp/acquire-scraper && node set-criteria.js
```

The script will:
1. Open the criteria panel on `app.acquire.com/criteria`
2. Set startup types (toggling selected/deselected to match)
3. Set text inputs (asking price, TTM revenue, TTM profit, ARR, growth rate)
4. Set sliders (revenue/profit multiples, startup age)
5. Set interests (add missing, remove extra via autocomplete)
6. Set number of customers checkboxes
7. Set highlights and criteria mode (Flexible/Strict)
8. Click Save

**Verification:** Check the script output for `✅ Saved!`. If you see `⚠️ Save: disabled` or `⚠️ Save: no panel`, the criteria sync failed — likely due to an expired session. Tell the user to re-login with `HEADED=1`.

To **read** current criteria without changing anything:
```bash
cd /tmp/acquire-scraper && node set-criteria.js --read
```

## Step 2: Scrape listings

```bash
cd /tmp/acquire-scraper && node scrape.js listings
```

This produces `/tmp/acquire-listings.json` — all listing cards with: type, title, TTM revenue, TTM profit, asking price, link.

**Verification:** Check the output file exists and has listings:
```bash
python3 -c "import json; d=json.load(open('/tmp/acquire-listings.json')); print(f'{len(d)} listings')"
```

If 0 listings, the session is likely expired. Tell the user to re-login.

## Step 3: AI filter — narrow to top ~100

Read `/tmp/acquire-listings.json`. Each listing has these fields:
```json
{
  "type": "SaaS",
  "title": "AI-driven test automation tool...",
  "ttmRevenue": "5k",
  "ttmProfit": "3k",
  "askingPrice": "10k",
  "link": "https://app.acquire.com/startup/...",
  "rawText": "..."
}
```

### Numeric parsing

Revenue, profit, and price are strings like `"5k"`, `"14k"`, `"29k"`. Parse `k` as `× 1000`. If a value is empty or unparseable, exclude the listing.

### Hard filters

* Must have non-empty `askingPrice`
* Must have `ttmRevenue` ≥ $12,000 (parseable as ≥12k)
* Must have `ttmProfit` ≥ $6,000
* Profit margin (ttmProfit / ttmRevenue) must be ≥ 20%

### Sort/rank by

1. Profit-to-price ratio (higher = better, i.e. lower profit multiple)
2. Profit margin (higher = better)
3. Absolute profit (higher = better, more room to absorb setbacks)

Keep the top 100. If fewer than 100 pass hard filters, keep all that pass.

## Step 4: AI curate — select top 20

From the ~100 filtered listings, apply the **Personal preferences** from the Configuration section. Use the listing title, type, revenue, profit, and price to make judgments about:

- Does the title suggest real product-market fit?
- Is the multiple reasonable?
- Does it sound like something a solo technical operator could run?
- Is there an AI, SaaS, or automation angle?
- Does it avoid red flags? (vague descriptions, zero-effort businesses, ethically dubious products)

**Note:** At this stage you only have card-level data (title, revenue, profit, price, type). You do NOT have churn, team size, tech stack, or other detail-page fields yet. Use title and basic metrics to make your best judgment — the deep-dive in Step 5 will provide full data for final ranking.

Select the **top 20** candidates and write their URLs to a file:

```bash
# Write one URL per line to /tmp/acquire-detail-urls.txt
```

## Step 5: Deep-dive — scrape detail pages

```bash
cd /tmp/acquire-scraper && node scrape.js details /tmp/acquire-detail-urls.txt
```

This produces `/tmp/acquire-details.json` with rich data per listing:

| Field | Description |
|---|---|
| `askingPrice` | Listed asking price |
| `multiples` | Revenue and profit multiples |
| `annualGrowthRate` | Year-over-year growth |
| `ttmRevenue` | Trailing twelve months revenue |
| `ttmProfit` | Trailing twelve months profit |
| `lastMonthRevenue` | Most recent month revenue |
| `lastMonthProfit` | Most recent month profit |
| `customers` | Customer count range |
| `arr` | Annual recurring revenue |
| `churnRate` | Customer churn rate |
| `dateFounded` | When the company started |
| `teamSize` | Current team size |
| `businessModel` | B2B, B2C, DTC, etc. |
| `techStack` | Technologies used |
| `competitors` | Named competitors |
| `growthOpportunities` | Seller-identified growth levers |
| `keyAssets` | What's included in the sale |
| `sellingReasoning` | Why the seller is selling |
| `financing` | Bootstrapped vs funded |
| `buyersViewed` | Number of buyers who viewed |
| `description` | Full listing description |
| `askingPriceReasoning` | Seller's justification for the price |

**Verification:** Check for failed scrapes — entries with an `error` field instead of data. If more than 3 failed, consider re-running the detail scraper. If a detail page failed, exclude it from ranking rather than guessing its data.

## Step 6: Final ranking and report generation

Read `/tmp/acquire-details.json`. For each successfully scraped listing, score on:

| Factor | Weight | Scoring |
|---|---|---|
| Profit multiple | 20% | Lower = better. <3x = excellent, 3-4x = good, >4x = mediocre |
| Growth rate | 15% | >30% = excellent, 10-30% = good, 0-10% = ok, <0% = disqualify |
| Churn rate | 15% | <3% = excellent, 3-5% = good, 5-10% = concerning, >10% = disqualify |
| Profit margin | 10% | TTM profit / TTM revenue. >60% = excellent, 40-60% = good |
| Customer count | 10% | 100+ = excellent, 25-100 = good, <25 = weak PMF |
| Owner-dependence | 10% | Documented processes, automation, "founder not required" = excellent |
| Revenue multiple | 5% | Lower = better. Secondary to profit multiple |
| Tech stack match | 5% | TypeScript/Node/Python/Postgres overlap |
| Niche clarity | 5% | Can you explain who pays and why in one sentence? |
| Solo-operator fit | 5% | Team size, operational complexity |

Rank all successfully scraped listings and produce the final report. If some detail pages failed, note how many were excluded.

## Step 7: Generate Obsidian report

Create the report at `$VAULT_ROOT/01 Updates/Acquire/YYYY-MM-DD Acquire Report.md`.

If a file with the same name already exists (re-run on the same day), **overwrite it**.

### Note structure

```markdown
---
created: YYYY-MM-DDT00:00
updated: YYYY-MM-DDT00:00
type: acquire-report
source: https://app.acquire.com/criteria
listings_scanned: <total from Step 2>
listings_filtered: <count from Step 3>
listings_deep_dived: <count from Step 5>
unread: true
---

> [!tldr]
> [3-5 sentence overview: how many listings scanned, key themes, top picks summary, notable trends in the market this run]

## 🏆 Top 5 Picks

### 1. [Listing Title]
🔗 [View on Acquire](listing_url)

| Metric | Value |
|---|---|
| Asking Price | $X |
| TTM Revenue | $X |
| TTM Profit | $X |
| Multiples | Xx revenue / Xx profit |
| MRR (last month) | $X |
| Growth Rate | X% |
| Customers | X |
| Churn | X% |
| Team | X |
| Tech Stack | X, Y, Z |
| Founded | Month Year |

**What it does:** [1-2 sentence description]

**Why it's interesting:** [2-3 sentences on PMF signals, growth potential, operator fit]

**Risks:** [1-2 sentences on concerns — churn, competition, ethical issues, complexity]

**Verdict:** 📌 [Strong buy / Worth exploring / Proceed with caution]

---

### 2. [Next listing...]

[... same format ...]

## 📊 Runners Up (6-20)

### 6. [Title] — $Xk asking · $Xk TTM revenue · Xx multiple
🔗 [View](url)
[2-3 sentence summary: what it is, why it made the list, key concern]

---

[... same compact format for 7-20 ...]

## 📈 Market Snapshot

- **Listings matching criteria:** X
- **Median asking price:** $X
- **Median TTM revenue:** $X
- **Median revenue multiple:** Xx
- **Most common types:** SaaS (X%), Ecommerce (X%), AI (X%)
- **Notable trends:** [1-2 observations — only compare to previous report if one exists in the folder, otherwise say "First run — no prior data to compare"]

---

*Scraped from Acquire.com · YYYY-MM-DD · X listings scanned, Y filtered, Z deep-dived*
```

### Formatting rules

1. **No `# Title` heading** — Obsidian shows filename as title
2. **`> [!tldr]`** for the overview callout
3. **Metric tables** for the top 5 — full data at a glance
4. **Compact format** for runners up (6-20) — one-line summary each
5. **Market snapshot** section for trend tracking across runs
6. **`---` dividers** between entries
7. **Set `unread: true`** on every note created
8. **Verdict emojis**: 📌 Strong buy, 🔍 Worth exploring, ⚠️ Proceed with caution

## Key rules

1. **Sync criteria first, then scrape** — always run `set-criteria.js` before `scrape.js` to ensure Acquire.com matches `criteria.json`
2. **Scraper is headless by default** — only tell user to run with `HEADED=1` for first-time login or expired session
3. **Install Playwright if missing** — use `/tmp/acquire-scraper/` as working directory
4. **Always copy fresh scripts** — copy from `~/.claude/skills/acquire-curate/scripts/` to `/tmp/acquire-scraper/` before each run
5. **Three-phase filtering** — 300+ → ~100 (hard filters) → 20 (AI curation) → ranked report
6. **Deep-dive only the top 20** — clicking into each page is expensive; don't do it for all 300+
7. **Score objectively** — use the weighted scoring table, don't just vibes-rank
8. **Date-prefixed filenames** — `YYYY-MM-DD Acquire Report.md` for chronological sorting
9. **Set `unread: true`** on every note created
10. **Verify outputs** — check listing count > 0 after scraping, check for `error` entries in detail JSON
11. **Handle failures gracefully** — if detail pages fail, exclude them from ranking and note the exclusion; do not fabricate data
12. **Compare with previous reports** — only if a prior report exists in `01 Updates/Acquire/`; otherwise skip trend commentary
13. **All scripts run from `/tmp/acquire-scraper/`** — never run from the skill directory (Playwright won't be found)
