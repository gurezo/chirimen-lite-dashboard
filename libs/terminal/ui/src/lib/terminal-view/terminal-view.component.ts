import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Terminal } from '@xterm/xterm';
import {
  TerminalCommandRequestService,
  sanitizeSerialStdout,
  xtermConsoleConfigOptions,
} from '@libs-terminal-util';
import { attachTerminalInput } from '../terminal-input';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Component({
  selector: 'choh-terminal-view',
  standalone: true,
  template: ` <div #consoleDom class="mt-2"></div> `,
})
export class TerminalViewComponent implements AfterViewInit, OnDestroy {
  /**
   * シリアル側のシェルプロンプト（CommandService の prompt 待機に利用）
   */
  readonly remotePrompt = input<string>(PI_ZERO_PROMPT);

  @ViewChild('consoleDom', { read: ElementRef })
  private consoleDomRef?: ElementRef<HTMLElement>;

  private serial = inject(SerialFacadeService);
  private commandRequests = inject(TerminalCommandRequestService);

  readonly xterminal = new Terminal(xtermConsoleConfigOptions);

  /** Serializes interactive and toolbar-initiated exec so only one runs at a time. */
  private execTail: Promise<void> = Promise.resolve();

  private commandRequestSub?: Subscription;

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  ngOnDestroy(): void {
    this.commandRequestSub?.unsubscribe();
  }

  private enqueueExec<T>(job: () => Promise<T>): Promise<T> {
    const run = this.execTail.then(() => job());
    this.execTail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private configTerminal(): void {
    const el = this.consoleDomRef?.nativeElement;
    if (!el) return;

    this.xterminal.open(el);
    this.xterminal.reset();
    this.xterminal.writeln('$ ');

    attachTerminalInput(
      this.xterminal,
      async (command) => {
        return this.enqueueExec(async () => {
          const { stdout } = await this.serial.exec(
            command,
            this.remotePrompt(),
            10000,
            0,
          );
          return sanitizeSerialStdout(stdout, command, this.remotePrompt());
        });
      },
      () => this.serial.isConnected(),
    );

    this.commandRequestSub = this.commandRequests.commandRequests$.subscribe(
      (cmd) => {
        void this.enqueueExec(async () => {
          if (!this.serial.isConnected()) {
            this.xterminal.writeln(`$ ${cmd}`);
            this.xterminal.writeln('Command failed: Serial port not connected');
            this.xterminal.write('$ ');
            return;
          }
          this.xterminal.writeln(`$ ${cmd}`);
          try {
            const { stdout } = await this.serial.exec(
              cmd,
              this.remotePrompt(),
              10000,
              0,
            );
            const out = sanitizeSerialStdout(
              stdout,
              cmd,
              this.remotePrompt(),
            );
            if (out) {
              this.xterminal.write(out);
            }
            this.xterminal.write('\r\n$ ');
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error);
            this.xterminal.writeln(`\r\nCommand failed: ${message}`);
            this.xterminal.write('$ ');
          }
        });
      },
    );
  }
}
