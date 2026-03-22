"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveToWordbook } from "@/server/actions/wordbook-actions";

type SaveToWordbookProps = {
  wordIds: number[];
};

export function SaveToWordbook({ wordIds }: SaveToWordbookProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  if (!isLoggedIn || wordIds.length === 0) return null;

  if (saved) {
    return (
      <p className="text-center text-sm font-medium text-primary">
        単語帳に保存しました
      </p>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full cursor-pointer rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        覚えてない単語を単語帳に保存（{wordIds.length}語）
      </button>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError("単語帳の名前を入力してください。");
      return;
    }
    setPending(true);
    setError("");
    const result = await saveToWordbook(null, name.trim(), wordIds);
    if (result.success) {
      setSaved(true);
    } else {
      setError(result.error ?? "保存に失敗しました。");
    }
    setPending(false);
  };

  return (
    <div className="w-full space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
      <p className="text-sm font-medium">
        新しい単語帳に保存（{wordIds.length}語）
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="単語帳の名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={pending}
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => setIsOpen(false)}
          disabled={pending}
          className="cursor-pointer rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
