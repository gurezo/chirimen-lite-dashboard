import { TestBed } from '@angular/core/testing';
import { SerialError } from '../utils/serial.errors';
import { CommandExecutorService } from './command-executor.service';
import { SerialService } from './serial.service';

// Mock navigator.serial
const mockSerialPort = {
  open: jest.fn(),
  readable: {
    getReader: jest.fn(),
  },
  writable: {
    getWriter: jest.fn(),
  },
  close: jest.fn(),
};

const mockReader = {
  read: jest.fn(),
  cancel: jest.fn(),
};

const mockWriter = {
  write: jest.fn(),
  close: jest.fn(),
};

// Mock CommandExecutorService
jest.mock('./command-executor.service');

describe('SerialService', () => {
  let service: SerialService;
  let mockCommandExecutor: jest.Mocked<CommandExecutorService>;

  beforeEach(() => {
    // Mock navigator.serial
    Object.defineProperty(navigator, 'serial', {
      value: {
        requestPort: jest.fn().mockResolvedValue(mockSerialPort),
      },
      writable: true,
    });

    // Mock CommandExecutorService
    mockCommandExecutor = {
      executeCommand: jest.fn(),
      processInput: jest.fn(),
      getPendingCommandCount: jest.fn(),
      cancelAllCommands: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        SerialService,
        { provide: CommandExecutorService, useValue: mockCommandExecutor },
      ],
    });

    service = TestBed.inject(SerialService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to serial port successfully', async () => {
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);

      await service.connect();

      expect(navigator.serial.requestPort).toHaveBeenCalled();
      expect(mockSerialPort.open).toHaveBeenCalledWith({ baudRate: 115200 });
      expect(mockSerialPort.readable!.getReader).toHaveBeenCalled();
      expect(mockSerialPort.writable!.getWriter).toHaveBeenCalled();
      expect(service.getConnectionStatus()).toBe(true);
    });

    it('should throw SerialError when connection fails', async () => {
      const error = new Error('Port access denied');
      mockSerialPort.open.mockRejectedValue(error);

      await expect(service.connect()).rejects.toThrow(SerialError);
      await expect(service.connect()).rejects.toThrow(
        'Failed to start connection: Port access denied'
      );
    });

    it('should throw SerialError when requestPort fails', async () => {
      const error = new Error('No port selected');
      (navigator.serial.requestPort as jest.Mock).mockRejectedValue(error);

      await expect(service.connect()).rejects.toThrow(SerialError);
      await expect(service.connect()).rejects.toThrow(
        'Failed to start connection: No port selected'
      );
    });
  });

  describe('disconnect', () => {
    beforeEach(async () => {
      // Setup connection first
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);
      await service.connect();
    });

    it('should disconnect successfully', async () => {
      mockReader.cancel.mockResolvedValue(undefined);
      mockWriter.close.mockResolvedValue(undefined);
      mockSerialPort.close.mockResolvedValue(undefined);

      await service.disconnect();

      expect(mockReader.cancel).toHaveBeenCalled();
      expect(mockWriter.close).toHaveBeenCalled();
      expect(mockSerialPort.close).toHaveBeenCalled();
      expect(mockCommandExecutor.cancelAllCommands).toHaveBeenCalled();
      expect(service.getConnectionStatus()).toBe(false);
    });

    it('should throw SerialError when disconnect fails', async () => {
      const error = new Error('Port close failed');
      mockSerialPort.close.mockRejectedValue(error);

      await expect(service.disconnect()).rejects.toThrow(SerialError);
      await expect(service.disconnect()).rejects.toThrow(
        'Failed to terminate connection: Port close failed'
      );
    });
  });

  describe('write', () => {
    beforeEach(async () => {
      // Setup connection first
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);
      await service.connect();
    });

    it('should write data successfully', async () => {
      const testData = 'Hello, World!';
      mockWriter.write.mockResolvedValue(undefined);

      await service.write(testData);

      expect(mockWriter.write).toHaveBeenCalledWith(
        new TextEncoder().encode(testData)
      );
    });

    it('should throw SerialError when port is not initialized', async () => {
      // Disconnect first
      mockReader.cancel.mockResolvedValue(undefined);
      mockWriter.close.mockResolvedValue(undefined);
      mockSerialPort.close.mockResolvedValue(undefined);
      await service.disconnect();

      await expect(service.write('test')).rejects.toThrow(SerialError);
      await expect(service.write('test')).rejects.toThrow(
        'Port not initialized'
      );
    });
  });

  describe('read', () => {
    beforeEach(async () => {
      // Setup connection first
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);
      await service.connect();
    });

    it('should read data successfully', async () => {
      const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      mockReader.read.mockResolvedValue({ value: testData, done: false });

      const result = await service.read();

      expect(result).toEqual(testData);
      expect(mockReader.read).toHaveBeenCalled();
    });

    it('should throw SerialError when read stream is closed', async () => {
      mockReader.read.mockResolvedValue({ value: undefined, done: true });

      await expect(service.read()).rejects.toThrow(SerialError);
      await expect(service.read()).rejects.toThrow('Read stream closed');
    });

    it('should throw SerialError when port is not initialized', async () => {
      // Disconnect first
      mockReader.cancel.mockResolvedValue(undefined);
      mockWriter.close.mockResolvedValue(undefined);
      mockSerialPort.close.mockResolvedValue(undefined);
      await service.disconnect();

      await expect(service.read()).rejects.toThrow(SerialError);
      await expect(service.read()).rejects.toThrow('Port not initialized');
    });
  });

  describe('readString', () => {
    beforeEach(async () => {
      // Setup connection first
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);
      await service.connect();
    });

    it('should read and decode string successfully', async () => {
      const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      mockReader.read.mockResolvedValue({ value: testData, done: false });

      const result = await service.readString();

      expect(result).toBe('Hello');
    });
  });

  describe('execute', () => {
    beforeEach(async () => {
      // Setup connection first
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);
      await service.connect();
    });

    it('should execute command successfully', async () => {
      const command = 'ls -la';
      const prompt = 'pi@raspberrypi:~$';
      const expectedOutput = 'total 123\ndrwxr-xr-x 2 pi pi 4096 Dec 1 10:00 .';

      mockCommandExecutor.executeCommand.mockResolvedValue(expectedOutput);

      const result = await service.execute(command, prompt);

      expect(mockCommandExecutor.executeCommand).toHaveBeenCalledWith(
        command,
        { prompt, timeout: 10000 },
        expect.any(Function)
      );
      expect(result).toBe(expectedOutput);
    });

    it('should execute command with custom timeout', async () => {
      const command = 'ping google.com';
      const prompt = 'pi@raspberrypi:~$';
      const timeout = 30000;

      mockCommandExecutor.executeCommand.mockResolvedValue('PING google.com');

      await service.execute(command, prompt, timeout);

      expect(mockCommandExecutor.executeCommand).toHaveBeenCalledWith(
        command,
        { prompt, timeout },
        expect.any(Function)
      );
    });
  });

  describe('startTerminal', () => {
    beforeEach(async () => {
      // Setup connection first
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);
      await service.connect();
    });

    xit('should start terminal successfully', async () => {
      const callback = jest.fn();
      const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"

      mockReader.read
        .mockResolvedValueOnce({ value: testData, done: false })
        .mockResolvedValueOnce({ value: testData, done: false })
        .mockResolvedValueOnce({ value: undefined, done: true });

      mockCommandExecutor.processInput.mockReturnValue(null);

      // Start terminal in background
      const terminalPromise = service.startTerminal(callback);

      // Stop terminal after a short delay
      setTimeout(() => service.stopTerminal(), 50);

      await terminalPromise;

      // ターミナルが停止されるまで少し待つ
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(service.getTerminalStatus()).toBe(false);
    });

    it('should throw SerialError when not connected', async () => {
      // Disconnect first
      mockReader.cancel.mockResolvedValue(undefined);
      mockWriter.close.mockResolvedValue(undefined);
      mockSerialPort.close.mockResolvedValue(undefined);
      await service.disconnect();

      const callback = jest.fn();

      await expect(service.startTerminal(callback)).rejects.toThrow(
        SerialError
      );
      await expect(service.startTerminal(callback)).rejects.toThrow(
        'Not connected to serial port'
      );
    });

    xit('should handle read stream closed error gracefully', async () => {
      const callback = jest.fn();
      
      mockReader.read.mockResolvedValue({ value: undefined, done: true });
      mockCommandExecutor.processInput.mockReturnValue(null);

      const terminalPromise = service.startTerminal(callback);
      
      // Stop terminal after a short delay
      setTimeout(() => service.stopTerminal(), 50);
      
      await terminalPromise;

      // ターミナルが停止されるまで少し待つ
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(service.getTerminalStatus()).toBe(false);
    });
  });

  describe('stopTerminal', () => {
    it('should stop terminal', () => {
      service.stopTerminal();

      expect(service.getTerminalStatus()).toBe(false);
    });
  });

  describe('getConnectionStatus', () => {
    it('should return false when not connected', () => {
      expect(service.getConnectionStatus()).toBe(false);
    });

    it('should return true when connected', async () => {
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);

      await service.connect();

      expect(service.getConnectionStatus()).toBe(true);
    });
  });

  describe('getTerminalStatus', () => {
    it('should return false when terminal not running', () => {
      expect(service.getTerminalStatus()).toBe(false);
    });
  });

  describe('getPendingCommandCount', () => {
    it('should return pending command count', () => {
      mockCommandExecutor.getPendingCommandCount.mockReturnValue(5);

      const result = service.getPendingCommandCount();

      expect(result).toBe(5);
      expect(mockCommandExecutor.getPendingCommandCount).toHaveBeenCalled();
    });
  });

  describe('legacy method aliases', () => {
    beforeEach(async () => {
      // Setup connection first
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);
      await service.connect();
    });

    it('should call startConnection', async () => {
      const spy = jest.spyOn(service, 'connect');

      await service.startConnection();

      expect(spy).toHaveBeenCalled();
    });

    it('should call terminateConnection', async () => {
      const spy = jest.spyOn(service, 'disconnect');

      await service.terminateConnection();

      expect(spy).toHaveBeenCalled();
    });

    it('should call portWrite', async () => {
      const spy = jest.spyOn(service, 'write');
      mockWriter.write.mockResolvedValue(undefined);

      await service.portWrite('test');

      expect(spy).toHaveBeenCalledWith('test');
    });

    it('should call portWritelnWaitfor', async () => {
      const spy = jest.spyOn(service, 'execute');
      mockCommandExecutor.executeCommand.mockResolvedValue('output');

      await service.portWritelnWaitfor('ls', 'prompt', 5000);

      expect(spy).toHaveBeenCalledWith('ls', 'prompt', 5000);
    });

    it('should call startTermLoop', async () => {
      const spy = jest.spyOn(service, 'startTerminal');
      const callback = jest.fn();

      // Mock the terminal loop to exit quickly
      mockReader.read.mockResolvedValue({ value: undefined, done: true });
      mockCommandExecutor.processInput.mockReturnValue(null);

      const terminalPromise = service.startTermLoop(callback);
      setTimeout(() => service.stopTerminal(), 50);

      await terminalPromise;

      expect(spy).toHaveBeenCalledWith(callback);
    });
  });

  describe('waitForPattern', () => {
    beforeEach(async () => {
      // Setup connection first
      mockSerialPort.open.mockResolvedValue(undefined);
      mockSerialPort.readable!.getReader.mockReturnValue(mockReader);
      mockSerialPort.writable!.getWriter.mockReturnValue(mockWriter);
      await service.connect();
    });

    it('should wait for pattern successfully', async () => {
      mockWriter.write.mockResolvedValue(undefined);

      const result = await service.waitForPattern('username', 'login:', 1000);

      expect(mockWriter.write).toHaveBeenCalledWith(
        new TextEncoder().encode('username')
      );
      expect(result).toBe('Pattern matched');
    });

    it('should timeout when pattern not found', async () => {
      mockWriter.write.mockResolvedValue(undefined);

      // Mock a longer delay to trigger timeout
      jest.useFakeTimers();

      const promise = service.waitForPattern('username', 'login:', 100);

      jest.advanceTimersByTime(200);

      await expect(promise).rejects.toThrow(SerialError);
      await expect(promise).rejects.toThrow('Pattern wait timeout: login:');

      jest.useRealTimers();
    });
  });

  describe('processInput', () => {
    it('should process input through command executor', () => {
      const input = 'test input';
      mockCommandExecutor.processInput.mockReturnValue('processed');

      const result = service.processInput(input);

      expect(mockCommandExecutor.processInput).toHaveBeenCalledWith(input);
      expect(result).toBe('processed');
    });
  });
});
