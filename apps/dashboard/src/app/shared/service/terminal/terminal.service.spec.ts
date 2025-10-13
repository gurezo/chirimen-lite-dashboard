import { TestBed } from '@angular/core/testing';
import { Terminal } from '@xterm/xterm';
import { SerialConnectionService } from '../serial/serial-connection.service';
import { SerialErrorHandlerService } from '../serial/serial-error-handler.service';
import { SerialReaderService } from '../serial/serial-reader.service';
import { SerialValidatorService } from '../serial/serial-validator.service';
import { SerialWriterService } from '../serial/serial-writer.service';
import { TerminalService } from './terminal.service';

describe('TerminalService', () => {
  let service: TerminalService;
  let connectionSpy: jasmine.SpyObj<SerialConnectionService>;
  let readerSpy: jasmine.SpyObj<SerialReaderService>;
  let writerSpy: jasmine.SpyObj<SerialWriterService>;
  let validatorSpy: jasmine.SpyObj<SerialValidatorService>;
  let errorHandlerSpy: jasmine.SpyObj<SerialErrorHandlerService>;

  beforeEach(() => {
    const connSpy = jasmine.createSpyObj('SerialConnectionService', [
      'connect',
      'disconnect',
      'isConnected',
    ]);
    const readSpy = jasmine.createSpyObj(
      'SerialReaderService',
      ['startReading', 'stopReading'],
      { data$: { subscribe: () => ({ unsubscribe: () => {} }) } }
    );
    const writeSpy = jasmine.createSpyObj('SerialWriterService', [
      'initialize',
      'write',
      'dispose',
      'isReady',
    ]);
    const valSpy = jasmine.createSpyObj('SerialValidatorService', [
      'isSupportedDevice',
    ]);
    const errSpy = jasmine.createSpyObj('SerialErrorHandlerService', [
      'getRaspberryPiZeroError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        TerminalService,
        { provide: SerialConnectionService, useValue: connSpy },
        { provide: SerialReaderService, useValue: readSpy },
        { provide: SerialWriterService, useValue: writeSpy },
        { provide: SerialValidatorService, useValue: valSpy },
        { provide: SerialErrorHandlerService, useValue: errSpy },
      ],
    });

    service = TestBed.inject(TerminalService);
    connectionSpy = TestBed.inject(
      SerialConnectionService
    ) as jasmine.SpyObj<SerialConnectionService>;
    readerSpy = TestBed.inject(
      SerialReaderService
    ) as jasmine.SpyObj<SerialReaderService>;
    writerSpy = TestBed.inject(
      SerialWriterService
    ) as jasmine.SpyObj<SerialWriterService>;
    validatorSpy = TestBed.inject(
      SerialValidatorService
    ) as jasmine.SpyObj<SerialValidatorService>;
    errorHandlerSpy = TestBed.inject(
      SerialErrorHandlerService
    ) as jasmine.SpyObj<SerialErrorHandlerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize terminal', () => {
    const terminal = new Terminal();
    service.initialize(terminal);
    expect(service.getTerminal()).toBe(terminal);
  });

  it('should return not connected initially', () => {
    connectionSpy.isConnected.and.returnValue(false);
    expect(service.isConnected()).toBe(false);
  });

  it('should handle terminal not initialized when connecting', async () => {
    const result = await service.connectToSerial();
    expect(result.success).toBe(false);
    expect(result.message).toBe('Terminal not initialized');
  });

  // Note: More complex connection tests would require extensive mocking
});
