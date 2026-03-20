/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';

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
 * コマンドの実行、プロンプト待機、タイムアウト管理を担当
 *
 * porting/services/command-executor.service.ts から移行
 * + serial.service.ts の execute() メソッドを統合
 */
@Injectable({
  providedIn: 'root',
})
export class SerialCommandService {
  private commandSeq = 0;
  private pendingCommands = new Map<
    string,
    {
      resolve: (value: string) => void;
      reject: (reason: unknown) => void;
      timeoutId: number;
      config: CommandExecutionConfig;
    }
  >();

  private nextCommandId(): string {
    return `cmd-${++this.commandSeq}-${Date.now()}`;
  }

  private matchesPrompt(input: string, prompt: string | RegExp): boolean {
    if (typeof prompt === 'string') {
      return input.includes(prompt);
    }
    // RegExp#test は lastIndex があると壊れるため都度 lastIndex をリセット
    prompt.lastIndex = 0;
    return prompt.test(input);
  }

  /**
   * コマンド実行を開始し、指定されたプロンプトが返されるまで待機
   *
   * @param commandId コマンドID（通常はコマンド文字列自体）
   * @param config 実行設定
   * @param writeFunction データ書き込み関数
   * @returns コマンド実行結果
   */
  async executeCommand(
    commandId: string,
    config: CommandExecutionConfig,
    writeFunction: (data: string) => Promise<void>
  ): Promise<string> {
    const result = await this.exec(commandId, config, writeFunction);
    return result.stdout;
  }

  /**
   * コマンド実行（stdin に `cmd + '\n'` を送信し、prompt まで待機）
   */
  async exec(
    cmd: string,
    config: CommandExecutionConfig,
    writeFunction: (data: string) => Promise<void>,
    onAttemptStart?: () => void
  ): Promise<CommandResult> {
    return this.execInternal(cmd + '\n', config, writeFunction, onAttemptStart);
  }

  /**
   * raw コマンド実行（stdin に `cmdRaw` をそのまま送信）
   *
   * base64 送信など、改行制御が必要なケースを想定しています。
   */
  async execRaw(
    cmdRaw: string,
    config: CommandExecutionConfig,
    writeFunction: (data: string) => Promise<void>,
    onAttemptStart?: () => void
  ): Promise<CommandResult> {
    return this.execInternal(cmdRaw, config, writeFunction, onAttemptStart);
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

      const { id, promise } = this.registerWait(config);
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
    writeFunction: (data: string) => Promise<void>,
    onAttemptStart?: () => void
  ): Promise<CommandResult> {
    const retry = config.retry ?? 0;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retry; attempt++) {
      onAttemptStart?.();

      const { id, promise } = this.registerWait(config);
      try {
        // コマンドを送信
        await writeFunction(sendData);
        const stdout = await promise;
        return { stdout };
      } catch (error: unknown) {
        lastError = error;
        // pending が残らないようにクリア
        this.cancelCommand(id);
        // cancelCommand() により promise が reject されるが、ここでは待機しないため
        // unhandled rejection を防ぐ
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

  /**
   * 入力データを処理し、待機中のコマンドのプロンプトとマッチするかチェック
   *
   * @param input 受信したデータ
   * @returns マッチした場合は入力データ、マッチしない場合は null
   */
  processInput(input: string): string | null {
    for (const [commandId, command] of this.pendingCommands) {
      if (this.matchesPrompt(input, command.config.prompt)) {
        // コマンド完了
        clearTimeout(command.timeoutId);
        this.pendingCommands.delete(commandId);
        command.resolve(input);
        return input;
      }
    }
    return null;
  }

  /**
   * 特定のコマンドをキャンセル
   *
   * @param commandId キャンセルするコマンドID
   */
  cancelCommand(commandId: string): void {
    const command = this.pendingCommands.get(commandId);
    if (command) {
      clearTimeout(command.timeoutId);
      command.reject(new Error('Command cancelled'));
      this.pendingCommands.delete(commandId);
    }
  }

  /**
   * すべての待機中のコマンドをキャンセル
   */
  cancelAllCommands(): void {
    for (const [, command] of this.pendingCommands) {
      clearTimeout(command.timeoutId);
      command.reject(new Error('All commands cancelled'));
    }
    this.pendingCommands.clear();
  }

  /**
   * 待機中のコマンド数を取得
   *
   * @returns 待機中のコマンド数
   */
  getPendingCommandCount(): number {
    return this.pendingCommands.size;
  }

  /**
   * 特定のパターンを待機する（簡易実装）
   *
   * @param writeData 送信するデータ
   * @param pattern 待機するパターン
   * @param timeoutMs タイムアウト時間（ミリ秒）
   * @returns マッチした結果
   */
  async waitForPattern(
    writeData: string,
    pattern: string,
    timeoutMs = 30000
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Pattern wait timeout: ${pattern}`));
      }, timeoutMs);

      // 簡易的な実装
      // 実際の実装では、データストリームを監視する必要がある
      setTimeout(() => {
        clearTimeout(timeoutId);
        resolve('Pattern matched');
      }, 100);
    });
  }
}
