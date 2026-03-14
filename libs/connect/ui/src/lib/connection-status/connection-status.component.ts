import { Component, Input } from '@angular/core';

export type ConnectStatus = 'disconnected' | 'connecting' | 'connected';

@Component({
  selector: 'lib-connection-status',
  standalone: true,
  template: `
    @if (status === 'disconnected') {
      <div class="flex flex-col justify-center items-center gap-4">
        @if (message) {
          <h2 class="text-center">{{ message }}</h2>
        }
        @if (imageSrc) {
          <img [src]="imageSrc" [alt]="imageAlt" class="max-w-full h-auto" />
        }
      </div>
    } @else {
      <p>Connection status: {{ status }}</p>
    }
  `,
})
export class ConnectionStatusComponent {
  @Input() status: ConnectStatus = 'disconnected';
  @Input() message = '';
  @Input() imageSrc = '';
  @Input() imageAlt = '';
}

