import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';
import { SerialReaderService } from './serial-reader.service';

describe('SerialReaderService', () => {
  let service: SerialReaderService;
  let connectionSpy: ReturnType<typeof vi.mocked<SerialConnectionService>>;

  beforeEach(() => {
    const errorHandlerMock = {
      handleReadError: vi.fn().mockReturnValue('Read error'),
    };

    const connectionMock = {
      getClient: vi.fn().mockReturnValue(undefined),
      isConnected: vi.fn().mockReturnValue(false),
    };

    TestBed.configureTestingModule({
      providers: [
        SerialReaderService,
        { provide: SerialErrorHandlerService, useValue: errorHandlerMock },
        { provide: SerialConnectionService, useValue: connectionMock },
      ],
    });

    service = TestBed.inject(SerialReaderService);
    connectionSpy = vi.mocked(TestBed.inject(SerialConnectionService));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be active initially', () => {
    expect(service.isActive()).toBe(false);
  });

  it('should throw error when reading without connection', (done) => {
    const mockPort = {} as SerialPort;
    service.read(mockPort).subscribe({
      error: (error) => {
        expect(error.message).toBe('Serial port not connected');
        done();
      },
    });
  });

  it('should return observable when client is connected', (done) => {
    const mockPort = {} as SerialPort;
    const mockClient = {
      connected: true,
      getReadStream: vi.fn().mockReturnValue(of(new Uint8Array([72, 101, 108, 108, 111]))),
    };

    connectionSpy.getClient = vi.fn().mockReturnValue(mockClient);

    service.read(mockPort).subscribe({
      next: (data) => {
        expect(typeof data).toBe('string');
        expect(data).toBe('Hello');
        done();
      },
    });
  });

  // Note: Actual reading tests would require mocking the Web Serial API
});
