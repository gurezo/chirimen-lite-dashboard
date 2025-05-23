import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'choh-header',
  imports: [AsyncPipe, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input() connected$: Observable<boolean> = of(false);
  @Output() eventConnect = new EventEmitter<void>();
  @Output() eventDisConnect = new EventEmitter<void>();
}
