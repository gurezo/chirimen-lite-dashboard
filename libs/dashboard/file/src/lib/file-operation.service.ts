import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@dashboard/serial';
import { FileUtils } from '@dashboard/utils';

/**
 * ファイル操作結果
 */
export interface FileOperationResult {
  success: boolean;
  message: string;
  details?: unknown;
}

/**
 * ファイル操作サービス
 *
 * ファイルのCRUD操作（作成、削除、移動、コピー、権限変更など）を担当
 * porting/services/file-operation.service.ts からリファクタリング
 * （メタデータ取得機能は FileMetadataService に分離）
 */
@Injectable({
  providedIn: 'root',
})
export class FileOperationService {
  private serial = inject(SerialFacadeService);

  /**
   * ファイルを削除
   *
   * @param path ファイルパス
   * @returns 操作結果
   */
  async removeFile(path: string): Promise<FileOperationResult> {
    try {
      await this.serial.executeCommand(
        `rm -- ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return {
        success: true,
        message: `File removed successfully: ${path}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to remove file: ${errorMessage}`);
    }
  }

  /**
   * ファイルを移動
   *
   * @param fromPath 移動元パス
   * @param toPath 移動先パス
   * @param useSudo sudo権限を使用するか
   * @returns 操作結果
   */
  async moveFile(
    fromPath: string,
    toPath: string,
    useSudo = false
  ): Promise<FileOperationResult> {
    try {
      const sudoPrefix = useSudo ? 'sudo ' : '';
      const command = `${sudoPrefix}mv -- ${FileUtils.escapePath(
        fromPath
      )} ${FileUtils.escapePath(toPath)}`;

      await this.serial.executeCommand(command, 'pi@raspberrypi:', 10000);

      return {
        success: true,
        message: `File moved successfully from ${fromPath} to ${toPath}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to move file: ${errorMessage}`);
    }
  }

  /**
   * ファイルをコピー
   *
   * @param fromPath コピー元パス
   * @param toPath コピー先パス
   * @param useSudo sudo権限を使用するか
   * @returns 操作結果
   */
  async copyFile(
    fromPath: string,
    toPath: string,
    useSudo = false
  ): Promise<FileOperationResult> {
    try {
      const sudoPrefix = useSudo ? 'sudo ' : '';
      const command = `${sudoPrefix}cp -- ${FileUtils.escapePath(
        fromPath
      )} ${FileUtils.escapePath(toPath)}`;

      await this.serial.executeCommand(command, 'pi@raspberrypi:', 10000);

      return {
        success: true,
        message: `File copied successfully from ${fromPath} to ${toPath}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to copy file: ${errorMessage}`);
    }
  }

  /**
   * ファイルをリネーム
   *
   * @param oldPath 旧ファイルパス
   * @param newPath 新ファイルパス
   * @returns 操作結果
   */
  async renameFile(
    oldPath: string,
    newPath: string
  ): Promise<FileOperationResult> {
    try {
      await this.serial.executeCommand(
        `mv -- ${FileUtils.escapePath(oldPath)} ${FileUtils.escapePath(newPath)}`,
        'pi@raspberrypi:',
        10000
      );

      return {
        success: true,
        message: `File renamed successfully from ${oldPath} to ${newPath}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to rename file: ${errorMessage}`);
    }
  }

  /**
   * ファイルの権限を変更
   *
   * @param path ファイルパス
   * @param permissions 権限（例: "755", "644"）
   * @returns 操作結果
   */
  async changeFilePermissions(
    path: string,
    permissions: string
  ): Promise<FileOperationResult> {
    try {
      await this.serial.executeCommand(
        `chmod ${permissions} -- ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return {
        success: true,
        message: `File permissions changed successfully: ${path}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to change file permissions: ${errorMessage}`);
    }
  }

  /**
   * ファイルの所有者を変更
   *
   * @param path ファイルパス
   * @param owner 所有者
   * @param group グループ（オプション）
   * @returns 操作結果
   */
  async changeFileOwner(
    path: string,
    owner: string,
    group?: string
  ): Promise<FileOperationResult> {
    try {
      const groupArg = group ? `:${group}` : '';
      await this.serial.executeCommand(
        `chown ${owner}${groupArg} -- ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return {
        success: true,
        message: `File owner changed successfully: ${path}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to change file owner: ${errorMessage}`);
    }
  }

  /**
   * シンボリックリンクを作成
   *
   * @param target ターゲットパス
   * @param linkPath リンクパス
   * @returns 操作結果
   */
  async createSymbolicLink(
    target: string,
    linkPath: string
  ): Promise<FileOperationResult> {
    try {
      await this.serial.executeCommand(
        `ln -s -- ${FileUtils.escapePath(target)} ${FileUtils.escapePath(linkPath)}`,
        'pi@raspberrypi:',
        10000
      );

      return {
        success: true,
        message: `Symbolic link created successfully: ${linkPath} -> ${target}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create symbolic link: ${errorMessage}`);
    }
  }

  /**
   * ハードリンクを作成
   *
   * @param target ターゲットパス
   * @param linkPath リンクパス
   * @returns 操作結果
   */
  async createHardLink(
    target: string,
    linkPath: string
  ): Promise<FileOperationResult> {
    try {
      await this.serial.executeCommand(
        `ln -- ${FileUtils.escapePath(target)} ${FileUtils.escapePath(linkPath)}`,
        'pi@raspberrypi:',
        10000
      );

      return {
        success: true,
        message: `Hard link created successfully: ${linkPath} -> ${target}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create hard link: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリを作成
   *
   * @param path ディレクトリパス
   * @param recursive 親ディレクトリも作成するか
   * @returns 操作結果
   */
  async createDirectory(
    path: string,
    recursive = false
  ): Promise<FileOperationResult> {
    try {
      const flag = recursive ? '-p ' : '';
      await this.serial.executeCommand(
        `mkdir ${flag}-- ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return {
        success: true,
        message: `Directory created successfully: ${path}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create directory: ${errorMessage}`);
    }
  }

  /**
   * ディレクトリを削除
   *
   * @param path ディレクトリパス
   * @param recursive 再帰的に削除するか
   * @returns 操作結果
   */
  async removeDirectory(
    path: string,
    recursive = false
  ): Promise<FileOperationResult> {
    try {
      const command = recursive
        ? `rm -r -- ${FileUtils.escapePath(path)}`
        : `rmdir -- ${FileUtils.escapePath(path)}`;

      await this.serial.executeCommand(command, 'pi@raspberrypi:', 10000);

      return {
        success: true,
        message: `Directory removed successfully: ${path}`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to remove directory: ${errorMessage}`);
    }
  }
}

