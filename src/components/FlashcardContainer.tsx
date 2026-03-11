"use client";

import { useState } from "react";
import type { KanjiWord, StudyState } from "@/types/kanji";
import { pickRandomWords } from "@/lib/flashcard-utils";
import { StudyStart } from "@/components/StudyStart";
import { Flashcard } from "@/components/Flashcard";
import { StudyResult } from "@/components/StudyResult";

const QUESTION_COUNT = 5;

type FlashcardContainerProps = {
  words: KanjiWord[];
};

export function FlashcardContainer({ words }: FlashcardContainerProps) {
  const [state, setState] = useState<StudyState>({ phase: "start" });

  const handleStart = () => {
    const questions = pickRandomWords(words, QUESTION_COUNT);
    setState({ phase: "card", currentIndex: 0, questions, answers: [] });
  };

  const handleAnswer = (correct: boolean) => {
    if (state.phase !== "card") return;

    const newAnswers = [...state.answers, { wordId: state.questions[state.currentIndex].id, correct }];
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.questions.length) {
      setState({ phase: "result", questions: state.questions, answers: newAnswers });
    } else {
      setState({ ...state, currentIndex: nextIndex, answers: newAnswers });
    }
  };

  switch (state.phase) {
    case "start":
      return <StudyStart totalWords={words.length} onStart={handleStart} />;
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
          onRestart={handleStart}
        />
      );
  }
}
