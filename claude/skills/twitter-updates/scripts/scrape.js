const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PROFILE_DIR = path.join(process.env.HOME, ".x-feed-profile");
const SCROLL_COUNT = parseInt(process.env.SCROLL_COUNT || "10", 10);
const SCROLL_DELAY = 2000;

const TARGETS = [
  {
    name: "Home Feed",
    url: "https://x.com/home",
    output: "/tmp/x-feed-raw.json",
  },
  {
    name: "Builders List",
    url: "https://x.com/i/lists/1777861731693519275",
    output: "/tmp/x-builders-raw.json",
  },
];

async function scrapePage(page, target) {
  console.log(`\n📡 Loading ${target.name}...`);
  await page.goto(target.url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  const tweets = [];

  for (let i = 0; i < SCROLL_COUNT; i++) {
    const newTweets = await page.evaluate(() => {
      const articles = document.querySelectorAll('article[data-testid="tweet"]');
      return Array.from(articles).map((article) => {
        const tweetText =
          article.querySelector('[data-testid="tweetText"]')?.innerText || "";
        const userBlock =
          article.querySelector('[data-testid="User-Name"]')?.innerText || "";
        const time =
          article.querySelector("time")?.getAttribute("datetime") || "";
        const tweetLink =
          article.querySelector('a[href*="/status/"]')?.getAttribute("href") ||
          "";

        const metrics = {};
        const groups = article.querySelectorAll('[role="group"] button');
        const metricNames = ["replies", "reposts", "likes", "views"];
        groups.forEach((btn, idx) => {
          const val = btn.getAttribute("aria-label") || "";
          if (metricNames[idx]) metrics[metricNames[idx]] = val;
        });

        const externalLinks = Array.from(article.querySelectorAll("a[href]"))
          .map((a) => a.href)
          .filter(
            (h) =>
              h &&
              !h.includes("x.com") &&
              !h.includes("twitter.com") &&
              !h.startsWith("javascript")
          );

        const hasImage = !!article.querySelector('[data-testid="tweetPhoto"]');
        const hasVideo = !!article.querySelector('[data-testid="videoPlayer"]');

        return {
          author: userBlock,
          text: tweetText,
          time,
          tweetLink: tweetLink ? `https://x.com${tweetLink}` : "",
          metrics,
          externalLinks,
          hasImage,
          hasVideo,
        };
      });
    });

    for (const t of newTweets) {
      if (t.text && !tweets.some((existing) => existing.text === t.text)) {
        tweets.push(t);
      }
    }

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(SCROLL_DELAY);
    console.log(
      `📜 [${target.name}] Scroll ${i + 1}/${SCROLL_COUNT} — ${tweets.length} unique tweets`
    );
  }

  fs.writeFileSync(target.output, JSON.stringify(tweets, null, 2));
  console.log(`✅ [${target.name}] ${tweets.length} tweets → ${target.output}`);
}

(async () => {
  const isFirstRun = !fs.existsSync(path.join(PROFILE_DIR, "Default"));

  if (isFirstRun) {
    console.log("🔐 First run — a browser will open. Please log into X.");
    console.log(
      "   After you're logged in and see your feed, press Enter here.\n"
    );
  } else {
    console.log("♻️  Using saved session...");
  }

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] || (await context.newPage());

  if (isFirstRun) {
    await page.goto("https://x.com/login");
    console.log("👆 Log into X in the browser window, then press Enter here...");
    await new Promise((resolve) => {
      process.stdin.once("data", resolve);
    });
  }

  for (const target of TARGETS) {
    await scrapePage(page, target);
  }

  await context.close();
  console.log("\n🎉 All targets scraped!");
})().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
