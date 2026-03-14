import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import type { WiFiInfo } from '@libs-wifi-util';

/**
 * 1 件の WiFi ネットワーク情報を表示するカード
 */
@Component({
  selector: 'choh-wifi-info',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './wifi-info.component.html',
})
export class WifiInfoComponent {
  @Input() wifiInfo!: WiFiInfo;
}
