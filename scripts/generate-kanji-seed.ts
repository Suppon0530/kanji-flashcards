import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

type KanjiEntry = {
  character: string;
  grade: number;
  kanjipediaUrl: string;
};

const GRADE_MAP: Record<string, number> = {
  "10級": 1,
  "9級": 2,
  "8級": 3,
  "7級": 4,
  "6級": 5,
  "5級": 6,
  "4級": 7,
  "3級": 7,
  "準2級": 8,
  "2級": 8,
  "準1級": 9,
  "1級": 10,
};

const inputPath = join(__dirname, "data", "kanji.csv");
const outputPath = join(__dirname, "..", "db", "init", "02-seed-kanji.sql");

const csv = readFileSync(inputPath, "utf-8");
const lines = csv.trim().split("\n").slice(1); // skip header

const entries: KanjiEntry[] = [];

for (const line of lines) {
  const cols = line.split(",");
  const character = cols[3];
  const variant = cols[5];
  const level = cols[6];
  const url = cols[7];

  // 親字のみ、漢字テキストあり
  if (variant !== "親字" || !character) continue;

  const grade = GRADE_MAP[level];
  if (grade === undefined) continue;

  entries.push({ character, grade, kanjipediaUrl: url });
}

function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

function toSQL(entry: KanjiEntry): string {
  const url = entry.kanjipediaUrl
    ? `'${escapeSQL(entry.kanjipediaUrl)}'`
    : "NULL";
  return `  ('${entry.character}', ${entry.grade}, ${url})`;
}

const sql = `INSERT INTO kanji (character, grade, kanjipedia_url) VALUES\n${entries.map(toSQL).join(",\n")};\n`;

writeFileSync(outputPath, sql, "utf-8");

console.log(`Generated ${entries.length} kanji entries → ${outputPath}`);
