"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import type { KanjiWord, StudyAnswer } from "@/types/kanji";
import { calculateScore } from "@/lib/flashcard-utils";
import {
  addToWordbook,
  removeFromWordbook,
  getWordbookWordIds,
} from "@/server/actions/wordbook-actions";
import {
  signInFromModal,
  signUpFromModal,
} from "@/server/actions/auth-actions";

type AuthFormState = {
  error?: string;
  success?: true;
} | null;

type StudyResultProps = {
  questions: KanjiWord[];
  answers: StudyAnswer[];
  wordbookWordIds?: number[];
  onRestart: () => void;
  onClose?: () => void;
};

export function StudyResult({
  questions,
  answers,
  wordbookWordIds,
  onRestart,
  onClose,
}: StudyResultProps) {
  const router = useRouter();
  const { correct, total, percentage } = calculateScore(answers);

  const [isLoggedIn, setIsLoggedIn] = useState(wordbookWordIds !== undefined);
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("signup");

  const [originalWordbookIds, setOriginalWordbookIds] = useState<Set<number>>(
    () => {
      if (!wordbookWordIds) return new Set<number>();
      const questionIdSet = new Set(questions.map((q) => q.id));
      return new Set(wordbookWordIds.filter((id) => questionIdSet.has(id)));
    },
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    if (!wordbookWordIds) return new Set<number>();
    const questionIdSet = new Set(questions.map((q) => q.id));
    const initial = new Set<number>();
    for (const id of wordbookWordIds) {
      if (questionIdSet.has(id)) initial.add(id);
    }
    questions.forEach((q, i) => {
      if (!answers[i]?.correct) initial.add(q.id);
    });
    return initial;
  });

  const [loginState, loginAction, loginPending] = useActionState(
    async (_prev: AuthFormState, formData: FormData) => {
      const result = await signInFromModal(formData);
      return result ?? null;
    },
    null,
  );

  const [signupState, signupAction, signupPending] = useActionState(
    async (_prev: AuthFormState, formData: FormData) => {
      const result = await signUpFromModal(formData);
      return result ?? null;
    },
    null,
  );

  useEffect(() => {
    if (loginState?.success || signupState?.success) {
      getWordbookWordIds().then((ids) => {
        const wordbookIds = ids ?? [];
        const questionIdSet = new Set(questions.map((q) => q.id));

        const originalIds = new Set(
          wordbookIds.filter((id) => questionIdSet.has(id)),
        );
        setOriginalWordbookIds(originalIds);

        const selected = new Set(originalIds);
        questions.forEach((q, i) => {
          if (!answers[i]?.correct) selected.add(q.id);
        });
        setSelectedIds(selected);

        setIsLoggedIn(true);
        setShowAuth(false);
        window.dispatchEvent(new Event("auth-state-refresh"));
        router.refresh();
      });
    }
  }, [loginState?.success, signupState?.success, questions, answers, router]);

  const toggleWord = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveAndAction = (action: () => void) => {
    if (isLoggedIn) {
      const toAdd = Array.from(selectedIds).filter(
        (id) => !originalWordbookIds.has(id),
      );
      const toRemove = Array.from(originalWordbookIds).filter(
        (id) => !selectedIds.has(id),
      );

      if (toAdd.length > 0) addToWordbook(toAdd);
      if (toRemove.length > 0) removeFromWordbook(toRemove);
    }
    action();
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">結果</h2>

      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl font-bold text-primary">{percentage}%</span>
        <span className="text-zinc-500">
          {total}問中{correct}問覚えた
        </span>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {questions.map((word, i) => {
          const isCorrect = answers[i]?.correct ?? false;
          return isLoggedIn ? (
            <label
              key={word.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 select-none ${
                isCorrect
                  ? "border-primary/30 bg-primary/10"
                  : "border-incorrect/30 bg-incorrect/10"
              }`}
            >
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-2xl font-bold">
                  {word.question}
                </span>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-500">
                  {word.reading}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${isCorrect ? "text-primary" : "text-incorrect"}`}
                >
                  {isCorrect ? "覚えた" : "覚えてない"}
                </span>
                <input
                  type="checkbox"
                  checked={selectedIds.has(word.id)}
                  onChange={() => toggleWord(word.id)}
                  className="grade-checkbox"
                />
              </div>
            </label>
          ) : (
            <div
              key={word.id}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                isCorrect
                  ? "border-primary/30 bg-primary/10"
                  : "border-incorrect/30 bg-incorrect/10"
              }`}
            >
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-2xl font-bold">
                  {word.question}
                </span>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-500">
                  {word.reading}
                </span>
              </div>
              <span
                className={`text-sm font-semibold ${isCorrect ? "text-primary" : "text-incorrect"}`}
              >
                {isCorrect ? "覚えた" : "覚えてない"}
              </span>
            </div>
          );
        })}
      </div>

      {isLoggedIn && (
        <p
          className={`text-xs text-zinc-400 ${selectedIds.size > 0 ? "" : "invisible"}`}
        >
          チェックした{selectedIds.size}語がマイカードに登録されます
        </p>
      )}

      {!isLoggedIn && !showAuth && (
        <button
          onClick={() => setShowAuth(true)}
          className="w-full max-w-sm cursor-pointer rounded-xl border-2 border-dashed border-primary/40 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5"
        >
          アカウント登録して問題にチェックする
        </button>
      )}

      {!isLoggedIn && showAuth && (
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
          {authView === "signup" ? (
            <ResultSignupForm
              state={signupState}
              action={signupAction}
              pending={signupPending}
              onSwitchToLogin={() => setAuthView("login")}
            />
          ) : (
            <ResultLoginForm
              state={loginState}
              action={loginAction}
              pending={loginPending}
              onSwitchToSignup={() => setAuthView("signup")}
            />
          )}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => handleSaveAndAction(onRestart)}
          className="cursor-pointer rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          もう一度
        </button>
        {onClose && (
          <button
            onClick={() => handleSaveAndAction(onClose)}
            className="cursor-pointer rounded-xl border border-zinc-300 px-8 py-4 text-lg font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
}

// --- ログインフォーム (リザルト画面用) ---

function ResultLoginForm({
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
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        ログイン
      </h3>

      <form action={action} className="space-y-3">
        {state?.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div>
          <label
            htmlFor="result-login-username"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            ユーザー名
          </label>
          <input
            id="result-login-username"
            name="username"
            type="text"
            required
            autoComplete="username"
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <label
            htmlFor="result-login-password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            パスワード
          </label>
          <input
            id="result-login-password"
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
          className="w-full cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
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

// --- 新規登録フォーム (リザルト画面用) ---

function ResultSignupForm({
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
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        新規登録
      </h3>

      <form action={action} className="space-y-3">
        {state?.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div>
          <label
            htmlFor="result-signup-username"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            ユーザー名
          </label>
          <input
            id="result-signup-username"
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
            htmlFor="result-signup-password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            パスワード
          </label>
          <input
            id="result-signup-password"
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
