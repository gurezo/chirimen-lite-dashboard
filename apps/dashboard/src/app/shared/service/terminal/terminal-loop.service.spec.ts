import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { SerialCommandService } from '../serial/serial-command.service';
import { SerialReaderService } from '../serial/serial-reader.service';
import { TerminalLoopService } from './terminal-loop.service';

jest.mock('../serial/serial-reader.service');
jest.mock('../serial/serial-command.service');

describe('TerminalLoopService', () => {
  let service: TerminalLoopService;
  let mockReader: jest.Mocked<SerialReaderService>;
  let mockCommand: jest.Mocked<SerialCommandService>;
  let dataSubject: Subject<string>;

  beforeEach(() => {
    dataSubject = new Subject<string>();

    TestBed.configureTestingModule({
      providers: [
        TerminalLoopService,
        SerialReaderService,
        SerialCommandService,
      ],
    });

    service = TestBed.inject(TerminalLoopService);
    mockReader = TestBed.inject(
      SerialReaderService
    ) as jest.Mocked<SerialReaderService>;
    mockCommand = TestBed.inject(
      SerialCommandService
    ) as jest.Mocked<SerialCommandService>;

    Object.defineProperty(mockReader, 'data$', {
      get: () => dataSubject.asObservable(),
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startLoop', () => {
    it('should throw error if reader is not active', async () => {
      mockReader.isActive = jest.fn().mockReturnValue(false);

      await expect(
        service.startLoop((data) => console.log(data))
      ).rejects.toThrow('Serial reader is not active');
    });

    it('should process data through callback', async () => {
      mockReader.isActive = jest.fn().mockReturnValue(true);
      mockCommand.processInput = jest.fn().mockReturnValue(null);

      const callback = jest.fn();
      const loopPromise = service.startLoop(callback);

      // データを送信
      dataSubject.next('test data');

      // ループを停止
      setTimeout(() => service.stopLoop(), 100);

      await loopPromise;

      expect(callback).toHaveBeenCalled();
      expect(mockCommand.processInput).toHaveBeenCalledWith('test data');
    });

    it('should skip data if processed as command response', async () => {
      mockReader.isActive = jest.fn().mockReturnValue(true);
      mockCommand.processInput = jest.fn().mockReturnValue('command response');

      const callback = jest.fn();
      const loopPromise = service.startLoop(callback);

      // データを送信（コマンドレスポンスとして処理される）
      dataSubject.next('command response');

      // ループを停止
      setTimeout(() => service.stopLoop(), 100);

      await loopPromise;

      // コールバックは呼ばれない
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('stopLoop', () => {
    it('should stop the loop', () => {
      expect(service.isActive()).toBe(false);

      service.stopLoop();

      expect(service.isActive()).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return loop status', () => {
      expect(service.isActive()).toBe(false);
    });
  });
});
