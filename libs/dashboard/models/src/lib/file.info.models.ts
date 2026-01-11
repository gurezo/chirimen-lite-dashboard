/**
 * @deprecated Use FileTreeNode from './file-tree.model' instead.
 * This interface will be removed in a future version.
 *
 * Migration:
 * - child → children
 * - isOpened → isExpanded
 */
export interface FileInfo {
  name: string;
  type: FileType;
  size: number;
  /** @deprecated Use 'children' instead */
  child: FileInfo[];
  /** @deprecated Use 'isExpanded' instead */
  isOpened: boolean;
}

// cf. https://medium.com/@EchoLilt/types-of-files-in-linux-fc621eb1a0cb
/**
 * @deprecated Use FileType from './file-tree.model' instead.
 */
type FileType =
  | 'regular file'
  | 'directory'
  | 'character device file'
  | 'block device file'
  | 'local socket file'
  | 'named pipe'
  | 'symbolic link';

/**
 * @deprecated Use FileTypeConstants from './file-tree.model' instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FileTypeConstants = {
  REGULAR_FILE: 'regular file' as FileType,
  DIRECTORY: 'directory' as FileType,
  CHARACTER_DEVICE_FILE: 'character device file' as FileType,
  BLOCK_DEVICE_FILE: 'block device file' as FileType,
  LOCAL_SOCKET_FILE: 'local socket file' as FileType,
  NAMED_PIPE: 'named pipe' as FileType,
  SYMBOLIC_LINK: 'symbolic link' as FileType,
} as const;
