import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';

@Injectable({ providedIn: 'root' })
export class ExtraSetupService {
  private serial = inject(SerialFacadeService);
  private readonly prompt = 'pi@raspberrypi:';

  async apply(): Promise<void> {
    // Issue #412 に記載されているデバイス側の追加設定（最小セット）
    const cmds: string[] = [
      'sudo timedatectl set-timezone Asia/Tokyo || true',
      'sudo raspi-config nonint do_camera 0 || true',
      'sudo raspi-config nonint do_legacy 0 || true',
    ];

    for (const cmd of cmds) {
      try {
        await this.serial.exec(cmd, this.prompt, 60000, 0);
      } catch {
        // best-effort
      }
    }
  }
}
