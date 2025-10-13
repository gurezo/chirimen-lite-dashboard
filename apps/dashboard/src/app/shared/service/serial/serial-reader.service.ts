/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
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
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private readableStreamClosed: Promise<void> | null = null;
  private dataSubject = new Subject<string>();
  private isReading = false;

  /**
   * データストリーム (Observable)
   */
  readonly data$ = this.dataSubject.asObservable();

  /**
   * 読み取りを開始
   * @param port SerialPort
   */
  async startReading(port: SerialPort): Promise<void> {
    if (this.isReading) {
      console.warn('Already reading from serial port');
      return;
    }

    const decoder = new TextDecoderStream();

    try {
      this.readableStreamClosed =
        port.readable?.pipeTo(decoder.writable as WritableStream<Uint8Array>) ??
        null;
      const inputStream = decoder.readable;
      this.reader = inputStream.getReader();
      this.isReading = true;

      while (this.isReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          this.dataSubject.next(value);
        }
      }
    } catch (error) {
      const errorMessage = this.errorHandler.handleReadError(error);
      console.error('Read error:', errorMessage);
      this.dataSubject.error(errorMessage);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 読み取りを停止
   */
  async stopReading(): Promise<void> {
    this.isReading = false;
    await this.cleanup();
  }

  /**
   * クリーンアップ処理
   */
  private async cleanup(): Promise<void> {
    try {
      this.reader?.releaseLock();
      await this.readableStreamClosed?.catch((err) => {
        console.error('Readable stream closed with error:', err);
      });
    } catch (error) {
      console.error('Cleanup error (reader):', error);
    } finally {
      this.reader = null;
      this.readableStreamClosed = null;
      this.isReading = false;
    }
  }

  /**
   * 読み取り中かどうか
   * @returns 読み取り中の場合 true
   */
  isActive(): boolean {
    return this.isReading;
  }
}
