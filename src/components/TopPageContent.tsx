"use client";

import { useState, useMemo } from "react";
import type { KanjiWord } from "@/types/kanji";
import { GRADE_LABELS } from "@/lib/constants";
import { StudyModal } from "@/components/StudyModal";
import { GradeCheckboxes } from "@/components/GradeCheckboxes";

type TopPageContentProps = {
  words: KanjiWord[];
  wordbookWordIds: number[] | null;
};

export function TopPageContent({ words, wordbookWordIds }: TopPageContentProps) {
  const isLoggedIn = wordbookWordIds !== null;
  const [selectedGrades, setSelectedGrades] = useState<Set<number>>(
    () =>
      isLoggedIn ? new Set() : new Set(Object.keys(GRADE_LABELS).map(Number)),
  );
  const [wordbookSelected, setWordbookSelected] = useState(isLoggedIn);

  const wordbookIdSet = useMemo(
    () => new Set(wordbookWordIds ?? []),
    [wordbookWordIds],
  );

  const handleToggle = (grade: number) => {
    setSelectedGrades((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) {
        next.delete(grade);
      } else {
        next.add(grade);
      }
      return next;
    });
  };

  const filteredWords = useMemo(
    () =>
      words.filter(
        (w) =>
          selectedGrades.has(w.grade) ||
          (wordbookSelected && wordbookIdSet.has(w.id)),
      ),
    [words, selectedGrades, wordbookSelected, wordbookIdSet],
  );

  const wordCountByGrade = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const w of words) {
      counts[w.grade] = (counts[w.grade] ?? 0) + 1;
    }
    return counts;
  }, [words]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">ずぼ漢</h1>
        <p className="mt-4 text-lg text-zinc-500">
          対象単語数:{" "}
          <span className="font-semibold text-primary">
            {filteredWords.length}
          </span>
          語
          <br />
          ランダムに5問出題します。カードをめくって、読みを確認しましょう。
        </p>
      </div>

      <div className="relative flex justify-center">
        <div className={filteredWords.length > 0 ? "visible" : "invisible"}>
          <StudyModal
            words={filteredWords}
            autoOpen
            wordbookWordIds={wordbookWordIds ?? undefined}
          />
        </div>
        {filteredWords.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
            出題範囲を選択してください
          </p>
        )}
      </div>

      <GradeCheckboxes
        selectedGrades={selectedGrades}
        wordCountByGrade={wordCountByGrade}
        onToggle={handleToggle}
        onSelectAll={() =>
          setSelectedGrades(new Set(Object.keys(GRADE_LABELS).map(Number)))
        }
        onClearAll={() => setSelectedGrades(new Set())}
        wordbookWordCount={
          wordbookWordIds !== null ? wordbookWordIds.length : undefined
        }
        wordbookSelected={wordbookSelected}
        onWordbookToggle={() => setWordbookSelected((prev) => !prev)}
      />
    </div>
  );
}
