import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@dashboard/serial';

/**
 * I2C デバイス検出サービス
 *
 * I2C デバイスの検出と情報取得を担当
 * ChirimenService から分離
 */
@Injectable({
  providedIn: 'root',
})
export class I2cdetectService {
  private serial = inject(SerialFacadeService);

  /**
   * I2C デバイスを検出
   *
   * @returns I2C デバイス情報（HTML形式）
   */
  async detectI2cDevices(): Promise<string> {
    try {
      const output = await this.serial.executeCommand(
        'i2cdetect -y 1',
        'pi@raspberrypi:',
        10000
      );

      const lines = output.split('\n');
      let result = '<pre><code>     ';

      for (let i = 1; i < lines.length - 1; i++) {
        result += lines[i] + '\n';
      }

      result += '</pre></code>';
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to detect I2C devices: ${errorMessage}`);
    }
  }

  /**
   * @deprecated Use detectI2cDevices() instead
   */
  async i2cdetect(): Promise<string> {
    return this.detectI2cDevices();
  }
}
