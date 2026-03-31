"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AccountModal } from "@/components/AccountModal";

export function AccountIconButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  // サーバー側の認証変更後にクライアント側の状態を同期する
  const refreshAuth = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 他コンポーネント（StudyResult等）からの認証変更通知を受け取る
    const handleAuthRefresh = () => {
      refreshAuth();
    };
    window.addEventListener("auth-state-refresh", handleAuthRefresh);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("auth-state-refresh", handleAuthRefresh);
    };
  }, [refreshAuth]);

  return (
    <>
      <button
        onClick={() => {
          setModalKey((prev) => prev + 1);
          setIsModalOpen(true);
        }}
        aria-label="アカウント"
        className={`cursor-pointer rounded-full p-1.5 ${
          user
            ? "bg-primary text-white"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      </button>

      <AccountModal
        key={modalKey}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        loading={loading}
        onAuthChange={refreshAuth}
      />
    </>
  );
}
