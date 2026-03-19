import type { KanjiWord, WordUpdateEntry } from "@/types/kanji";
import { GRADE_LABELS } from "@/lib/constants";
import { GradeTabs } from "@/components/GradeTabs";
import { StudyModal } from "@/components/StudyModal";

function formatUpdateDescription(grades: number[], wordCount: number): string {
  const labels = grades.map((g) => GRADE_LABELS[g] ?? `学年${g}`);
  const unique = [...new Set(labels)];
  return `${unique.join("・")}の熟語を${wordCount}問追加`;
}

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, "/");
}

type TopPageProps = {
  words: KanjiWord[];
  history: WordUpdateEntry[];
};

export function TopPage({ words, history }: TopPageProps) {
  return (
    <div className="min-h-dvh px-4 py-8">
      <header className="mx-auto max-w-2xl">
        <div className="mb-4 flex justify-end">
          <StudyModal words={words} />
        </div>
        <GradeTabs />
      </header>

      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 pt-16 text-center">
        <h1 className="text-4xl font-bold">漢字フラッシュカード</h1>
        <p className="text-lg text-zinc-500">
          登録単語数:{" "}
          <span className="font-semibold text-teal-600">{words.length}</span>
          語
          <br />
          ランダムに5問出題します。カードをめくって、読みと意味を確認しましょう。
        </p>
      </div>

      {history.length > 0 && (
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-4 text-center text-2xl font-bold">更新履歴</h2>
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.updateDate}
                className="flex items-baseline gap-4 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-700"
              >
                <time className="shrink-0 text-sm text-zinc-400">
                  {formatDate(entry.updateDate)}
                </time>
                <span className="text-sm">
                  {formatUpdateDescription(entry.grades, entry.wordCount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
