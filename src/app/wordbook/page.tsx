import { TopHeader } from "@/components/TopHeader";
import { TopFooter } from "@/components/TopFooter";
import { getWordbookEntries } from "@/server/actions/wordbook-actions";
import { WordbookActions } from "@/components/WordbookActions";

export default async function WordbookPage() {
  const entries = await getWordbookEntries();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-lg font-semibold">
            マイカード（{entries.length}語）
          </h1>

          {entries.length > 0 && <WordbookActions entries={entries} />}

          {entries.length === 0 ? (
            <p className="py-8 text-center text-zinc-400">
              マイカードにはまだ単語がありません。
              <br />
              学習結果からチェックして登録できます。
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
