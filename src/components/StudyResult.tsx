import type { KanjiWord, StudyAnswer } from "@/types/kanji";
import { calculateScore } from "@/lib/flashcard-utils";

type StudyResultProps = {
  questions: KanjiWord[];
  answers: StudyAnswer[];
  onRestart: () => void;
  onClose?: () => void;
};

export function StudyResult({ questions, answers, onRestart, onClose }: StudyResultProps) {
  const { correct, total, percentage } = calculateScore(answers);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">結果</h2>

      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl font-bold text-primary">{percentage}%</span>
        <span className="text-zinc-500">
          {total}問中{correct}問覚えた
        </span>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {questions.map((word, i) => {
          const isCorrect = answers[i]?.correct ?? false;
          return (
            <div
              key={word.id}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                isCorrect
                  ? "border-primary/30 bg-primary/10"
                  : "border-incorrect/30 bg-incorrect/10"
              }`}
            >
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-2xl font-bold">
                  {word.question}
                </span>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-500">{word.reading}</span>
              </div>
              <span
                className={`text-sm font-semibold ${isCorrect ? "text-primary" : "text-incorrect"}`}
              >
                {isCorrect ? "覚えた" : "覚えてない"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="cursor-pointer rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          もう一度
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-zinc-300 px-8 py-4 text-lg font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
}
