/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { SerialErrorHandlerService } from './serial-error-handler.service';

/**
 * Serial ポート接続管理サービス
 * 接続・切断のみを担当
 */
@Injectable({
  providedIn: 'root',
})
export class SerialConnectionService {
  private errorHandler = inject(SerialErrorHandlerService);
  private port: SerialPort | undefined;

  /**
   * Serial ポートに接続
   * @param baudRate ボーレート (デフォルト: 115200)
   * @returns 接続成功時は SerialPort、失敗時はエラーメッセージ
   */
  async connect(
    baudRate = 115200
  ): Promise<{ port: SerialPort } | { error: string }> {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });

      return { port: this.port };
    } catch (error) {
      const errorMessage = this.errorHandler.handleConnectionError(error);
      return { error: errorMessage };
    }
  }

  /**
   * Serial ポートから切断
   */
  async disconnect(): Promise<void> {
    try {
      await this.port?.close();
      this.port = undefined;
    } catch (error) {
      console.error('Error closing port:', error);
      throw error;
    }
  }

  /**
   * 接続状態を取得
   * @returns 接続中かどうか
   */
  isConnected(): boolean {
    return this.port !== undefined;
  }

  /**
   * 現在の SerialPort を取得
   * @returns SerialPort または undefined
   */
  getPort(): SerialPort | undefined {
    return this.port;
  }
}
