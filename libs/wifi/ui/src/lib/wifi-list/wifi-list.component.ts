import { Component, Input, output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import type { WiFiInfo } from '@libs-shared-types';
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
      @for (wifiInfo of wifiInfoList; track wifiInfo.address + wifiInfo.ssid + $index) {
        <choh-wifi-info
          [wifiInfo]="wifiInfo"
          (selectNetwork)="networkSelected.emit($event)"
        />
      } @empty {
        <span>スキャン結果がありません。「Wifi Scan」で取得してください。</span>
      }
    </div>
  `,
})
export class WifiListComponent {
  @Input() wifiInfoList: WiFiInfo[] = [];

  readonly networkSelected = output<WiFiInfo>();
}
