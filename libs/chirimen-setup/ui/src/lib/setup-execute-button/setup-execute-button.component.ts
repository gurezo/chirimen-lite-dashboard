import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '@libs-shared-ui';

@Component({
  selector: 'lib-setup-execute-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <choh-button
      [label]="loading ? loadingLabel : label"
      type="button"
      [disabled]="disabled || loading"
      (clickEvent)="handleClick()"
    />
  `,
})
export class SetupExecuteButtonComponent {
  @Input() label = 'セットアップを実行';
  @Input() loadingLabel = '実行中…';
  @Input() disabled = false;
  @Input() loading = false;

  @Output() readonly execute = new EventEmitter<void>();

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.execute.emit();
    }
  }
}
