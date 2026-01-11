import { Injectable } from '@angular/core';
import {
  SerialError,
  SerialErrorCode,
} from '@gurezo/web-serial-rxjs';

/**
 * Serial 接続エラーのハンドリングサービス
 * エラーの解析とメッセージ変換を担当
 */
@Injectable({
  providedIn: 'root',
})
export class SerialErrorHandlerService {
  /**
   * 接続エラーを解析してエラーメッセージを返す
   * @param error エラーオブジェクト
   * @returns エラーメッセージ
   */
  handleConnectionError(error: unknown): string {
    if (error instanceof SerialError) {
      return this.getErrorMessage(error.code);
    }

    if (error instanceof DOMException) {
      return this.parseDOMException(error);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }

  /**
   * SerialErrorCode に基づいてエラーメッセージを返す
   * @param code SerialErrorCode
   * @returns エラーメッセージ
   */
  private getErrorMessage(code: SerialErrorCode): string {
    switch (code) {
      case SerialErrorCode.OPERATION_CANCELLED:
        return "Failed to execute 'requestPort' on 'Serial': No port selected by the user.";
      case SerialErrorCode.PORT_ALREADY_OPEN:
        return "Failed to execute 'open' on 'SerialPort': The port is already open.";
      case SerialErrorCode.PORT_OPEN_FAILED:
        return '接続に失敗しました';
      case SerialErrorCode.PORT_NOT_AVAILABLE:
        return 'サポートされていないデバイスです。Raspberry Pi Zero以外のデバイスは接続できません。';
      case SerialErrorCode.READ_FAILED:
        return 'Read error: Failed to read from serial port';
      case SerialErrorCode.WRITE_FAILED:
        return 'Write error: Failed to write to serial port';
      case SerialErrorCode.CONNECTION_LOST:
        return '接続が切断されました';
      case SerialErrorCode.PORT_NOT_OPEN:
        return 'シリアルポートが開かれていません';
      default:
        return 'Unknown error';
    }
  }

  /**
   * DOMException を解析してエラーメッセージを返す
   * @param error DOMException
   * @returns エラーメッセージ
   */
  private parseDOMException(error: DOMException): string {
    const message = error.message;
    if (message.includes('No port selected')) {
      return "Failed to execute 'requestPort' on 'Serial': No port selected by the user.";
    }
    if (message.includes('already open')) {
      return "Failed to execute 'open' on 'SerialPort': The port is already open.";
    }
    if (message.includes('Failed to open')) {
      return "Failed to execute 'open' on 'SerialPort': Failed to open serial port.";
    }
    return message || 'Unknown error';
  }

  /**
   * Raspberry Pi Zero 検証エラーメッセージを返す
   * @returns エラーメッセージ
   */
  getRaspberryPiZeroError(): string {
    return 'Web Serial is not Raspberry Pi Zero';
  }

  /**
   * 読み取りエラーを解析してエラーメッセージを返す
   * @param error エラーオブジェクト
   * @returns エラーメッセージ
   */
  handleReadError(error: unknown): string {
    if (error instanceof SerialError) {
      return this.getErrorMessage(error.code);
    }
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
    if (error instanceof SerialError) {
      return this.getErrorMessage(error.code);
    }
    if (error instanceof Error) {
      return `Write error: ${error.message}`;
    }
    return 'Unknown write error';
  }
}
