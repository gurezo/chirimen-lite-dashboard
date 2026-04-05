import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

export function ensureSerialSupport(): boolean {
  // TODO: Web Serial API のサポート確認ロジックを実装する。
  return 'serial' in navigator;
}

export interface PostConnectTimezoneStep {
  /**
   * コマンド実行直前にターミナルへ出す説明文（機微情報を含めない）
   */
  statusMessage: string;
  command: string;
}

export interface ConnectClient {
  /**
   * 期待するシェルプロンプト（Raspberry Pi Zero 前提）
   * prompt 待機や結果判定のために利用します。
   */
  prompt: string;
  /**
   * 接続直後のタイムゾーン初期化（各ステップの説明とコマンド）
   * `sudo -n` で対話的パスワード待ちを避け、失敗時も `|| true` で後続へ進める
   */
  timezoneSteps: PostConnectTimezoneStep[];
}

export function createConnectClient(): ConnectClient {
  return {
    prompt: PI_ZERO_PROMPT,
    timezoneSteps: [
      {
        statusMessage:
          '[コンソール] タイムゾーンを Asia/Tokyo に設定しています...',
        command:
          'sudo -n timedatectl set-timezone Asia/Tokyo 2>/dev/null || true',
      },
      {
        statusMessage: '[コンソール] タイムゾーンの状態を表示します。',
        command: 'timedatectl status',
      },
    ],
  };
}

