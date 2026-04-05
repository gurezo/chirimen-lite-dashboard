import { Injectable } from '@angular/core';
import { createConnectClient } from '@libs-connect-util';
import { sanitizeSerialStdout } from '@libs-terminal-util';
import {
  PI_ZERO_LOGIN_PASSWORD,
  PI_ZERO_LOGIN_USER,
  PI_ZERO_SERIAL_LOGIN_LINE_PATTERN,
  PI_ZERO_SERIAL_PASSWORD_LINE_PATTERN,
  PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
  SERIAL_TIMEOUT,
} from '@libs-web-serial-util';
import { PiZeroShellReadinessService } from './pi-zero-shell-readiness.service';
import { SerialFacadeService } from './serial-facade.service';

export type PiZeroBootstrapStatusHandler = (line: string) => void;

@Injectable({
  providedIn: 'root',
})
export class PiZeroSerialBootstrapService {
  private lastBootstrappedEpoch = -1;

  constructor(
    private readonly serial: SerialFacadeService,
    private readonly shellReadiness: PiZeroShellReadinessService,
  ) {}

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
        this.shellReadiness.setReady(true);
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
      await this.serial.readUntilPrompt({
        prompt: PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
        timeout: SERIAL_TIMEOUT.SHORT,
      });
      atShell = true;
    } catch {
      atShell = false;
    }

    if (!atShell) {
      log('[コンソール] ログイン画面を検出しました。');
      await this.serial.readUntilPrompt({
        prompt: PI_ZERO_SERIAL_LOGIN_LINE_PATTERN,
        timeout: SERIAL_TIMEOUT.FILE_TRANSFER,
      });
      log(
        `[コンソール] ログインユーザー「${PI_ZERO_LOGIN_USER}」を送信中...`,
      );
      await this.serial.exec(PI_ZERO_LOGIN_USER, {
        prompt: PI_ZERO_SERIAL_PASSWORD_LINE_PATTERN,
        timeout: SERIAL_TIMEOUT.LONG,
      });
      log('[コンソール] パスワードを送信中（画面には表示しません）...');
      await this.serial.exec(PI_ZERO_LOGIN_PASSWORD, {
        prompt: PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
        timeout: SERIAL_TIMEOUT.LONG,
      });
      log('[コンソール] ログインが完了しました。');
    }

    log('[コンソール] タイムゾーン関連の初期化を開始します。');
    for (const step of client.timezoneSteps) {
      log(step.statusMessage);
      try {
        const { stdout } = await this.serial.exec(step.command, {
          prompt: PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
          timeout: SERIAL_TIMEOUT.DEFAULT,
        });
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
