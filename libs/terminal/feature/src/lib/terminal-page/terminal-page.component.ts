import { Component } from '@angular/core';
import { TerminalViewComponent } from '@libs-terminal-ui';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';

@Component({
  selector: 'choh-terminal',
  standalone: true,
  imports: [TerminalViewComponent],
  template: ` <choh-terminal-view [remotePrompt]="remotePrompt" /> `,
})
export default class TerminalPageComponent {
  readonly remotePrompt = PI_ZERO_PROMPT;
}
