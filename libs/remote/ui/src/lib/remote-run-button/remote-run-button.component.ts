import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '@libs-shared-ui';

@Component({
  selector: 'lib-remote-run-button',
  imports: [ButtonComponent],
  template: `
    <choh-button
      [label]="label()"
      type="button"
      [disabled]="disabled()"
      (clickEvent)="runClick.emit()"
    />
  `,
})
export class RemoteRunButtonComponent {
  readonly label = input('起動');
  readonly disabled = input(false);
  readonly runClick = output<void>();
}
