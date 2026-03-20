import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';

/**
 * WiFi 再起動・有効/無効のフローを担当
 */
@Injectable({
  providedIn: 'root',
})
export class WifiRebootFlowService {
  private serial = inject(SerialFacadeService);

  /**
   * WiFi サービスを再起動（wpa_supplicant + networking）
   */
  async restartWifiService(): Promise<void> {
    try {
      await this.serial.exec(
        'sudo systemctl restart wpa_supplicant',
        'pi@raspberrypi:',
        10000
      );

      await this.serial.exec(
        'sudo systemctl restart networking',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to restart WiFi service: ${errorMessage}`);
    }
  }

  /**
   * WiFi を有効化
   */
  async enableWifi(): Promise<void> {
    try {
      await this.serial.exec(
        'sudo ifconfig wlan0 up',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to enable WiFi: ${errorMessage}`);
    }
  }

  /**
   * WiFi を無効化
   */
  async disableWifi(): Promise<void> {
    try {
      await this.serial.exec(
        'sudo ifconfig wlan0 down',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to disable WiFi: ${errorMessage}`);
    }
  }
}
