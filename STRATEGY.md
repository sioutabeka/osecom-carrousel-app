# Stratégie — Carrousel Studio (template)

> ⚠️ **Note de récupération (2026-05-07).** Le `STRATEGY.md` original a été perdu suite à un incident iCloud (stub orphelin non matérialisé). Ce fichier est une **reconstruction** à partir des références dans `CLAUDE.md`, `ARCHITECTURE.md` et `TEMPLATE.md`. Le fond éditorial (vision multi-clients, philosophie fork-per-client) est correct ; les anecdotes et passages narratifs n'ont pas pu être restaurés. À relire et ré-enrichir.

## 1. Le contexte

Carrousel Studio est un outil interne pour transformer des articles de blog en carrousels Instagram (5 à 12 slides), avec une charte visuelle propre au client et une voix éditoriale cohérente.

L'objectif : pouvoir servir **plusieurs clients** (jusqu'à ~6) sans dupliquer le moteur de génération à la main, mais sans non plus tomber dans les pièges classiques d'un système multi-tenant.

## 2. La décision architecturale : fork-per-client

Après brainstorm, la décision retenue est **un repo par client** :

```
siouta-carrousel-template/    ← le moule (ce repo). Jamais utilisé en prod.
bel-blanc-carrousel-app/      ← client 1 — repo séparé
client-2-carrousel-app/       ← client 2 — repo séparé
... jusqu'à ~6 clients
```

Chaque app cliente :
- a son propre dossier local
- a son propre repo GitHub privé (`sioutabeka/{client}-carrousel-app`)
- a son propre historique git, son propre code, sa propre charte
- évolue **indépendamment** du template et des autres clients

## 3. Pourquoi pas multi-tenant

L'alternative classique (un seul repo qui sert N clients via config dynamique) a été écartée pour ces raisons :

- **Charte visuelle riche par client** : couleurs, typos, layouts spécifiques. Une config JSON ne capture pas tout — il y a toujours un détail de CSS qui demande du code.
- **Voix éditoriale par client** : le `BRAND_VOICE` du prompt est volumineux (~1.5K tokens) et contient des règles spécifiques. Le maintenir en data structurée serait pénible.
- **Pas d'effets de bord cross-client** : un fix urgent pour un client ne risque jamais de péter en prod chez un autre.
- **Charge cognitive faible** : on raisonne sur un seul client à la fois, sans "switch mental" sur le contexte courant.
- **Pas de système de permissions à construire** : 1 repo = 1 client = scope clair.

Le coût accepté : **les fixes de bugs dans le moteur partagé doivent être portés à la main** dans chaque repo client (pas de propagation automatique).

## 4. Quand factoriser ?

Pas avant d'avoir vu **3 clients réels diverger sur les mêmes 5 fichiers**. Tant qu'on n'est pas là, c'est de l'abstraction prématurée. Voir `CLAUDE.md` § "Règles importantes".

## 5. Ce que contient le template

Voir `ARCHITECTURE.md` pour la doc technique complète. En résumé :
- Next.js 15 + React 19 + Tailwind 3 + Zod
- Claude Code CLI en sous-processus (pas de SDK API, pas de clé)
- Playwright pour l'export PNG des slides
- 6 types de slides (cover, body, method, steps, donts, cta)
- Système de thèmes (cover/cta PNGs par thème, body partagé)
- Édition inline des slides après génération

## 6. Les placeholders volontaires

Dans le template, certains contenus sont des `[À PERSONNALISER]` ou `[Nom du client]`. Ils sont volontairement laissés tels quels — ils doivent être remplis lors du fork (cf. `TEMPLATE.md`, 8 étapes).

Si tu vois des placeholders restants dans un repo client après customisation, c'est un bug.

## 7. Les pièges connus

### 7.1 Pas de données client dans le template

Si une adresse Bel & Blanc, un font client ou un article réel d'un client traîne dans ce repo, c'est un bug — à nettoyer immédiatement.

### 7.2 iCloud Drive et `node_modules`

Sur macOS, ne pas placer un projet Node dans un dossier synchronisé iCloud (`~/Documents/`, `~/Desktop/`). iCloud crée des doublons type `next 2/`, `react-dom 2/` à l'intérieur de `node_modules`, qui corrompent l'install. Cibles sûres : `~/dev/`, `~/Code/`, `~/`.

### 7.3 Bug Zod `steps.min(5)`

Le schéma de `StepsSlide` était trop strict (`min(5)`) — Claude pouvait produire 4 étapes sur un article où ça avait du sens, et la validation Zod plantait. Le fix appliqué : `min(4)` côté Zod, plus durcissement du `BRAND_VOICE` (`method` = 2-3 étapes, `steps` = 4-8 étapes) pour cadrer la génération.

## 8. Les KPI implicites du moteur

- **Time-to-first-carousel** sur un nouveau client : < 1h après fork (les 8 étapes de `TEMPLATE.md`).
- **Temps de génération** : ~45s par carrousel (un appel Claude CLI).
- **Coût** : nul pour Anthropic (le user a déjà le CLI), juste le coût compute local + temps Claude.

## 9. Decision log

### 9.1 Pas de SDK Anthropic, pas de clé API

Le moteur appelle `claude -p` via `child_process.spawn`. Décision volontaire — l'utilisateur a déjà le CLI installé, on évite la gestion de secrets et la friction de setup. Conséquence : l'app ne tourne pas sur un serveur sans CLI Claude (pas de Vercel sans config custom).

### 9.2 Tool schema permissif + Zod strict

Le JSON schema passé à `--json-schema` est **permissif** (tous les champs optionnels sauf `type`). La validation stricte se fait côté Zod (`CarouselDraft` = `discriminatedUnion` sur `type`). Raison : Claude gère mal les `oneOf` complexes en JSON schema, donc on lui laisse de la latitude au moment de la génération et on filtre à la sortie.

Si Zod rejette, l'erreur remonte jusqu'à l'UI avec le détail. C'est volontaire — on préfère échouer fort plutôt que rendre une slide à moitié cassée.

### 9.3 Cache RAM des articles

`lib/articles.ts` cache l'index et les articles en mémoire au premier load (`_indexCache`, `_articlesCache`). En dev, `next dev` invalide le cache au reload de fichier. En prod, le cache vit le temps du worker.

## 10. Roadmap (indicatif, pas une promesse)

- Industrialiser : tests E2E sur 1 article de bout en bout (`/api/extract` → JSON → render `/print/[slug]` → screenshot).
- Cache prompt : si on bascule vers le SDK Anthropic, activer `cache_control` sur le `BRAND_VOICE` (~1.5K tokens, gain net en latence et coût).
- Library de thèmes pré-faits : 5-10 thèmes "stockés" qu'un client peut choisir au lieu de dessiner les 2 PNGs cover/cta.
- Multi-articles batch : générer N carrousels en série depuis l'index.
