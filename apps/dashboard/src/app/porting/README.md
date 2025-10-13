# ⚠️ DEPRECATED: このディレクトリは非推奨です

## 状態

**廃止予定** - このディレクトリのコードは `shared/` に統合されました。

## 移行完了日

2025-10-13

## 移行先

### サービス (services/)

| 旧サービス                    | 新サービス                                     | 場所                        |
| ----------------------------- | ---------------------------------------------- | --------------------------- |
| `serial.service.ts`           | `SerialFacadeService`                          | `shared/service/serial/`    |
| `command-executor.service.ts` | `SerialCommandService`                         | `shared/service/serial/`    |
| `file.service.ts`             | `FileListService`                              | `shared/service/file/`      |
| `file-content.service.ts`     | `FileContentService`                           | `shared/service/file/`      |
| `file-operation.service.ts`   | `FileOperationService` + `FileMetadataService` | `shared/service/file/`      |
| `directory.service.ts`        | `DirectoryService`                             | `shared/service/directory/` |
| `login.service.ts`            | `LoginService`                                 | `shared/service/auth/`      |
| `wifi.service.ts`             | `WiFiService`                                  | `shared/service/wifi/`      |
| `chirimen.service.ts`         | `ChirimenService`                              | `shared/service/chirimen/`  |
| `editor.service.ts`           | `EditorService`                                | `shared/service/editor/`    |

### 型定義 (types/)

| 旧型         | 新型           | 場所                                 |
| ------------ | -------------- | ------------------------------------ |
| `FileInfo`   | `FileListItem` | `shared/models/file-list.model.ts`   |
| `WiFiInfo`   | `WiFiInfo`     | `shared/models/wifi.model.ts`        |
| `SourcePath` | `SourcePath`   | `shared/models/source-path.model.ts` |

### ユーティリティ (utils/)

| 旧ユーティリティ   | 新ユーティリティ         | 場所            |
| ------------------ | ------------------------ | --------------- |
| `async.ts`         | `async.utils.ts`         | `shared/utils/` |
| `buffer.ts`        | `buffer.utils.ts`        | `shared/utils/` |
| `command-utils.ts` | `command.utils.ts`       | `shared/utils/` |
| `date-utils.ts`    | `date.utils.ts`          | `shared/utils/` |
| `error-handler.ts` | `error-handler.utils.ts` | `shared/utils/` |
| `file-utils.ts`    | `file.utils.ts`          | `shared/utils/` |
| `parser-utils.ts`  | `parser.utils.ts`        | `shared/utils/` |
| `serial.errors.ts` | `errors.ts`              | `shared/utils/` |
| `string.ts`        | `string.utils.ts`        | `shared/utils/` |
| `wifi-utils.ts`    | `wifi.utils.ts`          | `shared/utils/` |

## 移行方法

### Before

```typescript
import { SerialService } from "@/porting/services/serial.service";
import { FileInfo } from "@/porting/types/file-info";
import { ParserUtils } from "@/porting/utils";
```

### After

```typescript
import { SerialFacadeService } from "@/shared/service/serial";
import { FileListItem } from "@/shared/models/file-list.model";
import { ParserUtils } from "@/shared/utils";
```

## 詳細ドキュメント

詳細な移行ガイドは以下のドキュメントを参照してください:

- `memos/step4/CODE_INTEGRATION_ANALYSIS.md` - コード統合分析
- `memos/step4/INTEGRATION_IMPLEMENTATION_PLAN.md` - 実装計画
- `memos/step4/PHASE1_COMPLETION_REPORT.md` - Phase 1 完了レポート
- `memos/step4/PHASE2_COMPLETION_REPORT.md` - Phase 2 完了レポート
- `memos/step4/PHASE3_COMPLETION_REPORT.md` - Phase 3 完了レポート
- `memos/step4/PHASE4_COMPLETION_REPORT.md` - Phase 4 完了レポート
- `memos/step4/PHASE5_COMPLETION_REPORT.md` - Phase 5 完了レポート
- `memos/step4/MIGRATION_GUIDE.md` - 移行ガイド
- `memos/step4/INTEGRATION_COMPLETE_REPORT.md` - 統合完了レポート
- `memos/step4/FINAL_INTEGRATION_SUMMARY.md` - 最終サマリー

## 削除予定

このディレクトリは将来のバージョンで削除される予定です。
新しいコードでは `shared/` 配下のサービス・型・ユーティリティを使用してください。
