import { describe, expect, it, vi } from 'vitest';
import { attachTerminalInput } from './terminal-input';

describe('attachTerminalInput', () => {
  it('ignores input when input is disabled', () => {
    let keyHandler: ((e: { domEvent: any }) => void) | undefined;

    const terminal = {
      onKey: (cb: (e: { domEvent: any }) => void) => {
        keyHandler = cb;
      },
      write: vi.fn(),
      writeln: vi.fn(),
    } as any;

    const onCommand = vi.fn(async () => 'OK');

    attachTerminalInput(terminal, onCommand, () => false);

    keyHandler?.({
      domEvent: {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        code: 'KeyL',
        key: 'l',
      },
    });
    keyHandler?.({
      domEvent: {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        code: 'Enter',
        key: 'Enter',
      },
    });

    expect(onCommand).not.toHaveBeenCalled();
    expect(terminal.write).not.toHaveBeenCalled();
    expect(terminal.writeln).not.toHaveBeenCalled();
  });

  it('executes command when input is enabled', async () => {
    let keyHandler: ((e: { domEvent: any }) => void) | undefined;

    const terminal = {
      onKey: (cb: (e: { domEvent: any }) => void) => {
        keyHandler = cb;
      },
      write: vi.fn(),
      writeln: vi.fn(),
    } as any;

    let resolveCommand: ((value: string) => void) | undefined;
    const onCommand = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveCommand = resolve;
        }),
    );

    attachTerminalInput(terminal, onCommand, () => true);

    keyHandler?.({
      domEvent: {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        code: 'KeyL',
        key: 'l',
      },
    });
    keyHandler?.({
      domEvent: {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        code: 'KeyS',
        key: 's',
      },
    });
    keyHandler?.({
      domEvent: {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        code: 'Enter',
        key: 'Enter',
      },
    });

    expect(onCommand).toHaveBeenCalledWith('ls');

    resolveCommand?.('OK');
    await new Promise((r) => setTimeout(r, 0));

    expect(terminal.write).toHaveBeenCalledWith('OK');
  });
});

