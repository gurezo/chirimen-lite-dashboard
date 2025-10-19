import { Component, EventEmitter, Output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'choh-editor-tool-bar',
  imports: [MatDividerModule, MatIconModule, MatMenuModule],
  templateUrl: './editor-tool-bar.component.html',
})
export class EditorToolBarComponent {
  @Output() eventSaveFile = new EventEmitter<void>();
  @Output() eventFormatFile = new EventEmitter<void>();
}
