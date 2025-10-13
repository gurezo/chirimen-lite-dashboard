import { CommandUtils } from './command-utils';
import { SerialService } from '../services/serial.service';
import { ErrorHandler } from './error-handler';

// Mock SerialService
jest.mock('../services/serial.service');
jest.mock('./error-handler');

describe('CommandUtils', () => {
  let mockSerialService: jest.Mocked<SerialService>;
  let mockErrorHandler: jest.Mocked<typeof ErrorHandler>;

  beforeEach(() => {
    mockSerialService = {
      portWritelnWaitfor: jest.fn(),
    } as any;

    mockErrorHandler = {
      wrapError: jest.fn(),
    } as any;

    (ErrorHandler as any) = mockErrorHandler;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeCommand', () => {
    it('should execute command successfully', async () => {
      const command = 'ls -la';
      const prompt = 'pi@raspberrypi:~$';
      const expectedOutput = 'total 123\ndrwxr-xr-x 2 pi pi 4096 Dec 1 10:00 .';
      
      mockSerialService.portWritelnWaitfor.mockResolvedValue(expectedOutput);

      const result = await CommandUtils.executeCommand(
        mockSerialService,
        command,
        prompt
      );

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        command,
        prompt,
        10000
      );
      expect(result).toBe(expectedOutput);
    });

    it('should execute command with custom timeout', async () => {
      const command = 'ping google.com';
      const prompt = 'pi@raspberrypi:~$';
      const timeout = 30000;
      const expectedOutput = 'PING google.com (142.250.190.78) 56(84) bytes of data.';
      
      mockSerialService.portWritelnWaitfor.mockResolvedValue(expectedOutput);

      const result = await CommandUtils.executeCommand(
        mockSerialService,
        command,
        prompt,
        timeout
      );

      expect(mockSerialService.portWritelnWaitfor).toHaveBeenCalledWith(
        command,
        prompt,
        timeout
      );
      expect(result).toBe(expectedOutput);
    });

    it('should handle command execution error', async () => {
      const command = 'invalid-command';
      const prompt = 'pi@raspberrypi:~$';
      const originalError = new Error('Serial communication failed');
      const wrappedError = new Error('Command execution failed: invalid-command');
      
      mockSerialService.portWritelnWaitfor.mockRejectedValue(originalError);
      mockErrorHandler.wrapError.mockReturnValue(wrappedError);

      await expect(
        CommandUtils.executeCommand(mockSerialService, command, prompt)
      ).rejects.toThrow('Command execution failed: invalid-command');

      expect(mockErrorHandler.wrapError).toHaveBeenCalledWith(
        originalError,
        'Command execution failed: invalid-command'
      );
    });
  });

  describe('escapePath', () => {
    it('should escape simple path', () => {
      const path = '/home/pi/documents';
      const result = CommandUtils.escapePath(path);
      
      expect(result).toBe("$'/home/pi/documents'");
    });

    it('should escape path with spaces', () => {
      const path = '/home/pi/my documents';
      const result = CommandUtils.escapePath(path);
      
      expect(result).toBe("$'/home/pi/my documents'");
    });

    it('should escape path with special characters', () => {
      const path = '/home/pi/file (1).txt';
      const result = CommandUtils.escapePath(path);
      
      expect(result).toBe("$'/home/pi/file (1).txt'");
    });

    it('should handle empty path', () => {
      const path = '';
      const result = CommandUtils.escapePath(path);
      
      expect(result).toBe("$''");
    });

    it('should handle path with quotes', () => {
      const path = '/home/pi/"quoted" folder';
      const result = CommandUtils.escapePath(path);
      
      expect(result).toBe("$'/home/pi/\\\"quoted\\\" folder'");
    });
  });

  describe('parseOutputLines', () => {
    it('should parse output with multiple lines', () => {
      const output = 'line1\nline2\nline3';
      const result = CommandUtils.parseOutputLines(output);
      
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should remove empty lines', () => {
      const output = 'line1\n\nline2\n  \nline3';
      const result = CommandUtils.parseOutputLines(output);
      
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should trim whitespace from lines', () => {
      const output = '  line1  \n\tline2\t\n  line3  ';
      const result = CommandUtils.parseOutputLines(output);
      
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should handle single line', () => {
      const output = 'single line';
      const result = CommandUtils.parseOutputLines(output);
      
      expect(result).toEqual(['single line']);
    });

    it('should handle empty output', () => {
      const output = '';
      const result = CommandUtils.parseOutputLines(output);
      
      expect(result).toEqual([]);
    });

    it('should handle output with only whitespace', () => {
      const output = '\n  \n\t\n';
      const result = CommandUtils.parseOutputLines(output);
      
      expect(result).toEqual([]);
    });
  });

  describe('getSudoPrefix', () => {
    it('should return empty string when useSudo is false', () => {
      const result = CommandUtils.getSudoPrefix(false);
      
      expect(result).toBe('');
    });

    it('should return empty string when useSudo is undefined', () => {
      const result = CommandUtils.getSudoPrefix();
      
      expect(result).toBe('');
    });

    it('should return sudo prefix when useSudo is true', () => {
      const result = CommandUtils.getSudoPrefix(true);
      
      expect(result).toBe('sudo ');
    });
  });
});
