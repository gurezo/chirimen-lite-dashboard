import { Component, EventEmitter, Output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'choh-console-tool-bar',
  standalone: true,
  imports: [MatDividerModule, MatIconModule, MatMenuModule],
  templateUrl: './console-tool-bar.component.html',
  styleUrl: './console-tool-bar.component.scss',
})
export class ConsoleToolBarComponent {
  @Output() eventWiFiSetting = new EventEmitter<void>();
  @Output() eventCreateFile = new EventEmitter<void>();
  @Output() eventGetExample = new EventEmitter<void>();
  @Output() eventSetupChirimen = new EventEmitter<void>();
  @Output() eventI2CDetect = new EventEmitter<void>();
  @Output() eventFileUpload = new EventEmitter<void>();
}
