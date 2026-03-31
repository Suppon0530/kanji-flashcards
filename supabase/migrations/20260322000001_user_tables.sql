-- ユーザープロフィール（auth.usersから自動作成）
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_username_format CHECK (username ~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{2,19}$')
);

-- ユーザー名ユニークインデックス（大文字小文字を区別しない）
CREATE UNIQUE INDEX idx_profiles_username_lower ON profiles (LOWER(username));

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
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'username', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RPC: ユーザー名からメールアドレスを取得（ログイン時に使用）
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE LOWER(username) = LOWER(p_username);

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;

  RETURN v_email;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_email_by_username(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO authenticated;

-- RPC: ユーザー名の重複チェック
CREATE OR REPLACE FUNCTION check_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(p_username)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION check_username_available(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION check_username_available(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_username_available(TEXT) TO authenticated;

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
