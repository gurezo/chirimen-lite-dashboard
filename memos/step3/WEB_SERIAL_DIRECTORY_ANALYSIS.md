# web-serial ディレクトリ 必要性分析

## 調査日

2025-10-13

## 質問

`apps/dashboard/src/app/shared/web-serial` ディレクトリは必要か？

---

## ディレクトリ構造

```
web-serial/
├── index.ts
├── service/
│   ├── index.ts
│   ├── web-serial.service.ts
│   └── web-serial.service.spec.ts
└── store/
    ├── index.ts
    ├── web-serial.actions.ts
    ├── web-serial.effects.ts
    ├── web-serial.reducers.ts
    ├── web-serial.selectors.ts
    └── web.serrial.model.ts
```

---

## 使用状況分析

### ✅ **store/** - 必須（削除不可）

#### 使用箇所

1. **app.config.ts** (line 17)

   ```typescript
   import {
     WebSerialEffects,
     webSerialFeatureKey,
     webSerialReducer,
   } from './shared/web-serial';

   provideStore({
     [webSerialFeatureKey]: webSerialReducer,
   }),
   provideEffects([WebSerialEffects]),
   ```

   → **NgRx Store の設定で必須**

2. **layout-main/layout-main.component.ts** (line 23)

   ```typescript
   import { selectConnectionMessage, selectErrorMessage, WebSerialActions, WebSerialService } from "../../shared/web-serial";
   ```

   → **State 監視と Actions のディスパッチに使用**

3. **web-serial.effects.ts** (line 7)
   ```typescript
   import { WebSerialActions } from "./web-serial.actions";
   ```
   → **Store 内部での相互参照**

#### 役割

- **NgRx Store による状態管理**
  - Actions: ユーザーアクションの定義
  - Effects: 副作用（API 呼び出し）の処理
  - Reducers: State の更新ロジック
  - Selectors: State の取得
  - Model: State の型定義

#### 結論

**✅ 必須 - 削除不可**

---

### ⚠️ **service/** - 現在は必須（将来削除可能）

#### 使用箇所

1. **pages/console/console.component.ts** (line 9)

   ```typescript
   import { WebSerialService } from "../../shared/web-serial";

   providers: [WebSerialService], (service = inject(WebSerialService));
   ```

   → **ConsoleComponent で使用**

2. **web-serial.effects.ts** (line 6, 17)

   ```typescript
   import { WebSerialService } from "../service/web-serial.service";

   service = inject(WebSerialService);
   ```

   → **Effects で使用（connect, disconnect, send, read）**

#### 役割

- **後方互換性のためのアダプター**
- 内部では新しいサービス群を使用:
  - SerialConnectionService
  - SerialReaderService
  - SerialWriterService
  - SerialValidatorService
  - SerialErrorHandlerService

#### 現在のステータス

- ✅ `@deprecated` マーク付き
- ✅ 内部実装は新しいサービスに置き換え済み
- ✅ 外部インターフェースは維持

#### 結論

**⚠️ 現在は必須 - 将来的に削除可能**

---

## 総合評価

### 現在の必要性

| ディレクトリ          | 必要性  | 理由                                 |
| --------------------- | ------- | ------------------------------------ |
| `web-serial/`         | ✅ 必須 | store/ と service/ を含むため        |
| `web-serial/store/`   | ✅ 必須 | NgRx Store で使用中                  |
| `web-serial/service/` | ⚠️ 必須 | Effects と ConsoleComponent で使用中 |

### 回答

**はい、`web-serial/` ディレクトリは現在必要です。**

理由:

1. **store/** - NgRx Store による状態管理に必須
2. **service/** - WebSerialService がまだ使用中

---

## 将来的な削除計画

### Phase 1: service/ の削除（オプション）

#### 前提条件

1. ✅ Effects を新しいサービスで書き換え
2. ✅ ConsoleComponent を TerminalService に移行
3. ✅ WebSerialService への参照を削除

#### 削除手順

1. **web-serial.effects.ts の書き換え**

   ```typescript
   // Before
   import { WebSerialService } from "../service/web-serial.service";
   service = inject(WebSerialService);

   // After
   import { SerialConnectionService, SerialValidatorService, SerialErrorHandlerService } from "../../service/serial";

   connection = inject(SerialConnectionService);
   validator = inject(SerialValidatorService);
   errorHandler = inject(SerialErrorHandlerService);
   ```

2. **ConsoleComponent を TerminalService に移行**

   - [PHASE_3-2_MIGRATION_GUIDE.md](./memos/step1/PHASE_3-2_MIGRATION_GUIDE.md) を参照

3. **service/ ディレクトリを削除**

   ```bash
   rm -rf apps/dashboard/src/app/shared/web-serial/service/
   ```

4. **web-serial/index.ts を更新**

   ```typescript
   // Before
   export * from "./service";
   export * from "./store";

   // After
   export * from "./store";
   ```

#### 削除後の構造

```
web-serial/
├── index.ts
└── store/
    ├── index.ts
    ├── web-serial.actions.ts
    ├── web-serial.effects.ts
    ├── web-serial.reducers.ts
    ├── web-serial.selectors.ts
    └── web.serrial.model.ts
```

---

### Phase 2: ディレクトリ名の変更（オプション）

service/ を削除後、ディレクトリ名を変更することも可能:

```
web-serial/ → serial-store/ または serial/
```

理由:

- service は削除され、store のみが残る
- より明確な命名

---

## 推奨アクション

### 即座に実施

**❌ なし** - 現在は削除不可

### 将来的に実施（オプション）

1. ✅ Effects を新しいサービスで書き換え
2. ✅ ConsoleComponent を TerminalService に移行
3. ✅ WebSerialService を削除
4. ✅ service/ ディレクトリを削除
5. ✅ （オプション）ディレクトリ名を変更

### 現状維持（推奨）

- ⭐ **現在の構造を維持**
- 後方互換性を保つ
- 段階的な移行が可能

---

## まとめ

### 質問への回答

**「`web-serial/` ディレクトリは必要ですか？」**

→ **はい、現在は必要です。**

### 理由

1. **store/** は NgRx Store で使用中（削除不可）
2. **service/** は WebSerialService が使用中（現在は必要）

### 将来の見通し

- **service/** は将来的に削除可能
- **store/** は引き続き必要
- ディレクトリ全体を削除することは**推奨しません**

### 推奨事項

現状のまま維持し、必要に応じて段階的に改善することを推奨します。

---

## 関連ドキュメント

- [Phase 3-2 移行ガイド](./memos/step1/PHASE_3-2_MIGRATION_GUIDE.md)
- [クリーンアップサマリー](./memos/step2/CLEANUP_SUMMARY.md)
