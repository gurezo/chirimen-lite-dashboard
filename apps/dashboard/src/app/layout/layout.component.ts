import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { EditorComponent } from '@libs-editor';
import { ButtonComponent } from '@libs-ui';
import {
  selectConnectionMessage,
  selectErrorMessage,
  WebSerialActions,
} from '@libs-web-serial';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import ConsoleComponent from '../console/console.component';
import { SerialNotificationService } from '@dashboard/notification';
import { BreadcombComponent } from './components/breadcomb/breadcomb.component';
import { HeaderComponent } from './components/header/header.component';
import { PinAssignComponent } from './components/pin-assign/pin-assign.component';
import { TreeComponent } from './components/tree/tree.component';

@Component({
  selector: 'choh-layout',
  imports: [
    AsyncPipe,
    BreadcombComponent,
    ButtonComponent,
    ConsoleComponent,
    EditorComponent,
    HeaderComponent,
    MatDivider,
    MatIcon,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    NgOptimizedImage,
    PinAssignComponent,
    TreeComponent,
  ],
  templateUrl: './layout.component.html',
})
export default class LayoutComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private serialNotification = inject(SerialNotificationService);

  isSerialConnected = false;

  connected$ = this.store.select((state) => state.webSerial.isConnected);

  private subscriptions = new Subscription();

  ngOnInit() {
    this.store.dispatch(WebSerialActions.init());

    // 接続成功メッセージを監視
    this.subscriptions.add(
      this.store
        .select(selectConnectionMessage)
        .pipe(filter((message) => message !== ''))
        .subscribe(() => {
          this.serialNotification.notifyConnectionSuccess();
        })
    );

    // エラーメッセージを監視
    this.subscriptions.add(
      this.store
        .select(selectErrorMessage)
        .pipe(filter((message) => message !== ''))
        .subscribe((errorMessage) => {
          this.serialNotification.notifyConnectionError(errorMessage);
        })
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
