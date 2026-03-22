"use client";

import { useState, useMemo } from "react";
import type { KanjiWord, StudyState } from "@/types/kanji";
import { GRADE_LABELS } from "@/lib/constants";
import { pickRandomWords } from "@/lib/flashcard-utils";
import { StudyStart } from "@/components/StudyStart";
import { Flashcard } from "@/components/Flashcard";
import { StudyResult } from "@/components/StudyResult";

const QUESTION_COUNT = 5;

type FlashcardContainerProps = {
  words: KanjiWord[];
  showGradeSelection?: boolean;
  wordbookWordIds?: number[];
  onClose?: () => void;
};

export function FlashcardContainer({
  words,
  showGradeSelection = false,
  wordbookWordIds,
  onClose,
}: FlashcardContainerProps) {
  const [state, setState] = useState<StudyState>(() => {
    if (showGradeSelection) {
      return { phase: "start" };
    }
    const questions = pickRandomWords(words, QUESTION_COUNT);
    return { phase: "card", currentIndex: 0, questions, answers: [] };
  });
  const hasWordbook = !!wordbookWordIds;
  const [selectedGrades, setSelectedGrades] = useState<Set<number>>(
    () =>
      hasWordbook
        ? new Set()
        : new Set(Object.keys(GRADE_LABELS).map(Number)),
  );
  const [wordbookSelected, setWordbookSelected] = useState(hasWordbook);

  const wordbookIdSet = useMemo(
    () => new Set(wordbookWordIds ?? []),
    [wordbookWordIds],
  );

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

  const wordbookWordCount = useMemo(() => {
    if (!wordbookWordIds) return undefined;
    const wordIdSet = new Set(words.map((w) => w.id));
    return wordbookWordIds.filter((id) => wordIdSet.has(id)).length;
  }, [words, wordbookWordIds]);

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

  const handleSelectAll = () => {
    setSelectedGrades(new Set(Object.keys(GRADE_LABELS).map(Number)));
  };

  const handleClearAll = () => {
    setSelectedGrades(new Set());
  };

  const handleStart = () => {
    const pool = showGradeSelection ? filteredWords : words;
    const questions = pickRandomWords(pool, QUESTION_COUNT);
    setState({ phase: "card", currentIndex: 0, questions, answers: [] });
  };

  const handleAnswer = (correct: boolean) => {
    if (state.phase !== "card") return;

    const newAnswers = [
      ...state.answers,
      { wordId: state.questions[state.currentIndex].id, correct },
    ];
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.questions.length) {
      setState({
        phase: "result",
        questions: state.questions,
        answers: newAnswers,
      });
    } else {
      setState({ ...state, currentIndex: nextIndex, answers: newAnswers });
    }
  };

  const handleRestart = () => {
    setState({ phase: "start" });
  };

  switch (state.phase) {
    case "start":
      return (
        <StudyStart
          totalWords={showGradeSelection ? filteredWords.length : words.length}
          showGradeSelection={showGradeSelection}
          selectedGrades={selectedGrades}
          wordCountByGrade={wordCountByGrade}
          onToggle={handleToggle}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          onStart={handleStart}
          wordbookWordCount={wordbookWordCount}
          wordbookSelected={wordbookSelected}
          onWordbookToggle={() => setWordbookSelected((prev) => !prev)}
        />
      );
    case "card":
      return (
        <Flashcard
          key={state.questions[state.currentIndex].id}
          word={state.questions[state.currentIndex]}
          currentIndex={state.currentIndex}
          totalCount={state.questions.length}
          onAnswer={handleAnswer}
        />
      );
    case "result":
      return (
        <StudyResult
          questions={state.questions}
          answers={state.answers}
          onRestart={handleRestart}
          onClose={onClose}
        />
      );
  }
}
