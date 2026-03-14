# wifi

WiFi 設定まわりのライブラリ（Issue [#350](https://github.com/gurezo/chirimen-lite-console/issues/350) により feature / ui / data-access / util に分割）。

## 構成

- **libs/wifi/feature** – `WifiPageComponent`（WiFi 設定画面）
- **libs/wifi/ui** – `WifiListComponent`, `WifiFormComponent`, `WifiStatusComponent`, `WifiInfoComponent`
- **libs/wifi/data-access** – `WifiScanService`, `WifiConfigService`, `WifiRebootFlowService`, `FileContentService`
- **libs/wifi/util** – モデル・パーサ・ファイルユーティリティ（`WiFiInfo`, `parseWifiIwlistOutput` 等, `FileUtils`）

`@libs-wifi` は上記 4 本の再エクスポート用バレル。

## ビルド・リント

```bash
pnpm nx run libs-wifi-util:build
pnpm nx run libs-wifi-data-access:build
pnpm nx run libs-wifi-ui:build
pnpm nx run libs-wifi-feature:build
pnpm nx run libs-wifi:lint
```
