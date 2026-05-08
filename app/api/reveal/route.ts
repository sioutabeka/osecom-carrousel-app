import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

export const runtime = "nodejs";

const OUTPUT_BASE = path.join(
  os.homedir(),
  "Documents",
  "osecom-carrousel-output"
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const target = String(body?.path ?? "").trim();
    if (!target) {
      return NextResponse.json({ error: "path manquant" }, { status: 400 });
    }

    const resolved = path.resolve(target);
    if (!resolved.startsWith(OUTPUT_BASE)) {
      return NextResponse.json(
        { error: "chemin hors zone autorisée" },
        { status: 403 }
      );
    }

    await fs.access(resolved);

    spawn("open", [resolved], { detached: true, stdio: "ignore" }).unref();

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    console.error("[/api/reveal]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
