/// <reference types="@types/w3c-web-serial" />

import { Injectable } from '@angular/core';
import { WEB_SERIAL } from '../../shared/constants';
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
  private portError = WEB_SERIAL.PORT.ERROR;
  private portSuccess = WEB_SERIAL.PORT.SUCCESS;
  private raspberryPi = WEB_SERIAL.RASPBERRY_PI;

  async connect(): Promise<string> {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });

      const isPiZero = await isRaspberryPiZero(this.port);

      if (isPiZero) {
        this.reader = new WebSerialReader(this.port);
        this.writer = new WebSerialWriter(this.port);

        return this.portSuccess.OPEN;
      } else {
        return this.raspberryPi.IS_NOT_ZERO;
      }
    } catch (error) {
      return this.connectError(error);
    }
  }

  connectError(error: unknown): string {
    if (error instanceof DOMException) {
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
    } else {
      return this.portError.UNKNOWN;
    }
  }

  async read(): Promise<string> {
    if (!this.reader) throw new Error('SerialReader not initialized');
    return await this.reader.start();
  }

  async send(data: string): Promise<void> {
    if (!this.writer) throw new Error('SerialWriter not initialized');
    await this.writer.write(data);
  }

  async disConnect() {
    try {
      await this.reader?.stop();
      // await this.writer?.stop();
      await this.port?.close();
    } catch (error) {
      console.error('Error port close:', error);
    }
  }
}
