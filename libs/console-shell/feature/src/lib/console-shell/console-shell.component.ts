import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  ConnectButtonComponent,
  ConnectionStatusComponent,
} from '@libs-connect-ui';
import { HeaderToolbarComponent } from '@libs-console-shell-ui';
import {
  selectConnectionMessage,
  selectErrorMessage,
  WebSerialActions,
} from '@libs-web-serial-state';
import { SerialNotificationService } from '@libs-web-serial-data-access';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'lib-console-shell',
  standalone: true,
  imports: [
    AsyncPipe,
    ConnectButtonComponent,
    ConnectionStatusComponent,
    HeaderToolbarComponent,
  ],
  templateUrl: './console-shell.component.html',
})
export class ConsoleShellComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private serialNotification = inject(SerialNotificationService);

  connected$ = this.store.select((state) => state.webSerial.isConnected);

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
