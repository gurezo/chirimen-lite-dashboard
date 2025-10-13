import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '../serial/serial-facade.service';

/**
 * ファイル属性情報
 */
export interface FileAttributes {
  permissions: string;
  owner: string;
  group: string;
  size: number;
  modifiedTime: Date;
  path: string;
}

/**
 * ファイルメタデータサービス
 *
 * ファイルのメタデータ（サイズ、権限、更新日時など）の取得を担当
 * porting/services/file-operation.service.ts から分離
 */
@Injectable({
  providedIn: 'root',
})
export class FileMetadataService {
  private serial = inject(SerialFacadeService);

  /**
   * ファイルのサイズを取得
   *
   * @param path ファイルパス
   * @returns サイズ（バイト）
   */
  async getFileSize(path: string): Promise<number> {
    try {
      const result = await this.serial.executeCommand(
        `stat --format=%s -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      const size = parseInt(result.trim(), 10);
      return isNaN(size) ? 0 : size;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file size: ${errorMessage}`);
    }
  }

  /**
   * ファイルの最終更新日時を取得
   *
   * @param path ファイルパス
   * @returns 最終更新日時
   */
  async getFileModificationTime(path: string): Promise<Date> {
    try {
      const result = await this.serial.executeCommand(
        `stat --format=%Y -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      const timestamp = parseInt(result.trim(), 10);
      return new Date(timestamp * 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file modification time: ${errorMessage}`);
    }
  }

  /**
   * ファイルの属性を取得
   *
   * @param path ファイルパス
   * @returns ファイル属性情報
   */
  async getFileAttributes(path: string): Promise<FileAttributes> {
    try {
      const result = await this.serial.executeCommand(
        `stat --format="%a %U %G %s %Y %n" -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      const parts = result.trim().split(/\s+/);

      return {
        permissions: parts[0],
        owner: parts[1],
        group: parts[2],
        size: parseInt(parts[3], 10),
        modifiedTime: new Date(parseInt(parts[4], 10) * 1000),
        path: parts.slice(5).join(' '),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file attributes: ${errorMessage}`);
    }
  }

  /**
   * ファイルの詳細情報を表示（ls -la形式）
   *
   * @param path ファイルパス
   * @returns 詳細情報の文字列
   */
  async showFileDetails(path: string): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        `ls -la -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to show file details: ${errorMessage}`);
    }
  }

  /**
   * ファイルのMIMEタイプを取得
   *
   * @param path ファイルパス
   * @returns MIMEタイプ
   */
  async getFileMimeType(path: string): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        `file --mime-type -b -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return result.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file MIME type: ${errorMessage}`);
    }
  }

  /**
   * ファイルのチェックサムを取得（MD5）
   *
   * @param path ファイルパス
   * @returns MD5チェックサム
   */
  async getFileMd5(path: string): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        `md5sum -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return result.split(/\s+/)[0];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file MD5: ${errorMessage}`);
    }
  }

  /**
   * ファイルのチェックサムを取得（SHA256）
   *
   * @param path ファイルパス
   * @returns SHA256チェックサム
   */
  async getFileSha256(path: string): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        `sha256sum -- ${this.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return result.split(/\s+/)[0];
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file SHA256: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリのディスク使用量を取得
   *
   * @param path ディレクトリパス
   * @returns 使用量（バイト）
   */
  async getDirectorySize(path: string): Promise<number> {
    try {
      const result = await this.serial.executeCommand(
        `du -sb ${this.escapePath(path)} | cut -f1`,
        'pi@raspberrypi:',
        10000
      );

      const size = parseInt(result.trim(), 10);
      return isNaN(size) ? 0 : size;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get directory size: ${errorMessage}`);
    }
  }

  /**
   * パスをエスケープ
   */
  private escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }
}
