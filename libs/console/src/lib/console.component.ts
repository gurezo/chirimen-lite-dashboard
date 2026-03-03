import { AfterViewInit, Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { DialogService } from '@libs-dialogs';
import { SerialFacadeService } from '@libs-web-serial';
import { xtermConsoleConfigOptions } from '@libs-xterm';
import { Store } from '@ngrx/store';
import { Terminal } from '@xterm/xterm';

@Component({
  selector: 'choh-console',
  imports: [MatDividerModule],
  template: ` <div id="consoleDom" class="mt-2"></div> `,
  providers: [SerialFacadeService],
})
export default class ConsoleComponent implements AfterViewInit {
  store = inject(Store);
  service = inject(SerialFacadeService);
  dialogService = inject(DialogService);

  label = 'connect';
  xterminal = new Terminal(xtermConsoleConfigOptions);
  consoleDom: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  private configTerminal() {
    this.consoleDom = document.getElementById('consoleDom');
    if (this.consoleDom) {
      this.xterminal.open(this.consoleDom);
    } else {
      return;
    }

    this.xterminal.reset();
    this.xterminal.writeln('$ ');

    this.xterminal.onKey((e) => this.onKey(e));
  }

  private onKey(e: { domEvent: KeyboardEvent }) {
    const ev = e.domEvent;
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

    if (ev.code === 'Enter') {
      this.xterminal.write('\r\n$ ');
    } else if (ev.code === 'Backspace') {
      this.xterminal.write('\b \b');
    } else if (printable) {
      this.xterminal.write(ev.key);
    }
  }
}
