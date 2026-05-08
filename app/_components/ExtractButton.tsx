"use client";

import { useState } from "react";
import Carousel from "./Carousel";
import ThemePicker from "./ThemePicker";
import type { CarouselDraft } from "@/lib/schemas";

interface Props {
  slug: string;
}

interface SaveResult {
  outDir: string;
  count: number;
}

export default function ExtractButton({ slug }: Props) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<CarouselDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [showJson, setShowJson] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setDraft(null);
    setElapsed(null);
    setSaveResult(null);
    setSaveError(null);
    const t0 = Date.now();
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setDraft(data.draft);
      setElapsed((Date.now() - t0) / 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "erreur");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    setSaveResult(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSaveResult({ outDir: data.outDir, count: data.count });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-md bg-cream-soft border border-border-beige flex-wrap">
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="px-5 py-2.5 rounded-md bg-olive text-white text-sm font-semibold tracking-wide hover:bg-olive-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Claude réfléchit… (~45s)" : "Générer le carrousel"}
        </button>
        {elapsed !== null && (
          <span className="text-xs text-ink-brown-soft italic">
            ✓ {elapsed.toFixed(1)}s
          </span>
        )}
        {draft && (
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className={`px-5 py-2.5 rounded-md text-sm font-semibold tracking-wide border ${
              editing
                ? "bg-rose text-white border-rose hover:bg-rose/80"
                : "bg-cream-soft text-ink-brown border-olive/30 hover:bg-cream-gold"
            }`}
          >
            {editing ? "✓ Terminer l'édition" : "✎ Mode édition"}
          </button>
        )}
        {draft && (
          <button
            type="button"
            onClick={save}
            disabled={saving || editing}
            title={editing ? "Termine l'édition avant de sauvegarder" : ""}
            className="px-5 py-2.5 rounded-md bg-ink-brown text-white text-sm font-semibold tracking-wide hover:bg-ink-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Export en cours…" : "Sauvegarder en PNG"}
          </button>
        )}
        {draft && (
          <button
            type="button"
            onClick={() => setShowJson((s) => !s)}
            className="ml-auto text-xs underline text-ink-brown-soft hover:text-ink-brown"
          >
            {showJson ? "voir slides" : "voir JSON brut"}
          </button>
        )}
        {error && (
          <span className="text-xs text-red-700 font-medium">⚠ {error}</span>
        )}
      </div>

      {saveResult && (
        <div className="px-4 py-3 rounded-md bg-green-50 border border-green-200 text-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-semibold text-green-900">
              ✓ {saveResult.count} slides sauvegardées
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch("/api/reveal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ path: saveResult.outDir }),
                  });
                  if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setSaveError(data.error || `HTTP ${res.status}`);
                  }
                } catch (e) {
                  setSaveError(e instanceof Error ? e.message : "ouverture impossible");
                }
              }}
              className="px-3 py-1.5 rounded-md bg-green-700 text-white text-xs font-semibold hover:bg-green-800"
            >
              📂 Ouvrir dans Finder
            </button>
          </div>
          <div className="text-xs text-green-800 mt-2 font-mono break-all">
            {saveResult.outDir}
          </div>
        </div>
      )}

      {saveError && (
        <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
          ⚠ Export échoué : {saveError}
        </div>
      )}

      {draft && !showJson && (
        <div className="space-y-3">
          <ThemePicker
            value={draft.theme}
            onChange={(themeId) =>
              setDraft({ ...draft, theme: themeId })
            }
          />
          {editing && (
            <div className="mb-3 px-4 py-3 rounded-md bg-rose-soft/30 border border-rose/40 text-sm text-ink-brown">
              <strong>Mode édition</strong> — clique sur n'importe quel texte pour le modifier. Utilise <code className="px-1 bg-cream-soft rounded">*mot*</code> pour l'italique et <code className="px-1 bg-cream-soft rounded">**mot**</code> pour le gras. Les changements sont gardés en mémoire jusqu'à la sauvegarde.
            </div>
          )}
          <Carousel
            draft={draft}
            editable={editing}
            onChange={setDraft}
          />
        </div>
      )}

      {draft && showJson && (
        <div className="border border-border-beige rounded-md bg-ink-brown text-white overflow-hidden">
          <div className="px-4 py-2 border-b border-white/10 text-[11px] font-bold tracking-[0.28em] uppercase text-cream-gold">
            Draft brut JSON
          </div>
          <pre className="p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(draft, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
