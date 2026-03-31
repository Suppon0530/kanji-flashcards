"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/server/actions/auth-actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string | undefined } | null, formData: FormData) => {
      const result = await signIn(formData);
      // signIn は成功時に redirect するため、ここに来るのはエラー時のみ
      return result ?? null;
    },
    null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            ずぼ漢にログイン
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {state.error}
            </p>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              ユーザー名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              パスワード
            </label>
            <input
              id="password"
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
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {pending ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
