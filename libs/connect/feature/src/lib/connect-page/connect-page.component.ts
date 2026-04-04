import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  ConnectButtonComponent,
  ConnectionStatusComponent,
  type ConnectStatus,
} from '@libs-connect-ui';
import { ConsoleShellStore } from '@libs-console-shell-util';
import { WebSerialActions } from '@libs-web-serial-state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs';

@Component({
  selector: 'lib-connect-page',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  imports: [AsyncPipe, ConnectButtonComponent, ConnectionStatusComponent],
  template: `
    <section
      class="flex h-full min-h-0 flex-col items-center justify-center gap-4 text-center"
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
export class ConnectPageComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private shellStore = inject(ConsoleShellStore);

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

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.connected$
        .pipe(filter((isConnected) => isConnected))
        .subscribe(() => {
          this.shellStore.setConnected(true);
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onConnect(): void {
    this.store.dispatch(WebSerialActions.onConnect());
  }
}
