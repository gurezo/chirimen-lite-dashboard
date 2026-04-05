/**
 * シリアル exec / readUntilPrompt で使うタイムアウト（ミリ秒）の推奨値
 */
export const SERIAL_TIMEOUT = {
  /** 1s — 短い行待ち */
  LINE: 1_000,
  /** 5s — ブートストラップ・短いプローブ */
  SHORT: 5_000,
  /** 8s — 再起動（プロンプトが返らない場合がある） */
  REBOOT: 8_000,
  /** 10s — 通常のシェルコマンド */
  DEFAULT: 10_000,
  /** 30s — ファイル読み取り・やや長い処理 */
  LONG: 30_000,
  /** 60s — セットアップ・大きめの転送 */
  FILE_TRANSFER: 60_000,
  /** 120s — forever 等の長時間プロセス */
  PROCESS_CONTROL: 120_000,
  /** 300s — Node.js / chirimen 大規模インストール */
  NODE_INSTALL: 300_000,
} as const;
