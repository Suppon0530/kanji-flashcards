import { z } from "zod/v4";
import { kanjiWordSchema } from "./kanji";

export const wordbookSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.string(),
  wordbook_entries: z.array(z.object({ count: z.number() })),
});

export const wordbookArraySchema = z.array(wordbookSchema);

export type Wordbook = z.infer<typeof wordbookSchema>;

export const wordbookDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  wordbook_entries: z.array(
    z.object({
      id: z.string().uuid(),
      kanji_word_id: z.number(),
      note: z.string().nullable(),
      kanji_words: kanjiWordSchema,
    }),
  ),
});

export type WordbookDetail = z.infer<typeof wordbookDetailSchema>;
