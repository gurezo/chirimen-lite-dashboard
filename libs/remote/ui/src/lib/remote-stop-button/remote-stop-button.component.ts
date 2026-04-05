import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '@libs-shared-ui';

@Component({
  selector: 'lib-remote-stop-button',
  imports: [ButtonComponent],
  template: `
    <choh-button
      [label]="label()"
      type="button"
      [disabled]="disabled()"
      (clickEvent)="stopClick.emit()"
    />
  `,
})
export class RemoteStopButtonComponent {
  readonly label = input('停止');
  readonly disabled = input(false);
  readonly stopClick = output<void>();
}
