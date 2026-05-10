import { z } from "zod";

export type NarrativePattern = string;

export const PatternRecordSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id doit être en kebab-case (lettres minuscules, chiffres, tirets)"),
  label: z.string().min(1).max(80),
  tagline: z.string().min(1).max(160),
  brief: z.string().min(20),
});

export type PatternRecord = z.infer<typeof PatternRecordSchema>;

export const SEED_PATTERNS: PatternRecord[] = [
  {
    id: "piege-mecanique",
    label: "Le piège → la mécanique",
    tagline: "Démolir une croyance, donner la voie propre",
    brief: `**Pattern : Le piège → la mécanique.**

- Job narratif : démolir une croyance, une métrique, ou une pratique installée — puis donner la voie propre.
- Séquence attendue : \`cover\` (la croyance prise en flagrant délit) → \`body\` (ce que tout le monde fait) → \`body\` (pourquoi c'est cassé) → \`method\` ou \`steps\` (la voie juste) → \`cta\`. 5-7 slides au total.
- Ton : direct, contre-intuitif, "stop ça". Pose une tension forte dès la cover.
- Tags privilégiés (à utiliser ou en inventer dans le même esprit) : \`LE PIÈGE\`, \`MÉTRIQUE PIÈGE\`, \`LA RUPTURE\`, \`LA MÉCANIQUE\`, \`LA VOIE JUSTE\`.
- Le titre de la cover doit nommer la croyance qu'on attaque (pas la solution qu'on propose).`,
  },
  {
    id: "manifesto",
    label: "Le manifesto",
    tagline: "Poser une vision, défendre un parti pris",
    brief: `**Pattern : Le manifesto.**

- Job narratif : poser une vision, défendre un parti pris. **Pas de méthode opérationnelle, pas d'étapes.** On affirme, on assume.
- Séquence attendue : \`cover\` (déclaration en une phrase) → \`body\` × 3 ou 4 (chaque body = un point fort de la vision) → \`cta\`. 5-6 slides au total.
- **Interdit** : \`method\`, \`steps\`. Évite \`donts\` aussi (manifeste = on défend, on n'explique pas ce qu'il faut éviter).
- Ton : assertif, parti pris, manifeste. **Pas** de "voici comment", plutôt "voici ce qu'on défend / ce qu'on refuse".
- Tags privilégiés : \`LA VISION\`, \`LE PARTI PRIS\`, \`CE QU'ON REFUSE\`, \`CE QU'ON DÉFEND\`, \`LA POSTURE\`.
- Les body \`action\` doivent être des invitations à la posture, pas des micro-tâches opérationnelles.`,
  },
  {
    id: "comparatif",
    label: "Le comparatif",
    tagline: "Opposer ancien monde vs nouveau monde",
    brief: `**Pattern : Le comparatif.**

- Job narratif : opposer 2 visions — avant/après, vieux monde/nouveau monde, héros/anti-héros. Pédagogie par l'opposition.
- Séquence attendue : \`cover\` (la rupture annoncée) → \`body\` "l'ancien monde" → \`body\` "le nouveau monde" → \`method\` ou \`body\` qui fait le pont → \`cta\`. 5-7 slides au total.
- Tu peux alterner plusieurs paires si l'article a plusieurs axes de rupture.
- Ton : tranchant, manichéen volontaire (assumé pour la pédagogie). Chaque côté est caricaturé pour clarifier la différence.
- Tags privilégiés (à apparier 2 par 2) : \`L'ANCIEN MONDE\` / \`LE NOUVEAU MONDE\`, \`AVANT\` / \`APRÈS\`, \`LE RÉFLEXE\` / \`LA BASCULE\`.
- Les body opposés doivent être lisibles côte à côte : même structure, mêmes longueurs, contraste fort sur le contenu.`,
  },
  {
    id: "story",
    label: "La story",
    tagline: "Raconter un récit (cas, retour d'expérience)",
    brief: `**Pattern : La story.**

- Job narratif : raconter un récit — cas client, retour d'expérience, anecdote. La leçon émerge du récit, on ne la pose pas en intro.
- Séquence attendue : \`cover\` (l'anecdote en une phrase) → \`body\` × 3 à 5 (chapitres du récit, dans l'ordre chronologique) → \`body\` "la leçon" → \`cta\`. 6-8 slides au total.
- Ton : narratif, plus chaleureux, moins didactique. Tu peux utiliser le passé simple/composé. À la 3ème personne ou à la 1ère selon ce que l'article suggère.
- Tags privilégiés : \`LE CONTEXTE\`, \`LE PROBLÈME\`, \`LA TENTATIVE\`, \`LE PIVOT\`, \`LE RÉSULTAT\`, \`LA LEÇON\`.
- Les \`action\` des body chapitres doivent être en cohérence avec le moment du récit (ex : \`Repère ce signal tôt\` plutôt que \`Applique cette méthode\`).
- La dernière body avant le cta porte explicitement la leçon — c'est elle qui prolonge dans le cta.`,
  },
];

export function slugifyPatternId(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
