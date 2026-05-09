#!/usr/bin/env node
// Screenshot d'une slide précise pour debug visuel.
// Usage : node scripts/screenshot-slide.mjs <slug> <slideIndex 1-based>

import { chromium } from "playwright";
import path from "node:path";
import os from "node:os";

const SLUG = process.argv[2] || "7-erreurs-empechent-convertir";
const INDEX = Number(process.argv[3] || 10); // 1-based

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(`http://localhost:3000/editor/${SLUG}`, { waitUntil: "networkidle" });

const generateBtn = page.getByRole("button", { name: /Générer le carrousel/ });
if (await generateBtn.isVisible()) {
  await generateBtn.click();
  await page.waitForSelector(".cs-slide", { timeout: 90_000 });
}

await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const frames = await page.$$(".cs-frame");
const target = frames[INDEX - 1];
if (!target) {
  console.error(`slide #${INDEX} introuvable (${frames.length} slides présents)`);
  process.exit(1);
}

const out = path.join(os.tmpdir(), `slide-${SLUG}-${INDEX}.png`);
await target.screenshot({ path: out });
console.log(out);

await browser.close();
