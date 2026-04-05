import { Injectable } from '@angular/core';
import { createConnectClient } from '@libs-connect-util';
import { sanitizeSerialStdout } from '@libs-terminal-util';
import {
  PI_ZERO_LOGIN_PASSWORD,
  PI_ZERO_LOGIN_USER,
  PI_ZERO_SERIAL_LOGIN_LINE_PATTERN,
  PI_ZERO_SERIAL_PASSWORD_LINE_PATTERN,
  PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
} from '@libs-web-serial-util';
import { SerialFacadeService } from './serial-facade.service';

export type PiZeroBootstrapStatusHandler = (line: string) => void;

@Injectable({
  providedIn: 'root',
})
export class PiZeroSerialBootstrapService {
  private lastBootstrappedEpoch = -1;

  constructor(private readonly serial: SerialFacadeService) {}

  /**
   * 接続セッションごとに1回、シェル到達（必要ならログイン）と接続直後の初期化を行う。
   */
  async runAfterConnect(onStatus?: PiZeroBootstrapStatusHandler): Promise<void> {
    if (!this.serial.isConnected()) {
      return;
    }

    const epoch = this.serial.getConnectionEpoch();
    if (epoch === this.lastBootstrappedEpoch) {
      return;
    }

    const log = onStatus ?? (() => undefined);

    try {
      await this.runPipeline(log);
      if (this.serial.isConnected()) {
        this.lastBootstrappedEpoch = epoch;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);
      log(`[コンソール] 接続後の初期化に失敗しました: ${message}`);
      throw error;
    }
  }

  private async runPipeline(log: PiZeroBootstrapStatusHandler): Promise<void> {
    const client = createConnectClient();

    let atShell = false;
    try {
      await this.serial.readUntilPrompt(
        PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
        5000,
        0,
      );
      atShell = true;
    } catch {
      atShell = false;
    }

    if (!atShell) {
      log('[コンソール] ログイン画面を検出しました。');
      await this.serial.readUntilPrompt(
        PI_ZERO_SERIAL_LOGIN_LINE_PATTERN,
        60000,
        0,
      );
      log(
        `[コンソール] ログインユーザー「${PI_ZERO_LOGIN_USER}」を送信中...`,
      );
      await this.serial.exec(
        PI_ZERO_LOGIN_USER,
        PI_ZERO_SERIAL_PASSWORD_LINE_PATTERN,
        30000,
        0,
      );
      log('[コンソール] パスワードを送信中（画面には表示しません）...');
      await this.serial.exec(
        PI_ZERO_LOGIN_PASSWORD,
        PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
        30000,
        0,
      );
      log('[コンソール] ログインが完了しました。');
    }

    log('[コンソール] タイムゾーン関連の初期化を開始します。');
    for (const step of client.timezoneSteps) {
      log(step.statusMessage);
      try {
        const { stdout } = await this.serial.exec(
          step.command,
          PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
          10000,
          0,
        );
        const cleaned = sanitizeSerialStdout(
          typeof stdout === 'string' ? stdout : '',
          step.command,
          client.prompt,
        );
        for (const line of cleaned.split(/\r?\n/)) {
          if (line.length > 0) {
            log(line);
          }
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        log(`[コンソール] コマンドが失敗しました: ${message}`);
        console.warn(`Initial command failed: ${step.command}`, error);
      }
    }
    log('[コンソール] タイムゾーン関連の初期化が完了しました。');
  }
}
