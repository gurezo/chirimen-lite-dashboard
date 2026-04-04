import { Component } from '@angular/core';
import { TerminalViewComponent } from '@libs-terminal-ui';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Component({
  selector: 'choh-terminal',
  imports: [TerminalViewComponent],
  template: `
    <div class="h-full min-h-0 min-w-0">
      <choh-terminal-view [remotePrompt]="remotePrompt" />
    </div>
  `,
})
export default class TerminalPageComponent {
  readonly remotePrompt = PI_ZERO_PROMPT;
}
