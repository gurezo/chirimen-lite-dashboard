import { describe, expect, it, vi } from 'vitest';
import {
  PI_ZERO_LOGIN_PASSWORD,
  PI_ZERO_LOGIN_USER,
  PI_ZERO_PROMPT,
} from '@libs-web-serial-util';
import { PiZeroSerialBootstrapService } from './pi-zero-serial-bootstrap.service';
import type { SerialFacadeService } from './serial-facade.service';

describe('PiZeroSerialBootstrapService', () => {
  it('skips login when shell prompt is already visible', async () => {
    const readUntilPrompt = vi.fn().mockResolvedValue({
      stdout: `ready\r\n${PI_ZERO_PROMPT} `,
    });
    const exec = vi.fn().mockResolvedValue({ stdout: '' });
    const serial = {
      isConnected: () => true,
      getConnectionEpoch: () => 1,
      readUntilPrompt,
      exec,
    } as unknown as SerialFacadeService;

    const service = new PiZeroSerialBootstrapService(serial);
    await service.runAfterConnect();

    expect(readUntilPrompt).toHaveBeenCalledTimes(1);
    expect(readUntilPrompt).toHaveBeenCalledWith(PI_ZERO_PROMPT, 5000, 0);
    expect(exec).toHaveBeenCalledWith(
      'sudo timedatectl set-timezone Asia/Tokyo',
      PI_ZERO_PROMPT,
      10000,
      0,
    );
  });

  it('logs in when shell prompt is not ready', async () => {
    const readUntilPrompt = vi
      .fn()
      .mockRejectedValueOnce(new Error('Command execution timeout'))
      .mockResolvedValueOnce({ stdout: 'raspberrypi login: ' });
    const exec = vi.fn().mockResolvedValue({ stdout: `Password: \r\n` });
    const serial = {
      isConnected: () => true,
      getConnectionEpoch: () => 1,
      readUntilPrompt,
      exec,
    } as unknown as SerialFacadeService;

    const service = new PiZeroSerialBootstrapService(serial);
    const lines: string[] = [];
    await service.runAfterConnect((line) => lines.push(line));

    expect(readUntilPrompt).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenNthCalledWith(
      1,
      PI_ZERO_LOGIN_USER,
      expect.any(RegExp),
      30000,
      0,
    );
    expect(exec).toHaveBeenNthCalledWith(
      2,
      PI_ZERO_LOGIN_PASSWORD,
      PI_ZERO_PROMPT,
      30000,
      0,
    );
    expect(lines.some((l) => l.includes('ログインユーザー'))).toBe(true);
    expect(exec).toHaveBeenCalledWith(
      'sudo timedatectl set-timezone Asia/Tokyo',
      PI_ZERO_PROMPT,
      10000,
      0,
    );
  });

  it('runs at most once per connection epoch', async () => {
    const readUntilPrompt = vi.fn().mockResolvedValue({
      stdout: `${PI_ZERO_PROMPT} `,
    });
    const serial = {
      isConnected: () => true,
      getConnectionEpoch: () => 1,
      readUntilPrompt,
      exec: vi.fn().mockResolvedValue({ stdout: '' }),
    } as unknown as SerialFacadeService;

    const service = new PiZeroSerialBootstrapService(serial);
    await service.runAfterConnect();
    await service.runAfterConnect();

    expect(readUntilPrompt).toHaveBeenCalledTimes(1);
  });
});
