import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';
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
    RouterOutlet,
    TreeComponent,
  ],
  templateUrl: './layout-main.component.html',
  styleUrl: './layout-main.component.scss',
})
export default class LayoutMainComponent {
  store = inject(Store);
  service = inject(WebSerialService);

  isSerialConnected = false;

  ngOnInit() {
    this.store.dispatch(WebSerialActions.init());
  }

  onClick() {
    this.store.dispatch(WebSerialActions.init());
  }
}
