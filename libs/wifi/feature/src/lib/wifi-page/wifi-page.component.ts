import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { DialogService } from '@libs-dialogs-util';
import { ButtonComponent } from '@libs-ui';
import { dummyWiFiInfo } from '@libs-wifi-util';
import type { WiFiInfo } from '@libs-wifi-util';
import {
  WifiListComponent,
  WifiFormComponent,
} from '@libs-wifi-ui';

/**
 * WiFi 設定画面（スマートコンポーネント）
 *
 * ui の list / form と data-access のサービスを組み合わせる
 */
@Component({
  selector: 'choh-wifi-page',
  standalone: true,
  imports: [
    ButtonComponent,
    WifiListComponent,
    WifiFormComponent,
    MatDividerModule,
  ],
  templateUrl: './wifi-page.component.html',
})
export class WifiPageComponent {
  wifiInfoList: WiFiInfo[] = dummyWiFiInfo;
  private dialogService = inject(DialogService);

  closeModal(): void {
    this.dialogService.close();
  }

  onSubmit(_event: Event): void {
    _event.preventDefault();
    // TODO: Implement WiFi configuration logic (WifiConfigService)
  }
}
