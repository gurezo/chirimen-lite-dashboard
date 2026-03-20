import { describe, expect, it, vi } from 'vitest';
import { SerialCommandService } from './serial-command.service';

describe('SerialCommandService', () => {
  it('exec resolves when prompt matches', async () => {
    const service = new SerialCommandService();

    let resolveWrite: (() => void) | undefined;
    const writeFn = vi.fn(async () => {
      await new Promise<void>((resolve) => {
        resolveWrite = resolve;
      });
    });

    const execPromise = service.exec(
      'ls',
      { prompt: 'pi@raspberrypi:', timeout: 1000, retry: 0 },
      writeFn,
      undefined
    );

    service.processInput('ls\r\noutput\r\npi@raspberrypi:');
    resolveWrite?.();

    const result = await execPromise;
    expect(result.stdout).toContain('pi@raspberrypi:');
    expect(writeFn).toHaveBeenCalled();
  });

  it('readUntilPrompt resolves without writing', async () => {
    const service = new SerialCommandService();

    const readPromise = service.readUntilPrompt({
      prompt: 'pi@raspberrypi:',
      timeout: 1000,
      retry: 0,
    });

    service.processInput('welcome\r\npi@raspberrypi:');

    const result = await readPromise;
    expect(result.stdout).toContain('pi@raspberrypi:');
  });

  it('supports RegExp prompt', async () => {
    const service = new SerialCommandService();

    let resolveWrite: (() => void) | undefined;
    const writeFn = vi.fn(async () => {
      await new Promise<void>((resolve) => {
        resolveWrite = resolve;
      });
    });

    const execPromise = service.exec(
      'echo hi',
      { prompt: /pi@raspberrypi:/, timeout: 1000, retry: 0 },
      writeFn,
      undefined
    );

    service.processInput('echo hi\r\nhi\r\npi@raspberrypi:');
    resolveWrite?.();

    const result = await execPromise;
    expect(result.stdout).toContain('hi');
  });
});

