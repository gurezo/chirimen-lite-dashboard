import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SerialCommandService } from './serial-command.service';
import { SerialFacadeService } from './serial-facade.service';
import { SerialTransportService } from './serial-transport.service';
import { SerialValidatorService } from './serial-validator.service';

vi.mock('./serial-transport.service');
vi.mock('./serial-command.service');
vi.mock('./serial-validator.service');

describe('SerialFacadeService', () => {
  let service: SerialFacadeService;
  let mockTransport: ReturnType<typeof vi.mocked<SerialTransportService>>;
  let mockCommand: ReturnType<typeof vi.mocked<SerialCommandService>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SerialFacadeService,
        SerialTransportService,
        SerialCommandService,
        SerialValidatorService,
      ],
    });

    service = TestBed.inject(SerialFacadeService);
    mockTransport = vi.mocked(TestBed.inject(SerialTransportService));
    mockCommand = vi.mocked(TestBed.inject(SerialCommandService));

    mockTransport.isConnected = vi.fn().mockReturnValue(false);
    mockTransport.connect = vi.fn().mockResolvedValue({ error: 'not connected' });
    mockTransport.getReadStream = vi.fn().mockReturnValue(of(''));
    mockTransport.write = vi.fn().mockReturnValue(of(undefined));
    mockTransport.getPort = vi.fn().mockReturnValue(undefined);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      const mockPort = {} as SerialPort;
      mockTransport.connect = vi.fn().mockResolvedValue({ port: mockPort });
      mockTransport.isConnected = vi.fn().mockReturnValue(false);
      const mockValidator = vi.mocked(TestBed.inject(SerialValidatorService));
      mockValidator.isSupportedDevice = vi.fn().mockResolvedValue(true);

      const result = await service.connect(115200);

      expect(result).toBe(true);
      expect(mockTransport.connect).toHaveBeenCalledWith(115200);
    });

    it('should return false on connection error', async () => {
      mockTransport.connect = vi
        .fn()
        .mockResolvedValue({ error: 'Connection failed' });
      mockTransport.isConnected = vi.fn().mockReturnValue(false);

      const result = await service.connect(115200);

      expect(result).toBe(false);
    });

    it('should disconnect and return false when device not supported', async () => {
      const mockPort = {} as SerialPort;
      mockTransport.connect = vi.fn().mockResolvedValue({ port: mockPort });
      mockTransport.disconnect = vi.fn().mockResolvedValue(undefined);
      mockTransport.isConnected = vi.fn().mockReturnValue(false);
      const mockValidator = vi.mocked(TestBed.inject(SerialValidatorService));
      mockValidator.isSupportedDevice = vi.fn().mockResolvedValue(false);

      const result = await service.connect(115200);

      expect(result).toBe(false);
      expect(mockTransport.disconnect).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should disconnect properly', async () => {
      mockCommand.cancelAllCommands = vi.fn();
      mockTransport.disconnect = vi.fn().mockResolvedValue(undefined);
      mockTransport.isConnected = vi.fn().mockReturnValue(true);

      await service.disconnect();

      expect(mockCommand.cancelAllCommands).toHaveBeenCalled();
      expect(mockTransport.disconnect).toHaveBeenCalled();
    });
  });

  describe('write', () => {
    it('should write data via transport', async () => {
      mockTransport.isConnected = vi.fn().mockReturnValue(true);
      mockTransport.write = vi.fn().mockReturnValue(of(undefined));

      await service.write('test data');

      expect(mockTransport.write).toHaveBeenCalledWith('test data');
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
    it('should return connection status from transport', () => {
      mockTransport.isConnected = vi.fn().mockReturnValue(true);

      const result = service.isConnected();

      expect(result).toBe(true);
      expect(mockTransport.isConnected).toHaveBeenCalled();
    });
  });
});
