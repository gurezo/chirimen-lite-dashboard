import { TestBed } from '@angular/core/testing';
import { SerialFacadeService } from '../serial/serial-facade.service';
import { FileOperationService } from './file-operation.service';

jest.mock('../serial/serial-facade.service');

describe('FileOperationService', () => {
  let service: FileOperationService;
  let mockSerial: jest.Mocked<SerialFacadeService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileOperationService, SerialFacadeService],
    });

    service = TestBed.inject(FileOperationService);
    mockSerial = TestBed.inject(
      SerialFacadeService
    ) as jest.Mocked<SerialFacadeService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('removeFile', () => {
    it('should remove file successfully', async () => {
      mockSerial.executeCommand = jest.fn().mockResolvedValue('');

      const result = await service.removeFile('/path/to/file.txt');

      expect(result.success).toBe(true);
      expect(mockSerial.executeCommand).toHaveBeenCalled();
    });
  });

  describe('moveFile', () => {
    it('should move file successfully', async () => {
      mockSerial.executeCommand = jest.fn().mockResolvedValue('');

      const result = await service.moveFile('/from/path', '/to/path');

      expect(result.success).toBe(true);
      expect(mockSerial.executeCommand).toHaveBeenCalled();
    });
  });

  describe('copyFile', () => {
    it('should copy file successfully', async () => {
      mockSerial.executeCommand = jest.fn().mockResolvedValue('');

      const result = await service.copyFile('/from/path', '/to/path');

      expect(result.success).toBe(true);
      expect(mockSerial.executeCommand).toHaveBeenCalled();
    });
  });
});
