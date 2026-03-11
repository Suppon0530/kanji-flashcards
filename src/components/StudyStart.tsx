type StudyStartProps = {
  totalWords: number;
  onStart: () => void;
};

export function StudyStart({ totalWords, onStart }: StudyStartProps) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <h1 className="text-3xl font-bold">漢字フラッシュカード</h1>
      <p className="text-lg text-zinc-500">
        {totalWords}語の中からランダムに5問出題します。
        <br />
        カードをめくって、読みと意味を確認しましょう。
      </p>
      <button
        onClick={onStart}
        className="cursor-pointer rounded-xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-teal-700"
      >
        学習を始める
      </button>
    </div>
  );
}
