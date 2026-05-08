import { listArticlesByTag, getMeta } from "@/lib/articles";
import Sidebar from "./_components/Sidebar";

export default async function Home() {
  const [byTag, meta] = await Promise.all([listArticlesByTag(), getMeta()]);
  const isPlural = meta.count > 1;

  return (
    <div className="flex min-h-screen">
      <Sidebar byTag={byTag} />

      <main className="flex-1 flex items-center justify-center p-12">
        <div className="max-w-xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-cream-soft border border-olive/20 text-olive text-xs font-bold tracking-[0.28em] uppercase">
            <span className="w-2 h-2 rounded-full bg-rose" />
            Osecom · Carrousel Studio
          </div>

          <h1 className="font-display text-ink-brown text-6xl leading-[0.98] mb-6">
            {meta.count} {isPlural ? "articles" : "article"}
            {isPlural ? ", prêts" : ", prêt"} à <em className="font-serif text-olive">{isPlural ? "devenir des carrousels." : "devenir un carrousel."}</em>
          </h1>

          <p className="font-serif italic text-xl text-ink-brown-soft mb-8">
            Choisis un article dans la barre latérale pour démarrer.
          </p>

          <div className="text-sm text-ink-brown-soft">
            <p className="mb-2">{meta.context}</p>
            <p className="italic">Tonalité : {meta.tone}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
