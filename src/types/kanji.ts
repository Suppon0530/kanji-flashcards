import { z } from "zod/v4";

export const kanjiSchema = z.object({
  character: z.string().length(1),
  grade: z.int().min(1).max(7),
  strokeCount: z.int().min(1),
  onyomi: z.string().nullable(),
  kunyomi: z.string().nullable(),
  meaning: z.string(),
});

export const kanjiArraySchema = z.array(kanjiSchema);

export type Kanji = z.infer<typeof kanjiSchema>;

export const kanjiWordSchema = z.object({
  id: z.string(),
  kanji: z.string(),
  reading: z.string(),
  meaning: z.string(),
  exampleSentence: z.string(),
  exampleReading: z.string(),
  exampleMeaning: z.string(),
  grade: z.int().min(1).max(10),
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
