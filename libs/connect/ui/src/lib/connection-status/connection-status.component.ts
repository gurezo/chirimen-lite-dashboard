import { Component, Input } from '@angular/core';

export type ConnectStatus = 'disconnected' | 'connecting' | 'connected';

@Component({
  selector: 'lib-connection-status',
  standalone: true,
  template: `
    <p>Connection status: {{ status }}</p>
  `,
})
export class ConnectionStatusComponent {
  @Input() status: ConnectStatus = 'disconnected';
}

