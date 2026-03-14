import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Terminal } from '@xterm/xterm';
import { xtermConsoleConfigOptions } from '@libs-terminal-util';
import { attachTerminalInput } from '../terminal-input';

@Component({
  selector: 'choh-terminal-view',
  standalone: true,
  template: ` <div #consoleDom class="mt-2"></div> `,
})
export class TerminalViewComponent implements AfterViewInit {
  @ViewChild('consoleDom', { read: ElementRef })
  private consoleDomRef?: ElementRef<HTMLElement>;

  readonly xterminal = new Terminal(xtermConsoleConfigOptions);

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  private configTerminal(): void {
    const el = this.consoleDomRef?.nativeElement;
    if (!el) return;

    this.xterminal.open(el);
    this.xterminal.reset();
    this.xterminal.writeln('$ ');
    attachTerminalInput(this.xterminal);
  }
}
