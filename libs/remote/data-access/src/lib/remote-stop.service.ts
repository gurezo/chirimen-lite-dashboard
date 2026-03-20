import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';

@Injectable({ providedIn: 'root' })
export class RemoteStopService {
  private serial = inject(SerialFacadeService);
  private readonly prompt = 'pi@raspberrypi:';

  async stopAll(): Promise<void> {
    await this.serial.exec('forever stopall', this.prompt, 120000, 0);
  }
}

