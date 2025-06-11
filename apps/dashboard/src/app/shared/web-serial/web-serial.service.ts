/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, throwError } from 'rxjs';
import { WEB_SERIAL_MESSAGES } from '../../shared/constants';
import { isRaspberryPiZero } from '../functions';

@Injectable({
  providedIn: 'root',
})
export class WebSerialService {
  private port: SerialPort | undefined;

  async connect(): Promise<string> {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      const isPiZero = await isRaspberryPiZero(this.port);

      if (isPiZero) {
        return WEB_SERIAL_MESSAGES.OPEN_SUCCESS;
      } else {
        return WEB_SERIAL_MESSAGES.IS_NOT_RASPBERRY_PI_ZERO;
      }
    } catch (error) {
      return this.connectError(error);
    }
  }

  connectError(error: unknown): string {
    if (error instanceof DOMException) {
      switch (error.message) {
        case WEB_SERIAL_MESSAGES.ERROR_PORT_NO_SELECTED:
          return WEB_SERIAL_MESSAGES.ERROR_PORT_NO_SELECTED;
        case WEB_SERIAL_MESSAGES.ERROR_PORT_ALREADY_OPEN:
          return WEB_SERIAL_MESSAGES.ERROR_PORT_ALREADY_OPEN;
        case WEB_SERIAL_MESSAGES.ERROR_PORT_OPEN_FAIL:
          return WEB_SERIAL_MESSAGES.ERROR_PORT_OPEN_FAIL;
        default:
          return WEB_SERIAL_MESSAGES.ERROR_UNKNOWN;
      }
    } else {
      return WEB_SERIAL_MESSAGES.ERROR_UNKNOWN;
    }
  }

  async disConnect() {
    try {
      await this.port?.close();
    } catch (error) {
      console.error('Error port close:', error);
    }
  }

  send(data: string): Observable<void> {
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
      })
    );
  }

  read(): Observable<string> {
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
