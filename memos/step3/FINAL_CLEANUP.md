# 最終クリーンアップ - 不要ファイル削除

## 実施日

2025-10-13

## 削除対象ファイル

### 1. ToastMessageService（完全に置き換え済み）

- ✅ `apps/dashboard/src/app/shared/service/toast-message/toast-message.service.ts`
- ✅ `apps/dashboard/src/app/shared/service/toast-message/toast-message.service.spec.ts`

**理由**:

- deprecated 化済み
- SerialNotificationService に完全に置き換え済み
- テストファイル以外では使用されていない

### 2. raspberry.pi.functions.ts（SerialValidatorService に統合済み）

- ✅ `apps/dashboard/src/app/shared/functions/raspberry.pi.functions.ts`

**理由**:

- `isRaspberryPiZero()` 関数が定義されている
- `SerialValidatorService.isRaspberryPiZero()` に同じ機能が実装済み
- 重複コード

---

## 削除できないファイル

### xterm/store/（Store で使用中）

**ファイル**:

- `apps/dashboard/src/app/shared/xterm/store/*`

**理由**:

- `app.config.ts` で `xtermReducer` と `xtermFeatureKey` が使用中
- NgRx Store の一部として機能している

**使用箇所**:

```typescript
import { xtermFeatureKey, xtermReducer } from './shared/xterm';

provideStore({
  [webSerialFeatureKey]: webSerialReducer,
  [xtermFeatureKey]: xtermReducer,
}),
```

---

## 削除手順

### Step 1: ToastMessageService の削除

```bash
rm apps/dashboard/src/app/shared/service/toast-message/toast-message.service.ts
rm apps/dashboard/src/app/shared/service/toast-message/toast-message.service.spec.ts
```

### Step 2: raspberry.pi.functions.ts の削除

```bash
rm apps/dashboard/src/app/shared/functions/raspberry.pi.functions.ts
```

### Step 3: Index ファイルの更新

#### service/index.ts

```typescript
// 削除: export * from './toast-message/toast-message.service';
```

#### functions/index.ts

```typescript
// 削除: export * from './raspberry.pi.functions';
```

### Step 4: ビルドテスト

```bash
npx nx build apps-dashboard
```

---

## 影響範囲

### ToastMessageService

- **削除前の参照**: テストファイルのみ
- **影響**: なし（deprecated で警告が出ていたが、実使用なし）

### raspberry.pi.functions.ts

- **削除前の参照**: なし（SerialValidatorService に置き換え済み）
- **影響**: なし

---

## 削除後の状態

### 削除されるコード行数

- ToastMessageService: 約 61 行
- ToastMessageService.spec: 約 50 行
- raspberry.pi.functions.ts: 約 11 行
- **合計**: 約 122 行

### ディレクトリ構造

```
shared/
├── service/
│   ├── dialog/
│   ├── example/
│   ├── icon/
│   ├── notification/
│   ├── serial/
│   ├── terminal/
│   └── toast-message/  ← 空ディレクトリ（削除可能）
└── functions/
    ├── convert.ts
    └── functions.ts
```

---

## 後処理

### 空ディレクトリの削除（オプション）

```bash
rmdir apps/dashboard/src/app/shared/service/toast-message/
```

---

## 期待される結果

- ✅ ビルドエラー: 0 件
- ✅ 警告: 0 件
- ✅ コード削減: 約 122 行
- ✅ 重複コードの排除
