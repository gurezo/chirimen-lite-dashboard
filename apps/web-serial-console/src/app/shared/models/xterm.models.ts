import { ITerminalInitOnlyOptions, ITerminalOptions } from '@xterm/xterm';

export type XtermConsoleConfigOptions = ITerminalOptions &
  ITerminalInitOnlyOptions;

export const xtermConsoleConfigOptions: XtermConsoleConfigOptions = {
  cols: 80,
  rows: 24,
  cursorBlink: true, //カーソルの点滅
  cursorStyle: 'underline', //カーソルをアンダーライン
  cursorWidth: 2, //カーソルの太さ
  theme: {
    background: 'bkack',
  },
};
