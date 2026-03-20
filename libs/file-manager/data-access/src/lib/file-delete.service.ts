import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';

@Injectable({ providedIn: 'root' })
export class FileDeleteService {
  private serial = inject(SerialFacadeService);

  async deleteFile(path: string): Promise<void> {
    const prompt = 'pi@raspberrypi:';
    const escaped = FileUtils.escapePath(path);
    await this.serial.exec(`rm -- ${escaped}`, prompt, 10000);
  }
}
