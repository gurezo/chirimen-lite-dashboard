# Phase 3-2: ConsoleComponent リファクタリング ガイド

## 概要

Phase 3-2 では、`ConsoleComponent` を新しい `TerminalService` を使用するようにリファクタリングします。
このガイドでは、段階的な移行手順を説明します。

---

## 現状

### 現在の ConsoleComponent

```typescript:apps/dashboard/src/app/pages/console/console.component.ts
export default class ConsoleComponent implements AfterViewInit {
  store = inject(Store);
  service = inject(WebSerialService); // 古いサービス
  xtermService = inject(XtermService); // キー入力処理のみ
  dialogService = inject(DialogService);
  dialog = inject(Dialog);

  label = 'connect';
  xterminal = new Terminal(xtermConsoleConfigOptions);
  consoleDom: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  private configTerminal() {
    this.consoleDom = document.getElementById('consoleDom');
    if (this.consoleDom) {
      this.xterminal.open(this.consoleDom);
    } else {
      return;
    }

    this.xterminal.reset();
    this.xterminal.writeln('$ ');

    this.xterminal.onKey((e) => this.xtermService.onKey(this.xterminal, e));
  }
}
```

### 問題点

1. **WebSerialService を直接使用**

   - 古い実装を参照している
   - Serial 通信と Terminal 表示が分離されている

2. **XtermService がキー入力のみを処理**

   - Serial への送信が統合されていない
   - Terminal と Serial の同期が手動

3. **接続管理が不明瞭**
   - Store から接続状態を取得しているが、Terminal との連携がない

---

## 移行手順

### Step 1: TerminalService の注入

まず、新しい `TerminalService` を注入します。

```typescript
export default class ConsoleComponent implements AfterViewInit, OnDestroy {
  private store = inject(Store);
  private terminalService = inject(TerminalService); // 新しいサービス
  private dialogService = inject(DialogService);
  private dialog = inject(Dialog);
  private serialNotification = inject(SerialNotificationService);

  xterminal = new Terminal(xtermConsoleConfigOptions);
  consoleDom: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.initializeTerminal();
  }

  ngOnDestroy(): void {
    // クリーンアップ処理
  }
}
```

### Step 2: Terminal の初期化

Terminal を初期化し、`TerminalService` に登録します。

```typescript
private initializeTerminal(): void {
  this.consoleDom = document.getElementById('consoleDom');
  if (!this.consoleDom) {
    console.error('Console DOM element not found');
    return;
  }

  // Terminal を DOM に追加
  this.xterminal.open(this.consoleDom);
  this.xterminal.reset();
  this.xterminal.writeln('CHIRIMEN Dashboard\r\n');
  this.xterminal.writeln('$ ');

  // TerminalService に Terminal を登録
  this.terminalService.initialize(this.xterminal);

  // キー入力処理
  this.xterminal.onKey((e) =>
    this.terminalService.handleKeyInput(this.xterminal, e)
  );
}
```

### Step 3: Serial 接続処理の追加

接続ボタンのハンドラーを追加します。

```typescript
async onConnectSerial(): Promise<void> {
  const result = await this.terminalService.connectToSerial();

  if (result.success) {
    this.serialNotification.notifyConnectionSuccess();
  } else {
    this.serialNotification.notifyConnectionError(result.message);
  }
}

async onDisconnectSerial(): Promise<void> {
  await this.terminalService.disconnect();
  this.xterminal.writeln('\r\nDisconnected from serial port\r\n$ ');
}
```

### Step 4: クリーンアップ処理

Component 破棄時に Serial 接続を切断します。

```typescript
ngOnDestroy(): void {
  if (this.terminalService.isConnected()) {
    this.terminalService.disconnect();
  }
}
```

### Step 5: Template の更新

接続ボタンを追加します。

```html
<choh-console-tool-bar (eventWiFiSetting)="openWifiSettingDialog()" (eventCreateFile)="createFile()" (eventGetExample)="openExampleFrameDialog()" (eventSetupChirimen)="openSetupChirimenDialog()" (eventI2CDetect)="openI2CDetectDialog()" (eventFileUpload)="openFileUploadDialog()" (eventConnect)="onConnectSerial()" (eventDisconnect)="onDisconnectSerial()" />
<div id="consoleDom" class="mt-2"></div>
```

---

## 完全なリファクタリング後のコード

```typescript:apps/dashboard/src/app/pages/console/console.component.ts (リファクタ後)
import { Dialog } from '@angular/cdk/dialog';
import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Terminal } from '@xterm/xterm';
import { ConsoleToolBarComponent } from '../../components';
import { xtermConsoleConfigOptions } from '../../shared/models';
import { DialogService, SerialNotificationService, TerminalService } from '../../shared/service';

@Component({
  selector: 'choh-console',
  imports: [ConsoleToolBarComponent, MatDividerModule],
  template: `
    <choh-console-tool-bar
      (eventWiFiSetting)="openWifiSettingDialog()"
      (eventCreateFile)="createFile()"
      (eventGetExample)="openExampleFrameDialog()"
      (eventSetupChirimen)="openSetupChirimenDialog()"
      (eventI2CDetect)="openI2CDetectDialog()"
      (eventFileUpload)="openFileUploadDialog()"
      (eventConnect)="onConnectSerial()"
      (eventDisconnect)="onDisconnectSerial()"
    />
    <div id="consoleDom" class="mt-2"></div>
  `,
})
export default class ConsoleComponent implements AfterViewInit, OnDestroy {
  private store = inject(Store);
  private terminalService = inject(TerminalService);
  private dialogService = inject(DialogService);
  private serialNotification = inject(SerialNotificationService);
  private dialog = inject(Dialog);

  xterminal = new Terminal(xtermConsoleConfigOptions);
  consoleDom: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.initializeTerminal();
  }

  ngOnDestroy(): void {
    if (this.terminalService.isConnected()) {
      this.terminalService.disconnect();
    }
  }

  private initializeTerminal(): void {
    this.consoleDom = document.getElementById('consoleDom');
    if (!this.consoleDom) {
      console.error('Console DOM element not found');
      return;
    }

    this.xterminal.open(this.consoleDom);
    this.xterminal.reset();
    this.xterminal.writeln('CHIRIMEN Dashboard\r\n');
    this.xterminal.writeln('$ ');

    this.terminalService.initialize(this.xterminal);

    this.xterminal.onKey((e) =>
      this.terminalService.handleKeyInput(this.xterminal, e)
    );
  }

  async onConnectSerial(): Promise<void> {
    const result = await this.terminalService.connectToSerial();

    if (result.success) {
      this.serialNotification.notifyConnectionSuccess();
    } else {
      this.serialNotification.notifyConnectionError(result.message);
    }
  }

  async onDisconnectSerial(): Promise<void> {
    await this.terminalService.disconnect();
    this.xterminal.writeln('\r\nDisconnected from serial port\r\n$ ');
  }

  openWifiSettingDialog() {
    this.dialogService.openWifiSettingDialog();
  }

  createFile() {}

  openExampleFrameDialog() {
    this.dialogService.openExampleFrameDialog();
  }

  openSetupChirimenDialog() {
    this.dialogService.openSetupChirimenDialog();
  }

  openI2CDetectDialog() {
    this.dialogService.openI2CDetectDialog();
  }

  openFileUploadDialog() {
    this.dialogService.openFileUploadDialog();
  }
}
```

---

## 移行のメリット

### 1. コードの簡潔化

- Serial 通信のロジックが TerminalService に集約
- Component は UI 処理のみに集中

### 2. 自動的なデータフロー

- Serial からのデータが自動的に Terminal に表示
- キー入力が Serial に自動送信（将来実装）

### 3. テスト性の向上

- TerminalService をモック化してテスト可能
- Component のテストが容易

### 4. 保守性の向上

- Serial 通信のロジック変更が Component に影響しない
- 単一責任の原則に準拠

---

## 注意事項

### 1. 既存の動作確認

- 移行前に既存の動作を十分にテスト
- 接続、切断、データ送受信が正常に動作することを確認

### 2. 段階的な移行

- 一度に全てを変更せず、段階的に移行
- 各ステップで動作確認を実施

### 3. ToolBar Component の更新

- `ConsoleToolBarComponent` に接続/切断イベントを追加
- 接続状態に応じたボタンの表示切り替えを実装

---

## 次のステップ

1. **ToolBar Component の更新**

   - 接続/切断ボタンの追加
   - 接続状態の表示

2. **コマンド実行機能の追加**

   - Enter キー押下時のコマンド送信
   - コマンド履歴機能

3. **Store との統合**

   - Terminal の状態を Store に保存
   - 複数タブでの状態共有

4. **古いコードの削除**
   - WebSerialService の削除
   - XtermService の削除（TerminalService に統合済み）

---

## サポート

質問や問題がある場合は、以下を参照してください:

- [リファクタリング完了レポート](./REFACTORING_SUMMARY.md)
- [分析レポート](./ANALYSIS_REPORT.md)

---

## 結論

Phase 3-2 の実施により、ConsoleComponent は**単一責任の原則**に準拠し、**保守性・テスト性が大幅に向上**します。
段階的な移行により、**リスクを最小限に抑えながら**リファクタリングを進めることができます。
