import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'choh-header',
  standalone: true,
  imports: [AsyncPipe, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() connected$: Observable<boolean> = of(false);
  @Output() eventConnect = new EventEmitter<void>();
  @Output() eventDisConnect = new EventEmitter<void>();
}
