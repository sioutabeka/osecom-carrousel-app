import { NextResponse } from "next/server";
import { createTheme, listThemes } from "@/lib/themes";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];

function isPng(buf: ArrayBuffer): boolean {
  const view = new Uint8Array(buf);
  if (view.length < 4) return false;
  return PNG_MAGIC.every((b, i) => view[i] === b);
}

export async function GET() {
  const themes = await listThemes();
  return NextResponse.json({ themes });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    const cover = form.get("cover");
    const cta = form.get("cta");
    const body = form.get("body");

    if (!name) {
      return NextResponse.json({ error: "nom manquant" }, { status: 400 });
    }
    if (!(cover instanceof File) || !(cta instanceof File)) {
      return NextResponse.json(
        { error: "fichiers cover et cta requis" },
        { status: 400 }
      );
    }
    const bodyFile = body instanceof File && body.size > 0 ? body : null;

    for (const f of [cover, cta, ...(bodyFile ? [bodyFile] : [])]) {
      if (f.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `fichier trop lourd (max ${MAX_BYTES / 1024 / 1024} Mo)` },
          { status: 400 }
        );
      }
    }

    const coverBuf = await cover.arrayBuffer();
    const ctaBuf = await cta.arrayBuffer();
    const bodyBuf = bodyFile ? await bodyFile.arrayBuffer() : null;

    if (!isPng(coverBuf) || !isPng(ctaBuf) || (bodyBuf && !isPng(bodyBuf))) {
      return NextResponse.json(
        { error: "seuls les PNG sont acceptés" },
        { status: 400 }
      );
    }

    const theme = await createTheme(name, coverBuf, ctaBuf, bodyBuf);
    return NextResponse.json({ theme }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    const status = message.includes("existe déjà") ? 409 : 500;
    console.error("[/api/bg/themes POST]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
