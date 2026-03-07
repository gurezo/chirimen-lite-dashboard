import { ITerminalInitOnlyOptions, ITerminalOptions } from '@xterm/xterm';

export type XtermConsoleConfigOptions = ITerminalOptions &
  ITerminalInitOnlyOptions;

export const xtermConsoleConfigOptions: XtermConsoleConfigOptions = {
  cols: 300,
  rows: 56,
  cursorBlink: true,
  cursorStyle: 'underline',
  cursorWidth: 2,
  theme: {
    background: 'black',
  },
};
