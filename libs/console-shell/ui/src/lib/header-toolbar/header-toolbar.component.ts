import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'lib-header-toolbar',
  standalone: true,
  imports: [AsyncPipe, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './header-toolbar.component.html',
})
export class HeaderToolbarComponent {
  connected$ = input<Observable<boolean>>(of(false));
  eventConnect = output<void>();
  eventDisConnect = output<void>();
}
