import { readFileSync } from "fs";
import { join } from "path";

type KanjiEntry = {
  character: string;
  grade: number;
  stroke_count: number;
  onyomi: string | null;
  kunyomi: string | null;
  meaning: string;
};

const dataDir = join(__dirname, "data");

// Load consolidated data
const kanjiPath = join(dataDir, "jouyou-kanji.json");
const kanji: KanjiEntry[] = JSON.parse(readFileSync(kanjiPath, "utf-8"));

// Duplicate check
const seen = new Set<string>();
for (const entry of kanji) {
  if (seen.has(entry.character)) {
    console.error(`ERROR: Duplicate character: ${entry.character}`);
    process.exit(1);
  }
  seen.add(entry.character);
}

// Compare with official list
const officialText = readFileSync(join(dataDir, "jouyou-official.txt"), "utf-8").trim();
const officialChars = [...officialText];
const officialSet = new Set(officialChars);

const missing = officialChars.filter((c) => !seen.has(c));
if (missing.length > 0) {
  console.error(`ERROR: ${missing.length} kanji missing: ${missing.join("")}`);
  process.exit(1);
}

const extra = [...seen].filter((c) => !officialSet.has(c));
if (extra.length > 0) {
  console.error(`ERROR: ${extra.length} kanji not in official list: ${extra.join("")}`);
  process.exit(1);
}

if (kanji.length !== 2136) {
  console.error(`ERROR: Expected 2136 kanji, got ${kanji.length}`);
  process.exit(1);
}

// Grade distribution
const gradeCount: Record<number, number> = {};
for (const k of kanji) {
  gradeCount[k.grade] = (gradeCount[k.grade] || 0) + 1;
}

console.log(`Validated ${kanji.length} kanji ✓`);
for (const [grade, count] of Object.entries(gradeCount).sort()) {
  console.log(`  Grade ${grade}: ${count}`);
}
