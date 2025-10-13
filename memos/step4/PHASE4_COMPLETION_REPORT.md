# Phase 4: その他サービスの移行 - 完了レポート

## 実施日

2025-10-13

## 概要

`porting/services/` の残りのサービスを `shared/service/` に移行し、責任を整理しました。SystemService を新設し、WiFiService から reboot() を分離しました。また、EditorService を完成させました。

---

## 実施内容

### ✅ 4.1 DirectoryService の移行

#### 作成したファイル

- **`shared/service/directory/directory.service.ts`**
- **`shared/service/directory/index.ts`**

#### 責任

ディレクトリ操作（移動、作成、削除、権限変更）

#### 移行元

- `porting/services/directory.service.ts`

#### 主なメソッド

```typescript
async getCurrentDirectory(): Promise<string>
async changeDirectory(dir?: string): Promise<string>
async goHome(): Promise<string>
async navigateToDirectory(path: string): Promise<string>
async createDirectory(dirName: string, recursive?: boolean): Promise<void>
async removeDirectory(dirName: string, recursive?: boolean): Promise<void>
async changeDirectoryPermissions(dirName: string, permissions: string): Promise<void>
async changeDirectoryOwner(dirName: string, owner: string, group?: string): Promise<void>
getCurrentDirectoryInfo(): DirectoryInfo
getCurrentDir(): string
getAbsolutePath(): string
```

#### 評価

✅ 単一責任の原則を遵守（ディレクトリ操作のみを担当）

---

### ✅ 4.2 LoginService の移行

#### 作成したファイル

- **`shared/service/auth/login.service.ts`**
- **`shared/service/auth/index.ts`**

#### 責任

Raspberry Pi へのログイン処理

#### 移行元

- `porting/services/login.service.ts`

#### 主なメソッド

```typescript
async autoLogin(config?: Partial<LoginConfig>): Promise<void>
async logout(): Promise<void>
```

#### 主な機能

- プロンプト待機
- ログイン状態チェック
- ログイン処理実行
- 初期設定（ヒストリ、タイムゾーン、日時設定）

#### 評価

✅ 単一責任の原則を遵守（ログイン処理のみを担当）

---

### ✅ 4.3 SystemService の新設

#### 作成したファイル

- **`shared/service/system/system.service.ts`**
- **`shared/service/system/index.ts`**

#### 責任

システム全体の操作（再起動、シャットダウン、システム情報取得）

#### 分離元

- `porting/services/wifi.service.ts` の `reboot()` メソッド

#### 主なメソッド

```typescript
async reboot(): Promise<void>
async shutdown(): Promise<void>
async getHostname(): Promise<string>
async getOsVersion(): Promise<string>
async getKernelVersion(): Promise<string>
async getUptime(): Promise<string>
async getCpuInfo(): Promise<string>
async getMemoryInfo(): Promise<string>
async getSystemInfo(): Promise<SystemInfo>
async getDiskUsage(): Promise<string>
async getSystemDateTime(): Promise<Date>
```

#### 設計意図

WiFiService から `reboot()` を分離し、システム操作を一元管理

#### 評価

✅ 責任の明確化（WiFi は WiFi のみ、System は System のみ）

---

### ✅ 4.4 WiFiService の移行・リファクタリング

#### 作成したファイル

- **`shared/service/wifi/wifi.service.ts`**
- **`shared/service/wifi/index.ts`**

#### 責任

WiFi の状態確認、スキャン、設定

#### 移行元

- `porting/services/wifi.service.ts`（reboot() を除く）

#### 主なメソッド

```typescript
async getWifiStatus(): Promise<{ ipInfo: string; wlInfo: string; ipaddr?: string }>
async scanNetworks(): Promise<{ rawData: string[]; wifiInfos: WiFiInfo[] }>
async setWiFi(ssid: string, password: string): Promise<void>
async configureWifi(ssid: string, password: string): Promise<void>
async getDetailedWifiStatus(): Promise<string>
async enableWifi(): Promise<void>
async disableWifi(): Promise<void>
async getIpAddress(): Promise<string>
async showNetworkConfig(): Promise<string>

// Legacy methods
async wifiStat(): Promise<...>  // @deprecated
async wifiScan(): Promise<...>  // @deprecated
```

#### リファクタリング内容

- **Before**: 271 行（WiFi 操作 + reboot）
- **After**: 約 320 行（WiFi 操作のみ、機能は拡充）
- `reboot()` を SystemService に分離

#### 評価

✅ 単一責任の原則を遵守（WiFi 操作のみを担当）

---

### ✅ 4.5 ChirimenService の移行

#### 作成したファイル

- **`shared/service/chirimen/chirimen.service.ts`**
- **`shared/service/chirimen/index.ts`**

#### 責任

CHIRIMEN 環境のセットアップとアプリケーション管理

#### 移行元

- `porting/services/chirimen.service.ts`

#### 主なメソッド

```typescript
async setupChirimen(): Promise<string>
async detectI2cDevices(): Promise<string>
async getJsApps(): Promise<string[]>
async stopAllForeverApps(): Promise<void>
async startForeverApp(appName: string): Promise<void>
async listForeverApps(): Promise<string>

// Legacy methods
async i2cdetect(): Promise<string>           // @deprecated
async setForeverApp(appName: string): Promise<void>  // @deprecated
async stopAllForeverApp(): Promise<void>     // @deprecated
```

#### 主な機能

- Node.js のインストール
- CHIRIMEN ライブラリのセットアップ
- Forever コマンドのインストール
- I2C デバイスの検出
- Forever アプリの管理

#### 評価

✅ 単一責任の原則を遵守（CHIRIMEN 環境管理のみを担当）

---

### ✅ 4.6 EditorService の完成

#### 作成したファイル

- **`shared/service/editor/editor.service.ts`**
- **`shared/service/editor/index.ts`**
- **`shared/models/source-path.model.ts`**

#### 責任

Monaco Editor の管理とファイル編集機能

#### 移行元

- `porting/services/editor.service.ts`

#### 改善点

1. **Monaco Editor の型を正しく設定**

   - `any` → `monaco.editor.IStandaloneCodeEditor`

2. **TODO を実装**

   - エディター初期化処理を実装
   - ファイル保存処理を実装（FileContentService を利用）
   - ファイル読み込み処理を実装（FileContentService を利用）

3. **依存関係の整理**
   - `FileContentService` に依存
   - `DirectoryService` に依存

#### 主なメソッド

```typescript
initializeEditor(container: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions): void
async editSource(srcTxt: string, fileName: string, currentDir: string, editFlg: boolean): Promise<void>
async saveSource(forceOption?: boolean): Promise<string | null>
formatSource(): void
disableSave(): void
setReadOnly(readonlyOpt: boolean): void
getSourcePath(): SourcePath | null
getValue(): string | null
setValue(value: string): void
isEdited(): boolean
isSaveDisabled(): boolean
getEditor(): monaco.editor.IStandaloneCodeEditor | null
dispose(): void
async showFile(fileName: string, size: number, editFlg: boolean): Promise<void>
async createNewText(fileName: string): Promise<void>
async saveEditedText(srcTxt: string, sourcePath: SourcePath): Promise<void>

// Legacy methods
async editSrc(...): Promise<void>  // @deprecated
jsFormat(): void                   // @deprecated
```

#### 評価

✅ 型の明確化、TODO の実装完了、単一責任の原則を遵守

---

## 作成・更新されたファイル一覧

### 新規作成 (12 ファイル)

- ✅ `shared/service/directory/directory.service.ts`
- ✅ `shared/service/directory/index.ts`
- ✅ `shared/service/auth/login.service.ts`
- ✅ `shared/service/auth/index.ts`
- ✅ `shared/service/system/system.service.ts`
- ✅ `shared/service/system/index.ts`
- ✅ `shared/service/wifi/wifi.service.ts`
- ✅ `shared/service/wifi/index.ts`
- ✅ `shared/service/chirimen/chirimen.service.ts`
- ✅ `shared/service/chirimen/index.ts`
- ✅ `shared/service/editor/editor.service.ts`
- ✅ `shared/service/editor/index.ts`
- ✅ `shared/models/source-path.model.ts`

---

## アーキテクチャ図

### Phase 4 実施前

```
porting/services/
├── directory.service.ts    (ディレクトリ操作)
├── login.service.ts        (ログイン処理)
├── wifi.service.ts         (WiFi操作 + reboot) ❌
├── chirimen.service.ts     (CHIRIMEN環境管理)
└── editor.service.ts       (エディター管理) ⚠️ TODO多数
```

### Phase 4 実施後

```
shared/service/
├── directory/
│   └── directory.service.ts       (ディレクトリ操作)
├── auth/
│   └── login.service.ts           (ログイン処理)
├── system/                        (NEW)
│   └── system.service.ts          (システム操作)
├── wifi/
│   └── wifi.service.ts            (WiFi操作のみ) ✅
├── chirimen/
│   └── chirimen.service.ts        (CHIRIMEN環境管理)
└── editor/
    └── editor.service.ts          (エディター管理) ✅
```

---

## 設計の改善点

### SystemService の分離

#### Before

```typescript
// ❌ WiFiService が reboot() を持つ（責任外）
class WiFiService {
  async wifiStat() { ... }
  async wifiScan() { ... }
  async setWiFi() { ... }
  async reboot() { ... }  // ← WiFi の責任ではない
}
```

#### After

```typescript
// ✅ WiFi は WiFi のみを担当
class WiFiService {
  async getWifiStatus() { ... }
  async scanNetworks() { ... }
  async setWiFi() { ... }
  // reboot() は削除
}

// ✅ System 操作は System が担当
class SystemService {
  async reboot() { ... }
  async shutdown() { ... }
  async getSystemInfo() { ... }
}
```

---

### EditorService の改善

#### Before

```typescript
class EditorService {
  private editor: any; // ❌ 型が不明確

  // TODO: Monaco Editorの初期化を実装
  // TODO: 保存処理を実装
  // TODO: UIの更新処理を実装
}
```

#### After

```typescript
class EditorService {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;  // ✅ 型が明確

  initializeEditor(container: HTMLElement, options?: ...): void { ... }  // ✅ 実装完了
  async saveSource(): Promise<string | null> { ... }                     // ✅ 実装完了
  async showFile(fileName: string, ...): Promise<void> { ... }          // ✅ 実装完了
}
```

---

## サービスマップ

### Phase 4 で移行した全サービス

| サービス         | 移行先                         | 責任              | 行数      | 評価 |
| ---------------- | ------------------------------ | ----------------- | --------- | ---- |
| DirectoryService | `shared/service/directory/`    | ディレクトリ操作  | 約 200 行 | ✅   |
| LoginService     | `shared/service/auth/`         | ログイン処理      | 約 215 行 | ✅   |
| SystemService    | `shared/service/system/` (NEW) | システム操作      | 約 230 行 | ✅   |
| WiFiService      | `shared/service/wifi/`         | WiFi 操作         | 約 320 行 | ✅   |
| ChirimenService  | `shared/service/chirimen/`     | CHIRIMEN 環境管理 | 約 330 行 | ✅   |
| EditorService    | `shared/service/editor/`       | エディター管理    | 約 310 行 | ✅   |

**合計**: 約 1,605 行

---

## テスト結果

### Linter チェック

```bash
✅ directory.service.ts - エラーなし
✅ login.service.ts - エラーなし
✅ system.service.ts - エラーなし
✅ wifi.service.ts - エラーなし
✅ chirimen.service.ts - エラーなし
✅ editor.service.ts - エラーなし
```

---

## 影響範囲

### 現時点での影響

**影響なし** - `porting/` ディレクトリは現在未使用のため、既存機能への影響はゼロです。

### 今後の利用シーン

#### DirectoryService

```typescript
@Component({...})
export class FileExplorerComponent {
  private directory = inject(DirectoryService);

  async navigateToHome() {
    const path = await this.directory.goHome();
    await this.refreshFileList();
  }
}
```

#### LoginService

```typescript
@Component({...})
export class LoginComponent {
  private login = inject(LoginService);

  async onConnect() {
    await this.login.autoLogin({
      loginId: 'pi',
      loginPassword: 'raspberry',
      language: 'ja',
    });
  }
}
```

#### SystemService

```typescript
@Component({...})
export class SystemControlComponent {
  private system = inject(SystemService);

  async onReboot() {
    if (confirm('本当に再起動しますか？')) {
      await this.system.reboot();
    }
  }

  async loadSystemInfo() {
    this.info = await this.system.getSystemInfo();
  }
}
```

#### EditorService

```typescript
@Component({...})
export class CodeEditorComponent implements AfterViewInit {
  @ViewChild('editorContainer') container!: ElementRef;
  private editor = inject(EditorService);

  ngAfterViewInit() {
    this.editor.initializeEditor(this.container.nativeElement);
  }

  async openFile(fileName: string) {
    await this.editor.showFile(fileName, 0, true);
  }

  async save() {
    await this.editor.saveSource();
  }
}
```

---

## 次のステップ

### Phase 5: ユーティリティの整理

1. `porting/utils/` を `shared/utils/` に移行
2. `command-utils.ts` のリファクタリング（重複削除）
3. その他のユーティリティを整理

### Phase 6: テスト・検証

1. 包括的なユニットテストの作成
2. 統合テストの実施
3. ドキュメントの更新

### 推奨される順序

1. ✅ Phase 1: 型定義の統合（完了）
2. ✅ Phase 2: Serial 関連の統合（完了）
3. ✅ Phase 3: ファイル関連サービスの再構成（完了）
4. ✅ Phase 4: その他サービスの移行（完了）
5. ⏳ Phase 5: ユーティリティの整理（次）
6. ⏳ Phase 6: テスト・検証

---

## まとめ

### 達成したこと

- ✅ 6 つのサービスを shared に移行
- ✅ SystemService を新設（責任の明確化）
- ✅ WiFiService から reboot() を分離
- ✅ EditorService の TODO を実装完了
- ✅ Monaco Editor の型を正しく設定
- ✅ すべてのサービスが単一責任の原則を遵守
- ✅ Linter エラーなし

### 期待される効果

- ✅ 責任の明確化
- ✅ コードの再利用性向上
- ✅ 保守性の向上
- ✅ テスタビリティの向上
- ✅ 機能追加の容易性

### 所要時間

**約 2 時間** - 計画範囲内

---

**作成者**: AI Assistant  
**作成日**: 2025-10-13  
**Phase**: 4 / 6
