import { notFound } from "next/navigation";
import Link from "next/link";
import { getKanjiWordsByGrade } from "@/server/db/kanji-queries";
import { getWordbookWordIds } from "@/server/actions/wordbook-actions";
import { GRADE_LABELS } from "@/lib/constants";
import { TopHeader } from "@/components/TopHeader";
import { TopFooter } from "@/components/TopFooter";
import { StudyModal } from "@/components/StudyModal";
import { GradeWordList } from "@/components/GradeWordList";

export default async function GradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grade = Number(id);

  if (!Number.isInteger(grade) || grade < 1 || grade > 10) {
    notFound();
  }

  const [gradeWords, wordbookWordIds] = await Promise.all([
    getKanjiWordsByGrade(grade),
    getWordbookWordIds(),
  ]);

  const label = GRADE_LABELS[grade];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex justify-center">
            <StudyModal words={gradeWords} />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold">
              {label}の熟語（{gradeWords.length}問）
            </h1>
            <Link
              href="/"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              ← トップに戻る
            </Link>
          </div>

          <GradeWordList words={gradeWords} wordbookWordIds={wordbookWordIds} />
        </div>
      </main>

      <TopFooter />
    </div>
  );
}
