#!/usr/bin/env node
// Debug FitToParent : navigate vers un éditeur, déclenche la génération,
// puis inspecte chaque slide pour voir scale appliqué + overflow réel.
// Usage : node scripts/debug-fit.mjs <slug>
//   ex : node scripts/debug-fit.mjs 7-erreurs-empechent-convertir

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const SLUG = process.argv[2] || "7-erreurs-empechent-convertir";
const BASE = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(os.tmpdir(), "osecom-debug-fit");

await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();

console.log(`→ ${BASE}/editor/${SLUG}`);
await page.goto(`${BASE}/editor/${SLUG}`, { waitUntil: "networkidle" });

// Si pas déjà généré, clique le bouton et attends
const generateBtn = page.getByRole("button", { name: /Générer le carrousel/ });
if (await generateBtn.isVisible()) {
  console.log("→ click 'Générer le carrousel' (attente ~45s)");
  await generateBtn.click();
  // attend que le carrousel apparaisse (présence d'au moins une slide)
  await page.waitForSelector(".cs-slide", { timeout: 90_000 });
  console.log("✓ carrousel généré");
}

// Attend que toutes les fonts soient chargées + un petit settle pour FitToParent
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

// Pour chaque slide body-style, mesure parent height vs content scrollHeight
// et le scale appliqué par FitToParent.
const slides = await page.$$(".cs-frame");
console.log(`\n=== ${slides.length} slides détectés ===\n`);

const report = [];
for (let i = 0; i < slides.length; i++) {
  const data = await slides[i].evaluate((frame) => {
    const slide = frame.querySelector(".cs-slide");
    const body = frame.querySelector(".cs-body-content");
    const hook = frame.querySelector(".cs-hook");
    const fit = frame.querySelector(".cs-fit");

    const result = {
      slideType: slide?.classList.contains("cs-cover-bg")
        ? "cover"
        : slide?.classList.contains("cs-cta-bg")
        ? "cta"
        : "body",
      hasFit: !!fit,
      parentH: 0,
      contentH: 0,
      transform: "none",
      scale: 1,
      childrenInfo: [],
    };

    if (fit) {
      const parent = fit.parentElement;
      result.parentH = parent?.clientHeight || 0;
      result.contentH = fit.scrollHeight;
      result.transform = fit.style.transform || "none";
      const m = result.transform.match(/scale\(([\d.]+)\)/);
      result.scale = m ? parseFloat(m[1]) : 1;

      // info sur les enfants directs
      Array.from(fit.children).forEach((c) => {
        result.childrenInfo.push({
          tag: c.tagName.toLowerCase(),
          cls: c.className,
          h: c.offsetHeight,
        });
      });
    } else if (hook) {
      result.parentH = hook.clientHeight;
      result.contentH = hook.scrollHeight;
    } else if (body) {
      result.parentH = body.clientHeight;
      result.contentH = body.scrollHeight;
    }

    return result;
  });

  const flag = data.contentH > data.parentH ? " ⚠ OVERFLOW" : "";
  const scaleStr = data.scale < 1 ? ` (scale ${data.scale.toFixed(3)})` : "";
  console.log(
    `  slide ${String(i + 1).padStart(2, "0")} [${data.slideType.padEnd(5)}]  parent=${data.parentH}px  content=${data.contentH}px${scaleStr}${flag}`,
  );
  if (data.childrenInfo.length) {
    const total = data.childrenInfo.reduce((s, c) => s + c.h, 0);
    console.log(`     children: ${data.childrenInfo.map((c) => `${c.cls.split(" ")[0] || c.tag}=${c.h}px`).join("  ")}  (sum=${total}px)`);
  }

  report.push({ index: i + 1, ...data });

  // screenshot des slides problématiques
  if (data.contentH > data.parentH || data.scale < 1) {
    const filename = path.join(SCREENSHOT_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`);
    await slides[i].screenshot({ path: filename });
    console.log(`     → screenshot: ${filename}`);
  }
}

await fs.writeFile(
  path.join(SCREENSHOT_DIR, "report.json"),
  JSON.stringify(report, null, 2),
);
console.log(`\n✓ rapport complet : ${path.join(SCREENSHOT_DIR, "report.json")}`);

await browser.close();
