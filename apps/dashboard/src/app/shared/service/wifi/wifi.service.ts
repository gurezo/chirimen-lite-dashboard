import { Injectable, inject } from '@angular/core';
import { WiFiInfo } from '../../models/wifi.model';
import { ParserUtils } from '../../utils/parser.utils';
import { FileContentService } from '../file/file-content.service';
import { SerialFacadeService } from '../serial/serial-facade.service';

/**
 * WiFi サービス
 *
 * WiFi の状態確認、スキャン、設定を担当
 * porting/services/wifi.service.ts から移行
 * reboot() は SystemService に分離
 */
@Injectable({
  providedIn: 'root',
})
export class WiFiService {
  private serial = inject(SerialFacadeService);
  private fileContent = inject(FileContentService);

  /**
   * WiFi の状態を取得
   *
   * @returns WiFi 状態情報
   */
  async getWifiStatus(): Promise<{
    ipInfo: string;
    wlInfo: string;
    ipaddr?: string;
  }> {
    try {
      const ifconfigOutput = await this.serial.executeCommand(
        'ifconfig',
        'pi@raspberrypi:',
        10000
      );

      const iwconfigOutput = await this.serial.executeCommand(
        'iwconfig',
        'pi@raspberrypi:',
        10000
      );

      const { ipInfo, ipaddr } =
        ParserUtils.parseIfconfigOutput(ifconfigOutput);
      const wlInfo = ParserUtils.parseIwconfigOutput(iwconfigOutput);

      return { ipInfo, wlInfo, ipaddr };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get WiFi status: ${errorMessage}`);
    }
  }

  /**
   * WiFi ネットワークをスキャン
   *
   * @returns スキャン結果
   */
  async scanNetworks(): Promise<{ rawData: string[]; wifiInfos: WiFiInfo[] }> {
    try {
      const output = await this.serial.executeCommand(
        'sudo iwlist wlan0 scan',
        'pi@raspberrypi:',
        30000
      );

      const lines = output.split('\n');
      const wifiInfos = ParserUtils.parseIwlistOutput(output);

      return { rawData: lines, wifiInfos };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to scan networks: ${errorMessage}`);
    }
  }

  /**
   * WiFi を設定
   *
   * @param ssid SSID
   * @param password パスワード
   */
  async setWiFi(ssid: string, password: string): Promise<void> {
    try {
      await this.serial.executeCommand('cd', 'pi@raspberrypi:', 10000);
      await this.serial.executeCommand(
        'sudo touch /boot/ssh',
        'pi@raspberrypi:',
        10000
      );

      const wifiSetupScript = this.generateWifiSetupScript();

      // スクリプトファイルを作成
      await this.fileContent.writeTextFile('wifi_setup.sh', wifiSetupScript);

      // スクリプトを実行
      await this.serial.executeCommand(
        `chmod +x wifi_setup.sh && ./wifi_setup.sh "${ssid}" "${password}"`,
        'pi@raspberrypi:',
        30000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to set WiFi: ${errorMessage}`);
    }
  }

  /**
   * WiFi を設定（wpa_supplicant方式）
   *
   * @param ssid SSID
   * @param password パスワード
   */
  async configureWifi(ssid: string, password: string): Promise<void> {
    try {
      // wpa_supplicant 設定ファイルを作成
      const configContent = this.generateWpaSupplicantConfig(ssid, password);

      // 設定ファイルを保存
      await this.saveWifiConfig(configContent);

      // WiFi サービスを再起動
      await this.restartWifiService();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`WiFi configuration failed: ${errorMessage}`);
    }
  }

  /**
   * WiFi 状態を取得（iwconfig）
   *
   * @returns WiFi 状態
   */
  async getDetailedWifiStatus(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'iwconfig wlan0',
        'pi@raspberrypi:',
        10000
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get WiFi status: ${errorMessage}`);
    }
  }

  /**
   * WiFi を有効化
   */
  async enableWifi(): Promise<void> {
    try {
      await this.serial.executeCommand(
        'sudo ifconfig wlan0 up',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to enable WiFi: ${errorMessage}`);
    }
  }

  /**
   * WiFi を無効化
   */
  async disableWifi(): Promise<void> {
    try {
      await this.serial.executeCommand(
        'sudo ifconfig wlan0 down',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to disable WiFi: ${errorMessage}`);
    }
  }

  /**
   * IP アドレスを取得
   *
   * @returns IP アドレス
   */
  async getIpAddress(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'hostname -I',
        'pi@raspberrypi:',
        10000
      );

      const lines = result.split('\n');
      const firstLine = lines[0]?.trim() || '';
      // hostname -I は複数の IP アドレスをスペース区切りで返すため、最初の IP アドレスのみを取得
      const ipAddresses = firstLine.split(/\s+/);
      return ipAddresses[0] || '';
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get IP address: ${errorMessage}`);
    }
  }

  /**
   * ネットワーク設定を表示
   *
   * @returns ネットワーク設定
   */
  async showNetworkConfig(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'cat /etc/network/interfaces',
        'pi@raspberrypi:',
        10000
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to show network config: ${errorMessage}`);
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * WiFi セットアップスクリプトを生成
   */
  private generateWifiSetupScript(): string {
    return `#!/bin/sh
set -eu

SSID=$1
PASSWORD=$2
DEBIAN_VERSION=$(cut -d . -f 1 /etc/debian_version)

if [ "$DEBIAN_VERSION" -le 11 ]; then
  WPA_CONF_PATH=/etc/wpa_supplicant/wpa_supplicant.conf
  sudo sh -c "cat > $WPA_CONF_PATH" <<EOL
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=JP
network={
  ssid="$SSID"
  psk="$PASSWORD"
}
EOL
  sudo wpa_cli -i wlan0 reconfigure
else
  sudo nmcli dev wifi connect "$SSID" password "$PASSWORD"
fi
`;
  }

  /**
   * wpa_supplicant 設定ファイルを生成
   */
  private generateWpaSupplicantConfig(ssid: string, password: string): string {
    return `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=JP

network={
  ssid="${ssid}"
  psk="${password}"
}
`;
  }

  /**
   * WiFi 設定を保存
   */
  private async saveWifiConfig(configContent: string): Promise<void> {
    try {
      // 既存の設定をバックアップ
      await this.serial.executeCommand(
        'sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.backup',
        'pi@raspberrypi:',
        10000
      );

      // 新しい設定を保存
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(configContent);

      // base64 エンコードして送信
      const base64 = this.arrayBufferToBase64(uint8Array.buffer);

      // Ctrl+C でフォアグラウンドプロセスを停止
      await this.serial.write('\x03');
      await this.sleep(100);

      // 設定ファイルに保存
      await this.serial.executeCommand(
        'sudo tee /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null',
        '\n',
        10000
      );
      await this.serial.executeCommand(base64, '\n', 1000);

      // Ctrl+D で入力終了
      await this.serial.write('\x04');
      await this.sleep(10);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save WiFi config: ${errorMessage}`);
    }
  }

  /**
   * WiFi サービスを再起動
   */
  private async restartWifiService(): Promise<void> {
    try {
      await this.serial.executeCommand(
        'sudo systemctl restart wpa_supplicant',
        'pi@raspberrypi:',
        10000
      );

      await this.serial.executeCommand(
        'sudo systemctl restart networking',
        'pi@raspberrypi:',
        10000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to restart WiFi service: ${errorMessage}`);
    }
  }

  /**
   * ArrayBuffer を Base64 に変換
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // Legacy methods (後方互換性のため)
  // ============================================

  /**
   * @deprecated Use getWifiStatus() instead
   */
  async wifiStat(): Promise<{
    ipInfo: string;
    wlInfo: string;
    ipaddr?: string;
  }> {
    return this.getWifiStatus();
  }

  /**
   * @deprecated Use scanNetworks() instead
   */
  async wifiScan(): Promise<{ rawData: string[]; wifiInfos: WiFiInfo[] }> {
    return this.scanNetworks();
  }
}
