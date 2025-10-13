# apps/dashboard コード統合分析レポート

## 実行日時

2025-10-13

## 概要

`apps/dashboard/src/app/porting` と `apps/dashboard/src/app/shared` 配下のコードを解析し、統合の可能性と単一責任の原則の遵守状況を確認しました。

## ディレクトリ構成

### porting/ (流用・変換コード)

```
porting/
├── services/     (10サービス)
│   ├── chirimen.service.ts
│   ├── command-executor.service.ts
│   ├── directory.service.ts
│   ├── editor.service.ts
│   ├── file-content.service.ts
│   ├── file-operation.service.ts
│   ├── file.service.ts
│   ├── login.service.ts
│   ├── serial.service.ts
│   └── wifi.service.ts
├── types/        (4型定義)
│   ├── file-info.ts
│   ├── serial-port-wrapper.ts
│   ├── source-path.ts
│   └── wifi-info.ts
└── utils/        (10ユーティリティ)
    ├── async.ts
    ├── buffer.ts
    ├── command-utils.ts
    ├── date-utils.ts
    ├── error-handler.ts
    ├── file-utils.ts
    ├── parser-utils.ts
    ├── serial.errors.ts
    ├── string.ts
    └── wifi-utils.ts
```

### shared/ (自社開発コード)

```
shared/
├── constants/
├── functions/
├── guards/
├── models/       (型定義)
│   ├── file.info.models.ts
│   └── wifi.models.ts
├── service/
│   ├── serial/   (5サービス - 責任分散型)
│   │   ├── serial-connection.service.ts
│   │   ├── serial-error-handler.service.ts
│   │   ├── serial-reader.service.ts
│   │   ├── serial-validator.service.ts
│   │   └── serial-writer.service.ts
│   ├── notification/
│   └── terminal/
├── web-serial/   (NgRx状態管理)
└── xterm/        (NgRx状態管理)
```

---

## 重複・統合が必要な箇所

### 1. 型定義の重複

#### FileInfo の重複

**porting/types/file-info.ts** (シンプル版)

```typescript
export interface FileInfo {
  name: string;
  size: number;
  isDirectory: boolean;
}
```

**shared/models/file.info.models.ts** (詳細版)

```typescript
export interface FileInfo {
  name: string;
  type: FileType; // 'regular file' | 'directory' | ...
  size: number;
  child: FileInfo[];
  isOpened: boolean;
}
```

**問題点**:

- 同じ名前で異なる構造
- porting 版は`ls -la`のパース結果用
- shared 版はツリー構造の表示用

**統合提案**:

- 用途が異なるため、名前を変更して共存
- `FileListItem` (porting 用) と `FileTreeNode` (shared 用)

---

#### WiFi 情報の重複

**porting/types/wifi-info.ts**

```typescript
export interface WiFiInfo {
  address: string;
  essid: string;
  spec: string;
  quality: string;
  frequency: string;
  channel: string;
}
```

**shared/models/wifi.models.ts**

```typescript
export interface WiFiInformation {
  SSID: string; // essid と同じ
  address: string;
  channel: number; // 型が string vs number
  frequency: string;
  quality: string;
  spec: string;
}
```

**問題点**:

- ほぼ同じ情報だが、フィールド名と型が微妙に異なる
- `essid` vs `SSID`
- `channel: string` vs `channel: number`

**統合提案**:

- `WiFiInfo` に統一し、型を整合
- channel は `number` 型に統一（パース時に変換）

---

### 2. Serial 関連サービスの設計の違い

#### porting/services/serial.service.ts (統合型・211 行)

**責任範囲**:

- ✅ 接続管理（connect/disconnect）
- ✅ I/O 操作（read/write）
- ✅ コマンド実行（execute）
- ✅ ターミナルループ（startTerminal）
- ✅ 入力処理（processInput）

**依存関係**:

- `CommandExecutorService` に委譲
- `SerialPortWrapper` 型を使用

**問題点**:

- 責任が多岐にわたる（**単一責任の原則違反**）
- レガシーメソッド（portWrite, portWritelnWaitfor）が存在

---

#### shared/service/serial/ (責任分散型)

**serial-connection.service.ts** (64 行)

- ✅ 接続・切断のみ
- ✅ 接続状態の管理

**serial-reader.service.ts** (95 行)

- ✅ 読み取り専用
- ✅ Observable (RxJS) でストリーム配信
- ✅ TextDecoderStream を使用

**serial-writer.service.ts** (91 行)

- ✅ 書き込み専用
- ✅ TextEncoderStream を使用

**serial-error-handler.service.ts**

- ✅ エラーハンドリング専門

**serial-validator.service.ts**

- ✅ バリデーション専門

**設計思想**:

- 各サービスが単一責任
- RxJS を活用したリアクティブプログラミング
- モダンな Web Streams API 使用

---

### 3. ファイル関連サービスの責任分散

#### porting/services/file.service.ts (54 行)

**責任**:

- ファイル保存（saveFile）
- ファイルリスト取得（listAll）
- ディレクトリ表示（showDir）

#### porting/services/file-content.service.ts (255 行)

**責任**:

- ファイル内容取得（getFileContent）
- テキストファイル保存（saveTextFile）
- バイナリファイル保存（saveBinaryFile）
- ファイル追記（appendToFile）
- ファイル検索（searchInFile）
- 行数取得（getLineCount）
- 特定行取得（getFileLine）
- 先頭 N 行取得（getFileHead）
- 末尾 N 行取得（getFileTail）
- ファイル比較（compareFiles）

#### porting/services/file-operation.service.ts (282 行)

**責任**:

- ファイル削除（removeFile）
- ファイル移動（moveFile）
- ファイルコピー（copyFile）
- 権限変更（changeFilePermissions）
- 所有者変更（changeFileOwner）
- リネーム（renameFile）
- シンボリックリンク作成（createSymbolicLink）
- ハードリンク作成（createHardLink）
- ファイル属性表示（showFileAttributes）
- ファイルサイズ取得（getFileSize）
- 最終更新日時取得（getFileModificationTime）

**問題点**:

- 3 つのサービスで責任を分散しているが、境界が曖昧
- `file.service.ts` の `showDir()` は UI 表示まで含んでおり、責任過多
- `file-content.service.ts` が肥大化（255 行）

**統合提案**:
以下のように再構成：

1. **FileListService** - ファイルリスト、ディレクトリ操作
2. **FileContentService** - 内容の読み書きのみに集中（検索、head/tail 等は別サービスへ）
3. **FileOperationService** - CRUD 操作（削除、移動、コピー、リネーム）
4. **FileMetadataService** - メタデータ取得（サイズ、権限、更新日時、属性）
5. **FileSearchService** - 検索、head/tail、比較などの読み取り操作

---

### 4. その他のサービス

#### porting/services/directory.service.ts (198 行)

**責任**:

- カレントディレクトリ取得/変更
- ディレクトリ作成/削除
- ディレクトリ権限/所有者変更

**評価**: ✅ 単一責任（ディレクトリ操作）を守っている

---

#### porting/services/editor.service.ts (179 行)

**責任**:

- Monaco Editor の管理
- ファイル表示（showFile）
- ファイル保存（saveSource）
- フォーマット（jsFormat）

**問題点**:

- Monaco Editor の型が `any`
- `getFileContent()` の実装が不完全
- UI 更新処理が TODO のまま

**評価**: ⚠️ サービスとしての責任は明確だが、実装が不完全

---

#### porting/services/wifi.service.ts (271 行)

**責任**:

- WiFi 状態取得（wifiStat）
- WiFi スキャン（wifiScan）
- WiFi 設定（setWiFi, configureWifi）
- 再起動（reboot）
- WiFi 有効化/無効化（enableWifi, disableWifi）
- IP アドレス取得（getIpAddress）

**問題点**:

- `reboot()` はシステム管理の責任（WiFi の範疇外）

**評価**: ⚠️ ほぼ単一責任だが、`reboot()` は別サービスに移動すべき

---

#### porting/services/login.service.ts (155 行)

**責任**:

- 自動ログイン処理
- プロンプト待機
- ログイン状態チェック
- 初期設定（ヒストリ、タイムゾーン、日時設定）

**評価**: ✅ 単一責任（ログイン処理）を守っている

---

#### porting/services/chirimen.service.ts (182 行)

**責任**:

- CHIRIMEN 環境セットアップ（Node.js インストール、ライブラリ構築）
- I2C デバイス検出（i2cdetect）
- Forever アプリ管理（JS アプリ一覧取得、起動/停止）

**評価**: ✅ 単一責任（CHIRIMEN 環境管理）を守っている

---

#### porting/services/command-executor.service.ts (99 行)

**責任**:

- コマンド実行管理（executeCommand）
- プロンプト待機
- タイムアウト管理
- 保留コマンドの管理

**評価**: ✅ 単一責任（コマンド実行管理）を守っている

---

### 5. ユーティリティ

#### porting/utils/parser-utils.ts (158 行)

**責任**:

- コマンド出力のパース（ls, iwlist, ifconfig, iwconfig）

**評価**: ✅ 単一責任（パース処理）を守っている

---

#### porting/utils/file-utils.ts (102 行)

**責任**:

- テキストファイル判定
- Base64 変換
- コマンド生成（heredoc, append, base64）
- ファイル操作の前後処理（Ctrl+C, Ctrl+D）

**評価**: ✅ 単一責任（ファイル操作ユーティリティ）を守っている

---

#### porting/utils/command-utils.ts (51 行)

**責任**:

- コマンド実行
- パスエスケープ
- 出力パース
- sudo プレフィックス生成

**問題点**:

- `executeCommand()` は `CommandExecutorService` と重複
- `parseOutputLines()` は `ParserUtils` と重複

**評価**: ⚠️ 責任の重複あり

---

## 統合提案サマリー

### Phase 1: 型定義の統合

1. **FileInfo** → `FileListItem` と `FileTreeNode` に分離
2. **WiFiInfo** → `WiFiInfo` に統一（フィールド名と channel 型を整合）

### Phase 2: Serial 関連の統合

**方針**: shared/service/serial の責任分散型を採用し、porting の SerialService を統合

#### 統合後の構成

```
shared/service/serial/
├── serial-connection.service.ts    (接続管理)
├── serial-reader.service.ts        (読み取り)
├── serial-writer.service.ts        (書き込み)
├── serial-command.service.ts       (NEW: コマンド実行)
├── serial-error-handler.service.ts (エラー処理)
└── serial-validator.service.ts     (バリデーション)
```

**移行内容**:

- `porting/services/serial.service.ts` の機能を分散
- `porting/services/command-executor.service.ts` → `serial-command.service.ts` に統合
- レガシーメソッドは deprecated マークして段階的に削除

---

### Phase 3: ファイル関連サービスの再構成

**方針**: 責任をより明確に分離

#### 統合後の構成

```
shared/service/file/
├── file-list.service.ts         (リスト、ディレクトリ操作)
├── file-content.service.ts      (内容の読み書き)
├── file-operation.service.ts    (CRUD: 削除、移動、コピー、リネーム)
├── file-metadata.service.ts     (メタデータ: サイズ、権限、日時)
└── file-search.service.ts       (検索、head/tail、比較)
```

**移行内容**:

- `porting/services/file.service.ts` → `file-list.service.ts`
- `porting/services/file-content.service.ts` を分割
  - 読み書き → `file-content.service.ts`
  - 検索、head/tail、比較 → `file-search.service.ts`
- `porting/services/file-operation.service.ts` を分割
  - CRUD 操作 → `file-operation.service.ts`
  - メタデータ → `file-metadata.service.ts`

---

### Phase 4: その他のサービス

**そのまま移行** (単一責任を守っているため):

- `directory.service.ts`
- `login.service.ts`
- `chirimen.service.ts`

**修正後に移行**:

- `wifi.service.ts` - `reboot()` を `system.service.ts` に移動
- `editor.service.ts` - 型定義と TODO を完成させる

---

### Phase 5: ユーティリティの統合

1. **command-utils.ts** の重複メソッドを削除
   - `executeCommand()` を削除（ServiceLayer に任せる）
   - `parseOutputLines()` を削除（ParserUtils に統一）
2. その他の utils は `shared/functions/` に移動

---

## 単一責任の原則 遵守状況

### ✅ 遵守しているサービス

- `directory.service.ts`
- `login.service.ts`
- `chirimen.service.ts`
- `command-executor.service.ts`
- `shared/service/serial/*` (責任分散型)

### ⚠️ 改善が必要なサービス

- `serial.service.ts` - **責任過多**（接続、I/O、コマンド、ターミナル）
- `file.service.ts` - `showDir()` が UI 表示まで含む
- `file-content.service.ts` - **肥大化**（255 行）、責任が多い
- `wifi.service.ts` - `reboot()` が WiFi の責任外

### ❌ 大幅な改善が必要

- `command-utils.ts` - 他のサービス/ユーティリティと重複

---

## 推奨される統合手順

1. **Phase 1**: 型定義の統合（1 日）
2. **Phase 2**: Serial 関連の統合（3-5 日）
3. **Phase 3**: ファイル関連の再構成（3-5 日）
4. **Phase 4**: その他サービスの移行（2-3 日）
5. **Phase 5**: ユーティリティの整理（1-2 日）
6. **Phase 6**: テスト・検証・リファクタリング（3-5 日）

**合計**: 約 2-3 週間

---

## まとめ

### 良い点

- `porting/services/` の多くのサービスは単一責任を守っている
- `shared/service/serial/` の責任分散型設計は優れている
- ユーティリティ類は概ね適切に分離されている

### 改善すべき点

- `serial.service.ts` は責任が多すぎる
- ファイル関連サービスの境界が曖昧で肥大化している
- 型定義が重複しており、統一が必要
- 一部のユーティリティに責任の重複がある

### 統合の優先度

1. **高**: Serial 関連（使用頻度が高く、影響範囲が大きい）
2. **高**: 型定義の統合（全体に影響する基盤）
3. **中**: ファイル関連サービス（複雑だが影響範囲は限定的）
4. **低**: その他サービスとユーティリティ（影響が小さい）
