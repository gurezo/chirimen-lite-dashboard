/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { createSerialClient, SerialClient } from '@gurezo/web-serial-rxjs';
import { RASPBERRY_PI_ZERO_INFO } from '../constants/web.serial.const';
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
  private client: SerialClient | undefined;

  /**
   * Serial ポートに接続
   * @param baudRate ボーレート (デフォルト: 115200)
   * @returns 接続成功時は SerialPort、失敗時はエラーメッセージ
   */
  async connect(
    baudRate = 115200
  ): Promise<{ port: SerialPort } | { error: string }> {
    try {
      this.client = createSerialClient({
        filter: RASPBERRY_PI_ZERO_INFO,
      });

      await this.client.connect({ baudRate });

      const port = this.client.currentPort;
      if (!port) {
        const errorMessage = this.errorHandler.handleConnectionError(
          new Error('Port is not available after connection')
        );
        return { error: errorMessage };
      }

      return { port };
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
      if (this.client) {
        await this.client.disconnect();
        this.client = undefined;
      }
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
    return this.client?.connected ?? false;
  }

  /**
   * 現在の SerialPort を取得
   * @returns SerialPort または undefined
   */
  getPort(): SerialPort | undefined {
    return this.client?.currentPort;
  }

  /**
   * SerialClient インスタンスを取得（内部使用）
   * @returns SerialClient または undefined
   */
  getClient(): SerialClient | undefined {
    return this.client;
  }
}
