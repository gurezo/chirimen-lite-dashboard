import { describe, expect, it, vi } from 'vitest';
import { SerialCommandService } from './serial-command.service';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

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
      { prompt: PI_ZERO_PROMPT, timeout: 1000, retry: 0 },
      writeFn,
      undefined
    );

    service.processInput(`ls\r\noutput\r\n${PI_ZERO_PROMPT}`);
    resolveWrite?.();

    const result = await execPromise;
    expect(result.stdout).toContain(PI_ZERO_PROMPT);
    expect(writeFn).toHaveBeenCalled();
  });

  it('readUntilPrompt resolves without writing', async () => {
    const service = new SerialCommandService();

    const readPromise = service.readUntilPrompt({
      prompt: PI_ZERO_PROMPT,
      timeout: 1000,
      retry: 0,
    });

    service.processInput(`welcome\r\n${PI_ZERO_PROMPT}`);

    const result = await readPromise;
    expect(result.stdout).toContain(PI_ZERO_PROMPT);
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
      {
        prompt: new RegExp(
          PI_ZERO_PROMPT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        ),
        timeout: 1000,
        retry: 0,
      },
      writeFn,
      undefined
    );

    service.processInput(`echo hi\r\nhi\r\n${PI_ZERO_PROMPT}`);
    resolveWrite?.();

    const result = await execPromise;
    expect(result.stdout).toContain('hi');
  });
});

