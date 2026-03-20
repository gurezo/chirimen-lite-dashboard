import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { firstValueFrom } from 'rxjs';

/**
 * WiFi 再起動・有効/無効のフローを担当
 */
@Injectable({
  providedIn: 'root',
})
export class WifiRebootFlowService {
  private serial = inject(SerialFacadeService);
  private readonly defaultPrompt = 'pi@raspberrypi:';

  private async run(command: string, timeout: number): Promise<string> {
    const result = await firstValueFrom(
      this.serial.exec(command, {
        prompt: this.defaultPrompt,
        timeout,
      })
    );
    return result.stdout;
  }

  /**
   * WiFi サービスを再起動（wpa_supplicant + networking）
   */
  async restartWifiService(): Promise<void> {
    try {
      await this.run('sudo systemctl restart wpa_supplicant', 10000);

      await this.run('sudo systemctl restart networking', 10000);
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
      await this.run('sudo ifconfig wlan0 up', 10000);
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
      await this.run('sudo ifconfig wlan0 down', 10000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to disable WiFi: ${errorMessage}`);
    }
  }
}
