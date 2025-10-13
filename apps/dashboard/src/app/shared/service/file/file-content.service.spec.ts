import { TestBed } from '@angular/core/testing';
import { SerialFacadeService } from '../serial/serial-facade.service';
import { FileContentService } from './file-content.service';

jest.mock('../serial/serial-facade.service');

describe('FileContentService', () => {
  let service: FileContentService;
  let mockSerial: jest.Mocked<SerialFacadeService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileContentService, SerialFacadeService],
    });

    service = TestBed.inject(FileContentService);
    mockSerial = TestBed.inject(
      SerialFacadeService
    ) as jest.Mocked<SerialFacadeService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('readFile', () => {
    it('should read file successfully', async () => {
      const mockBase64 = 'SGVsbG8gV29ybGQ='; // "Hello World"
      const mockOutput = `base64\n${mockBase64}\npi@raspberrypi:`;
      mockSerial.executeCommand = jest.fn().mockResolvedValue(mockOutput);

      const result = await service.readFile('/path/to/file.txt');

      expect(result).toBeDefined();
      expect(result.isText).toBe(true);
    });
  });

  describe('writeTextFile', () => {
    it('should write text file successfully', async () => {
      mockSerial.executeCommand = jest.fn().mockResolvedValue('');

      await service.writeTextFile('/path/to/file.txt', 'Hello World');

      expect(mockSerial.executeCommand).toHaveBeenCalled();
    });
  });
});
