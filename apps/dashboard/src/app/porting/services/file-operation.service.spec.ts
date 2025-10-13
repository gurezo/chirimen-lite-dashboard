import { TestBed } from '@angular/core/testing';
import { CommandUtils } from '../utils';
import { FileError } from '../utils/serial.errors';
import { FileOperationService } from './file-operation.service';
import { SerialService } from './serial.service';

// SerialServiceのモック
jest.mock('./serial.service');

describe('FileOperationService', () => {
  let service: FileOperationService;
  let mockSerialService: jest.Mocked<SerialService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileOperationService,
        {
          provide: SerialService,
          useValue: {
            portWritelnWaitfor: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(FileOperationService);
    mockSerialService = TestBed.inject(
      SerialService
    ) as jest.Mocked<SerialService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('removeFile', () => {
    it('should remove file successfully', async () => {
      const fileName = 'test.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.removeFile(fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `rm -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual({
        success: true,
        message: `File removed successfully: ${fileName}`,
      });
    });

    it('should throw FileError when file removal fails', async () => {
      const fileName = 'test.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.removeFile(fileName)).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `rm -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
    });

    it('should handle file names with special characters', async () => {
      const fileName = 'file with spaces.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.removeFile(fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `rm -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result.success).toBe(true);
    });
  });

  describe('moveFile', () => {
    it('should move file successfully without sudo', async () => {
      const fromPath = '/source/file.txt';
      const toPath = '/destination/file.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.moveFile(fromPath, toPath);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `mv -- ${CommandUtils.escapePath(fromPath)} ${CommandUtils.escapePath(
          toPath
        )}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual({
        success: true,
        message: `File moved successfully from ${fromPath} to ${toPath}`,
      });
    });

    it('should move file successfully with sudo', async () => {
      const fromPath = '/source/file.txt';
      const toPath = '/destination/file.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.moveFile(fromPath, toPath, true);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `sudo mv -- ${CommandUtils.escapePath(
          fromPath
        )} ${CommandUtils.escapePath(toPath)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result.success).toBe(true);
    });

    it('should throw FileError when file move fails', async () => {
      const fromPath = '/source/file.txt';
      const toPath = '/destination/file.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('No such file')
      );

      await expect(service.moveFile(fromPath, toPath)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `mv -- ${CommandUtils.escapePath(fromPath)} ${CommandUtils.escapePath(
          toPath
        )}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('copyFile', () => {
    it('should copy file successfully without sudo', async () => {
      const fromPath = '/source/file.txt';
      const toPath = '/destination/file.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.copyFile(fromPath, toPath);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cp -- ${CommandUtils.escapePath(fromPath)} ${CommandUtils.escapePath(
          toPath
        )}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual({
        success: true,
        message: `File copied successfully from ${fromPath} to ${toPath}`,
      });
    });

    it('should copy file successfully with sudo', async () => {
      const fromPath = '/source/file.txt';
      const toPath = '/destination/file.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.copyFile(fromPath, toPath, true);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `sudo cp -- ${CommandUtils.escapePath(
          fromPath
        )} ${CommandUtils.escapePath(toPath)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result.success).toBe(true);
    });

    it('should throw FileError when file copy fails', async () => {
      const fromPath = '/source/file.txt';
      const toPath = '/destination/file.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.copyFile(fromPath, toPath)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cp -- ${CommandUtils.escapePath(fromPath)} ${CommandUtils.escapePath(
          toPath
        )}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('changeFilePermissions', () => {
    it('should change file permissions successfully', async () => {
      const fileName = 'test.txt';
      const permissions = '644';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.changeFilePermissions(fileName, permissions);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chmod ${permissions} -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual({
        success: true,
        message: `File permissions changed successfully: ${fileName}`,
      });
    });

    it('should throw FileError when permission change fails', async () => {
      const fileName = 'test.txt';
      const permissions = '999';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Invalid permissions')
      );

      await expect(
        service.changeFilePermissions(fileName, permissions)
      ).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chmod ${permissions} -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('changeFileOwner', () => {
    it('should change file owner successfully', async () => {
      const fileName = 'test.txt';
      const owner = 'newuser';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.changeFileOwner(fileName, owner);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chown ${owner} -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual({
        success: true,
        message: `File owner changed successfully: ${fileName}`,
      });
    });

    it('should change file owner and group when both specified', async () => {
      const fileName = 'test.txt';
      const owner = 'newuser';
      const group = 'newgroup';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.changeFileOwner(fileName, owner, group);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chown ${owner}:${group} -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result.success).toBe(true);
    });

    it('should throw FileError when owner change fails', async () => {
      const fileName = 'test.txt';
      const owner = 'nonexistentuser';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('User not found')
      );

      await expect(service.changeFileOwner(fileName, owner)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chown ${owner} -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('renameFile', () => {
    it('should rename file successfully', async () => {
      const oldName = 'oldname.txt';
      const newName = 'newname.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.renameFile(oldName, newName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `mv -- ${CommandUtils.escapePath(oldName)} ${CommandUtils.escapePath(
          newName
        )}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual({
        success: true,
        message: `File renamed successfully from ${oldName} to ${newName}`,
      });
    });

    it('should throw FileError when file rename fails', async () => {
      const oldName = 'oldname.txt';
      const newName = 'newname.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.renameFile(oldName, newName)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `mv -- ${CommandUtils.escapePath(oldName)} ${CommandUtils.escapePath(
          newName
        )}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('createSymbolicLink', () => {
    it('should create symbolic link successfully', async () => {
      const target = '/target/file.txt';
      const linkName = '/link/file.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.createSymbolicLink(target, linkName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `ln -s -- ${CommandUtils.escapePath(target)} ${CommandUtils.escapePath(
          linkName
        )}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual({
        success: true,
        message: `Symbolic link created successfully: ${linkName} -> ${target}`,
      });
    });

    it('should throw FileError when symbolic link creation fails', async () => {
      const target = '/target/file.txt';
      const linkName = '/link/file.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(
        service.createSymbolicLink(target, linkName)
      ).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `ln -s -- ${CommandUtils.escapePath(target)} ${CommandUtils.escapePath(
          linkName
        )}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('createHardLink', () => {
    it('should create hard link successfully', async () => {
      const target = '/target/file.txt';
      const linkName = '/link/file.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const result = await service.createHardLink(target, linkName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `ln -- ${CommandUtils.escapePath(target)} ${CommandUtils.escapePath(
          linkName
        )}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual({
        success: true,
        message: `Hard link created successfully: ${linkName} -> ${target}`,
      });
    });

    it('should throw FileError when hard link creation fails', async () => {
      const target = '/target/file.txt';
      const linkName = '/link/file.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Cross-device link')
      );

      await expect(service.createHardLink(target, linkName)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `ln -- ${CommandUtils.escapePath(target)} ${CommandUtils.escapePath(
          linkName
        )}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('showFileAttributes', () => {
    it('should show file attributes successfully', async () => {
      const fileName = 'test.txt';
      const mockResult = '-rw-r--r-- 1 pi pi 123 Jan 1 12:00 test.txt';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.showFileAttributes(fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `ls -la -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe(mockResult);
    });

    it('should throw FileError when showing file attributes fails', async () => {
      const fileName = 'test.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.showFileAttributes(fileName)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `ls -la -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('getFileSize', () => {
    it('should get file size successfully', async () => {
      const fileName = 'test.txt';
      const mockResult = '12345';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.getFileSize(fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `stat --format=%s -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe(12345);
    });

    it('should return 0 when file size is invalid', async () => {
      const fileName = 'test.txt';
      const mockResult = 'invalid';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.getFileSize(fileName);

      expect(result).toBe(0);
    });

    it('should throw FileError when getting file size fails', async () => {
      const fileName = 'test.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.getFileSize(fileName)).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `stat --format=%s -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('getFileModificationTime', () => {
    it('should get file modification time successfully', async () => {
      const fileName = 'test.txt';
      const mockResult = '1704067200'; // 2024-01-01 12:00:00 UTC
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.getFileModificationTime(fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `stat --format=%Y -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual(new Date(1704067200 * 1000));
    });

    it('should throw FileError when getting file modification time fails', async () => {
      const fileName = 'test.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.getFileModificationTime(fileName)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `stat --format=%Y -- ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('integration tests', () => {
    it('should handle multiple file operations consistently', async () => {
      const fileName = 'test.txt';
      const newName = 'renamed.txt';

      // ファイルの属性を表示
      mockSerialService.portWritelnWaitfor.mockResolvedValueOnce(
        '-rw-r--r-- 1 pi pi 123 Jan 1 12:00 test.txt'
      );

      // ファイルをリネーム
      mockSerialService.portWritelnWaitfor.mockResolvedValueOnce('');

      // リネーム後のファイルの属性を表示
      mockSerialService.portWritelnWaitfor.mockResolvedValueOnce(
        '-rw-r--r-- 1 pi pi 123 Jan 1 12:00 renamed.txt'
      );

      const attributes1 = await service.showFileAttributes(fileName);
      expect(attributes1).toContain('test.txt');

      const renameResult = await service.renameFile(fileName, newName);
      expect(renameResult.success).toBe(true);

      const attributes2 = await service.showFileAttributes(newName);
      expect(attributes2).toContain('renamed.txt');
    });

    it('should handle sudo operations correctly', async () => {
      const fromPath = '/source/file.txt';
      const toPath = '/destination/file.txt';

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      const copyResult = await service.copyFile(fromPath, toPath, true);
      expect(copyResult.success).toBe(true);

      const moveResult = await service.moveFile(fromPath, toPath, true);
      expect(moveResult.success).toBe(true);
    });
  });
});
