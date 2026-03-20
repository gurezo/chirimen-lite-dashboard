import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';

@Injectable({ providedIn: 'root' })
export class FileCreateService {
  private serial = inject(SerialFacadeService);

  async mkdir(path: string): Promise<void> {
    const prompt = 'pi@raspberrypi:';
    const escaped = FileUtils.escapePath(path);
    await this.serial.exec(`mkdir -p -- ${escaped}`, prompt, 10000);
  }

  async touch(path: string): Promise<void> {
    const prompt = 'pi@raspberrypi:';
    const escaped = FileUtils.escapePath(path);
    await this.serial.exec(`touch -- ${escaped}`, prompt, 10000);
  }
}
