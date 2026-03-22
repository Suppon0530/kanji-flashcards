-- 単語帳の新規作成 + 複数エントリの一括追加（1 API call）
CREATE OR REPLACE FUNCTION create_wordbook_with_entries(
  p_name TEXT,
  p_kanji_word_ids INTEGER[]
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_wordbook_id UUID;
BEGIN
  INSERT INTO wordbooks (user_id, name)
  VALUES (auth.uid(), p_name)
  RETURNING id INTO v_wordbook_id;

  INSERT INTO wordbook_entries (wordbook_id, kanji_word_id)
  SELECT v_wordbook_id, unnest(p_kanji_word_ids);

  RETURN v_wordbook_id;
END;
$$;

-- 既存単語帳への複数エントリ一括追加（1 API call）
CREATE OR REPLACE FUNCTION add_wordbook_entries(
  p_wordbook_id UUID,
  p_kanji_word_ids INTEGER[]
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- 所有者チェック
  IF NOT EXISTS (
    SELECT 1 FROM wordbooks WHERE id = p_wordbook_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO wordbook_entries (wordbook_id, kanji_word_id)
  SELECT p_wordbook_id, unnest(p_kanji_word_ids)
  ON CONFLICT (wordbook_id, kanji_word_id) DO NOTHING;
END;
$$;

-- 複数エントリの一括削除（1 API call）
CREATE OR REPLACE FUNCTION remove_wordbook_entries(
  p_wordbook_id UUID,
  p_kanji_word_ids INTEGER[]
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM wordbooks WHERE id = p_wordbook_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM wordbook_entries
  WHERE wordbook_id = p_wordbook_id
    AND kanji_word_id = ANY(p_kanji_word_ids);
END;
$$;

-- RPC関数の実行権限を認証済みユーザーのみに制限
REVOKE EXECUTE ON FUNCTION create_wordbook_with_entries FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION add_wordbook_entries FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION remove_wordbook_entries FROM PUBLIC;

GRANT EXECUTE ON FUNCTION create_wordbook_with_entries TO authenticated;
GRANT EXECUTE ON FUNCTION add_wordbook_entries TO authenticated;
GRANT EXECUTE ON FUNCTION remove_wordbook_entries TO authenticated;
