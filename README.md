# devcontainer-next

Docker + Dev Container ベースの Next.js 15 開発環境。

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- pnpm
- Docker / Dev Container

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/) + [Dev Containers 拡張](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Getting Started

1. リポジトリをクローン
2. VS Code で開く
3. コマンドパレット → **Dev Containers: Reopen in Container**
4. コンテナ内で `pnpm dev` を実行

## Commands

| コマンド | 説明 |
|---|---|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm lint` | ESLint 実行 |
