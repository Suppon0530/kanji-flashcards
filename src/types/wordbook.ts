import { z } from "zod/v4";
import { kanjiWordSchema } from "./kanji";

export const wordbookEntrySchema = z.object({
  id: z.string().uuid(),
  kanji_word_id: z.number(),
  created_at: z.string(),
  kanji_words: kanjiWordSchema,
});

export const wordbookEntriesSchema = z.array(wordbookEntrySchema);

export type WordbookEntry = z.infer<typeof wordbookEntrySchema>;
