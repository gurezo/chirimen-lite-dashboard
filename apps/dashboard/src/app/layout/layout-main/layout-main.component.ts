import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import {
  BreadcombComponent,
  ButtonComponent,
  PinAssignComponent,
  TreeComponent,
} from '../../components';
import { HeaderComponent } from '../../components/header/header.component';
import ConsoleComponent from '../../pages/console/console.component';
import EditorComponent from '../../pages/editor/editor.component';
import { WebSerialActions, WebSerialService } from '../../shared/web-serial';

@Component({
  selector: 'choh-layout-main',
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
  templateUrl: './layout-main.component.html',
})
export default class LayoutMainComponent {
  store = inject(Store);
  service = inject(WebSerialService);

  isSerialConnected = false;

  connected$ = this.store.select((state) => state.webSerial.isConnected);

  ngOnInit() {
    this.store.dispatch(WebSerialActions.init());
  }

  onConnect() {
    this.store.dispatch(WebSerialActions.onConnect());
  }

  onDisConnect() {
    this.store.dispatch(WebSerialActions.onDisConnect());
  }
}
