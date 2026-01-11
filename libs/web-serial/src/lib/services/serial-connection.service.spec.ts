import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';

// Mock @gurezo/web-serial-rxjs
vi.mock('@gurezo/web-serial-rxjs', () => {
  return {
    createSerialClient: vi.fn(() => ({
      connected: false,
      currentPort: undefined,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getReadStream: vi.fn(),
      write: vi.fn(),
    })),
    SerialError: class extends Error {
      constructor(public code: string) {
        super();
      }
    },
    SerialErrorCode: {
      NO_PORT_SELECTED: 'NO_PORT_SELECTED',
      PORT_ALREADY_OPEN: 'PORT_ALREADY_OPEN',
      CONNECTION_FAILED: 'CONNECTION_FAILED',
      DEVICE_NOT_SUPPORTED: 'DEVICE_NOT_SUPPORTED',
      READ_ERROR: 'READ_ERROR',
      WRITE_ERROR: 'WRITE_ERROR',
    },
  };
});

describe('SerialConnectionService', () => {
  let service: SerialConnectionService;

  beforeEach(() => {
    const spy = {
      handleConnectionError: vi.fn().mockReturnValue('Connection error'),
    };

    TestBed.configureTestingModule({
      providers: [
        SerialConnectionService,
        { provide: SerialErrorHandlerService, useValue: spy },
      ],
    });

    service = TestBed.inject(SerialConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return isConnected as false initially', () => {
    expect(service.isConnected()).toBe(false);
  });

  it('should return undefined port initially', () => {
    expect(service.getPort()).toBeUndefined();
  });

  it('should return undefined client initially', () => {
    expect(service.getClient()).toBeUndefined();
  });

  // Note: Actual connection tests would require mocking the Web Serial API
  // which is complex and typically done in integration tests
});
