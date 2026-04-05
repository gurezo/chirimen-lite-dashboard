import { Component, input } from '@angular/core';

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
  template: `
    @if (status(); as st) {
      <div class="wifi-status">
        @if (st.ipInfo) {
          <pre class="text-sm">{{ st.ipInfo }}</pre>
        }
        @if (st.wlInfo) {
          <pre class="text-sm">{{ st.wlInfo }}</pre>
        }
      </div>
    }
  `,
})
export class WifiStatusComponent {
  readonly status = input<WifiStatusData | null>(null);
}
