import { describe, expect, it, vi } from 'vitest';
import { Observable, Subject } from 'rxjs';
import { SerialCommandService } from './serial-command.service';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';
import type { SerialTransportService } from './serial-transport.service';

function createService() {
  const chunks = new Subject<string>();
  const transport = {
    getReadStream: () => chunks.asObservable(),
    write: vi.fn(
      () =>
        new Observable<void>((subscriber) => {
          subscriber.next();
          subscriber.complete();
        })
    ),
  };
  const service = new SerialCommandService(
    transport as unknown as SerialTransportService
  );
  service.startReadLoop();
  return { service, chunks, transport };
}

describe('SerialCommandService', () => {
  it('exec resolves when prompt matches', async () => {
    const { service, chunks, transport } = createService();

    let releaseWrite: (() => void) | undefined;
    transport.write = vi.fn(
      () =>
        new Observable<void>((subscriber) => {
          releaseWrite = () => {
            subscriber.next();
            subscriber.complete();
          };
        })
    );

    const execPromise = service.exec(
      'ls',
      { prompt: PI_ZERO_PROMPT, timeout: 1000, retry: 0 }
    );

    releaseWrite?.();
    chunks.next(`ls\r\noutput\r\n${PI_ZERO_PROMPT}`);

    const result = await execPromise;
    expect(result.stdout).toContain(PI_ZERO_PROMPT);
    expect(transport.write).toHaveBeenCalled();
  });

  it('readUntilPrompt resolves without writing', async () => {
    const { service, chunks } = createService();

    const readPromise = service.readUntilPrompt({
      prompt: PI_ZERO_PROMPT,
      timeout: 1000,
      retry: 0,
    });

    queueMicrotask(() => {
      chunks.next(`welcome\r\n${PI_ZERO_PROMPT}`);
    });

    const result = await readPromise;
    expect(result.stdout).toContain(PI_ZERO_PROMPT);
  });

  it('supports RegExp prompt', async () => {
    const { service, chunks, transport } = createService();

    let releaseWrite: (() => void) | undefined;
    transport.write = vi.fn(
      () =>
        new Observable<void>((subscriber) => {
          releaseWrite = () => {
            subscriber.next();
            subscriber.complete();
          };
        })
    );

    const escaped = PI_ZERO_PROMPT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const execPromise = service.exec(
      'echo hi',
      {
        prompt: new RegExp(escaped),
        timeout: 1000,
        retry: 0,
      }
    );

    releaseWrite?.();
    chunks.next(`echo hi\r\nhi\r\n${PI_ZERO_PROMPT}`);

    const result = await execPromise;
    expect(result.stdout).toContain('hi');
  });
});
