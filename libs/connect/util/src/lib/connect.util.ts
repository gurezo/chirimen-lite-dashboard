import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

export function ensureSerialSupport(): boolean {
  // TODO: Web Serial API のサポート確認ロジックを実装する。
  return 'serial' in navigator;
}

export interface ConnectClient {
  /**
   * 期待するシェルプロンプト（Raspberry Pi Zero 前提）
   * prompt 待機や結果判定のために利用します。
   */
  prompt: string;
  /**
   * 初期化（TZ 設定など）で実行するコマンド列
   */
  timezoneCommands: string[];
}

export function createConnectClient(): ConnectClient {
  return {
    prompt: PI_ZERO_PROMPT,
    timezoneCommands: ['sudo timedatectl set-timezone Asia/Tokyo'],
  };
}

