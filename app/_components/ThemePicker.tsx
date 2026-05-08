"use client";

import { useEffect, useRef, useState } from "react";

export interface Theme {
  id: string;
  name: string;
  coverUrl: string;
  ctaUrl: string;
  bodyUrl?: string;
}

interface Props {
  value: string | undefined;
  onChange: (themeId: string | undefined) => void;
}

export default function ThemePicker({ value, onChange }: Props) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/bg/themes", { cache: "no-store" });
      const data = await res.json();
      setThemes(data.themes ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const current = value ?? "default";

  async function deleteTheme(id: string, name: string) {
    if (!confirm(`Supprimer le thème "${name}" ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/bg/themes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Suppression échouée : ${data.error || `HTTP ${res.status}`}`);
        return;
      }
      if (current === id) onChange(undefined);
      refresh();
    } catch (err) {
      alert(`Suppression échouée : ${err instanceof Error ? err.message : "erreur"}`);
    }
  }

  return (
    <div className="rounded-md border border-border-beige bg-cream-soft p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold tracking-[0.28em] uppercase text-olive">
          🎨 Thème
        </div>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="text-xs underline text-ink-brown-soft hover:text-ink-brown"
        >
          {adding ? "× annuler" : "+ ajouter un thème"}
        </button>
      </div>

      {loading && <div className="text-xs text-ink-brown-soft">chargement…</div>}

      {!loading && (
        <div className="flex gap-3 flex-wrap">
          {themes.map((t) => (
            <div key={t.id} className="relative group/card">
              <button
                type="button"
                onClick={() => onChange(t.id === "default" ? undefined : t.id)}
                className={`block w-28 rounded-md overflow-hidden border-2 transition ${
                  current === t.id
                    ? "border-olive ring-2 ring-olive/30"
                    : "border-border-beige hover:border-olive/40"
                }`}
                title={t.name}
              >
                <div className="flex">
                  <img
                    src={t.coverUrl}
                    alt=""
                    className={`${t.bodyUrl ? "w-1/3" : "w-1/2"} aspect-[1080/1350] object-cover`}
                  />
                  {t.bodyUrl && (
                    <img
                      src={t.bodyUrl}
                      alt=""
                      className="w-1/3 aspect-[1080/1350] object-cover border-l border-r border-cream-soft"
                    />
                  )}
                  <img
                    src={t.ctaUrl}
                    alt=""
                    className={`${t.bodyUrl ? "w-1/3" : "w-1/2"} aspect-[1080/1350] object-cover`}
                  />
                </div>
                <div className="px-2 py-1 text-[11px] font-semibold text-ink-brown truncate bg-cream-soft">
                  {t.name}
                </div>
              </button>
              {t.id !== "default" && (
                <button
                  type="button"
                  onClick={() => deleteTheme(t.id, t.name)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-700 text-white text-xs font-bold hover:bg-red-800 opacity-0 group-hover/card:opacity-100 transition shadow-md flex items-center justify-center leading-none"
                  title={`Supprimer "${t.name}"`}
                  aria-label={`Supprimer ${t.name}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {adding && (
        <AddThemeForm
          onSuccess={() => {
            setAdding(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function AddThemeForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLInputElement>(null);
  const ctaRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cover = coverRef.current?.files?.[0];
    const cta = ctaRef.current?.files?.[0];
    const body = bodyRef.current?.files?.[0];
    if (!name.trim() || !cover || !cta) {
      setError("nom + cover + CTA requis (body optionnel)");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("cover", cover);
      fd.append("cta", cta);
      if (body) fd.append("body", body);
      const res = await fetch("/api/bg/themes", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "erreur");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-md bg-cream-gold/40 border border-olive/20 p-3 space-y-2 text-sm"
    >
      <label className="block">
        <span className="block text-[11px] font-bold tracking-[0.2em] uppercase text-olive mb-1">
          Nom du thème
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: warm gold, ivory soft…"
          className="w-full px-3 py-1.5 rounded border border-olive/20 bg-cream-soft"
        />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="block text-[11px] font-bold tracking-[0.2em] uppercase text-olive mb-1">
            Cover (PNG, 1080×1350)
          </span>
          <input ref={coverRef} type="file" accept="image/png" className="text-xs w-full" />
        </label>
        <label className="block">
          <span className="block text-[11px] font-bold tracking-[0.2em] uppercase text-olive mb-1">
            Body (PNG, optionnel)
          </span>
          <input ref={bodyRef} type="file" accept="image/png" className="text-xs w-full" />
        </label>
        <label className="block">
          <span className="block text-[11px] font-bold tracking-[0.2em] uppercase text-olive mb-1">
            CTA (PNG, 1080×1350)
          </span>
          <input ref={ctaRef} type="file" accept="image/png" className="text-xs w-full" />
        </label>
      </div>
      <p className="text-[11px] text-ink-brown-soft italic">
        Body optionnel — si absent, fond blanc par défaut sur les slides body/method/steps/donts.
      </p>
      {error && <div className="text-xs text-red-700">⚠ {error}</div>}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-1.5 rounded bg-olive text-white text-xs font-semibold tracking-wide hover:bg-olive-dark disabled:opacity-50"
      >
        {submitting ? "Upload…" : "Enregistrer le thème"}
      </button>
    </form>
  );
}
