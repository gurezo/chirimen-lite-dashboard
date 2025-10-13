import { TestBed } from '@angular/core/testing';
import { SerialCommandService } from './serial-command.service';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';
import { SerialFacadeService } from './serial-facade.service';
import { SerialReaderService } from './serial-reader.service';
import { SerialValidatorService } from './serial-validator.service';
import { SerialWriterService } from './serial-writer.service';

jest.mock('./serial-connection.service');
jest.mock('./serial-reader.service');
jest.mock('./serial-writer.service');
jest.mock('./serial-command.service');
jest.mock('./serial-error-handler.service');
jest.mock('./serial-validator.service');

describe('SerialFacadeService', () => {
  let service: SerialFacadeService;
  let mockConnection: jest.Mocked<SerialConnectionService>;
  let mockReader: jest.Mocked<SerialReaderService>;
  let mockWriter: jest.Mocked<SerialWriterService>;
  let mockCommand: jest.Mocked<SerialCommandService>;

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
    mockConnection = TestBed.inject(
      SerialConnectionService
    ) as jest.Mocked<SerialConnectionService>;
    mockReader = TestBed.inject(
      SerialReaderService
    ) as jest.Mocked<SerialReaderService>;
    mockWriter = TestBed.inject(
      SerialWriterService
    ) as jest.Mocked<SerialWriterService>;
    mockCommand = TestBed.inject(
      SerialCommandService
    ) as jest.Mocked<SerialCommandService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      const mockPort = {} as SerialPort;
      mockConnection.connect = jest.fn().mockResolvedValue({ port: mockPort });
      mockWriter.initialize = jest.fn();
      mockReader.startReading = jest.fn().mockResolvedValue(undefined);

      const result = await service.connect(115200);

      expect(result).toBe(true);
      expect(mockConnection.connect).toHaveBeenCalledWith(115200);
      expect(mockWriter.initialize).toHaveBeenCalledWith(mockPort);
      expect(mockReader.startReading).toHaveBeenCalledWith(mockPort);
    });

    it('should return false on connection error', async () => {
      mockConnection.connect = jest
        .fn()
        .mockResolvedValue({ error: 'Connection failed' });

      const result = await service.connect(115200);

      expect(result).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect properly', async () => {
      mockReader.stopReading = jest.fn().mockResolvedValue(undefined);
      mockWriter.dispose = jest.fn();
      mockCommand.cancelAllCommands = jest.fn();
      mockConnection.disconnect = jest.fn().mockResolvedValue(undefined);

      await service.disconnect();

      expect(mockReader.stopReading).toHaveBeenCalled();
      expect(mockWriter.dispose).toHaveBeenCalled();
      expect(mockCommand.cancelAllCommands).toHaveBeenCalled();
      expect(mockConnection.disconnect).toHaveBeenCalled();
    });
  });

  describe('write', () => {
    it('should write data', async () => {
      mockWriter.writeSync = jest.fn().mockResolvedValue(undefined);

      await service.write('test data');

      expect(mockWriter.writeSync).toHaveBeenCalledWith('test data');
    });
  });

  describe('executeCommand', () => {
    it('should execute command', async () => {
      const expectedResult = 'command output';
      mockCommand.executeCommand = jest.fn().mockResolvedValue(expectedResult);

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
      mockConnection.isConnected = jest.fn().mockReturnValue(true);

      const result = service.isConnected();

      expect(result).toBe(true);
      expect(mockConnection.isConnected).toHaveBeenCalled();
    });
  });
});
