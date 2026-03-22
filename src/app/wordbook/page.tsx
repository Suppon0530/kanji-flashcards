import Link from "next/link";
import { TopHeader } from "@/components/TopHeader";
import { TopFooter } from "@/components/TopFooter";
import { getWordbooks } from "@/server/actions/wordbook-actions";

export default async function WordbookListPage() {
  const wordbooks = await getWordbooks();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-lg font-semibold">単語帳</h1>

          {wordbooks.length === 0 ? (
            <p className="py-8 text-center text-zinc-400">
              単語帳がありません。学習結果から単語を保存できます。
            </p>
          ) : (
            <div className="space-y-3">
              {wordbooks.map((wb) => (
                <Link
                  key={wb.id}
                  href={`/wordbook/${wb.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  <div>
                    <span className="font-medium">{wb.name}</span>
                    <span className="ml-2 text-sm text-zinc-400">
                      {wb.wordbook_entries[0]?.count ?? 0}語
                    </span>
                  </div>
                  <span className="text-zinc-400">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <TopFooter />
    </div>
  );
}
