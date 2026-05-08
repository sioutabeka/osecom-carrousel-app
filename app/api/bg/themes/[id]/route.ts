import { NextResponse } from "next/server";
import { deleteTheme } from "@/lib/themes";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTheme(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    const status = message.includes("default")
      ? 403
      : message.includes("n'existe pas")
        ? 404
        : 500;
    console.error("[/api/bg/themes/[id] DELETE]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
