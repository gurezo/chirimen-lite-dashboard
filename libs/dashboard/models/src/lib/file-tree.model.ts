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

export const FileTypeConstants = {
  REGULAR_FILE: 'regular file' as FileType,
  DIRECTORY: 'directory' as FileType,
  CHARACTER_DEVICE_FILE: 'character device file' as FileType,
  BLOCK_DEVICE_FILE: 'block device file' as FileType,
  LOCAL_SOCKET_FILE: 'local socket file' as FileType,
  NAMED_PIPE: 'named pipe' as FileType,
  SYMBOLIC_LINK: 'symbolic link' as FileType,
} as const;

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
