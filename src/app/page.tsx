import { getAllKanjiWords } from "@/server/db/kanji-queries";
import { TopPage } from "@/components/TopPage";

export default async function Home() {
  const words = await getAllKanjiWords();

  return <TopPage words={words} />;
}
