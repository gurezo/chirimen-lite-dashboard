# 統合作業 実装計画

## 前提条件

- `CODE_INTEGRATION_ANALYSIS.md` の分析結果に基づく
- 後方互換性を可能な限り維持
- 段階的な移行で既存機能への影響を最小化

---

## Phase 1: 型定義の統合

### 1.1 FileInfo の統合

#### 作業内容

1. **新しい型定義を作成**

   - 場所: `shared/models/file-list.model.ts`

   ```typescript
   // ls -la のパース結果用（旧 porting/types/file-info.ts）
   export interface FileListItem {
     name: string;
     size: number;
     isDirectory: boolean;
   }
   ```

   - 場所: `shared/models/file-tree.model.ts`

   ```typescript
   // ツリー構造表示用（旧 shared/models/file.info.models.ts）
   export interface FileTreeNode {
     name: string;
     type: FileType;
     size: number;
     children: FileTreeNode[];
     isExpanded: boolean;
   }
   ```

2. **既存コードの移行**

   - `porting` 配下で `FileInfo` を使用している箇所を `FileListItem` に変更
   - `shared` 配下で `FileInfo` を使用している箇所を `FileTreeNode` に変更
   - `file.info.models.ts` の `child` → `children`、`isOpened` → `isExpanded` にリネーム

3. **廃止予定の型にマーク**
   ```typescript
   /** @deprecated Use FileListItem instead */
   export type FileInfo = FileListItem;
   ```

#### 影響範囲

- `porting/services/file.service.ts`
- `porting/services/chirimen.service.ts`
- `porting/utils/parser-utils.ts`
- `shared/models/` を使用しているコンポーネント

---

### 1.2 WiFiInfo の統合

#### 作業内容

1. **統一した型定義を作成**

   - 場所: `shared/models/wifi.model.ts`

   ```typescript
   export interface WiFiInfo {
     ssid: string; // 統一: essid → ssid
     address: string;
     channel: number; // 統一: string → number
     frequency: string;
     quality: string;
     spec: string;
   }
   ```

2. **パーサーを更新**

   - `porting/utils/parser-utils.ts` の `parseIwlistOutput()` を修正
   - `channel` を `number` にパース
   - `essid` → `ssid` にマッピング

3. **既存コードの移行**
   - `porting/services/wifi.service.ts` を更新
   - `shared/models/wifi.models.ts` の `WiFiInformation` を `WiFiInfo` に統一

#### 影響範囲

- `porting/services/wifi.service.ts`
- `porting/utils/parser-utils.ts`
- WiFi 関連のコンポーネント

---

## Phase 2: Serial 関連の統合

### 2.1 新しいサービスの作成

#### serial-command.service.ts

```typescript
@Injectable({ providedIn: "root" })
export class SerialCommandService {
  // porting/services/command-executor.service.ts の内容を移行
  // + serial.service.ts の execute() メソッド
}
```

**責任**:

- コマンド実行管理
- プロンプト待機
- タイムアウト管理

---

### 2.2 既存サービスの拡張

#### serial-reader.service.ts の拡張

```typescript
// porting/services/serial.service.ts の read(), readString() を統合
async readOnce(): Promise<Uint8Array> { ... }
async readStringOnce(): Promise<string> { ... }
```

#### serial-writer.service.ts の拡張

```typescript
// porting/services/serial.service.ts の write() メソッドを統合
// 既存の write() と統合し、オプションで同期/非同期を選択可能に
async writeSync(data: string): Promise<void> { ... }
```

---

### 2.3 SerialService のリファクタリング

#### 作業内容

1. **統合クラスを作成** (Facade パターン)

   - 場所: `shared/service/serial/serial-facade.service.ts`

   ```typescript
   @Injectable({ providedIn: 'root' })
   export class SerialFacadeService {
     constructor(
       private connection: SerialConnectionService,
       private reader: SerialReaderService,
       private writer: SerialWriterService,
       private command: SerialCommandService
     ) {}

     // 便利メソッドを提供
     async connect(): Promise<void> { ... }
     async disconnect(): Promise<void> { ... }
     async execute(cmd: string, prompt: string): Promise<string> { ... }
   }
   ```

2. **porting/services/serial.service.ts を段階的に削除**
   - レガシーメソッドを `@deprecated` マーク
   - 内部実装を `SerialFacadeService` に委譲
   - 最終的に `SerialFacadeService` へ完全移行

---

### 2.4 ターミナルループの移行

#### 作業内容

1. **新しいサービスを作成**

   - 場所: `shared/service/terminal/terminal-loop.service.ts`

   ```typescript
   @Injectable({ providedIn: "root" })
   export class TerminalLoopService {
     // porting/services/serial.service.ts の startTerminal() を移行
   }
   ```

2. **Serial 関連から分離**
   - ターミナルループは Serial の責任ではなく、Terminal の責任

---

## Phase 3: ファイル関連サービスの再構成

### 3.1 新しいサービス構成

#### file-list.service.ts

```typescript
@Injectable({ providedIn: 'root' })
export class FileListService {
  // porting/services/file.service.ts から移行
  async listFiles(path?: string): Promise<FileListItem[]> { ... }
}
```

#### file-content.service.ts (リファクタリング)

```typescript
@Injectable({ providedIn: 'root' })
export class FileContentService {
  // 読み書きのみに集中
  async readFile(path: string): Promise<FileContentInfo> { ... }
  async writeTextFile(path: string, content: string): Promise<void> { ... }
  async writeBinaryFile(path: string, buffer: ArrayBuffer): Promise<void> { ... }
  async appendToFile(path: string, content: string): Promise<void> { ... }
}
```

#### file-search.service.ts (NEW)

```typescript
@Injectable({ providedIn: 'root' })
export class FileSearchService {
  // porting/services/file-content.service.ts から分離
  async searchInFile(path: string, term: string): Promise<string[]> { ... }
  async getLineCount(path: string): Promise<number> { ... }
  async getFileLine(path: string, lineNumber: number): Promise<string> { ... }
  async getFileHead(path: string, lines: number): Promise<string[]> { ... }
  async getFileTail(path: string, lines: number): Promise<string[]> { ... }
  async compareFiles(path1: string, path2: string): Promise<string> { ... }
}
```

#### file-metadata.service.ts (NEW)

```typescript
@Injectable({ providedIn: 'root' })
export class FileMetadataService {
  // porting/services/file-operation.service.ts から分離
  async getFileSize(path: string): Promise<number> { ... }
  async getFileModificationTime(path: string): Promise<Date> { ... }
  async getFileAttributes(path: string): Promise<FileAttributes> { ... }
}
```

#### file-operation.service.ts (リファクタリング)

```typescript
@Injectable({ providedIn: 'root' })
export class FileOperationService {
  // CRUD操作のみに集中
  async removeFile(path: string): Promise<void> { ... }
  async moveFile(from: string, to: string): Promise<void> { ... }
  async copyFile(from: string, to: string): Promise<void> { ... }
  async renameFile(old: string, new: string): Promise<void> { ... }
  async changePermissions(path: string, mode: string): Promise<void> { ... }
  async changeOwner(path: string, owner: string, group?: string): Promise<void> { ... }
  async createSymlink(target: string, link: string): Promise<void> { ... }
  async createHardlink(target: string, link: string): Promise<void> { ... }
}
```

---

### 3.2 依存関係の整理

#### 移行順序

1. `file-list.service.ts` 作成
2. `file-search.service.ts` 作成
3. `file-metadata.service.ts` 作成
4. `file-content.service.ts` リファクタリング
5. `file-operation.service.ts` リファクタリング
6. `porting/services/file*.service.ts` を削除

---

## Phase 4: その他サービスの移行

### 4.1 そのまま移行

以下のサービスは `shared/service/` 配下に移動するだけ:

- `directory.service.ts` → `shared/service/directory/`
- `login.service.ts` → `shared/service/auth/`
- `chirimen.service.ts` → `shared/service/chirimen/`

### 4.2 修正が必要なサービス

#### wifi.service.ts

```typescript
@Injectable({ providedIn: "root" })
export class WiFiService {
  // reboot() を削除（SystemService に移動）
}
```

#### system.service.ts (NEW)

```typescript
@Injectable({ providedIn: 'root' })
export class SystemService {
  async reboot(): Promise<void> { ... }
  async shutdown(): Promise<void> { ... }
}
```

#### editor.service.ts

- Monaco Editor の型を正しく設定
- TODO を完成させる

---

## Phase 5: ユーティリティの整理

### 5.1 command-utils.ts のリファクタリング

```typescript
export class CommandUtils {
  // executeCommand() を削除（Service層に任せる）
  // parseOutputLines() を削除（ParserUtils に統一）

  // 残すもの
  static escapePath(path: string): string { ... }
  static getSudoPrefix(useSudo: boolean): string { ... }
}
```

### 5.2 ユーティリティの移動

```
porting/utils/ → shared/utils/
├── async.ts
├── buffer.ts
├── command-utils.ts      (リファクタリング後)
├── date-utils.ts
├── error-handler.ts
├── file-utils.ts
├── parser-utils.ts
├── serial.errors.ts
├── string.ts
└── wifi-utils.ts
```

---

## Phase 6: テスト・検証

### 6.1 ユニットテスト

- 各サービスの spec ファイルを更新
- 統合後の動作を検証

### 6.2 統合テスト

- コンポーネントとの連携を確認
- エンドツーエンドのシナリオテスト

### 6.3 リファクタリング

- 不要なコードの削除
- ドキュメントの更新
- TSDoc コメントの追加

---

## 実装の優先順位

### 高優先度（Week 1-2）

1. ✅ Phase 1: 型定義の統合
2. ✅ Phase 2: Serial 関連の統合

### 中優先度（Week 2-3）

3. ✅ Phase 3: ファイル関連サービスの再構成
4. ✅ Phase 4: その他サービスの移行

### 低優先度（Week 3）

5. ✅ Phase 5: ユーティリティの整理
6. ✅ Phase 6: テスト・検証

---

## リスク管理

### 既存機能への影響

- **リスク**: 既存のコンポーネントが動かなくなる
- **対策**:
  - 段階的な移行
  - レガシーメソッドを `@deprecated` マークして残す
  - 各 Phase ごとにテストを実施

### 開発期間の延長

- **リスク**: 予想以上に時間がかかる
- **対策**:
  - 優先順位の高いものから着手
  - 各 Phase 完了後に一度リリース可能な状態にする

### 責任分散の過剰化

- **リスク**: サービスが細分化されすぎて管理が煩雑になる
- **対策**:
  - Facade パターンで統合的なインターフェースを提供
  - バレル export (`index.ts`) で利用を簡素化

---

## 完了条件

### Phase 1-5 完了

- [ ] 全ての型定義が統一されている
- [ ] `porting/` 配下のコードが `shared/` に統合されている
- [ ] 重複コードが削除されている
- [ ] 各サービスが単一責任の原則に従っている

### Phase 6 完了

- [ ] 全てのユニットテストがパスする
- [ ] 統合テストがパスする
- [ ] ドキュメントが更新されている
- [ ] 既存機能がすべて動作する

---

## 次のステップ

1. **承認待ち**: この計画をレビューし、承認を得る
2. **Phase 1 開始**: 型定義の統合から着手
3. **定期レビュー**: 各 Phase 完了後に進捗を確認
