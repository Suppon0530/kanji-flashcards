import { getAllKanjiWords } from "@/server/db/kanji-queries";
import { FlashcardContainer } from "@/components/FlashcardContainer";

export default async function Home() {
  const words = await getAllKanjiWords();

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <main className="w-full max-w-lg">
        <FlashcardContainer words={words} />
      </main>
    </div>
  );
}
