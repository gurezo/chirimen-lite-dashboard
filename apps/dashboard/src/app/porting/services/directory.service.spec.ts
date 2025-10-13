import { TestBed } from '@angular/core/testing';
import { CommandUtils, ParserUtils } from '../utils';
import { FileError } from '../utils/serial.errors';
import { DirectoryService } from './directory.service';
import { SerialService } from './serial.service';

// SerialServiceのモック
jest.mock('./serial.service');

describe('DirectoryService', () => {
  let service: DirectoryService;
  let mockSerialService: jest.Mocked<SerialService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DirectoryService,
        {
          provide: SerialService,
          useValue: {
            portWritelnWaitfor: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(DirectoryService);
    mockSerialService = TestBed.inject(
      SerialService
    ) as jest.Mocked<SerialService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentDirectory', () => {
    it('should get current directory successfully', async () => {
      const mockResult = 'pi@raspberrypi:/home/pi/documents$';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      // ParserUtils.parseOutputLinesをモック
      jest.spyOn(ParserUtils, 'parseOutputLines').mockReturnValue([mockResult]);

      const result = await service.getCurrentDirectory();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'pwd',
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe('/home/pi/documents');
    });

    it('should update internal state when getting current directory', async () => {
      const mockResult = 'pi@raspberrypi:/home/pi/documents$';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest.spyOn(ParserUtils, 'parseOutputLines').mockReturnValue([mockResult]);

      await service.getCurrentDirectory();

      const dirInfo = service.getCurrentDirectoryInfo();
      expect(dirInfo.currentDir).toBe('/home/pi/documents');
      expect(dirInfo.absolutePath).toBe(mockResult);
    });

    it('should throw FileError when command fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Command failed')
      );

      await expect(service.getCurrentDirectory()).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'pwd',
        'pi@raspberrypi:',
        10000
      );
    });

    it('should handle different prompt formats', async () => {
      const mockResult = 'pi@raspberrypi:/var/log$';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest.spyOn(ParserUtils, 'parseOutputLines').mockReturnValue([mockResult]);

      const result = await service.getCurrentDirectory();

      expect(result).toBe('/var/log');
    });
  });

  describe('changeDirectory', () => {
    it('should change to specified directory', async () => {
      const targetDir = '/home/pi/documents';
      const mockResult = 'pi@raspberrypi:/home/pi/documents$';

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd command
        .mockResolvedValueOnce(mockResult); // getCurrentDirectory

      jest.spyOn(ParserUtils, 'parseOutputLines').mockReturnValue([mockResult]);

      const result = await service.changeDirectory(targetDir);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cd -- ${CommandUtils.escapePath(targetDir)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe('/home/pi/documents');
    });

    it('should change to home directory when no directory specified', async () => {
      const mockResult = 'pi@raspberrypi:/home/pi$';

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd command
        .mockResolvedValueOnce(mockResult); // getCurrentDirectory

      jest.spyOn(ParserUtils, 'parseOutputLines').mockReturnValue([mockResult]);

      const result = await service.changeDirectory();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'cd --',
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe('/home/pi');
    });

    it('should throw FileError when change directory fails', async () => {
      const targetDir = '/invalid/path';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.changeDirectory(targetDir)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cd -- ${CommandUtils.escapePath(targetDir)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('goHome', () => {
    it('should navigate to home directory', async () => {
      const mockResult = 'pi@raspberrypi:/home/pi$';

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd command
        .mockResolvedValueOnce(mockResult); // getCurrentDirectory

      jest.spyOn(ParserUtils, 'parseOutputLines').mockReturnValue([mockResult]);

      const result = await service.goHome();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'cd --',
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe('/home/pi');
    });
  });

  describe('navigateToDirectory', () => {
    it('should navigate to specified directory', async () => {
      const targetPath = '/home/pi/documents';
      const mockResult = 'pi@raspberrypi:/home/pi/documents$';

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce('') // cd command
        .mockResolvedValueOnce(mockResult); // getCurrentDirectory

      jest.spyOn(ParserUtils, 'parseOutputLines').mockReturnValue([mockResult]);

      const result = await service.navigateToDirectory(targetPath);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cd -- ${CommandUtils.escapePath(targetPath)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe('/home/pi/documents');
    });

    it('should throw FileError when navigation fails', async () => {
      const targetPath = '/invalid/path';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('No such file or directory')
      );

      await expect(service.navigateToDirectory(targetPath)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cd -- ${CommandUtils.escapePath(targetPath)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('createDirectory', () => {
    it('should create directory successfully', async () => {
      const dirName = 'newdir';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.createDirectory(dirName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `mkdir -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });

    it('should throw FileError when directory creation fails', async () => {
      const dirName = 'newdir';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.createDirectory(dirName)).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `mkdir -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });

    it('should handle directory names with special characters', async () => {
      const dirName = 'dir with spaces';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.createDirectory(dirName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `mkdir -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('removeDirectory', () => {
    it('should remove directory successfully', async () => {
      const dirName = 'olddir';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.removeDirectory(dirName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `rmdir -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });

    it('should remove directory recursively when specified', async () => {
      const dirName = 'olddir';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.removeDirectory(dirName, true);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `rmdir -r -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });

    it('should throw FileError when directory removal fails', async () => {
      const dirName = 'olddir';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Directory not empty')
      );

      await expect(service.removeDirectory(dirName)).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `rmdir -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('changeDirectoryPermissions', () => {
    it('should change directory permissions successfully', async () => {
      const dirName = 'testdir';
      const permissions = '755';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.changeDirectoryPermissions(dirName, permissions);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chmod ${permissions} -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });

    it('should throw FileError when permission change fails', async () => {
      const dirName = 'testdir';
      const permissions = '999';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Invalid permissions')
      );

      await expect(
        service.changeDirectoryPermissions(dirName, permissions)
      ).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chmod ${permissions} -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('changeDirectoryOwner', () => {
    it('should change directory owner successfully', async () => {
      const dirName = 'testdir';
      const owner = 'newuser';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.changeDirectoryOwner(dirName, owner);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chown ${owner} -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });

    it('should change directory owner and group when both specified', async () => {
      const dirName = 'testdir';
      const owner = 'newuser';
      const group = 'newgroup';
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.changeDirectoryOwner(dirName, owner, group);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chown ${owner}:${group} -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });

    it('should throw FileError when owner change fails', async () => {
      const dirName = 'testdir';
      const owner = 'nonexistentuser';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('User not found')
      );

      await expect(
        service.changeDirectoryOwner(dirName, owner)
      ).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `chown ${owner} -- ${CommandUtils.escapePath(dirName)}`,
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('getCurrentDirectoryInfo', () => {
    it('should return current directory info', () => {
      const dirInfo = service.getCurrentDirectoryInfo();

      expect(dirInfo).toEqual({
        currentDir: '',
        absolutePath: '',
      });
    });

    it('should return updated directory info after navigation', async () => {
      const mockResult = 'pi@raspberrypi:/home/pi/documents$';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest.spyOn(ParserUtils, 'parseOutputLines').mockReturnValue([mockResult]);

      await service.getCurrentDirectory();

      const dirInfo = service.getCurrentDirectoryInfo();
      expect(dirInfo.currentDir).toBe('/home/pi/documents');
      expect(dirInfo.absolutePath).toBe(mockResult);
    });
  });

  describe('getCurrentDir', () => {
    it('should return current directory', () => {
      const result = service.getCurrentDir();

      expect(result).toBe('');
    });
  });

  describe('getAbsolutePath', () => {
    it('should return absolute path', () => {
      const result = service.getAbsolutePath();

      expect(result).toBe('');
    });
  });

  describe('getDirFromPrompt (private method)', () => {
    it('should extract directory from prompt string', () => {
      const promptStr = 'pi@raspberrypi:/home/pi/documents$';
      const result = (service as any).getDirFromPrompt(promptStr);

      expect(result).toBe('/home/pi/documents');
    });

    it('should handle prompt with different formats', () => {
      const promptStr = 'user@host:/var/log$';
      const result = (service as any).getDirFromPrompt(promptStr);

      expect(result).toBe('/var/log');
    });

    it('should handle prompt with trailing slash', () => {
      const promptStr = 'pi@raspberrypi:/home/pi/$';
      const result = (service as any).getDirFromPrompt(promptStr);

      expect(result).toBe('/home/pi/');
    });
  });

  describe('integration tests', () => {
    it('should maintain state consistency across operations', async () => {
      const mockResult1 = 'pi@raspberrypi:/home/pi$';
      const mockResult2 = 'pi@raspberrypi:/home/pi/documents$';

      mockSerialService.portWritelnWaitfor
        .mockResolvedValueOnce(mockResult1) // getCurrentDirectory
        .mockResolvedValueOnce('') // changeDirectory
        .mockResolvedValueOnce(mockResult2); // getCurrentDirectory after change

      jest
        .spyOn(ParserUtils, 'parseOutputLines')
        .mockReturnValueOnce([mockResult1])
        .mockReturnValueOnce([mockResult2]);

      // 初期状態を取得
      const initialDir = await service.getCurrentDirectory();
      expect(initialDir).toBe('/home/pi');

      // ディレクトリを変更
      const newDir = await service.changeDirectory('documents');
      expect(newDir).toBe('/home/pi/documents');

      // 状態が一貫していることを確認
      const dirInfo = service.getCurrentDirectoryInfo();
      expect(dirInfo.currentDir).toBe('/home/pi/documents');
      expect(dirInfo.absolutePath).toBe(mockResult2);
    });
  });
});
