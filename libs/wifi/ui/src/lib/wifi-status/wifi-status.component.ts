import { Component, Input } from '@angular/core';

export interface WifiStatusData {
  ipInfo: string;
  wlInfo: string;
  ipaddr?: string;
}

/**
 * WiFi 接続状態（IP / iwconfig 等）の表示
 */
@Component({
  selector: 'choh-wifi-status',
  standalone: true,
  template: `
    @if (status) {
      <div class="wifi-status">
        @if (status.ipInfo) {
          <pre class="text-sm">{{ status.ipInfo }}</pre>
        }
        @if (status.wlInfo) {
          <pre class="text-sm">{{ status.wlInfo }}</pre>
        }
      </div>
    }
  `,
})
export class WifiStatusComponent {
  @Input() status: WifiStatusData | null = null;
}
