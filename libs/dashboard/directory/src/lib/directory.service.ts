import { Injectable, inject } from '@angular/core';
import { ParserUtils, FileUtils } from '@dashboard/utils';
import { SerialFacadeService } from '@dashboard/serial';

/**
 * ディレクトリ情報
 */
export interface DirectoryInfo {
  currentDir: string;
  absolutePath: string;
}

/**
 * ディレクトリサービス
 *
 * ディレクトリ操作（移動、作成、削除、権限変更）を担当
 * porting/services/directory.service.ts から移行
 */
@Injectable({
  providedIn: 'root',
})
export class DirectoryService {
  private serial = inject(SerialFacadeService);
  private currentDir = '';
  private absolutePath = '';

  /**
   * 現在のディレクトリを取得
   *
   * @returns 現在のディレクトリパス
   */
  async getCurrentDirectory(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'pwd',
        'pi@raspberrypi:',
        10000
      );

      const lines = ParserUtils.parseOutputLines(result);
      this.absolutePath = lines[lines.length - 1];
      this.currentDir = this.getDirFromPrompt(this.absolutePath);

      return this.currentDir;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get current directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリを変更
   *
   * @param dir ディレクトリパス（省略時はホームディレクトリ）
   * @returns 変更後のディレクトリパス
   */
  async changeDirectory(dir?: string): Promise<string> {
    try {
      const cdCommand = dir ? `cd -- ${FileUtils.escapePath(dir)}` : 'cd --';

      await this.serial.executeCommand(cdCommand, 'pi@raspberrypi:', 10000);

      // ディレクトリ変更後に現在のディレクトリを更新
      return await this.getCurrentDirectory();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to change directory: ${errorMessage}`);
    }
  }

  /**
   * ホームディレクトリに移動
   *
   * @returns ホームディレクトリパス
   */
  async goHome(): Promise<string> {
    return this.changeDirectory();
  }

  /**
   * 指定されたディレクトリに移動
   *
   * @param path ディレクトリパス
   * @returns 移動後のディレクトリパス
   */
  async navigateToDirectory(path: string): Promise<string> {
    try {
      await this.serial.executeCommand(
        `cd -- ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return await this.getCurrentDirectory();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to navigate to directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリを作成
   *
   * @param dirName ディレクトリ名
   * @param recursive 親ディレクトリも作成するか
   */
  async createDirectory(
    dirName: string,
    recursive: boolean = false
  ): Promise<void> {
    try {
      const flag = recursive ? '-p ' : '';
      await this.serial.executeCommand(
        `mkdir ${flag}-- ${FileUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリを削除
   *
   * @param dirName ディレクトリ名
   * @param recursive 再帰的に削除するか
   */
  async removeDirectory(
    dirName: string,
    recursive: boolean = false
  ): Promise<void> {
    try {
      const command = recursive
        ? `rm -r -- ${FileUtils.escapePath(dirName)}`
        : `rmdir -- ${FileUtils.escapePath(dirName)}`;

      await this.serial.executeCommand(command, 'pi@raspberrypi:', 10000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to remove directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリの権限を変更
   *
   * @param dirName ディレクトリ名
   * @param permissions 権限（例: "755"）
   */
  async changeDirectoryPermissions(
    dirName: string,
    permissions: string
  ): Promise<void> {
    try {
      await this.serial.executeCommand(
        `chmod ${permissions} -- ${FileUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to change directory permissions: ${errorMessage}`
      );
    }
  }

  /**
   * ディレクトリの所有者を変更
   *
   * @param dirName ディレクトリ名
   * @param owner 所有者
   * @param group グループ（オプション）
   */
  async changeDirectoryOwner(
    dirName: string,
    owner: string,
    group?: string
  ): Promise<void> {
    try {
      const groupArg = group ? `:${group}` : '';
      await this.serial.executeCommand(
        `chown ${owner}${groupArg} -- ${FileUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to change directory owner: ${errorMessage}`);
    }
  }

  /**
   * 現在のディレクトリ情報を取得
   *
   * @returns ディレクトリ情報
   */
  getCurrentDirectoryInfo(): DirectoryInfo {
    return {
      currentDir: this.currentDir,
      absolutePath: this.absolutePath,
    };
  }

  /**
   * 現在のディレクトリパスを取得（キャッシュ）
   *
   * @returns 現在のディレクトリパス
   */
  getCurrentDir(): string {
    return this.currentDir;
  }

  /**
   * 絶対パスを取得（キャッシュ）
   *
   * @returns 絶対パス
   */
  getAbsolutePath(): string {
    return this.absolutePath;
  }

  /**
   * プロンプト文字列からディレクトリパスを抽出
   */
  private getDirFromPrompt(promptStr: string): string {
    const trimmed = promptStr.trim();
    const colonIndex = trimmed.lastIndexOf(':');
    const dollarIndex = trimmed.lastIndexOf('$');

    if (colonIndex >= 0 && dollarIndex >= 0) {
      return trimmed.substring(colonIndex + 1, dollarIndex);
    }

    return trimmed;
  }
}

