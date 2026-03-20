import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { FileUtils } from '@libs-wifi-util';
import { firstValueFrom } from 'rxjs';

/**
 * ファイル内容情報
 */
export interface FileContentInfo {
  content: string | ArrayBuffer;
  isText: boolean;
  size: number;
  encoding?: string;
}

/**
 * ファイルコンテンツサービス
 *
 * ファイルの読み書きを担当（WiFi 設定等で利用）
 */
@Injectable({
  providedIn: 'root',
})
export class FileContentService {
  private serial = inject(SerialFacadeService);
  private readonly defaultPrompt = 'pi@raspberrypi:';

  private async run(command: string, prompt: string, timeout: number): Promise<string> {
    const result = await firstValueFrom(
      this.serial.exec(command, {
        prompt,
        timeout,
      })
    );
    return result.stdout;
  }

  async readFile(path: string): Promise<FileContentInfo> {
    try {
      const result = await this.run(
        `base64 -- ${FileUtils.escapePath(path)}`,
        this.defaultPrompt,
        30000
      );

      const lines = result.split('\n').map((line) => line.trim());
      let content = '';

      for (let i = 1; i < lines.length - 1; i++) {
        content += lines[i];
      }

      const buffer = FileUtils.base64ToArrayBuffer(content);
      const isText = FileUtils.isTextFile(path);

      if (isText) {
        const textContent = new TextDecoder().decode(new Uint8Array(buffer));
        return {
          content: textContent,
          isText: true,
          size: textContent.length,
          encoding: 'utf-8',
        };
      } else {
        return {
          content: buffer,
          isText: false,
          size: buffer.byteLength,
        };
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read file: ${errorMessage}`);
    }
  }

  async writeTextFile(path: string, content: string): Promise<void> {
    try {
      const command = FileUtils.generateHeredocCommand(path, content);
      await this.run(command, 'EOL', 10000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to write text file: ${errorMessage}`);
    }
  }

  async writeBinaryFile(path: string, buffer: ArrayBuffer): Promise<void> {
    try {
      const base64 = FileUtils.arrayBufferToBase64(buffer);

      await this.serial.write('\x03');
      await this.sleep(100);

      await this.run(
        `base64 -d > ${FileUtils.escapePath(path)}`,
        '\n',
        10000
      );

      const lineLength = 512;
      for (let i = 0; i <= Math.floor(base64.length / lineLength); i++) {
        const line = base64.substring(i * lineLength, (i + 1) * lineLength);
        await this.run(line, '\n', 1000);
        await this.sleep(1);
      }

      await this.serial.write('\x04');
      await this.sleep(10);
      await this.run('', '\\$', 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to write binary file: ${errorMessage}`);
    }
  }

  async appendToFile(path: string, content: string): Promise<void> {
    try {
      const command = FileUtils.generateAppendCommand(path, content);
      await this.run(command, 'EOL', 10000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to append to file: ${errorMessage}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
