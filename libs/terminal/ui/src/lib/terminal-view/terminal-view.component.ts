import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { Terminal } from '@xterm/xterm';
import { xtermConsoleConfigOptions } from '@libs-terminal-util';
import { attachTerminalInput } from '../terminal-input';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Component({
  selector: 'choh-terminal-view',
  standalone: true,
  template: ` <div #consoleDom class="mt-2"></div> `,
})
export class TerminalViewComponent implements AfterViewInit {
  /**
   * シリアル側のシェルプロンプト（CommandService の prompt 待機に利用）
   */
  readonly remotePrompt = input<string>(PI_ZERO_PROMPT);

  @ViewChild('consoleDom', { read: ElementRef })
  private consoleDomRef?: ElementRef<HTMLElement>;

  private serial = inject(SerialFacadeService);

  readonly xterminal = new Terminal(xtermConsoleConfigOptions);

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  private sanitizeStdout(stdout: string, command: string): string {
    const prompt = this.remotePrompt();
    let out = stdout;

    // 受信側にコマンド echo が含まれる場合があるため、その部分を削る
    const cmdIdx = out.indexOf(command);
    if (cmdIdx >= 0) {
      out = out.slice(cmdIdx + command.length);
    }

    // prompt 以降は次のローカル prompt 表示に任せる
    const promptIdx = out.lastIndexOf(prompt);
    if (promptIdx >= 0) {
      out = out.slice(0, promptIdx);
    }

    return out.replace(/^[\r\n]+/, '');
  }

  private configTerminal(): void {
    const el = this.consoleDomRef?.nativeElement;
    if (!el) return;

    this.xterminal.open(el);
    this.xterminal.reset();
    this.xterminal.writeln('$ ');

    attachTerminalInput(this.xterminal, async (command) => {
      const { stdout } = await this.serial.exec(
        command,
        this.remotePrompt(),
        10000,
        0
      );
      return this.sanitizeStdout(stdout, command);
    });
  }
}
