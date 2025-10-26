# Phase 2: WiFi ライブラリ分離 (@libs-wifi)

## 概要

WiFi 関連の機能（サービス、コンポーネント、モデル、パーサー、ユーティリティ）を独立したライブラリに分離します。

## 移行対象ファイル

### Services (1 ファイル)

- `wifi/services/wifi.service.ts` (393 行) → `libs/wifi/src/lib/services/`

### Components (2 コンポーネント)

- `wifi/wifi.component.ts/html/spec.ts` → `libs/wifi/src/lib/components/`
- `wifi/components/wifi-info/wifi-info.component.ts/html/spec.ts` → `libs/wifi/src/lib/components/wifi-info/`

### Models (2 ファイル)

- `wifi/models/wifi.model.ts` (WiFiInfo, dummyWiFiInfo) → `libs/wifi/src/lib/models/`
- `wifi/models/wifi.models.ts` (deprecated) → `libs/wifi/src/lib/models/` (後で削除予定)

### Functions (1 ファイル)

- `wifi/functions/wifi-parser.ts` (3 つのパーサー関数) → `libs/wifi/src/lib/functions/`

### Utils (1 ファイル)

- `shared/utils/wifi.utils.ts` (WiFiUtils class) → `libs/wifi/src/lib/utils/`

## 実装ステップ

### 1. Nx ライブラリ生成

- `nx g @nx/angular:library wifi --directory=libs/wifi --importPath=@libs-wifi --buildable --publishable`
- Angular publishable ライブラリとして生成

### 2. ファイル移行

各ファイルを対応するディレクトリに移動:

- Services → `libs/wifi/src/lib/services/`
- Components → `libs/wifi/src/lib/components/` と `libs/wifi/src/lib/components/wifi-info/`
- Models → `libs/wifi/src/lib/models/`
- Functions → `libs/wifi/src/lib/functions/`
- Utils → `libs/wifi/src/lib/utils/`

### 3. 依存関係の解決

#### 3-1. FileContentService を shared ライブラリに分離

FileContentService は汎用的なファイル操作サービスなので、`@libs-shared-file` として独立させます：

- Nx で `@libs-shared-file` ライブラリを生成
- `apps/dashboard/src/app/shared/service/file/file-content.service.ts` を移行
- `FileContentInfo` インターフェースも一緒に移行
- `@libs-web-serial` の `SerialFacadeService` に依存
- `tsconfig.base.json` に `@libs-shared-file` パスマッピングを追加

#### 3-2. WiFiService の依存関係を更新

- `@libs-web-serial` の `SerialFacadeService` → import パス更新
- `@libs-shared-file` の `FileContentService` → import パス更新

### 4. 公開 API 定義

`libs/wifi/src/index.ts` で以下を export:

```typescript
// Services
export * from './lib/services/wifi.service';

// Components
export * from './lib/components/wifi.component';
export * from './lib/components/wifi-info/wifi-info.component';

// Models
export * from './lib/models/wifi.model';
export * from './lib/models/wifi.models'; // deprecated

// Functions
export * from './lib/functions/wifi-parser';

// Utils
export * from './lib/utils/wifi.utils';
```

### 5. tsconfig.base.json 更新

パスマッピング追加:

```json
"@libs-wifi": ["libs/wifi/src/index.ts"]
```

### 6. apps/dashboard の import パス更新

以下のファイルで import を `@libs-wifi` に変更:

- `console/console.component.ts` (WifiComponent)
- `shared/models/index.ts` (wifi.model, wifi.models の re-export を削除)
- `shared/utils/index.ts` (wifi.utils の re-export を削除)

### 7. ビルド・テスト確認

- `nx build wifi` でライブラリビルド
- `nx test wifi` でテスト実行
- `nx build dashboard` でアプリビルド
- `nx test dashboard` でアプリテスト

### 8. ブランチコミット

- ブランチ: `refactor/split/wifi`
- コミットメッセージ: "refactor: migrate WiFi functionality to @libs-wifi library"

## 注意事項

1. **FileContentService の扱い**: WiFiService が依存する FileContentService は現在 apps/dashboard 内にあります。以下の選択肢があります:

   - a) FileContentService を @libs-wifi に含める
   - b) FileContentService を別の shared ライブラリに分離
   - c) WiFiService から FileContentService の依存を除去

2. **Deprecated モデル**: `wifi.models.ts` (WiFiInformation) は deprecated ですが、WifiInfoComponent が使用しているため、Phase 3 で削除します。

3. **Angular Material 依存**: WifiComponent と WifiInfoComponent は Angular Material を使用しているため、libs/wifi の package.json に依存関係を追加する必要があります。
