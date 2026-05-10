# Handoff — Sessions carrousels

> **Pour Claude (et toi)** : ce fichier permet de reprendre exactement où on s'est arrêté. Lis-le en premier, puis attaque la prochaine session.

---

## Où on en est (mise à jour 2026-05-10)

### Sessions passées

**2026-05-08 — Plomberie + handoff** : app fonctionnelle end-to-end, 6 articles chargés, système de thèmes, premier commit pushé. Doc client `PREVIEW.md` + 9 PNG du carrousel exemple.

**2026-05-09 — Articles + redesign visuel des slides** :
- 24 articles ajoutés (de 6 → **30**) couvrant 5 nouvelles catégories : Social Media, Copywriting, Acquisition & Funnel, Performance & Analyse, Positionnement Expert. Voir `data/articles-source.json` + script `scripts/merge-articles.mjs` (pipeline `node scripts/convert-articles.mjs`).
- Redesign visuel des slides (palette + typos préservées) :
  - ♥ remplace le dot rose à halo (footer cover/CTA + action body)
  - ★ remplace la barre olive du tag eyebrow
  - Encadré testbox arrondi (radius 14px) avec label déplacé à droite en pastille pilule légèrement tiltée (-2°) pour un disrupt pattern
  - Tous les traits séparateurs retirés (footer cover, action body, step-rows)
  - Cadre translucide blanc cassé étendu à toutes les body slides (était réservé à cover/CTA), élargi (top/bottom 8 %, left/right 7 %) pour donner plus d'air
- Mécanique anti-débordement : composant `FitToParent` dans `Carousel.tsx` qui mesure et applique un `transform: scale()` proportionnel uniquement quand le contenu déborde sa zone. Aucune coupure de texte, juste compression visuelle douce. ResizeObserver + `document.fonts.ready` pour re-mesurer après chargement async des polices. Wrappe `Body`, `Method`, `Steps`, `Donts`.
- `next.config.mjs` : `devIndicators: false` → retire le badge "N" Next.js qui apparaissait sur les exports d'images.
- 2 scripts debug : `scripts/debug-fit.mjs` (Playwright qui inspecte chaque slide, flag overflow + scale appliqué) et `scripts/screenshot-slide.mjs` (screenshot ciblé d'une slide).

**2026-05-10 — Patterns narratifs CRUD** :
- Constat utilisateur : *"c'est rébarbatif pour les consommateurs, tous les carrousels se ressemblent"*. Décision : casser la monotonie **narrative** (le visuel reste validé), pas modifier le composant React.
- Ajustements `BRAND_VOICE` faits par l'utilisateur dans `lib/prompts/extract.ts` : passage *"agence"* → *"freelance de communication digitale, growth, community manager en tirant le meilleur de l'ia et de la tech"*. Ajout d'une consigne *"multi-hook tt au long et pose des questions en titre que se pose la cible"*. `body.title` redéfini en *"question en forme de hook catchy"* (avant : *"reformulation forte de l'idée"*).
- 4 patterns narratifs définis avec brief structuré (job narratif, séquence attendue, ton, tags privilégiés, parfois des interdits) :
  - `piege-mecanique` — démolir une croyance, donner la voie propre
  - `manifesto` — poser une vision, défendre un parti pris (interdit `method`/`steps`)
  - `comparatif` — opposer ancien monde vs nouveau monde
  - `story` — raconter un récit (cas client, retour d'expérience)
- L'éditeur **choisit le pattern par carrousel** dans un dropdown sur `/editor/<slug>` (rejeté : Claude choisit auto, alea pondéré, hybride). Le brief du pattern est injecté en haut du user message envoyé à Claude.
- **CRUD complet via UI** sur `/patterns` (cohérent avec le système de thèmes) :
  - Store fichier `data/patterns.json` avec auto-seed (`lib/patterns-store.ts` server-only)
  - Routes API `app/api/patterns/route.ts` (GET/POST) + `app/api/patterns/[id]/route.ts` (GET/PUT/DELETE)
  - Page `app/patterns/page.tsx` + composant client `_PatternsManager.tsx` : liste cards, form création (slug auto depuis label, label/tagline/brief markdown), édition inline, suppression avec `confirm()` (bloquée si dernier pattern restant, 403)
  - `ExtractButton.tsx` fetch `/api/patterns` au mount, dropdown dynamique, lien "gérer" vers `/patterns`
- Validation Zod stricte : `id` kebab-case regex, `label` ≤ 80, `tagline` ≤ 160, `brief` ≥ 20 caractères, `id` immutable après création.

État repo après push :
- `<sha-à-remplir>` patterns: voix freelance + 4 patterns narratifs en CRUD
- `1ef1072` themes: add jn, k, k-k, k-k-k + handoff doc update
- `3c9a119` themes: add test, test2, test3 background sets
- `87b2ae4` slides: redesign visuel + auto-fit overflow
- `529658b` content: add 24 articles (IDs 7-30)
- Tout pushé sur `origin/main` (`sioutabeka/osecom-carrousel-app`, privé).

### Ce qui reste à creuser visuellement

- **Cover et CTA** n'ont pas eu de refonte structurelle dans cette session — ils gardent le glassmorphism de la première itération. Si on veut leur donner un traitement plus distinctif que les body, c'est un chantier ouvert.
- **Method / Steps / Donts** ont tous le même cadre translucide. Leur donner 3 personnalités distinctes (numéros décoratifs / ligne typo éditoriale / treatment manifesto) reste un objectif possible.
- Le **redesign visuel actuel est validé par l'utilisateur** ; on n'y revient pas sauf demande explicite.

---

## Prochaine session — Tester la variabilité réelle des patterns + itérer

### Tâche immédiate

**Tester les 4 patterns actuels sur 3 articles différents** pour vérifier qu'ils produisent bien des carrousels narrativement distincts (pas juste des reformulations cosmétiques du même squelette).

Méthode :
1. Choisir 3 articles couvrant 3 angles : un "explicatif" (`transformer-contenu-en-clients`), un "erreurs" (`7-erreurs-empechent-convertir`), un "stratégique" (`strategie-contenu-orientee-business`).
2. Pour chacun, générer 2-3 patterns différents et comparer côte à côte. Si manifesto et piege-mecanique sortent presque pareil → resserrer les briefs (interdire plus explicitement certains types de slides, forcer des contraintes structurelles plus fortes).
3. Valider avec l'utilisateur : est-ce qu'un consommateur Insta percevrait la différence entre 2 carrousels du même article avec 2 patterns ?

### Pistes à explorer ensuite (BRAND_VOICE + schéma)

Une fois les patterns validés, le chantier prompts plus large reste ouvert :

- **Affiner les directives par type de slide** : longueur des titres, ton, structure narrative attendue. Aujourd'hui c'est dans le BRAND_VOICE en bloc, dense — on pourrait faire des directives ciblées.
- **Rendre les types de slides plus distinctifs** : aujourd'hui method et steps se ressemblent narrativement (juste 2-3 vs 4-8 étapes). Donner à chacun un *job narratif* différent (method = framework conceptuel, steps = checklist opérationnelle, donts = anti-patterns à fuir).
- **Ajouter de nouveaux types ?** : si l'utilisateur veut introduire des templates supplémentaires (ex : `quote` pour citation, `stat` pour donnée chiffrée, `compare` pour avant/après), c'est ici qu'on l'ajoute. **Impact** : il faudrait alors aussi étendre `lib/schemas.ts` ET `app/_components/Carousel.tsx` (composant React + CSS).
- **Voix éditoriale** : peaufiner la voix Osecom dans le prompt si l'utilisateur trouve que les sorties Claude sont trop génériques ou trop "Claude" dans la formulation.
- **Tags textuels** : aujourd'hui Claude peut générer n'importe quel tag (`LE PIÈGE`, `LA MÉTHODE`…). On pourrait les contraindre à une liste finie pour homogénéiser le carrousel global, ou au contraire les laisser libres pour de la variété.
- **Markers riches** (`*italique*`, `**gras**`) : aujourd'hui autorisés à 1-2 par slide. Si l'utilisateur veut plus / moins / autre chose (ex : underline, small caps), c'est ici.

**Note manifesto** : pattern qui empile 3-4 body d'affilée. Aujourd'hui toutes les body partagent le même cadre visuel → risque de monotonie visuelle même quand le narratif est varié. Si l'utilisateur valide narrativement le manifesto mais trouve le rendu visuel trop répétitif, c'est un follow-up "session visuelle" (composer plusieurs variantes de body slides).

### Map des fichiers pour cette session

| Fichier | Rôle | Notes |
|---|---|---|
| `lib/patterns.ts` | Types + Zod + seeds + slugify | Importable client + serveur. Le brief réel des patterns vit dans `data/patterns.json`, pas ici. |
| `lib/patterns-store.ts` | FS CRUD server-only | Fonctions `list/get/create/update/delete`. Auto-seed à la 1ère lecture. |
| `data/patterns.json` | Briefs réels des patterns | Source de vérité runtime. Modifiable via UI `/patterns` ou directement à la main. |
| `app/patterns/_PatternsManager.tsx` | UI CRUD | Liste cards + form édition inline. |
| `lib/prompts/extract.ts` | `BRAND_VOICE` + section "Patterns narratifs" | Le brief du pattern choisi est injecté en haut du user message. |
| `lib/schemas.ts` | Schéma Zod des slides | 90 lignes. À toucher si on ajoute un type de slide ou un champ. |
| `app/_components/Carousel.tsx` | Composants React qui rendent les slides | À toucher uniquement si on ajoute/modifie un type de slide. |
| `data/articles-source.json` | 30 articles bruts — bonne diversité (6 catégories) | Lecture uniquement. |

### Méthode suggérée pour la prochaine session

1. **Test variabilité** : 3 articles × 2-3 patterns chacun. L'utilisateur juge si la différence est perceptible.
2. **Itération briefs** : si un pattern converge vers un autre, resserrer son brief via `/patterns` (édition directe en UI, pas de redémarrage).
3. **Diagnostic** : pour chaque problème, identifier si c'est BRAND_VOICE général, brief de pattern spécifique, ou un type de slide.
4. **Commits granulaires** : 1 commit par direction validée (ex : "patterns: durcir interdits manifesto").

---

## Contraintes (toujours valables)

| Aspect | Contrainte |
|---|---|
| **Palette** | INTOUCHABLE — `#3C2015` brun, `#828234` olive, `#EA609F` rose, `#F4EDC6` beige doré, `#FFFDF8` ivoire |
| **Fonts** | INTOUCHABLES — Fraunces (serif) + Public Sans (sans) |
| **Compositions visuelles** | Validées dans la session du 2026-05-09. Ne pas y revenir sauf demande. |
| **Voix éditoriale Osecom** | Direct, structuré, didactique, tutoyé. *Pose le piège, donne la mécanique, conclus sur l'action.* Format **multi-hook** : pose des questions en titre que se pose la cible (cf. modif `BRAND_VOICE` 2026-05-10). Positionnement : freelance, pas agence. |
| **Patterns narratifs** | Choix obligatoire par carrousel parmi `data/patterns.json` (4 seedés : piege-mecanique, manifesto, comparatif, story). Nouveaux patterns créables via `/patterns`. |

---

## Comment voir le résultat en live

URL la plus pratique pendant le travail sur les prompts : `/editor/<slug>`, qui permet de choisir un pattern dans le dropdown puis cliquer "Générer le carrousel" et voir le résultat avec édition inline. Pour un rendu propre (sans sidebar), `/print/<slug>` (lit le draft du cache). Pour gérer les patterns : `/patterns` (créer / éditer / supprimer).

```bash
# démarrer le dev server
cd ~/dev/osecom-app
npm run dev   # http://localhost:3000

# vider le cache d'un draft pour forcer une re-génération
rm "$TMPDIR/carrousel-template-drafts/<slug>.json"

# lister les drafts en cache
ls "$TMPDIR/carrousel-template-drafts/"
```

Drafts probablement déjà en cache au démarrage de la prochaine session :
- `transformer-contenu-en-clients`
- `strategie-contenu-orientee-business`
- `7-erreurs-empechent-convertir`

30 slugs disponibles dans `data/articles-source.json` pour générer plus de variété.

### Scripts utiles

```bash
# debug auto-fit sur un slug
node scripts/debug-fit.mjs <slug>

# screenshot d'une slide précise (1-based index)
node scripts/screenshot-slide.mjs <slug> 5
```

---

## Préférences utilisateur (signaux observés)

### Ce qui marche

- Approche **slide par slide / changement par changement**, validation à chaque étape
- **Code et montre** : préfère voir le résultat en live plutôt que des descriptions abstraites
- **Branche de test** avant gros chantier visuel, **fast-forward merge** quand tout est validé
- Commits granulaires avec messages descriptifs (commit `87b2ae4` apprécié comme template)
- Demander confirmation avant un push (`git push` doit être explicitement validé)

### Ce qui agace

- Les longues pages d'explication abstraites sans action concrète
- Les questions ouvertes en série — proposer 2-3 options concrètes à choisir > "qu'est-ce que tu veux"
- Les solutions "couper le contenu" (`overflow: hidden` sans réflexion sur la cause)
- Faire des modifications larges sans validation préalable
- Les références aux tics "claude code" / "AI app" : eyebrow chips, dots à halo, italique en couleur d'accent, glassmorphism trop marqué, etc. → **palette + typo préservées mais composition à éloigner du look IA-app par défaut**

### Style de communication préféré

- Réponses **courtes et directes** (le user fait des tests un par un)
- Quand une question est nécessaire, utiliser `AskUserQuestion` avec 2-3 options claires plutôt qu'une question texte ouverte
- Diagnostic technique précis quand quelque chose ne marche pas (ex : Playwright pour debug à la place de l'utilisateur)
- Rolling back propre quand demandé (`git checkout`, `git restore`, `git branch -D`)

---

## Démarrage rapide

```bash
cd ~/dev/osecom-app
git pull                    # synchroniser au cas où
npm run dev                 # démarre Next.js sur :3000
# vérifier l'état git :
git log --oneline -5
git status
```

Si le dev server tourne déjà depuis hier, vérifier que les modifs hot-reloadent (Next.js le fait normalement). En cas de doute, `pkill -f "next dev"` puis relancer.

---

## Mini-FAQ

**Q : Je dois lire quoi avant de coder sur les prompts ?**
1. Ce fichier (tu y es)
2. `lib/prompts/extract.ts` (le prompt actuel)
3. `lib/schemas.ts` (les contraintes Zod)
4. 2-3 articles dans `data/articles-source.json` pour avoir le matériau d'entrée en tête

**Q : Régénérer un carrousel pour test ?**
```bash
# via l'UI : aller sur http://localhost:3000/editor/<slug> et cliquer "Générer"
# via curl direct (sans cache) :
rm "$TMPDIR/carrousel-template-drafts/<slug>.json" 2>/dev/null
curl -s -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"slug":"<slug>"}' | jq .draft
```

**Q : Comment rollback proprement si une session déraille ?**
```bash
# si commits déjà faits :
git log --oneline                  # repérer le sha bon
git reset --hard <sha>             # ⚠ destructif, ne push pas après si déjà push

# si pas encore commit :
git restore .                      # annule tous les changements tracked
git clean -fd                      # supprime les untracked (⚠ vérifier avant)
```

**Q : Y a-t-il une CI / des tests à respecter ?**
Pas de CI configurée à ce stade. Pas de tests automatisés. La validation se fait au visuel + via les scripts debug Playwright (`scripts/debug-fit.mjs`).

---

## Avant de commencer la session prompts — questions à poser à l'utilisateur

1. **Tu veux qu'on parte d'un audit** (générer 2-3 carrousels et observer ensemble) ou tu as déjà un grief précis sur le prompt actuel ?
2. **Y a-t-il un type de slide qui te semble particulièrement à retravailler** (cover, body, method, steps, donts, cta) ?
3. **As-tu en tête de nouveaux types de slides** à ajouter (citation, stat chiffrée, comparatif, etc.) ou on reste sur les 6 actuels ?
4. **Veux-tu contraindre les tags** (liste finie d'étiquettes possibles) ou les laisser libres comme aujourd'hui ?
