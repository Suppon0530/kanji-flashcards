import type { KanjiWord } from "@/types/kanji";
import { TopHeader } from "@/components/TopHeader";
import { UpdateHistory } from "@/components/UpdateHistory";
import { TopPageContent } from "@/components/TopPageContent";
import { TopFooter } from "@/components/TopFooter";

type TopPageProps = {
  words: KanjiWord[];
};

export function TopPage({ words }: TopPageProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <UpdateHistory />
          <TopPageContent words={words} />
        </div>
      </main>

      <TopFooter />
    </div>
  );
}
