import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'lib-connect-button',
  standalone: true,
  template: `
    <button type="button" (click)="handleClick()">
      Connect
    </button>
  `,
})
export class ConnectButtonComponent {
  @Output() readonly connect = new EventEmitter<void>();

  handleClick(): void {
    this.connect.emit();
  }
}

