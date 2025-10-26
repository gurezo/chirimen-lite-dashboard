# File Services の Nx Libs 化検討プラン

## 分析結果

### 対象サービス一覧

`apps/dashboard/src/app/shared/service/file` 配下には以下の 5 つのサービスが存在します:

1. **FileContentService** - ファイルの読み書き（base64 経由）
2. **FileListService** - ファイル/ディレクトリのリスト取得
3. **FileSearchService** - ファイル内検索、head/tail、比較等
4. **FileOperationService** - ファイルの CRUD 操作（削除、移動、コピー、権限変更等）
5. **FileMetadataService** - ファイルメタデータ取得（サイズ、権限、更新日時等）

### 依存関係

#### 外部依存

すべてのファイルサービスは以下に依存しています:

- **SerialFacadeService** (`../serial/serial-facade.service`)

  - Web Serial API 経由で Raspberry Pi と通信
  - コマンド実行の中核機能を提供

- **ParserUtils** (`../../utils/parser.utils`)

  - コマンド出力のパース処理
  - FileListService と FileSearchService が使用

- **FileListItem** (`../../models/file-list.model`)
  - FileListService が返す型定義

#### 使用箇所

以下の 3 つのサービスから利用されています:

1. **EditorService** - FileContentService を使用
2. **ChirimenService** - FileListService を使用
3. **WiFiService** - FileContentService を使用

### Nx Libs 化の検討

#### ✅ Nx Libs 化が可能

以下の理由から、Nx ライブラリとして切り出すことが可能です:

1. **明確な責務分離**: ファイル操作という単一の責務に特化
2. **再利用性**: 他のプロジェクトでも利用可能な汎用的な機能
3. **依存関係の整理**: SerialFacadeService への依存を抽象化可能
4. **既存パターンとの整合性**: 既に web-serial ライブラリが存在し、同様のパターンが適用可能

#### 推奨アプローチ

**オプション A: `@libs-file-manager` として独立したライブラリを作成（推奨）**

```
libs/file-manager/
  src/
    lib/
      services/
        file-content.service.ts
        file-list.service.ts
        file-search.service.ts
        file-operation.service.ts
        file-metadata.service.ts
      models/
        file-list.model.ts
        file-content.model.ts
        file-operation.model.ts
      utils/
        parser.utils.ts
    index.ts  # 公開API
```

**依存関係の解決方法:**

- SerialFacadeService への依存は `@libs-web-serial` からインポート
- ParserUtils と FileListItem はライブラリ内に移動

**メリット:**

- 完全に独立した再利用可能なライブラリ
- 他のプロジェクトでも利用可能
- テストが容易
- 既存の libs パターンと整合性が高い

**デメリット:**

- 移行作業が必要
- インポートパスの更新が必要

#### 実装時の注意点

1. **SerialFacadeService の依存**

   - `@libs-web-serial` から SerialFacadeService をインポート
   - または、抽象インターフェースを定義して依存性注入で解決

2. **パスエスケープ処理の共通化**

   - 各サービスで重複している `escapePath()` メソッドを共通ユーティリティに抽出

3. **テストの移行**

   - 既存の `.spec.ts` ファイルもライブラリに移行

4. **型定義の整理**

   - `FileContentInfo`, `FileOperationResult`, `FileAttributes` などの型を models ディレクトリに整理

5. **tsconfig.base.json の更新**

   - `@libs-file-manager` のパスエイリアスを追加

## 循環参照の調査結果

### ✅ 循環参照のリスクなし

以下の調査により、循環参照が発生しないことを確認しました：

#### 1. **@libs-web-serial との関係**

- ✅ `@libs-web-serial` はファイルサービスに依存していない
- ✅ `@libs-file-manager` が `@libs-web-serial` に依存する一方向の関係
- **依存方向**: `@libs-file-manager` → `@libs-web-serial` （単方向）

#### 2. **既存ライブラリとの関係**

- ✅ 既存ライブラリ（dialogs, ui, example 等）はファイルサービスに依存していない
- ✅ これらのライブラリは互いに単方向の依存関係のみ
- **例**: `@libs-example` → `@libs-dialogs` + `@libs-ui`

#### 3. **dashboard アプリとの関係**

- ✅ アプリ層（EditorService, ChirimenService, WiFiService）がファイルサービスを使用
- ✅ ファイルサービスはアプリ層に依存していない
- **依存方向**: dashboard app → `@libs-file-manager` （単方向）

#### 4. **共有ユーティリティの扱い**

**ParserUtils の使用箇所:**

- FileListService
- FileSearchService
- DirectoryService（file 配下ではない）

**CommandUtils の存在確認:**

- ✅ `CommandUtils.escapePath()` が既に存在
- 各ファイルサービスの重複した `escapePath()` メソッドを `CommandUtils` に統一可能

**推奨事項:**

- `ParserUtils` は `@libs-file-manager` 内に移動（ファイル操作専用）
- `CommandUtils` は dashboard の shared/utils に残す（または別の共有ライブラリ化）
- DirectoryService も `@libs-file-manager` に含めることを検討

#### 5. **DirectoryService の扱い**

DirectoryService は以下の特徴があります：

- SerialFacadeService に依存
- ParserUtils を使用
- EditorService から使用されている
- ファイル操作と密接に関連

**推奨**: DirectoryService も `@libs-file-manager` に含める

- ファイルとディレクトリは密接に関連
- 循環参照のリスクなし
- より完全な「ファイルシステム管理」ライブラリになる

### 最終的な依存関係グラフ

```
dashboard app
  ├─→ @libs-file-manager (新規)
  │     └─→ @libs-web-serial (既存)
  ├─→ @libs-web-serial (既存)
  ├─→ @libs-dialogs (既存)
  ├─→ @libs-ui (既存)
  └─→ @libs-example (既存)

@libs-example
  ├─→ @libs-dialogs
  └─→ @libs-ui

@libs-file-upload
  ├─→ @libs-dialogs
  └─→ @libs-ui
```

**結論**: すべての依存関係が単方向であり、循環参照は発生しません。

## 次のステップ

1. ライブラリ作成の承認を得る
2. Nx generator で `@libs-file-manager` ライブラリを生成
3. サービス（5 つのファイルサービス + DirectoryService）を移行
4. モデル、ユーティリティ（ParserUtils 含む）を移行
5. テストを移行・更新
6. dashboard アプリのインポートパスを更新
7. 動作確認とテスト実行
