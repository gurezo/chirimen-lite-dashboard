/// <reference types="@types/w3c-web-serial" />

import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WEB_SERIAL } from '../../constants';
import {
  SerialConnectionService,
  SerialErrorHandlerService,
  SerialReaderService,
  SerialValidatorService,
  SerialWriterService,
} from '../../service/serial';

/**
 * WebSerialService (Legacy Adapter)
 *
 * このサービスは後方互換性のために残されています。
 * 内部では新しいサービス群を使用していますが、古いインターフェースを維持しています。
 *
 * @deprecated 新しいコードでは SerialConnectionService, SerialReaderService, SerialWriterService を直接使用してください。
 */
@Injectable({
  providedIn: 'root',
})
export class WebSerialService {
  private connection = inject(SerialConnectionService);
  private reader = inject(SerialReaderService);
  private writer = inject(SerialWriterService);
  private validator = inject(SerialValidatorService);
  private errorHandler = inject(SerialErrorHandlerService);

  private portSuccess = WEB_SERIAL.PORT.SUCCESS;

  async connect(): Promise<string> {
    const result = await this.connection.connect();

    if ('error' in result) {
      return result.error;
    }

    const { port } = result;

    // デバイス検証
    const isValid = await this.validator.isSupportedDevice(port);
    if (!isValid) {
      await this.connection.disconnect();
      return this.errorHandler.getRaspberryPiZeroError();
    }

    // Writer を初期化
    this.writer.initialize(port);

    // Reader を開始
    this.reader.startReading(port);

    return this.portSuccess.OPEN;
  }

  connectError(error: unknown): string {
    return this.errorHandler.handleConnectionError(error);
  }

  async read(): Promise<string> {
    if (!this.reader.isActive()) {
      throw new Error('SerialReader not initialized');
    }
    // Observable から最初の値を取得
    return await firstValueFrom(this.reader.data$);
  }

  async send(data: string): Promise<void> {
    if (!this.writer.isReady()) {
      throw new Error('SerialWriter not initialized');
    }
    await this.writer.write(data);
  }

  async disConnect() {
    try {
      await this.reader.stopReading();
      this.writer.dispose();
      await this.connection.disconnect();
    } catch (error) {
      console.error('Error port close:', error);
    }
  }
}
