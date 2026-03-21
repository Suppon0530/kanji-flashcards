-- 常用漢字マスターテーブル
CREATE TABLE kanji (
  id             SERIAL       PRIMARY KEY,
  character      CHAR(1)      NOT NULL UNIQUE,
  grade          INTEGER      NOT NULL CHECK (grade >= 1 AND grade <= 10),
  kanjipedia_url TEXT
);

-- 問題テーブル
CREATE TABLE kanji_words (
  id         SERIAL       PRIMARY KEY,
  question   VARCHAR(20)  NOT NULL,
  reading    VARCHAR(50)  NOT NULL,
  kanji_id_1 INTEGER      NOT NULL REFERENCES kanji(id) ON DELETE CASCADE,
  kanji_id_2 INTEGER      REFERENCES kanji(id) ON DELETE CASCADE,
  kanji_id_3 INTEGER      REFERENCES kanji(id) ON DELETE CASCADE,
  kanji_id_4 INTEGER      REFERENCES kanji(id) ON DELETE CASCADE,
  grade      INTEGER      NOT NULL CHECK (grade >= 1 AND grade <= 10)
);
