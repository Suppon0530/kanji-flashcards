import type { KanjiWord, StudyAnswer } from "@/types/kanji";

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function pickRandomWords(words: KanjiWord[], count: number): KanjiWord[] {
  return shuffle(words).slice(0, count);
}

export function calculateScore(answers: StudyAnswer[]): {
  correct: number;
  total: number;
  percentage: number;
} {
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { correct, total, percentage };
}
