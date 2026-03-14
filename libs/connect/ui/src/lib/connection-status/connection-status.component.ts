import { Component, input } from '@angular/core';

export type ConnectStatus = 'disconnected' | 'connecting' | 'connected';

@Component({
  selector: 'lib-connection-status',
  template: `
    @if (status() === 'disconnected') {
      <div class="flex flex-col justify-center items-center gap-4">
        @if (message()) {
          <h2 class="text-center">{{ message() }}</h2>
        }
        @if (imageSrc()) {
          <img
            [src]="imageSrc()"
            [alt]="imageAlt()"
            class="max-w-full h-auto"
          />
        }
      </div>
    } @else {
      <p>Connection status: {{ status() }}</p>
    }
  `,
})
export class ConnectionStatusComponent {
  readonly status = input<ConnectStatus>('disconnected');
  readonly message = input<string>('');
  readonly imageSrc = input<string>('');
  readonly imageAlt = input<string>('');
}
