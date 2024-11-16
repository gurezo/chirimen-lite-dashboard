import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { SerialPort as SerialPortPolyfill } from 'web-serial-polyfill';
import {
  WEB_SERIAL_ERROR_PORT_ALERADY_CONNECTED,
  WEB_SERIAL_ERROR_PORT_NO_SELECTED,
  WEB_SERIAL_ERROR_UNKNOWN,
  WEB_SERIAL_IS_NOT_RASPBEYY_PI_ZERO,
  WEB_SERIAL_OPEN_SUCCESS,
} from '../../constants';
import { isRaspberryPiZero } from '../../functions';

@Injectable({
  providedIn: 'root',
})
export class WebSerialService {
  private port: SerialPort | SerialPortPolyfill | undefined;

  async connect(): Promise<string> {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      // 選択されたポートが Raspberry Pi Zero かどうかを判定
      const isPiZero = await isRaspberryPiZero(this.port);

      if (isPiZero) {
        alert('OK!!! 接続されたデバイスは Raspberry Pi Zero です。');
        return WEB_SERIAL_OPEN_SUCCESS;
      } else {
        alert('NG!!! 接続されたデバイスは Raspberry Pi Zero ではありません。');
        return WEB_SERIAL_IS_NOT_RASPBEYY_PI_ZERO;
      }
    } catch (error) {
      return this.connectError(error);
    }
  }

  connectError(error: unknown): string {
    if (error instanceof DOMException) {
      switch (error.message) {
        case WEB_SERIAL_ERROR_PORT_NO_SELECTED:
          alert('NG!!! ポートが選択されていません。');
          return WEB_SERIAL_ERROR_PORT_NO_SELECTED;
        case WEB_SERIAL_ERROR_PORT_ALERADY_CONNECTED:
          alert('NG!!! Raspberry Pi Zero が接続されたままです。');
          return WEB_SERIAL_ERROR_PORT_ALERADY_CONNECTED;
        default:
          alert('NG!!! 原因不明のエラーです。');
          return WEB_SERIAL_ERROR_UNKNOWN;
      }
    } else {
      alert('NG!!! 原因不明のエラーです。');
      return WEB_SERIAL_ERROR_UNKNOWN;
    }
  }

  sendData(data: string): Observable<void> {
    if (!this.port) {
      return throwError(() => new Error('Serial port not connected'));
    }

    const encoder = new TextEncoder();
    const writer = this.port.writable?.getWriter();
    if (!writer) {
      return throwError(() => new Error('Serial port not connected'));
    }

    return from(writer.write(encoder.encode(data))).pipe(
      map(() => {
        writer.releaseLock();
      }),
      catchError((error) => {
        console.error('Error sending data:', error);
        writer.releaseLock();
        return throwError(() => error);
      }),
    );
  }

  readData(): Observable<string> {
    if (!this.port) {
      return throwError(() => new Error('Serial port not connected'));
    }

    const reader = this.port.readable?.getReader();
    const decoder = new TextDecoder();
    if (!reader) {
      return throwError(() => new Error('Serial port not connected'));
    }

    return new Observable<string>((observer) => {
      const readChunk = () => {
        reader
          .read()
          .then(({ value, done }) => {
            if (done) {
              observer.complete();
              return;
            }
            const chunk = decoder.decode(value);
            observer.next(chunk);
            readChunk();
          })
          .catch((error) => {
            observer.error(error);
          });
      };

      readChunk();

      return () => {
        reader.releaseLock();
      };
    });
  }
}
