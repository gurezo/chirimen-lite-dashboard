import { Injectable, inject } from '@angular/core';
import { ParserUtils, FileUtils } from '@dashboard/utils';
import { SerialFacadeService } from '@dashboard/serial';

/**
 * ファイル検索サービス
 *
 * ファイル内の検索、head/tail、比較などの読み取り操作を担当
 * porting/services/file-content.service.ts から分離
 */
@Injectable({
  providedIn: 'root',
})
export class FileSearchService {
  private serial = inject(SerialFacadeService);

  /**
   * ファイル内を検索
   *
   * @param path ファイルパス
   * @param searchTerm 検索文字列
   * @returns マッチした行の配列
   */
  async searchInFile(path: string, searchTerm: string): Promise<string[]> {
    try {
      const result = await this.serial.executeCommand(
        `grep -n "${searchTerm}" ${FileUtils.escapePath(
          path
        )} || echo "No matches found"`,
        'pi@raspberrypi:',
        10000
      );

      const lines = ParserUtils.parseOutputLines(result);
      return lines.filter((line) => line !== 'No matches found');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to search in file: ${errorMessage}`);
    }
  }

  /**
   * ファイルの行数を取得
   *
   * @param path ファイルパス
   * @returns 行数
   */
  async getLineCount(path: string): Promise<number> {
    try {
      const result = await this.serial.executeCommand(
        `wc -l < ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      const count = parseInt(result.trim(), 10);
      return isNaN(count) ? 0 : count;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get line count: ${errorMessage}`);
    }
  }

  /**
   * ファイルの特定の行を取得
   *
   * @param path ファイルパス
   * @param lineNumber 行番号
   * @returns 行の内容
   */
  async getFileLine(path: string, lineNumber: number): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        `sed -n '${lineNumber}p' ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return result.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file line: ${errorMessage}`);
    }
  }

  /**
   * ファイルの先頭N行を取得
   *
   * @param path ファイルパス
   * @param lineCount 取得する行数（デフォルト: 10）
   * @returns 行の配列
   */
  async getFileHead(path: string, lineCount = 10): Promise<string[]> {
    try {
      const result = await this.serial.executeCommand(
        `head -n ${lineCount} ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return ParserUtils.parseOutputLines(result);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file head: ${errorMessage}`);
    }
  }

  /**
   * ファイルの末尾N行を取得
   *
   * @param path ファイルパス
   * @param lineCount 取得する行数（デフォルト: 10）
   * @returns 行の配列
   */
  async getFileTail(path: string, lineCount = 10): Promise<string[]> {
    try {
      const result = await this.serial.executeCommand(
        `tail -n ${lineCount} ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return ParserUtils.parseOutputLines(result);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file tail: ${errorMessage}`);
    }
  }

  /**
   * 2つのファイルを比較
   *
   * @param path1 ファイル1のパス
   * @param path2 ファイル2のパス
   * @returns 差分の文字列
   */
  async compareFiles(path1: string, path2: string): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        `diff ${FileUtils.escapePath(path1)} ${FileUtils.escapePath(
          path2
        )} || echo "Files are identical"`,
        'pi@raspberrypi:',
        10000
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to compare files: ${errorMessage}`);
    }
  }

  /**
   * ファイル内の文字列を置換（プレビュー）
   *
   * @param path ファイルパス
   * @param searchTerm 検索文字列
   * @param replaceTerm 置換文字列
   * @returns 置換後のプレビュー
   */
  async previewReplace(
    path: string,
    searchTerm: string,
    replaceTerm: string
  ): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        `sed 's/${searchTerm}/${replaceTerm}/g' ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to preview replace: ${errorMessage}`);
    }
  }

  /**
   * ファイル内の特定の範囲を取得
   *
   * @param path ファイルパス
   * @param startLine 開始行
   * @param endLine 終了行
   * @returns 行の配列
   */
  async getFileRange(
    path: string,
    startLine: number,
    endLine: number
  ): Promise<string[]> {
    try {
      const result = await this.serial.executeCommand(
        `sed -n '${startLine},${endLine}p' ${FileUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        10000
      );

      return ParserUtils.parseOutputLines(result);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get file range: ${errorMessage}`);
    }
  }
}

