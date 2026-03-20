import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'lib-setup-execute-button',
  standalone: true,
  template: `
    <button type="button" (click)="handleClick()">Execute Setup</button>
  `,
})
export class SetupExecuteButtonComponent {
  @Output() readonly execute = new EventEmitter<void>();

  handleClick(): void {
    this.execute.emit();
  }
}
