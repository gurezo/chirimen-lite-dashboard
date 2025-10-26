/// <reference types="@types/w3c-web-serial" />

import { Injectable, inject } from '@angular/core';
import { SerialCommandService } from '@dashboard/serial';
import { SerialReaderService } from '@dashboard/serial';

/**
 * Terminal ループサービス
 *
 * Serial から受信したデータをターミナルに表示するループ処理を担当
 * porting/services/serial.service.ts の startTerminal() から分離
 *
 * 責任: Terminal の継続的なデータ処理
 * Serial の責任ではないため、別サービスに分離
 */
@Injectable({
  providedIn: 'root',
})
export class TerminalLoopService {
  private reader = inject(SerialReaderService);
  private command = inject(SerialCommandService);

  private isRunning = false;
  private terminalCallback: ((data: Uint8Array) => void) | null = null;

  /**
   * ターミナルループを開始
   *
   * @param callback データ受信時のコールバック関数
   */
  async startLoop(callback: (data: Uint8Array) => void): Promise<void> {
    if (!this.reader.isActive()) {
      throw new Error('Serial reader is not active');
    }

    this.isRunning = true;
    this.terminalCallback = callback;

    try {
      // data$ Observable を購読してデータを処理
      const subscription = this.reader.data$.subscribe({
        next: (data) => {
          if (!this.isRunning) {
            subscription.unsubscribe();
            return;
          }

          // コマンド実行中のレスポンスかチェック
          const result = this.command.processInput(data);
          if (result) {
            // コマンドレスポンスとして処理済み
            return;
          }

          // ターミナルに表示
          if (this.terminalCallback) {
            const encoder = new TextEncoder();
            this.terminalCallback(encoder.encode(data));
          }
        },
        error: (error) => {
          console.error('Terminal loop error:', error);
          this.stopLoop();
        },
        complete: () => {
          console.log('Terminal loop completed');
          this.stopLoop();
        },
      });

      // ループが停止されたら購読を解除
      while (this.isRunning) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      subscription.unsubscribe();
    } catch (error) {
      console.error('Terminal loop error:', error);
      this.stopLoop();
      throw error;
    }
  }

  /**
   * ターミナルループを停止
   */
  stopLoop(): void {
    this.isRunning = false;
    this.terminalCallback = null;
  }

  /**
   * ループ実行中かどうか
   *
   * @returns 実行中の場合 true
   */
  isActive(): boolean {
    return this.isRunning;
  }
}

