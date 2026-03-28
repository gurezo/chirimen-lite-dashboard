import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ConnectPageComponent } from '@libs-connect-feature';
import {
  HeaderToolbarComponent,
  LeftSidebarComponent,
  RightSidebarComponent,
  ToolbarAction,
} from '@libs-console-shell-ui';
import { TerminalPageComponent } from '@libs-terminal-feature';
import { EditorPageComponent } from '@libs-editor-feature';
import { ExampleComponent } from '@libs-example-feature';
import { WifiPageComponent } from '@libs-wifi-feature';
import { SetupPageComponent } from '@libs-chirimen-setup-feature';
import { RemotePageComponent } from '@libs-remote-feature';
import { SerialNotificationService } from '@libs-web-serial-data-access';
import { DialogService } from '@libs-dialogs-util';
import {
  selectConnectionMessage,
  selectErrorMessage,
  WebSerialActions,
} from '@libs-web-serial-state';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConsoleShellStore } from '@libs-console-shell-util';
import { TerminalCommandRequestService } from '@libs-terminal-util';

@Component({
  selector: 'lib-console-shell',
  imports: [
    AsyncPipe,
    ConnectPageComponent,
    HeaderToolbarComponent,
    LeftSidebarComponent,
    RightSidebarComponent,
    TerminalPageComponent,
    EditorPageComponent,
    ExampleComponent,
  ],
  templateUrl: './console-shell.component.html',
})
export class ConsoleShellComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private serialNotification = inject(SerialNotificationService);
  private shellStore = inject(ConsoleShellStore);
  private dialogService = inject(DialogService);
  private terminalCommands = inject(TerminalCommandRequestService);

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

  onToggleRightSidebar() {
    this.shellStore.toggleRightNav();
  }

  onToolbarAction(action: ToolbarAction): void {
    if (action === 'editor' || action === 'example') {
      this.shellStore.closeDialog();
      this.dialogService.closeAll();
      this.shellStore.setActivePanel(action);
      return;
    }

    if (action === 'i2c') {
      this.shellStore.closeDialog();
      this.dialogService.closeAll();
      this.shellStore.setActivePanel('terminal');
      this.terminalCommands.requestCommand('i2cdetect -y 1');
      return;
    }

    this.shellStore.openDialog(action);
    const componentMap = {
      wifi: WifiPageComponent,
      setup: SetupPageComponent,
      remote: RemotePageComponent,
    } as const;

    const component = componentMap[action];
    const dialogRef = this.dialogService.open(component, {
      width: '80vw',
      height: '80vh',
      disableClose: true,
    });

    this.subscriptions.add(
      dialogRef.closed.subscribe(() => {
        this.shellStore.closeDialog();
      }),
    );
  }
}
