# CHIRIMEN Lite Console

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 20.x. It uses [Nx](https://nx.dev) as the monorepo build system.

## プロジェクト構成

- **apps/console** — メインの Web アプリ（CHIRIMEN Lite 接続・ターミナル・エディタ・Wi‑Fi 設定など）
- **libs/** — 機能別ライブラリ（connect, console-shell, dialogs, editor, example, file-manager, i2cdetect, pin-assign-panel, remote, setup, shared, terminal, web-serial, wifi など）。`tsconfig.base.json` の `paths` と [CONTRIBUTING.md](CONTRIBUTING.md) のスコープ一覧を参照してください。

## 📚 リファクタリング履歴

このプロジェクトは段階的なリファクタリングを経て、保守性と拡張性の高いアーキテクチャに進化しています。

- **Step 1**: Serial サービスの責任分散（`memos/step1/`）
- **Step 2**: 不要コードの削除（`memos/step2/`）
- **Step 3**: 最終クリーンアップ（`memos/step3/`）
- **Step 4**: porting/ と shared/ の統合（`memos/step4/`） ⭐ NEW

詳細は各ステップの `README.md` を参照してください。

## 開発サーバー

```bash
pnpm start
```

または

```bash
pnpm nx run console:serve
```

ブラウザで `http://localhost:4200/` を開きます。ソース変更時に自動リロードされます。

## ビルド

```bash
pnpm build
```

または

```bash
pnpm nx run-many -t build
```

ビルド成果物は `dist/` に出力されます。

## ユニットテスト

```bash
pnpm test
```

または

```bash
pnpm nx run-many -t test
```

Vitest で全プロジェクトのユニットテストを実行します。

## その他

- コード生成や開発のルールは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。
- Angular CLI の詳細は [Angular CLI Overview](https://angular.dev/tools/cli) を参照してください。
