import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';

@Injectable({ providedIn: 'root' })
export class RemoteStatusService {
  private serial = inject(SerialFacadeService);
  private readonly prompt = 'pi@raspberrypi:';

  async listPlain(): Promise<string> {
    return (
      await this.serial.exec('forever list --plain', this.prompt, 60000, 0)
    ).stdout;
  }
}

