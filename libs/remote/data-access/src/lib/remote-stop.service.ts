import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Injectable({ providedIn: 'root' })
export class RemoteStopService {
  private serial = inject(SerialFacadeService);
  private readonly prompt = PI_ZERO_PROMPT;

  async stopAll(): Promise<void> {
    await this.serial.exec('forever stopall', this.prompt, 120000, 0);
  }
}

