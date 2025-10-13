/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { SerialErrorHandlerService } from './serial-error-handler.service';

/**
 * Serial ポート書き込みサービス
 * データの書き込みとストリーム管理を担当
 */
@Injectable({
  providedIn: 'root',
})
export class SerialWriterService {
  private errorHandler = inject(SerialErrorHandlerService);
  private writer: WritableStreamDefaultWriter<string> | null = null;
  private writableStreamClosed: Promise<void> | null = null;
  private currentPort: SerialPort | null = null;
  private isWriting = false;

  /**
   * 書き込みの準備
   * @param port SerialPort
   */
  initialize(port: SerialPort): void {
    this.currentPort = port;
  }

  /**
   * データを書き込む
   * @param data 書き込むデータ
   */
  async write(data: string): Promise<void> {
    if (!this.currentPort) {
      throw new Error('SerialWriter not initialized. Call initialize() first.');
    }

    if (this.isWriting) {
      throw new Error('Already writing to serial port');
    }

    const encoder = new TextEncoderStream();

    try {
      this.isWriting = true;
      this.writableStreamClosed = encoder.readable.pipeTo(
        this.currentPort.writable!
      );
      this.writer = encoder.writable.getWriter();
      await this.writer.write(data);
    } catch (error) {
      const errorMessage = this.errorHandler.handleWriteError(error);
      console.error('Write error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * クリーンアップ処理
   */
  private async cleanup(): Promise<void> {
    try {
      this.writer?.releaseLock();
      await this.writableStreamClosed?.catch((err) => {
        console.error('Writable stream closed with error:', err);
      });
    } catch (error) {
      console.error('Cleanup error (writer):', error);
    } finally {
      this.writer = null;
      this.writableStreamClosed = null;
      this.isWriting = false;
    }
  }

  /**
   * リソースを解放
   */
  dispose(): void {
    this.currentPort = null;
  }

  /**
   * 準備完了かどうか
   * @returns 準備完了の場合 true
   */
  isReady(): boolean {
    return this.currentPort !== null && !this.isWriting;
  }

  /**
   * データを同期的に書き込む（即座に書き込み）
   * porting/services/serial.service.ts の write() から移行
   *
   * @param data 書き込むデータ
   */
  async writeSync(data: string): Promise<void> {
    if (!this.currentPort) {
      throw new Error('SerialWriter not initialized. Call initialize() first.');
    }

    if (!this.currentPort.writable) {
      throw new Error('Port is not writable');
    }

    const encoder = new TextEncoderStream();
    const writableStreamClosed = encoder.readable.pipeTo(
      this.currentPort.writable
    );
    const writer = encoder.writable.getWriter();

    try {
      await writer.write(data);
      await writer.close();
      await writableStreamClosed;
    } catch (error) {
      const errorMessage = this.errorHandler.handleWriteError(error);
      console.error('Write error:', errorMessage);
      throw new Error(errorMessage);
    }
  }
}
