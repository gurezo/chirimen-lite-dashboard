/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';
import { createSerialClient, SerialClient } from '@gurezo/web-serial-rxjs';
import {
  catchError,
  defaultIfEmpty,
  defer,
  map,
  Observable,
  of,
  share,
  tap,
  throwError,
} from 'rxjs';
import {
  getConnectionErrorMessage,
  getReadErrorMessage,
  getWriteErrorMessage,
  RASPBERRY_PI_ZERO_INFO,
} from '@libs-web-serial-util';

/**
 * Serial 接続・読取・書込を一元化するサービス
 * @gurezo/web-serial-rxjs の SerialClient を直接利用
 */
@Injectable({
  providedIn: 'root',
})
export class SerialTransportService {
  private client: SerialClient | undefined;
  /**
   * port.readable は同時にロックできる Reader が 1 つだけのため、
   * getReadStream() を呼ぶたびに新しい Reader を取ると Facade の常時購読と
   * read$() などがデータを奪い合い、プロンプト待ちがタイムアウトする。
   * 1 本の Observable を share して多重購読する。
   */
  private readShared$: Observable<string> | null = null;
  private readonly decoder = new TextDecoder();
  private readonly encoder = new TextEncoder();

  /**
   * Serial ポートに接続（Observable）
   * @param baudRate ボーレート (デフォルト: 115200)
   */
  connect$(
    baudRate = 115200
  ): Observable<{ port: SerialPort } | { error: string }> {
    return defer(() => {
      const client = createSerialClient({
        baudRate,
        filters: [
          {
            usbVendorId: RASPBERRY_PI_ZERO_INFO.usbVendorId,
            usbProductId: RASPBERRY_PI_ZERO_INFO.usbProductId,
          },
        ],
      });
      this.client = client;
      this.readShared$ = null;
      return client.connect().pipe(
        map((): { port: SerialPort } | { error: string } => {
          const port = client.currentPort;
          if (!port) {
            return {
              error: getConnectionErrorMessage(
                new Error('Port is not available after connection')
              ),
            };
          }
          return { port };
        }),
        catchError((error) =>
          of({ error: getConnectionErrorMessage(error) })
        )
      );
    });
  }

  /**
   * Serial ポートから切断（Observable）
   */
  disconnect$(): Observable<void> {
    return defer(() => {
      if (!this.client) {
        return of(undefined);
      }
      const client = this.client;
      return client.disconnect().pipe(
        defaultIfEmpty(undefined),
        tap(() => {
          if (this.client === client) {
            this.client = undefined;
            this.readShared$ = null;
          }
        }),
        catchError((error) => {
          console.error('Error closing port:', error);
          return throwError(() => error);
        })
      );
    });
  }

  /**
   * 接続状態を取得
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * 現在の SerialPort を取得
   */
  getPort(): SerialPort | undefined {
    return this.client?.currentPort ?? undefined;
  }

  /**
   * 読み取りストリーム（文字列）を取得
   * 未接続時またはエラー時は throwError
   */
  getReadStream(): Observable<string> {
    if (!this.client?.connected) {
      return throwError(() => new Error('Serial port not connected'));
    }
    if (!this.readShared$) {
      this.readShared$ = this.client.getReadStream().pipe(
        map((uint8Array: Uint8Array) =>
          this.decoder.decode(uint8Array, { stream: true })
        ),
        catchError((error) =>
          throwError(() => new Error(getReadErrorMessage(error)))
        ),
        share()
      );
    }
    return this.readShared$;
  }

  /**
   * データを書き込む
   * 未接続時またはエラー時は throwError
   */
  write(data: string): Observable<void> {
    if (!this.client?.connected) {
      return throwError(() => new Error('Serial port not connected'));
    }
    const uint8Array = this.encoder.encode(data);
    return this.client.write(uint8Array).pipe(
      catchError((error) =>
        throwError(() => new Error(getWriteErrorMessage(error)))
      )
    );
  }
}
