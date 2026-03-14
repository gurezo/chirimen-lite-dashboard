import { Terminal } from '@xterm/xterm';

/**
 * Attaches key input handling to an xterm Terminal instance.
 * Handles Enter, Backspace, and printable characters.
 */
export function attachTerminalInput(terminal: Terminal): void {
  terminal.onKey((e) => {
    const ev = e.domEvent;
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

    if (ev.code === 'Enter') {
      terminal.write('\r\n$ ');
    } else if (ev.code === 'Backspace') {
      terminal.write('\b \b');
    } else if (printable) {
      terminal.write(ev.key);
    }
  });
}
