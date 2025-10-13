# Phase 2: Serial 関連の統合 - 完了レポート

## 実施日

2025-10-13

## 概要

`porting/services/` の Serial 関連機能を `shared/service/serial/` に統合し、責任分散型の設計を維持しながら機能を拡張しました。Facade パターンでシンプルなインターフェースも提供しています。

---

## 実施内容

### ✅ 2.1 SerialCommandService の作成

#### 作成したファイル

- **`shared/service/serial/serial-command.service.ts`**
- **`shared/service/serial/serial-command.service.spec.ts`**

#### 機能

- コマンド実行管理
- プロンプト待機
- タイムアウト管理
- 保留コマンドの管理

#### 移行元

- `porting/services/command-executor.service.ts`
- `porting/services/serial.service.ts` の `execute()` メソッド

#### 主なメソッド

```typescript
async executeCommand(commandId, config, writeFunction): Promise<string>
processInput(input): string | null
cancelCommand(commandId): void
cancelAllCommands(): void
getPendingCommandCount(): number
waitForPattern(writeData, pattern, timeoutMs): Promise<string>
```

---

### ✅ 2.2 SerialReaderService の拡張

#### 更新したファイル

- **`shared/service/serial/serial-reader.service.ts`**

#### 追加したメソッド

```typescript
async readOnce(): Promise<Uint8Array>        // 1回だけ読み取る
async readStringOnce(): Promise<string>      // 1回だけ文字列として読み取る
```

#### 移行元

- `porting/services/serial.service.ts` の `read()`, `readString()` メソッド

---

### ✅ 2.3 SerialWriterService の拡張

#### 更新したファイル

- **`shared/service/serial/serial-writer.service.ts`**

#### 追加したメソッド

```typescript
async writeSync(data: string): Promise<void>  // 同期的に書き込む
```

#### 移行元

- `porting/services/serial.service.ts` の `write()` メソッド

---

### ✅ 2.4 SerialFacadeService の作成

#### 作成したファイル

- **`shared/service/serial/serial-facade.service.ts`**
- **`shared/service/serial/serial-facade.service.spec.ts`**

#### 設計パターン

**Facade パターン** を採用し、複数の Serial サービスを統合してシンプルなインターフェースを提供

#### 統合しているサービス

```typescript
-SerialConnectionService - // 接続管理
  SerialReaderService - // 読み取り
  SerialWriterService - // 書き込み
  SerialCommandService - // コマンド実行
  SerialErrorHandlerService - // エラー処理
  SerialValidatorService; // バリデーション
```

#### 提供する便利メソッド

```typescript
// 接続管理
async connect(baudRate?: number): Promise<boolean>
async disconnect(): Promise<void>
isConnected(): boolean

// データ I/O
async write(data: string): Promise<void>
async read(): Promise<Uint8Array>
async readString(): Promise<string>
readonly data$: Observable<string>  // データストリーム

// コマンド実行
async executeCommand(cmd, prompt, timeout): Promise<string>
getPendingCommandCount(): number

// 状態確認
isReading(): boolean
isWriteReady(): boolean
async isRaspberryPiZero(): Promise<boolean>
getPort(): SerialPort | null

// レガシーメソッド（@deprecated）
async startConnection(): Promise<void>
async terminateConnection(): Promise<void>
async portWrite(data): Promise<void>
async portWritelnWaitfor(cmd, prompt, timeout): Promise<string>
getConnectionStatus(): boolean
```

---

### ✅ 2.5 TerminalLoopService の作成

#### 作成したファイル

- **`shared/service/terminal/terminal-loop.service.ts`**
- **`shared/service/terminal/terminal-loop.service.spec.ts`**

#### 責任

Terminal の継続的なデータ処理（Serial の責任から分離）

#### 機能

- Serial からのデータストリームを購読
- コマンドレスポンスの判定
- ターミナルへのデータ転送

#### 移行元

- `porting/services/serial.service.ts` の `startTerminal()` メソッド

#### 主なメソッド

```typescript
async startLoop(callback: (data: Uint8Array) => void): Promise<void>
stopLoop(): void
isActive(): boolean
```

---

## 作成・更新されたファイル一覧

### 新規作成 (5 ファイル)

- ✅ `shared/service/serial/serial-command.service.ts`
- ✅ `shared/service/serial/serial-command.service.spec.ts`
- ✅ `shared/service/serial/serial-facade.service.ts`
- ✅ `shared/service/serial/serial-facade.service.spec.ts`
- ✅ `shared/service/terminal/terminal-loop.service.ts`
- ✅ `shared/service/terminal/terminal-loop.service.spec.ts`

### 更新 (3 ファイル)

- ✅ `shared/service/serial/serial-reader.service.ts` (メソッド追加)
- ✅ `shared/service/serial/serial-writer.service.ts` (メソッド追加)
- ✅ `shared/service/serial/index.ts` (export 追加)
- ✅ `shared/service/terminal/index.ts` (export 追加)

---

## アーキテクチャ図

### Phase 2 実施前

```
porting/services/serial.service.ts (211行)
  - 接続管理
  - I/O操作
  - コマンド実行
  - ターミナルループ
  - 入力処理
  ↓ 責任過多
```

### Phase 2 実施後

```
shared/service/serial/
├── SerialConnectionService      // 接続管理
├── SerialReaderService          // 読み取り (+readOnce, readStringOnce)
├── SerialWriterService          // 書き込み (+writeSync)
├── SerialCommandService         // コマンド実行 (NEW)
├── SerialErrorHandlerService    // エラー処理
├── SerialValidatorService       // バリデーション
└── SerialFacadeService          // Facade (NEW)
         ↑
    統合インターフェース

shared/service/terminal/
└── TerminalLoopService           // ターミナルループ (NEW, 分離)
```

---

## 設計の改善点

### 単一責任の原則の徹底

**Before (porting/services/serial.service.ts)**

```typescript
class SerialService {
  // ❌ 責任が多岐にわたる
  async connect(); // 接続
  async read(); // 読み取り
  async write(); // 書き込み
  async execute(); // コマンド実行
  async startTerminal(); // ターミナルループ
  processInput(); // 入力処理
}
```

**After (shared/service/serial/)**

```typescript
// ✅ 責任を分散
class SerialConnectionService { connect(), disconnect() }
class SerialReaderService { startReading(), readOnce() }
class SerialWriterService { write(), writeSync() }
class SerialCommandService { executeCommand(), processInput() }
class TerminalLoopService { startLoop(), stopLoop() }

// ✅ シンプルなインターフェース (Facade)
class SerialFacadeService {
  // 内部で各サービスを統合
  connect(), disconnect(), write(), read(), executeCommand()
}
```

---

## Facade パターンの利点

### 利用者の視点

```typescript
// Before: 複数のサービスを個別に管理
const connection = inject(SerialConnectionService);
const reader = inject(SerialReaderService);
const writer = inject(SerialWriterService);
const command = inject(SerialCommandService);

await connection.connect();
writer.initialize(connection.getPort());
await reader.startReading(connection.getPort());
await writer.writeSync("ls\n");
// 複雑...

// After: Facade で簡単に
const serial = inject(SerialFacadeService);

await serial.connect();
await serial.write("ls\n");
const result = await serial.executeCommand("pwd", "pi@raspberrypi:");
// シンプル！
```

### 拡張性

- 各サービスは独立しているため、個別に拡張・テスト可能
- Facade を使わず、直接各サービスを使うこともできる
- 後方互換性のあるレガシーメソッドも提供

---

## テスト結果

### Linter チェック

```bash
✅ serial-command.service.ts - エラーなし
✅ serial-facade.service.ts - エラーなし
✅ serial-reader.service.ts - エラーなし
✅ serial-writer.service.ts - エラーなし
✅ terminal-loop.service.ts - エラーなし
```

### ユニットテスト

以下のテストファイルを作成:

- ✅ `serial-command.service.spec.ts` (12 テストケース)
- ✅ `serial-facade.service.spec.ts` (7 テストケース)
- ✅ `terminal-loop.service.spec.ts` (5 テストケース)

---

## 影響範囲

### 現時点での影響

**影響なし** - `porting/` ディレクトリは現在未使用のため、既存機能への影響はゼロです。

### SerialFacadeService の使用例

```typescript
// 新しいコードでの使用
import { SerialFacadeService } from '@/shared/service/serial';

@Component({...})
export class MyComponent {
  private serial = inject(SerialFacadeService);

  async onConnect() {
    const success = await this.serial.connect();
    if (success) {
      // データストリームを購読
      this.serial.data$.subscribe(data => {
        console.log('Received:', data);
      });
    }
  }

  async onExecuteCommand() {
    const result = await this.serial.executeCommand(
      'ls -la',
      'pi@raspberrypi:',
      10000
    );
    console.log('Result:', result);
  }
}
```

---

## 次のステップ

### Phase 3: ファイル関連サービスの再構成

1. `FileListService` の作成
2. `FileContentService` のリファクタリング
3. `FileOperationService` のリファクタリング
4. `FileMetadataService` の作成
5. `FileSearchService` の作成

### 推奨される順序

1. ✅ Phase 1: 型定義の統合（完了）
2. ✅ Phase 2: Serial 関連の統合（完了）
3. ⏳ Phase 3: ファイル関連サービスの再構成（次）
4. ⏳ Phase 4: その他サービスの移行
5. ⏳ Phase 5: ユーティリティの整理
6. ⏳ Phase 6: テスト・検証

---

## まとめ

### 達成したこと

- ✅ Serial 関連の責任を明確に分散
- ✅ Facade パターンで使いやすいインターフェースを提供
- ✅ TerminalLoop を Serial から分離（責任の明確化）
- ✅ 後方互換性の維持（レガシーメソッド提供）
- ✅ 包括的なユニットテスト作成
- ✅ Linter エラーなし

### 期待される効果

- ✅ 単一責任の原則の徹底
- ✅ テスタビリティの向上
- ✅ 保守性の向上
- ✅ 拡張性の向上
- ✅ コードの再利用性向上

### 所要時間

**約 2 時間** - 計画範囲内

---

**作成者**: AI Assistant  
**作成日**: 2025-10-13  
**Phase**: 2 / 6
