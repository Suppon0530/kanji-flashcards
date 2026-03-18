"use client";

import { useState, useEffect, useCallback } from "react";
import type { KanjiWord } from "@/types/kanji";
import { FlashcardContainer } from "@/components/FlashcardContainer";

const GRADE_OPTIONS = [
  { grade: 1, label: "小学1年" },
  { grade: 2, label: "小学2年" },
  { grade: 3, label: "小学3年" },
  { grade: 4, label: "小学4年" },
  { grade: 5, label: "小学5年" },
  { grade: 6, label: "小学6年" },
  { grade: 7, label: "中学生" },
  { grade: 8, label: "高校生" },
] as const;

type TopPageProps = {
  words: KanjiWord[];
};

export function TopPage({ words }: TopPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const handleOpen = () => {
    setModalKey((prev) => prev + 1);
    setIsModalOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const filteredWords =
    selectedGrade === null
      ? []
      : selectedGrade >= 8
        ? words.filter((w) => w.grade >= 8)
        : words.filter((w) => w.grade === selectedGrade);

  const handleGradeClick = (grade: number) => {
    setSelectedGrade((prev) => (prev === grade ? null : grade));
  };

  return (
    <>
      <div className="min-h-dvh px-4 py-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 pt-16 text-center">
          <h1 className="text-4xl font-bold">漢字フラッシュカード</h1>
          <p className="text-lg text-zinc-500">
            登録単語数:{" "}
            <span className="font-semibold text-teal-600">{words.length}</span>
            語
            <br />
            ランダムに5問出題します。カードをめくって、読みと意味を確認しましょう。
          </p>
          <button
            onClick={handleOpen}
            className="cursor-pointer rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-teal-700"
          >
            学習を始める
          </button>
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-4 text-center text-2xl font-bold">学年別熟語一覧</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {GRADE_OPTIONS.map((option) => (
              <button
                key={option.grade}
                onClick={() => handleGradeClick(option.grade)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedGrade === option.grade
                    ? "bg-teal-600 text-white"
                    : "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {selectedGrade !== null && (
            <div className="mt-6 space-y-3">
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
                  >
                    <span className="inline-block w-14 text-left text-2xl font-bold">
                      {word.kanji}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{word.reading}</span>
                      <span className="text-xs text-zinc-500">{word.meaning}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-zinc-400">データがありません</p>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className={`fixed inset-0 z-50 overflow-y-auto ${
            isClosing ? "modal-fade-out" : "modal-fade-in"
          }`}
        >
          <div
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
          />
          <div className="relative flex min-h-full items-center justify-center p-4">
            <div
              className={`relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ${
                isClosing ? "modal-slide-down" : "modal-slide-up"
              }`}
            >
              <FlashcardContainer
                key={modalKey}
                words={words}
                onClose={handleClose}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
