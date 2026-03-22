import { kanjiArraySchema, kanjiWordsSchema } from "@/types/kanji";
import { createClient } from "./client";

const PAGE_SIZE = 1000;

export async function getAllKanjiWords() {
  const supabase = await createClient();
  const allRows: unknown[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("kanji_words")
      .select("id, question, reading, grade")
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return kanjiWordsSchema.parse(allRows);
}

export async function getAllKanji() {
  const supabase = await createClient();
  const allRows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("kanji")
      .select("id, character, grade, kanjipedia_url")
      .order("grade")
      .order("character")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const mapped = allRows.map((row) => ({
    ...row,
    kanjipediaUrl: row.kanjipedia_url,
  }));
  return kanjiArraySchema.parse(mapped);
}

export async function getKanjiWordsByGrade(grade: number) {
  const supabase = await createClient();
  const allRows: unknown[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("kanji_words")
      .select("id, question, reading, grade")
      .eq("grade", grade)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return kanjiWordsSchema.parse(allRows);
}

export async function getKanjiByGrade(grade: number) {
  const supabase = await createClient();
  const allRows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("kanji")
      .select("id, character, grade, kanjipedia_url")
      .eq("grade", grade)
      .order("character")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const mapped = allRows.map((row) => ({
    ...row,
    kanjipediaUrl: row.kanjipedia_url,
  }));
  return kanjiArraySchema.parse(mapped);
}
