import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ConnectButtonComponent,
  ConnectionStatusComponent,
  type ConnectStatus,
} from '@libs-connect-ui';
import { WebSerialActions } from '@libs-web-serial-state';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

@Component({
  selector: 'lib-connect-page',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [AsyncPipe, ConnectButtonComponent, ConnectionStatusComponent],
  templateUrl: './connect-page.component.html',
})
export class ConnectPageComponent {
  private store = inject(Store);

  disconnectedMessage =
    'Raspberry Pi Zero と PC を USB で繋いだ後、Connect ボタンをクリックして、Web Serail を接続して下さい';
  imageSrc = '/PiZeroW_OTG.jpg';
  imageAlt = 'PiZeroW_OTG';
  connectButtonLabel = 'Web Serial Connect';

  private connected$ = this.store.select(
    (state: { webSerial: { isConnected: boolean } }) =>
      state.webSerial.isConnected,
  );

  connectionStatus$ = this.connected$.pipe(
    map(
      (connected): ConnectStatus =>
        connected ? 'connected' : 'disconnected',
    ),
  );

  onConnect(): void {
    this.store.dispatch(WebSerialActions.onConnect());
  }
}
