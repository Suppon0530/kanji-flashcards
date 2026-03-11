# Docker/Dev Container 開発環境ガイド

## プロジェクト全体

- 最小構成を意識すること。追加が必要な場合は理由と確認を必ずとること
‐ 常に最新の情報を収集すること
‐ セキュリティ・脆弱性対応を意識すること
‐ Dockerのベストプラクティスを参考にすること
- Dockerコンテナ内でのGitの利用を想定すること

```
project/
├── .devcontainer/
│   └── devcontainer.json
├── docker-compose.yml
└── Dockerfile
```

## Dockerfile

- Nodeは最新のLTSバージョンで軽量のものを使用すること
- rootではなくnodeで作業すること。rootで作業する場合は必ず確認すること
- 作業ディレクトリは、~/home/node/ディレクトリ名にすること
- パッケージマネージャーとしてpnpmを使用すること

## devcontainer.json

- remoteuserはnodeを指定すること
- nameはディレクトリ名の-を半角空白に変換したもの
- 拡張機能の基本構成は以下を使用すること
- フォーマッタとしてprettierを使用
- .vscode/settingsも合わせて作成すること

```
"vscode": {
  "extensions": [
    "formulahendry.auto-close-tag", // HTML Auto Close Tag
    "bradlc.vscode-tailwindcss", // Tailwind CSS IntelliSense
    "dbaeumer.vscode-eslint", // ESLint
    "esbenp.prettier-vscode", // prettier
    "PKief.material-icon-theme", // iconパック
    "xabikos.ReactSnippets", // React Code Snippets
    "xabikos.JavaScriptSnippets" // JS Code Snippets
  ]
}
```

## 拡張するとき

必要になった時点で追加する。先回りしない。

- **Redis 等のサービス追加** → `docker-compose.yml` に `healthcheck` 付きで追加
- **本番用 Compose** → `docker-compose.prod.yml` を作成、`restart: unless-stopped` を設定
- **VS Code 拡張の共有** → `devcontainer.json` に `customizations.vscode.extensions` を追加
- **CI での Dev Container** → `devcontainers/ci` action を使う
- **ビルド高速化** → `DOCKER_BUILDKIT=1` 有効化、`cache_from` 設定
