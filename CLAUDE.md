# Contexte pour Claude Code

> Ce fichier est lu automatiquement à l'ouverture du projet. Il pose les règles du jeu pour ce repo.

## Ce que c'est

**Ce repo est un template, pas une app**. Il sert à fabriquer des apps clientes par fork — une app par client.

## Le modèle "une app par client"

```
siouta-carrousel-template/   ← TU ES ICI : le moule, à cloner
                                jamais utilisé en prod tel quel

bel-blanc-carrousel-app/     ← client 1 (Bel & Blanc) — repo séparé
client-2-carrousel-app/      ← client 2 — futur repo séparé
client-3-carrousel-app/      ← client 3 — futur repo séparé
... jusqu'à 6 clients
```

Chaque app cliente :
- a son propre dossier local
- a son propre repo GitHub (`sioutabeka/{client}-carrousel-app`)
- a son propre historique git, son propre code, sa propre charte
- évolue **indépendamment** des autres et du template

## Ce que tu dois faire quand l'utilisateur demande...

### "Ajoute le client X"
**Ne PAS** ajouter de sélecteur de client / config dynamique / multi-tenant dans ce template.
**À LA PLACE** :
```bash
git clone https://github.com/sioutabeka/siouta-carrousel-template.git ~/Documents/{client-X}-carrousel-app
cd ~/Documents/{client-X}-carrousel-app
rm -rf .git && git init -b main
npm install
# Suivre TEMPLATE.md (8 étapes) pour customiser
git add . && git commit -m "initial commit — {client X} carousel studio"
gh repo create sioutabeka/{client-X}-carrousel-app --private --source=. --push
```
La checklist détaillée des 8 étapes est dans [`TEMPLATE.md`](./TEMPLATE.md).

### "Ajoute une feature à l'app"
Si la demande est faite **dans le template** : c'est une amélioration du moteur partagé. Garde-la générique (pas de Bel & Blanc, pas de client spécifique). Elle bénéficiera aux futurs clones.

Si la demande concerne un **client existant** : ouvrir le repo de ce client (pas ce template) et y faire la modif.

### "Fix un bug"
Si le bug est dans le moteur partagé (logique générique) : fix dans le template **et** mentionner que le fix doit être **porté à la main** dans chaque repo client déjà existant (pas de propagation automatique).

### "Change la charte / les couleurs / les fonts"
Mauvaise question dans le template — la charte est par client. Demander dans quel repo client c'est, puis y aller.

## Les fichiers que tu dois consulter

Par ordre d'importance pour comprendre le projet :
1. **[`STRATEGY.md`](./STRATEGY.md)** — la vision multi-clients, le pourquoi de l'archi, les pièges connus
2. **[`TEMPLATE.md`](./TEMPLATE.md)** — la checklist exécutable de customisation par client (8 étapes)
3. **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** — la doc technique du moteur (data flow, conventions, slide types)
4. **[`README.md`](./README.md)** — intro courte

## Règles importantes

- **Pas de multi-tenant.** L'utilisateur a explicitement choisi le fork-per-client après brainstorm. Ne pas reproposer un système de configs dynamiques par client.
- **Pas d'abstraction prématurée.** Tant qu'on n'a pas vu 3 clients réels diverger sur les mêmes 5 fichiers, on ne factorise pas en package partagé.
- **Aucune donnée client ici.** Si tu vois passer des adresses Bel & Blanc, des fonts client, des articles d'un client réel dans ce repo — c'est un bug, à nettoyer immédiatement.
- **Les placeholders `[À PERSONNALISER]` / `[Nom du client]` sont volontaires.** Ne pas les remplir dans ce repo.

## Bug connu (template + tous les clones)

Schéma `StepsSlide.steps.min(5)` (`lib/schemas.ts`) trop strict — Claude peut produire 4 étapes pour `"type": "steps"` → erreur Zod. Fix recommandé : `min(4)` + durcir le `BRAND_VOICE` (`method` = 2-3, `steps` = 4-8). Voir `STRATEGY.md` §9.2 pour le diagnostic.
