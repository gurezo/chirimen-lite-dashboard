直近に作成したプランを確認します。会話の履歴から、最新のプラン内容を表示します。

## Serial/WiFi ライブラリ分離リファクタリングプラン

### Phase 1: Web Serial ライブラリ分離 (@libs-web-serial) ✅ 完了

**目的**: Serial 関連の機能を独立したライブラリに分離

**実施内容**:

1. ✅ Nx ライブラリ `@libs-web-serial` を生成
2. ✅ Serial サービス群（7 ファイル + specs）を `libs/web-serial/src/lib/services/` に移行
3. ✅ NgRx Store（actions, effects, reducers, selectors, models）を `libs/web-serial/src/lib/store/` に移行
4. ✅ WebSerialService を `libs/web-serial/src/lib/services/` に移行
5. ✅ モデルと定数を `libs/web-serial/src/lib/` に移行
6. ✅ `libs/web-serial/src/index.ts` で公開 API を定義し、`tsconfig.base.json` にパスマッピング追加
7. ✅ `apps/dashboard` の import パスを `@libs-web-serial` に更新（app.config.ts, layout.component.ts, console.component.ts）
8. ✅ Phase 1 完了確認: ビルド・テスト実行、ブランチコミット

**追加修正**:

- ✅ Phase 1 後の SRP 問題修正: SerialResourceManager 削除、元のシンプルな実装に戻す
- ✅ SerialReaderService.startReading()を非同期実装に戻し、分割前の動作を復元
- ✅ @deprecated WebSerialService を削除し、SerialFacadeService に統一
- ✅ デバイス検証の修正: SerialFacadeService に isSupportedDevice()の呼び出しを追加
- ✅ WebSerialEffects の connect$でエラーメッセージを適切に設定
- ✅ libs/chirimen-panel の不要な差分を除去

**ブランチ**: `refactor/split/web-serial`

---

### Phase 2: WiFi ライブラリ分離 (@libs-wifi) ⏳ 未着手

**目的**: WiFi 関連の機能を独立したライブラリに分離

**実施内容**:

1. Nx ライブラリ `@libs-wifi` を生成（Phase 2 ブランチ作成）
2. WiFiService を `libs/wifi/src/lib/services/` に移行
3. WiFi コンポーネント（WifiComponent, WifiInfoComponent）を `libs/wifi/src/lib/components/` に移行
4. モデル、パーサー関数、ユーティリティを `libs/wifi/src/lib/` に移行
5. `libs/wifi/src/index.ts` で公開 API を定義し、`tsconfig.base.json` にパスマッピング追加
6. `apps/dashboard` の import パスを `@libs-wifi` に更新
7. Phase 2 完了確認: ビルド・テスト実行、ブランチコミット

**依存関係**: `@libs-wifi` は `@libs-web-serial` に依存（`SerialFacadeService` を使用）

**ブランチ**: `refactor/split/wifi`

---

### Phase 3: クリーンアップと最終検証 ⏳ 未着手

**目的**: 移行済みコードの削除と最終確認

**実施内容**:

1. `apps/dashboard` から移行済みのコードを削除（Phase 3 ブランチ作成）
2. `apps/dashboard` の index.ts から不要な export を削除
3. 最終確認: 全ライブラリ・アプリのビルド・テスト実行、ブランチコミット

**ブランチ**: `refactor/re-connect`

---

### 現在の状況

- ✅ **Phase 1 完了**: Web Serial ライブラリ分離完了
- ⏳ **Phase 2**: WiFi ライブラリ分離（次のステップ）
- ⏳ **Phase 3**: クリーンアップと最終検証

### 次のステップ

Phase 2 に進む準備が整っています。`refactor/split/wifi` ブランチを作成し、WiFi 機能の分離を開始できます。
