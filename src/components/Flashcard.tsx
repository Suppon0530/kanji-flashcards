"use client";

import { useState } from "react";
import type { KanjiWord } from "@/types/kanji";

type FlashcardProps = {
  word: KanjiWord;
  currentIndex: number;
  totalCount: number;
  onAnswer: (correct: boolean) => void;
};

export function Flashcard({ word, currentIndex, totalCount, onAnswer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleAnswer = (correct: boolean) => {
    setIsFlipped(false);
    setTimeout(() => onAnswer(correct), 300);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <p className="text-sm text-zinc-400">
        {currentIndex + 1} / {totalCount}
      </p>

      <div
        className="card-scene h-72 w-full max-w-sm cursor-pointer sm:h-80"
        onClick={handleFlip}
      >
        <div className={`card-inner ${isFlipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-face flex items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex flex-col items-center gap-4">
              <span className="text-7xl font-bold sm:text-8xl">{word.question}</span>
              <span className="text-sm text-zinc-400">タップしてめくる</span>
            </div>
          </div>

          {/* Back */}
          <div className="card-face card-back flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-4xl font-bold">{word.question}</span>
              <span className="text-2xl text-teal-600">{word.reading}</span>
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="flex gap-4">
          <button
            onClick={() => handleAnswer(false)}
            className="cursor-pointer rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
          >
            不正解
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="cursor-pointer rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
          >
            正解
          </button>
        </div>
      )}
    </div>
  );
}
