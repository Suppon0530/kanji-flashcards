"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { KanjiWord } from "@/types/kanji";
import {
  addToWordbook,
  removeFromWordbook,
} from "@/server/actions/wordbook-actions";

type GradeWordListProps = {
  words: KanjiWord[];
  wordbookWordIds: number[] | null;
};

export function GradeWordList({ words, wordbookWordIds }: GradeWordListProps) {
  const isLoggedIn = wordbookWordIds !== null;
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(
    () => new Set(wordbookWordIds ?? []),
  );

  const originalRef = useRef(new Set(wordbookWordIds ?? []));
  const bookmarkedRef = useRef(bookmarkedIds);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flushChanges = useCallback((current: Set<number>) => {
    const original = originalRef.current;
    const toAdd = [...current].filter((id) => !original.has(id));
    const toRemove = [...original].filter((id) => !current.has(id));

    if (toAdd.length > 0) addToWordbook(toAdd);
    if (toRemove.length > 0) removeFromWordbook(toRemove);

    originalRef.current = new Set(current);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      flushChanges(bookmarkedRef.current);
    };
  }, [flushChanges]);

  const handleToggle = (wordId: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);

      bookmarkedRef.current = next;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => flushChanges(next), 500);

      return next;
    });
  };

  return (
    <div className="space-y-3">
      {words.length > 0 ? (
        words.map((word) =>
          isLoggedIn ? (
            <label
              key={word.id}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 p-4 transition-colors select-none hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-2xl font-bold">
                  {word.question}
                </span>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-500">
                  {word.reading}
                </span>
              </div>
              <input
                type="checkbox"
                checked={bookmarkedIds.has(word.id)}
                onChange={() => handleToggle(word.id)}
                className="grade-checkbox"
              />
            </label>
          ) : (
            <div
              key={word.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-2xl font-bold">
                  {word.question}
                </span>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-500">
                  {word.reading}
                </span>
              </div>
            </div>
          ),
        )
      ) : (
        <p className="py-8 text-center text-zinc-400">データがありません</p>
      )}
    </div>
  );
}
