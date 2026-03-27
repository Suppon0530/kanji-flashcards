"use client";

import { useActionState } from "react";
import { updateEmail } from "@/server/actions/auth-actions";

type SettingsFormProps = {
  username: string;
  email: string | null;
};

type FormState = {
  error: string | null;
  success: boolean;
  message?: string;
} | null;

export function SettingsForm({ username, email }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData) => {
      const result = await updateEmail(formData);
      return result ?? null;
    },
    null,
  );

  return (
    <div className="space-y-8">
      {/* ユーザー名（読み取り専用） */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          ユーザー名
        </h2>
        <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          {username}
        </p>
      </section>

      {/* メールアドレス */}
      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          メールアドレス
        </h2>

        <form action={formAction} className="space-y-3">
          {state?.error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {state.error}
            </p>
          )}
          {state?.success && state.message && (
            <p className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
              {state.message}
            </p>
          )}

          <input
            name="email"
            type="email"
            required
            defaultValue={email ?? ""}
            placeholder=""
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {pending ? "送信中..." : email ? "メールアドレスを変更" : "メールアドレスを追加"}
          </button>
        </form>
      </section>
    </div>
  );
}
