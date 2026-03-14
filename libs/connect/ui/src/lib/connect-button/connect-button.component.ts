import { Component, input, output } from '@angular/core';

@Component({
  selector: 'lib-connect-button',
  template: `
    <button
      type="button"
      class="px-5 py-2 text-base font-medium text-white bg-blue-600 border-0 rounded shadow cursor-pointer hover:bg-blue-700 active:bg-blue-800"
      (click)="connect.emit()"
    >
      {{ label() }}
    </button>
  `,
})
export class ConnectButtonComponent {
  readonly label = input<string>('Connect');
  readonly connect = output<void>();
}
