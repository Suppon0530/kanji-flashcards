"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { createClient } from "@/lib/supabase/server";
import { wordbookArraySchema, wordbookDetailSchema } from "@/types/wordbook";

// --- 読み取り ---

export async function getWordbooks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("wordbooks")
    .select("id, name, created_at, wordbook_entries(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return wordbookArraySchema.parse(data);
}

export async function getWordbookDetail(wordbookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("wordbooks")
    .select(
      "id, name, wordbook_entries(id, kanji_word_id, note, kanji_words(id, question, reading, grade))",
    )
    .eq("id", wordbookId)
    .single();

  if (error) return null;
  return wordbookDetailSchema.parse(data);
}

// --- 書き込み（RPC: 全操作1 API call） ---

const saveSchema = z.object({
  wordbookId: z.string().uuid().nullable(),
  name: z.string().min(1),
  wordIds: z.array(z.number().int().positive()).min(1),
});

export async function saveToWordbook(
  wordbookId: string | null,
  name: string,
  wordIds: number[],
) {
  const parsed = saveSchema.safeParse({ wordbookId, name, wordIds });
  if (!parsed.success) {
    return { error: "入力内容が正しくありません。" };
  }

  const supabase = await createClient();

  if (parsed.data.wordbookId) {
    const { error } = await supabase.rpc("add_wordbook_entries", {
      p_wordbook_id: parsed.data.wordbookId,
      p_kanji_word_ids: parsed.data.wordIds,
    });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.rpc("create_wordbook_with_entries", {
      p_name: parsed.data.name,
      p_kanji_word_ids: parsed.data.wordIds,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/wordbook");
  return { success: true };
}

export async function removeFromWordbook(
  wordbookId: string,
  wordIds: number[],
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("remove_wordbook_entries", {
    p_wordbook_id: wordbookId,
    p_kanji_word_ids: wordIds,
  });

  if (error) return { error: error.message };

  revalidatePath(`/wordbook/${wordbookId}`);
  return { success: true };
}

export async function deleteWordbook(wordbookId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("wordbooks")
    .delete()
    .eq("id", wordbookId);

  if (error) return { error: error.message };

  revalidatePath("/wordbook");
  return { success: true };
}

export async function renameWordbook(wordbookId: string, name: string) {
  if (!name.trim()) return { error: "名前を入力してください。" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("wordbooks")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", wordbookId);

  if (error) return { error: error.message };

  revalidatePath("/wordbook");
  return { success: true };
}
