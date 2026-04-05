/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';
import { createSerialClient, SerialClient } from '@gurezo/web-serial-rxjs';
import {
  catchError,
  defaultIfEmpty,
  defer,
  firstValueFrom,
  map,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import {
  getConnectionErrorMessage,
  getReadErrorMessage,
  getWriteErrorMessage,
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
      this.client = createSerialClient({ baudRate });
      return this.client!.connect().pipe(
        map((): { port: SerialPort } | { error: string } => {
          const port = this.client!.currentPort;
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
   * Serial ポートに接続
   * @param baudRate ボーレート (デフォルト: 115200)
   * @returns 接続成功時は SerialPort、失敗時はエラーメッセージ
   */
  async connect(
    baudRate = 115200
  ): Promise<{ port: SerialPort } | { error: string }> {
    return firstValueFrom(this.connect$(baudRate));
  }

  /**
   * Serial ポートから切断
   */
  async disconnect(): Promise<void> {
    return firstValueFrom(this.disconnect$());
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
    return this.client.getReadStream().pipe(
      map((uint8Array: Uint8Array) =>
        this.decoder.decode(uint8Array, { stream: true })
      ),
      catchError((error) =>
        throwError(() => new Error(getReadErrorMessage(error)))
      )
    );
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
