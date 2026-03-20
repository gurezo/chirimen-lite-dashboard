import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';

@Injectable({ providedIn: 'root' })
export class FileMoveService {
  private serial = inject(SerialFacadeService);

  async move(srcPath: string, destPath: string): Promise<void> {
    const prompt = 'pi@raspberrypi:';
    const srcEscaped = FileUtils.escapePath(srcPath);
    const destEscaped = FileUtils.escapePath(destPath);
    await this.serial.exec(`mv -- ${srcEscaped} ${destEscaped}`, prompt, 10000);
  }
}
