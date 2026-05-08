import { spawn } from "node:child_process";
import { z } from "zod";
import os from "node:os";

const CLAUDE_BIN = process.env.CLAUDE_BIN ?? "claude";
const TIMEOUT_MS = 120_000;

/** Tools de Claude Code à bloquer explicitement — on veut juste de la génération texte. */
const BLOCKED_TOOLS = [
  "Bash",
  "Edit",
  "Write",
  "Read",
  "Grep",
  "Glob",
  "WebFetch",
  "WebSearch",
  "NotebookEdit",
  "TaskCreate",
  "TaskUpdate",
  "Agent",
  "ListMcpResourcesTool",
  "ReadMcpResourceTool",
];

interface CallOptions<T> {
  systemPrompt: string;
  userMessage: string;
  jsonSchema: Record<string, unknown>;
  outputSchema: z.ZodType<T>;
}

interface ClaudeEnvelope {
  type: string;
  subtype: string;
  is_error: boolean;
  result?: string;
  structured_output?: unknown;
  duration_ms?: number;
  total_cost_usd?: number;
  session_id?: string;
}

/**
 * Appelle `claude -p` (CLI Claude Code) en mode non-interactif avec :
 * - --json-schema : force la sortie structurée
 * - --system-prompt : remplace le prompt système (pas de mode "coding agent")
 * - --disallowed-tools : bloque tous les tools (juste génération de texte)
 * - cwd = /tmp : pas de CLAUDE.md auto-discovery local
 * Le user message passe par stdin pour éviter les soucis d'escape.
 */
export async function callClaude<T>(opts: CallOptions<T>): Promise<T> {
  const args = [
    "-p",
    "--output-format",
    "json",
    "--json-schema",
    JSON.stringify(opts.jsonSchema),
    "--system-prompt",
    opts.systemPrompt,
    "--disallowed-tools",
    BLOCKED_TOOLS.join(" "),
  ];

  const stdout = await spawnAndCollect(CLAUDE_BIN, args, opts.userMessage);

  let envelope: ClaudeEnvelope;
  try {
    envelope = JSON.parse(stdout);
  } catch {
    throw new Error(`Sortie claude non-JSON:\n${stdout.slice(0, 800)}`);
  }

  if (envelope.is_error) {
    throw new Error(`Claude a renvoyé une erreur: ${envelope.subtype}`);
  }

  if (envelope.structured_output == null) {
    throw new Error(
      `Pas de structured_output dans la réponse. Result text: ${envelope.result?.slice(0, 300) ?? "(vide)"}`
    );
  }

  const parsed = opts.outputSchema.safeParse(envelope.structured_output);
  if (!parsed.success) {
    throw new Error(
      `Output invalide selon le schéma Zod:\n${parsed.error.message}\n\nReçu: ${JSON.stringify(envelope.structured_output).slice(0, 600)}`
    );
  }

  return parsed.data;
}

function spawnAndCollect(
  bin: string,
  args: string[],
  stdinText: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: os.tmpdir(),
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));

    const timeout = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`Timeout après ${TIMEOUT_MS}ms\nstderr: ${stderr.slice(0, 500)}`));
    }, TIMEOUT_MS);

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`Échec spawn: ${err.message}. Vérifie que \`claude\` est dans le PATH.`));
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`claude exited ${code}\nstderr: ${stderr.slice(0, 500)}`));
        return;
      }
      resolve(stdout);
    });

    proc.stdin.write(stdinText);
    proc.stdin.end();
  });
}
