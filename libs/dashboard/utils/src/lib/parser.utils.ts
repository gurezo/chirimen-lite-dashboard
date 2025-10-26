import { FileListItem } from '@dashboard/models';

/**
 * 共通パーサーユーティリティ
 *
 * porting/utils/parser-utils.ts から移行・統合
 */
export class ParserUtils {
  /**
   * コマンド出力を行の配列に分割
   */
  static parseOutputLines(output: string): string[] {
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
  }

  /**
   * ls -laコマンドの出力をパース
   */
  static parseLsOutput(output: string): FileListItem[] {
    const lines = output.split('\n');
    const files: FileListItem[] = [];

    for (const line of lines) {
      if (line.startsWith('total') || !line.trim()) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 9) continue;

      const isDirectory = line.startsWith('d');
      const size = parseInt(parts[4], 10);
      const name = parts[8];

      files.push({
        name,
        size,
        isDirectory,
      });
    }

    return files;
  }
}

