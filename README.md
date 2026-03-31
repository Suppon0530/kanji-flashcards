# ずぼ漢

漢字の読みと意味を学ぶフラッシュカードアプリ。

## 機能

- 学年別の漢字熟語フラッシュカード学習
- 4 択式の出題（読み問題）
- 学習結果の表示（正答率・問題別の正誤）
- マイカード機能（ログインユーザー向け）
  - 学習結果から単語を登録 / 解除
  - 学年ページからチェックで登録 / 解除
  - マイカードを出題範囲として選択可能
- ユーザー名 + パスワードによるユーザー認証
- メールアドレスは任意で後から登録可能

## Tech Stack

- **フレームワーク**: Next.js 16 (App Router) / React 19
- **言語**: TypeScript (strict)
- **スタイリング**: Tailwind CSS 4
- **バックエンド**: Supabase (PostgreSQL + Auth)
- **バリデーション**: Zod 4
- **パッケージマネージャー**: pnpm
- **開発環境**: Docker / VS Code Dev Containers

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/) + [Dev Containers 拡張](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Supabase プロジェクト（または `supabase` CLI でローカル起動）

## Getting Started

1. リポジトリをクローン
2. `.env.local` を作成（`.env.example` を参照）
3. VS Code で開き、コマンドパレット → **Dev Containers: Reopen in Container**
4. コンテナ内で `pnpm dev` を実行

## 環境変数

| 変数名                         | 説明                     |
| ------------------------------ | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key        |

## Commands

| コマンド       | 説明               |
| -------------- | ------------------ |
| `pnpm dev`     | 開発サーバー起動   |
| `pnpm build`   | プロダクションビルド |
| `pnpm lint`    | ESLint 実行        |

## ディレクトリ構成

```
src/
├── app/            # ルーティング・ページ (App Router)
├── components/     # 機能別コンポーネント
├── hooks/          # カスタムフック
├── lib/            # ユーティリティ・定数・Supabase クライアント
├── server/actions/ # Server Actions
├── server/db/      # DB クエリ
└── types/          # 共通型定義

supabase/
├── migrations/     # スキーマ・RLS・RPC関数のマイグレーション
└── seed.sql        # シードデータ
```

## API 設計

### データ取得（Server Component）

各ページの Server Component で Supabase SDK を使って並列取得。クライアント側での DB 呼び出しはなし。

| ページ | API 呼び出し | 方法 |
|--------|-------------|------|
| `/` (トップ) | 全漢字熟語 + マイカード ID | `Promise.all` で並列取得 |
| `/grade/[id]` | 学年別熟語 + マイカード ID | `Promise.all` で並列取得 |
| `/wordbook` | マイカード全件（熟語データ含む） | ネストセレクト（1 call） |

### マイカード操作（Server Actions → RPC）

書き込み操作は PostgreSQL 関数（RPC）で一括処理し、API 呼び出しを最小化。

| 操作 | API 呼び出し数 | 方法 |
|------|---------------|------|
| 複数語を一括登録 | 1 | `add_to_wordbook` RPC |
| 複数語を一括削除 | 1 | `remove_from_wordbook` RPC |
| 全件削除 | 1 | DELETE クエリ |

### クライアント側の最適化

- **学習結果画面**: マイカード状態はページ取得時のデータを props で伝搬（追加の API 呼び出しなし）
- **学年ページ**: チェックボックス操作は 500ms のデバウンスでバッチ処理し、差分のみ送信
- **認証状態**: `@supabase/ssr` の Middleware で JWT を自動更新

### DB 設計

#### テーブル

```
kanji                          kanji_words
┌──────────────────────┐       ┌──────────────────────────┐
│ id          SERIAL PK│◄──┐   │ id          SERIAL PK    │
│ character   CHAR(1)  │   │   │ question    VARCHAR(20)  │
│ grade       INTEGER  │   ├───│ kanji_id_1  INTEGER FK   │
│ kanjipedia_url TEXT?  │   ├───│ kanji_id_2  INTEGER FK?  │
└──────────────────────┘   ├───│ kanji_id_3  INTEGER FK?  │
                           └───│ kanji_id_4  INTEGER FK?  │
                               │ grade       INTEGER      │
auth.users                     └─────────────┬────────────┘
┌──────────────┐                             │
│ id    UUID PK│◄──┐                         │
│ email TEXT   │   │   profiles               │
│ ...          │   │   ┌──────────────────┐   │
└──────────────┘   ├───│ id       UUID PK │   │
                   │   │ username TEXT UQ  │   │
                   │   │ display_name TEXT │   │
                   │   │ created_at TSTZ  │   │
                   │   └──────────────────┘   │
                   │                          │
                   │   user_wordbook_entries   │
                   │   ┌──────────────────────┐│
                   └───│ user_id    UUID FK   ││
                       │ kanji_word_id INT FK │┘
                       │ id         UUID PK   │
                       │ created_at TSTZ      │
                       │ UQ(user_id,          │
                       │    kanji_word_id)    │
                       └──────────────────────┘
```

#### RLS ポリシー

| テーブル | 操作 | ポリシー |
|---------|------|---------|
| `kanji` | SELECT | 全員許可 |
| `kanji_words` | SELECT | 全員許可 |
| `profiles` | SELECT / UPDATE | `auth.uid() = id` |
| `user_wordbook_entries` | ALL | `auth.uid() = user_id` |

#### RPC 関数

| 関数 | 用途 | 実行権限 |
|------|------|---------|
| `handle_new_user()` | サインアップ時にプロフィール自動作成（トリガー） | SECURITY DEFINER |
| `check_username_available(p_username)` | ユーザー名の重複チェック | anon / authenticated |
| `get_email_by_username(p_username)` | ユーザー名から auth.users.email を取得（ログイン用） | anon / authenticated |
| `add_to_wordbook(p_kanji_word_ids)` | マイカードへの一括追加 | authenticated |
| `remove_from_wordbook(p_kanji_word_ids)` | マイカードからの一括削除 | authenticated |

#### 認証方式

Supabase Auth はメールアドレスが必須のため、サインアップ時にプレースホルダーメール `{username}@zubokan.noreply` を内部生成する。ユーザーにはメールアドレスの存在を意識させず、ユーザー名 + パスワードで認証する。メールアドレスは設定ページから任意で登録可能。
