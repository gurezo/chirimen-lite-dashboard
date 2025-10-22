/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { catchError, from, map, Observable, throwError } from 'rxjs';
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

  /**
   * データを書き込む（元の実装方式）
   * @param port SerialPort
   * @param data 書き込むデータ
   * @returns Observable<void>
   */
  write(port: SerialPort, data: string): Observable<void> {
    if (!port) {
      return throwError(() => new Error('Serial port not connected'));
    }

    const encoder = new TextEncoder();
    const writer = port.writable?.getWriter();

    if (!writer) {
      return throwError(() => new Error('Serial port not connected'));
    }

    return from(writer.write(encoder.encode(data))).pipe(
      map(() => {
        writer.releaseLock();
      }),
      catchError((error) => {
        console.error('Error sending data:', error);
        writer.releaseLock();
        return throwError(() => error);
      })
    );
  }

  /**
   * 準備完了かどうか（後方互換性のため）
   * @returns 常に false（元の実装では状態管理しない）
   */
  isReady(): boolean {
    return false;
  }
}
