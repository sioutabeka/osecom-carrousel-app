import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {
  PatternRecordSchema,
  SEED_PATTERNS,
  type PatternRecord,
} from "./patterns";
import { z } from "zod";

const STORE_PATH = path.join(process.cwd(), "data", "patterns.json");

const StoreFileSchema = z.object({
  patterns: z.array(PatternRecordSchema),
});

async function readStore(): Promise<PatternRecord[]> {
  let raw: string;
  try {
    raw = await fs.readFile(STORE_PATH, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      await writeStore(SEED_PATTERNS);
      return [...SEED_PATTERNS];
    }
    throw err;
  }
  const parsed = StoreFileSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`patterns.json invalide : ${parsed.error.message}`);
  }
  return parsed.data.patterns;
}

async function writeStore(patterns: PatternRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(
    STORE_PATH,
    JSON.stringify({ patterns }, null, 2) + "\n",
    "utf8"
  );
}

export async function listPatterns(): Promise<PatternRecord[]> {
  const patterns = await readStore();
  return [...patterns].sort((a, b) => a.label.localeCompare(b.label));
}

export async function getPattern(id: string): Promise<PatternRecord | null> {
  const patterns = await readStore();
  return patterns.find((p) => p.id === id) ?? null;
}

export async function createPattern(record: PatternRecord): Promise<PatternRecord> {
  const validated = PatternRecordSchema.parse(record);
  const patterns = await readStore();
  if (patterns.some((p) => p.id === validated.id)) {
    throw new Error(`pattern "${validated.id}" existe déjà`);
  }
  patterns.push(validated);
  await writeStore(patterns);
  return validated;
}

export async function updatePattern(
  id: string,
  patch: Partial<Omit<PatternRecord, "id">>
): Promise<PatternRecord> {
  const patterns = await readStore();
  const idx = patterns.findIndex((p) => p.id === id);
  if (idx === -1) {
    throw new Error(`pattern "${id}" introuvable`);
  }
  const merged = { ...patterns[idx], ...patch, id };
  const validated = PatternRecordSchema.parse(merged);
  patterns[idx] = validated;
  await writeStore(patterns);
  return validated;
}

export async function deletePattern(id: string): Promise<void> {
  const patterns = await readStore();
  if (patterns.length <= 1) {
    throw new Error("impossible de supprimer le dernier pattern restant");
  }
  const idx = patterns.findIndex((p) => p.id === id);
  if (idx === -1) {
    throw new Error(`pattern "${id}" introuvable`);
  }
  patterns.splice(idx, 1);
  await writeStore(patterns);
}
