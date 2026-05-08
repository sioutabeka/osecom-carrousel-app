import { NextResponse } from "next/server";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { CarouselDraft } from "@/lib/schemas";
import { writeDraft } from "@/lib/draft-cache";

export const runtime = "nodejs";
export const maxDuration = 120;

const OUTPUT_BASE = path.join(
  os.homedir(),
  "Documents",
  "osecom-carrousel-output"
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body?.slug ?? "").trim();
    if (!slug) {
      return NextResponse.json({ error: "slug manquant" }, { status: 400 });
    }

    const parsed = CarouselDraft.safeParse(body?.draft);
    if (!parsed.success) {
      return NextResponse.json(
        { error: `draft invalide: ${parsed.error.message}` },
        { status: 400 }
      );
    }
    const draft = parsed.data;

    await writeDraft(slug, draft);

    const host = req.headers.get("host") ?? "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    const baseUrl = `${proto}://${host}`;

    const outDir = path.join(OUTPUT_BASE, slug);
    await fs.mkdir(outDir, { recursive: true });

    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({
        viewport: { width: 1080, height: 1350 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      const printUrl = `${baseUrl}/print/${slug}`;
      await page.goto(printUrl, { waitUntil: "networkidle", timeout: 60000 });
      await page.evaluate(() => (document as Document).fonts?.ready);

      const slides = page.locator(".cs-slide");
      const count = await slides.count();
      if (count === 0) {
        throw new Error(
          `aucune slide rendue sur ${printUrl} — vérifie que le draft est bien en cache`
        );
      }

      const paths: string[] = [];
      for (let i = 0; i < count; i++) {
        const slidePath = path.join(
          outDir,
          `slide-${String(i + 1).padStart(2, "0")}.png`
        );
        await slides.nth(i).screenshot({ path: slidePath });
        paths.push(slidePath);
      }

      return NextResponse.json({ outDir, count, paths });
    } finally {
      await browser.close();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    console.error("[/api/export]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
