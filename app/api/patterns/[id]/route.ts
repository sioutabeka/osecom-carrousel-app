import { NextResponse } from "next/server";
import { getPattern, updatePattern, deletePattern } from "@/lib/patterns-store";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pattern = await getPattern(id);
  if (!pattern) {
    return NextResponse.json({ error: `pattern "${id}" introuvable` }, { status: 404 });
  }
  return NextResponse.json({ pattern });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const patch: Record<string, string> = {};
    if (typeof body?.label === "string") patch.label = body.label.trim();
    if (typeof body?.tagline === "string") patch.tagline = body.tagline.trim();
    if (typeof body?.brief === "string") patch.brief = body.brief;
    const updated = await updatePattern(id, patch);
    return NextResponse.json({ pattern: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    const status = message.includes("introuvable") ? 404 : 400;
    console.error("[/api/patterns/[id] PUT]", err);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePattern(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    const status = message.includes("introuvable")
      ? 404
      : message.includes("dernier pattern")
        ? 403
        : 500;
    console.error("[/api/patterns/[id] DELETE]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
