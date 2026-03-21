import { notFound } from "next/navigation";
import Link from "next/link";
import { getKanjiWordsByGrade } from "@/server/db/kanji-queries";
import { GRADE_LABELS } from "@/lib/constants";
import { TopHeader } from "@/components/TopHeader";
import { TopFooter } from "@/components/TopFooter";
import { StudyModal } from "@/components/StudyModal";

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

  const gradeWords = await getKanjiWordsByGrade(grade);

  const label = GRADE_LABELS[grade];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-semibold">{label}の熟語</h1>
            <div className="flex items-center gap-3">
              <StudyModal words={gradeWords} />
              <Link
                href="/"
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ← トップに戻る
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {gradeWords.length > 0 ? (
              gradeWords.map((word) => (
                <div
                  key={word.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <span className="inline-block w-14 text-left text-2xl font-bold">
                    {word.question}
                  </span>
                  <span className="text-sm font-medium">{word.reading}</span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-zinc-400">
                データがありません
              </p>
            )}
          </div>
        </div>
      </main>

      <TopFooter />
    </div>
  );
}
