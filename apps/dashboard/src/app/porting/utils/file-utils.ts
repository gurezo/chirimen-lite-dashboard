import { sleep } from './async';
import { arrayBufferToBase64, base64ToArrayBuffer } from './buffer';

/**
 * 共通ファイル操作ユーティリティ
 */
export class FileUtils {
  /**
   * テキストファイルの拡張子リスト
   */
  static readonly TEXT_FILE_EXTENSIONS = [
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
  ];

  /**
   * ファイルがテキストファイルかチェック
   */
  static isTextFile(path: string): boolean {
    const lastSlashIndex = path.lastIndexOf('/');
    const fileName =
      lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return true; // 拡張子がないファイルはテキストファイルとして扱う
    }

    // 隠しファイル（.で始まるファイル）は拡張子がないファイルとして扱う
    if (lastDotIndex === 0) {
      return true;
    }

    const extension = fileName.substring(lastDotIndex);
    return this.TEXT_FILE_EXTENSIONS.includes(extension);
  }

  /**
   * ArrayBufferをBase64に変換
   */
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    return arrayBufferToBase64(buffer);
  }

  /**
   * Base64をArrayBufferに変換
   */
  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    return base64ToArrayBuffer(base64);
  }

  /**
   * ファイル保存用のヒアドキュメントコマンドを生成
   */
  static generateHeredocCommand(fileName: string, content: string): string {
    return `cat > ${fileName} << 'EOL'\n${content}\nEOL`;
  }

  /**
   * ファイル追記用のヒアドキュメントコマンドを生成
   */
  static generateAppendCommand(fileName: string, content: string): string {
    return `cat >> ${fileName} << 'EOL'\n${content}\nEOL`;
  }

  /**
   * バイナリファイル保存用のBase64コマンドを生成
   */
  static generateBase64SaveCommand(fileName: string): string {
    return `base64 -d > ${fileName}`;
  }

  /**
   * ファイル操作の前処理（Ctrl+Cでフォアグラウンドプロセス停止）
   */
  static async prepareForFileOperation(serialService: any): Promise<void> {
    await serialService.write('\x03');
    await sleep(100);
  }

  /**
   * ファイル操作の後処理（Ctrl+Dで入力終了）
   */
  static async finalizeFileOperation(serialService: any): Promise<void> {
    await serialService.write('\x04');
    await sleep(10);
  }
}
