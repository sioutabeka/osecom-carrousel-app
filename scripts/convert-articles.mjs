#!/usr/bin/env node
// Convertit data/articles-source.json (format brut: titre/h1/tldr/body_markdown/categorie/...)
// vers data/articles.json + data/articles-index.json (format consommé par lib/articles.ts).
//
// Usage : node scripts/convert-articles.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "data", "articles-source.json");
const OUT_ARTICLES = path.join(ROOT, "data", "articles.json");
const OUT_INDEX = path.join(ROOT, "data", "articles-index.json");

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function frenchDateLabel(iso) {
  const d = new Date(iso + "T00:00:00Z");
  return `${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function readingTime(words) {
  return `${Math.max(1, Math.round(words / 220))} min de lecture`;
}

function parseSections(markdown) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), content: [] };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.map((s) => ({
    heading: s.heading,
    content: s.content.join("\n").replace(/^\n+|\n+$/g, ""),
  }));
}

function extractDescription(markdown) {
  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length && !lines[i].startsWith("## ")) i++;
  i++;
  while (i < lines.length && lines[i].trim() === "") i++;
  const para = [];
  while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("##")) {
    para.push(lines[i]);
    i++;
  }
  const text = para.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= 240) return text;
  const cut = text.slice(0, 237);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 200 ? cut.slice(0, lastSpace) : cut) + "…";
}

function detectTable(markdown) {
  return /\n\|.*\|\s*\n\|[-:\s|]+\|/.test(markdown);
}

const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));
if (!Array.isArray(raw)) {
  throw new Error("data/articles-source.json doit être un tableau d'articles bruts");
}

const articles = raw.map((a) => ({
  slug: a.slug,
  url: a.medium_url || "",
  title: a.titre,
  tag: a.categorie,
  date_published: a.date_creation,
  date_label: frenchDateLabel(a.date_creation),
  reading_time: readingTime(a.mots_count),
  description: extractDescription(a.body_markdown),
  summary: a.tldr,
  sections: parseSections(a.body_markdown),
}));

const indexEntries = raw.map((a) => ({
  slug: a.slug,
  title: a.titre,
  tag: a.categorie,
  summary: a.tldr,
  has_table: detectTable(a.body_markdown),
  keywords: a.framework_copywriting ? [a.framework_copywriting] : [],
  topics: a.categorie_id ? [a.categorie_id] : [],
}));

const tags = [...new Set(raw.map((a) => a.categorie))];

const indexFile = {
  meta: {
    source: "osecom.com/blog (drafts locaux)",
    brand: "Osecom",
    context:
      "Agence de communication digitale, growth, conseil & storytelling. Carrousel Studio génère des carrousels Instagram à partir des articles de blog Osecom.",
    tone: "Direct, structuré, didactique. Pose les pièges, donne la mécanique, conclut sur l'action. Voix éditoriale tutoyée, sans jargon vide.",
    count: articles.length,
    tags,
  },
  instructions:
    "Index des articles disponibles dans data/articles.json. Chaque entrée : slug (clé pour getArticle), titre, tag (groupe sidebar), résumé, présence d'un tableau, mots-clés/topics pour la recherche. La source brute (avec body_markdown, sources, framework, etc.) est dans data/articles-source.json.",
  index: indexEntries,
};

fs.writeFileSync(OUT_ARTICLES, JSON.stringify({ articles }, null, 2) + "\n");
fs.writeFileSync(OUT_INDEX, JSON.stringify(indexFile, null, 2) + "\n");

console.log(`✓ ${articles.length} articles → ${path.relative(ROOT, OUT_ARTICLES)}`);
console.log(`✓ index → ${path.relative(ROOT, OUT_INDEX)}`);
console.log(`  tags : ${tags.join(", ")}`);
for (const a of articles) {
  console.log(`  - ${a.slug} (${a.sections.length} sections, ${a.reading_time})`);
}
