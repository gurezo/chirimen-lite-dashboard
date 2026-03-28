import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '@libs-shared-ui';

@Component({
  selector: 'lib-remote-run-button',
  imports: [ButtonComponent],
  template: `
    <choh-button
      [label]="label"
      type="button"
      [disabled]="disabled"
      (clickEvent)="runClick.emit()"
    />
  `,
})
export class RemoteRunButtonComponent {
  @Input() label = '起動';
  @Input() disabled = false;
  @Output() runClick = new EventEmitter<void>();
}
