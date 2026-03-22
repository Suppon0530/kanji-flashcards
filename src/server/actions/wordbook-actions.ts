"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { wordbookEntriesSchema } from "@/types/wordbook";

const wordIdsSchema = z.array(z.number().int().positive()).min(1);

export async function getWordbookWordIds(): Promise<number[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_wordbook_entries")
    .select("kanji_word_id")
    .eq("user_id", user.id);

  if (error) return [];
  return data.map((row: { kanji_word_id: number }) => row.kanji_word_id);
}

export async function getWordbookEntries() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_wordbook_entries")
    .select("id, kanji_word_id, created_at, kanji_words(id, question, reading, grade)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return wordbookEntriesSchema.parse(data);
}

export async function addToWordbook(wordIds: number[]) {
  const parsed = wordIdsSchema.safeParse(wordIds);
  if (!parsed.success) return { error: "入力内容が正しくありません。" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_to_wordbook", {
    p_kanji_word_ids: parsed.data,
  });

  if (error) return { error: error.message };

  revalidatePath("/wordbook");
  return { success: true };
}

export async function removeFromWordbook(wordIds: number[]) {
  const parsed = wordIdsSchema.safeParse(wordIds);
  if (!parsed.success) return { error: "入力内容が正しくありません。" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_from_wordbook", {
    p_kanji_word_ids: parsed.data,
  });

  if (error) return { error: error.message };

  revalidatePath("/wordbook");
  return { success: true };
}

export async function clearWordbook() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "ログインしてください。" };

  const { error } = await supabase
    .from("user_wordbook_entries")
    .delete()
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/wordbook");
  return { success: true };
}
