import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'choh-button',
  imports: [MatButtonModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() label!: string;
  @Input() color = '';
  @Output() clickEvent = new EventEmitter<void>();
}
