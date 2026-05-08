"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ArticleIndexEntry } from "@/lib/types";

interface Props {
  byTag: Record<string, ArticleIndexEntry[]>;
}

export default function Sidebar({ byTag }: Props) {
  const [query, setQuery] = useState("");
  const [openTags, setOpenTags] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(byTag).map((t) => [t, true]))
  );

  const filteredByTag = useMemo(() => {
    if (!query.trim()) return byTag;
    const q = query.toLowerCase();
    const result: Record<string, ArticleIndexEntry[]> = {};
    for (const [tag, articles] of Object.entries(byTag)) {
      const matches = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.keywords.some((k) => k.toLowerCase().includes(q))
      );
      if (matches.length) result[tag] = matches;
    }
    return result;
  }, [byTag, query]);

  const totalCount = Object.values(byTag).reduce((n, arr) => n + arr.length, 0);
  const filteredCount = Object.values(filteredByTag).reduce((n, arr) => n + arr.length, 0);

  return (
    <aside className="w-[360px] border-r border-border-beige bg-cream-soft flex flex-col h-screen sticky top-0">
      {/* Header — toute la zone est cliquable vers la home */}
      <Link
        href="/"
        className="block p-6 border-b border-border-beige hover:bg-cream-gold/40 transition-colors"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-rose" />
          <span className="text-[11px] font-semibold tracking-[0.28em] uppercase text-olive">
            Carrousel Studio
          </span>
        </div>
        <div className="font-display text-ink-brown text-2xl">Osecom</div>
      </Link>

      {/* Search */}
      <div className="p-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Recherche article, mot-clé…"
          className="w-full px-4 py-2.5 text-sm rounded-md border border-olive/20 bg-cream-soft focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
        />
        <div className="mt-2 text-[11px] text-ink-brown-soft tracking-wider uppercase">
          {filteredCount} / {totalCount} {totalCount > 1 ? "articles" : "article"}
        </div>
      </div>

      {/* List */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {Object.entries(filteredByTag).map(([tag, articles]) => (
          <div key={tag} className="mb-3">
            <button
              type="button"
              onClick={() => setOpenTags((s) => ({ ...s, [tag]: !s[tag] }))}
              className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold tracking-[0.28em] uppercase text-olive hover:bg-cream-gold rounded-md"
            >
              <span>
                {openTags[tag] ? "▾" : "▸"} {tag}
              </span>
              <span className="text-ink-brown-soft font-normal">{articles.length}</span>
            </button>
            {openTags[tag] && (
              <ul className="mt-1">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/editor/${a.slug}`}
                      className="block px-3 py-2 text-sm rounded-md hover:bg-cream-gold/60 text-ink-brown transition-colors"
                    >
                      {a.title.replace(/\.\s*$/, "")}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
