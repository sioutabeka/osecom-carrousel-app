import fs from "node:fs/promises";
import path from "node:path";
import type { Article, ArticleIndex, ArticleIndexEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

let _indexCache: ArticleIndex | null = null;
let _articlesCache: Article[] | null = null;

async function loadIndex(): Promise<ArticleIndex> {
  if (_indexCache) return _indexCache;
  const raw = await fs.readFile(path.join(DATA_DIR, "articles-index.json"), "utf-8");
  _indexCache = JSON.parse(raw);
  return _indexCache!;
}

async function loadAllArticles(): Promise<Article[]> {
  if (_articlesCache) return _articlesCache;
  const raw = await fs.readFile(path.join(DATA_DIR, "articles.json"), "utf-8");
  const parsed = JSON.parse(raw);
  _articlesCache = Array.isArray(parsed) ? parsed : (parsed.articles ?? []);
  return _articlesCache!;
}

export async function listArticles(): Promise<ArticleIndexEntry[]> {
  const idx = await loadIndex();
  return idx.index;
}

export async function listArticlesByTag(): Promise<Record<string, ArticleIndexEntry[]>> {
  const all = await listArticles();
  return all.reduce<Record<string, ArticleIndexEntry[]>>((acc, art) => {
    (acc[art.tag] ||= []).push(art);
    return acc;
  }, {});
}

export async function getArticle(slug: string): Promise<Article | null> {
  const all = await loadAllArticles();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getMeta(): Promise<ArticleIndex["meta"]> {
  const idx = await loadIndex();
  return idx.meta;
}
