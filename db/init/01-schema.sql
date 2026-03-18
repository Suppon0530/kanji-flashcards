-- 常用漢字マスターテーブル
CREATE TABLE kanji (
  character    CHAR(1)      PRIMARY KEY,
  grade        INTEGER      NOT NULL CHECK (grade >= 1 AND grade <= 7),
  stroke_count INTEGER      NOT NULL CHECK (stroke_count >= 1),
  onyomi       TEXT,
  kunyomi      TEXT,
  meaning      VARCHAR(200) NOT NULL
);

-- 問題テーブル
CREATE TABLE kanji_words (
  id               VARCHAR(10)  PRIMARY KEY,
  kanji            VARCHAR(20)  NOT NULL,
  reading          VARCHAR(50)  NOT NULL,
  meaning          VARCHAR(100) NOT NULL,
  example_sentence TEXT         NOT NULL,
  example_reading  TEXT         NOT NULL,
  example_meaning  TEXT         NOT NULL,
  grade            INTEGER      NOT NULL CHECK (grade >= 1 AND grade <= 10),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 問題-漢字 中間テーブル
CREATE TABLE kanji_word_kanji (
  word_id    VARCHAR(10) NOT NULL REFERENCES kanji_words(id) ON DELETE CASCADE,
  kanji_char CHAR(1)     NOT NULL REFERENCES kanji(character) ON DELETE CASCADE,
  position   INTEGER     NOT NULL CHECK (position >= 1),
  PRIMARY KEY (word_id, position)
);
