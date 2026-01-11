import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial';
import { FileListItem } from '../models/file-list.model';
import { ParserUtils } from '../utils/parser.utils';

/**
 * ファイルリストサービス
 *
 * ファイルやディレクトリのリスト取得を担当
 * porting/services/file.service.ts から移行
 */
@Injectable({
  providedIn: 'root',
})
export class FileListService {
  private serial = inject(SerialFacadeService);

  /**
   * 現在のディレクトリのファイルリストを取得
   *
   * @param path オプションのパス（指定しない場合はカレントディレクトリ）
   * @returns ファイルリスト
   */
  async listFiles(path?: string): Promise<FileListItem[]> {
    try {
      const command = path ? `ls -la ${this.escapePath(path)}` : 'ls -la';
      const output = await this.serial.executeCommand(
        command,
        'pi@raspberrypi:',
        10000
      );

      return ParserUtils.parseLsOutput(output);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to list files: ${errorMessage}`);
    }
  }

  /**
   * すべてのファイル情報を取得（レガシーメソッド）
   *
   * @deprecated Use listFiles() instead
   */
  async listAll(): Promise<{ files: FileListItem[] }> {
    const files = await this.listFiles();
    return { files };
  }

  /**
   * 指定パターンにマッチするファイルを検索
   *
   * @param pattern 検索パターン（例: "*.js"）
   * @param path 検索ディレクトリ（デフォルト: カレント）
   * @returns マッチしたファイルリスト
   */
  async findFiles(pattern: string, path?: string): Promise<FileListItem[]> {
    try {
      const searchPath = path || '.';
      const command = `find ${this.escapePath(
        searchPath
      )} -name "${pattern}" -ls`;
      const output = await this.serial.executeCommand(
        command,
        'pi@raspberrypi:',
        10000
      );

      return ParserUtils.parseLsOutput(output);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find files: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリツリーを取得
   *
   * @param path ルートパス
   * @param depth 探索する深さ（デフォルト: 2）
   * @returns ツリー構造の文字列
   */
  async getDirectoryTree(
    path = '.',
    depth = 2
  ): Promise<string> {
    try {
      const command = `tree -L ${depth} ${this.escapePath(path)}`;
      const output = await this.serial.executeCommand(
        command,
        'pi@raspberrypi:',
        10000
      );

      return output;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get directory tree: ${errorMessage}`);
    }
  }

  /**
   * ファイルが存在するかチェック
   *
   * @param path ファイルパス
   * @returns 存在する場合 true
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const command = `test -f ${this.escapePath(
        path
      )} && echo "exists" || echo "not found"`;
      const output = await this.serial.executeCommand(
        command,
        'pi@raspberrypi:',
        10000
      );

      return output.includes('exists');
    } catch (error: unknown) {
      return false;
    }
  }

  /**
   * ディレクトリが存在するかチェック
   *
   * @param path ディレクトリパス
   * @returns 存在する場合 true
   */
  async directoryExists(path: string): Promise<boolean> {
    try {
      const command = `test -d ${this.escapePath(
        path
      )} && echo "exists" || echo "not found"`;
      const output = await this.serial.executeCommand(
        command,
        'pi@raspberrypi:',
        10000
      );

      return output.includes('exists');
    } catch (error: unknown) {
      return false;
    }
  }

  /**
   * パスをエスケープ
   *
   * @param path エスケープするパス
   * @returns エスケープされたパス
   */
  private escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }
}
