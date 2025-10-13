import { TestBed } from '@angular/core/testing';
import { SerialErrorHandlerService } from './serial-error-handler.service';
import { SerialWriterService } from './serial-writer.service';

describe('SerialWriterService', () => {
  let service: SerialWriterService;
  let errorHandlerSpy: jasmine.SpyObj<SerialErrorHandlerService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('SerialErrorHandlerService', [
      'handleWriteError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SerialWriterService,
        { provide: SerialErrorHandlerService, useValue: spy },
      ],
    });

    service = TestBed.inject(SerialWriterService);
    errorHandlerSpy = TestBed.inject(
      SerialErrorHandlerService
    ) as jasmine.SpyObj<SerialErrorHandlerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be ready initially', () => {
    expect(service.isReady()).toBe(false);
  });

  it('should throw error when writing without initialization', async () => {
    await expectAsync(service.write('test')).toBeRejectedWithError(
      'SerialWriter not initialized. Call initialize() first.'
    );
  });

  // Note: Actual writing tests would require mocking the Web Serial API
});
