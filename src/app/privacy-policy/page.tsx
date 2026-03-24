import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | ずぼ漢",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-700">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="text-lg font-bold text-primary hover:text-primary-hover"
          >
            ずぼ漢
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <h1 className="text-2xl font-bold">プライバシーポリシー</h1>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">1. 収集する個人情報</h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              本サービス「ずぼ漢」では、アカウント登録の際にメールアドレスを収集します。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">2. 利用目的</h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              収集したメールアドレスは、以下の目的で利用します。
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <li>アカウントの認証および管理</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">3. 第三者提供</h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              収集した個人情報は、法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">4. 個人情報の管理</h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              収集した個人情報は、適切な安全管理措置を講じ、不正アクセス・漏洩・紛失等の防止に努めます。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">5. ポリシーの変更</h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              本ポリシーの内容は、必要に応じて変更することがあります。変更後のポリシーは、本ページに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold">6. お問い合わせ</h2>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              個人情報の取り扱いに関するお問い合わせは、本サービスの運営者までご連絡ください。
            </p>
          </section>

          <p className="text-sm text-zinc-400">制定日: 2026年3月24日</p>
        </div>
      </main>
    </div>
  );
}
