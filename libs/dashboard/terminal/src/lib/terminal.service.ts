/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { Terminal } from '@xterm/xterm';
import { Subscription } from 'rxjs';
import { SerialConnectionService } from '@dashboard/serial';
import { SerialErrorHandlerService } from '@dashboard/serial';
import { SerialReaderService } from '@dashboard/serial';
import { SerialValidatorService } from '@dashboard/serial';
import { SerialWriterService } from '@dashboard/serial';

/**
 * ターミナルサービス
 * XTerm と Web Serial API を統合し、ターミナル通信を一元管理
 */
@Injectable({
  providedIn: 'root',
})
export class TerminalService {
  private connection = inject(SerialConnectionService);
  private reader = inject(SerialReaderService);
  private writer = inject(SerialWriterService);
  private validator = inject(SerialValidatorService);
  private errorHandler = inject(SerialErrorHandlerService);

  private terminal: Terminal | null = null;
  private dataSubscription: Subscription | null = null;

  /**
   * ターミナルを初期化
   * @param terminal XTerm Terminal インスタンス
   */
  initialize(terminal: Terminal): void {
    this.terminal = terminal;
  }

  /**
   * Serial ポートに接続し、ターミナルと統合
   * @param baudRate ボーレート (デフォルト: 115200)
   * @returns 成功/失敗メッセージ
   */
  async connectToSerial(
    baudRate = 115200
  ): Promise<{ success: boolean; message: string }> {
    if (!this.terminal) {
      return { success: false, message: 'Terminal not initialized' };
    }

    // 接続
    const connectResult = await this.connection.connect(baudRate);

    if ('error' in connectResult) {
      return { success: false, message: connectResult.error };
    }

    const { port } = connectResult;

    // デバイス検証
    const isValid = await this.validator.isSupportedDevice(port);
    if (!isValid) {
      await this.connection.disconnect();
      return {
        success: false,
        message: this.errorHandler.getRaspberryPiZeroError(),
      };
    }

    // Reader と Writer を初期化
    this.writer.initialize(port);

    // Serial からのデータを Terminal に書き込む
    this.dataSubscription = this.reader.data$.subscribe({
      next: (data) => this.writeToTerminal(data),
      error: (error) => this.writeToTerminal(`\r\nError: ${error}\r\n`),
    });

    // 読み取り開始
    this.reader.startReading(port);

    return { success: true, message: 'Connected successfully' };
  }

  /**
   * Serial から切断
   */
  async disconnect(): Promise<void> {
    await this.reader.stopReading();
    this.writer.dispose();
    this.dataSubscription?.unsubscribe();
    this.dataSubscription = null;
    await this.connection.disconnect();
  }

  /**
   * ユーザー入力を Serial に送信
   * @param data 送信データ
   */
  async sendToSerial(data: string): Promise<void> {
    if (!this.writer.isReady()) {
      throw new Error('Serial writer not ready');
    }
    await this.writer.write(data);
  }

  /**
   * Terminal にデータを書き込む
   * @param data 書き込むデータ
   */
  private writeToTerminal(data: string): void {
    this.terminal?.write(data);
  }

  /**
   * キー入力を処理
   * @param terminal Terminal インスタンス
   * @param e キーイベント
   */
  handleKeyInput(terminal: Terminal, e: { domEvent: KeyboardEvent }): void {
    const ev = e.domEvent;
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

    if (ev.code === 'Enter') {
      terminal.write('\r\n$ ');
      // TODO: コマンド実行処理を追加
    } else if (ev.code === 'Backspace') {
      terminal.write('\b \b');
    } else if (printable) {
      terminal.write(ev.key);
      // Serial に送信する場合はここで sendToSerial() を呼ぶ
    }
  }

  /**
   * 接続状態を取得
   * @returns 接続中の場合 true
   */
  isConnected(): boolean {
    return this.connection.isConnected();
  }

  /**
   * Terminal インスタンスを取得
   * @returns Terminal または null
   */
  getTerminal(): Terminal | null {
    return this.terminal;
  }
}

