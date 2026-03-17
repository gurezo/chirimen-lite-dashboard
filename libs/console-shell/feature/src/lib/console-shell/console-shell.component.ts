import { AsyncPipe } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy, OnInit } from '@angular/core';
import {
  ConnectButtonComponent,
  ConnectionStatusComponent,
} from '@libs-connect-ui';
import { HeaderToolbarComponent } from '@libs-console-shell-ui';
import { PinAssignComponent } from '@libs-pin-assign-panel-ui';
import { SerialNotificationService } from '@libs-web-serial-data-access';
import {
  selectConnectionMessage,
  selectErrorMessage,
  WebSerialActions,
} from '@libs-web-serial-state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConsoleShellStore } from './console-shell.store';

@Component({
  selector: 'lib-console-shell',
  imports: [
    AsyncPipe,
    PinAssignComponent,
    ConnectButtonComponent,
    ConnectionStatusComponent,
    HeaderToolbarComponent,
  ],
  templateUrl: './console-shell.component.html',
})
export class ConsoleShellComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private serialNotification = inject(SerialNotificationService);
  private shellStore = inject(ConsoleShellStore);

  connected$ = this.store.select((state) => state.webSerial.isConnected);

  readonly activePanel = this.shellStore.activePanel;
  readonly leftNavOpen = this.shellStore.leftNavOpen;
  readonly rightNavOpen = this.shellStore.rightNavOpen;

  private subscriptions = new Subscription();

  ngOnInit() {
    this.store.dispatch(WebSerialActions.init());

    this.subscriptions.add(
      this.store
        .select(selectConnectionMessage)
        .pipe(filter((message) => message !== ''))
        .subscribe(() => {
          this.serialNotification.notifyConnectionSuccess();
        }),
    );

    this.subscriptions.add(
      this.store
        .select(selectErrorMessage)
        .pipe(filter((message) => message !== ''))
        .subscribe((errorMessage) => {
          this.serialNotification.notifyConnectionError(errorMessage);
        }),
    );

    this.subscriptions.add(
      this.connected$.subscribe((isConnected) => {
        this.shellStore.setConnectionStatus(isConnected);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onConnect() {
    this.store.dispatch(WebSerialActions.onConnect());
  }

  onDisConnect() {
    this.store.dispatch(WebSerialActions.onDisConnect());
  }
}
