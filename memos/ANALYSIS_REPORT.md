# apps/dashboard コード分析レポート

## 現状の構造

### 1. `apps/dashboard/src/app/shared/service/` (自分で開発したコード)

- **dialog/** - ダイアログ管理サービス
- **example/** - サンプルコード取得サービス (HTTP 通信)
- **icon/** - Material Icon 登録サービス
- **toast-message/** - トースト通知サービス
- **xterm/** - XTerm キー入力処理サービス

### 2. `apps/dashboard/src/app/shared/web-serial/` (流用・変換したコード)

- **service/**
  - `web-serial.service.ts` - メインサービス (接続、読み書き、切断)
  - `web-serial.reader.ts` - シリアルポート読み取りクラス
  - `web-serial.writer.ts` - シリアルポート書き込みクラス
- **store/** - NgRx ストア (actions, effects, reducers, selectors)

### 3. `apps/dashboard/src/app/shared/xterm/`

- **store/** - NgRx ストア (actions, effects, reducers, selectors)

---

## 単一責任の原則 (SRP) 違反の検出

### ❌ **WebSerialService** (`web-serial/service/web-serial.service.ts`)

**現在の責任:**

1. SerialPort 接続管理 (`connect()`, `disConnect()`)
2. Raspberry Pi Zero 検証 (`isRaspberryPiZero()` の呼び出し)
3. Reader/Writer インスタンス管理
4. エラーハンドリングとメッセージ変換 (`connectError()`)
5. データ読み書きの委譲 (`read()`, `send()`)

**問題点:**

- 接続、検証、インスタンス管理、エラー処理を 1 つのサービスで担当
- エラーメッセージ定数 (WEB_SERIAL.PORT.ERROR) への強い依存
- Reader/Writer を生成するが、それらのライフサイクル管理も行う

**改善案:**

- **SerialConnectionService** - 接続/切断のみ
- **SerialPortValidator** - Pi Zero 検証のみ
- **SerialErrorHandler** - エラー変換のみ
- **SerialReaderService** / **SerialWriterService** - 各自のライフサイクル管理を含む

---

### ⚠️ **ToastMessageService** (`service/toast-message/toast-message.service.ts`)

**現在の責任:**

1. 汎用トースト通知 (`success()`, `error()`)
2. Web Serial 専用メッセージ生成 (`webSerailSuccess()`, `webSerailError()`, `createErrorMessages()`)

**問題点:**

- Web Serial に強く依存したメソッドが混在
- 他のドメイン (例: WiFi, I2C) でも同様のパターンが必要になると肥大化する

**改善案:**

- **NotificationService** - 汎用メソッドのみ (`success()`, `error()`)
- **SerialNotificationService** - Web Serial 専用通知
- **WiFiNotificationService** - WiFi 専用通知 (将来)

---

### ⚠️ **WebSerialEffects** (`web-serial/store/web-serial.effects.ts`)

**現在の責任:**

1. WebSerialService の呼び出し
2. ToastMessageService の呼び出し (副作用)
3. NgRx アクションのディスパッチ

**問題点:**

- Effects 内で UI 通知 (ToastMessageService) を直接呼んでいる
- 本来は状態更新のみを行い、通知は別のレイヤーで処理すべき

**改善案:**

- Effects は状態更新のみ
- 通知は Component 側で Selector を監視して実行

---

### ✅ **XtermService** (`service/xterm/xterm.service.ts`)

**現在の責任:**

1. XTerm のキー入力処理のみ (`onKey()`)

**評価:**

- 単一責任を守っている
- ただし、web-serial との統合が不十分

---

### ❌ **WebSerialReader** / **WebSerialWriter** (各クラス)

**現在の責任:**

- Reader: ストリーム読み取りとエラーハンドリング
- Writer: ストリーム書き込みとエラーハンドリング

**問題点:**

- ライフサイクル管理 (start/stop, write) が呼び出し側 (WebSerialService) に依存
- エラーを `console.error` で直接出力 (本来は呼び出し側に伝えるべき)

**改善案:**

- エラーを throw または Observable で返す
- ライフサイクル管理を各クラス内で完結

---

## ディレクトリ構造の問題

### 1. **名前の不統一**

- `service/` (自分のコード) vs `services/` (存在しない?)
- `store/` (web-serial, xterm) vs `stores/` (提案)

### 2. **存在しないパスへの参照**

- `apps/dashboard/src/app/wifi/wifi-setting/services/index.ts` 内:
  ```typescript
  export * from "../../wifi-setting-containers/services/web-serial.service";
  ```
  → `wifi-setting-containers` ディレクトリが存在しない (ビルドエラーの原因)

### 3. **web-serial と xterm の分離**

- 両方とも Console で使用されているが、統合されていない
- `ConsoleComponent` で両方を直接 inject している
- 本来は「ターミナル通信サービス」として統合すべき

---

## 統合提案

### 提案 1: ディレクトリ構造の統一

```
apps/dashboard/src/app/shared/
├── constants/
├── functions/
├── guards/
├── models/
├── services/              # 単数形に統一
│   ├── core/              # 汎用サービス
│   │   ├── dialog/
│   │   ├── notification/  # toast-message から改名
│   │   └── icon/
│   ├── serial/            # web-serial から移動・統合
│   │   ├── serial-connection.service.ts
│   │   ├── serial-reader.service.ts
│   │   ├── serial-writer.service.ts
│   │   ├── serial-validator.service.ts
│   │   ├── serial-error-handler.service.ts
│   │   └── index.ts
│   ├── terminal/          # xterm と serial の統合
│   │   ├── terminal.service.ts
│   │   ├── terminal-io.service.ts
│   │   └── index.ts
│   └── example/
└── stores/               # store から改名 (複数形に統一)
    ├── serial/           # web-serial store
    │   ├── serial.actions.ts
    │   ├── serial.effects.ts
    │   ├── serial.reducers.ts
    │   ├── serial.selectors.ts
    │   ├── serial.models.ts
    │   └── index.ts
    └── terminal/         # xterm store
        ├── terminal.actions.ts
        ├── terminal.effects.ts
        ├── terminal.reducers.ts
        ├── terminal.selectors.ts
        ├── terminal.models.ts
        └── index.ts
```

### 提案 2: サービスの責任分割

#### **SerialConnectionService**

- `connect()` - ポート接続
- `disconnect()` - ポート切断
- `isConnected` プロパティ

#### **SerialValidatorService**

- `validateRaspberryPiZero(port)` - Pi Zero 検証

#### **SerialErrorHandlerService**

- `handleConnectionError(error)` - エラーメッセージ変換

#### **SerialReaderService**

- `startReading(port)` - 読み取り開始
- `stopReading()` - 読み取り停止
- `data$` Observable - 読み取りデータストリーム

#### **SerialWriterService**

- `write(data)` - データ書き込み
- `isReady` プロパティ

#### **TerminalService** (新規: xterm + serial 統合)

- `initialize(element)` - Terminal 初期化
- `connectToSerial(port)` - Serial と Terminal を接続
- `disconnect()` - 接続解除
- `onInput` - ユーザー入力を Serial に送信
- `onOutput` - Serial からのデータを Terminal に表示

#### **NotificationService** (toast-message リファクタ)

- `success(title, message)`
- `error(title, message)`
- `info(title, message)`
- `warning(title, message)`

#### **SerialNotificationService** (新規)

- `notifyConnectionSuccess()`
- `notifyConnectionError(errorType)`
- `notifyReadError(error)`
- `notifyWriteError(error)`

---

### 提案 3: NgRx Store の改善

#### **Effects の責任を明確化**

- Effects 内で UI 通知を行わない
- 成功/失敗の状態を Store に保存
- Component で状態を監視して通知

#### **Store の統合**

- `serial` と `terminal` を統合し、`serialTerminal` Feature にする
- または、各自独立させるが、Effects で相互連携

---

## 実装優先順位

### Phase 1: 基盤整備 (高優先度)

1. ✅ 存在しないパスの削除 (`wifi-setting-containers` 参照)
2. ✅ `NotificationService` のリファクタ (汎用化)
3. ✅ `SerialErrorHandlerService` の分離

### Phase 2: Serial サービスの分割 (中優先度)

4. ✅ `SerialConnectionService` の作成
5. ✅ `SerialReaderService` / `SerialWriterService` の改善
6. ✅ `SerialValidatorService` の分離

### Phase 3: Terminal 統合 (中優先度)

7. ✅ `TerminalService` の作成 (xterm + serial 統合)
8. ✅ `ConsoleComponent` のリファクタ

### Phase 4: Store の改善 (低優先度)

9. ✅ Effects から UI 通知を削除
10. ✅ Component での状態監視と通知実装

---

## テスト戦略

### 単体テスト

- 各サービスを独立してテスト可能にする
- モック化しやすい設計 (DI の活用)

### 統合テスト

- TerminalService + SerialServices の統合テスト
- Store Effects のテスト

---

## まとめ

### 現状の問題点

1. **WebSerialService** が多すぎる責任を持つ
2. **ToastMessageService** が Web Serial に依存
3. **WebSerialEffects** が UI 通知を直接実行
4. **web-serial** と **xterm** が分離されすぎ
5. 存在しないパスへの参照

### 改善後のメリット

1. 各サービスが単一責任を持つ
2. テストしやすい構造
3. 再利用性の向上
4. エラーハンドリングの一元化
5. 保守性の向上

---

## 次のアクション

上記の提案に基づき、以下を実施しますか？

1. **即座に修正すべき問題** (存在しないパス参照) を修正
2. **Phase 1** のリファクタリングを実施
3. **Phase 2, 3** の実装計画を詳細化

どの Phase から始めるか指示してください。
