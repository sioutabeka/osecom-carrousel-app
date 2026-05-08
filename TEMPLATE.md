# Template — Carrousel Studio

Ce repo est un **template** pour construire un studio de génération de carrousels Instagram pour un client donné, à partir de Claude. Il n'est **pas** destiné à être déployé tel quel — il faut le forker et le personnaliser pour chaque client.

## Démarrage pour un nouveau client

```bash
git clone https://github.com/sioutabeka/siouta-carrousel-template.git mon-client-app
cd mon-client-app
rm -rf .git
git init -b main
npm install
npm run dev
```

Ouvre http://localhost:3000 — tu verras 2 articles d'exemple. Génère-en un pour vérifier que tout marche, puis suis la checklist ci-dessous.

## Checklist de customisation (8 étapes)

Suis dans l'ordre. Tout ce qui est marqué `À PERSONNALISER` dans le code est listé ici.

### 1. `package.json` + `package-lock.json`
- `name` → `mon-client-app` ou similaire
- `description` → courte description du studio

### 2. `app/layout.tsx`
- `metadata.title` → "Nom du client — Carrousel Studio"
- `metadata.description`
- `<link href="...fonts.googleapis.com/css2?...">` → remplacer par les **fonts Google de la charte du client**

### 3. `tailwind.config.ts`
- `theme.extend.colors` → palette du client (les tokens `night`, `blue`, `accent`, etc.)
- `theme.extend.fontFamily` → fonts de la charte (alignées avec celles importées dans `layout.tsx`)

### 4. `app/_components/carousel.css`
- Toutes les couleurs hex codées (`#0a2540`, `#0f6eb5`, `#f5c518`, etc.) → matcher `tailwind.config.ts`
- Les `font-family` hardcodées → matcher les fonts de la charte
- Si la **mise en page** doit changer (positions, tailles, gouttières), c'est ici

### 5. `app/_components/Carousel.tsx`
- `ADDRESSES` (lignes ~17-21) → adresses des points de vente du client
- `FOOTER_LABEL` → "Nos pressings" / "Nos boutiques" / "Nos cabinets"…
- `FOOTER_SIDE` → tagline du client

### 6. `lib/prompts/extract.ts` ← **le plus important**
- `BRAND_VOICE` → voix de marque détaillée du client (artisan / corporate / pédagogue…)
- `FEW_SHOT` → 2-3 exemples concrets de carrousels validés pour ce client

> ⚠️ Sans exemples concrets adaptés au client, Claude produit des carrousels génériques. Le `FEW_SHOT` est le levier qualité numéro 1 du projet. Investis du temps dessus — récupère des carrousels déjà publiés et reverse-engineer-les en JSON.

### 7. `data/articles.json` + `data/articles-index.json`
- Remplacer par les vrais articles du client
- Format documenté dans `lib/types.ts` (interface `Article`, `ArticleIndex`)
- Si le client a déjà un repo d'articles à part, tu peux faire un symlink :
  ```bash
  rm -rf data && ln -s /chemin/vers/articles-du-client data
  ```

### 8. `public/bg/`
- `body.png` → fond commun à toutes les slides intermédiaires (1080×1350 PNG)
- `themes/default/cover.png` + `themes/default/cta.png` → fonds par défaut du thème par défaut
- D'autres thèmes peuvent être ajoutés depuis l'interface (bouton "+ ajouter un thème")

## Ce qu'il vaut mieux **ne pas** toucher (le moteur)

Ces fichiers contiennent la logique générique. Évite de les éditer sauf si tu sais ce que tu fais — les mises à jour futures du template seront plus faciles à intégrer si tu n'y touches pas :

- `lib/claude.ts` — pont vers le CLI Claude
- `lib/draft-cache.ts` — cache des drafts entre `/api/extract` et `/print`
- `lib/schemas.ts` — schémas Zod des slides
- `lib/themes.ts` — gestion des thèmes de fond
- `lib/articles.ts` — chargement des articles
- `app/api/extract/route.ts` — endpoint de génération
- `app/api/export/route.ts` — endpoint d'export PNG via Playwright
- `app/api/bg/themes/route.ts` — endpoint de gestion des thèmes
- `app/_components/EditableText.tsx` — édition inline des slides
- `app/_components/ThemePicker.tsx` — picker de thèmes
- `app/_components/RichText.tsx` — parser des marqueurs `*italique*` / `**bold**`
- `app/_components/Sidebar.tsx` — navigation des articles
- `app/_components/ExtractButton.tsx` — orchestration côté client

## Push sur GitHub

```bash
gh repo create sioutabeka/mon-client-app --private --source=. --push
```

(ou via UI GitHub puis `git remote add origin <URL> && git push -u origin main`)

## Liens

- Premier client implémenté (Bel & Blanc) : https://github.com/sioutabeka/bel-blanc-carrousel-app
