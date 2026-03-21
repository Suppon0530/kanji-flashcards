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
        <span className="text-5xl font-bold text-teal-600">{percentage}%</span>
        <span className="text-zinc-500">
          {total}問中{correct}問正解
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
                  ? "border-green-600/30 bg-green-100 dark:bg-green-900"
                  : "border-amber-600/30 bg-amber-100 dark:bg-amber-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-block w-14 text-left text-2xl font-bold">
                  {word.question}
                </span>
                <span className="text-sm font-medium">{word.reading}</span>
              </div>
              <span
                className={`text-sm font-semibold ${isCorrect ? "text-green-600" : "text-amber-600"}`}
              >
                {isCorrect ? "正解" : "不正解"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="cursor-pointer rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-teal-700"
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
