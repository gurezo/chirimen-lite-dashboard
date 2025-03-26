import { Injectable } from '@angular/core';
import { Terminal } from '@xterm/xterm';

@Injectable({
  providedIn: 'root',
})
export class XtermService {
  onKey(xterminal: Terminal, e: { domEvent: KeyboardEvent }) {
    const ev = e.domEvent;
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

    if (ev.code === 'Enter') {
      xterminal.write('\r\n$ ');
    } else if (ev.code === 'Backspace') {
      xterminal.write('\b \b');
    } else if (printable) {
      xterminal.write(ev.key);
    }
  }
}
