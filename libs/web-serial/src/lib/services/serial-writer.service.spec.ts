import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SerialErrorHandlerService } from './serial-error-handler.service';
import { SerialWriterService } from './serial-writer.service';

describe('SerialWriterService', () => {
  let service: SerialWriterService;
  let errorHandlerSpy: ReturnType<typeof vi.mocked<SerialErrorHandlerService>>;

  beforeEach(() => {
    const spy = {
      handleWriteError: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SerialWriterService,
        { provide: SerialErrorHandlerService, useValue: spy },
      ],
    });

    service = TestBed.inject(SerialWriterService);
    errorHandlerSpy = vi.mocked(TestBed.inject(SerialErrorHandlerService));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be ready initially', () => {
    expect(service.isReady()).toBe(false);
  });

  it('should throw error when writing without initialization', async () => {
    await expect(service.write('test')).rejects.toThrow(
      'SerialWriter not initialized. Call initialize() first.'
    );
  });

  // Note: Actual writing tests would require mocking the Web Serial API
});
