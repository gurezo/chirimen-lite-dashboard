import { TestBed } from '@angular/core/testing';
import { SerialError } from '../utils/serial.errors';
import {
  CommandExecutionConfig,
  CommandExecutorService,
} from './command-executor.service';

xdescribe('CommandExecutorService', () => {
  let service: CommandExecutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommandExecutorService],
    });
    service = TestBed.inject(CommandExecutorService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('executeCommand', () => {
    xit('should execute command and wait for prompt', async () => {
      const commandId = 'ls -la';
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:~$',
        timeout: 10000, // タイムアウトを長くする
      };
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      const commandPromise = service.executeCommand(
        commandId,
        config,
        writeFunction
      );

      // コマンドが実行されるまで少し待つ
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Simulate prompt response
      const result = service.processInput('pi@raspberrypi:~$');

      const output = await commandPromise;

      expect(writeFunction).toHaveBeenCalledWith('ls -la\n');
      expect(result).toBe('pi@raspberrypi:~$');
      expect(output).toBe('pi@raspberrypi:~$');
      expect(service.getPendingCommandCount()).toBe(0);
    }, 15000);

    it('should timeout when prompt not received', async () => {
      jest.useFakeTimers();

      const commandId = 'ping google.com';
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:~$',
        timeout: 1000,
      };
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      const commandPromise = service.executeCommand(
        commandId,
        config,
        writeFunction
      );

      // Advance time past timeout
      jest.advanceTimersByTime(1100);

      await expect(commandPromise).rejects.toThrow(SerialError);
      await expect(commandPromise).rejects.toThrow('Command execution timeout');

      expect(service.getPendingCommandCount()).toBe(0);

      jest.useRealTimers();
    });

    it('should handle write function error', async () => {
      const commandId = 'ls -la';
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:~$',
        timeout: 1000,
      };
      const writeError = new Error('Write failed');
      const writeFunction = jest.fn().mockRejectedValue(writeError);

      const commandPromise = service.executeCommand(
        commandId,
        config,
        writeFunction
      );

      await expect(commandPromise).rejects.toThrow('Write failed');
      // writeFunctionが失敗した場合、コマンドはpendingCommandsに追加されない
      expect(service.getPendingCommandCount()).toBe(0);
    });

    it('should handle multiple commands simultaneously', async () => {
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      const command1Promise = service.executeCommand(
        'ls',
        { prompt: 'prompt1', timeout: 5000 },
        writeFunction
      );
      const command2Promise = service.executeCommand(
        'pwd',
        { prompt: 'prompt2', timeout: 5000 },
        writeFunction
      );

      expect(service.getPendingCommandCount()).toBe(2);

      // Complete first command
      service.processInput('prompt1');
      const result1 = await command1Promise;

      expect(result1).toBe('prompt1');
      expect(service.getPendingCommandCount()).toBe(1);

      // Complete second command
      service.processInput('prompt2');
      const result2 = await command2Promise;

      expect(result2).toBe('prompt2');
      expect(service.getPendingCommandCount()).toBe(0);
    });
  });

  describe('processInput', () => {
    it('should return null when no commands are pending', () => {
      const result = service.processInput('some input');
      expect(result).toBeNull();
    });

    it('should return null when input does not match any prompt', () => {
      const commandId = 'ls -la';
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:~$',
        timeout: 1000,
      };
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      service.executeCommand(commandId, config, writeFunction);

      const result = service.processInput('unrelated input');
      expect(result).toBeNull();
      expect(service.getPendingCommandCount()).toBe(1);
    });

    it('should match prompt using regex', () => {
      const commandId = 'ls -la';
      const config: CommandExecutionConfig = {
        prompt: 'pi@.*:~\\$',
        timeout: 1000,
      };
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      const commandPromise = service.executeCommand(
        commandId,
        config,
        writeFunction
      );

      const result = service.processInput('pi@raspberrypi:~$');

      expect(result).toBe('pi@raspberrypi:~$');
      expect(commandPromise).resolves.toBe('pi@raspberrypi:~$');
    });

    it('should handle multiple commands with different prompts', () => {
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      service.executeCommand(
        'ls',
        { prompt: 'prompt1', timeout: 1000 },
        writeFunction
      );
      service.executeCommand(
        'pwd',
        { prompt: 'prompt2', timeout: 1000 },
        writeFunction
      );

      // Process input that matches first prompt
      const result1 = service.processInput('prompt1');
      expect(result1).toBe('prompt1');
      expect(service.getPendingCommandCount()).toBe(1);

      // Process input that matches second prompt
      const result2 = service.processInput('prompt2');
      expect(result2).toBe('prompt2');
      expect(service.getPendingCommandCount()).toBe(0);
    });
  });

  describe('cancelCommand', () => {
    it('should cancel specific command', async () => {
      const commandId = 'ls -la';
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:~$',
        timeout: 1000,
      };
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      const commandPromise = service.executeCommand(
        commandId,
        config,
        writeFunction
      );

      expect(service.getPendingCommandCount()).toBe(1);

      service.cancelCommand(commandId);

      await expect(commandPromise).rejects.toThrow(SerialError);
      await expect(commandPromise).rejects.toThrow('Command cancelled');
      expect(service.getPendingCommandCount()).toBe(0);
    });

    it('should do nothing when cancelling non-existent command', () => {
      service.cancelCommand('non-existent');
      expect(service.getPendingCommandCount()).toBe(0);
    });

    it('should clear timeout when cancelling command', () => {
      jest.useFakeTimers();

      const commandId = 'ls -la';
      const config: CommandExecutionConfig = {
        prompt: 'pi@raspberrypi:~$',
        timeout: 1000,
      };
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      service.executeCommand(commandId, config, writeFunction);

      // Cancel before timeout
      service.cancelCommand(commandId);

      // Advance time past timeout - should not trigger timeout error
      jest.advanceTimersByTime(1100);

      expect(service.getPendingCommandCount()).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('cancelAllCommands', () => {
    it('should cancel all pending commands', async () => {
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      const command1Promise = service.executeCommand(
        'ls',
        { prompt: 'prompt1', timeout: 1000 },
        writeFunction
      );
      const command2Promise = service.executeCommand(
        'pwd',
        { prompt: 'prompt2', timeout: 1000 },
        writeFunction
      );

      expect(service.getPendingCommandCount()).toBe(2);

      service.cancelAllCommands();

      await expect(command1Promise).rejects.toThrow(SerialError);
      await expect(command1Promise).rejects.toThrow('All commands cancelled');
      await expect(command2Promise).rejects.toThrow(SerialError);
      await expect(command2Promise).rejects.toThrow('All commands cancelled');

      expect(service.getPendingCommandCount()).toBe(0);
    });

    it('should clear all timeouts', () => {
      jest.useFakeTimers();

      const writeFunction = jest.fn().mockResolvedValue(undefined);

      service.executeCommand(
        'ls',
        { prompt: 'prompt1', timeout: 1000 },
        writeFunction
      );
      service.executeCommand(
        'pwd',
        { prompt: 'prompt2', timeout: 1000 },
        writeFunction
      );

      service.cancelAllCommands();

      // Advance time past timeout - should not trigger timeout errors
      jest.advanceTimersByTime(1100);

      expect(service.getPendingCommandCount()).toBe(0);

      jest.useRealTimers();
    });

    it('should do nothing when no commands are pending', () => {
      service.cancelAllCommands();
      expect(service.getPendingCommandCount()).toBe(0);
    });
  });

  describe('getPendingCommandCount', () => {
    it('should return 0 when no commands are pending', () => {
      expect(service.getPendingCommandCount()).toBe(0);
    });

    it('should return correct count when commands are pending', () => {
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      expect(service.getPendingCommandCount()).toBe(0);

      service.executeCommand(
        'ls',
        { prompt: 'prompt1', timeout: 1000 },
        writeFunction
      );
      expect(service.getPendingCommandCount()).toBe(1);

      service.executeCommand(
        'pwd',
        { prompt: 'prompt2', timeout: 1000 },
        writeFunction
      );
      expect(service.getPendingCommandCount()).toBe(2);

      service.executeCommand(
        'whoami',
        { prompt: 'prompt3', timeout: 1000 },
        writeFunction
      );
      expect(service.getPendingCommandCount()).toBe(3);
    });

    it('should update count when commands are completed', () => {
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      service.executeCommand(
        'ls',
        { prompt: 'prompt1', timeout: 1000 },
        writeFunction
      );
      service.executeCommand(
        'pwd',
        { prompt: 'prompt2', timeout: 1000 },
        writeFunction
      );

      expect(service.getPendingCommandCount()).toBe(2);

      service.processInput('prompt1');
      expect(service.getPendingCommandCount()).toBe(1);

      service.processInput('prompt2');
      expect(service.getPendingCommandCount()).toBe(0);
    });

    it('should update count when commands are cancelled', () => {
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      service.executeCommand(
        'ls',
        { prompt: 'prompt1', timeout: 1000 },
        writeFunction
      );
      service.executeCommand(
        'pwd',
        { prompt: 'prompt2', timeout: 1000 },
        writeFunction
      );

      expect(service.getPendingCommandCount()).toBe(2);

      service.cancelCommand('ls');
      expect(service.getPendingCommandCount()).toBe(1);

      service.cancelCommand('pwd');
      expect(service.getPendingCommandCount()).toBe(0);
    });
  });

  describe('integration tests', () => {
    xit('should handle complex command execution workflow', async () => {
      const writeFunction = jest.fn().mockResolvedValue(undefined);

      // Start multiple commands
      const lsPromise = service.executeCommand(
        'ls -la',
        { prompt: 'pi@raspberrypi:~$', timeout: 10000 },
        writeFunction
      );
      const pwdPromise = service.executeCommand(
        'pwd',
        { prompt: 'pi@raspberrypi:~$', timeout: 10000 },
        writeFunction
      );
      const whoamiPromise = service.executeCommand(
        'whoami',
        { prompt: 'pi@raspberrypi:~$', timeout: 10000 },
        writeFunction
      );

      expect(service.getPendingCommandCount()).toBe(3);

      // Complete commands in different order
      service.processInput('pi@raspberrypi:~$'); // This will complete the first command (ls)
      const lsResult = await lsPromise;
      expect(lsResult).toBe('pi@raspberrypi:~$');
      expect(service.getPendingCommandCount()).toBe(2);

      // Cancel one command
      service.cancelCommand('pwd');
      expect(service.getPendingCommandCount()).toBe(1);

      // Complete remaining command
      service.processInput('pi@raspberrypi:~$');
      const whoamiResult = await whoamiPromise;
      expect(whoamiResult).toBe('pi@raspberrypi:~$');
      expect(service.getPendingCommandCount()).toBe(0);

      // Verify pwd command was cancelled
      await expect(pwdPromise).rejects.toThrow('Command cancelled');
    });

    it('should handle timeout and cancellation edge cases', async () => {
      jest.useFakeTimers();

      const writeFunction = jest.fn().mockResolvedValue(undefined);

      // Start command with short timeout
      const commandPromise = service.executeCommand(
        'slow-command',
        { prompt: 'prompt', timeout: 100 },
        writeFunction
      );

      // Advance time but not past timeout
      jest.advanceTimersByTime(50);
      expect(service.getPendingCommandCount()).toBe(1);

      // Cancel command before timeout
      service.cancelCommand('slow-command');
      await expect(commandPromise).rejects.toThrow('Command cancelled');

      // Advance time past timeout - should not cause issues
      jest.advanceTimersByTime(100);
      expect(service.getPendingCommandCount()).toBe(0);

      jest.useRealTimers();
    });
  });
});
