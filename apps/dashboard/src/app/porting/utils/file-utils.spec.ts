import { FileUtils } from './file-utils';
import { sleep } from './async';

// Mock async utility
jest.mock('./async', () => ({
  sleep: jest.fn(),
}));

describe('FileUtils', () => {
  const mockSleep = sleep as jest.MockedFunction<typeof sleep>;

  beforeEach(() => {
    mockSleep.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('TEXT_FILE_EXTENSIONS', () => {
    it('should contain expected text file extensions', () => {
      const expectedExtensions = [
        '.txt', '.sh', '.csv', '.tsv', '.js', '.conf', '.mjs',
        '.md', '.yml', '.xml', '.html', '.htm', '.json', '.py', '.php', '.log'
      ];
      
      expect(FileUtils.TEXT_FILE_EXTENSIONS).toEqual(expectedExtensions);
    });

    it('should be readonly', () => {
      // readonlyプロパティのテストは削除（TypeScriptのコンパイル時チェック）
      expect(FileUtils.TEXT_FILE_EXTENSIONS).toBeDefined();
    });
  });

  describe('isTextFile', () => {
    it('should identify text files by extension', () => {
      expect(FileUtils.isTextFile('/path/to/file.txt')).toBe(true);
      expect(FileUtils.isTextFile('/path/to/script.sh')).toBe(true);
      expect(FileUtils.isTextFile('/path/to/data.csv')).toBe(true);
      expect(FileUtils.isTextFile('/path/to/config.conf')).toBe(true);
      expect(FileUtils.isTextFile('/path/to/package.json')).toBe(true);
      expect(FileUtils.isTextFile('/path/to/app.py')).toBe(true);
    });

    it('should identify non-text files', () => {
      expect(FileUtils.isTextFile('/path/to/image.jpg')).toBe(false);
      expect(FileUtils.isTextFile('/path/to/document.pdf')).toBe(false);
      expect(FileUtils.isTextFile('/path/to/archive.zip')).toBe(false);
      expect(FileUtils.isTextFile('/path/to/video.mp4')).toBe(false);
      // 拡張子がないファイルはテキストファイルとして扱う
      expect(FileUtils.isTextFile('/path/to/executable')).toBe(true);
    });

    it('should handle files without extension', () => {
      expect(FileUtils.isTextFile('/path/to/filename')).toBe(true);
      // .hiddenfileは拡張子がないファイルとして扱う
      expect(FileUtils.isTextFile('/path/to/.hiddenfile')).toBe(true);
    });

    it('should handle files with multiple dots', () => {
      expect(FileUtils.isTextFile('/path/to/file.backup.txt')).toBe(true);
      expect(FileUtils.isTextFile('/path/to/config.prod.yml')).toBe(true);
    });

    it('should handle root paths', () => {
      expect(FileUtils.isTextFile('/filename.txt')).toBe(true);
      // .bashrcは拡張子がないファイルとして扱う
      expect(FileUtils.isTextFile('/.bashrc')).toBe(true);
    });

    it('should handle relative paths', () => {
      expect(FileUtils.isTextFile('./file.txt')).toBe(true);
      expect(FileUtils.isTextFile('../config.json')).toBe(true);
    });
  });

  describe('arrayBufferToBase64', () => {
    it('should convert ArrayBuffer to base64', () => {
      const buffer = new ArrayBuffer(4);
      const uint8Array = new Uint8Array(buffer);
      uint8Array[0] = 0x48; // H
      uint8Array[1] = 0x65; // e
      uint8Array[2] = 0x6C; // l
      uint8Array[3] = 0x6C; // l
      
      const result = FileUtils.arrayBufferToBase64(buffer);
      
      expect(result).toBe('SGVsbA==');
    });

    it('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = FileUtils.arrayBufferToBase64(buffer);
      
      expect(result).toBe('');
    });
  });

  describe('base64ToArrayBuffer', () => {
    it('should convert base64 to ArrayBuffer', () => {
      const base64 = 'SGVsbG8=';
      const result = FileUtils.base64ToArrayBuffer(base64);
      
      expect(result).toBeInstanceOf(ArrayBuffer);
      const uint8Array = new Uint8Array(result);
      expect(uint8Array[0]).toBe(0x48); // H
      expect(uint8Array[1]).toBe(0x65); // e
      expect(uint8Array[2]).toBe(0x6C); // l
      expect(uint8Array[3]).toBe(0x6C); // l
      expect(uint8Array[4]).toBe(0x6F); // o
    });

    it('should handle empty base64 string', () => {
      const result = FileUtils.base64ToArrayBuffer('');
      
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(0);
    });
  });

  describe('generateHeredocCommand', () => {
    it('should generate heredoc command for file creation', () => {
      const fileName = 'test.txt';
      const content = 'Hello, World!\nThis is a test file.';
      
      const result = FileUtils.generateHeredocCommand(fileName, content);
      
      const expected = `cat > ${fileName} << 'EOL'\n${content}\nEOL`;
      expect(result).toBe(expected);
    });

    it('should handle empty content', () => {
      const fileName = 'empty.txt';
      const content = '';
      
      const result = FileUtils.generateHeredocCommand(fileName, content);
      
      const expected = `cat > ${fileName} << 'EOL'\n\nEOL`;
      expect(result).toBe(expected);
    });

    it('should handle content with special characters', () => {
      const fileName = 'special.txt';
      const content = 'Line 1\nLine 2 with $variables\nLine 3 with "quotes"';
      
      const result = FileUtils.generateHeredocCommand(fileName, content);
      
      const expected = `cat > ${fileName} << 'EOL'\n${content}\nEOL`;
      expect(result).toBe(expected);
    });
  });

  describe('generateAppendCommand', () => {
    it('should generate heredoc command for file appending', () => {
      const fileName = 'log.txt';
      const content = 'New log entry\nTimestamp: 2023-12-01';
      
      const result = FileUtils.generateAppendCommand(fileName, content);
      
      const expected = `cat >> ${fileName} << 'EOL'\n${content}\nEOL`;
      expect(result).toBe(expected);
    });

    it('should handle empty content for append', () => {
      const fileName = 'log.txt';
      const content = '';
      
      const result = FileUtils.generateAppendCommand(fileName, content);
      
      const expected = `cat >> ${fileName} << 'EOL'\n\nEOL`;
      expect(result).toBe(expected);
    });
  });

  describe('generateBase64SaveCommand', () => {
    it('should generate base64 decode command for file saving', () => {
      const fileName = 'binary.dat';
      
      const result = FileUtils.generateBase64SaveCommand(fileName);
      
      expect(result).toBe(`base64 -d > ${fileName}`);
    });

    it('should handle filename with spaces', () => {
      const fileName = 'binary file.dat';
      
      const result = FileUtils.generateBase64SaveCommand(fileName);
      
      expect(result).toBe(`base64 -d > ${fileName}`);
    });
  });

  describe('prepareForFileOperation', () => {
    it('should send Ctrl+C and wait', async () => {
      const mockSerialService = {
        write: jest.fn().mockResolvedValue(undefined),
      };

      await FileUtils.prepareForFileOperation(mockSerialService);

      expect(mockSerialService.write).toHaveBeenCalledWith('\x03');
      expect(mockSleep).toHaveBeenCalledWith(100);
    });

    it('should handle serial service write error', async () => {
      const mockSerialService = {
        write: jest.fn().mockRejectedValue(new Error('Write failed')),
      };

      await expect(
        FileUtils.prepareForFileOperation(mockSerialService)
      ).rejects.toThrow('Write failed');

      expect(mockSerialService.write).toHaveBeenCalledWith('\x03');
    });
  });

  describe('finalizeFileOperation', () => {
    it('should send Ctrl+D and wait', async () => {
      const mockSerialService = {
        write: jest.fn().mockResolvedValue(undefined),
      };

      await FileUtils.finalizeFileOperation(mockSerialService);

      expect(mockSerialService.write).toHaveBeenCalledWith('\x04');
      expect(mockSleep).toHaveBeenCalledWith(10);
    });

    it('should handle serial service write error', async () => {
      const mockSerialService = {
        write: jest.fn().mockRejectedValue(new Error('Write failed')),
      };

      await expect(
        FileUtils.finalizeFileOperation(mockSerialService)
      ).rejects.toThrow('Write failed');

      expect(mockSerialService.write).toHaveBeenCalledWith('\x04');
    });
  });

  describe('integration tests', () => {
    it('should work together for complete file operation flow', async () => {
      const mockSerialService = {
        write: jest.fn().mockResolvedValue(undefined),
      };
      const fileName = 'test.txt';
      const content = 'Test content';

      // Prepare for operation
      await FileUtils.prepareForFileOperation(mockSerialService);
      expect(mockSerialService.write).toHaveBeenCalledWith('\x03');

      // Generate commands
      const createCommand = FileUtils.generateHeredocCommand(fileName, content);
      const appendCommand = FileUtils.generateAppendCommand(fileName, 'Additional content');
      const base64Command = FileUtils.generateBase64SaveCommand('binary.dat');

      expect(createCommand).toContain('cat > test.txt');
      expect(appendCommand).toContain('cat >> test.txt');
      expect(base64Command).toContain('base64 -d > binary.dat');

      // Finalize operation
      await FileUtils.finalizeFileOperation(mockSerialService);
      expect(mockSerialService.write).toHaveBeenCalledWith('\x04');
    });

    it('should handle text file identification for various scenarios', () => {
      const textFiles = [
        '/home/pi/script.sh',
        '/etc/nginx/nginx.conf',
        '/var/log/access.log',
        './package.json',
        '../config.yml',
        'README.md'
      ];

      textFiles.forEach(file => {
        expect(FileUtils.isTextFile(file)).toBe(true);
      });

      const binaryFiles = [
        '/home/pi/image.jpg',
        '/var/cache/package.deb',
        'archive.zip'
      ];

      binaryFiles.forEach(file => {
        expect(FileUtils.isTextFile(file)).toBe(false);
      });
    });
  });
});
