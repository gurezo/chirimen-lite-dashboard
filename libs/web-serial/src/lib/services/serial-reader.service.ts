/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';

/**
 * Serial ポート読み取りサービス
 * データの読み取りとストリーム管理を担当
 */
@Injectable({
  providedIn: 'root',
})
export class SerialReaderService {
  private errorHandler = inject(SerialErrorHandlerService);
  private connection = inject(SerialConnectionService);

  /**
   * データを読み取る
   * @param port SerialPort (後方互換性のため保持、実際には使用しない)
   * @returns Observable<string>
   */
  read(port: SerialPort): Observable<string> {
    const client = this.connection.getClient();
    if (!client || !client.connected) {
      return throwError(() => new Error('Serial port not connected'));
    }

    const decoder = new TextDecoder();

    try {
      return client.getReadStream().pipe(
        map((uint8Array: Uint8Array) => {
          return decoder.decode(uint8Array, { stream: true });
        })
      );
    } catch (error) {
      const errorMessage = this.errorHandler.handleReadError(error);
      return throwError(() => new Error(errorMessage));
    }
  }

  /**
   * 読み取り中かどうか（後方互換性のため）
   * @returns 常に false（元の実装では状態管理しない）
   */
  isActive(): boolean {
    return false;
  }
}
