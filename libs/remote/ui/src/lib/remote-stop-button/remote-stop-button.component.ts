import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '@libs-shared-ui';

@Component({
  selector: 'lib-remote-stop-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <choh-button
      [label]="label"
      type="button"
      [disabled]="disabled"
      (clickEvent)="stopClick.emit()"
    />
  `,
})
export class RemoteStopButtonComponent {
  @Input() label = '停止';
  @Input() disabled = false;
  @Output() stopClick = new EventEmitter<void>();
}
