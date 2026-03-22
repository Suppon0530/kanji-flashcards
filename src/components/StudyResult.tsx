"use client";

import { useState, useEffect } from "react";
import type { KanjiWord, StudyAnswer } from "@/types/kanji";
import { calculateScore } from "@/lib/flashcard-utils";
import {
  addToWordbook,
  removeFromWordbook,
  getWordbookWordIds,
} from "@/server/actions/wordbook-actions";

type StudyResultProps = {
  questions: KanjiWord[];
  answers: StudyAnswer[];
  onRestart: () => void;
  onClose?: () => void;
};

export function StudyResult({
  questions,
  answers,
  onRestart,
  onClose,
}: StudyResultProps) {
  const { correct, total, percentage } = calculateScore(answers);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [originalWordbookIds, setOriginalWordbookIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getWordbookWordIds().then((ids) => {
      if (ids === null) {
        setReady(true);
        return;
      }
      setIsLoggedIn(true);

      const wordbookSet = new Set(ids);
      setOriginalWordbookIds(wordbookSet);

      const questionIdSet = new Set(questions.map((q) => q.id));
      const initial = new Set<number>();

      for (const id of wordbookSet) {
        if (questionIdSet.has(id)) initial.add(id);
      }
      questions.forEach((q, i) => {
        if (!answers[i]?.correct) initial.add(q.id);
      });

      setSelectedIds(initial);
      setReady(true);
    });
  }, [questions, answers]);

  const toggleWord = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveAndAction = (action: () => void) => {
    if (isLoggedIn && ready) {
      const questionIdSet = new Set(questions.map((q) => q.id));

      const toAdd = Array.from(selectedIds).filter(
        (id) => !originalWordbookIds.has(id),
      );
      const toRemove = Array.from(originalWordbookIds).filter(
        (id) => questionIdSet.has(id) && !selectedIds.has(id),
      );

      if (toAdd.length > 0) addToWordbook(toAdd);
      if (toRemove.length > 0) removeFromWordbook(toRemove);
    }
    action();
  };

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
          return isLoggedIn ? (
              <label
                key={word.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 select-none ${
                  isCorrect
                    ? "border-primary/30 bg-primary/10"
                    : "border-incorrect/30 bg-incorrect/10"
                }`}
              >
                <div className="flex flex-col">
                  <span className="whitespace-nowrap text-2xl font-bold">
                    {word.question}
                  </span>
                  <span className="whitespace-nowrap text-sm font-medium text-zinc-500">
                    {word.reading}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${isCorrect ? "text-primary" : "text-incorrect"}`}
                  >
                    {isCorrect ? "覚えた" : "覚えてない"}
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(word.id)}
                    onChange={() => toggleWord(word.id)}
                    className="grade-checkbox"
                  />
                </div>
              </label>
            ) : (
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
                  <span className="whitespace-nowrap text-sm font-medium text-zinc-500">
                    {word.reading}
                  </span>
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

      {isLoggedIn && (
        <p
          className={`text-xs text-zinc-400 ${selectedIds.size > 0 ? "" : "invisible"}`}
        >
          チェックした{selectedIds.size}語がマイカードに登録されます
        </p>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => handleSaveAndAction(onRestart)}
          className="cursor-pointer rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          もう一度
        </button>
        {onClose && (
          <button
            onClick={() => handleSaveAndAction(onClose)}
            className="cursor-pointer rounded-xl border border-zinc-300 px-8 py-4 text-lg font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
}
