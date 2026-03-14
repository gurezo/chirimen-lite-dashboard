import { Component, inject } from '@angular/core';
import { DialogService } from '@libs-dialogs-util';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { TerminalViewComponent } from '@libs-terminal-ui';
import { Store } from '@ngrx/store';

@Component({
  selector: 'choh-terminal',
  standalone: true,
  imports: [TerminalViewComponent],
  template: ` <choh-terminal-view /> `,
  providers: [SerialFacadeService],
})
export default class TerminalPageComponent {
  readonly store = inject(Store);
  readonly service = inject(SerialFacadeService);
  readonly dialogService = inject(DialogService);
}
