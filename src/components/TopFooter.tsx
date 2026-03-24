import Link from "next/link";

export function TopFooter() {
  return (
    <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-400 dark:border-zinc-700">
      <nav className="mb-2">
        <Link
          href="/privacy-policy"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          プライバシーポリシー
        </Link>
      </nav>
      <p>&copy; 2026 ずぼ漢</p>
    </footer>
  );
}
