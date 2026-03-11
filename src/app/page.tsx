import fs from "node:fs";
import path from "node:path";
import { kanjiWordsSchema } from "@/types/kanji";
import { FlashcardContainer } from "@/components/FlashcardContainer";

export default function Home() {
  const filePath = path.join(process.cwd(), "public/data/kanji-words.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const words = kanjiWordsSchema.parse(JSON.parse(raw));

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <main className="w-full max-w-lg">
        <FlashcardContainer words={words} />
      </main>
    </div>
  );
}
