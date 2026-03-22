"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clearWordbook } from "@/server/actions/wordbook-actions";

type Entry = {
  id: string;
  kanji_word_id: number;
  created_at: string;
  kanji_words: {
    id: number;
    question: string;
    reading: string;
    grade: number;
  };
};

type WordbookActionsProps = {
  entries: Entry[];
};

export function WordbookActions({ entries }: WordbookActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClear = async () => {
    if (!confirm("マイカードのすべての単語を削除しますか？")) return;
    setPending(true);
    const result = await clearWordbook();
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
    setPending(false);
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleClear}
        disabled={pending || entries.length === 0}
        className="cursor-pointer rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
      >
        すべて削除
      </button>
    </div>
  );
}
