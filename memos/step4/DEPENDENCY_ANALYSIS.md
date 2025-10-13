# 依存関係分析レポート

## 実施日

2025-10-13

## 目的

`porting/` と `shared/` 配下のコードの使用状況と依存関係を調査し、安全な統合計画を立てる。

---

## 重要な発見

### ✅ porting ディレクトリは現在未使用

`porting/` 配下のサービス・型・ユーティリティは、**現時点ではアプリケーション内で使用されていません**。

#### 検証結果

```bash
# porting/services からのインポートを検索
grep -r "from.*porting/services" apps/dashboard/src/app
# → 結果: 0件
```

**これが意味すること**:

- ✅ 統合作業は既存機能に影響しない
- ✅ 破壊的な変更を心配せず、自由に再構成できる
- ✅ テスト・検証の負荷が小さい
- ✅ 段階的な統合が容易

---

## 現在の使用状況

### 1. shared/service/serial/ (現在使用中)

#### 使用箇所

- **WebSerialService** (アダプター)
  - `shared/web-serial/store/web-serial.effects.ts`
  - `pages/console/console.component.ts`

#### 内部構成

```typescript
WebSerialService (Facade/Adapter)
  ↓ 依存
SerialConnectionService  // 接続管理
SerialReaderService      // 読み取り
SerialWriterService      // 書き込み
SerialValidatorService   // Pi Zero検証
SerialErrorHandlerService // エラー処理
```

---

### 2. shared/service/terminal/ (現在使用中)

#### 使用箇所

- `pages/console/console.component.ts`

#### 機能

- XTerm と SerialReader の統合
- ユーザー入力の Serial への送信
- Terminal への自動表示

---

### 3. shared/web-serial/store/ (NgRx)

#### 使用箇所

- `layout/layout-main/layout-main.component.ts`
- `pages/console/console.component.ts`

#### 状態管理

- 接続状態 (`isConnected`)
- エラーメッセージ
- 接続成功メッセージ

---

## 統合シナリオ

### シナリオ A: shared ベースで統合（推奨）

**方針**:

- 現在の `shared/service/serial/` を基盤とする
- `porting/` の機能を追加・統合する
- 既存の責任分散型設計を維持・拡張

**メリット**:

- ✅ 既存機能への影響がゼロ
- ✅ 現代的な Angular 設計（DI, RxJS）
- ✅ テスト済みのコードベース

**実施内容**:

1. `porting/services/command-executor.service.ts` → `shared/service/serial/serial-command.service.ts` として統合
2. `porting/services/serial.service.ts` の機能を分散
3. ファイル関連サービスを `shared/service/file/` に新設
4. ユーティリティを `shared/utils/` に統合

---

### シナリオ B: porting ベースで統合（非推奨）

**方針**:

- `porting/services/serial.service.ts` をベースにする
- `shared/service/serial/` の機能を吸収する

**デメリット**:

- ❌ 単一責任の原則違反（SerialService が肥大化）
- ❌ 既存の責任分散型設計を放棄
- ❌ レガシーメソッド（portWritelnWaitfor）が残る
- ❌ 既存のコードを大幅に書き換え必要

**結論**: このシナリオは採用しない

---

## 統合ロードマップ（推奨シナリオ）

### Phase 0: 準備（1 日）

- [x] 依存関係調査
- [x] 統合計画の策定
- [ ] 関係者へのレビュー依頼

---

### Phase 1: 型定義の統合（1 日）

#### 1.1 FileInfo の分離

```typescript
// Before (porting/types/file-info.ts)
interface FileInfo {
  name;
  size;
  isDirectory;
}

// Before (shared/models/file.info.models.ts)
interface FileInfo {
  name;
  type;
  size;
  child;
  isOpened;
}

// After (shared/models/)
interface FileListItem {
  name;
  size;
  isDirectory;
} // ls用
interface FileTreeNode {
  name;
  type;
  size;
  children;
  isExpanded;
} // ツリー用
```

#### 1.2 WiFiInfo の統一

```typescript
// After (shared/models/wifi.model.ts)
interface WiFiInfo {
  ssid: string; // essid → ssid に統一
  address: string;
  channel: number; // string → number に統一
  frequency: string;
  quality: string;
  spec: string;
}
```

**影響範囲**: なし（porting は未使用のため）

---

### Phase 2: Serial 関連の統合（2-3 日）

#### 2.1 SerialCommandService の作成

```
shared/service/serial/
├── serial-command.service.ts       (NEW)
└── serial-command.service.spec.ts  (NEW)
```

**実装内容**:

- `porting/services/command-executor.service.ts` を移行
- `porting/services/serial.service.ts` の `execute()` メソッドを統合

---

#### 2.2 SerialReaderService の拡張

**追加メソッド**:

```typescript
async readOnce(): Promise<Uint8Array> { ... }
async readStringOnce(): Promise<string> { ... }
```

---

#### 2.3 SerialFacadeService の作成

```typescript
@Injectable({ providedIn: 'root' })
export class SerialFacadeService {
  constructor(
    private connection: SerialConnectionService,
    private reader: SerialReaderService,
    private writer: SerialWriterService,
    private command: SerialCommandService
  ) {}

  // 便利メソッド
  async connect(baudRate?: number): Promise<void> { ... }
  async disconnect(): Promise<void> { ... }
  async executeCommand(cmd: string, prompt: string): Promise<string> { ... }
  async write(data: string): Promise<void> { ... }
  async read(): Promise<Uint8Array> { ... }
}
```

**役割**: 複数の Serial サービスを統合し、シンプルなインターフェースを提供

---

### Phase 3: ファイル関連サービスの構築（3-4 日）

#### 3.1 新しいディレクトリ構成

```
shared/service/file/
├── file-list.service.ts
├── file-content.service.ts
├── file-operation.service.ts
├── file-metadata.service.ts
├── file-search.service.ts
├── index.ts
└── *.spec.ts (各テストファイル)
```

#### 3.2 責任分担

| サービス             | 責任       | 移行元                                            |
| -------------------- | ---------- | ------------------------------------------------- |
| FileListService      | リスト取得 | porting/services/file.service.ts                  |
| FileContentService   | 読み書き   | porting/services/file-content.service.ts (一部)   |
| FileOperationService | CRUD 操作  | porting/services/file-operation.service.ts (一部) |
| FileMetadataService  | メタデータ | porting/services/file-operation.service.ts (一部) |
| FileSearchService    | 検索・比較 | porting/services/file-content.service.ts (一部)   |

---

### Phase 4: その他サービスの移行（2 日）

#### 4.1 そのまま移行

```
porting/services/ → shared/service/
├── directory.service.ts    → shared/service/directory/
├── login.service.ts        → shared/service/auth/
├── chirimen.service.ts     → shared/service/chirimen/
└── wifi.service.ts         → shared/service/wifi/
```

#### 4.2 SystemService の新設

```typescript
// NEW: shared/service/system/system.service.ts
@Injectable({ providedIn: 'root' })
export class SystemService {
  async reboot(): Promise<void> { ... }      // wifi.service.ts から移動
  async shutdown(): Promise<void> { ... }    // 追加機能
  async getSystemInfo(): Promise<SystemInfo> { ... }  // 追加機能
}
```

---

### Phase 5: ユーティリティの整理（1 日）

#### 5.1 移動と整理

```
porting/utils/ → shared/utils/
├── async.ts
├── buffer.ts
├── command.utils.ts     (リファクタリング)
├── date.utils.ts
├── error-handler.ts
├── file.utils.ts
├── parser.utils.ts
├── serial.errors.ts
├── string.utils.ts
└── wifi.utils.ts
```

#### 5.2 command.utils.ts のリファクタリング

```typescript
// 削除するメソッド
-executeCommand() - // Service層に任せる
  parseOutputLines() + // ParserUtils に統一
  // 残すメソッド
  escapePath() +
  getSudoPrefix();
```

---

### Phase 6: EditorService の完成（2 日）

#### 課題

- Monaco Editor の型が `any`
- TODO が多数残っている
- 実装が不完全

#### 実施内容

```typescript
import * as monaco from "monaco-editor";

@Injectable({ providedIn: "root" })
export class EditorService {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;

  // 型を正しく設定
  // TODOを実装
}
```

---

### Phase 7: テスト・検証（2-3 日）

#### 7.1 ユニットテスト

- [ ] 各サービスの spec ファイルを作成/更新
- [ ] カバレッジ 80% 以上を目標

#### 7.2 統合テスト

- [ ] Serial 通信のエンドツーエンドテスト
- [ ] ファイル操作のシナリオテスト

#### 7.3 ドキュメント更新

- [ ] README の更新
- [ ] TSDoc コメントの追加
- [ ] アーキテクチャ図の作成

---

## リスク評価

### リスクレベル: 🟢 低

#### 理由

1. **既存機能への影響ゼロ**
   - `porting/` は未使用のため、既存コードを壊さない
2. **後方互換性の確保**
   - `@deprecated` マークで段階的な移行が可能
3. **テスト済みの基盤**
   - `shared/service/serial/` は既にテスト・検証済み

---

## 完了条件

### Phase 1-5 完了時

- [ ] `porting/` 配下のすべてのサービスが `shared/` に統合されている
- [ ] 重複コードが削除されている
- [ ] 各サービスが単一責任の原則に従っている
- [ ] 型定義が統一されている

### Phase 6-7 完了時

- [ ] すべてのユニットテストがパスする
- [ ] 統合テストがパスする
- [ ] ドキュメントが更新されている
- [ ] コードレビューが完了している

### 最終完了

- [ ] `porting/` ディレクトリを削除
- [ ] PR がマージされている
- [ ] リリースノートが作成されている

---

## 次のアクション

1. ✅ 分析レポート作成（完了）
2. ⏳ レビュー・承認待ち
3. ⏳ Phase 1 開始: 型定義の統合
4. ⏳ 定期的な進捗報告

---

## 補足: 過去のリファクタリング履歴

### Step 1 (完了済み)

- Serial サービスの責任分散
- TerminalService の作成
- 単一責任の原則の適用

### Step 2 (完了済み)

- 古い Web Serial 実装の削除
- 古い XTerm サービスの削除
- WebSerialService のアダプター化

### Step 3 (完了済み)

- web-serial/ ディレクトリ構造の整理
- 不要コードの削除

### Step 4 (本レポート)

- `porting/` と `shared/` の統合計画

---

## 参考ドキュメント

- `CODE_INTEGRATION_ANALYSIS.md` - 詳細な分析レポート（同ディレクトリ）
- `INTEGRATION_IMPLEMENTATION_PLAN.md` - 実装計画（同ディレクトリ）
- `../step1/REFACTORING_SUMMARY.md` - 過去のリファクタリング記録
