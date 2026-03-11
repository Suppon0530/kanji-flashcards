CREATE TABLE kanji_words (
  id               VARCHAR(10)  PRIMARY KEY,
  kanji            VARCHAR(20)  NOT NULL,
  reading          VARCHAR(50)  NOT NULL,
  meaning          VARCHAR(100) NOT NULL,
  example_sentence TEXT         NOT NULL,
  example_reading  TEXT         NOT NULL,
  example_meaning  TEXT         NOT NULL,
  grade            INTEGER      NOT NULL CHECK (grade >= 1 AND grade <= 6)
);
