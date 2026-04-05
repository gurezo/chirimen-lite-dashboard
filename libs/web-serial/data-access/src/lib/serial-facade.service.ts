/// <reference types="@types/w3c-web-serial" />

import { Injectable, inject } from '@angular/core';
import {
  catchError,
  defer,
  firstValueFrom,
  of,
  type Observable,
  Subject,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import {
  type CommandResult,
  SerialCommandService,
} from './serial-command.service';
import {
  SERIAL_TIMEOUT,
  type SerialExecOptions,
} from '@libs-web-serial-util';
import { PiZeroShellReadinessService } from './pi-zero-shell-readiness.service';
import { SerialTransportService } from './serial-transport.service';
import { SerialValidatorService } from './serial-validator.service';

/**
 * Serial Facade サービス
 *
 * Transport / Validator（ポート情報） / Command を統合し、シンプルな API を提供
 */
@Injectable({
  providedIn: 'root',
})
export class SerialFacadeService {
  private transport = inject(SerialTransportService);
  private command = inject(SerialCommandService);
  private validator = inject(SerialValidatorService);
  private shellReadiness = inject(PiZeroShellReadinessService);

  /** 接続成功のたびに増加（同一接続の post-connect 処理を1回に制限するため） */
  private connectionEpoch = 0;

  private readonly connectionEstablished = new Subject<void>();
  /**
   * シリアル接続が確立されるたびに通知（ターミナルが後からマウントされる場合のブートストラップ用）
   */
  readonly connectionEstablished$ = this.connectionEstablished.asObservable();

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
   * Serial ポートに接続（Observable）
   *
   * @param baudRate ボーレート (デフォルト: 115200)
   */
  connect$(baudRate = 115200): Observable<boolean> {
    return defer(() => {
      const preConnect$ = this.isConnected()
        ? this.disconnect$()
        : of(undefined);
      return preConnect$.pipe(
        switchMap(() => this.transport.connect$(baudRate)),
        switchMap((result) => {
          if ('error' in result) {
            console.error('Connection failed:', result.error);
            return of(false);
          }
          this.startReadStreamSubscription();
          this.connectionEpoch += 1;
          this.shellReadiness.reset();
          this.connectionEstablished.next();
          return of(true);
        }),
        catchError((error) => {
          console.error('Connection error:', error);
          return of(false);
        })
      );
    });
  }

  /**
   * Serial ポートに接続
   *
   * @param baudRate ボーレート (デフォルト: 115200)
   * @returns 接続成功の場合 true、失敗の場合 false
   */
  async connect(baudRate = 115200): Promise<boolean> {
    return firstValueFrom(this.connect$(baudRate));
  }

  private startReadStreamSubscription(): void {
    this.command.startReadLoop();
  }

  /**
   * Serial ポートから切断（Observable）
   */
  disconnect$(): Observable<void> {
    this.shellReadiness.reset();
    this.command.cancelAllCommands();
    this.command.stopReadLoop();
    return this.transport.disconnect$().pipe(
      catchError((error) => {
        console.error('Disconnect error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Serial ポートから切断
   */
  async disconnect(): Promise<void> {
    return firstValueFrom(this.disconnect$());
  }

  /**
   * データを書き込む（Observable）
   */
  write$(data: string): Observable<void> {
    if (!this.transport.isConnected()) {
      return throwError(() => new Error('Serial port not connected'));
    }
    return this.transport.write(data);
  }

  /**
   * データを書き込む
   */
  async write(data: string): Promise<void> {
    return firstValueFrom(this.write$(data));
  }

  /**
   * 1 チャンクだけ読み取る（Observable）
   */
  read$(): Observable<string> {
    if (!this.transport.isConnected()) {
      return throwError(() => new Error('Serial port not connected'));
    }
    return this.transport.getReadStream().pipe(take(1));
  }

  /**
   * 1回だけ読み取る
   */
  async read(): Promise<string> {
    return firstValueFrom(this.read$());
  }

  /**
   * 1回だけ文字列として読み取る
   */
  async readString(): Promise<string> {
    return this.read();
  }

  /**
   * コマンド実行（stdout 相当を返す）
   */
  async exec(cmd: string, options: SerialExecOptions): Promise<CommandResult> {
    const {
      prompt,
      timeout = SERIAL_TIMEOUT.DEFAULT,
      retry = 0,
    } = options;
    return this.command.exec(cmd, { prompt, timeout, retry });
  }

  /**
   * raw コマンド実行（改行制御が必要なケース向け）
   */
  async execRaw(
    cmdRaw: string,
    options: SerialExecOptions,
  ): Promise<CommandResult> {
    const {
      prompt,
      timeout = SERIAL_TIMEOUT.DEFAULT,
      retry = 0,
    } = options;
    return this.command.execRaw(cmdRaw, { prompt, timeout, retry });
  }

  /**
   * 送信せずに prompt まで待機
   */
  async readUntilPrompt(options: SerialExecOptions): Promise<CommandResult> {
    const {
      prompt,
      timeout = SERIAL_TIMEOUT.DEFAULT,
      retry = 0,
    } = options;
    return this.command.readUntilPrompt({ prompt, timeout, retry });
  }

  /** 現在のシリアル接続セッション番号（切断後も値は保持され、次回接続で増える） */
  getConnectionEpoch(): number {
    return this.connectionEpoch;
  }

  isConnected(): boolean {
    return this.transport.isConnected();
  }

  /**
   * 読み取り中かどうか（ストリーム購読中は true）
   */
  isReading(): boolean {
    return this.command.isReading();
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
}
