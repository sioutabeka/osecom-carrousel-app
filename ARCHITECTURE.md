# Architecture — Carrousel Studio (template)

Doc technique du moteur partagé entre les apps clients dérivées de ce template.

> Pour la **vision multi-clients** : voir [`STRATEGY.md`](./STRATEGY.md).
> Pour la **checklist de personnalisation** : voir [`TEMPLATE.md`](./TEMPLATE.md).

## Stack

- **Next.js 15** (App Router, Server Components par défaut)
- **React 19**
- **TypeScript**
- **Tailwind CSS 3** + tokens custom dans `tailwind.config.ts`
- **Zod** — validation des outputs Claude
- **Claude Code CLI** (`claude -p`) — appelé en sous-processus, pas via SDK API. Pas de clé API requise.
- **Playwright** — export PNG des slides server-side

Aucune base de données. Tout est SSR + composants client uniquement pour les UI interactives (édition inline, picker de thèmes).

## Arborescence

```
siouta-carrousel-template/
├── app/
│   ├── layout.tsx               # Root layout, charge les Google Fonts
│   ├── page.tsx                 # Home — sidebar + écran d'accueil
│   ├── globals.css              # Tailwind + tokens CSS
│   ├── editor/[slug]/page.tsx   # Page éditeur d'un article
│   ├── print/[slug]/page.tsx    # Page print pour Playwright (sans UI)
│   ├── api/
│   │   ├── extract/route.ts     # POST → appelle Claude → carrousel JSON
│   │   ├── export/route.ts      # POST → Playwright → PNGs
│   │   └── bg/themes/route.ts   # GET liste / POST upload thème
│   └── _components/
│       ├── Sidebar.tsx          # client — recherche + arbo articles
│       ├── ExtractButton.tsx    # client — orchestration generate/edit/export
│       ├── Carousel.tsx         # client — rendu + édition des slides
│       ├── carousel.css         # styles spécifiques aux slides
│       ├── EditableText.tsx    # client — édition inline auto-resize
│       ├── ThemePicker.tsx      # client — picker thèmes + upload
│       └── RichText.tsx         # parser maison `*italic*` / `**bold**`
├── lib/
│   ├── articles.ts              # lecture data/articles*.json (cached en RAM)
│   ├── claude.ts                # spawn `claude -p` + parse JSON envelope
│   ├── prompts/extract.ts       # BRAND_VOICE + FEW_SHOT + tool schema
│   ├── schemas.ts               # Zod schemas (CarouselDraft, Slide…)
│   ├── types.ts                 # types Article / ArticleIndex
│   ├── themes.ts                # scan + create themes
│   ├── draft-cache.ts           # cache des drafts entre /api/extract et /print
│   └── render.ts                # stub (pas implémenté)
├── data/                        # articles.json + articles-index.json (par client)
├── public/bg/                   # fonds (1 body partagé + N thèmes cover/cta)
│   ├── body.png
│   └── themes/
│       └── default/{cover,cta}.png
├── tailwind.config.ts           # tokens couleurs/typo de la charte
├── TEMPLATE.md                  # checklist de customisation (8 étapes)
├── STRATEGY.md                  # vision multi-clients
├── next.config.mjs
├── tsconfig.json                # paths alias `@/*` → racine
└── .env.example                 # CLAUDE_BIN (optionnel)
```

## Data flow — génération

```
[user clique « Générer le carrousel »]
        │
        ▼
ExtractButton.tsx (client)
        │  fetch POST /api/extract { slug }
        ▼
app/api/extract/route.ts
        │  getArticle(slug)  ← lib/articles.ts (cache RAM)
        │  extractCarousel(article)  ← lib/prompts/extract.ts
        ▼
lib/claude.ts: callClaude()
        │  spawn `claude -p --json-schema … --system-prompt … --disallowed-tools …`
        │  stdin = userMessage (article + sections)
        │  cwd = /tmp (évite l'auto-discovery de CLAUDE.md)
        ▼
Claude CLI → stdout JSON envelope
        │  { is_error, structured_output, … }
        ▼
Parse + validation Zod (CarouselDraft)
        ▼
Retour API → setDraft() côté client
        ▼
<Carousel draft={draft} editable /> rend les 5-10 slides éditables
```

## Data flow — export PNG

```
[user clique « Sauvegarder en PNG »]
        │
        ▼
ExtractButton.tsx
        │  fetch POST /api/export { slug, draft }
        ▼
app/api/export/route.ts
        │  writeDraft(slug, draft) → /tmp/carrousel-template-drafts/{slug}.json
        │  Playwright lance chromium headless
        ▼
chromium charge http://localhost:3000/print/{slug}
        │  /print/[slug] lit le draft du cache
        │  rend <Carousel draft /> sans UI
        ▼
locator(".cs-slide").screenshot() → 1 PNG par slide
        ▼
Écrit dans OUTPUT_BASE/{slug}/slide-NN.png
```

## Conventions clés

### Pas de SDK Anthropic, pas de clé API

`lib/claude.ts` lance `claude -p` via `child_process.spawn`. Le binaire est récupéré depuis `process.env.CLAUDE_BIN` (défaut : `claude` dans le PATH). C'est une décision volontaire — l'utilisateur a déjà le CLI, on évite la gestion de secrets.

Conséquences :
- L'app **ne tournera pas** sur un serveur sans CLI Claude (pas de Vercel sans config custom).
- `cwd: os.tmpdir()` dans le spawn évite que Claude pick up un `CLAUDE.md` parent.
- `--disallowed-tools` bloque tous les outils (Bash, Edit, Read…) pour forcer un mode pure-text generation.
- Timeout dur à 120s.

### Output structuré via tool schema

Le prompt définit un **JSON schema** (`TOOL_SCHEMA` dans `lib/prompts/extract.ts`) passé à `--json-schema`. Le schéma JSON est **permissif** (tous les champs optionnels sauf `type`) parce que Claude gère mal les `oneOf` complexes. La **validation stricte** se fait côté Zod (`CarouselDraft` = discriminated union sur `type`).

Si Zod rejette, l'erreur remonte jusqu'à l'UI avec le détail. C'est volontaire — on préfère échouer fort plutôt que rendre une slide à moitié cassée.

### RichText markers

`*x*` → `<em>` (italique éditoriale)
`**x**` → `<strong>` (bold)

Parser maison dans `RichText.tsx` (~30 lignes). Pas de markdown complet, pas de lib externe — on ne veut que ces deux marqueurs.

### Données articles

- Source unique : `data/articles.json` (par client)
- Cache module-level (`_indexCache`, `_articlesCache`) — relu une seule fois par worker. En dev, `next dev` recharge sur changement de fichier.
- Format documenté dans `lib/types.ts` (`Article`, `ArticleIndex`)

### Système de thèmes

Un **thème** = une paire (cover, cta) de PNGs partageant la même identité visuelle. Le fond `body.png` est partagé entre tous les thèmes (un seul fond pour les slides intermédiaires).

Stockage :
```
public/bg/
├── body.png
└── themes/
    ├── default/{cover,cta}.png
    └── theme-X/{cover,cta}.png
```

Le scan se fait à la volée (`lib/themes.ts`). Pas de manifest — chaque sous-dossier de `themes/` est un thème, et doit contenir `cover.png` + `cta.png`.

L'utilisateur peut uploader un nouveau thème via l'interface (`+ ajouter un thème` → endpoint `POST /api/bg/themes` multipart).

Le choix du thème est stocké dans `CarouselDraft.theme` et appliqué via CSS variables `--cs-cover` et `--cs-cta` injectées sur `.cs-deck`.

### Slide types

6 types discriminés sur `type` : `cover` | `body` | `method` | `steps` | `donts` | `cta`.

Chaque type a son propre schéma Zod **et** son propre composant React dans `Carousel.tsx`. Ajouter un type = toucher 3 endroits :
1. Nouveau schéma dans `lib/schemas.ts` (+ ajouter à `discriminatedUnion`).
2. Nouveau composant + case dans `Carousel.tsx` `SlideRenderer`.
3. Description du type dans le prompt système (`BRAND_VOICE`).

### Design tokens

À synchroniser à la main entre :
- `tailwind.config.ts` (utilitaires Tailwind : `bg-night`, `text-blue-dark`, `font-display`, …)
- `app/globals.css` (variables CSS)
- `app/_components/carousel.css` (styles de slides — couleurs hex et fonts hardcodées)

## Composants client vs serveur

Par défaut tout est Server Component (Next 15 App Router).
Marqués `"use client"` :
- `ExtractButton.tsx` — `useState` pour loading/draft/error/editing.
- `Sidebar.tsx` — `useState` pour search query et tags ouverts.
- `Carousel.tsx` — utilise `EditableText` interactif, donc client.
- `EditableText.tsx`, `ThemePicker.tsx` — UI interactive.

## Limites / TODOs connus

- **`lib/render.ts` est un stub** — pas implémenté. L'export PNG passe par `app/api/export/route.ts` (Playwright + page `/print/[slug]`).
- **Pas de persistance long-terme des drafts** — le cache est dans `/tmp` (perdu au redémarrage). Suffit pour le workflow actuel.
- **Pas de tests** (ni unit, ni E2E).
- **Le `BRAND_VOICE` du prompt est volumineux** (~1.5K tokens à chaque appel). Pas de cache prompt côté CLI — pourrait être optimisé si on bascule vers le SDK Anthropic avec `cache_control`.
- **Bug Zod "steps min 5"** — voir `STRATEGY.md` §9.2 pour le diagnostic et le fix recommandé.

## Variables d'environnement

| Variable     | Défaut    | Rôle                                       |
| ------------ | --------- | ------------------------------------------ |
| `CLAUDE_BIN` | `claude`  | Chemin vers le binaire Claude Code CLI     |

Aucune autre variable. Pas de clé API.

## Scripts npm

| Script           | Action                                |
| ---------------- | ------------------------------------- |
| `npm run dev`    | `next dev` — hot reload sur :3000     |
| `npm run build`  | `next build` — build prod             |
| `npm run start`  | `next start` — serve build prod       |

Pas de lint, pas de format, pas de test (à ajouter si on industrialise).
