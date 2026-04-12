const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PROFILE_DIR = path.join(process.env.HOME, ".acquire-profile");
const HEADED = process.env.HEADED === "1" || process.env.HEADED === "true";
const HEADLESS = !HEADED;
const SCROLL_COUNT = parseInt(process.env.SCROLL_COUNT || "20", 10);
const SCROLL_DELAY = 2000;

const CRITERIA_OUTPUT = "/tmp/acquire-criteria.json";
const LISTINGS_OUTPUT = "/tmp/acquire-listings.json";
const DETAILS_OUTPUT = "/tmp/acquire-details.json";

async function scrapeCriteria(page) {
  console.log("\n📋 Loading criteria page...");
  await page.goto("https://app.acquire.com/criteria", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(4000);

  // Click the Criteria button to open the panel
  try {
    const criteriaBtn = await page.$('button:has-text("Criteria")');
    if (criteriaBtn) {
      await criteriaBtn.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log("ℹ️  No criteria button found, reading page directly");
  }

  const criteria = await page.evaluate(() => {
    const body = document.body.innerText;
    return { body };
  });

  fs.writeFileSync(CRITERIA_OUTPUT, JSON.stringify(criteria, null, 2));
  console.log(`✅ Criteria → ${CRITERIA_OUTPUT}`);
}

async function scrapeListings(page) {
  console.log("\n🔍 Loading listings from criteria page...");
  await page.goto("https://app.acquire.com/criteria", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(4000);

  // Close criteria panel if open so listings are visible
  try {
    const cancelBtn = await page.$('button:has-text("Cancel")');
    if (cancelBtn) {
      await cancelBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  const listings = [];

  for (let i = 0; i < SCROLL_COUNT; i++) {
    const newListings = await page.evaluate(() => {
      const cards = document.querySelectorAll('a[href*="/startup/"]');

      return Array.from(cards).map((card) => {
        const link = card.href || "";
        const text = card.innerText || "";

        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

        const revenueMatch = text.match(/TTM REVENUE\s*\n?\s*\$?([\d,k]+)/i);
        const profitMatch = text.match(/TTM PROFIT\s*\n?\s*\$?([\d,k]+)/i);
        const priceMatch = text.match(/ASKING PRICE\s*\n?\s*\$?([\d,k]+)/i);

        let type = "";
        let title = "";
        const typeKeywords = [
          "SaaS", "Ecommerce", "AI", "Marketplace", "Mobile app",
          "Shopify app", "Content", "Agency", "Crypto", "Digital",
          "Newsletter", "Other",
        ];

        for (const line of lines) {
          if (typeKeywords.includes(line)) {
            type = line;
          } else if (
            line.length > 20 &&
            !line.includes("TTM") &&
            !line.includes("ASKING") &&
            !line.includes("Add to") &&
            !line.includes("Create list") &&
            !line.includes("Save")
          ) {
            if (!title) title = line;
          }
        }

        return {
          type,
          title,
          ttmRevenue: revenueMatch ? revenueMatch[1] : "",
          ttmProfit: profitMatch ? profitMatch[1] : "",
          askingPrice: priceMatch ? priceMatch[1] : "",
          link,
          rawText: text.substring(0, 500),
        };
      });
    });

    for (const l of newListings) {
      if (l.title && !listings.some((existing) => existing.link === l.link)) {
        listings.push(l);
      }
    }

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(SCROLL_DELAY);
    console.log(
      `📜 Scroll ${i + 1}/${SCROLL_COUNT} — ${listings.length} unique listings`
    );
  }

  fs.writeFileSync(LISTINGS_OUTPUT, JSON.stringify(listings, null, 2));
  console.log(`✅ ${listings.length} listings → ${LISTINGS_OUTPUT}`);
}

async function scrapeDetails(page, urls) {
  console.log(`\n🔎 Scraping ${urls.length} listing detail pages...`);
  const details = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`  📄 [${i + 1}/${urls.length}] ${url}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3000);

      // Click "See more" buttons to expand full descriptions
      try {
        const seeMoreButtons = await page.$$('button:has-text("See more")');
        for (const btn of seeMoreButtons) {
          await btn.click();
          await page.waitForTimeout(500);
        }
      } catch (e) {}

      const detail = await page.evaluate((pageUrl) => {
        const body = document.body.innerText;

        // Parse key metrics from the full text
        const data = { url: pageUrl, rawText: body.substring(0, 8000) };

        // Extract structured fields via regex on the full text
        const patterns = {
          askingPrice: /ASKING PRICE\s*\n?\s*\$([\d,k]+)/i,
          multiples: /MULTIPLES\s*\n?\s*([\d.]+x profit[\s\S]*?revenue)/i,
          annualGrowthRate: /ANNUAL GROWTH RATE\s*\n?\s*([\d.%+-]+)/i,
          ttmRevenue: /TTM REVENUE\s*\n?\s*\$([\d,k]+)/i,
          ttmProfit: /(?:TTM )?PROFIT\s*\n?\s*\$([\d,k]+)/i,
          lastMonthRevenue: /LAST MONTH(?:'S)? REVENUE\s*\n?\s*\$([\d,k.]+)/i,
          lastMonthProfit: /LAST MONTH(?:'S)? PROFIT\s*\n?\s*\$([\d,k.]+)/i,
          customers: /CUSTOMERS\s*\n?\s*([\d,<>+ -]+)/i,
          arr: /ANNUAL RECURRING REVENUE\s*\n?\s*\$([\d,k]+)/i,
          churnRate: /CHURN RATE\s*\n?\s*([\d.%+\w\s]+)/i,
          dateFounded: /DATE FOUNDED\s*\n?\s*(\w+ \d{4})/i,
          teamSize: /TEAM SIZE\s*\n?\s*([^\n]+)/i,
          businessModel: /BUSINESS MODEL\s*\n?\s*([^\n]+)/i,
          techStack: /TECH STACK\s*\n?\s*([\s\S]*?)(?=COMPETITORS|GROWTH|KEY ASSETS|Acquisition)/i,
          competitors: /COMPETITORS\s*\n?\s*([\s\S]*?)(?=GROWTH|KEY ASSETS|Acquisition)/i,
          growthOpportunities: /GROWTH OPPORTUNITIES\s*\n?\s*([\s\S]*?)(?=KEY ASSETS|Acquisition)/i,
          keyAssets: /KEY ASSETS\s*\n?\s*([\s\S]*?)(?=Acquisition|Seller)/i,
          sellingReasoning: /SELLING REASONING\s*\n?\s*([^\n]+)/i,
          financing: /FINANCING\s*\n?\s*([^\n]+)/i,
          buyersViewed: /(\d+) buyers have viewed/i,
        };

        for (const [key, re] of Object.entries(patterns)) {
          const match = body.match(re);
          data[key] = match ? match[1].trim() : "";
        }

        // Get the description — text between the title repeat and "ASKING PRICE"
        const descMatch = body.match(
          /(?:AI|SaaS|Ecommerce|Digital|Newsletter|Marketplace|Content|Agency|Crypto|Mobile app|Shopify app|Other) startup\n[^\n]+\n[^\n]+\n([\s\S]*?)(?=See more|ASKING PRICE\n\$)/i
        );
        data.description = descMatch ? descMatch[1].trim().substring(0, 2000) : "";

        // Get asking price reasoning
        const reasonMatch = body.match(
          /ASKING PRICE REASONING\s*\n?([\s\S]*?)(?=See more|Recent performance)/i
        );
        data.askingPriceReasoning = reasonMatch
          ? reasonMatch[1].trim().substring(0, 1000)
          : "";

        return data;
      }, url);

      details.push(detail);
    } catch (e) {
      console.log(`  ⚠️  Failed: ${e.message}`);
      details.push({ url, error: e.message });
    }
  }

  fs.writeFileSync(DETAILS_OUTPUT, JSON.stringify(details, null, 2));
  console.log(`✅ ${details.length} details → ${DETAILS_OUTPUT}`);
}

(async () => {
  const isFirstRun = !fs.existsSync(path.join(PROFILE_DIR, "Default"));

  if (isFirstRun) {
    console.log("🔐 First run — a browser will open. Please log into Acquire.com.");
    console.log(
      "   After you're logged in and see the dashboard, press Enter here.\n"
    );
  } else {
    console.log("♻️  Using saved session...");
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: HEADLESS,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] || (await context.newPage());

  if (isFirstRun) {
    await page.goto("https://app.acquire.com/login");
    console.log(
      "👆 Log into Acquire.com in the browser window, then press Enter here..."
    );
    await new Promise((resolve) => {
      process.stdin.once("data", resolve);
    });
  }

  const mode = process.argv[2] || "all";

  if (mode === "criteria") {
    await scrapeCriteria(page);
  } else if (mode === "listings") {
    await scrapeListings(page);
  } else if (mode === "details") {
    const urlFile = process.argv[3] || "/tmp/acquire-detail-urls.txt";
    if (!fs.existsSync(urlFile)) {
      console.error(`❌ URL file not found: ${urlFile}`);
      process.exit(1);
    }
    const urls = fs
      .readFileSync(urlFile, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    await scrapeDetails(page, urls);
  } else if (mode === "all") {
    await scrapeCriteria(page);
    await scrapeListings(page);
  }

  await context.close();
  console.log("\n🎉 Done!");
})().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
