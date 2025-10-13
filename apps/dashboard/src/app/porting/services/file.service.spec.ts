import { TestBed } from '@angular/core/testing';
import { FileInfo } from '../types';
import { ParserUtils } from '../utils';
import { FileError } from '../utils/serial.errors';
import { FileService } from './file.service';
import { SerialService } from './serial.service';

// SerialServiceのモック
jest.mock('./serial.service');

describe('FileService', () => {
  let service: FileService;
  let mockSerialService: jest.Mocked<SerialService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileService,
        {
          provide: SerialService,
          useValue: {
            portWritelnWaitfor: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(FileService);
    mockSerialService = TestBed.inject(
      SerialService
    ) as jest.Mocked<SerialService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveFile', () => {
    it('should save file successfully', async () => {
      const data = new TextEncoder().encode('Hello, World!');
      const fileName = 'test.txt';

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.saveFile(data.buffer, fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cat > ${fileName} << 'EOL'\nHello, World!\nEOL`,
        'EOL'
      );
    });

    it('should handle empty file content', async () => {
      const data = new TextEncoder().encode('');
      const fileName = 'empty.txt';

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.saveFile(data.buffer, fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cat > ${fileName} << 'EOL'\n\nEOL`,
        'EOL'
      );
    });

    it('should handle file content with special characters', async () => {
      const data = new TextEncoder().encode('Line 1\nLine 2\nLine 3');
      const fileName = 'multiline.txt';

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.saveFile(data.buffer, fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cat > ${fileName} << 'EOL'\nLine 1\nLine 2\nLine 3\nEOL`,
        'EOL'
      );
    });

    it('should throw FileError when save fails', async () => {
      const data = new TextEncoder().encode('Hello, World!');
      const fileName = 'test.txt';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.saveFile(data.buffer, fileName)).rejects.toThrow(
        FileError
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cat > ${fileName} << 'EOL'\nHello, World!\nEOL`,
        'EOL'
      );
    });

    it('should handle binary data correctly', async () => {
      const data = new TextEncoder().encode(
        'Binary content with \x00 null bytes'
      );
      const fileName = 'binary.bin';

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      await service.saveFile(data.buffer, fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `cat > ${fileName} << 'EOL'\nBinary content with \x00 null bytes\nEOL`,
        'EOL'
      );
    });
  });

  describe('listAll', () => {
    it('should list all files successfully', async () => {
      const mockOutput = `total 8
drwxr-xr-x 2 pi pi 4096 Jan 1 12:00 .
drwxr-xr-x 3 pi pi 4096 Jan 1 12:00 ..
-rw-r--r-- 1 pi pi   13 Jan 1 12:00 test.txt
-rw-r--r-- 1 pi pi   25 Jan 1 12:00 document.txt`;

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      // ParserUtilsをモック
      const mockFiles: FileInfo[] = [
        {
          name: 'test.txt',
          size: 13,
          isDirectory: false,
        },
        {
          name: 'document.txt',
          size: 25,
          isDirectory: false,
        },
      ];
      jest.spyOn(ParserUtils, 'parseLsOutput').mockReturnValue(mockFiles);

      const result = await service.listAll();

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'ls -la',
        'EOL'
      );
      expect(ParserUtils.parseLsOutput).toHaveBeenCalledWith(mockOutput);
      expect(result).toEqual({ files: mockFiles });
    });

    it('should handle empty directory', async () => {
      const mockOutput = `total 8
drwxr-xr-x 2 pi pi 4096 Jan 1 12:00 .
drwxr-xr-x 3 pi pi 4096 Jan 1 12:00 ..`;

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      jest.spyOn(ParserUtils, 'parseLsOutput').mockReturnValue([]);

      const result = await service.listAll();

      expect(result).toEqual({ files: [] });
    });

    it('should throw FileError when listAll fails', async () => {
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Command failed')
      );

      await expect(service.listAll()).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        'ls -la',
        'EOL'
      );
    });

    it('should handle directory with mixed file types', async () => {
      const mockOutput = `total 16
drwxr-xr-x 2 pi pi 4096 Jan 1 12:00 .
drwxr-xr-x 3 pi pi 4096 Jan 1 12:00 ..
drwxr-xr-x 2 pi pi 4096 Jan 1 12:00 subdir
-rw-r--r-- 1 pi pi   13 Jan 1 12:00 test.txt
-rwxr-xr-x 1 pi pi 2048 Jan 1 12:00 script.sh`;

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      const mockFiles: FileInfo[] = [
        {
          name: 'subdir',
          size: 4096,
          isDirectory: true,
        },
        {
          name: 'test.txt',
          size: 13,
          isDirectory: false,
        },
        {
          name: 'script.sh',
          size: 2048,
          isDirectory: false,
        },
      ];
      jest.spyOn(ParserUtils, 'parseLsOutput').mockReturnValue(mockFiles);

      const result = await service.listAll();

      expect(result.files).toHaveLength(3);
      expect(result.files[0].isDirectory).toBe(true);
      expect(result.files[1].isDirectory).toBe(false);
      expect(result.files[2].isDirectory).toBe(false);
    });
  });

  describe('showDir', () => {
    it('should show directory successfully', async () => {
      const mockFiles: FileInfo[] = [
        {
          name: 'test.txt',
          size: 13,
          isDirectory: false,
        },
      ];

      // listAllをモック
      jest.spyOn(service, 'listAll').mockResolvedValue({ files: mockFiles });

      // console.logをモック
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.showDir();

      expect(service.listAll).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Files:', mockFiles);
    });

    it('should throw FileError when showDir fails', async () => {
      jest
        .spyOn(service, 'listAll')
        .mockRejectedValue(new Error('List failed'));

      await expect(service.showDir()).rejects.toThrow(FileError);
      expect(service.listAll).toHaveBeenCalled();
    });

    it('should handle empty directory listing', async () => {
      jest.spyOn(service, 'listAll').mockResolvedValue({ files: [] });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.showDir();

      expect(consoleSpy).toHaveBeenCalledWith('Files:', []);
    });

    it('should handle directory with many files', async () => {
      const mockFiles: FileInfo[] = Array.from({ length: 100 }, (_, i) => ({
        name: `file${i}.txt`,
        size: 100 + i,
        isDirectory: false,
      }));

      jest.spyOn(service, 'listAll').mockResolvedValue({ files: mockFiles });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.showDir();

      expect(consoleSpy).toHaveBeenCalledWith('Files:', mockFiles);
      expect(mockFiles).toHaveLength(100);
    });
  });

  describe('integration tests', () => {
    it('should handle complete file workflow', async () => {
      const fileName = 'workflow.txt';
      const content = 'This is a test file for workflow testing';
      const data = new TextEncoder().encode(content);

      // ファイルを保存
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      await service.saveFile(data.buffer, fileName);

      // ファイル一覧を取得
      const mockOutput = `total 8
drwxr-xr-x 2 pi pi 4096 Jan 1 12:00 .
drwxr-xr-x 3 pi pi 4096 Jan 1 12:00 ..
-rw-r--r-- 1 pi pi   38 Jan 1 12:00 ${fileName}`;

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      const mockFiles: FileInfo[] = [
        {
          name: fileName,
          size: 38,
          isDirectory: false,
        },
      ];
      jest.spyOn(ParserUtils, 'parseLsOutput').mockReturnValue(mockFiles);

      const listResult = await service.listAll();
      expect(listResult.files).toHaveLength(1);
      expect(listResult.files[0].name).toBe(fileName);

      // ディレクトリを表示
      jest.spyOn(service, 'listAll').mockResolvedValue(listResult);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.showDir();
      expect(consoleSpy).toHaveBeenCalledWith('Files:', mockFiles);
    });

    it('should handle multiple file operations', async () => {
      const files = [
        { name: 'file1.txt', content: 'Content 1' },
        { name: 'file2.txt', content: 'Content 2' },
        { name: 'file3.txt', content: 'Content 3' },
      ];

      // 複数のファイルを保存
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      for (const file of files) {
        const data = new TextEncoder().encode(file.content);
        await service.saveFile(data.buffer, file.name);
      }

      // 保存されたファイルの一覧を取得
      const mockOutput = `total 24
drwxr-xr-x 2 pi pi 4096 Jan 1 12:00 .
drwxr-xr-x 3 pi pi 4096 Jan 1 12:00 ..
-rw-r--r-- 1 pi pi   10 Jan 1 12:00 file1.txt
-rw-r--r-- 1 pi pi   10 Jan 1 12:00 file2.txt
-rw-r--r-- 1 pi pi   10 Jan 1 12:00 file3.txt`;

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockOutput);

      const mockFileInfos: FileInfo[] = files.map((file) => ({
        name: file.name,
        size: file.content.length,
        isDirectory: false,
      }));
      jest.spyOn(ParserUtils, 'parseLsOutput').mockReturnValue(mockFileInfos);

      const listResult = await service.listAll();
      expect(listResult.files).toHaveLength(3);

      // 各ファイルが正しく保存されていることを確認
      for (let i = 0; i < files.length; i++) {
        expect(listResult.files[i].name).toBe(files[i].name);
        expect(listResult.files[i].size).toBe(files[i].content.length);
      }
    });

    it('should handle error scenarios gracefully', async () => {
      const fileName = 'error.txt';
      const data = new TextEncoder().encode('Test content');

      // 保存時にエラーが発生
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Disk full')
      );

      await expect(service.saveFile(data.buffer, fileName)).rejects.toThrow(
        FileError
      );

      // 一覧取得時にエラーが発生
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.listAll()).rejects.toThrow(FileError);

      // ディレクトリ表示時にエラーが発生
      jest
        .spyOn(service, 'listAll')
        .mockRejectedValue(new Error('List failed'));

      await expect(service.showDir()).rejects.toThrow(FileError);
    });
  });
});
