/**
 * ファイルツリーノード（ツリー構造表示用）
 *
 * 旧 shared/models/file.info.models.ts の FileInfo から移行
 * child → children、isOpened → isExpanded にリネーム
 */

// cf. https://medium.com/@EchoLilt/types-of-files-in-linux-fc621eb1a0cb
export type FileType =
  | 'regular file'
  | 'directory'
  | 'character device file'
  | 'block device file'
  | 'local socket file'
  | 'named pipe'
  | 'symbolic link';

export namespace FileType {
  export const REGULAR_FILE: FileType = 'regular file';
  export const DIRECTORY: FileType = 'directory';
  export const CHARACTER_DEVICE_FILE: FileType = 'character device file';
  export const BLOCK_DEVICE_FILE: FileType = 'block device file';
  export const LOCAL_SOCKET_FILE: FileType = 'local socket file';
  export const NAMED_PIPE: FileType = 'named pipe';
  export const SYMBOLIC_LINK: FileType = 'symbolic link';
}

export interface FileTreeNode {
  /** ファイル名 */
  name: string;
  /** ファイルタイプ */
  type: FileType;
  /** ファイルサイズ（バイト） */
  size: number;
  /** 子ノード（ディレクトリの場合） */
  children: FileTreeNode[];
  /** 展開されているかどうか（UI状態） */
  isExpanded: boolean;
}

