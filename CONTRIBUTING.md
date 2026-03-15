# コントリビューションガイド

本プロジェクトへの貢献ありがとうございます。コミットメッセージと開発環境のルールをまとめています。

## コミットメッセージ（Conventional Commits）

コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/) に準拠してください。

### 形式

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

- **type**: 変更の種類（`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `build`, `ci`, `chore` など）
- **scope**: 変更対象のスコープ（下記一覧から指定）
- **description**: 簡潔な説明（命令形・小文字始まり推奨）

### スコープ一覧

| スコープ | 説明 |
|----------|------|
| `console` | メインアプリ (apps/console) |
| `workspace` | ルート・共通設定（package.json, nx, ツール設定など） |
| `page-not-found` | 404 ページ lib |
| `web-serial` | Web Serial lib |
| `example` | サンプル lib |
| `wifi` | Wi‑Fi lib |
| `dialogs` | ダイアログ lib |
| `unsupported-browser` | 非対応ブラウザ lib |
| `editor` | エディタ lib |
| `terminal` | ターミナル lib |
| `chirimen-panel` | CHIRIMEN パネル lib |
| `shared-ui` | 共有 UI lib |
| `shared-guards` | 共有ガード lib |
| `i2cdetect` / `i2cdetect-ui` / `i2cdetect-data-access` / `i2cdetect-util` | I2C 検出 lib（ui / data-access / util に分割） |

### 例

- `feat(console): add dark mode toggle`
- `fix(terminal): prevent resize on reconnect`
- `build(workspace): add commitlint and husky for Conventional Commits`
- `docs(workspace): update CONTRIBUTING with scope list`

## Git フック（husky）

`pnpm install` を実行すると、husky により `.husky` がセットアップされ、コミット時に `commit-msg` フックで commitlint が自動実行されます。不正な形式のメッセージではコミットが拒否されます。

初回クローン後は、必ずリポジトリルートで `pnpm install` を実行してください。

## パスエイリアス（tsconfig.base.json）

インポートには `tsconfig.base.json` の `compilerOptions.paths` で定義したエイリアスを使用します。

- **アプリ**: `@app/*` → `apps/console/src/app/*`
- **lib 群**: `@libs-<lib名>` 形式（例: `@libs-shared-guards`, `@libs-shared-ui`, `@libs-wifi-feature`）
- 一覧は `tsconfig.base.json` の `paths` を参照してください。

### 後方互換について

以下の旧エイリアスは廃止済みです。後方互換は行っていません。

| 廃止したエイリアス | 統一後のエイリアス |
|-------------------|-------------------|
| `@libs-console-guards` | `@libs-shared-guards` |
| `@libs-ui` | `@libs-shared-ui` |

## プルリクエスト

- ブランチ名は Conventional Commits の意図が分かるようにしてください（例: `feat/console/add-dark-mode`）。
- プルリクエストのタイトルも Conventional Commits 形式を推奨します。
- `.github/pull_request_template.md` に沿って概要・変更内容・テスト方法を記載してください。
