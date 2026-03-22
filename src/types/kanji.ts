import { z } from "zod/v4";

export const kanjiSchema = z.object({
  id: z.number().int().positive(),
  character: z.string().length(1),
  grade: z.int().min(1).max(10),
  kanjipediaUrl: z.string().nullable(),
});

export const kanjiArraySchema = z.array(kanjiSchema);

export type Kanji = z.infer<typeof kanjiSchema>;

export const kanjiWordSchema = z.object({
  id: z.number().int().positive(),
  question: z.string(),
  reading: z.string(),
  grade: z.int().min(1).max(10),
});

export const kanjiWordsSchema = z.array(kanjiWordSchema);

export type KanjiWord = z.infer<typeof kanjiWordSchema>;

export type StudyAnswer = {
  wordId: number;
  correct: boolean;
};

export type StudyState =
  | { phase: "start" }
  | { phase: "card"; currentIndex: number; questions: KanjiWord[]; answers: StudyAnswer[] }
  | { phase: "result"; questions: KanjiWord[]; answers: StudyAnswer[] };
