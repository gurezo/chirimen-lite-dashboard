import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@dashboard/serial';
import { FileUtils } from '@dashboard/utils';

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
 * ファイルの読み書きを担当（検索、head/tail等は FileSearchService に分離）
 * porting/services/file-content.service.ts からリファクタリング
 */
@Injectable({
  providedIn: 'root',
})
export class FileContentService {
  private serial = inject(SerialFacadeService);

  /**
   * ファイルの内容を取得
   *
   * @param path ファイルパス
   * @returns ファイル内容情報
   */
  async readFile(path: string): Promise<FileContentInfo> {
    try {
      const result = await this.serial.executeCommand(
        `base64 -- ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        30000
      );

      const lines = result.split('\n').map((line) => line.trim());
      let content = '';

      // 最初と最後の行を除いて内容を結合
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

  /**
   * テキストファイルの内容を書き込む
   *
   * @param path ファイルパス
   * @param content ファイル内容
   */
  async writeTextFile(path: string, content: string): Promise<void> {
    try {
      const command = FileUtils.generateHeredocCommand(path, content);
      await this.serial.executeCommand(command, 'EOL', 10000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to write text file: ${errorMessage}`);
    }
  }

  /**
   * バイナリファイルを書き込む
   *
   * @param path ファイルパス
   * @param buffer バイナリデータ
   */
  async writeBinaryFile(path: string, buffer: ArrayBuffer): Promise<void> {
    try {
      const base64 = FileUtils.arrayBufferToBase64(buffer);

      // Ctrl+C でフォアグラウンドプロセスを停止
      await this.serial.write('\x03');
      await this.sleep(100);

      // base64 デコードコマンドを実行
      await this.serial.executeCommand(
        `base64 -d > ${FileUtils.escapePath(path)}`,
        '\n',
        10000
      );

      // データを送信
      const lineLength = 512;
      for (let i = 0; i <= Math.floor(base64.length / lineLength); i++) {
        const line = base64.substring(i * lineLength, (i + 1) * lineLength);
        await this.serial.executeCommand(line, '\n', 1000);
        await this.sleep(1);
      }

      // Ctrl+D で入力終了
      await this.serial.write('\x04');
      await this.sleep(10);
      await this.serial.executeCommand('', '\\$', 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to write binary file: ${errorMessage}`);
    }
  }

  /**
   * ファイルに内容を追記
   *
   * @param path ファイルパス
   * @param content 追記する内容
   */
  async appendToFile(path: string, content: string): Promise<void> {
    try {
      const command = FileUtils.generateAppendCommand(path, content);
      await this.serial.executeCommand(command, 'EOL', 10000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to append to file: ${errorMessage}`);
    }
  }

  /**
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

