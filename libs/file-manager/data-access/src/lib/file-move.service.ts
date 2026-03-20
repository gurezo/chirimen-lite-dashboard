import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Injectable({ providedIn: 'root' })
export class FileMoveService {
  private serial = inject(SerialFacadeService);

  async move(srcPath: string, destPath: string): Promise<void> {
    const srcEscaped = FileUtils.escapePath(srcPath);
    const destEscaped = FileUtils.escapePath(destPath);
    await this.serial.exec(
      `mv -- ${srcEscaped} ${destEscaped}`,
      PI_ZERO_PROMPT,
      10000
    );
  }
}
