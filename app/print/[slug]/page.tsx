import { notFound } from "next/navigation";
import Carousel from "@/app/_components/Carousel";
import { readDraft } from "@/lib/draft-cache";

export const dynamic = "force-dynamic";

const PRINT_OVERRIDES = `
  body { background: #fff; margin: 0; padding: 0; }
  .cs-frame-label { display: none !important; }
  .cs-deck { display: block !important; padding: 0 !important; gap: 0 !important; grid-template-columns: none !important; }
  .cs-frame { width: 1080px !important; }
  .cs-slide { transform: none !important; margin-bottom: 0 !important; }
`;

export default async function PrintPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const draft = await readDraft(slug);
  if (!draft) notFound();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_OVERRIDES }} />
      <Carousel draft={draft} />
    </>
  );
}
