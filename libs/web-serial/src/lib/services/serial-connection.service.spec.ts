import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SerialConnectionService } from './serial-connection.service';
import { SerialErrorHandlerService } from './serial-error-handler.service';

describe('SerialConnectionService', () => {
  let service: SerialConnectionService;
  let errorHandlerSpy: ReturnType<typeof vi.mocked<SerialErrorHandlerService>>;

  beforeEach(() => {
    const spy = {
      handleConnectionError: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SerialConnectionService,
        { provide: SerialErrorHandlerService, useValue: spy },
      ],
    });

    service = TestBed.inject(SerialConnectionService);
    errorHandlerSpy = vi.mocked(TestBed.inject(SerialErrorHandlerService));
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

  // Note: Actual connection tests would require mocking the Web Serial API
  // which is complex and typically done in integration tests
});
