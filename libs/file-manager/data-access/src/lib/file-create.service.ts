import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Injectable({ providedIn: 'root' })
export class FileCreateService {
  private serial = inject(SerialFacadeService);

  async mkdir(path: string): Promise<void> {
    const escaped = FileUtils.escapePath(path);
    await this.serial.exec(`mkdir -p -- ${escaped}`, PI_ZERO_PROMPT, 10000);
  }

  async touch(path: string): Promise<void> {
    const escaped = FileUtils.escapePath(path);
    await this.serial.exec(`touch -- ${escaped}`, PI_ZERO_PROMPT, 10000);
  }
}
