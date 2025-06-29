import { Injectable } from '@angular/core';
import { WebSerialService } from '../web-serial/service/web-serial.service';

export interface WifiInfo {
  address?: string;
  essid?: string;
  spec?: string;
  quality?: string;
  frequency?: string;
  channel?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WifiService {
  constructor(private webSerial: WebSerialService) {}

  async scan(): Promise<WifiInfo[]> {
    // await this.webSerial.writeln('sudo iwlist wlan0 scan');
    // 応答取得ロジックは要実装（例: イベント/コールバック/RxJS等）
    // ここでは仮に空配列返却
    return [];
  }

  async status() {
    // ifconfig, iwconfig, ping/wget などのコマンドを実行し、結果をthis.infoやthis.ipAddressに反映
  }

  async set(ssid: string, pass: string) {
    // WiFi設定スクリプト生成・保存・実行
  }

  async reboot() {
    // sudo reboot コマンドを実行
  }
}
