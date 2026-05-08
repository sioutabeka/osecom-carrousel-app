# Siouta Carrousel — Template

> Template Next.js pour générer des carrousels Instagram à partir d'articles, via Claude.

**Ce repo n'est pas une app à déployer en l'état** — c'est un point de départ qu'on **forke pour chaque client** et qu'on personnalise (charte graphique, voix, articles, fonds).

Pour la **checklist de personnalisation** : voir [`TEMPLATE.md`](./TEMPLATE.md).

---

## Stack

- **Next.js 15** (App Router, Server Components par défaut)
- **React 19**, **TypeScript 5**
- **Tailwind 3** + tokens custom
- **Zod** — validation des outputs Claude
- **Playwright** — export PNG des slides
- **Claude Code CLI** (`claude -p`) — appelé en sous-processus, pas via API

Aucune base de données, aucun runtime client lourd.

---

## Démarrage rapide

Prérequis : Node 18+, [Claude Code CLI](https://claude.com/claude-code) installé.

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000 — tu verras 2 articles d'exemple. Clique sur l'un, puis sur **« Générer le carrousel »**. Claude réfléchit ~45s puis renvoie un carrousel structuré.

---

## Ce que l'app fait (out-of-the-box)

- Liste les articles depuis `data/articles.json`
- Génère un carrousel structuré (5-10 slides) via Claude
- Affiche les slides avec édition **inline** (clic sur un texte = modifier)
- Picker de **thèmes de fond** (paire cover + cta) avec upload depuis l'UI
- Export **PNG** des slides (1080×1350, retina) via Playwright

## Ce que tu dois personnaliser pour un client

→ voir [`TEMPLATE.md`](./TEMPLATE.md). Résumé : 8 fichiers / dossiers à modifier.

## Architecture

→ voir [`ARCHITECTURE.md`](./ARCHITECTURE.md).
