import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-connect-button',
  standalone: true,
  template: `
    <button type="button" (click)="handleClick()">
      {{ label }}
    </button>
  `,
})
export class ConnectButtonComponent {
  @Input() label = 'Connect';
  @Output() readonly connect = new EventEmitter<void>();

  handleClick(): void {
    this.connect.emit();
  }
}

