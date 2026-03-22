import { kanjiArraySchema, kanjiWordsSchema } from "@/types/kanji";
import { createClient } from "./client";

export async function getAllKanjiWords() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kanji_words")
    .select("id, question, reading, grade")
    .order("id");

  if (error) throw error;
  return kanjiWordsSchema.parse(data);
}

export async function getAllKanji() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kanji")
    .select("id, character, grade, kanjipedia_url")
    .order("grade")
    .order("character");

  if (error) throw error;

  const mapped = data.map((row) => ({
    ...row,
    kanjipediaUrl: row.kanjipedia_url,
  }));
  return kanjiArraySchema.parse(mapped);
}

export async function getKanjiWordsByGrade(grade: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kanji_words")
    .select("id, question, reading, grade")
    .eq("grade", grade)
    .order("id");

  if (error) throw error;
  return kanjiWordsSchema.parse(data);
}

export async function getKanjiByGrade(grade: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kanji")
    .select("id, character, grade, kanjipedia_url")
    .eq("grade", grade)
    .order("character");

  if (error) throw error;

  const mapped = data.map((row) => ({
    ...row,
    kanjipediaUrl: row.kanjipedia_url,
  }));
  return kanjiArraySchema.parse(mapped);
}
