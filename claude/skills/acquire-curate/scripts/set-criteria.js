const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PROFILE_DIR = path.join(process.env.HOME, ".acquire-profile");
const HEADED = process.env.HEADED === "1" || process.env.HEADED === "true";
const HEADLESS = !HEADED;

// ── Load criteria from criteria.json (single source of truth) ─────────────
const SKILL_DIR = path.join(process.env.HOME, ".claude", "skills", "acquire-curate");
const DEFAULT_CRITERIA_FILE = path.join(SKILL_DIR, "criteria.json");

const criteriaFile = process.argv.find((a) => a.endsWith(".json")) || DEFAULT_CRITERIA_FILE;

if (!fs.existsSync(criteriaFile)) {
  console.error(`❌ Criteria file not found: ${criteriaFile}`);
  console.error(`   Expected at: ${DEFAULT_CRITERIA_FILE}`);
  process.exit(1);
}

const criteria = JSON.parse(fs.readFileSync(criteriaFile, "utf-8"));
console.log(`📄 Loaded criteria from ${criteriaFile}`);

async function openCriteriaPanel(page) {
  await page.goto("https://app.acquire.com/criteria", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(4000);

  // Click the Criteria button
  const criteriaBtn = await page.$('button:has-text("Criteria")');
  if (criteriaBtn) {
    await criteriaBtn.click();
    await page.waitForTimeout(2000);
  }
}

async function setStartupTypes(page, desired) {
  console.log(`\n🏷️  Setting startup types: ${desired.join(", ")}`);

  const allTypes = [
    "SaaS", "Marketplace", "Mobile app", "Shopify app", "Content",
    "Ecommerce", "Agency", "Crypto", "AI", "Digital", "Newsletter", "Other",
  ];

  for (const typeName of allTypes) {
    const shouldBeSelected = desired.includes(typeName);

    const changed = await page.evaluate(
      ({ typeName, shouldBeSelected }) => {
        const spans = Array.from(document.querySelectorAll(".startup-types-step__item span"));
        const span = spans.find((s) => s.innerText && s.innerText.trim() === typeName);
        if (!span) return `NOT FOUND: ${typeName}`;

        const iconSelect = span.closest(".icon-select");
        if (!iconSelect) return `NO ICON-SELECT: ${typeName}`;

        const isSelected = iconSelect.classList.contains("selected");

        if (isSelected !== shouldBeSelected) {
          iconSelect.click();
          return `TOGGLED: ${typeName} → ${shouldBeSelected ? "selected" : "deselected"}`;
        }
        return `OK: ${typeName} already ${shouldBeSelected ? "selected" : "deselected"}`;
      },
      { typeName, shouldBeSelected }
    );

    console.log(`  ${changed}`);
    await page.waitForTimeout(300);
  }
}

async function setTextInput(page, inputIndex, value, label) {
  if (value === "" || value === undefined) {
    console.log(`  📝 Input[${inputIndex}] (${label}): → (skip, no value)`);
    return;
  }
  console.log(`  📝 Input[${inputIndex}] (${label}): → ${value}`);

  const input = await page.$(`.modal-body input.special-input >> nth=${inputIndex}`);
  if (input) {
    await input.click({ clickCount: 3 });
    await input.fill(value);
    await input.dispatchEvent("change");
  }

  await page.waitForTimeout(300);
}

async function setPriceAndRevenueInputs(page, criteria) {
  console.log("\n💰 Setting price, revenue, and profit inputs...");

  // Input order (by inputIndex from DOM snapshot):
  // 0: Asking price min
  // 1: Asking price max
  // 2: TTM gross revenue min
  // 3: TTM gross revenue max
  // 4: TTM net profit min
  // 5: TTM net profit max
  // 6: Interests input (skip)
  // 7: Country search (skip)
  // 8: ARR min
  // 9: ARR max
  // 10: Growth rate min
  // 11: Growth rate max

  const inputMap = [
    { index: 0, value: criteria.askingPriceMin, label: "Asking Price Min" },
    { index: 1, value: criteria.askingPriceMax, label: "Asking Price Max" },
    { index: 2, value: criteria.ttmRevenueMin, label: "TTM Revenue Min" },
    { index: 3, value: criteria.ttmRevenueMax, label: "TTM Revenue Max" },
    { index: 4, value: criteria.ttmProfitMin, label: "TTM Profit Min" },
    { index: 5, value: criteria.ttmProfitMax, label: "TTM Profit Max" },
    { index: 8, value: criteria.arrMin, label: "ARR Min" },
    { index: 9, value: criteria.arrMax, label: "ARR Max" },
    { index: 10, value: criteria.growthRateMin, label: "Growth Rate Min" },
    { index: 11, value: criteria.growthRateMax, label: "Growth Rate Max" },
  ];

  for (const { index, value, label } of inputMap) {
    await setTextInput(page, index, value, label);
  }
}

async function setSliders(page, criteria) {
  console.log("\n🎚️  Setting sliders...");

  // Slider pairs (by role="slider" order in DOM):
  // 0,1: Asking price (min, max) — range 0-2000000
  // 2,3: Revenue multiple (min, max) — range 0-20
  // 4,5: Profit multiple (min, max) — range 0-20
  // 6,7: TTM gross revenue (min, max) — range 0-1000000
  // 8,9: TTM net profit (min, max) — range 0-200000
  // 10,11: Startup age (min, max) — range 0-9

  const sliderMap = [
    { index: 0, value: criteria.askingPriceMin, label: "Asking Price Min Slider" },
    { index: 1, value: criteria.askingPriceMax, label: "Asking Price Max Slider" },
    { index: 2, value: criteria.revenueMultipleMin, label: "Revenue Multiple Min" },
    { index: 3, value: criteria.revenueMultipleMax, label: "Revenue Multiple Max" },
    { index: 4, value: criteria.profitMultipleMin, label: "Profit Multiple Min" },
    { index: 5, value: criteria.profitMultipleMax, label: "Profit Multiple Max" },
    { index: 6, value: criteria.ttmRevenueMin, label: "TTM Revenue Min Slider" },
    { index: 7, value: criteria.ttmRevenueMax, label: "TTM Revenue Max Slider" },
    { index: 8, value: criteria.ttmProfitMin, label: "TTM Profit Min Slider" },
    { index: 9, value: criteria.ttmProfitMax, label: "TTM Profit Max Slider" },
    { index: 10, value: criteria.startupAgeMin, label: "Startup Age Min" },
    { index: 11, value: criteria.startupAgeMax, label: "Startup Age Max" },
  ];

  for (const { index, value, label } of sliderMap) {
    console.log(`  🎚️  Slider[${index}] (${label}): → ${value}`);

    await page.evaluate(
      ({ index, value }) => {
        const panel = document.querySelector(".modal-body");
        if (!panel) return;
        const sliders = panel.querySelectorAll('[role="slider"]');
        const slider = sliders[index];
        if (!slider) return;

        // Set aria-valuenow and trigger React state update
        slider.setAttribute("aria-valuenow", value);

        // Simulate drag interaction to trigger the component's onChange
        const rect = slider.getBoundingClientRect();
        const min = parseFloat(slider.getAttribute("aria-valuemin") || "0");
        const max = parseFloat(slider.getAttribute("aria-valuemax") || "100");
        const track = slider.closest(".range-slider-container");
        if (!track) return;

        const trackRect = track.getBoundingClientRect();
        const ratio = (parseFloat(value) - min) / (max - min);
        const targetX = trackRect.left + ratio * trackRect.width;
        const targetY = rect.top + rect.height / 2;

        // Dispatch pointer events to simulate drag
        slider.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            clientX: rect.left + rect.width / 2,
            clientY: targetY,
          })
        );

        document.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            clientX: targetX,
            clientY: targetY,
          })
        );

        document.dispatchEvent(
          new PointerEvent("pointerup", {
            bubbles: true,
            clientX: targetX,
            clientY: targetY,
          })
        );
      },
      { index, value }
    );

    await page.waitForTimeout(300);
  }
}

async function setInterests(page, desired) {
  console.log(`\n🏷️  Setting interests (${desired.length} items)...`);

  // Read current interests from chips
  const currentInterests = await page.evaluate(() => {
    const panel = document.querySelector(".modal-body");
    if (!panel) return [];
    const chips = panel.querySelectorAll(".chip-text");
    return Array.from(chips).map((c) => c.innerText.trim());
  });

  // Filter out "United States" — it appears as a chip but is a country, not an interest
  const currentFiltered = currentInterests.filter((i) => i !== "United States");
  console.log(`  Current: ${currentFiltered.length} interests`);

  // Remove interests not in desired list
  for (const interest of currentFiltered) {
    if (!desired.includes(interest)) {
      console.log(`  ❌ Removing: ${interest}`);
      await page.evaluate((interestToRemove) => {
        const panel = document.querySelector(".modal-body");
        if (!panel) return;
        const chips = panel.querySelectorAll(".chip-text");
        for (const chip of chips) {
          if (chip.innerText?.trim() === interestToRemove) {
            const svg = chip.parentElement?.querySelector("svg");
            if (svg) {
              svg.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            }
            break;
          }
        }
      }, interest);
      await page.waitForTimeout(500);
    }
  }

  // Add missing interests
  const interestInput = await page.$(
    '.modal-body input[placeholder*="B2B"], .modal-body input[placeholder*="business"]'
  );

  for (const interest of desired) {
    if (!currentFiltered.includes(interest)) {
      console.log(`  ✅ Adding: ${interest}`);

      if (interestInput) {
        await interestInput.click();
        await interestInput.fill("");
        // Type enough characters to trigger autocomplete (first 4-5 chars)
        const searchText = interest.substring(0, Math.min(interest.length, 6));
        await interestInput.type(searchText, { delay: 80 });
        await page.waitForTimeout(1000);

        // Click the matching dropdown option
        const clicked = await page.evaluate((interest) => {
          // Look for carousel-item labels or keywords list items
          const candidates = document.querySelectorAll(
            ".carousel-item__label, .keywords__list-item span"
          );
          for (const el of candidates) {
            if (el.innerText?.trim() === interest) {
              el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              return "clicked dropdown";
            }
          }
          // Broader fallback — any visible element matching the text
          const all = document.querySelectorAll("*");
          for (const el of all) {
            if (
              el.children.length === 0 &&
              el.innerText?.trim() === interest &&
              !el.closest(".chip") &&
              !el.closest("input")
            ) {
              const rect = el.getBoundingClientRect();
              if (rect.height > 0) {
                el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                return "clicked fallback";
              }
            }
          }
          return "not found";
        }, interest);

        if (clicked === "not found") {
          // Last resort — press Enter
          await interestInput.press("Enter");
          console.log(`    ⚠️  No dropdown match, tried Enter`);
        }

        await interestInput.fill("");
        await page.waitForTimeout(400);
      }
    }
  }
}

async function setHighlights(page, desired) {
  console.log(`\n✨ Setting highlights: ${desired.length ? desired.join(", ") : "(none)"}`);

  const allHighlights = [
    "Recast financials",
    "Connected metrics",
    "Under M&A advisory",
    "Verified business",
  ];

  for (const highlight of allHighlights) {
    const shouldBeSelected = desired.includes(highlight);

    await page.evaluate(
      ({ highlight, shouldBeSelected }) => {
        const panel = document.querySelector(".modal-body");
        if (!panel) return;
        const spans = Array.from(panel.querySelectorAll("*")).filter(
          (el) =>
            el.innerText &&
            el.innerText.trim() === highlight &&
            el.children.length === 0
        );
        if (spans.length === 0) return;

        const iconSelect = spans[0].closest(".icon-select");
        if (!iconSelect) return;

        const isSelected = iconSelect.classList.contains("selected");
        if (isSelected !== shouldBeSelected) {
          iconSelect.click();
        }
      },
      { highlight, shouldBeSelected }
    );

    await page.waitForTimeout(200);
  }
}

async function setNumberOfCustomers(page, desired) {
  console.log(`\n👥 Setting number of customers: ${desired.join(", ")}`);

  const allOptions = [
    "All", "< 10", "10-50", "51-100", "101-250",
    "251-500", "500-999", "1,000-5,000", "5,000+",
  ];

  // Scroll the modal to bottom so checkbox section is visible
  await page.evaluate(() => {
    const modal = document.querySelector(".modal-body");
    if (modal) modal.scrollTop = modal.scrollHeight;
  });
  await page.waitForTimeout(500);

  for (const option of allOptions) {
    const shouldBeChecked = desired.includes(option);

    const result = await page.evaluate(
      ({ option, shouldBeChecked }) => {
        const panel = document.querySelector(".modal-body");
        if (!panel) return "no panel";
        const blocks = panel.querySelectorAll(".checkbox-block");
        for (const b of blocks) {
          const label = b.querySelector("span.title")?.innerText?.trim();
          if (label !== option) continue;

          const box = b.querySelector(".checkbox-box");
          if (!box) return `no checkbox-box for ${option}`;

          const bg = getComputedStyle(box).backgroundColor;
          const isChecked = bg !== "rgb(255, 255, 255)";

          if (isChecked !== shouldBeChecked) {
            box.click();
            return `TOGGLED: ${option} → ${shouldBeChecked ? "checked" : "unchecked"}`;
          }
          return `OK: ${option} already ${shouldBeChecked ? "checked" : "unchecked"}`;
        }
        return `NOT FOUND: ${option}`;
      },
      { option, shouldBeChecked }
    );

    console.log(`  ${result}`);
    await page.waitForTimeout(300);
  }
}

async function setCriteriaMode(page, mode) {
  console.log(`\n⚙️  Setting criteria mode: ${mode}`);

  await page.evaluate((mode) => {
    const panel = document.querySelector(".modal-body");
    if (!panel) return;
    const allSpans = Array.from(panel.querySelectorAll("span"));
    for (const span of allSpans) {
      if (span.innerText?.trim() === mode) {
        const iconSelect = span.closest(".icon-select");
        if (iconSelect && !iconSelect.classList.contains("selected")) {
          iconSelect.click();
        }
        break;
      }
    }
  }, mode);

  await page.waitForTimeout(300);
}

async function clickSave(page) {
  console.log("\n💾 Saving criteria...");

  const result = await page.evaluate(() => {
    const panel = document.querySelector(".modal-body");
    if (!panel) return "no panel";
    const saveBtn = Array.from(panel.querySelectorAll("button")).find(
      (b) => b.innerText.trim() === "Save"
    );
    if (!saveBtn) return "no button";
    if (saveBtn.disabled || saveBtn.classList.contains("disabled")) return "disabled";
    saveBtn.click();
    return "clicked";
  });

  if (result === "clicked") {
    await page.waitForTimeout(2000);
    console.log("  ✅ Saved!");
    return true;
  }
  console.log(`  ⚠️  Save: ${result}`);
  return false;
}

async function readCurrentCriteria(page) {
  console.log("\n📖 Reading current criteria from page...");

  return await page.evaluate(() => {
    const panel = document.querySelector(".modal-body");
    if (!panel) return { error: "No panel found" };

    // Read startup types
    const types = [];
    const typeItems = panel.querySelectorAll(".startup-types-step__item");
    typeItems.forEach((item) => {
      const iconSelect = item.querySelector(".icon-select");
      const span = item.querySelector("span");
      if (span && iconSelect && iconSelect.classList.contains("selected")) {
        types.push(span.innerText.trim());
      }
    });

    // Read text inputs
    const inputs = panel.querySelectorAll("input.special-input");
    const inputValues = Array.from(inputs).map((i) => i.value);

    // Read sliders
    const sliders = panel.querySelectorAll('[role="slider"]');
    const sliderValues = Array.from(sliders).map((s) => ({
      value: s.getAttribute("aria-valuenow"),
      min: s.getAttribute("aria-valuemin"),
      max: s.getAttribute("aria-valuemax"),
    }));

    // Read criteria mode (Flexible/Strict)
    let mode = "";
    const allSpans = Array.from(panel.querySelectorAll("span"));
    for (const span of allSpans) {
      const text = span.innerText?.trim();
      if (text === "Flexible" || text === "Strict") {
        const iconSelect = span.closest(".icon-select");
        if (iconSelect?.classList.contains("selected")) {
          mode = text;
          break;
        }
      }
    }

    // Read number of customers checkboxes
    const customerChecked = [];
    const customerBlocks = panel.querySelectorAll(".checkbox-block");
    customerBlocks.forEach((b) => {
      const label = b.querySelector("span.title")?.innerText?.trim();
      const box = b.querySelector(".checkbox-box");
      if (label && box) {
        const bg = getComputedStyle(box).backgroundColor;
        if (bg !== "rgb(255, 255, 255)") {
          customerChecked.push(label);
        }
      }
    });

    // Read interests
    const interestChips = panel.querySelectorAll(".chip-text");
    const interests = Array.from(interestChips).map((c) => c.innerText.trim());

    return {
      startupTypes: types,
      inputs: {
        askingPriceMin: inputValues[0] || "",
        askingPriceMax: inputValues[1] || "",
        ttmRevenueMin: inputValues[2] || "",
        ttmRevenueMax: inputValues[3] || "",
        ttmProfitMin: inputValues[4] || "",
        ttmProfitMax: inputValues[5] || "",
        arrMin: inputValues[8] || "",
        arrMax: inputValues[9] || "",
        growthRateMin: inputValues[10] || "",
        growthRateMax: inputValues[11] || "",
      },
      sliders: {
        askingPrice: [sliderValues[0], sliderValues[1]],
        revenueMultiple: [sliderValues[2], sliderValues[3]],
        profitMultiple: [sliderValues[4], sliderValues[5]],
        ttmRevenue: [sliderValues[6], sliderValues[7]],
        ttmProfit: [sliderValues[8], sliderValues[9]],
        startupAge: [sliderValues[10], sliderValues[11]],
      },
      numberOfCustomers: customerChecked,
      interests,
      criteriaMode: mode,
    };
  });
}

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: HEADLESS,
    viewport: { width: 1280, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] || (await context.newPage());

  const mode = process.argv[2] === "--read" ? "read" : "set";

  await openCriteriaPanel(page);

  if (mode === "read") {
    const current = await readCurrentCriteria(page);
    console.log("\n📋 Current criteria:");
    console.log(JSON.stringify(current, null, 2));
    fs.writeFileSync("/tmp/acquire-current-criteria.json", JSON.stringify(current, null, 2));
    console.log("→ /tmp/acquire-current-criteria.json");
  } else {
    // Read before
    console.log("=== BEFORE ===");
    const before = await readCurrentCriteria(page);
    console.log(JSON.stringify(before.startupTypes));
    console.log(JSON.stringify(before.inputs));

    // Apply criteria
    await setStartupTypes(page, criteria.startupTypes);
    await setPriceAndRevenueInputs(page, criteria);
    await setSliders(page, criteria);
    await setHighlights(page, criteria.highlights);
    await setNumberOfCustomers(page, criteria.numberOfCustomers);
    await setCriteriaMode(page, criteria.criteriaMode);

    await setInterests(page, criteria.interests);

    // Read after
    console.log("\n=== AFTER ===");
    const after = await readCurrentCriteria(page);
    console.log(JSON.stringify(after.startupTypes));
    console.log(JSON.stringify(after.inputs));

    // Try to save
    await clickSave(page);
  }

  await context.close();
  console.log("\n🎉 Done!");
})().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
