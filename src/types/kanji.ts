import { z } from "zod/v4";

export const kanjiWordSchema = z.object({
  id: z.string(),
  kanji: z.string(),
  reading: z.string(),
  meaning: z.string(),
  exampleSentence: z.string(),
  exampleReading: z.string(),
  exampleMeaning: z.string(),
  grade: z.int().min(1).max(6),
});

export const kanjiWordsSchema = z.array(kanjiWordSchema);

export type KanjiWord = z.infer<typeof kanjiWordSchema>;

export type StudyAnswer = {
  wordId: string;
  correct: boolean;
};

export type StudyState =
  | { phase: "start" }
  | { phase: "card"; currentIndex: number; questions: KanjiWord[]; answers: StudyAnswer[] }
  | { phase: "result"; questions: KanjiWord[]; answers: StudyAnswer[] };
