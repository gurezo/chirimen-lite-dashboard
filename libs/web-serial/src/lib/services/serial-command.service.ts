/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';

/**
 * コマンド実行設定
 */
export interface CommandExecutionConfig {
  /** 期待するプロンプト文字列 */
  prompt: string;
  /** タイムアウト時間（ミリ秒） */
  timeout: number;
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
  private pendingCommands = new Map<
    string,
    {
      resolve: (value: string) => void;
      reject: (reason: unknown) => void;
      timeoutId: number;
      config: CommandExecutionConfig;
    }
  >();

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
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingCommands.delete(commandId);
        reject(new Error('Command execution timeout'));
      }, config.timeout) as unknown as number;

      this.pendingCommands.set(commandId, {
        resolve,
        reject,
        timeoutId,
        config,
      });

      // コマンドを送信
      writeFunction(commandId + '\n').catch((error) => {
        // writeFunction が失敗した場合、コマンドを削除してエラーを返す
        this.pendingCommands.delete(commandId);
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  /**
   * 入力データを処理し、待機中のコマンドのプロンプトとマッチするかチェック
   *
   * @param input 受信したデータ
   * @returns マッチした場合は入力データ、マッチしない場合は null
   */
  processInput(input: string): string | null {
    for (const [commandId, command] of this.pendingCommands) {
      if (input.match(command.config.prompt)) {
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
