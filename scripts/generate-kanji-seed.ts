import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

type KanjiEntry = {
  character: string;
  grade: number;
  stroke_count: number;
  onyomi: string | null;
  kunyomi: string | null;
  meaning: string;
};

const inputPath = join(__dirname, "data", "jouyou-kanji.json");
const outputPath = join(__dirname, "..", "db", "init", "02-seed-kanji.sql");

const kanji: KanjiEntry[] = JSON.parse(readFileSync(inputPath, "utf-8"));

if (kanji.length !== 2136) {
  console.error(`ERROR: Expected 2136 kanji, got ${kanji.length}. Run build-kanji-data.ts first.`);
  process.exit(1);
}

function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

function toSQL(entry: KanjiEntry): string {
  const onyomi = entry.onyomi ? `'${escapeSQL(entry.onyomi)}'` : "NULL";
  const kunyomi = entry.kunyomi ? `'${escapeSQL(entry.kunyomi)}'` : "NULL";
  return `  ('${entry.character}', ${entry.grade}, ${entry.stroke_count}, ${onyomi}, ${kunyomi}, '${escapeSQL(entry.meaning)}')`;
}

const lines = kanji.map(toSQL);

const sql = `INSERT INTO kanji (character, grade, stroke_count, onyomi, kunyomi, meaning) VALUES\n${lines.join(",\n")};\n`;

writeFileSync(outputPath, sql, "utf-8");

console.log(`Generated ${kanji.length} kanji entries → ${outputPath}`);
