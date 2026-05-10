import { NextResponse } from "next/server";
import { listPatterns, createPattern } from "@/lib/patterns-store";
import { PatternRecordSchema, slugifyPatternId } from "@/lib/patterns";

export const runtime = "nodejs";

export async function GET() {
  const patterns = await listPatterns();
  return NextResponse.json({ patterns });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const candidate = {
      id:
        typeof body?.id === "string" && body.id.trim()
          ? slugifyPatternId(body.id)
          : slugifyPatternId(String(body?.label ?? "")),
      label: String(body?.label ?? "").trim(),
      tagline: String(body?.tagline ?? "").trim(),
      brief: String(body?.brief ?? ""),
    };
    const parsed = PatternRecordSchema.safeParse(candidate);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") },
        { status: 400 }
      );
    }
    const created = await createPattern(parsed.data);
    return NextResponse.json({ pattern: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    const status = message.includes("existe déjà") ? 409 : 500;
    console.error("[/api/patterns POST]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
