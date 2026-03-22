-- 単語帳を1ユーザ1つに簡素化（wordbooks テーブル不要）

-- 旧RPC関数の削除
DROP FUNCTION IF EXISTS create_wordbook_with_entries(TEXT, INTEGER[]);
DROP FUNCTION IF EXISTS add_wordbook_entries(UUID, INTEGER[]);
DROP FUNCTION IF EXISTS remove_wordbook_entries(UUID, INTEGER[]);

-- 旧テーブルの削除
DROP TABLE IF EXISTS wordbook_entries;
DROP TABLE IF EXISTS wordbooks;

-- 新テーブル: ユーザごとの単語帳エントリ（1ユーザ1単語帳）
CREATE TABLE user_wordbook_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kanji_word_id INTEGER NOT NULL REFERENCES kanji_words(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, kanji_word_id)
);

CREATE INDEX idx_user_wordbook_entries_user_id ON user_wordbook_entries(user_id);

-- RLS
ALTER TABLE user_wordbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wordbook entries" ON user_wordbook_entries
  FOR ALL USING (auth.uid() = user_id);

-- RPC: 一括追加
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

-- RPC: 一括削除
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
