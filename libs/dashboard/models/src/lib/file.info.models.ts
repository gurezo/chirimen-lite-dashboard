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
 * @deprecated Use FileType namespace from './file-tree.model' instead.
 */
module FileType {
  export const REGULAR_FILE: FileType = 'regular file';
  export const DIRECTORY: FileType = 'directory';
  export const CHARACTER_DEVICE_FILE: FileType = 'character device file';
  export const BLOCK_DEVICE_FILE: FileType = 'block device file';
  export const LOCAL_SOCKET_FILE: FileType = 'local socket file';
  export const NAMED_PIPE: FileType = 'named pipe';
  export const SYMBOLIC_LINK: FileType = 'symbolic link';
}

