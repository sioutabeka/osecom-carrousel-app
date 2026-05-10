"use client";

import { useState } from "react";
import Link from "next/link";
import type { PatternRecord } from "@/lib/patterns";
import { slugifyPatternId } from "@/lib/patterns";

type Draft = {
  id: string;
  label: string;
  tagline: string;
  brief: string;
};

const EMPTY_DRAFT: Draft = { id: "", label: "", tagline: "", brief: "" };

const BRIEF_PLACEHOLDER = `**Pattern : <nom>.**

- Job narratif : ...
- Séquence attendue : \`cover\` → ... → \`cta\`. N slides au total.
- Ton : ...
- Tags privilégiés : \`...\`, \`...\`.
- Contrainte spécifique éventuelle : ...`;

export default function PatternsManager({ initial }: { initial: PatternRecord[] }) {
  const [patterns, setPatterns] = useState<PatternRecord[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  function startEdit(p: PatternRecord) {
    setCreating(false);
    setEditingId(p.id);
    setDraft({ id: p.id, label: p.label, tagline: p.tagline, brief: p.brief });
    setError(null);
  }

  function cancel() {
    setCreating(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  async function refresh() {
    const res = await fetch("/api/patterns", { cache: "no-store" });
    const data = await res.json();
    setPatterns((data?.patterns ?? []) as PatternRecord[]);
  }

  async function submitCreate() {
    setBusy(true);
    setError(null);
    try {
      const id = draft.id.trim() || slugifyPatternId(draft.label);
      const res = await fetch("/api/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      await refresh();
      cancel();
    } catch (e) {
      setError(e instanceof Error ? e.message : "erreur");
    } finally {
      setBusy(false);
    }
  }

  async function submitEdit() {
    if (!editingId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/patterns/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: draft.label,
          tagline: draft.tagline,
          brief: draft.brief,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      await refresh();
      cancel();
    } catch (e) {
      setError(e instanceof Error ? e.message : "erreur");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!confirm(`Supprimer le pattern "${label}" ?\nLes carrousels existants ne sont pas impactés mais tu ne pourras plus le sélectionner.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/patterns/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      await refresh();
      if (editingId === id) cancel();
    } catch (e) {
      setError(e instanceof Error ? e.message : "erreur");
    } finally {
      setBusy(false);
    }
  }

  const isFormOpen = creating || editingId !== null;
  const submitDisabled =
    busy ||
    !draft.label.trim() ||
    !draft.tagline.trim() ||
    draft.brief.trim().length < 20;

  return (
    <div className="min-h-screen bg-cream-soft">
      <header className="border-b border-border-beige bg-white">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.28em] text-ink-brown-soft hover:text-ink-brown"
            >
              ← Accueil
            </Link>
            <h1 className="font-display text-ink-brown text-4xl mt-2">
              Patterns narratifs
            </h1>
            <p className="font-serif italic text-ink-brown-soft mt-1">
              Les squelettes que Claude utilise pour transformer un article en carrousel.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            disabled={isFormOpen || busy}
            className="px-5 py-2.5 rounded-md bg-olive text-white text-sm font-semibold tracking-wide hover:bg-olive-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Nouveau pattern
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
            ⚠ {error}
          </div>
        )}

        {creating && (
          <PatternForm
            mode="create"
            draft={draft}
            setDraft={setDraft}
            onSubmit={submitCreate}
            onCancel={cancel}
            disabled={submitDisabled}
            busy={busy}
          />
        )}

        <ul className="space-y-3">
          {patterns.map((p) => {
            const isEditing = editingId === p.id;
            if (isEditing) {
              return (
                <li key={p.id}>
                  <PatternForm
                    mode="edit"
                    draft={draft}
                    setDraft={setDraft}
                    onSubmit={submitEdit}
                    onCancel={cancel}
                    disabled={submitDisabled}
                    busy={busy}
                  />
                </li>
              );
            }
            return (
              <li
                key={p.id}
                className="rounded-md border border-border-beige bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <div className="font-display text-ink-brown text-2xl leading-tight">
                      {p.label}
                    </div>
                    <div className="font-serif italic text-ink-brown-soft text-sm mt-1">
                      {p.tagline}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive mt-2">
                      {p.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      disabled={isFormOpen || busy}
                      className="px-3 py-1.5 rounded-md bg-cream-soft border border-olive/30 text-xs font-semibold text-ink-brown hover:bg-cream-gold disabled:opacity-50"
                    >
                      ✎ Éditer
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p.id, p.label)}
                      disabled={isFormOpen || busy || patterns.length <= 1}
                      title={patterns.length <= 1 ? "Impossible de supprimer le dernier pattern" : ""}
                      className="px-3 py-1.5 rounded-md bg-white border border-red-300 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="text-xs font-bold tracking-[0.18em] uppercase text-ink-brown-soft cursor-pointer hover:text-ink-brown">
                    Voir le brief
                  </summary>
                  <pre className="mt-3 p-4 bg-cream-soft border border-border-beige rounded-md text-xs leading-relaxed whitespace-pre-wrap font-mono text-ink-brown overflow-x-auto">
                    {p.brief}
                  </pre>
                </details>
              </li>
            );
          })}
        </ul>

        {patterns.length === 0 && !creating && (
          <div className="text-center py-12 text-ink-brown-soft">
            Aucun pattern. Crée le premier.
          </div>
        )}
      </main>
    </div>
  );
}

interface FormProps {
  mode: "create" | "edit";
  draft: Draft;
  setDraft: (d: Draft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  disabled: boolean;
  busy: boolean;
}

function PatternForm({ mode, draft, setDraft, onSubmit, onCancel, disabled, busy }: FormProps) {
  const isEdit = mode === "edit";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-md border-2 border-olive/40 bg-white p-5 space-y-4"
    >
      <div className="text-xs font-bold tracking-[0.28em] uppercase text-olive">
        {isEdit ? `Édition · ${draft.id}` : "Nouveau pattern"}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-ink-brown-soft">
            Label
          </span>
          <input
            type="text"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="Le piège → la mécanique"
            className="px-3 py-2 rounded-md bg-white border border-olive/30 text-sm text-ink-brown focus:outline-none focus:border-olive"
            required
            maxLength={80}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-ink-brown-soft">
            Slug {isEdit && "(non modifiable)"}
          </span>
          <input
            type="text"
            value={draft.id}
            onChange={(e) =>
              setDraft({ ...draft, id: slugifyPatternId(e.target.value) })
            }
            placeholder={
              draft.label ? slugifyPatternId(draft.label) : "auto depuis le label"
            }
            disabled={isEdit}
            className="px-3 py-2 rounded-md bg-cream-soft border border-olive/20 text-sm text-ink-brown font-mono disabled:opacity-60"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-ink-brown-soft">
          Tagline (1 phrase courte affichée à côté du label)
        </span>
        <input
          type="text"
          value={draft.tagline}
          onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
          placeholder="Démolir une croyance, donner la voie propre"
          className="px-3 py-2 rounded-md bg-white border border-olive/30 text-sm text-ink-brown focus:outline-none focus:border-olive"
          required
          maxLength={160}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-ink-brown-soft">
          Brief (markdown — injecté dans le prompt envoyé à Claude)
        </span>
        <textarea
          value={draft.brief}
          onChange={(e) => setDraft({ ...draft, brief: e.target.value })}
          placeholder={BRIEF_PLACEHOLDER}
          rows={14}
          className="px-3 py-2 rounded-md bg-white border border-olive/30 text-sm text-ink-brown font-mono leading-relaxed focus:outline-none focus:border-olive"
          required
        />
        <span className="text-[11px] text-ink-brown-soft">
          Indique : job narratif, séquence attendue (types de slides), ton, tags privilégiés, et éventuellement les types interdits.
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={disabled}
          className="px-5 py-2.5 rounded-md bg-olive text-white text-sm font-semibold tracking-wide hover:bg-olive-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="px-5 py-2.5 rounded-md bg-white border border-olive/30 text-ink-brown text-sm font-semibold tracking-wide hover:bg-cream-soft disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
