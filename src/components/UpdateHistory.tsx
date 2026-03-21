const UPDATES = [
  { date: "2026-03-20", description: "漢検準1級・1級の問題を追加" },
  { date: "2026-03-17", description: "中学生・高校生の問題を追加" },
  { date: "2026-03-15", description: "小学1年〜6年の問題を初期登録" },
];

export function UpdateHistory() {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        問題更新履歴
      </h2>
      <ul className="space-y-2">
        {UPDATES.map((entry) => (
          <li key={entry.date} className="flex gap-3 text-sm">
            <time className="shrink-0 text-zinc-400">{entry.date}</time>
            <span className="text-zinc-600 dark:text-zinc-400">
              {entry.description}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
