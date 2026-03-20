import { Component } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { TerminalViewComponent } from '@libs-terminal-ui';

@Component({
  selector: 'choh-terminal',
  standalone: true,
  imports: [TerminalViewComponent],
  template: ` <choh-terminal-view [remotePrompt]="remotePrompt" /> `,
  providers: [SerialFacadeService],
})
export default class TerminalPageComponent {
  readonly remotePrompt = 'pi@raspberrypi:';
}
