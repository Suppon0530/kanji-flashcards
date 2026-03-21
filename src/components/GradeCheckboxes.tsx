import { GRADE_LABELS } from "@/lib/constants";

const GRADE_OPTIONS = Object.entries(GRADE_LABELS).map(([grade, label]) => ({
  grade: Number(grade),
  label,
}));

type GradeCheckboxesProps = {
  selectedGrades: Set<number>;
  wordCountByGrade: Record<number, number>;
  onToggle: (grade: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
};

export function GradeCheckboxes({
  selectedGrades,
  wordCountByGrade,
  onToggle,
  onSelectAll,
  onClearAll,
}: GradeCheckboxesProps) {
  const allSelected = selectedGrades.size === GRADE_OPTIONS.length;
  const noneSelected = selectedGrades.size === 0;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          出題範囲選択
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={allSelected}
            className="cursor-pointer text-xs text-primary transition-colors hover:text-primary-hover disabled:cursor-default disabled:text-zinc-300 dark:disabled:text-zinc-600"
          >
            全て選択
          </button>
          <span className="text-xs text-zinc-300 dark:text-zinc-600">|</span>
          <button
            type="button"
            onClick={onClearAll}
            disabled={noneSelected}
            className="cursor-pointer text-xs text-primary transition-colors hover:text-primary-hover disabled:cursor-default disabled:text-zinc-300 dark:disabled:text-zinc-600"
          >
            全て解除
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GRADE_OPTIONS.map((option) => (
          <label
            key={option.grade}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 transition-colors select-none hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <input
              type="checkbox"
              checked={selectedGrades.has(option.grade)}
              onChange={() => onToggle(option.grade)}
              className="grade-checkbox"
            />
            <span className="text-sm font-medium">{option.label}</span>
            <span className="ml-auto text-xs text-zinc-400">
              {wordCountByGrade[option.grade] ?? 0}語
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
