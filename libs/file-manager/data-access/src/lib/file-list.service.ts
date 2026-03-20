import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';

@Injectable({ providedIn: 'root' })
export class FileListService {
  private serial = inject(SerialFacadeService);

  /**
   * ディレクトリ直下の ls 出力（行単位）を返します。
   */
  async listFiles(directoryPath: string): Promise<string[]> {
    const prompt = 'pi@raspberrypi:';
    const dir = directoryPath || '.';
    const escaped = FileUtils.escapePath(dir);

    const stdout = (
      await this.serial.exec(
        `ls -al --quoting-style=c -- ${escaped}`,
        prompt,
        30000
      )
    ).stdout;

    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
}
