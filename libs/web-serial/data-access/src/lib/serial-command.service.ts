/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';
import { firstValueFrom, type Subscription } from 'rxjs';
import { SerialTransportService } from './serial-transport.service';

/**
 * コマンド実行設定
 */
export interface CommandExecutionConfig {
  /** 期待するプロンプト文字列 */
  prompt: string | RegExp;
  /** タイムアウト時間（ミリ秒） */
  timeout: number;
  /** タイムアウト等失敗時の再試行回数 */
  retry?: number;
}

/**
 * シリアル上でのコマンド実行結果
 *
 * Web Serial の API では exit code や stderr を分離して取得できないため、
 * 現状は stdout 相当の文字列のみを格納します。
 */
export interface CommandResult {
  stdout: string;
  stderr?: string;
  exitCode?: number;
}

/**
 * Serial コマンド実行サービス
 *
 * 読み取りバッファ・ストリーム購読・プロンプト待ち・書き込みを担当
 */
@Injectable({
  providedIn: 'root',
})
export class SerialCommandService {
  private commandSeq = 0;
  private readBuffer = '';
  private readSubscription: Subscription | null = null;
  private pendingCommands = new Map<
    string,
    {
      resolve: (value: string) => void;
      reject: (reason: unknown) => void;
      timeoutId: number;
      config: CommandExecutionConfig;
    }
  >();

  constructor(private readonly transport: SerialTransportService) {}

  private nextCommandId(): string {
    return `cmd-${++this.commandSeq}-${Date.now()}`;
  }

  private matchesPrompt(input: string, prompt: string | RegExp): boolean {
    if (typeof prompt === 'string') {
      return input.includes(prompt);
    }
    prompt.lastIndex = 0;
    return prompt.test(input);
  }

  /**
   * 接続後に呼び出し、シリアル読み取りを購読してバッファに蓄積する
   */
  startReadLoop(): void {
    this.readBuffer = '';
    this.readSubscription?.unsubscribe();
    this.readSubscription = this.transport.getReadStream().subscribe({
      next: (chunk) => {
        this.readBuffer += chunk;
        this.tryResolvePendingFromBuffer();
      },
      error: (err) => console.error('Serial read stream error:', err),
    });
  }

  /**
   * 読み取り購読を停止しバッファを空にする
   */
  stopReadLoop(): void {
    this.readSubscription?.unsubscribe();
    this.readSubscription = null;
    this.readBuffer = '';
  }

  /**
   * 読み取りストリームを購読中か
   */
  isReading(): boolean {
    return this.readSubscription != null && !this.readSubscription.closed;
  }

  private clearReadBuffer(): void {
    this.readBuffer = '';
  }

  /** 現在バッファが待機中コマンドのプロンプトに一致すれば解決する */
  private tryResolvePendingFromBuffer(): string | null {
    for (const [commandId, command] of this.pendingCommands) {
      if (this.matchesPrompt(this.readBuffer, command.config.prompt)) {
        clearTimeout(command.timeoutId);
        this.pendingCommands.delete(commandId);
        const stdout = this.readBuffer;
        command.resolve(stdout);
        this.readBuffer = '';
        return stdout;
      }
    }
    return null;
  }

  /**
   * コマンド実行（stdin に `cmd + '\n'` を送信し、prompt まで待機）
   */
  async exec(
    cmd: string,
    config: CommandExecutionConfig,
    onAttemptStart?: () => void
  ): Promise<CommandResult> {
    return this.execInternal(cmd + '\n', config, onAttemptStart);
  }

  /**
   * raw コマンド実行（stdin に `cmdRaw` をそのまま送信）
   */
  async execRaw(
    cmdRaw: string,
    config: CommandExecutionConfig,
    onAttemptStart?: () => void
  ): Promise<CommandResult> {
    return this.execInternal(cmdRaw, config, onAttemptStart);
  }

  /**
   * 読み取りのみ（送信せず prompt まで待機）
   */
  async readUntilPrompt(
    config: CommandExecutionConfig,
    onAttemptStart?: () => void
  ): Promise<CommandResult> {
    const retry = config.retry ?? 0;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retry; attempt++) {
      onAttemptStart?.();
      // Keep readBuffer: login/boot lines may already be present after a prior
      // readUntilPrompt timeout (shell probe → login: wait).

      const { id, promise } = this.registerWait(config);
      this.tryResolvePendingFromBuffer();
      try {
        const stdout = await promise;
        return { stdout };
      } catch (error: unknown) {
        lastError = error;
        if (attempt === retry) {
          throw error;
        }
      } finally {
        this.cancelCommand(id);
      }
    }

    throw lastError ?? new Error('readUntilPrompt failed');
  }

  private async execInternal(
    sendData: string,
    config: CommandExecutionConfig,
    onAttemptStart?: () => void
  ): Promise<CommandResult> {
    const retry = config.retry ?? 0;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retry; attempt++) {
      onAttemptStart?.();
      this.clearReadBuffer();

      const { id, promise } = this.registerWait(config);
      try {
        await firstValueFrom(this.transport.write(sendData));
        const stdout = await promise;
        return { stdout };
      } catch (error: unknown) {
        lastError = error;
        this.cancelCommand(id);
        void promise.catch(() => undefined);
        if (attempt === retry) {
          throw error;
        }
      }
    }

    throw lastError ?? new Error('exec failed');
  }

  private registerWait(
    config: CommandExecutionConfig
  ): { id: string; promise: Promise<string> } {
    const id = this.nextCommandId();

    return {
      id,
      promise: new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.pendingCommands.delete(id);
          reject(new Error('Command execution timeout'));
        }, config.timeout) as unknown as number;

        this.pendingCommands.set(id, {
          resolve,
          reject,
          timeoutId,
          config,
        });
      }),
    };
  }

  cancelCommand(commandId: string): void {
    const command = this.pendingCommands.get(commandId);
    if (command) {
      clearTimeout(command.timeoutId);
      command.reject(new Error('Command cancelled'));
      this.pendingCommands.delete(commandId);
    }
  }

  cancelAllCommands(): void {
    for (const [, command] of this.pendingCommands) {
      clearTimeout(command.timeoutId);
      command.reject(new Error('All commands cancelled'));
    }
    this.pendingCommands.clear();
  }

  getPendingCommandCount(): number {
    return this.pendingCommands.size;
  }
}
