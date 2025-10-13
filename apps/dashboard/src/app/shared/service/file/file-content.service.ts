import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '../serial/serial-facade.service';

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
        `base64 -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        30000
      );

      const lines = result.split('\n').map((line) => line.trim());
      let content = '';

      // 最初と最後の行を除いて内容を結合
      for (let i = 1; i < lines.length - 1; i++) {
        content += lines[i];
      }

      const buffer = this.base64ToArrayBuffer(content);
      const isText = this.isTextFile(path);

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
      const command = this.generateHeredocCommand(path, content);
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
      const base64 = this.arrayBufferToBase64(buffer);

      // Ctrl+C でフォアグラウンドプロセスを停止
      await this.serial.write('\x03');
      await this.sleep(100);

      // base64 デコードコマンドを実行
      await this.serial.executeCommand(
        `base64 -d > ${this.escapePath(path)}`,
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
      const command = this.generateAppendCommand(path, content);
      await this.serial.executeCommand(command, 'EOL', 10000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to append to file: ${errorMessage}`);
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * テキストファイルかどうかを判定
   */
  private isTextFile(path: string): boolean {
    const TEXT_FILE_EXTENSIONS = [
      '.txt',
      '.sh',
      '.csv',
      '.tsv',
      '.js',
      '.conf',
      '.mjs',
      '.md',
      '.yml',
      '.xml',
      '.html',
      '.htm',
      '.json',
      '.py',
      '.php',
      '.log',
      '.ts',
      '.tsx',
    ];

    const lastSlashIndex = path.lastIndexOf('/');
    const fileName =
      lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return true; // 拡張子がない、または隠しファイル
    }

    const extension = fileName.substring(lastDotIndex);
    return TEXT_FILE_EXTENSIONS.includes(extension);
  }

  /**
   * ArrayBuffer を Base64 に変換
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Base64 を ArrayBuffer に変換
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * ヒアドキュメントコマンドを生成（書き込み用）
   */
  private generateHeredocCommand(fileName: string, content: string): string {
    return `cat > ${this.escapePath(fileName)} << 'EOL'\n${content}\nEOL`;
  }

  /**
   * ヒアドキュメントコマンドを生成（追記用）
   */
  private generateAppendCommand(fileName: string, content: string): string {
    return `cat >> ${this.escapePath(fileName)} << 'EOL'\n${content}\nEOL`;
  }

  /**
   * パスをエスケープ
   */
  private escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }

  /**
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
