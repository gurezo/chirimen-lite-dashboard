/**
 * ファイルリスト項目（ls -la のパース結果用）
 *
 * 旧 porting/types/file-info.ts の FileInfo から移行
 */
export interface FileListItem {
  /** ファイル名 */
  name: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** ディレクトリかどうか */
  isDirectory: boolean;
}

