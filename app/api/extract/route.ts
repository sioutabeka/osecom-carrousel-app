import { NextResponse } from "next/server";
import { getArticle } from "@/lib/articles";
import { extractCarousel } from "@/lib/prompts/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body?.slug ?? "").trim();
    if (!slug) {
      return NextResponse.json({ error: "slug manquant" }, { status: 400 });
    }

    const article = await getArticle(slug);
    if (!article) {
      return NextResponse.json({ error: `article inconnu: ${slug}` }, { status: 404 });
    }

    const draft = await extractCarousel(article);
    return NextResponse.json({ draft, slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    console.error("[/api/extract]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
