import { kanjiArraySchema, kanjiWordsSchema } from "@/types/kanji";
import { pool } from "./client";

export async function getAllKanjiWords() {
  const { rows } = await pool.query(`
    SELECT
      id,
      question,
      reading,
      grade
    FROM kanji_words
    ORDER BY id
  `);

  return kanjiWordsSchema.parse(rows);
}

export async function getAllKanji() {
  const { rows } = await pool.query(`
    SELECT
      id,
      character,
      grade,
      kanjipedia_url AS "kanjipediaUrl"
    FROM kanji
    ORDER BY grade, character
  `);

  return kanjiArraySchema.parse(rows);
}

export async function getKanjiWordsByGrade(grade: number) {
  const condition = "grade = $1";
  const { rows } = await pool.query(
    `
    SELECT
      id,
      question,
      reading,
      grade
    FROM kanji_words
    WHERE ${condition}
    ORDER BY id
  `,
    [grade],
  );

  return kanjiWordsSchema.parse(rows);
}

export async function getKanjiByGrade(grade: number) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      character,
      grade,
      kanjipedia_url AS "kanjipediaUrl"
    FROM kanji
    WHERE grade = $1
    ORDER BY character
  `,
    [grade],
  );

  return kanjiArraySchema.parse(rows);
}
