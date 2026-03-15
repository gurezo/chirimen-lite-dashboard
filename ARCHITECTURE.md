# アーキテクチャ概要

本リポジトリは Nx モノレポです。メインアプリと機能別ライブラリで構成されています。

## 構成

- **apps/console** — CHIRIMEN Lite Console のメイン Angular アプリ。ルーティング・レイアウト・各機能画面を束ねる。
- **libs/** — ドメインまたは横断 concern ごとのライブラリ。アプリから `@libs-*` で参照する。

## 主な lib の役割

| カテゴリ | lib | 役割 |
|----------|-----|------|
| 接続・シェル | connect, console-shell | デバイス接続 UI・シェルレイアウト |
| 端末・編集 | terminal, editor | ターミナル表示・コードエディタ |
| 機能 | example, wifi, setup, file-manager, pin-assign-panel, remote, i2cdetect | サンプル一覧・Wi‑Fi・セットアップ・ファイル操作・ピン割り当て・リモート・I2C 検出 |
| 共通 | dialogs, shared-ui, shared-guards, shared-util, shared-types | ダイアログ・共有 UI コンポーネント・ガード・ユーティリティ・型 |
| 基盤 | web-serial | Web Serial API のラップ・状態管理 |
| その他 | page-not-found, unsupported-browser, chirimen-panel | 404・非対応ブラウザ表示・CHIRIMEN パネル |

## 依存関係

- アプリ (`apps/console`) は必要な lib を `tsconfig.base.json` の path エイリアス（`@libs-*`）でインポートする。
- lib 間の依存は Nx の `project.json` の `dependsOn: ["^build"]` とビルド順で管理される。
- 詳細な path 一覧は `tsconfig.base.json` の `compilerOptions.paths` を参照。

## ビルド・テスト

- 全プロジェクトのビルド: `pnpm nx run-many -t build`
- 全プロジェクトのテスト: `pnpm nx run-many -t test`
- CI では `nx affected -t lint,build,test` により変更影響範囲のみ実行。
