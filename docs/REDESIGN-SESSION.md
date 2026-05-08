# Handoff — Session redesign carrousels

> **Pour Claude (et toi)** : ce fichier permet de reprendre exactement où on s'est arrêté le 2026-05-08. Lis-le en premier, puis attaque la cover.

---

## TL;DR de la situation

- App **fonctionne** end-to-end : génération Claude (~45s) → édition inline → export PNG → ouverture Finder
- 6 articles chargés (catégorie *Stratégie & Positionnement*) dans `data/articles-source.json`
- Système de thèmes complet : upload set cover+body+cta, supprimer un thème, fallback fond ivoire si pas de body image
- 1er commit pushé sur `main` (`sioutabeka/osecom-carrousel-app`, **privé**)
- Doc client `PREVIEW.md` + 9 PNG du carrousel exemple à la racine du repo

**Ce qui est PAS fait** : le **redesign visuel des slides**. C'est l'objet de cette session.

---

## Le problème à résoudre

Quand l'utilisateur regarde les slides générées (cf. `PREVIEW.md`), il dit :

> *"je trouve que c'est trop claude code, on reconnait ton design direct ce qui retire la personnalité de la marque"*

**Pas un problème de palette ni de fonts** — l'utilisateur a explicitement dit *"garde les couleurs du client"*. Ce qu'il faut changer : les **compositions** des slides, qui sont prévisibles (toutes le même squelette habillé différemment).

---

## Les contraintes (à respecter)

| Aspect | Contrainte |
|---|---|
| **Palette** | INTOUCHABLE — `#3C2015` brun, `#828234` olive, `#EA609F` rose, `#F4EDC6` beige doré, `#FFFDF8` ivoire |
| **Fonts** | INTOUCHABLES — Fraunces (serif) + Public Sans (sans) |
| **Voix éditoriale** | Hors scope — c'est l'objet du `BRAND_VOICE` dans `lib/prompts/extract.ts` |
| **Champs des slides (schéma Zod)** | Hors scope — `lib/schemas.ts`. Si on les change, refaire `BRAND_VOICE` ET `Carousel.tsx` |
| **Layouts / compositions** | C'est CE QU'ON CHANGE |

---

## Diagnostic posé

### Pattern générique repéré

Toutes les slides suivent le même squelette : `tag pill + titre géant + contenu vertical empilé + action en footer`. C'est ce qui les fait toutes se ressembler.

### Observations ciblées (issues de la session du 8 mai)

1. **Hiérarchie inversée cover/body** — la cover fait 108px et les body font 116px. Inversement : la cover devrait dominer. Fix simple : cover → 120px, body → 100px (s2: 84, s3: 72).
2. **Glassmorphism daté** sur le hook (cover/cta) — `backdrop-filter: blur(32px)` + ombre 60px + bordure olive + radius 16. C'est l'esthétique iOS 2018-2020. Aller vers : carte solide cream, ombre subtile, bordure fine.
3. **Slide donts trop saturée en rose** — fond rose pâle + croix rose + bordure rose 6px à chaque entry. La slide se neutralise. Adoucir : croix brune ou olive, garder la barre rose comme accent unique.

### Patterns à casser pour gagner en personnalité

- Cover/CTA **symétriques** (même hook block) → leur donner 2 traitements distincts
- Method/Steps/Donts = **3 variantes d'une même grille** → leur donner 3 personnalités (numéros énormes décoratifs / ligne typographique éditoriale / treatment manifesto)
- Body = **un seul layout** quel que soit le contenu → 2-3 variantes selon que la slide a un testbox / une preuve / une idée pure
- **Image full + carte translucide bottom-right** sur cover/cta → c'est le template Pinterest 2023. Essayer : split asymétrique, cover tout-typo, cover avec marge éditoriale (titre dans la marge, image inset)

---

## La méthode convenue

**Slide par slide.** Pour chacune :

1. Proposer **2-3 layouts** distinctifs (description courte + esquisse mentale)
2. L'utilisateur pointe celui qui l'intéresse
3. Coder dans `app/_components/Carousel.tsx` + `app/_components/carousel.css`
4. L'utilisateur voit en live via `/print/<slug>` (fond blanc, sans sidebar, format Insta direct)
5. Si ça passe → `git commit` ; si ça casse → `git checkout .` et autre proposition
6. On passe à la slide suivante

**Ordre suggéré** (à confirmer avec l'utilisateur en début de session) :

1. **cover** (hook = ton du carrousel — si elle est forte, le reste hérite de l'énergie)
2. **cta** (en miroir de la cover, traitement distinct)
3. **body** (le format majoritaire, 4-6 slides par carrousel)
4. **method / steps / donts** (les 3 listes — leur donner 3 personnalités)

---

## Map des fichiers à toucher

| Fichier | Rôle | Lignes pertinentes |
|---|---|---|
| `app/_components/Carousel.tsx` | Rendu React, 6 composants `Cover` / `Body` / `Method` / `Steps` / `Donts` / `Cta` | `Cover` ln 96, `Cta` ln 120, `Body` ln 233, `Method` ln 296, `Steps` ln 360, `Donts` ln 424 |
| `app/_components/carousel.css` | Tous les styles préfixés `cs-`. Découpé en sections par type | Hook (cover/cta) ln 44, Body ln 165, Method ln 289, Steps ln 329, Donts ln 372 |
| `lib/schemas.ts` | Schéma Zod des slides — **NE PAS TOUCHER** sauf si on ajoute un champ | (référence pour comprendre les champs dispo) |

---

## Le checkpoint git

Si on casse quelque chose pendant le redesign, retour au dernier commit propre :

```bash
cd ~/dev/osecom-app
git status                 # voir ce qui est modifié
git checkout .             # tout annuler (uniquement fichiers tracked)
# ou pour un retour total :
git reset --hard HEAD      # ⚠ destructif, perd toutes les modifs non-committées
```

État du repo au début de session :
- Commit `5ce7aa5` — initial commit
- Commit `ed3202a` — `docs: PREVIEW.md` (HEAD au début de la session redesign)
- Branch `main`, tracking `origin/main`

**Stratégie de commits pendant le redesign** : 1 commit par slide validée, pour pouvoir revenir en arrière à granularité fine.

---

## Comment voir le résultat en live

Le moyen le plus rapide pendant le redesign : utiliser la route `/print/<slug>` (fond blanc, sans header ni sidebar, juste les slides en vertical 1080×1350 scaled à 540).

**Drafts déjà en cache** dans `os.tmpdir()/carrousel-template-drafts/` :
- `transformer-contenu-en-clients` (utilisé pour `PREVIEW.md`)
- `strategie-contenu-orientee-business` (autre exemple riche, contient method/steps/donts/cta)

URLs locales (après `npm run dev`) :
- http://localhost:3000/print/transformer-contenu-en-clients
- http://localhost:3000/print/strategie-contenu-orientee-business

Si le cache est vide, il faut soit :
1. Cliquer "Générer le carrousel" dans `/editor/<slug>` puis "Sauvegarder PNG" (ça écrit dans le cache)
2. Ou injecter manuellement un draft dans le cache (cf. `lib/draft-cache.ts:writeDraft`)

---

## Démarrage de la session

```bash
cd ~/dev/osecom-app
git pull                    # au cas où
npm run dev                 # démarre Next.js sur :3000
# vérifier dans une autre fenêtre :
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/print/transformer-contenu-en-clients
# doit renvoyer 200 (sinon le cache est vide → regénérer)
```

Si le dev server tourne déjà depuis hier, vérifier que les nouvelles modifs CSS/TSX sont bien hot-reloadées (Next.js le fait normalement). En cas de doute, kill + restart.

---

## Notes de session

### Ce que l'utilisateur attend

- **Pas un design générique de plus** — il a explicitement repéré que le design actuel est "trop Claude Code"
- **Personnalité** — chaque slide doit avoir son caractère propre, pas être une variante d'un même template
- **Réfs visuelles bienvenues** : si tu veux proposer un layout, dis-le en référence à un magazine/site/agence connue (Bloomberg Businessweek, Linear, Stripe Press, NYT Mag, Monocle, etc.) plutôt qu'en abstrait

### Ce que l'utilisateur n'aime PAS (signaux faibles à éviter)

- Les longues pages d'explication abstraites — il préfère "code et montre"
- Les questions ouvertes en série — proposer 2-3 options concrètes à choisir > "qu'est-ce que tu veux"
- Le glassmorphism / blurred translucent cards (signature template 2022-2024)
- Les "listes de cards" répétitives (toutes les slides ressemblent à des bullet points)

### Ce qu'il aime (à reproduire)

- Approche slide-par-slide avec validation à chaque étape
- Commits granulaires pour rollback facile
- Voir le résultat en live sur `/print/<slug>` plutôt que dans des descriptions

---

## Mini-FAQ pour la nouvelle session

**Q : Je dois lire quoi avant de coder ?**
1. Ce fichier (tu y es)
2. `app/_components/carousel.css` (le design system actuel en CSS)
3. `app/_components/Carousel.tsx` (les 6 composants React)
4. `STRATEGY.md` (contexte business)
5. `PREVIEW.md` (ce que voit le client — référence visuelle)

**Q : Si je veux régénérer un carrousel pour test ?**
```bash
curl -s -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"slug":"transformer-contenu-en-clients"}' \
  -o /tmp/draft.json
# puis injecter dans le cache pour /print :
node -e "const fs=require('fs'),path=require('path'),os=require('os');const d=JSON.parse(fs.readFileSync('/tmp/draft.json','utf8'));fs.mkdirSync(path.join(os.tmpdir(),'carrousel-template-drafts'),{recursive:true});fs.writeFileSync(path.join(os.tmpdir(),'carrousel-template-drafts','transformer-contenu-en-clients.json'),JSON.stringify(d.draft));"
```

**Q : Les fichiers `.png` du carrousel exemple sont où ?**
- Source de vérité : `~/Documents/osecom-carrousel-output/transformer-contenu-en-clients/`
- Copie dans le repo (pour `PREVIEW.md`) : `docs/preview/transformer-contenu-en-clients/`

**Q : Y a-t-il d'autres carrousels prévalidés à référencer ?**
Pas pour l'instant. Seul `transformer-contenu-en-clients` a été exporté en PNG. Si on veut enrichir `PREVIEW.md`, il faudra exporter les autres au fur et à mesure.

---

## Avant de commencer le redesign — questions à poser à l'utilisateur

1. **Tu veux qu'on attaque par la cover** comme on avait dit, ou tu changes d'avis ?
2. **As-tu des réfs visuelles** depuis hier ? (Pinterest, screenshot d'un carrousel que tu kiffes, charte graphique Osecom existante…)
3. **Y a-t-il un logo Osecom** que je devrais intégrer dans la cover ou le footer ? (rien dans `public/` aujourd'hui)
