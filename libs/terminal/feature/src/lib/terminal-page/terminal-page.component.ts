import { Component } from '@angular/core';
import { TerminalViewComponent } from '@libs-terminal-ui';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Component({
  selector: 'choh-terminal',
  imports: [TerminalViewComponent],
  template: `
    <div
      class="box-border h-full min-h-0 min-w-0 bg-black pt-1 pr-1 pb-1 pl-1"
    >
      <choh-terminal-view [remotePrompt]="remotePrompt" />
    </div>
  `,
})
export default class TerminalPageComponent {
  readonly remotePrompt = PI_ZERO_PROMPT;
}
