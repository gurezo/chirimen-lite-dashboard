import { Injectable } from '@angular/core';
import { WEB_SERIAL } from '../constants/web.serial.const';

/**
 * Serial 接続エラーのハンドリングサービス
 * エラーの解析とメッセージ変換を担当
 */
@Injectable({
  providedIn: 'root',
})
export class SerialErrorHandlerService {
  private portError = WEB_SERIAL.PORT.ERROR;
  private raspberryPi = WEB_SERIAL.RASPBERRY_PI;

  /**
   * 接続エラーを解析してエラーメッセージを返す
   * @param error エラーオブジェクト
   * @returns エラーメッセージ
   */
  handleConnectionError(error: unknown): string {
    if (error instanceof DOMException) {
      return this.parseDOMException(error);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return this.portError.UNKNOWN;
  }

  /**
   * DOMException を解析してエラーメッセージを返す
   * @param error DOMException
   * @returns エラーメッセージ
   */
  private parseDOMException(error: DOMException): string {
    switch (error.message) {
      case this.portError.NO_SELECTED:
        return this.portError.NO_SELECTED;
      case this.portError.PORT_ALREADY_OPEN:
        return this.portError.PORT_ALREADY_OPEN;
      case this.portError.PORT_OPEN_FAIL:
        return this.portError.PORT_OPEN_FAIL;
      default:
        return this.portError.UNKNOWN;
    }
  }

  /**
   * Raspberry Pi Zero 検証エラーメッセージを返す
   * @returns エラーメッセージ
   */
  getRaspberryPiZeroError(): string {
    return this.raspberryPi.IS_NOT_ZERO;
  }

  /**
   * 読み取りエラーを解析してエラーメッセージを返す
   * @param error エラーオブジェクト
   * @returns エラーメッセージ
   */
  handleReadError(error: unknown): string {
    if (error instanceof Error) {
      return `Read error: ${error.message}`;
    }
    return 'Unknown read error';
  }

  /**
   * 書き込みエラーを解析してエラーメッセージを返す
   * @param error エラーオブジェクト
   * @returns エラーメッセージ
   */
  handleWriteError(error: unknown): string {
    if (error instanceof Error) {
      return `Write error: ${error.message}`;
    }
    return 'Unknown write error';
  }
}
