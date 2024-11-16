import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
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
import { WebSerialService } from '../../service';
import { WebSerialActions } from '../../store';

@Component({
  selector: 'app-layout-main',
  standalone: true,
  imports: [
    AsyncPipe,
    BreadcombComponent,
    ButtonComponent,
    ConsoleComponent,
    EditorComponent,
    HeaderComponent,
    MatDividerModule,
    MatIconModule,
    MatTabsModule,
    NgOptimizedImage,
    PinAssignComponent,
    TreeComponent,
  ],
  templateUrl: './layout-main.component.html',
  styleUrl: './layout-main.component.scss',
})
export default class LayoutMainComponent {
  store = inject(Store);
  service = inject(WebSerialService);

  isSerialConnected = false;

  connected$ = this.store.select((state) => state.webSerial.isConnected);
  // connected$ = this.store
  //   .select((state) => state.webSerial.isConnected)
  //   .pipe(
  //     tap((isConnected) => {
  //       console.log('isConnected state:', isConnected);
  //     }),
  //   );

  ngOnInit() {
    this.connected$.subscribe((isConnected) => {
      console.log('Subscription value:', isConnected);
    });

    this.store.dispatch(WebSerialActions.init());

    this.store.subscribe((state) => {
      console.log('Store state:', state);
    });
  }

  onClick() {
    this.store.dispatch(WebSerialActions.onConnect());
  }
}
