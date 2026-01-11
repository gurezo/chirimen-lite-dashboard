import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';
import { SerialWriterService } from './serial-writer.service';

describe('SerialWriterService', () => {
  let service: SerialWriterService;
  let errorHandlerSpy: ReturnType<typeof vi.mocked<SerialErrorHandlerService>>;
  let connectionSpy: ReturnType<typeof vi.mocked<SerialConnectionService>>;

  beforeEach(() => {
    const errorHandlerMock = {
      handleWriteError: vi.fn().mockReturnValue('Write error'),
    };

    const connectionMock = {
      getClient: vi.fn().mockReturnValue(undefined),
      isConnected: vi.fn().mockReturnValue(false),
    };

    TestBed.configureTestingModule({
      providers: [
        SerialWriterService,
        { provide: SerialErrorHandlerService, useValue: errorHandlerMock },
        { provide: SerialConnectionService, useValue: connectionMock },
      ],
    });

    service = TestBed.inject(SerialWriterService);
    errorHandlerSpy = vi.mocked(TestBed.inject(SerialErrorHandlerService));
    connectionSpy = vi.mocked(TestBed.inject(SerialConnectionService));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be ready initially', () => {
    expect(service.isReady()).toBe(false);
  });

  it('should throw error when writing without connection', (done) => {
    const mockPort = {} as SerialPort;
    service.write(mockPort, 'test').subscribe({
      error: (error) => {
        expect(error.message).toBe('Serial port not connected');
        done();
      },
    });
  });

  it('should write data when client is connected', (done) => {
    const mockPort = {} as SerialPort;
    const mockClient = {
      connected: true,
      write: vi.fn().mockReturnValue(of(undefined)),
    };

    connectionSpy.getClient = vi.fn().mockReturnValue(mockClient);

    service.write(mockPort, 'test').subscribe({
      next: () => {
        expect(mockClient.write).toHaveBeenCalled();
        done();
      },
    });
  });

  // Note: Actual writing tests would require mocking the Web Serial API
});
