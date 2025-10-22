/// <reference types="@types/w3c-web-serial" />

import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CommandExecutionConfig,
  SerialCommandService,
} from './serial-command.service';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';
import { SerialReaderService } from './serial-reader.service';
import { SerialValidatorService } from './serial-validator.service';
import { SerialWriterService } from './serial-writer.service';

/**
 * Serial Facade サービス
 *
 * 複数の Serial サービスを統合し、シンプルなインターフェースを提供
 * Facade パターンで実装
 *
 * porting/services/serial.service.ts の機能を統合・分散化した後の
 * 便利なインターフェースとして提供
 */
@Injectable({
  providedIn: 'root',
})
export class SerialFacadeService {
  private connection = inject(SerialConnectionService);
  private reader = inject(SerialReaderService);
  private writer = inject(SerialWriterService);
  private command = inject(SerialCommandService);
  private errorHandler = inject(SerialErrorHandlerService);
  private validator = inject(SerialValidatorService);

  private currentPort: SerialPort | null = null;

  /**
   * データストリーム (Observable)
   */
  get data$() {
    if (!this.currentPort) {
      throw new Error('Serial port not connected');
    }
    return this.reader.read(this.currentPort);
  }

  /**
   * Serial ポートに接続
   *
   * @param baudRate ボーレート (デフォルト: 115200)
   * @returns 接続成功の場合 true、失敗の場合 false
   */
  async connect(baudRate: number = 115200): Promise<boolean> {
    try {
      // 既存の接続があれば切断
      if (this.isConnected()) {
        await this.disconnect();
      }

      const result = await this.connection.connect(baudRate);

      if ('error' in result) {
        console.error('Connection failed:', result.error);
        return false;
      }

      const { port } = result;

      // デバイス検証
      const isValid = await this.validator.isSupportedDevice(port);
      if (!isValid) {
        await this.connection.disconnect();
        console.error('Unsupported device detected - not a Raspberry Pi Zero');
        return false;
      }

      this.currentPort = port;

      return true;
    } catch (error) {
      const errorMessage = this.errorHandler.handleConnectionError(error);
      console.error('Connection error:', errorMessage);
      return false;
    }
  }

  /**
   * Serial ポートから切断
   */
  async disconnect(): Promise<void> {
    try {
      // すべてのコマンドをキャンセル
      this.command.cancelAllCommands();

      // ポートを切断
      await this.connection.disconnect();
      this.currentPort = null;
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  }

  /**
   * データを書き込む
   *
   * @param data 書き込むデータ
   */
  async write(data: string): Promise<void> {
    if (!this.currentPort) {
      throw new Error('Serial port not connected');
    }
    return firstValueFrom(this.writer.write(this.currentPort, data));
  }

  /**
   * 1回だけ読み取る
   *
   * @returns 読み取ったデータ
   */
  async read(): Promise<string> {
    if (!this.currentPort) {
      throw new Error('Serial port not connected');
    }
    return firstValueFrom(this.reader.read(this.currentPort));
  }

  /**
   * 1回だけ文字列として読み取る
   *
   * @returns 読み取った文字列
   */
  async readString(): Promise<string> {
    return this.read();
  }

  /**
   * コマンドを実行し、指定されたプロンプトまで待機
   *
   * @param cmd コマンド
   * @param prompt 期待するプロンプト
   * @param timeout タイムアウト時間（ミリ秒）
   * @returns コマンド実行結果
   */
  async executeCommand(
    cmd: string,
    prompt: string,
    timeout: number = 10000
  ): Promise<string> {
    const config: CommandExecutionConfig = { prompt, timeout };
    return this.command.executeCommand(cmd, config, (data) => this.write(data));
  }

  /**
   * 接続状態を取得
   *
   * @returns 接続中の場合 true
   */
  isConnected(): boolean {
    return this.connection.isConnected();
  }

  /**
   * 読み取り中かどうか
   *
   * @returns 読み取り中の場合 true
   */
  isReading(): boolean {
    return this.reader.isActive();
  }

  /**
   * 書き込み可能かどうか
   *
   * @returns 書き込み可能な場合 true
   */
  isWriteReady(): boolean {
    return this.writer.isReady();
  }

  /**
   * 待機中のコマンド数を取得
   *
   * @returns 待機中のコマンド数
   */
  getPendingCommandCount(): number {
    return this.command.getPendingCommandCount();
  }

  /**
   * Raspberry Pi Zero かどうかを検証
   *
   * @returns Raspberry Pi Zero の場合 true
   */
  async isRaspberryPiZero(): Promise<boolean> {
    if (!this.currentPort) {
      return false;
    }
    return this.validator.isRaspberryPiZero(this.currentPort);
  }

  /**
   * 現在のポートを取得
   *
   * @returns SerialPort または null
   */
  getPort(): SerialPort | null {
    return this.currentPort;
  }

  // ============================================
  // Legacy methods (後方互換性のため)
  // ============================================

  /**
   * @deprecated Use connect() instead
   */
  async startConnection(baudRate?: number): Promise<void> {
    const success = await this.connect(baudRate);
    if (!success) {
      throw new Error('Failed to start connection');
    }
  }

  /**
   * @deprecated Use disconnect() instead
   */
  async terminateConnection(): Promise<void> {
    return this.disconnect();
  }

  /**
   * @deprecated Use write() instead
   */
  async portWrite(data: string): Promise<void> {
    return this.write(data);
  }

  /**
   * @deprecated Use executeCommand() instead
   */
  async portWritelnWaitfor(
    cmd: string,
    prompt: string,
    timeout: number = 10000
  ): Promise<string> {
    return this.executeCommand(cmd, prompt, timeout);
  }

  /**
   * @deprecated Use isConnected() instead
   */
  getConnectionStatus(): boolean {
    return this.isConnected();
  }
}
