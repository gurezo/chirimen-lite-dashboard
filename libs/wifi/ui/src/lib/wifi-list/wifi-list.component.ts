import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import type { WiFiInfo } from '@libs-wifi-util';
import { WifiInfoComponent } from '../wifi-info/wifi-info.component';

/**
 * WiFi スキャン結果の一覧表示
 */
@Component({
  selector: 'choh-wifi-list',
  standalone: true,
  imports: [WifiInfoComponent, MatDividerModule],
  template: `
    <div>
      <h3>WiFi Scan Result</h3>
    </div>
    <div class="max-h-[620px] overflow-y-auto w-full">
      @for (wifiInfo of wifiInfoList; track $index) {
        <choh-wifi-info [wifiInfo]="wifiInfo" />
      } @empty {
        <span>There are no Wi-Fi Information</span>
      }
    </div>
  `,
})
export class WifiListComponent {
  @Input() wifiInfoList: WiFiInfo[] = [];
}
