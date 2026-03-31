"use client";

import { useState, useEffect, useCallback, useActionState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { SettingsForm } from "@/components/SettingsForm";
import {
  signInFromModal,
  signUpFromModal,
  signOutFromModal,
  getProfile,
} from "@/server/actions/auth-actions";

type AccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  loading: boolean;
  onAuthChange: () => Promise<void>;
};

type AuthFormState = {
  error?: string;
  success?: true;
} | null;

export function AccountModal({ isOpen, onClose, user, loading, onAuthChange }: AccountModalProps) {
  const router = useRouter();
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [isClosing, setIsClosing] = useState(false);
  const [profile, setProfile] = useState<{
    username: string;
    email: string | null;
  } | null>(null);
  // ログインフォーム
  const [loginState, loginAction, loginPending] = useActionState(
    async (_prev: AuthFormState, formData: FormData) => {
      const result = await signInFromModal(formData);
      return result ?? null;
    },
    null,
  );

  // 新規登録フォーム
  const [signupState, signupAction, signupPending] = useActionState(
    async (_prev: AuthFormState, formData: FormData) => {
      const result = await signUpFromModal(formData);
      return result ?? null;
    },
    null,
  );

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  // ログイン/新規登録成功時にクライアント認証状態を同期してモーダルを閉じる
  useEffect(() => {
    if (loginState?.success || signupState?.success) {
      onAuthChange().then(() => {
        router.refresh();
        handleClose();
      });
    }
  }, [loginState?.success, signupState?.success, handleClose, router, onAuthChange]);

  // プロフィール取得
  useEffect(() => {
    if (isOpen && user) {
      getProfile().then((data) => {
        setProfile(
          data
            ? { username: data.username, email: data.email }
            : { username: "", email: null },
        );
      });
    }
  }, [isOpen, user]);

  // プロフィールローディング状態（stateではなく導出）
  const profileLoading = isOpen && !!user && !profile;

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ESCキー
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  const handleLogout = async () => {
    await signOutFromModal();
    await onAuthChange();
    router.refresh();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${
        isClosing ? "modal-fade-out" : "modal-fade-in"
      }`}
    >
      <div
        className="fixed inset-0 bg-black/50"
        aria-hidden="true"
        onClick={handleClose}
      />
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="アカウント"
          className={`relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 ${
            isClosing ? "modal-slide-down" : "modal-slide-up"
          }`}
        >
          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            aria-label="閉じる"
            className="absolute top-4 right-4 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* コンテンツ */}
          {loading || profileLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-primary" />
            </div>
          ) : user ? (
            <SettingsView
              profile={profile}
              onLogout={handleLogout}
            />
          ) : authView === "login" ? (
            <LoginForm
              state={loginState}
              action={loginAction}
              pending={loginPending}
              onSwitchToSignup={() => setAuthView("signup")}
            />
          ) : (
            <SignupForm
              state={signupState}
              action={signupAction}
              pending={signupPending}
              onSwitchToLogin={() => setAuthView("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- ログインフォーム ---

function LoginForm({
  state,
  action,
  pending,
  onSwitchToSignup,
}: {
  state: AuthFormState;
  action: (payload: FormData) => void;
  pending: boolean;
  onSwitchToSignup: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        ログイン
      </h2>

      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div>
          <label
            htmlFor="login-username"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            ユーザー名
          </label>
          <input
            id="login-username"
            name="username"
            type="text"
            required
            autoComplete="username"
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            パスワード
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        アカウントをお持ちでない方は
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="ml-1 cursor-pointer font-medium text-primary hover:text-primary-hover"
        >
          新規登録
        </button>
      </p>
    </div>
  );
}

// --- 新規登録フォーム ---

function SignupForm({
  state,
  action,
  pending,
  onSwitchToLogin,
}: {
  state: AuthFormState;
  action: (payload: FormData) => void;
  pending: boolean;
  onSwitchToLogin: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        新規登録
      </h2>

      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div>
          <label
            htmlFor="signup-username"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            ユーザー名
          </label>
          <input
            id="signup-username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9][a-zA-Z0-9_-]*"
            autoComplete="username"
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            3〜20文字、英数字・アンダースコア・ハイフン
          </p>
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            パスワード
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            6文字以上
          </p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "登録中..." : "アカウントを作成"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        すでにアカウントをお持ちの方は
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="ml-1 cursor-pointer font-medium text-primary hover:text-primary-hover"
        >
          ログイン
        </button>
      </p>
    </div>
  );
}

// --- 設定ビュー ---

function SettingsView({
  profile,
  onLogout,
}: {
  profile: { username: string; email: string | null } | null;
  onLogout: () => void;
}) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await onLogout();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        設定
      </h2>

      {profile && (
        <SettingsForm username={profile.username} email={profile.email} />
      )}

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full cursor-pointer rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {loggingOut ? "ログアウト中..." : "ログアウト"}
        </button>
      </div>
    </div>
  );
}
