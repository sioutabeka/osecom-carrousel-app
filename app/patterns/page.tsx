import PatternsManager from "./_PatternsManager";
import { listPatterns } from "@/lib/patterns-store";

export const dynamic = "force-dynamic";

export default async function PatternsPage() {
  const initial = await listPatterns();
  return <PatternsManager initial={initial} />;
}
