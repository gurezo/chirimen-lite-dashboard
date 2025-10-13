import { TestBed } from '@angular/core/testing';
import { CommandUtils, FileUtils, ParserUtils } from '../utils';
import { FileError } from '../utils/serial.errors';
import { FileContentService } from './file-content.service';
import { SerialService } from './serial.service';

// SerialServiceのモック
jest.mock('./serial.service');

describe('FileContentService', () => {
  let service: FileContentService;
  let mockSerialService: jest.Mocked<SerialService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileContentService,
        {
          provide: SerialService,
          useValue: {
            portWritelnWaitfor: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(FileContentService);
    mockSerialService = TestBed.inject(
      SerialService
    ) as jest.Mocked<SerialService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFileContent', () => {
    it('should get text file content successfully', async () => {
      const path = '/home/pi/test.txt';
      const mockResult = 'base64\nSGVsbG8sIFdvcmxkIQ==\nend';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      // FileUtilsをモック
      jest
        .spyOn(FileUtils, 'base64ToArrayBuffer')
        .mockReturnValue(new ArrayBuffer(13));
      jest.spyOn(FileUtils, 'isTextFile').mockReturnValue(true);

      const result = await service.getFileContent(path);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `base64 -- ${CommandUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        30000
      );
      expect(result.isText).toBe(true);
      expect(result.encoding).toBe('utf-8');
      expect(result.size).toBe(13);
    });

    it('should get binary file content successfully', async () => {
      const path = '/home/pi/image.jpg';
      const mockResult = 'base64\nSGVsbG8sIFdvcmxkIQ==\nend';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      // FileUtilsをモック
      const mockBuffer = new ArrayBuffer(13);
      jest.spyOn(FileUtils, 'base64ToArrayBuffer').mockReturnValue(mockBuffer);
      jest.spyOn(FileUtils, 'isTextFile').mockReturnValue(false);

      const result = await service.getFileContent(path);

      expect(result.isText).toBe(false);
      expect(result.content).toBe(mockBuffer);
      expect(result.size).toBe(13);
      expect(result.encoding).toBeUndefined();
    });

    it('should handle file with size parameter', async () => {
      const path = '/home/pi/test.txt';
      const size = 100;
      const mockResult = 'base64\nSGVsbG8sIFdvcmxkIQ==\nend';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest
        .spyOn(FileUtils, 'base64ToArrayBuffer')
        .mockReturnValue(new ArrayBuffer(13));
      jest.spyOn(FileUtils, 'isTextFile').mockReturnValue(true);

      const result = await service.getFileContent(path, size);

      expect(result.isText).toBe(true);
      expect(result.size).toBe(13);
    });

    it('should throw FileError when command fails', async () => {
      const path = '/home/pi/test.txt';
      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.getFileContent(path)).rejects.toThrow(FileError);
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `base64 -- ${CommandUtils.escapePath(path)}`,
        'pi@raspberrypi:',
        30000
      );
    });

    it('should handle empty file content', async () => {
      const path = '/home/pi/empty.txt';
      const mockResult = 'base64\n\nend';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest
        .spyOn(FileUtils, 'base64ToArrayBuffer')
        .mockReturnValue(new ArrayBuffer(0));
      jest.spyOn(FileUtils, 'isTextFile').mockReturnValue(true);

      const result = await service.getFileContent(path);

      expect(result.content).toBe('');
      expect(result.size).toBe(0);
    });
  });

  describe('saveTextFile', () => {
    it('should save text file successfully', async () => {
      const content = 'Hello, World!';
      const fileName = 'test.txt';
      const mockHeredocCommand = 'cat > test.txt << EOL\nHello, World!\nEOL';

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      // FileUtilsをモック
      jest
        .spyOn(FileUtils, 'generateHeredocCommand')
        .mockReturnValue(mockHeredocCommand);

      await service.saveTextFile(content, fileName);

      expect(FileUtils.generateHeredocCommand).toHaveBeenCalledWith(
        CommandUtils.escapePath(fileName),
        content
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        mockHeredocCommand,
        'EOL'
      );
    });

    it('should throw FileError when save fails', async () => {
      const content = 'Hello, World!';
      const fileName = 'test.txt';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.saveTextFile(content, fileName)).rejects.toThrow(
        FileError
      );
    });
  });

  describe('saveBinaryFile', () => {
    it('should save binary file successfully', async () => {
      const buffer = new ArrayBuffer(13);
      const fileName = 'test.bin';
      const mockBase64 = 'SGVsbG8sIFdvcmxkIQ==';

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      // FileUtilsをモック
      jest.spyOn(FileUtils, 'arrayBufferToBase64').mockReturnValue(mockBase64);
      jest.spyOn(FileUtils, 'prepareForFileOperation').mockResolvedValue();
      jest.spyOn(FileUtils, 'finalizeFileOperation').mockResolvedValue();

      await service.saveBinaryFile(buffer, fileName);

      expect(FileUtils.arrayBufferToBase64).toHaveBeenCalledWith(buffer);
      expect(FileUtils.prepareForFileOperation).toHaveBeenCalledWith(
        mockSerialService
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `base64 -d > ${CommandUtils.escapePath(fileName)}`,
        '\n',
        10000
      );
      expect(FileUtils.finalizeFileOperation).toHaveBeenCalledWith(
        mockSerialService
      );
    });

    it('should handle large binary files with chunking', async () => {
      const buffer = new ArrayBuffer(1024);
      const fileName = 'large.bin';
      const mockBase64 = 'A'.repeat(1024); // 長いbase64文字列

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      jest.spyOn(FileUtils, 'arrayBufferToBase64').mockReturnValue(mockBase64);
      jest.spyOn(FileUtils, 'prepareForFileOperation').mockResolvedValue();
      jest.spyOn(FileUtils, 'finalizeFileOperation').mockResolvedValue();

      await service.saveBinaryFile(buffer, fileName);

      // チャンク分割されて送信されることを確認
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledTimes(5); // 準備 + コマンド + データ + 終了
    });

    it('should throw FileError when save fails', async () => {
      const buffer = new ArrayBuffer(13);
      const fileName = 'test.bin';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Disk full')
      );

      await expect(service.saveBinaryFile(buffer, fileName)).rejects.toThrow(
        FileError
      );
    });
  });

  describe('appendToFile', () => {
    it('should append to file successfully', async () => {
      const content = 'Additional content';
      const fileName = 'test.txt';
      const mockAppendCommand =
        'cat >> test.txt << EOL\nAdditional content\nEOL';

      mockSerialService.portWritelnWaitfor.mockResolvedValue('');

      jest
        .spyOn(FileUtils, 'generateAppendCommand')
        .mockReturnValue(mockAppendCommand);

      await service.appendToFile(content, fileName);

      expect(FileUtils.generateAppendCommand).toHaveBeenCalledWith(
        CommandUtils.escapePath(fileName),
        content
      );
      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        mockAppendCommand,
        'EOL'
      );
    });

    it('should throw FileError when append fails', async () => {
      const content = 'Additional content';
      const fileName = 'test.txt';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.appendToFile(content, fileName)).rejects.toThrow(
        FileError
      );
    });
  });

  describe('searchInFile', () => {
    it('should search in file successfully', async () => {
      const fileName = 'test.txt';
      const searchTerm = 'Hello';
      const mockResult = '1:Hello, World!\n2:Hello again';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest
        .spyOn(ParserUtils, 'parseOutputLines')
        .mockReturnValue(['1:Hello, World!', '2:Hello again']);

      const result = await service.searchInFile(fileName, searchTerm);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `grep -n "${searchTerm}" ${CommandUtils.escapePath(
          fileName
        )} || echo "No matches found"`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual(['1:Hello, World!', '2:Hello again']);
    });

    it('should handle no matches found', async () => {
      const fileName = 'test.txt';
      const searchTerm = 'Nonexistent';
      const mockResult = 'No matches found';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest
        .spyOn(ParserUtils, 'parseOutputLines')
        .mockReturnValue(['No matches found']);

      const result = await service.searchInFile(fileName, searchTerm);

      expect(result).toEqual([]);
    });

    it('should throw FileError when search fails', async () => {
      const fileName = 'test.txt';
      const searchTerm = 'Hello';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.searchInFile(fileName, searchTerm)).rejects.toThrow(
        FileError
      );
    });
  });

  describe('getLineCount', () => {
    it('should get line count successfully', async () => {
      const fileName = 'test.txt';
      const mockResult = '42';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.getLineCount(fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `wc -l < ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe(42);
    });

    it('should return 0 for invalid line count', async () => {
      const fileName = 'test.txt';
      const mockResult = 'invalid';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.getLineCount(fileName);

      expect(result).toBe(0);
    });

    it('should throw FileError when getLineCount fails', async () => {
      const fileName = 'test.txt';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.getLineCount(fileName)).rejects.toThrow(FileError);
    });
  });

  describe('getFileLine', () => {
    it('should get specific file line successfully', async () => {
      const fileName = 'test.txt';
      const lineNumber = 5;
      const mockResult = 'This is line 5';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.getFileLine(fileName, lineNumber);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `sed -n '${lineNumber}p' ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe('This is line 5');
    });

    it('should throw FileError when getFileLine fails', async () => {
      const fileName = 'test.txt';
      const lineNumber = 5;

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Line not found')
      );

      await expect(service.getFileLine(fileName, lineNumber)).rejects.toThrow(
        FileError
      );
    });
  });

  describe('getFileHead', () => {
    it('should get file head successfully', async () => {
      const fileName = 'test.txt';
      const lineCount = 5;
      const mockResult = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest
        .spyOn(ParserUtils, 'parseOutputLines')
        .mockReturnValue(['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5']);

      const result = await service.getFileHead(fileName, lineCount);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `head -n ${lineCount} ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual([
        'Line 1',
        'Line 2',
        'Line 3',
        'Line 4',
        'Line 5',
      ]);
    });

    it('should use default line count when not specified', async () => {
      const fileName = 'test.txt';
      const mockResult = 'Line 1\nLine 2\nLine 3';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest
        .spyOn(ParserUtils, 'parseOutputLines')
        .mockReturnValue(['Line 1', 'Line 2', 'Line 3']);

      const result = await service.getFileHead(fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `head -n 10 ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual(['Line 1', 'Line 2', 'Line 3']);
    });

    it('should throw FileError when getFileHead fails', async () => {
      const fileName = 'test.txt';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.getFileHead(fileName)).rejects.toThrow(FileError);
    });
  });

  describe('getFileTail', () => {
    it('should get file tail successfully', async () => {
      const fileName = 'test.txt';
      const lineCount = 3;
      const mockResult = 'Line 8\nLine 9\nLine 10';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest
        .spyOn(ParserUtils, 'parseOutputLines')
        .mockReturnValue(['Line 8', 'Line 9', 'Line 10']);

      const result = await service.getFileTail(fileName, lineCount);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `tail -n ${lineCount} ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual(['Line 8', 'Line 9', 'Line 10']);
    });

    it('should use default line count when not specified', async () => {
      const fileName = 'test.txt';
      const mockResult = 'Line 8\nLine 9\nLine 10';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      jest
        .spyOn(ParserUtils, 'parseOutputLines')
        .mockReturnValue(['Line 8', 'Line 9', 'Line 10']);

      const result = await service.getFileTail(fileName);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `tail -n 10 ${CommandUtils.escapePath(fileName)}`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toEqual(['Line 8', 'Line 9', 'Line 10']);
    });

    it('should throw FileError when getFileTail fails', async () => {
      const fileName = 'test.txt';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.getFileTail(fileName)).rejects.toThrow(FileError);
    });
  });

  describe('compareFiles', () => {
    it('should compare files successfully with differences', async () => {
      const file1 = 'file1.txt';
      const file2 = 'file2.txt';
      const mockResult = '1c1\n< Hello\n---\n> World';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.compareFiles(file1, file2);

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        `diff ${CommandUtils.escapePath(file1)} ${CommandUtils.escapePath(
          file2
        )} || echo "Files are identical"`,
        'pi@raspberrypi:',
        10000
      );
      expect(result).toBe('1c1\n< Hello\n---\n> World');
    });

    it('should return identical message when files are the same', async () => {
      const file1 = 'file1.txt';
      const file2 = 'file2.txt';
      const mockResult = 'Files are identical';

      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);

      const result = await service.compareFiles(file1, file2);

      expect(result).toBe('Files are identical');
    });

    it('should throw FileError when compare fails', async () => {
      const file1 = 'file1.txt';
      const file2 = 'file2.txt';

      mockSerialService.portWritelnWaitfor.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(service.compareFiles(file1, file2)).rejects.toThrow(
        FileError
      );
    });
  });

  describe('integration tests', () => {
    it('should handle complete file workflow', async () => {
      const fileName = 'test.txt';
      const content = 'Hello, World!';

      // ファイルを保存
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      jest
        .spyOn(FileUtils, 'generateHeredocCommand')
        .mockReturnValue('cat > test.txt << EOL\nHello, World!\nEOL');

      await service.saveTextFile(content, fileName);

      // ファイルの内容を取得
      const mockResult = 'base64\nSGVsbG8sIFdvcmxkIQ==\nend';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);
      jest
        .spyOn(FileUtils, 'base64ToArrayBuffer')
        .mockReturnValue(new ArrayBuffer(13));
      jest.spyOn(FileUtils, 'isTextFile').mockReturnValue(true);

      const fileContent = await service.getFileContent(fileName);
      expect(fileContent.isText).toBe(true);
      expect(fileContent.size).toBe(13);

      // ファイルに追記
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      jest
        .spyOn(FileUtils, 'generateAppendCommand')
        .mockReturnValue('cat >> test.txt << EOL\nAdditional content\nEOL');

      await service.appendToFile('Additional content', fileName);

      // 行数を取得
      mockSerialService.portWritelnWaitfor.mockResolvedValue('2');
      const lineCount = await service.getLineCount(fileName);
      expect(lineCount).toBe(2);
    });

    it('should handle binary file operations', async () => {
      const fileName = 'test.bin';
      const buffer = new ArrayBuffer(13);

      // バイナリファイルを保存
      mockSerialService.portWritelnWaitfor.mockResolvedValue('');
      jest
        .spyOn(FileUtils, 'arrayBufferToBase64')
        .mockReturnValue('SGVsbG8sIFdvcmxkIQ==');
      jest.spyOn(FileUtils, 'prepareForFileOperation').mockResolvedValue();
      jest.spyOn(FileUtils, 'finalizeFileOperation').mockResolvedValue();

      await service.saveBinaryFile(buffer, fileName);

      // バイナリファイルの内容を取得
      const mockResult = 'base64\nSGVsbG8sIFdvcmxkIQ==\nend';
      mockSerialService.portWritelnWaitfor.mockResolvedValue(mockResult);
      jest.spyOn(FileUtils, 'base64ToArrayBuffer').mockReturnValue(buffer);
      jest.spyOn(FileUtils, 'isTextFile').mockReturnValue(false);

      const fileContent = await service.getFileContent(fileName);
      expect(fileContent.isText).toBe(false);
      expect(fileContent.content).toBe(buffer);
    });
  });
});
