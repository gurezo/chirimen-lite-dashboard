import { Injectable } from '@angular/core';
import { catchError, finalize, from, map, Observable, throwError } from 'rxjs';
import {
  WEB_SERIAL_ERROR_PORT_ALERADY_OPEN,
  WEB_SERIAL_ERROR_PORT_NO_SELECTED,
  WEB_SERIAL_ERROR_PORT_OPEN_FAIL,
  WEB_SERIAL_ERROR_PORT_WRITABLE_FAIL,
  WEB_SERIAL_ERROR_UNKNOWN,
  WEB_SERIAL_IS_NOT_RASPBEYY_PI_ZERO,
  WEB_SERIAL_OPEN_SUCCESS,
  WEB_SERIAL_PORT_WRITABLE_SUCCESS,
} from '../../constants';
import { isRaspberryPiZero } from '../../functions';

@Injectable({
  providedIn: 'root',
})
export class WebSerialService {
  private port: SerialPort | null;
  private writer: WritableStreamDefaultWriter | null = null;
  private encoder = new TextEncoderStream();

  constructor() {
    this.port = null;
  }

  async connect(): Promise<string> {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      const isPiZero = await isRaspberryPiZero(this.port);

      if (isPiZero) {
        this.configPortWriter();
        return WEB_SERIAL_OPEN_SUCCESS;
      } else {
        return WEB_SERIAL_IS_NOT_RASPBEYY_PI_ZERO;
      }
    } catch (error) {
      return this.connectError(error);
    }
  }

  configPortWriter() {
    try {
      if (this.port == null || this.port.writable == null) {
        return WEB_SERIAL_ERROR_PORT_WRITABLE_FAIL;
      } else {
        this.writer = this.encoder.writable.getWriter();
        this.encoder.readable.pipeTo(this.port.writable);
        return WEB_SERIAL_PORT_WRITABLE_SUCCESS;
      }
    } catch (error) {
      throw error;
    }
  }

  connectError(error: unknown): string {
    if (error instanceof DOMException) {
      switch (error.message) {
        case WEB_SERIAL_ERROR_PORT_NO_SELECTED:
          return WEB_SERIAL_ERROR_PORT_NO_SELECTED;
        case WEB_SERIAL_ERROR_PORT_ALERADY_OPEN:
          return WEB_SERIAL_ERROR_PORT_ALERADY_OPEN;
        case WEB_SERIAL_ERROR_PORT_OPEN_FAIL:
          return WEB_SERIAL_ERROR_PORT_OPEN_FAIL;
        default:
          return WEB_SERIAL_ERROR_UNKNOWN;
      }
    } else {
      return WEB_SERIAL_ERROR_UNKNOWN;
    }
  }

  async disConnect() {
    try {
      if (this.writer) {
        await this.writer.releaseLock();
      }
      await this.port?.close();
    } catch (error) {}
  }

  sendData(data: string): Observable<void> {
    if (!this.port) {
      return throwError(() => new Error('Serial port not connected'));
    }

    if (!this.writer) {
      return throwError(() => new Error('Serial port not connected'));
    }

    return from(this.writer?.write(data)).pipe(
      finalize(() => this.writer?.close()),
      map(() => {
        // todo
      }),
      catchError((error) => {
        console.error('Error sending data:', error);
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
