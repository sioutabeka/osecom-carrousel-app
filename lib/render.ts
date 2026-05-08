import "server-only";
import type { CarouselDraft } from "./schemas";
export interface RenderResult { outDir: string; count: number; paths: string[]; }
export async function renderCarousel(slug: string, draft: CarouselDraft): Promise<RenderResult> {
  return { outDir: slug, count: 0, paths: [] };
}
