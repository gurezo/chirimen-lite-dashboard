# 不要コード調査レポート

## 調査日

2025-10-13

## 目的

リファクタリング後に不要になったコードを特定し、安全に削除する。

---

## 調査結果

### 1. 古い Web Serial 実装（`web-serial/service/`）

#### ファイル一覧

- ✅ `web-serial.service.ts` - 古いメインサービス
- ✅ `web-serial.reader.ts` - 古い Reader クラス
- ✅ `web-serial.writer.ts` - 古い Writer クラス
- ✅ `web-serial.service.spec.ts` - テストファイル
- ✅ `index.ts` - export ファイル

#### 現在の使用箇所

**WebSerialService が使用されている：**

1. `shared/web-serial/store/web-serial.effects.ts` (line 6, 17)

   ```typescript
   import { WebSerialService } from "../service/web-serial.service";
   service = inject(WebSerialService);
   ```

2. `pages/console/console.component.ts` (line 10, 26, 30)
   ```typescript
   import { WebSerialService } from "../../shared/web-serial";
   providers: [WebSerialService], (service = inject(WebSerialService));
   ```

**WebSerialReader が使用されている：**

- `web-serial.service.ts` 内でのみ使用

**WebSerialWriter が使用されている：**

- `web-serial.service.ts` 内でのみ使用

#### 置き換え先

- `shared/service/serial/serial-connection.service.ts`
- `shared/service/serial/serial-reader.service.ts`
- `shared/service/serial/serial-writer.service.ts`
- `shared/service/serial/serial-validator.service.ts`
- `shared/service/terminal/terminal.service.ts`

---

### 2. 古い XTerm サービス（`service/xterm/`）

#### ファイル一覧

- ✅ `xterm.service.ts` - キー入力処理のみ
- ✅ `xterm.service.spec.ts` - テストファイル

#### 現在の使用箇所

**XtermService が使用されている：**

1. `pages/console/console.component.ts` (line 8, 31)

   ```typescript
   import { XtermService } from "../../shared/service";
   xtermService = inject(XtermService);
   ```

   - `configTerminal()` メソッド内で `onKey()` を呼び出し

2. `shared/service/index.ts` (line 10)
   ```typescript
   export * from "./xterm/xterm.service";
   ```

#### 置き換え先

- `shared/service/terminal/terminal.service.ts`
  - `handleKeyInput()` メソッドが同等機能を提供

---

### 3. Deprecated な ToastMessageService

#### ファイル一覧

- ⚠️ `toast-message.service.ts` - deprecated 化済み
- ⚠️ `toast-message.service.spec.ts` - テストファイル

#### 現在の使用箇所

- テストファイル内でのみ参照
- 実際のアプリケーションコードでは使用されていない

#### ステータス

- ✅ 既に deprecated 化済み
- ⚠️ 後方互換性のため残す選択も可能
- ✅ 完全に SerialNotificationService に置き換え済み

---

## 削除戦略

### Phase A: Effects の更新（必須）

**対象**: `web-serial/store/web-serial.effects.ts`

**現在の実装:**

```typescript
import { WebSerialService } from "../service/web-serial.service";
service = inject(WebSerialService);
```

**新しい実装:**

```typescript
import {
  SerialConnectionService,
  SerialValidatorService,
  SerialErrorHandlerService
} from '../../service/serial';

private connection = inject(SerialConnectionService);
private validator = inject(SerialValidatorService);
private errorHandler = inject(SerialErrorHandlerService);
```

**変更が必要な箇所:**

- `connect$` Effect の実装を新しいサービスを使うように書き換え
- `disConnect$` Effect の実装を書き換え
- `send()` と `read()` メソッドの呼び出しを削除（または適切に置き換え）

---

### Phase B: ConsoleComponent の更新（Phase 3-2）

**対象**: `pages/console/console.component.ts`

**現在の実装:**

```typescript
import { WebSerialService } from "../../shared/web-serial";
import { XtermService } from "../../shared/service";

service = inject(WebSerialService);
xtermService = inject(XtermService);
```

**新しい実装:**

```typescript
import { TerminalService } from '../../shared/service';

private terminalService = inject(TerminalService);
```

**変更が必要な箇所:**

- `configTerminal()` メソッドを書き換え
- Terminal 初期化を TerminalService に委譲
- Serial 接続処理を追加

---

### Phase C: 古いファイルの削除

#### 削除対象ファイル（Phase A, B 完了後）

1. **Web Serial 古い実装**

   - `apps/dashboard/src/app/shared/web-serial/service/web-serial.service.ts`
   - `apps/dashboard/src/app/shared/web-serial/service/web-serial.service.spec.ts`
   - `apps/dashboard/src/app/shared/web-serial/service/web-serial.reader.ts`
   - `apps/dashboard/src/app/shared/web-serial/service/web-serial.writer.ts`
   - `apps/dashboard/src/app/shared/web-serial/service/index.ts`

2. **XTerm 古い実装**

   - `apps/dashboard/src/app/shared/service/xterm/xterm.service.ts`
   - `apps/dashboard/src/app/shared/service/xterm/xterm.service.spec.ts`

3. **ToastMessageService（オプション）**
   - `apps/dashboard/src/app/shared/service/toast-message/toast-message.service.ts`
   - `apps/dashboard/src/app/shared/service/toast-message/toast-message.service.spec.ts`

---

## 実施順序

### ステップ 1: Effects の更新

1. `web-serial.effects.ts` を新しいサービスを使うように書き換え
2. ビルドテスト
3. 動作確認

### ステップ 2: ConsoleComponent の更新

1. `console.component.ts` を TerminalService を使うように書き換え
2. ビルドテスト
3. 動作確認

### ステップ 3: 古いファイルの削除

1. `web-serial/service/` 配下のファイルを削除
2. `service/xterm/` 配下のファイルを削除
3. `service/index.ts` から xterm の export を削除
4. ビルドテスト
5. 最終動作確認

### ステップ 4: ToastMessageService の削除（オプション）

1. deprecated な ToastMessageService を削除
2. `service/index.ts` から export を削除
3. ビルドテスト

---

## リスク評価

### 高リスク

- **Effects の書き換え**: Store の状態管理に直接影響
  - 十分なテストが必要
  - ロールバック手順を準備

### 中リスク

- **ConsoleComponent の書き換え**: UI の動作に影響
  - ユーザー体験に直接関わる
  - 段階的な移行を推奨

### 低リスク

- **古いファイルの削除**: 使用されていないことを確認済み
  - ビルドエラーが出れば即座に検知可能

---

## 推奨アクション

### 即座に実施可能

❌ **なし** - すべての古いコードがまだ使用中

### 段階的に実施

1. ✅ **Phase A**: Effects を新しいサービスで書き換え
2. ✅ **Phase B**: ConsoleComponent を TerminalService で書き換え
3. ✅ **Phase C**: 古いファイルを削除

### 保留

- ToastMessageService の削除は後方互換性のため保留可能

---

## 次のステップ

Phase A と Phase B を実施してから、古いファイルを削除することを推奨します。
現時点では、すべての古いコードがまだアクティブに使用されているため、**即座に削除できるファイルはありません**。

ただし、以下のアプローチで進めることが可能です：

### オプション 1: 段階的な置き換え（推奨）

1. Effects を更新
2. ConsoleComponent を更新
3. 古いファイルを削除

### オプション 2: 新旧並行運用

- 新しいサービスと古いサービスを並行稼働
- 徐々に移行
- 動作確認後に古いコードを削除

---

**結論**: 現時点では、古いコードはまだアクティブに使用されているため、削除前に Phase A と Phase B の実装が必要です。
