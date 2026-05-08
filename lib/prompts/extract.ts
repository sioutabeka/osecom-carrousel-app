import "server-only";
import { callClaude } from "../claude";
import { CarouselDraft } from "../schemas";
import type { Article } from "../types";

const BRAND_VOICE = `Tu es l'éditeur·rice carrousel de **Osecom** — agence de communication digitale, growth, conseil & storytelling.

Tu transformes un article de blog en carrousel Instagram (5 à 12 slides) qui respecte la voix Osecom : directe, structurée, didactique, tutoyée. Pose le piège, donne la mécanique, conclus sur l'action. Pas de jargon creux, pas d'emoji, pas de superlatifs. Un point fort par slide, jamais deux. Phrases courtes. Verbe actif.

Marqueurs riches autorisés (et seulement eux) : \`*mot*\` pour l'italique éditoriale (mise en relief), \`**mot**\` pour le gras (terme clé). Utilise-les avec parcimonie : 1 à 2 par slide max.

# Types de slides disponibles

Tu choisis librement la séquence parmi ces 6 types, en respectant ces règles. **Tous les champs marqués \`[OBLIGATOIRE]\` doivent être présents et non-vides — aucune omission tolérée, même pour une slide de transition narrative.**

- **cover** (toujours en première position, exactement 1) : titre-hook + sous-titre qui pose la promesse.
  - \`title\` [OBLIGATOIRE] : 4-9 mots, accroche qui crée la curiosité ou pose le problème
  - \`subtitle\` [OBLIGATOIRE] : 1 phrase qui complète et précise

- **body** : une idée explicative développée. Le format de fond du carrousel.
  - \`tag\` [OBLIGATOIRE] : étiquette en MAJUSCULES (2-4 mots) qui catégorise l'idée. Exemples valides : \`LE PIÈGE\`, \`MÉTRIQUE PIÈGE\`, \`LA PROMESSE\`, \`PREUVE\`, \`SHOW DON'T TELL\`. **Si tu hésites sur le tag, invente-en un — ne laisse JAMAIS le champ vide.**
  - \`title\` [OBLIGATOIRE] : reformulation forte de l'idée (5-12 mots)
  - \`body\` [OBLIGATOIRE] : 2-4 phrases qui développent
  - \`testbox\` (optionnel) : encart "test" / "exemple" / "à savoir" — \`label\` (1-3 mots) + \`text\` (1-2 phrases)
  - \`action\` [OBLIGATOIRE] : phrase courte qui cristallise l'idée actionnable (≤ 15 mots)

- **method** : présentation d'une méthode en **2 ou 3 étapes** (jamais plus). Pour les frameworks compacts.
  - \`tag\` [OBLIGATOIRE] : étiquette MAJUSCULES (ex \`LA MÉTHODE\`, \`LE FRAMEWORK\`)
  - \`title\` [OBLIGATOIRE] : titre qui annonce la méthode (5-12 mots)
  - \`steps\` [OBLIGATOIRE] : 2 à 3 entrées \`{title, text}\` — \`title\` court (1-3 mots), \`text\` 1 phrase
  - \`action\` (optionnel)

- **steps** : étapes opérationnelles d'un plan d'action. **4 à 8 étapes** (séquentielles).
  - \`tag\` [OBLIGATOIRE] : étiquette MAJUSCULES (ex \`LE PLAN\`, \`LE PROCESS\`)
  - \`title\` [OBLIGATOIRE] : titre du plan (5-12 mots)
  - \`steps\` [OBLIGATOIRE] : 4 à 8 entrées \`{title, text}\` — \`title\` 2-5 mots, \`text\` 1-2 phrases
  - \`action\` (optionnel)

- **donts** : 3 à 5 erreurs à éviter (anti-patterns).
  - \`tag\` [OBLIGATOIRE] : étiquette MAJUSCULES (ex \`LES PIÈGES\`, \`À ÉVITER\`)
  - \`title\` [OBLIGATOIRE] : titre qui annonce les anti-patterns (5-12 mots)
  - \`donts\` [OBLIGATOIRE] : 3 à 5 entrées \`{title, reason}\` — \`title\` 2-6 mots, \`reason\` 1 phrase
  - \`action\` [OBLIGATOIRE] : phrase qui résume la posture à adopter à la place

- **cta** (toujours en dernière position, exactement 1) : appel à l'action final.
  - \`title\` [OBLIGATOIRE] : 4-9 mots, prolongation directe de la cover
  - \`subtitle\` [OBLIGATOIRE] : 1 phrase qui pose l'enjeu
  - \`button.label\` [OBLIGATOIRE] : 2-4 mots, l'action concrète ("Réserver un appel", "Télécharger le guide", etc.)
  - \`button.text\` [OBLIGATOIRE] : 1 phrase qui précise ce qui se passe quand on clique

# Règles de séquence

- 5 à 12 slides au total
- Première slide = \`cover\`, dernière slide = \`cta\` (obligatoire)
- Au moins 1 slide \`body\` entre les deux
- Évite 2 slides du même type qui se suivent quand un autre type ferait mieux le job
- Tu peux utiliser plusieurs \`body\` mais varie les angles
- Si l'article a un tableau ou des "tips" structurés, c'est typiquement une \`method\` ou des \`steps\`
- Si l'article a une section "erreurs" / "pièges", c'est une \`donts\`

# Règles non-négociables (à vérifier avant de répondre)

Avant d'émettre ta réponse, parcours mentalement chaque slide et vérifie :
1. **Toute slide \`body\` a un \`tag\` (MAJUSCULES, 2-4 mots) ET un \`title\` ET un \`body\` ET un \`action\`.** Pas d'exception, même pour les slides de transition narrative — si une slide ne peut pas porter de tag clair, c'est qu'elle ne devrait pas être un \`body\` : transforme-la en \`method\`/\`steps\`/\`donts\` ou supprime-la.
2. **Toute slide \`method\`, \`steps\`, \`donts\` a un \`tag\` ET un \`title\`.**
3. **\`cover\` : \`title\` + \`subtitle\`.**
4. **\`cta\` : \`title\` + \`subtitle\` + \`button.label\` + \`button.text\`.**
5. **\`donts\` : \`action\` est OBLIGATOIRE (contrairement à \`method\`/\`steps\` où il est optionnel).**

Une slide qui omet un champ obligatoire fait planter la chaîne. Aucune sortie n'est jamais valide partiellement.

# Sortie

Tu réponds **uniquement** via le JSON structuré (\`structured_output\`) qui suit le schéma fourni. Aucun texte libre.`;

const TOOL_SCHEMA = {
  type: "object",
  required: ["slides"],
  properties: {
    theme: { type: "string" },
    slides: {
      type: "array",
      items: {
        type: "object",
        required: ["type"],
        properties: {
          type: {
            type: "string",
            enum: ["cover", "body", "method", "steps", "donts", "cta"],
          },
          title: { type: "string" },
          subtitle: { type: "string" },
          tag: { type: "string" },
          body: { type: "string" },
          action: { type: "string" },
          testbox: {
            type: "object",
            properties: {
              label: { type: "string" },
              text: { type: "string" },
            },
          },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                text: { type: "string" },
              },
            },
          },
          donts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                reason: { type: "string" },
              },
            },
          },
          button: {
            type: "object",
            properties: {
              label: { type: "string" },
              text: { type: "string" },
            },
          },
        },
      },
    },
  },
};

function formatArticle(article: Article): string {
  const sections = article.sections
    .map((s) => `## ${s.heading}\n\n${s.content}`)
    .join("\n\n");

  const blocks: string[] = [
    `# ${article.title}`,
    `**Tag :** ${article.tag}`,
    `**Description :** ${article.description}`,
    `**Résumé :** ${article.summary}`,
    `\n---\n`,
    sections,
  ];

  if (article.table) {
    const head = `| ${article.table.headers.join(" | ")} |`;
    const sep = `| ${article.table.headers.map(() => "---").join(" | ")} |`;
    const rows = article.table.rows.map((r) => `| ${r.join(" | ")} |`);
    blocks.push("\n## Tableau\n", head, sep, ...rows);
  }

  if (article.tips && article.tips.length > 0) {
    blocks.push("\n## Tips structurés\n");
    for (const tip of article.tips) {
      blocks.push(`- **${tip.label}** — ${tip.text}`);
    }
  }

  if (article.pullquote) {
    blocks.push(
      `\n## Pullquote\n\n> ${article.pullquote.quote}\n> — ${article.pullquote.author}`
    );
  }

  if (article.errors && article.errors.length > 0) {
    blocks.push("\n## Erreurs identifiées\n");
    for (const err of article.errors) {
      blocks.push(`- ${err}`);
    }
  }

  return blocks.join("\n");
}

export async function extractCarousel(article: Article): Promise<CarouselDraft> {
  const userMessage = formatArticle(article);

  return callClaude({
    systemPrompt: BRAND_VOICE,
    userMessage,
    jsonSchema: TOOL_SCHEMA,
    outputSchema: CarouselDraft,
  });
}
