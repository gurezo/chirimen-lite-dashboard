import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SerialCommandService } from './serial-command.service';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';
import { SerialFacadeService } from './serial-facade.service';
import { SerialReaderService } from './serial-reader.service';
import { SerialValidatorService } from './serial-validator.service';
import { SerialWriterService } from './serial-writer.service';

vi.mock('./serial-connection.service');
vi.mock('./serial-reader.service');
vi.mock('./serial-writer.service');
vi.mock('./serial-command.service');
vi.mock('./serial-error-handler.service');
vi.mock('./serial-validator.service');

describe('SerialFacadeService', () => {
  let service: SerialFacadeService;
  let mockConnection: ReturnType<typeof vi.mocked<SerialConnectionService>>;
  let mockReader: ReturnType<typeof vi.mocked<SerialReaderService>>;
  let mockWriter: ReturnType<typeof vi.mocked<SerialWriterService>>;
  let mockCommand: ReturnType<typeof vi.mocked<SerialCommandService>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SerialFacadeService,
        SerialConnectionService,
        SerialReaderService,
        SerialWriterService,
        SerialCommandService,
        SerialErrorHandlerService,
        SerialValidatorService,
      ],
    });

    service = TestBed.inject(SerialFacadeService);
    mockConnection = vi.mocked(TestBed.inject(SerialConnectionService));
    mockReader = vi.mocked(TestBed.inject(SerialReaderService));
    mockWriter = vi.mocked(TestBed.inject(SerialWriterService));
    mockCommand = vi.mocked(TestBed.inject(SerialCommandService));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      const mockPort = {} as SerialPort;
      const mockValidator = vi.mocked(TestBed.inject(SerialValidatorService));
      mockConnection.connect = vi.fn().mockResolvedValue({ port: mockPort });
      mockConnection.isConnected = vi.fn().mockReturnValue(false);
      mockValidator.isSupportedDevice = vi.fn().mockResolvedValue(true);

      const result = await service.connect(115200);

      expect(result).toBe(true);
      expect(mockConnection.connect).toHaveBeenCalledWith(115200);
    });

    it('should return false on connection error', async () => {
      mockConnection.connect = vi
        .fn()
        .mockResolvedValue({ error: 'Connection failed' });
      mockConnection.isConnected = vi.fn().mockReturnValue(false);

      const result = await service.connect(115200);

      expect(result).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect properly', async () => {
      mockCommand.cancelAllCommands = vi.fn();
      mockConnection.disconnect = vi.fn().mockResolvedValue(undefined);
      mockConnection.isConnected = vi.fn().mockReturnValue(true);

      await service.disconnect();

      expect(mockCommand.cancelAllCommands).toHaveBeenCalled();
      expect(mockConnection.disconnect).toHaveBeenCalled();
    });
  });

  describe('write', () => {
    it('should write data', async () => {
      const mockPort = {} as SerialPort;
      mockConnection.isConnected = vi.fn().mockReturnValue(true);
      (service as any).currentPort = mockPort;
      mockWriter.write = vi.fn().mockReturnValue(Promise.resolve());

      await service.write('test data');

      expect(mockWriter.write).toHaveBeenCalledWith(mockPort, 'test data');
    });
  });

  describe('executeCommand', () => {
    it('should execute command', async () => {
      const expectedResult = 'command output';
      mockCommand.executeCommand = vi.fn().mockResolvedValue(expectedResult);

      const result = await service.executeCommand(
        'ls',
        'pi@raspberrypi:',
        10000
      );

      expect(result).toBe(expectedResult);
      expect(mockCommand.executeCommand).toHaveBeenCalled();
    });
  });

  describe('isConnected', () => {
    it('should return connection status', () => {
      mockConnection.isConnected = vi.fn().mockReturnValue(true);

      const result = service.isConnected();

      expect(result).toBe(true);
      expect(mockConnection.isConnected).toHaveBeenCalled();
    });
  });
});
