import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WiFiService {
  /**
   * Wi-Fi 情報をあ使うサービスを実装する
   */
  constructor() {}

  // TODO: Wi-Fi リスト情報取得
  // TODO: Wi-Fi 設定(SSID, PassWord)情報取得
  // cf. https://github.com/gurezo/PiZeroWebSerialConsole/blob/main/WiFiPanel.html

  getStatus(): string[] {
    return [];
  }

  scan(): string[] {
    return [];
  }

  show(): string[] {
    return [];
  }

  setting(): string[] {
    return [];
  }

  reboot(): void {}
}
