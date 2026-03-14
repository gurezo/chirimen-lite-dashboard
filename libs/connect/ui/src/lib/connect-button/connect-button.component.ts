import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-connect-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="px-5 py-2 text-base font-medium text-white bg-blue-600 border-0 rounded shadow cursor-pointer hover:bg-blue-700 active:bg-blue-800"
      (click)="handleClick()"
    >
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

