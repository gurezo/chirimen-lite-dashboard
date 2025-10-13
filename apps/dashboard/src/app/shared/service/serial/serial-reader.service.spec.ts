import { TestBed } from '@angular/core/testing';
import { SerialErrorHandlerService } from './serial-error-handler.service';
import { SerialReaderService } from './serial-reader.service';

describe('SerialReaderService', () => {
  let service: SerialReaderService;
  let errorHandlerSpy: jasmine.SpyObj<SerialErrorHandlerService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('SerialErrorHandlerService', [
      'handleReadError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SerialReaderService,
        { provide: SerialErrorHandlerService, useValue: spy },
      ],
    });

    service = TestBed.inject(SerialReaderService);
    errorHandlerSpy = TestBed.inject(
      SerialErrorHandlerService
    ) as jasmine.SpyObj<SerialErrorHandlerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be active initially', () => {
    expect(service.isActive()).toBe(false);
  });

  it('should provide data$ observable', (done) => {
    service.data$.subscribe({
      next: (data) => {
        expect(typeof data).toBe('string');
        done();
      },
    });
    // Note: Actual data emission would require mocking SerialPort
  });

  // Note: Actual reading tests would require mocking the Web Serial API
});
