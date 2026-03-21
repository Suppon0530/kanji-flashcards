import type { KanjiWord } from "@/types/kanji";
import { GradeTabs } from "@/components/GradeTabs";
import { StudyModal } from "@/components/StudyModal";

type TopPageProps = {
  words: KanjiWord[];
};

export function TopPage({ words }: TopPageProps) {
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
          ランダムに5問出題します。カードをめくって、読みを確認しましょう。
        </p>
      </div>
    </div>
  );
}
