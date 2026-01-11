import { TestBed } from '@angular/core/testing';
import {
  SerialError,
  SerialErrorCode,
} from '@gurezo/web-serial-rxjs';
import { SerialErrorHandlerService } from './serial-error-handler.service';

describe('SerialErrorHandlerService', () => {
  let service: SerialErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SerialErrorHandlerService],
    });
    service = TestBed.inject(SerialErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleConnectionError', () => {
    it('should handle SerialError with NO_PORT_SELECTED code', () => {
      const error = new SerialError(SerialErrorCode.NO_PORT_SELECTED);
      const result = service.handleConnectionError(error);
      expect(result).toContain('No port selected');
    });

    it('should handle SerialError with PORT_ALREADY_OPEN code', () => {
      const error = new SerialError(SerialErrorCode.PORT_ALREADY_OPEN);
      const result = service.handleConnectionError(error);
      expect(result).toContain('already open');
    });

    it('should handle DOMException with NO_SELECTED message', () => {
      const error = new DOMException("Failed to execute 'requestPort' on 'Serial': No port selected by the user.");
      const result = service.handleConnectionError(error);
      expect(result).toContain('No port selected');
    });

    it('should handle DOMException with PORT_ALREADY_OPEN message', () => {
      const error = new DOMException("Failed to execute 'open' on 'SerialPort': The port is already open.");
      const result = service.handleConnectionError(error);
      expect(result).toContain('already open');
    });

    it('should handle generic Error', () => {
      const error = new Error('Test error');
      const result = service.handleConnectionError(error);
      expect(result).toBe('Test error');
    });

    it('should handle unknown error type', () => {
      const error = 'string error';
      const result = service.handleConnectionError(error);
      expect(result).toBe('Unknown error');
    });
  });

  describe('getRaspberryPiZeroError', () => {
    it('should return Raspberry Pi Zero error message', () => {
      const result = service.getRaspberryPiZeroError();
      expect(result).toBe('Web Serial is not Raspberry Pi Zero');
    });
  });

  describe('handleReadError', () => {
    it('should handle read Error', () => {
      const error = new Error('Read failed');
      const result = service.handleReadError(error);
      expect(result).toBe('Read error: Read failed');
    });

    it('should handle unknown read error', () => {
      const error = 'unknown';
      const result = service.handleReadError(error);
      expect(result).toBe('Unknown read error');
    });
  });

  describe('handleWriteError', () => {
    it('should handle write Error', () => {
      const error = new Error('Write failed');
      const result = service.handleWriteError(error);
      expect(result).toBe('Write error: Write failed');
    });

    it('should handle unknown write error', () => {
      const error = 'unknown';
      const result = service.handleWriteError(error);
      expect(result).toBe('Unknown write error');
    });
  });
});
