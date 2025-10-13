# Web-Serial 処理統合 リファクタリング完了レポート

## 実施日

2025-10-13

## 目的

- `apps/dashboard/src/app/shared/service` と `apps/dashboard/src/app/shared/web-serial` のコードを統合
- 単一責任の原則（SRP）に従った設計への改善
- コードの保守性・テスト性の向上

---

## 実施した作業

### Phase 1: 基盤整備

#### ✅ Phase 1-1: 存在しないパス参照を修正

- **ファイル**: `apps/dashboard/src/app/wifi/wifi-setting/services/index.ts`
- **内容**: `wifi-setting-containers` への存在しないパス参照をコメントアウト
- **理由**: ビルドエラーの原因を除去

#### ✅ Phase 1-2: NotificationService のリファクタ

- **作成したファイル**:
  - `shared/service/notification/notification.service.ts`
  - `shared/service/notification/notification.service.spec.ts`
  - `shared/service/notification/serial-notification.service.ts`
  - `shared/service/notification/serial-notification.service.spec.ts`
- **変更したファイル**:
  - `shared/service/toast-message/toast-message.service.ts` (deprecated 化)
  - `shared/web-serial/store/web-serial.effects.ts` (SerialNotificationService を使用)
- **内容**:
  - 汎用的な `NotificationService` を作成（全ドメインで使用可能）
  - Web Serial 専用の `SerialNotificationService` を分離
  - `ToastMessageService` を deprecated にし、後方互換性を維持

#### ✅ Phase 1-3: SerialErrorHandlerService の分離

- **作成したファイル**:
  - `shared/service/serial/serial-error-handler.service.ts`
  - `shared/service/serial/serial-error-handler.service.spec.ts`
- **内容**:
  - Serial 接続エラーのハンドリングを独立したサービスに分離
  - DOMException の解析とエラーメッセージ変換を担当
  - 読み取り/書き込みエラーの処理も統合

---

### Phase 2: Serial サービスの分割

#### ✅ Phase 2-1: SerialConnectionService の作成

- **作成したファイル**:
  - `shared/service/serial/serial-connection.service.ts`
  - `shared/service/serial/serial-connection.service.spec.ts`
- **内容**:
  - SerialPort の接続・切断のみを担当
  - 接続状態の管理（`isConnected()`, `getPort()`）
  - エラーハンドリングは SerialErrorHandlerService に委譲

#### ✅ Phase 2-2: SerialReaderService / SerialWriterService の改善

- **作成したファイル**:
  - `shared/service/serial/serial-reader.service.ts`
  - `shared/service/serial/serial-reader.service.spec.ts`
  - `shared/service/serial/serial-writer.service.ts`
  - `shared/service/serial/serial-writer.service.spec.ts`
- **内容**:
  - 既存の `WebSerialReader` / `WebSerialWriter` を Service として再実装
  - RxJS Observable を使ったデータストリーム管理
  - ライフサイクル管理の改善（初期化、読み取り開始/停止、クリーンアップ）
  - エラー処理の強化

#### ✅ Phase 2-3: SerialValidatorService の分離

- **作成したファイル**:
  - `shared/service/serial/serial-validator.service.ts`
  - `shared/service/serial/serial-validator.service.spec.ts`
- **内容**:
  - Raspberry Pi Zero の検証ロジックを独立したサービスに分離
  - デバイス情報の取得機能
  - 将来的な拡張性（他のデバイスサポート）を考慮

---

### Phase 3: Terminal 統合

#### ✅ Phase 3-1: TerminalService の作成

- **作成したファイル**:
  - `shared/service/terminal/terminal.service.ts`
  - `shared/service/terminal/terminal.service.spec.ts`
  - `shared/service/terminal/index.ts`
- **内容**:
  - XTerm と Web Serial API を統合
  - Serial からのデータを Terminal に自動表示
  - ユーザー入力を Serial に送信
  - キー入力処理の統合
  - 接続・切断の一元管理

#### ⏸️ Phase 3-2: ConsoleComponent のリファクタ

- **状態**: 保留
- **理由**: 大幅な変更が必要なため、段階的な移行を推奨
- **推奨アプローチ**:
  1. 既存の WebSerialService を残したまま TerminalService を併用
  2. 動作確認後、段階的に移行
  3. 最終的に WebSerialService を削除

---

### Phase 4: Store の改善

#### ✅ Phase 4-1: WebSerialEffects から UI 通知を削除

- **変更したファイル**:
  - `shared/web-serial/store/web-serial.actions.ts`
  - `shared/web-serial/store/web-serial.effects.ts`
  - `shared/web-serial/store/web-serial.reducers.ts`
  - `shared/web-serial/store/web.serrial.model.ts`
  - `shared/web-serial/store/web-serial.selectors.ts`
- **内容**:
  - Effects から SerialNotificationService の呼び出しを削除
  - 接続成功/失敗メッセージを State に保存
  - Selector を追加（`selectConnectionMessage`, `selectErrorMessage`）
  - Effects は状態更新のみを担当

#### ✅ Phase 4-2: Component での状態監視と通知実装

- **変更したファイル**:
  - `layout/layout-main/layout-main.component.ts`
- **内容**:
  - Store の状態を監視（`selectConnectionMessage`, `selectErrorMessage`）
  - 状態変化時に SerialNotificationService を使って通知
  - OnDestroy でサブスクリプションをクリーンアップ

---

## 作成したサービス一覧

### 汎用サービス

- **NotificationService**: 全ドメインで使用可能な汎用通知サービス

### Serial 関連サービス

- **SerialConnectionService**: 接続・切断管理
- **SerialReaderService**: データ読み取り（Observable ベース）
- **SerialWriterService**: データ書き込み
- **SerialValidatorService**: デバイス検証（Raspberry Pi Zero）
- **SerialErrorHandlerService**: エラーハンドリング
- **SerialNotificationService**: Web Serial 専用通知

### Terminal 関連サービス

- **TerminalService**: XTerm + Web Serial 統合管理

---

## ディレクトリ構造（改善後）

```
apps/dashboard/src/app/shared/
├── constants/
├── functions/
├── guards/
├── models/
├── service/
│   ├── dialog/
│   ├── example/
│   ├── icon/
│   ├── notification/              # 新規
│   │   ├── notification.service.ts
│   │   └── serial-notification.service.ts
│   ├── serial/                    # 新規
│   │   ├── serial-connection.service.ts
│   │   ├── serial-error-handler.service.ts
│   │   ├── serial-reader.service.ts
│   │   ├── serial-validator.service.ts
│   │   └── serial-writer.service.ts
│   ├── terminal/                  # 新規
│   │   └── terminal.service.ts
│   ├── toast-message/             # deprecated
│   └── xterm/
├── web-serial/                    # 既存（Store のみ）
│   ├── service/                   # 古い実装（移行後削除予定）
│   └── store/                     # NgRx Store
└── xterm/
    └── store/
```

---

## 単一責任の原則（SRP）への準拠

### 改善前の問題点

| サービス            | 責任の数 | 問題                                                     |
| ------------------- | -------- | -------------------------------------------------------- |
| WebSerialService    | 5        | 接続、検証、Reader/Writer 管理、エラー処理、データ送受信 |
| ToastMessageService | 2        | 汎用通知 + Web Serial 専用通知                           |
| WebSerialEffects    | 2        | 状態更新 + UI 通知                                       |

### 改善後

| サービス                  | 責任            | SRP |
| ------------------------- | --------------- | --- |
| SerialConnectionService   | 接続・切断管理  | ✅  |
| SerialReaderService       | データ読み取り  | ✅  |
| SerialWriterService       | データ書き込み  | ✅  |
| SerialValidatorService    | デバイス検証    | ✅  |
| SerialErrorHandlerService | エラー処理      | ✅  |
| NotificationService       | 汎用通知        | ✅  |
| SerialNotificationService | Web Serial 通知 | ✅  |
| TerminalService           | Terminal 統合   | ✅  |
| WebSerialEffects          | 状態更新のみ    | ✅  |

---

## テスト性の向上

### 改善前

- WebSerialService のテストで複数の責任をモックする必要があった
- ToastMessageService のテストで Web Serial 依存が混入

### 改善後

- 各サービスが独立してテスト可能
- DI を活用した柔軟なモック化
- 責任が明確なため、テストケースの設計が容易

---

## 後方互換性

### Deprecated なサービス

- **ToastMessageService**: 既存コードとの互換性のため残す
  - メソッド内で新しいサービスを呼び出し
  - Console に警告メッセージを出力

### 移行推奨

1. `ToastMessageService.success()` → `NotificationService.success()`
2. `ToastMessageService.webSerailSuccess()` → `SerialNotificationService.notifyConnectionSuccess()`
3. `ToastMessageService.webSerailError()` → `SerialNotificationService.notifyConnectionError()`

---

## 今後の課題

### 1. ConsoleComponent のリファクタ（Phase 3-2）

- 既存の WebSerialService を TerminalService に置き換え
- 段階的な移行が必要

### 2. WebSerialService の削除

- 新しいサービス群への移行完了後、削除
- 現在は `web-serial/service/` に残存

### 3. ディレクトリ名の統一

- `service/` vs `services/` の混在を解消（完了）
- `store/` vs `stores/` の統一（検討中）

### 4. 他のドメインへの展開

- WiFi, I2C などでも同様のパターンを適用
- NotificationService をベースにした専用通知サービスの作成

---

## 動作確認方法

### 1. ビルド確認

```bash
pnpm nx build dashboard
```

### 2. テスト実行

```bash
pnpm nx test dashboard
```

### 3. 動作確認

1. アプリケーションを起動
2. Serial 接続ボタンをクリック
3. 接続成功/失敗の通知が表示されることを確認
4. Terminal への入出力が正常に動作することを確認

---

## リファレンス

- [分析レポート](./ANALYSIS_REPORT.md)
- [Angular 公式ドキュメント](https://angular.dev/)
- [NgRx 公式ドキュメント](https://ngrx.io/)
- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)

---

## 結論

✅ **Phase 1-2 完了**: 基盤整備（パス修正、通知サービス分離、エラーハンドラー分離）  
✅ **Phase 2 完了**: Serial サービスの分割（接続、読み取り、書き込み、検証、エラー処理）  
✅ **Phase 3-1 完了**: TerminalService の作成（XTerm + Serial 統合）  
⏸️ **Phase 3-2 保留**: ConsoleComponent のリファクタ（段階的移行推奨）  
✅ **Phase 4 完了**: Store の改善（Effects から UI 通知を削除、Component で状態監視）

**単一責任の原則（SRP）に準拠した設計**が実現され、**コードの保守性・テスト性が大幅に向上**しました。
