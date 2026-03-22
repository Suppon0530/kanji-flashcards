import { getAllKanjiWords } from "@/server/db/kanji-queries";
import { getWordbookWordIds } from "@/server/actions/wordbook-actions";
import { TopPage } from "@/components/TopPage";

export default async function Home() {
  const [words, wordbookWordIds] = await Promise.all([
    getAllKanjiWords(),
    getWordbookWordIds(),
  ]);

  return <TopPage words={words} wordbookWordIds={wordbookWordIds} />;
}
