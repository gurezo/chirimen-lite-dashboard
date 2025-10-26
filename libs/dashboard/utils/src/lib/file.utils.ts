/**
 * ファイル操作ユーティリティ
 *
 * porting/utils/file-utils.ts から移行
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
    '.ts',
    '.tsx',
    '.jsx',
    '.css',
    '.scss',
    '.sass',
    '.less',
  ];

  /**
   * ファイルがテキストファイルかチェック
   *
   * @param path ファイルパス
   * @returns テキストファイルの場合 true
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
   * ファイル名から拡張子を取得
   *
   * @param fileName ファイル名
   * @returns 拡張子（ドット付き）。拡張子がない場合は空文字列
   */
  static getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return '';
    }
    return fileName.substring(lastDotIndex);
  }

  /**
   * ファイル名から拡張子を除いた名前を取得
   *
   * @param fileName ファイル名
   * @returns 拡張子を除いたファイル名
   */
  static getFileNameWithoutExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return fileName;
    }
    return fileName.substring(0, lastDotIndex);
  }

  /**
   * パスからファイル名を取得
   *
   * @param path ファイルパス
   * @returns ファイル名
   */
  static getFileName(path: string): string {
    const lastSlashIndex = path.lastIndexOf('/');
    return lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
  }

  /**
   * パスからディレクトリパスを取得
   *
   * @param path ファイルパス
   * @returns ディレクトリパス
   */
  static getDirectoryPath(path: string): string {
    const lastSlashIndex = path.lastIndexOf('/');
    return lastSlashIndex >= 0 ? path.substring(0, lastSlashIndex) : '.';
  }

  /**
   * ArrayBuffer を Base64 に変換
   *
   * @param buffer ArrayBuffer
   * @returns Base64 文字列
   */
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
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
   *
   * @param base64 Base64 文字列
   * @returns ArrayBuffer
   */
  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * ファイル保存用のヒアドキュメントコマンドを生成
   *
   * @param fileName ファイル名
   * @param content 内容
   * @returns cat コマンド文字列
   */
  static generateHeredocCommand(fileName: string, content: string): string {
    return `cat > ${fileName} << 'EOL'\n${content}\nEOL`;
  }

  /**
   * ファイル追記用のヒアドキュメントコマンドを生成
   *
   * @param fileName ファイル名
   * @param content 内容
   * @returns cat コマンド文字列
   */
  static generateAppendCommand(fileName: string, content: string): string {
    return `cat >> ${fileName} << 'EOL'\n${content}\nEOL`;
  }

  /**
   * バイナリファイル保存用の Base64 コマンドを生成
   *
   * @param fileName ファイル名
   * @returns base64 コマンド文字列
   */
  static generateBase64SaveCommand(fileName: string): string {
    return `base64 -d > ${fileName}`;
  }

  /**
   * ファイルサイズを人間が読みやすい形式に変換
   *
   * @param bytes バイト数
   * @returns 人間が読みやすい形式の文字列
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
  }
}

