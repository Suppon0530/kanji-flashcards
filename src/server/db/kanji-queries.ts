import { kanjiWordsSchema } from "@/types/kanji";
import { pool } from "./client";

export async function getAllKanjiWords() {
  const { rows } = await pool.query(`
    SELECT
      id,
      kanji,
      reading,
      meaning,
      example_sentence AS "exampleSentence",
      example_reading  AS "exampleReading",
      example_meaning  AS "exampleMeaning",
      grade
    FROM kanji_words
    ORDER BY id
  `);

  return kanjiWordsSchema.parse(rows);
}
