/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
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

  /**
   * データを読み取る（元の実装方式）
   * @param port SerialPort
   * @returns Observable<string>
   */
  read(port: SerialPort): Observable<string> {
    if (!port) {
      return throwError(() => new Error('Serial port not connected'));
    }

    const reader = port.readable?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      return throwError(() => new Error('Serial port not connected'));
    }

    return new Observable<string>((observer) => {
      const readChunk = () => {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              observer.complete();
              reader.releaseLock();
              return;
            }
            const chunk = decoder.decode(value);
            observer.next(chunk);
            readChunk();
          })
          .catch((error) => {
            const errorMessage = this.errorHandler.handleReadError(error);
            observer.error(errorMessage);
            reader.releaseLock();
          });
      };

      readChunk();

      return () => {
        reader.releaseLock();
      };
    });
  }

  /**
   * 読み取り中かどうか（後方互換性のため）
   * @returns 常に false（元の実装では状態管理しない）
   */
  isActive(): boolean {
    return false;
  }
}
