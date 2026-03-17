import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

type KanjiWord = {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  exampleSentence: string;
  exampleReading: string;
  exampleMeaning: string;
  grade: number;
  kanjiChars: string[];
};

type KanjiEntry = {
  character: string;
  grade: number;
  stroke_count: number;
  onyomi: string | null;
  kunyomi: string | null;
  meaning: string;
};

const dataDir = join(__dirname, "data");
const wordsPath = join(dataDir, "kanji-words.json");
const kanjiPath = join(dataDir, "jouyou-kanji.json");
const wordsSqlPath = join(__dirname, "..", "db", "init", "03-seed-words.sql");
const linksSqlPath = join(__dirname, "..", "db", "init", "04-seed-links.sql");

const words: KanjiWord[] = JSON.parse(readFileSync(wordsPath, "utf-8"));
const kanji: KanjiEntry[] = JSON.parse(readFileSync(kanjiPath, "utf-8"));

// Build kanji lookup set for validation
const kanjiSet = new Set(kanji.map((k) => k.character));

function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

// Validate referential integrity
const errors: string[] = [];
const seenIds = new Set<string>();

for (const word of words) {
  if (seenIds.has(word.id)) {
    errors.push(`Duplicate word ID: ${word.id}`);
  }
  seenIds.add(word.id);

  for (const char of word.kanjiChars) {
    if (!kanjiSet.has(char)) {
      errors.push(`Word ${word.id} (${word.kanji}): kanji '${char}' not found in kanji table`);
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

// Generate 03-seed-words.sql
const wordLines = words.map(
  (w) =>
    `  ('${w.id}', '${escapeSQL(w.kanji)}', '${escapeSQL(w.reading)}', '${escapeSQL(w.meaning)}', '${escapeSQL(w.exampleSentence)}', '${escapeSQL(w.exampleReading)}', '${escapeSQL(w.exampleMeaning)}', ${w.grade})`
);
const wordsSql = `INSERT INTO kanji_words (id, kanji, reading, meaning, example_sentence, example_reading, example_meaning, grade) VALUES\n${wordLines.join(",\n")};\n`;
writeFileSync(wordsSqlPath, wordsSql, "utf-8");
console.log(`Generated ${words.length} word entries → ${wordsSqlPath}`);

// Generate 04-seed-links.sql
const linkLines: string[] = [];
for (const word of words) {
  for (let i = 0; i < word.kanjiChars.length; i++) {
    linkLines.push(`  ('${word.id}', '${word.kanjiChars[i]}', ${i + 1})`);
  }
}
const linksSql = `INSERT INTO kanji_word_kanji (word_id, kanji_char, position) VALUES\n${linkLines.join(",\n")};\n`;
writeFileSync(linksSqlPath, linksSql, "utf-8");
console.log(`Generated ${linkLines.length} link entries → ${linksSqlPath}`);
