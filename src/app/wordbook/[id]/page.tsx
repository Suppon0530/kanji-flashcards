import { notFound } from "next/navigation";
import Link from "next/link";
import { TopHeader } from "@/components/TopHeader";
import { TopFooter } from "@/components/TopFooter";
import { getWordbookDetail } from "@/server/actions/wordbook-actions";
import { WordbookActions } from "@/components/WordbookActions";

export default async function WordbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wordbook = await getWordbookDetail(id);

  if (!wordbook) {
    notFound();
  }

  const entries = wordbook.wordbook_entries;

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold">
              {wordbook.name}（{entries.length}語）
            </h1>
            <Link
              href="/wordbook"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              ← 単語帳一覧
            </Link>
          </div>

          <WordbookActions wordbookId={wordbook.id} entries={entries} />

          {entries.length === 0 ? (
            <p className="py-8 text-center text-zinc-400">
              この単語帳にはまだ単語がありません。
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <span className="text-2xl font-bold">
                    {entry.kanji_words.question}
                  </span>
                  <span className="text-sm font-medium text-zinc-500">
                    {entry.kanji_words.reading}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <TopFooter />
    </div>
  );
}
