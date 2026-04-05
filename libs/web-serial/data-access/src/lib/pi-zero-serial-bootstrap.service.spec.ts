import { describe, expect, it, vi } from 'vitest';
import {
  PI_ZERO_LOGIN_PASSWORD,
  PI_ZERO_LOGIN_USER,
  PI_ZERO_PROMPT,
  PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
} from '@libs-web-serial-util';
import { PiZeroSerialBootstrapService } from './pi-zero-serial-bootstrap.service';
import type { PiZeroShellReadinessService } from './pi-zero-shell-readiness.service';
import type { SerialFacadeService } from './serial-facade.service';

function createShellReadinessMock(): PiZeroShellReadinessService {
  return {
    setReady: vi.fn(),
    reset: vi.fn(),
    isReady: vi.fn(() => false),
    ready$: vi.fn() as unknown as PiZeroShellReadinessService['ready$'],
  } as unknown as PiZeroShellReadinessService;
}

const TZ_SET_CMD =
  'sudo -n timedatectl set-timezone Asia/Tokyo 2>/dev/null || true';
const TZ_STATUS_CMD = 'timedatectl status';

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

    const shellReadiness = createShellReadinessMock();
    const service = new PiZeroSerialBootstrapService(serial, shellReadiness);
    await service.runAfterConnect();

    expect(vi.mocked(shellReadiness.setReady)).toHaveBeenCalledWith(true);
    expect(readUntilPrompt).toHaveBeenCalledTimes(1);
    expect(readUntilPrompt).toHaveBeenCalledWith(
      PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
      5000,
      0,
    );
    expect(exec).toHaveBeenNthCalledWith(
      1,
      TZ_SET_CMD,
      PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
      10000,
      0,
    );
    expect(exec).toHaveBeenNthCalledWith(
      2,
      TZ_STATUS_CMD,
      PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
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

    const shellReadiness = createShellReadinessMock();
    const service = new PiZeroSerialBootstrapService(serial, shellReadiness);
    const lines: string[] = [];
    await service.runAfterConnect((line) => lines.push(line));

    expect(vi.mocked(shellReadiness.setReady)).toHaveBeenCalledWith(true);
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
      PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
      30000,
      0,
    );
    expect(lines.some((l) => l.includes('ログインユーザー'))).toBe(true);
    expect(exec).toHaveBeenNthCalledWith(
      3,
      TZ_SET_CMD,
      PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
      10000,
      0,
    );
    expect(exec).toHaveBeenNthCalledWith(
      4,
      TZ_STATUS_CMD,
      PI_ZERO_SHELL_PROMPT_LINE_PATTERN,
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

    const shellReadiness = createShellReadinessMock();
    const service = new PiZeroSerialBootstrapService(serial, shellReadiness);
    await service.runAfterConnect();
    await service.runAfterConnect();

    expect(readUntilPrompt).toHaveBeenCalledTimes(1);
    expect(vi.mocked(shellReadiness.setReady)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(shellReadiness.setReady)).toHaveBeenCalledWith(true);
  });

  it('logs timezone status stdout lines to the status handler', async () => {
    const readUntilPrompt = vi.fn().mockResolvedValue({
      stdout: `ready\r\n${PI_ZERO_PROMPT} `,
    });
    const exec = vi
      .fn()
      .mockResolvedValueOnce({ stdout: '' })
      .mockResolvedValueOnce({
        stdout: `${TZ_STATUS_CMD}\r\n       Time zone: Asia/Tokyo (${PI_ZERO_PROMPT} `,
      });
    const serial = {
      isConnected: () => true,
      getConnectionEpoch: () => 1,
      readUntilPrompt,
      exec,
    } as unknown as SerialFacadeService;

    const lines: string[] = [];
    const shellReadiness = createShellReadinessMock();
    const service = new PiZeroSerialBootstrapService(serial, shellReadiness);
    await service.runAfterConnect((line) => lines.push(line));

    expect(vi.mocked(shellReadiness.setReady)).toHaveBeenCalledWith(true);
    expect(
      lines.some((l) => l.includes('Time zone: Asia/Tokyo')),
    ).toBe(true);
  });
});
