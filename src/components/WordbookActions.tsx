"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  deleteWordbook,
  removeFromWordbook,
} from "@/server/actions/wordbook-actions";

type Entry = {
  id: string;
  kanji_word_id: number;
  note: string | null;
  kanji_words: {
    id: number;
    question: string;
    reading: string;
    grade: number;
  };
};

type WordbookActionsProps = {
  wordbookId: string;
  entries: Entry[];
};

export function WordbookActions({ wordbookId, entries }: WordbookActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("この単語帳を削除しますか？")) return;
    setPending(true);
    const result = await deleteWordbook(wordbookId);
    if (result.success) {
      router.push("/wordbook");
    } else {
      setPending(false);
      alert(result.error);
    }
  };

  const handleRemoveAll = async () => {
    if (!confirm("すべての単語を単語帳から削除しますか？")) return;
    setPending(true);
    const wordIds = entries.map((e) => e.kanji_word_id);
    const result = await removeFromWordbook(wordbookId, wordIds);
    if (!result.success) {
      alert(result.error);
    }
    setPending(false);
  };

  return (
    <div className="mb-4 flex gap-2">
      <button
        onClick={handleRemoveAll}
        disabled={pending || entries.length === 0}
        className="cursor-pointer rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        全単語を削除
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="cursor-pointer rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
      >
        単語帳を削除
      </button>
    </div>
  );
}
