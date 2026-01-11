/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';

/**
 * Serial ポート書き込みサービス
 * データの書き込みを担当
 */
@Injectable({
  providedIn: 'root',
})
export class SerialWriterService {
  private errorHandler = inject(SerialErrorHandlerService);
  private connection = inject(SerialConnectionService);

  /**
   * データを書き込む
   * @param _port SerialPort (後方互換性のため保持、実際には使用しない)
   * @param data 書き込むデータ
   * @returns Observable<void>
   */
  write(_port: SerialPort, data: string): Observable<void> {
    const client = this.connection.getClient();
    if (!client || !client.connected) {
      return throwError(() => new Error('Serial port not connected'));
    }

    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(data);

    try {
      return from(client.write(uint8Array));
    } catch (error) {
      const errorMessage = this.errorHandler.handleWriteError(error);
      return throwError(() => new Error(errorMessage));
    }
  }

  /**
   * 準備完了かどうか（後方互換性のため）
   * @returns 接続状態に基づく
   */
  isReady(): boolean {
    return this.connection.isConnected();
  }
}
