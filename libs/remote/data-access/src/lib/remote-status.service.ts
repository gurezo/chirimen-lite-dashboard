import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { PI_ZERO_PROMPT, SERIAL_TIMEOUT } from '@libs-web-serial-util';

@Injectable({ providedIn: 'root' })
export class RemoteStatusService {
  private serial = inject(SerialFacadeService);
  private readonly prompt = PI_ZERO_PROMPT;

  async listPlain(): Promise<string> {
    return (
      await this.serial.exec('forever list --plain', {
        prompt: this.prompt,
        timeout: SERIAL_TIMEOUT.FILE_TRANSFER,
      })
    ).stdout;
  }
}
