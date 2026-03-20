import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Injectable({ providedIn: 'root' })
export class FileRenameService {
  private serial = inject(SerialFacadeService);

  async rename(oldPath: string, newPath: string): Promise<void> {
    const oldEscaped = FileUtils.escapePath(oldPath);
    const newEscaped = FileUtils.escapePath(newPath);
    await this.serial.exec(
      `mv -- ${oldEscaped} ${newEscaped}`,
      PI_ZERO_PROMPT,
      10000
    );
  }
}
