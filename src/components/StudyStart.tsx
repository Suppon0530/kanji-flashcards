import { GradeCheckboxes } from "@/components/GradeCheckboxes";

type StudyStartProps = {
  totalWords: number;
  showGradeSelection?: boolean;
  selectedGrades: Set<number>;
  wordCountByGrade: Record<number, number>;
  onToggle: (grade: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onStart: () => void;
  wordbookWordCount?: number;
  wordbookSelected?: boolean;
  onWordbookToggle?: () => void;
};

export function StudyStart({
  totalWords,
  showGradeSelection = false,
  selectedGrades,
  wordCountByGrade,
  onToggle,
  onSelectAll,
  onClearAll,
  onStart,
  wordbookWordCount,
  wordbookSelected,
  onWordbookToggle,
}: StudyStartProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {!showGradeSelection && (
        <h1 className="text-3xl font-bold">ずぼ漢</h1>
      )}
      <p className="text-lg text-zinc-500">
        対象単語数:{" "}
        <span className="font-semibold text-primary">{totalWords}</span>語
        <br />
        ランダムに5問出題します。
      </p>

      {showGradeSelection && (
        <div className="w-full text-left">
          <GradeCheckboxes
            selectedGrades={selectedGrades}
            wordCountByGrade={wordCountByGrade}
            onToggle={onToggle}
            onSelectAll={onSelectAll}
            onClearAll={onClearAll}
            wordbookWordCount={wordbookWordCount}
            wordbookSelected={wordbookSelected}
            onWordbookToggle={onWordbookToggle}
          />
        </div>
      )}

      <button
        onClick={onStart}
        disabled={totalWords === 0}
        className="cursor-pointer rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-default disabled:opacity-50"
      >
        問題に挑戦
      </button>
    </div>
  );
}
