# 移行ガイド: porting/ から shared/ へ

## 概要

`porting/` 配下のコードは `shared/` に統合されました。このガイドでは、既存コードを新しいサービス・型・ユーティリティに移行する方法を説明します。

---

## クイックリファレンス

### サービスの移行

| Before (porting)       | After (shared)         | import 文                                                  |
| ---------------------- | ---------------------- | ---------------------------------------------------------- |
| `SerialService`        | `SerialFacadeService`  | `import { SerialFacadeService } from '@/shared/service';`  |
| `FileService`          | `FileListService`      | `import { FileListService } from '@/shared/service';`      |
| `FileContentService`   | `FileContentService`   | `import { FileContentService } from '@/shared/service';`   |
| `FileOperationService` | `FileOperationService` | `import { FileOperationService } from '@/shared/service';` |
| `DirectoryService`     | `DirectoryService`     | `import { DirectoryService } from '@/shared/service';`     |
| `LoginService`         | `LoginService`         | `import { LoginService } from '@/shared/service';`         |
| `WiFiService`          | `WiFiService`          | `import { WiFiService } from '@/shared/service';`          |
| `ChirimenService`      | `ChirimenService`      | `import { ChirimenService } from '@/shared/service';`      |
| `EditorService`        | `EditorService`        | `import { EditorService } from '@/shared/service';`        |

### 型定義の移行

| Before (porting) | After (shared) | import 文                                         |
| ---------------- | -------------- | ------------------------------------------------- |
| `FileInfo`       | `FileListItem` | `import { FileListItem } from '@/shared/models';` |
| `WiFiInfo`       | `WiFiInfo`     | `import { WiFiInfo } from '@/shared/models';`     |
| `SourcePath`     | `SourcePath`   | `import { SourcePath } from '@/shared/models';`   |

### ユーティリティの移行

| Before (porting) | After (shared) | import 文                                        |
| ---------------- | -------------- | ------------------------------------------------ |
| `ParserUtils`    | `ParserUtils`  | `import { ParserUtils } from '@/shared/utils';`  |
| `FileUtils`      | `FileUtils`    | `import { FileUtils } from '@/shared/utils';`    |
| `CommandUtils`   | `CommandUtils` | `import { CommandUtils } from '@/shared/utils';` |
| `DateUtils`      | `DateUtils`    | `import { DateUtils } from '@/shared/utils';`    |
| `WiFiUtils`      | `WiFiUtils`    | `import { DateUtils } from '@/shared/utils';`    |
| `sleep()`        | `sleep()`      | `import { sleep } from '@/shared/utils';`        |

---

## 詳細な移行方法

### 1. SerialService → SerialFacadeService

#### Before

```typescript
import { SerialService } from '@/porting/services/serial.service';

@Component({...})
export class MyComponent {
  private serial = inject(SerialService);

  async onConnect() {
    await this.serial.connect();
    await this.serial.portWritelnWaitfor('ls', 'pi@raspberrypi:', 10000);
  }
}
```

#### After

```typescript
import { SerialFacadeService } from '@/shared/service';

@Component({...})
export class MyComponent {
  private serial = inject(SerialFacadeService);

  async onConnect() {
    await this.serial.connect();
    // メソッド名は同じ（後方互換性あり）
    await this.serial.portWritelnWaitfor('ls', 'pi@raspberrypi:', 10000);

    // または新しいメソッド名を使用
    await this.serial.executeCommand('ls', 'pi@raspberrypi:', 10000);
  }
}
```

---

### 2. FileInfo → FileListItem

#### Before

```typescript
import { FileInfo } from "@/porting/types/file-info";

const files: FileInfo[] = await fileService.listAll();
```

#### After

```typescript
import { FileListItem } from "@/shared/models";

const files: FileListItem[] = await fileList.listFiles();
```

---

### 3. WiFiInfo の変更

#### Before

```typescript
import { WiFiInfo } from '@/porting/types/wifi-info';

interface WiFiInfo {
  essid: string;      // ESSID
  channel: string;    // 文字列型
  ...
}
```

#### After

```typescript
import { WiFiInfo } from '@/shared/models';

interface WiFiInfo {
  ssid: string;       // essid → ssid に変更
  channel: number;    // 文字列 → 数値型に変更
  ...
}
```

---

### 4. ファイル操作の分離

#### Before (file-content.service.ts)

```typescript
import { FileContentService } from "@/porting/services/file-content.service";

const service = inject(FileContentService);

// 読み取り
const content = await service.getFileContent("/path/to/file");

// 検索
const results = await service.searchInFile("/path/to/file", "search");

// メタデータ取得
const size = await service.getFileSize("/path/to/file");
```

#### After（責任別サービス）

```typescript
import { FileContentService, FileSearchService, FileMetadataService } from "@/shared/service";

const fileContent = inject(FileContentService);
const fileSearch = inject(FileSearchService);
const fileMeta = inject(FileMetadataService);

// 読み取り
const content = await fileContent.readFile("/path/to/file");

// 検索
const results = await fileSearch.searchInFile("/path/to/file", "search");

// メタデータ取得
const size = await fileMeta.getFileSize("/path/to/file");
```

---

### 5. WiFiService の reboot() 分離

#### Before

```typescript
import { WiFiService } from "@/porting/services/wifi.service";

const wifi = inject(WiFiService);

await wifi.setWiFi("SSID", "password");
await wifi.reboot(); // WiFi の責任外
```

#### After

```typescript
import { WiFiService } from "@/shared/service";
import { SystemService } from "@/shared/service";

const wifi = inject(WiFiService);
const system = inject(SystemService);

await wifi.setWiFi("SSID", "password");
await system.reboot(); // System が担当
```

---

### 6. CommandUtils のリファクタリング

#### Before

```typescript
import { CommandUtils } from "@/porting/utils/command-utils";

// ❌ Service層と重複していた
await CommandUtils.executeCommand(serial, "ls", "pi@raspberrypi:");

// ❌ ParserUtils と重複していた
const lines = CommandUtils.parseOutputLines(output);
```

#### After

```typescript
import { SerialFacadeService } from "@/shared/service";
import { ParserUtils } from "@/shared/utils";

// ✅ Service層で実行
await serial.executeCommand("ls", "pi@raspberrypi:");

// ✅ ParserUtils で統一
const lines = ParserUtils.parseOutputLines(output);

// CommandUtils は純粋なユーティリティのみ
import { CommandUtils } from "@/shared/utils";
const escaped = CommandUtils.escapePath("/path/to/file");
```

---

## メソッド名の変更一覧

### SerialFacadeService

| 旧メソッド              | 新メソッド         | 状態                                       |
| ----------------------- | ------------------ | ------------------------------------------ |
| `startConnection()`     | `connect()`        | 旧メソッドは @deprecated（後方互換性あり） |
| `terminateConnection()` | `disconnect()`     | 旧メソッドは @deprecated（後方互換性あり） |
| `portWrite()`           | `write()`          | 旧メソッドは @deprecated（後方互換性あり） |
| `portWritelnWaitfor()`  | `executeCommand()` | 旧メソッドは @deprecated（後方互換性あり） |
| `getConnectionStatus()` | `isConnected()`    | 旧メソッドは @deprecated（後方互換性あり） |

### WiFiService

| 旧メソッド   | 新メソッド               | 状態                                       |
| ------------ | ------------------------ | ------------------------------------------ |
| `wifiStat()` | `getWifiStatus()`        | 旧メソッドは @deprecated（後方互換性あり） |
| `wifiScan()` | `scanNetworks()`         | 旧メソッドは @deprecated（後方互換性あり） |
| `reboot()`   | `SystemService.reboot()` | SystemService に移動                       |

### ChirimenService

| 旧メソッド            | 新メソッド             | 状態                                       |
| --------------------- | ---------------------- | ------------------------------------------ |
| `i2cdetect()`         | `detectI2cDevices()`   | 旧メソッドは @deprecated（後方互換性あり） |
| `setForeverApp()`     | `startForeverApp()`    | 旧メソッドは @deprecated（後方互換性あり） |
| `stopAllForeverApp()` | `stopAllForeverApps()` | 旧メソッドは @deprecated（後方互換性あり） |

### EditorService

| 旧メソッド   | 新メソッド       | 状態                                       |
| ------------ | ---------------- | ------------------------------------------ |
| `editSrc()`  | `editSource()`   | 旧メソッドは @deprecated（後方互換性あり） |
| `jsFormat()` | `formatSource()` | 旧メソッドは @deprecated（後方互換性あり） |

---

## 新しいサービスの使用例

### SerialFacadeService（推奨）

```typescript
import { SerialFacadeService } from '@/shared/service';

@Component({...})
export class MyComponent {
  private serial = inject(SerialFacadeService);

  async onConnect() {
    // 接続
    const success = await this.serial.connect(115200);

    if (success) {
      // コマンド実行
      const result = await this.serial.executeCommand(
        'ls -la',
        'pi@raspberrypi:',
        10000
      );

      // データ書き込み
      await this.serial.write('Hello\n');

      // データストリームを購読
      this.serial.data$.subscribe(data => {
        console.log('Received:', data);
      });
    }
  }
}
```

### 個別サービスの使用（高度な制御が必要な場合）

```typescript
import {
  SerialConnectionService,
  SerialReaderService,
  SerialWriterService,
  SerialCommandService
} from '@/shared/service';

@Component({...})
export class AdvancedComponent {
  private connection = inject(SerialConnectionService);
  private reader = inject(SerialReaderService);
  private writer = inject(SerialWriterService);
  private command = inject(SerialCommandService);

  async onConnect() {
    const result = await this.connection.connect(115200);
    if ('port' in result) {
      this.writer.initialize(result.port);
      await this.reader.startReading(result.port);
    }
  }
}
```

---

## ファイル関連サービスの使用

### 推奨される使い方

```typescript
import {
  FileListService,
  FileContentService,
  FileSearchService,
  FileMetadataService,
  FileOperationService
} from '@/shared/service';

@Component({...})
export class FileManagerComponent {
  private fileList = inject(FileListService);
  private fileContent = inject(FileContentService);
  private fileSearch = inject(FileSearchService);
  private fileMeta = inject(FileMetadataService);
  private fileOps = inject(FileOperationService);

  async loadFiles() {
    // リスト取得
    this.files = await this.fileList.listFiles();
  }

  async openFile(path: string) {
    // ファイル読み取り
    const content = await this.fileContent.readFile(path);
    this.editor.setValue(content.content);
  }

  async searchInFile(path: string, term: string) {
    // ファイル内検索
    const results = await this.fileSearch.searchInFile(path, term);
  }

  async getFileInfo(path: string) {
    // メタデータ取得
    const size = await this.fileMeta.getFileSize(path);
    const modTime = await this.fileMeta.getFileModificationTime(path);
  }

  async deleteFile(path: string) {
    // ファイル削除
    await this.fileOps.removeFile(path);
  }
}
```

---

## よくある質問 (FAQ)

### Q1: レガシーメソッドはいつ削除されますか？

**A**: 次のメジャーバージョン（v2.0）で削除予定です。それまでは @deprecated マークが付きますが、動作します。

### Q2: 既存のコードをすぐに移行する必要がありますか？

**A**: いいえ。後方互換性があるため、既存のコードは動作し続けます。新しい機能を追加する際に、徐々に新しいサービスに移行してください。

### Q3: porting ディレクトリはいつ削除されますか？

**A**: 全てのコードが移行され、レビューが完了した後に削除予定です。

### Q4: なぜ SerialService ではなく SerialFacadeService を使うのですか？

**A**: SerialFacadeService は複数の責任分散型サービスを統合し、使いやすいインターフェースを提供します。内部では以下のサービスを使用しています:

- SerialConnectionService（接続管理）
- SerialReaderService（読み取り）
- SerialWriterService（書き込み）
- SerialCommandService（コマンド実行）

### Q5: ファイル操作が 5 つのサービスに分かれていますが、どれを使えばいいですか？

**A**: 責任に応じて使い分けてください:

- **FileListService**: ファイルリストを取得したい
- **FileContentService**: ファイルを読み書きしたい
- **FileSearchService**: ファイル内を検索したい
- **FileMetadataService**: ファイルサイズや更新日時を取得したい
- **FileOperationService**: ファイルを削除・移動・コピーしたい

---

## トラブルシューティング

### エラー: "Module not found: @/porting/..."

**解決方法**: import パスを `@/shared/...` に変更してください。

### エラー: "Property 'essid' does not exist on type 'WiFiInfo'"

**解決方法**: `essid` は `ssid` に変更されました。

### エラー: "Type 'string' is not assignable to type 'number'"（WiFiInfo.channel）

**解決方法**: `channel` は `number` 型に変更されました。ParserUtils が自動的に変換します。

### エラー: "Method 'portWritelnWaitfor' is deprecated"

**解決方法**: `executeCommand()` を使用してください。または、警告を無視して後で移行してください（動作は継続します）。

---

## チェックリスト

移行時には以下のチェックリストを使用してください:

- [ ] `@/porting/...` の import を `@/shared/...` に変更
- [ ] `FileInfo` を `FileListItem` に変更（ls 用）
- [ ] `WiFiInfo.essid` を `WiFiInfo.ssid` に変更
- [ ] `WiFiInfo.channel` を `number` として扱う
- [ ] `reboot()` を `SystemService` から呼び出す
- [ ] レガシーメソッド（@deprecated）を新しいメソッドに置き換え
- [ ] ファイル操作を適切なサービスに振り分け
- [ ] テストを実行して動作確認

---

## サポート

移行に関する質問や問題があれば、以下のドキュメントを参照してください:

- `CODE_INTEGRATION_ANALYSIS.md` - 統合分析レポート（同ディレクトリ）
- `INTEGRATION_IMPLEMENTATION_PLAN.md` - 実装計画（同ディレクトリ）
- `PHASE1_COMPLETION_REPORT.md` から `PHASE6_COMPLETION_REPORT.md` - 各フェーズの完了レポート（同ディレクトリ）

---

**作成者**: AI Assistant  
**作成日**: 2025-10-13  
**バージョン**: 1.0
