import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';
import { FileTreeNode, parseLsOutput } from '@libs-file-manager-util';

@Injectable({ providedIn: 'root' })
export class FileListService {
  private serial = inject(SerialFacadeService);

  /**
   * ディレクトリ直下の ls 出力（行単位）を返します。
   */
  async listFiles(directoryPath: string): Promise<string[]> {
    const dir = directoryPath || '.';
    const escaped = FileUtils.escapePath(dir);

    const stdout = (
      await this.serial.exec(
        `ls -al --quoting-style=c -- ${escaped}`,
        PI_ZERO_PROMPT,
        30000
      )
    ).stdout;

    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  /**
   * ディレクトリ直下をツリー表示向けに整形して返します。
   */
  async list(path: string): Promise<FileTreeNode[]> {
    const lines = await this.listFiles(path);
    return parseLsOutput(lines, path);
  }
}
