// cf. https://medium.com/@EchoLilt/types-of-files-in-linux-fc621eb1a0cb
type FileType =
  | 'regular file'
  | 'directory'
  | 'character device file'
  | 'block device file'
  | 'local socket file'
  | 'named pipe'
  | 'symbolic link';

module FileType {
  export const REGULAR_FILE: FileType = 'regular file';
  export const DIRECTORY: FileType = 'directory';
  export const CHARACTER_DEVICE_FILE: FileType = 'character device file';
  export const BLOCK_DEVICE_FILE: FileType = 'block device file';
  export const LOCAL_SOCKET_FILE: FileType = 'local socket file';
  export const NAMED_PIPE: FileType = 'named pipe';
  export const SYMBOLIC_LINK: FileType = 'symbolic link';
}

export interface FileInfo {
  name: string;
  type: FileType;
  size: number;
  child: FileInfo[];
  isOpened: boolean;
}
