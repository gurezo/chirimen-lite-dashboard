import { TestBed } from '@angular/core/testing';
import {
  CommandExecutionConfig,
  SerialCommandService,
} from './serial-command.service';

describe('SerialCommandService', () => {
  let service: SerialCommandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SerialCommandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('executeCommand', () => {
    it('should execute command and resolve on prompt match', async () => {
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:',
        timeout: 1000,
      };

      const writeFunction = jest.fn().mockResolvedValue(undefined);
      const commandPromise = service.executeCommand(
        'ls',
        config,
        writeFunction
      );

      // プロンプトをシミュレート
      setTimeout(() => {
        service.processInput('file1\nfile2\npi@raspberrypi:');
      }, 100);

      const result = await commandPromise;
      expect(result).toContain('pi@raspberrypi:');
      expect(writeFunction).toHaveBeenCalledWith('ls\n');
    });

    it('should reject on timeout', async () => {
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:',
        timeout: 100,
      };

      const writeFunction = jest.fn().mockResolvedValue(undefined);

      await expect(
        service.executeCommand('ls', config, writeFunction)
      ).rejects.toThrow('Command execution timeout');
    });

    it('should reject if write function fails', async () => {
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:',
        timeout: 1000,
      };

      const writeFunction = jest
        .fn()
        .mockRejectedValue(new Error('Write failed'));

      await expect(
        service.executeCommand('ls', config, writeFunction)
      ).rejects.toThrow('Write failed');
    });
  });

  describe('processInput', () => {
    it('should return input when prompt matches', () => {
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:',
        timeout: 1000,
      };

      const writeFunction = jest.fn().mockResolvedValue(undefined);
      service.executeCommand('ls', config, writeFunction);

      const result = service.processInput('pi@raspberrypi:');
      expect(result).toBe('pi@raspberrypi:');
    });

    it('should return null when prompt does not match', () => {
      const result = service.processInput('some other text');
      expect(result).toBeNull();
    });
  });

  describe('cancelCommand', () => {
    it('should cancel specific command', async () => {
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:',
        timeout: 1000,
      };

      const writeFunction = jest.fn().mockResolvedValue(undefined);
      const commandPromise = service.executeCommand(
        'ls',
        config,
        writeFunction
      );

      setTimeout(() => service.cancelCommand('ls'), 50);

      await expect(commandPromise).rejects.toThrow('Command cancelled');
    });
  });

  describe('cancelAllCommands', () => {
    it('should cancel all pending commands', async () => {
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:',
        timeout: 1000,
      };

      const writeFunction = jest.fn().mockResolvedValue(undefined);
      const command1 = service.executeCommand('ls', config, writeFunction);
      const command2 = service.executeCommand('pwd', config, writeFunction);

      service.cancelAllCommands();

      await expect(command1).rejects.toThrow('All commands cancelled');
      await expect(command2).rejects.toThrow('All commands cancelled');
      expect(service.getPendingCommandCount()).toBe(0);
    });
  });

  describe('getPendingCommandCount', () => {
    it('should return number of pending commands', () => {
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:',
        timeout: 1000,
      };

      const writeFunction = jest.fn().mockResolvedValue(undefined);

      expect(service.getPendingCommandCount()).toBe(0);

      service.executeCommand('ls', config, writeFunction);
      expect(service.getPendingCommandCount()).toBe(1);

      service.executeCommand('pwd', config, writeFunction);
      expect(service.getPendingCommandCount()).toBe(2);
    });
  });
});
