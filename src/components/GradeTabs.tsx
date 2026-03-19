import Link from "next/link";
import { GRADE_LABELS } from "@/lib/constants";

const TAB_GRADES = Object.entries(GRADE_LABELS)
  .filter(([, label], i, arr) => i === 0 || arr[i - 1][1] !== label)
  .map(([grade, label]) => ({ grade: Number(grade), label }));

type GradeTabsProps = {
  currentGrade?: number;
};

export function GradeTabs({ currentGrade }: GradeTabsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {TAB_GRADES.map((option) => (
        <Link
          key={option.grade}
          href={`/grade/${option.grade}`}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            currentGrade === option.grade
              ? "bg-teal-600 text-white"
              : "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
