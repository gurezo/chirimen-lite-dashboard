import { TestBed } from '@angular/core/testing';
import { SerialFacadeService } from '../serial/serial-facade.service';
import { FileListService } from './file-list.service';

jest.mock('../serial/serial-facade.service');

describe('FileListService', () => {
  let service: FileListService;
  let mockSerial: jest.Mocked<SerialFacadeService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileListService, SerialFacadeService],
    });

    service = TestBed.inject(FileListService);
    mockSerial = TestBed.inject(
      SerialFacadeService
    ) as jest.Mocked<SerialFacadeService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      const mockOutput = 'total 0\ndrwxr-xr-x 2 pi pi 4096 Jan 1 file1.txt';
      mockSerial.executeCommand = jest.fn().mockResolvedValue(mockOutput);

      const result = await service.listFiles();

      expect(result).toBeDefined();
      expect(mockSerial.executeCommand).toHaveBeenCalledWith(
        'ls -la',
        'pi@raspberrypi:',
        10000
      );
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      mockSerial.executeCommand = jest.fn().mockResolvedValue('exists');

      const result = await service.fileExists('/path/to/file.txt');

      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      mockSerial.executeCommand = jest.fn().mockResolvedValue('not found');

      const result = await service.fileExists('/path/to/file.txt');

      expect(result).toBe(false);
    });
  });
});
