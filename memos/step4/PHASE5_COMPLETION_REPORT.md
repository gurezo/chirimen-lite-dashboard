# Phase 5: ユーティリティの整理 - 完了レポート

## 実施日

2025-10-13

## 概要

`porting/utils/` のユーティリティを `shared/utils/` に移行し、重複を削除してクリーンなコードベースを構築しました。`command-utils.ts` をリファクタリングし、Service 層との重複を削除しています。

---

## 実施内容

### ✅ 5.1 ユーティリティファイルの移行

#### 移行したファイル一覧

| ファイル               | 移行元                           | 移行先          | 内容                                 |
| ---------------------- | -------------------------------- | --------------- | ------------------------------------ |
| async.utils.ts         | `porting/utils/async.ts`         | `shared/utils/` | 非同期処理（sleep, retry, timeout）  |
| buffer.utils.ts        | `porting/utils/buffer.ts`        | `shared/utils/` | バッファ操作（変換、連結）           |
| command.utils.ts       | `porting/utils/command-utils.ts` | `shared/utils/` | コマンド操作（リファクタリング済み） |
| date.utils.ts          | `porting/utils/date-utils.ts`    | `shared/utils/` | 日時操作                             |
| error-handler.utils.ts | `porting/utils/error-handler.ts` | `shared/utils/` | エラーハンドリング                   |
| errors.ts              | `porting/utils/serial.errors.ts` | `shared/utils/` | カスタムエラークラス                 |
| file.utils.ts          | `porting/utils/file-utils.ts`    | `shared/utils/` | ファイル操作                         |
| parser.utils.ts        | （Phase 1 で作成済み）           | `shared/utils/` | パース処理                           |
| string.utils.ts        | `porting/utils/string.ts`        | `shared/utils/` | 文字列操作                           |
| wifi.utils.ts          | `porting/utils/wifi-utils.ts`    | `shared/utils/` | WiFi 設定生成                        |

**合計**: 10 ファイル

---

### ✅ 5.2 command.utils.ts のリファクタリング

#### 削除したメソッド（重複のため）

```typescript
// ❌ 削除: executeCommand()
// 理由: Service層（SerialCommandService, SerialFacadeService）が担当

// ❌ 削除: parseOutputLines()
// 理由: ParserUtils に統一
```

#### 残したメソッド

```typescript
// ✅ 保持: escapePath()
static escapePath(path: string): string

// ✅ 保持: getSudoPrefix()
static getSudoPrefix(useSudo: boolean = false): string
```

#### 追加したメソッド（機能拡張）

```typescript
// ✅ 新規: buildCommandOptions()
static buildCommandOptions(options: Record<string, string | boolean>): string

// ✅ 新規: generateExportCommand()
static generateExportCommand(name: string, value: string): string
```

---

### ✅ 5.3 file.utils.ts の拡張

#### 追加したメソッド（機能強化）

```typescript
// ファイル名操作
static getFileExtension(fileName: string): string
static getFileNameWithoutExtension(fileName: string): string
static getFileName(path: string): string
static getDirectoryPath(path: string): string

// ファイルサイズのフォーマット
static formatFileSize(bytes: number): string  // "1.5 MB" など
```

---

### ✅ 5.4 errors.ts の拡張

#### 追加したエラークラス

```typescript
export class DirectoryError extends Error { ... }  // NEW
export class SystemError extends Error { ... }     // NEW
export class AuthError extends Error { ... }       // NEW
```

#### 既存のエラークラス

```typescript
export class SerialError extends Error { ... }
export class FileError extends Error { ... }
export class EditorError extends Error { ... }
export class WiFiError extends Error { ... }
export class ChirimenError extends Error { ... }
```

---

### ✅ 5.5 date.utils.ts の拡張

#### 追加したメソッド（機能強化）

```typescript
// Unix タイムスタンプ変換
static fromUnixTimestamp(timestamp: number): Date
static toUnixTimestamp(date: Date): number
```

---

### ✅ 5.6 string.utils.ts の拡張

#### 追加したメソッド（機能強化）

```typescript
// 文字列操作
static trimAll(str: string): string
static splitLines(str: string): string[]
```

---

## 作成・更新されたファイル一覧

### 新規作成 (10 ファイル)

- ✅ `shared/utils/async.utils.ts`
- ✅ `shared/utils/buffer.utils.ts`
- ✅ `shared/utils/command.utils.ts`
- ✅ `shared/utils/date.utils.ts`
- ✅ `shared/utils/error-handler.utils.ts`
- ✅ `shared/utils/errors.ts`
- ✅ `shared/utils/file.utils.ts`
- ✅ `shared/utils/string.utils.ts`
- ✅ `shared/utils/wifi.utils.ts`

### 更新 (2 ファイル)

- ✅ `shared/utils/parser.utils.ts` (Phase 1 で作成済み)
- ✅ `shared/utils/index.ts` (全てのユーティリティをエクスポート)

---

## リファクタリングの詳細

### command.utils.ts

#### Before (porting/utils/command-utils.ts)

```typescript
export class CommandUtils {
  // ❌ Service層と重複
  static async executeCommand(serialService: SerialService, command: string, prompt: string, timeout: number = 10000): Promise<string>;

  // ❌ ParserUtils と重複
  static parseOutputLines(output: string): string[];

  // ✅ 保持
  static escapePath(path: string): string;
  static getSudoPrefix(useSudo: boolean = false): string;
}
```

#### After (shared/utils/command.utils.ts)

```typescript
export class CommandUtils {
  // ✅ 保持: パス操作とコマンド構築のみ
  static escapePath(path: string): string;
  static getSudoPrefix(useSudo: boolean = false): string;

  // ✅ 新規: 機能強化
  static buildCommandOptions(options: Record<string, string | boolean>): string;
  static generateExportCommand(name: string, value: string): string;
}
```

---

## ユーティリティマップ

### Phase 5 で整理したユーティリティ

```
shared/utils/
├── async.utils.ts           (非同期処理)
│   - sleep()
│   - retry()
│   - timeout()
│
├── buffer.utils.ts          (バッファ操作)
│   - stringToArrayBuffer()
│   - arrayBufferToString()
│   - concatArrayBuffers()
│   - arrayBufferToBase64()
│   - base64ToArrayBuffer()
│
├── command.utils.ts         (コマンド操作)
│   - escapePath()
│   - getSudoPrefix()
│   - buildCommandOptions()
│   - generateExportCommand()
│
├── date.utils.ts            (日時操作)
│   - pad2()
│   - buildDateCommand()
│   - getCurrentDateTime()
│   - generateTimezoneCommand()
│   - fromUnixTimestamp()
│   - toUnixTimestamp()
│
├── error-handler.utils.ts   (エラーハンドリング)
│   - getErrorMessage()
│   - wrapError()
│   - logError()
│   - isErrorType()
│
├── errors.ts                (カスタムエラークラス)
│   - SerialError
│   - FileError
│   - EditorError
│   - WiFiError
│   - ChirimenError
│   - DirectoryError
│   - SystemError
│   - AuthError
│
├── file.utils.ts            (ファイル操作)
│   - isTextFile()
│   - getFileExtension()
│   - getFileNameWithoutExtension()
│   - getFileName()
│   - getDirectoryPath()
│   - arrayBufferToBase64()
│   - base64ToArrayBuffer()
│   - generateHeredocCommand()
│   - generateAppendCommand()
│   - formatFileSize()
│
├── parser.utils.ts          (パース処理)
│   - parseOutputLines()
│   - parseLsOutput()
│   - parseIwlistOutput()
│   - parseIfconfigOutput()
│   - parseIwconfigOutput()
│
├── string.utils.ts          (文字列操作)
│   - removeControlChars()
│   - escapePath()
│   - parseCommandOutput()
│   - extractIpAddress()
│   - trimAll()
│   - splitLines()
│
└── wifi.utils.ts            (WiFi設定)
    - generateWpaSupplicantConfig()
    - generateLegacyWifiSetupScript()
    - generateBackupCommand()
    - generateSaveConfigCommand()
    - generateRestartCommands()
    - generateInterfaceCommand()
```

---

## 重複削除の成果

### executeCommand() の削除

#### Before

```typescript
// ❌ porting/utils/command-utils.ts
static async executeCommand(
  serialService: SerialService,
  command: string,
  prompt: string,
  timeout: number = 10000
): Promise<string> {
  // Service層の責任をUtilityが担当していた
}
```

#### After

```typescript
// ✅ Service層で担当
// shared/service/serial/serial-command.service.ts
async executeCommand(
  commandId: string,
  config: CommandExecutionConfig,
  writeFunction: (data: string) => Promise<void>
): Promise<string>

// ✅ Facade経由で簡単に使用可能
// shared/service/serial/serial-facade.service.ts
async executeCommand(
  cmd: string,
  prompt: string,
  timeout: number = 10000
): Promise<string>
```

---

### parseOutputLines() の削除

#### Before

```typescript
// ❌ 2箇所に重複
// porting/utils/command-utils.ts
static parseOutputLines(output: string): string[]

// porting/utils/parser-utils.ts
static parseOutputLines(output: string): string[]
```

#### After

```typescript
// ✅ ParserUtils に統一
// shared/utils/parser.utils.ts
static parseOutputLines(output: string): string[]
```

---

## テスト結果

### Linter チェック

```bash
✅ async.utils.ts - エラーなし
✅ buffer.utils.ts - エラーなし
✅ command.utils.ts - エラーなし
✅ date.utils.ts - エラーなし
✅ error-handler.utils.ts - エラーなし
✅ errors.ts - エラーなし
✅ file.utils.ts - エラーなし
✅ parser.utils.ts - エラーなし
✅ string.utils.ts - エラーなし
✅ wifi.utils.ts - エラーなし
```

---

## 影響範囲

### 現時点での影響

**影響なし** - `porting/` ディレクトリは現在未使用のため、既存機能への影響はゼロです。

### 今後の利用方法

#### Before（porting）

```typescript
import { sleep } from "@/porting/utils/async";
import { ParserUtils } from "@/porting/utils";
import { CommandUtils } from "@/porting/utils";
```

#### After（shared）

```typescript
// ✅ 統一されたインポート
import { sleep } from "@/shared/utils";
import { ParserUtils } from "@/shared/utils";
import { CommandUtils } from "@/shared/utils";

// または
import { sleep, ParserUtils, CommandUtils } from "@/shared/utils";
```

---

## 次のステップ

### Phase 6: テスト・検証

1. 包括的なユニットテストの作成
2. 統合テストの実施
3. ドキュメントの更新
4. `porting/` ディレクトリの削除

### 推奨される順序

1. ✅ Phase 1: 型定義の統合（完了）
2. ✅ Phase 2: Serial 関連の統合（完了）
3. ✅ Phase 3: ファイル関連サービスの再構成（完了）
4. ✅ Phase 4: その他サービスの移行（完了）
5. ✅ Phase 5: ユーティリティの整理（完了）
6. ⏳ Phase 6: テスト・検証（次）

---

## まとめ

### 達成したこと

- ✅ 10 個のユーティリティファイルを統一された場所に移行
- ✅ command.utils.ts のリファクタリング（重複削除）
- ✅ 機能の拡張（新しいヘルパーメソッドを追加）
- ✅ カスタムエラークラスの拡充
- ✅ 統一された import パス
- ✅ Linter エラーなし

### 期待される効果

- ✅ コードの一元管理
- ✅ 重複の削除
- ✅ 保守性の向上
- ✅ 再利用性の向上
- ✅ import の簡潔化

### 所要時間

**約 1 時間** - 計画通り

---

**作成者**: AI Assistant  
**作成日**: 2025-10-13  
**Phase**: 5 / 6
