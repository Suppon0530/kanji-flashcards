import { kanjiArraySchema, kanjiWordsSchema, wordUpdateHistorySchema } from "@/types/kanji";
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

export async function getKanjiWordsByGrade(grade: number) {
  const condition = grade >= 8 ? "grade >= $1" : "grade = $1";
  const { rows } = await pool.query(
    `
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
    WHERE ${condition}
    ORDER BY id
  `,
    [grade],
  );

  return kanjiWordsSchema.parse(rows);
}

export async function getWordUpdateHistory() {
  const { rows } = await pool.query(`
    SELECT
      TO_CHAR(created_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD') AS "updateDate",
      ARRAY_AGG(DISTINCT grade ORDER BY grade) AS grades,
      COUNT(*)::int AS "wordCount"
    FROM kanji_words
    GROUP BY "updateDate"
    ORDER BY "updateDate" DESC
  `);

  return wordUpdateHistorySchema.parse(rows);
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
