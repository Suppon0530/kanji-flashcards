import { getAllKanjiWords, getWordUpdateHistory } from "@/server/db/kanji-queries";
import { TopPage } from "@/components/TopPage";

export default async function Home() {
  const [words, history] = await Promise.all([
    getAllKanjiWords(),
    getWordUpdateHistory(),
  ]);

  return <TopPage words={words} history={history} />;
}
