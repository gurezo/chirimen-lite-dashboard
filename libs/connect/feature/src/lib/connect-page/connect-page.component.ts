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
  imports: [AsyncPipe, ConnectButtonComponent, ConnectionStatusComponent],
  template: `
    <section
      class="text-center h-[80vh] flex flex-col justify-center items-center gap-4"
    >
      @if (connectionStatus$ | async; as status) {
        <lib-connection-status
          [status]="status"
          [message]="disconnectedMessage"
          [imageSrc]="imageSrc"
          [imageAlt]="imageAlt"
        />
        @if (status === 'disconnected') {
          <lib-connect-button
            [label]="connectButtonLabel"
            (connect)="onConnect()"
          />
        }
      }
    </section>
  `,
})
export class ConnectPageComponent {
  private store = inject(Store);

  disconnectedMessage =
    'Raspberry Pi Zero と PC を USB で繋いだ後、Connect ボタンをクリックして、Web Serail を接続して下さい';
  imageSrc = '/PiZeroW_OTG.jpg';
  imageAlt = 'PiZeroW_OTG';
  connectButtonLabel = 'Web Serial Connect';

  connectionStatus$ = this.store
    .select(
      (state: { webSerial: { isConnected: boolean } }) =>
        state.webSerial.isConnected,
    )
    .pipe(
      map(
        (connected): ConnectStatus =>
          connected ? 'connected' : 'disconnected',
      ),
    );

  onConnect(): void {
    this.store.dispatch(WebSerialActions.onConnect());
  }
}
