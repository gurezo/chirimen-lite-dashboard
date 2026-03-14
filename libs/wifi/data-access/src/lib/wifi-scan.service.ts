import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import {
  parseWifiIfconfigOutput,
  parseWifiIwconfigOutput,
  parseWifiIwlistOutput,
} from '@libs-wifi-util';
import type { WiFiInfo } from '@libs-wifi-util';

/**
 * WiFi スキャン・状態取得を担当
 */
@Injectable({
  providedIn: 'root',
})
export class WifiScanService {
  private serial = inject(SerialFacadeService);

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

      const { ipInfo, ipaddr } = parseWifiIfconfigOutput(ifconfigOutput);
      const wlInfo = parseWifiIwconfigOutput(iwconfigOutput);

      return { ipInfo, wlInfo, ipaddr };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get WiFi status: ${errorMessage}`);
    }
  }

  async scanNetworks(): Promise<{ rawData: string[]; wifiInfos: WiFiInfo[] }> {
    try {
      const output = await this.serial.executeCommand(
        'sudo iwlist wlan0 scan',
        'pi@raspberrypi:',
        30000
      );

      const lines = output.split('\n');
      const wifiInfos = parseWifiIwlistOutput(output);

      return { rawData: lines, wifiInfos };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to scan networks: ${errorMessage}`);
    }
  }

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

  async getIpAddress(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'hostname -I',
        'pi@raspberrypi:',
        10000
      );

      const lines = result.split('\n');
      const firstLine = lines[0]?.trim() || '';
      const ipAddresses = firstLine.split(/\s+/);
      return ipAddresses[0] || '';
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get IP address: ${errorMessage}`);
    }
  }

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
