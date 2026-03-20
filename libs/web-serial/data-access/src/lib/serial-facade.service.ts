/// <reference types="@types/w3c-web-serial" />

import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map, Observable, take, type Subscription } from 'rxjs';
import {
  CommandExecOptions,
  CommandResult,
  CommandExecutionConfig,
  SerialCommandService,
} from './serial-command.service';
import { SerialTransportService } from './serial-transport.service';
import { SerialValidatorService } from './serial-validator.service';

/**
 * Serial Facade サービス
 *
 * Transport / Validator / Command を統合し、シンプルなインターフェースを提供
 */
@Injectable({
  providedIn: 'root',
})
export class SerialFacadeService {
  private transport = inject(SerialTransportService);
  private command = inject(SerialCommandService);
  private validator = inject(SerialValidatorService);

  private readBuffer = '';
  private readSubscription: Subscription | null = null;

  /**
   * データストリーム (Observable)
   */
  get data$() {
    if (!this.transport.isConnected()) {
      throw new Error('Serial port not connected');
    }
    return this.transport.getReadStream();
  }

  /**
   * Serial ポートに接続
   *
   * @param baudRate ボーレート (デフォルト: 115200)
   * @returns 接続成功の場合 true、失敗の場合 false
   */
  async connect(baudRate = 115200): Promise<boolean> {
    try {
      if (this.isConnected()) {
        await this.disconnect();
      }

      const result = await this.transport.connect(baudRate);

      if ('error' in result) {
        console.error('Connection failed:', result.error);
        return false;
      }

      const { port } = result;

      const isValid = await this.validator.isSupportedDevice(port);
      if (!isValid) {
        await this.transport.disconnect();
        console.warn(
          'Unsupported device detected - not a Raspberry Pi Zero. Connection cancelled.',
        );
        return false;
      }

      this.startReadStreamSubscription();
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  private startReadStreamSubscription(): void {
    this.readBuffer = '';
    this.readSubscription?.unsubscribe();
    this.readSubscription = this.transport.getReadStream().subscribe({
      next: (chunk) => {
        this.readBuffer += chunk;
        const matched = this.command.processInput(this.readBuffer);
        if (matched) {
          this.readBuffer = '';
        }
      },
      error: (err) => console.error('Serial read stream error:', err),
    });
  }

  /**
   * Serial ポートから切断
   */
  async disconnect(): Promise<void> {
    try {
      this.command.cancelAllCommands();
      this.readSubscription?.unsubscribe();
      this.readSubscription = null;
      this.readBuffer = '';
      await this.transport.disconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
      throw error;
    }
  }

  /**
   * データを書き込む
   */
  async write(data: string): Promise<void> {
    if (!this.transport.isConnected()) {
      throw new Error('Serial port not connected');
    }
    return firstValueFrom(this.transport.write(data));
  }

  /**
   * 1回だけ読み取る
   */
  async read(): Promise<string> {
    if (!this.transport.isConnected()) {
      throw new Error('Serial port not connected');
    }
    return firstValueFrom(
      this.transport.getReadStream().pipe(take(1))
    );
  }

  /**
   * 1回だけ文字列として読み取る
   */
  async readString(): Promise<string> {
    return this.read();
  }

  /**
   * コマンドを実行し、指定されたプロンプトまで待機
   */
  exec(cmd: string, options: CommandExecOptions = {}): Observable<CommandResult> {
    return this.command.exec(cmd, (data) => this.write(data), options);
  }

  /**
   * コマンドを実行し、指定されたプロンプトまで待機
   *
   * @deprecated Use exec() instead
   */
  async executeCommand(
    cmd: string,
    prompt: string,
    timeout = 10000,
  ): Promise<string> {
    const config: CommandExecutionConfig = { prompt, timeout };
    return firstValueFrom(
      this.exec(cmd, config).pipe(map((result) => result.stdout))
    );
  }

  isConnected(): boolean {
    return this.transport.isConnected();
  }

  /**
   * 読み取り中かどうか（ストリーム購読中は true）
   */
  isReading(): boolean {
    return this.readSubscription != null && !this.readSubscription.closed;
  }

  isWriteReady(): boolean {
    return this.transport.isConnected();
  }

  getPendingCommandCount(): number {
    return this.command.getPendingCommandCount();
  }

  async isRaspberryPiZero(): Promise<boolean> {
    const port = this.transport.getPort();
    if (!port) {
      return false;
    }
    return this.validator.isRaspberryPiZero(port);
  }

  getPort(): SerialPort | null {
    return this.transport.getPort() ?? null;
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
    timeout = 10000,
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
