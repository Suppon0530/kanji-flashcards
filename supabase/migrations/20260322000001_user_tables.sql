-- ユーザープロフィール（auth.usersから自動作成）
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 単語帳
CREATE TABLE wordbooks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 単語帳エントリ
CREATE TABLE wordbook_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wordbook_id   UUID NOT NULL REFERENCES wordbooks(id) ON DELETE CASCADE,
  kanji_word_id INTEGER NOT NULL REFERENCES kanji_words(id) ON DELETE CASCADE,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wordbook_id, kanji_word_id)
);

-- インデックス
CREATE INDEX idx_wordbooks_user_id ON wordbooks(user_id);
CREATE INDEX idx_wordbook_entries_wordbook_id ON wordbook_entries(wordbook_id);

-- RLS 有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordbook_entries ENABLE ROW LEVEL SECURITY;

-- profiles: 自分のプロフィールのみ参照・更新可能
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- wordbooks: 自分の単語帳のみ全操作可能
CREATE POLICY "Users manage own wordbooks" ON wordbooks
  FOR ALL USING (auth.uid() = user_id);

-- wordbook_entries: 自分の単語帳内のエントリのみ全操作可能
CREATE POLICY "Users manage own wordbook entries" ON wordbook_entries
  FOR ALL USING (
    wordbook_id IN (SELECT id FROM wordbooks WHERE user_id = auth.uid())
  );

-- サインアップ時にプロフィールを自動作成するトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
