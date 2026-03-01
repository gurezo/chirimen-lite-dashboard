# Issue #273: Angular MCP サーバー追加 - 実装プラン

## 概要

Angular CLI に含まれる Model Context Protocol (MCP) サーバーを Cursor の MCP 設定に追加し、AI アシスタントが Angular CLI と対話できるようにする。

参考: https://angular.jp/ai/mcp

## 背景

- Angular CLI には実験的な MCP サーバーが含まれており、コード生成、パッケージ追加、ドキュメント検索などの開発ワークフローを支援する
- プロジェクトは Angular 21 を使用しており、`@angular/cli` は既に devDependencies に含まれている
- 現在 `.cursor/mcp.json` には Nx MCP サーバーのみが設定されている

## 実装内容

### 1. `.cursor/mcp.json` の更新

既存の `nx-mcp` 設定に加えて、`angular-cli` MCP サーバーを追加する。

**追加する設定:**
```json
{
  "angular-cli": {
    "command": "npx",
    "args": ["-y", "@angular/cli", "mcp"]
  }
}
```

### 2. 利用可能になるツール（デフォルト）

| ツール名 | 説明 |
| --- | --- |
| `ai_tutor` | インタラクティブな AI 駆動の Angular チューター |
| `find_examples` | 公式ベストプラクティス例の検索 |
| `get_best_practices` | Angular ベストプラクティスガイドの取得 |
| `list_projects` | ワークスペース内のアプリ・ライブラリ一覧 |
| `onpush_zoneless_migration` | OnPush 変更検知への移行計画 |
| `search_documentation` | Angular 公式ドキュメントの検索 |

### 3. オプション（必要に応じて）

- `--read-only`: プロジェクトに変更を加えないツールのみ登録
- `--local-only`: インターネット接続を必要としないツールのみ登録
- `--experimental-tool`: 実験的ツール（build, devserver, test 等）の有効化

## 作業手順

1. Conventional Commits 準拠のブランチを作成（例: `feat/add-angular-mcp-server`）
2. `.cursor/mcp.json` に Angular CLI MCP サーバー設定を追加
3. Conventional Commits 形式でコミット
4. リモートにプッシュ
5. プルリクエストを作成

## 影響範囲

- **変更ファイル**: `.cursor/mcp.json` のみ
- **既存機能への影響**: なし（追加のみ）
- **依存関係**: 既存の `@angular/cli` を使用するため、新規パッケージの追加は不要

## 検証方法

1. Cursor を再起動するか、MCP サーバーを再読み込み
2. MCP ツール一覧に `angular-cli` が表示されることを確認
3. `list_projects` 等のツールが正常に動作することを確認
