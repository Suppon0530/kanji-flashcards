import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

type KanjiWord = {
  question: string;
  reading: string;
  kanjiChars: string[];
};

type KanjiIdEntry = {
  id: number;
  grade: number;
};

function extractKanji(str: string): string[] {
  return [...str].filter((c) => {
    const cp = c.codePointAt(0)!;
    return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf);
  });
}

const dataDir = join(__dirname, "data");
const wordsPath = join(dataDir, "kanji-words.csv");
const kanjiSeedPath = join(__dirname, "..", "db", "init", "02-seed-kanji.sql");
const wordsSqlPath = join(__dirname, "..", "db", "init", "03-seed-words.sql");

/**
 * 02-seed-kanji.sql をパースして character→{id, grade} のマップを構築。
 * INSERT文の各行から (character, grade, url) を抽出し、挿入順で id=1,2,3... を割り当てる。
 */
function buildKanjiIdMap(seedSql: string): Map<string, KanjiIdEntry> {
  const map = new Map<string, KanjiIdEntry>();
  // ('X', grade, 'url') または ('X', grade, NULL) にマッチ
  const regex = /\('(.)'\s*,\s*(\d+)\s*,/g;
  let match: RegExpExecArray | null;
  let id = 1;

  while ((match = regex.exec(seedSql)) !== null) {
    const character = match[1];
    const grade = parseInt(match[2], 10);
    map.set(character, { id, grade });
    id++;
  }

  return map;
}

const kanjiSeedSql = readFileSync(kanjiSeedPath, "utf-8");
const kanjiIdMap = buildKanjiIdMap(kanjiSeedSql);
console.log(`Loaded ${kanjiIdMap.size} kanji from seed SQL`);

const csvContent = readFileSync(wordsPath, "utf-8");
const words: KanjiWord[] = csvContent
  .trim()
  .split("\n")
  .slice(1)
  .map((line) => {
    const [question, reading] = line.split(",");
    return { question, reading, kanjiChars: extractKanji(question) };
  });

function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

// バリデーション
const errors: string[] = [];

for (const word of words) {
  if (word.kanjiChars.length === 0 || word.kanjiChars.length > 4) {
    errors.push(`Word "${word.question}": kanjiChars must have 1-4 entries`);
  }
  for (const char of word.kanjiChars) {
    if (!kanjiIdMap.has(char)) {
      errors.push(`Word "${word.question}": kanji '${char}' not found in kanji table`);
    }
  }
}

if (errors.length > 0) {
  console.error("Validation errors:");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

// SQL生成
const wordLines = words.map((w) => {
  const ids = w.kanjiChars.map((c) => kanjiIdMap.get(c)!);
  const kanjiId1 = ids[0].id;
  const kanjiId2 = ids[1]?.id ?? "NULL";
  const kanjiId3 = ids[2]?.id ?? "NULL";
  const kanjiId4 = ids[3]?.id ?? "NULL";
  const grade = Math.max(...ids.map((e) => e.grade));

  return `  ('${escapeSQL(w.question)}', '${escapeSQL(w.reading)}', ${kanjiId1}, ${kanjiId2}, ${kanjiId3}, ${kanjiId4}, ${grade})`;
});

const wordsSql = `INSERT INTO kanji_words (question, reading, kanji_id_1, kanji_id_2, kanji_id_3, kanji_id_4, grade) VALUES\n${wordLines.join(",\n")};\n`;
writeFileSync(wordsSqlPath, wordsSql, "utf-8");
console.log(`Generated ${words.length} word entries → ${wordsSqlPath}`);
