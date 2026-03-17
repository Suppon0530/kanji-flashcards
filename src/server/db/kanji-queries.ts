import { kanjiArraySchema, kanjiWordsSchema } from "@/types/kanji";
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

export async function getAllKanji() {
  const { rows } = await pool.query(`
    SELECT
      character,
      grade,
      stroke_count AS "strokeCount",
      onyomi,
      kunyomi,
      meaning
    FROM kanji
    ORDER BY grade, character
  `);

  return kanjiArraySchema.parse(rows);
}

export async function getKanjiByGrade(grade: number) {
  const { rows } = await pool.query(
    `
    SELECT
      character,
      grade,
      stroke_count AS "strokeCount",
      onyomi,
      kunyomi,
      meaning
    FROM kanji
    WHERE grade = $1
    ORDER BY character
  `,
    [grade],
  );

  return kanjiArraySchema.parse(rows);
}
