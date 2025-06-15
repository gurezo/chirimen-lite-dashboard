/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';
import { WEB_SERIAL_MESSAGES } from '../../shared/constants';
import { isRaspberryPiZero } from '../functions';
import { WebSerialReader } from './web-serial.reader';
import { WebSerialWriter } from './web-serial.write';

@Injectable({
  providedIn: 'root',
})
export class WebSerialService {
  private port: SerialPort | undefined;
  private reader: WebSerialReader | null = null;
  private writer: WebSerialWriter | null = null;

  async connect(): Promise<string> {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      const isPiZero = await isRaspberryPiZero(this.port);

      if (isPiZero) {
        this.reader = new WebSerialReader(this.port);
        this.writer = new WebSerialWriter(this.port);

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

  async startReading(onData: (data: string) => void): Promise<void> {
    if (!this.reader) throw new Error('SerialReader not initialized');
    await this.reader.start(onData);
  }

  async send(data: string): Promise<void> {
    if (!this.writer) throw new Error('SerialWriter not initialized');
    await this.writer.write(data);
  }

  async disConnect() {
    try {
      await this.port?.close();
    } catch (error) {
      console.error('Error port close:', error);
    }
  }
}
