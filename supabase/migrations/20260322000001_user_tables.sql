-- ユーザープロフィール（auth.usersから自動作成）
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- マイカード（1ユーザ1単語帳）
CREATE TABLE user_wordbook_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kanji_word_id INTEGER NOT NULL REFERENCES kanji_words(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, kanji_word_id)
);

CREATE INDEX idx_user_wordbook_entries_user_id ON user_wordbook_entries(user_id);

-- RLS 有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wordbook_entries ENABLE ROW LEVEL SECURITY;

-- profiles: 自分のプロフィールのみ参照・更新可能
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_wordbook_entries: 自分のエントリのみ全操作可能
CREATE POLICY "Users manage own wordbook entries" ON user_wordbook_entries
  FOR ALL USING (auth.uid() = user_id);

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

-- RPC: マイカードへの一括追加
CREATE OR REPLACE FUNCTION add_to_wordbook(p_kanji_word_ids INTEGER[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $$
BEGIN
  INSERT INTO public.user_wordbook_entries (user_id, kanji_word_id)
  SELECT auth.uid(), unnest(p_kanji_word_ids)
  ON CONFLICT (user_id, kanji_word_id) DO NOTHING;
END;
$$;

-- RPC: マイカードからの一括削除
CREATE OR REPLACE FUNCTION remove_from_wordbook(p_kanji_word_ids INTEGER[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $$
BEGIN
  DELETE FROM public.user_wordbook_entries
  WHERE user_id = auth.uid()
    AND kanji_word_id = ANY(p_kanji_word_ids);
END;
$$;

-- RPC関数の実行権限をauthenticatedロールに制限
REVOKE EXECUTE ON FUNCTION add_to_wordbook(INTEGER[]) FROM public;
GRANT EXECUTE ON FUNCTION add_to_wordbook(INTEGER[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION remove_from_wordbook(INTEGER[]) FROM public;
GRANT EXECUTE ON FUNCTION remove_from_wordbook(INTEGER[]) TO authenticated;
