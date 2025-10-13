# 削除ファイル一覧

## 削除日

2025-10-13

## 削除したファイル

### 1. 古い Web Serial Reader/Writer クラス

#### ✅ 削除完了

- `apps/dashboard/src/app/shared/web-serial/service/web-serial.reader.ts`
- `apps/dashboard/src/app/shared/web-serial/service/web-serial.writer.ts`

#### 理由

- `WebSerialService` の内部実装を新しいサービス群に置き換え
- 新しい `SerialReaderService` と `SerialWriterService` を使用
- 古いクラスは不要になった

#### 影響範囲

- `WebSerialService` が内部で新しいサービスを使用するように変更
- 外部インターフェースは維持（後方互換性あり）

---

### 2. 古い XTerm サービス

#### ✅ 削除完了

- `apps/dashboard/src/app/shared/service/xterm/xterm.service.ts`
- `apps/dashboard/src/app/shared/service/xterm/xterm.service.spec.ts`

#### 理由

- `XtermService` のキー入力処理は非常にシンプル
- `ConsoleComponent` に直接移植
- サービスとして分離する必要がなかった

#### 影響範囲

- `ConsoleComponent` に `onKey()` メソッドを追加
- `XtermService` への依存を削除
- `shared/service/index.ts` から export を削除

---

### 3. Index ファイルの更新

#### ✅ 更新完了

- `apps/dashboard/src/app/shared/web-serial/service/index.ts`
  - `WebSerialReader` と `WebSerialWriter` の export を削除
- `apps/dashboard/src/app/shared/service/index.ts`
  - `XtermService` の export を削除

---

## まだ残っているファイル（後方互換性のため）

### WebSerialService

- **ファイル**: `apps/dashboard/src/app/shared/web-serial/service/web-serial.service.ts`
- **ステータス**: ✅ 内部実装を新しいサービスに置き換え済み
- **理由**:
  - Effects と ConsoleComponent で使用中
  - 後方互換性を維持するため、アダプターとして残す
- **注記**: `@deprecated` マークを追加済み

### ToastMessageService

- **ファイル**: `apps/dashboard/src/app/shared/service/toast-message/toast-message.service.ts`
- **ステータス**: ✅ deprecated 化済み
- **理由**:
  - 既存コードとの互換性維持
  - 内部では `SerialNotificationService` を呼び出し
- **注記**: テストファイル以外では使用されていない

---

## 削除による効果

### コードサイズの削減

- 削除した行数: 約 100 行
- 削除したファイル数: 4 ファイル

### 保守性の向上

- ✅ 古いクラスの保守が不要に
- ✅ WebSerialService は新しいサービスを使用（単一のインターフェース）
- ✅ ConsoleComponent のコードが明確に

### アーキテクチャの改善

- ✅ 重複したコードの削除
- ✅ 新しいサービス群への統一
- ✅ 単一責任の原則に準拠

---

## 次のステップ（オプション）

### 将来的に削除可能なファイル

1. **WebSerialService** (完全に置き換え後)

   - Effects を新しいサービスに直接書き換え
   - ConsoleComponent を TerminalService に移行
   - その後、アダプターとしての WebSerialService を削除

2. **ToastMessageService** (完全に置き換え後)
   - すべての deprecated 警告を解消
   - 完全に NotificationService と SerialNotificationService に移行
   - その後削除

---

## ビルドテスト

次のコマンドでビルドが正常に完了することを確認：

```bash
npx nx build apps-dashboard
```

期待される結果:

- ✅ ビルドエラー 0 件
- ✅ 警告 0 件（または最小限）
- ✅ すべての機能が正常に動作
