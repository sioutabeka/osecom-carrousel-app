import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { CarouselDraft } from "./schemas";

const CACHE_DIR = path.join(os.tmpdir(), "carrousel-template-drafts");

export async function writeDraft(slug: string, draft: CarouselDraft): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(path.join(CACHE_DIR, `${slug}.json`), JSON.stringify(draft));
}

export async function readDraft(slug: string): Promise<CarouselDraft | null> {
  try {
    const raw = await fs.readFile(path.join(CACHE_DIR, `${slug}.json`), "utf-8");
    return CarouselDraft.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}
