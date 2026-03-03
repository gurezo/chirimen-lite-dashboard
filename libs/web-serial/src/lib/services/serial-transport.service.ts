/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';
import { createSerialClient, SerialClient } from '@gurezo/web-serial-rxjs';
import { catchError, map, Observable, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  getConnectionErrorMessage,
  getReadErrorMessage,
  getWriteErrorMessage,
} from '../utils/serial-error-messages';

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
   * Serial ポートに接続
   * @param baudRate ボーレート (デフォルト: 115200)
   * @returns 接続成功時は SerialPort、失敗時はエラーメッセージ
   */
  async connect(
    baudRate = 115200
  ): Promise<{ port: SerialPort } | { error: string }> {
    try {
      this.client = createSerialClient({ baudRate });
      await firstValueFrom(this.client.connect());

      const port = this.client.currentPort;
      if (!port) {
        const errorMessage = getConnectionErrorMessage(
          new Error('Port is not available after connection')
        );
        return { error: errorMessage };
      }
      return { port };
    } catch (error) {
      const errorMessage = getConnectionErrorMessage(error);
      return { error: errorMessage };
    }
  }

  /**
   * Serial ポートから切断
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await firstValueFrom(this.client.disconnect());
        this.client = undefined;
      }
    } catch (error) {
      console.error('Error closing port:', error);
      throw error;
    }
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
