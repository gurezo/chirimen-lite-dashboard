import '@angular/compiler';
import { Injector } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';
import { RemoteStopService } from './remote-stop.service';

describe('RemoteStopService', () => {
  let exec: ReturnType<typeof vi.fn>;
  let svc: RemoteStopService;

  beforeEach(() => {
    exec = vi.fn().mockResolvedValue({ stdout: '' });
    const injector = Injector.create({
      providers: [
        RemoteStopService,
        { provide: SerialFacadeService, useValue: { exec } },
      ],
    });
    svc = injector.get(RemoteStopService);
  });

  it('stopAll calls forever stopall', async () => {
    await svc.stopAll();
    expect(exec).toHaveBeenCalledWith(
      'forever stopall',
      PI_ZERO_PROMPT,
      120000,
      0,
    );
  });

  it('stopTarget calls forever stop with JSON-quoted target', async () => {
    await svc.stopTarget(`app'x`);
    expect(exec).toHaveBeenCalledWith(
      `forever stop ${JSON.stringify(`app'x`)}`,
      PI_ZERO_PROMPT,
      120000,
      0,
    );
  });
});
