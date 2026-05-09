#!/usr/bin/env node
// Fusionne les batch-NN.json de /tmp/osecom-articles/ avec data/articles-source.json.
// Trie par id, dédupe par id (les batch écrasent les existants en cas de conflit).
//
// Usage : node scripts/merge-articles.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "data", "articles-source.json");
const BATCH_DIR = "/tmp/osecom-articles";

const existing = JSON.parse(fs.readFileSync(SRC, "utf8"));
if (!Array.isArray(existing)) {
  throw new Error("articles-source.json doit être un tableau");
}

const batchFiles = fs
  .readdirSync(BATCH_DIR)
  .filter((f) => /^batch-\d+\.json$/.test(f))
  .sort();

const newArticles = batchFiles.map((f) =>
  JSON.parse(fs.readFileSync(path.join(BATCH_DIR, f), "utf8")),
);

const byId = new Map();
for (const a of existing) byId.set(a.id, a);
for (const a of newArticles) byId.set(a.id, a);

const merged = [...byId.values()].sort((a, b) => a.id - b.id);

fs.writeFileSync(SRC, JSON.stringify(merged, null, 2) + "\n");

console.log(`✓ ${merged.length} articles → ${path.relative(ROOT, SRC)}`);
console.log(`  ids : ${merged.map((a) => a.id).join(", ")}`);
