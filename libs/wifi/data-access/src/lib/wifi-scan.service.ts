import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import {
  parseWifiIfconfigOutput,
  parseWifiIwconfigOutput,
  parseWifiIwlistOutput,
} from '@libs-wifi-util';
import { PI_ZERO_PROMPT } from '@libs-web-serial-util';
import type { WiFiInfo } from '@libs-shared-types';

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
      const ifconfigOutput = (
        await this.serial.exec('ifconfig', PI_ZERO_PROMPT, 10000)
      ).stdout;
      const iwconfigOutput = (
        await this.serial.exec('iwconfig', PI_ZERO_PROMPT, 10000)
      ).stdout;

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
      const output = (
        await this.serial.exec(
          'sudo iwlist wlan0 scan',
          PI_ZERO_PROMPT,
          30000
        )
      ).stdout;

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
      return (
        await this.serial.exec('iwconfig wlan0', PI_ZERO_PROMPT, 10000)
      ).stdout;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get WiFi status: ${errorMessage}`);
    }
  }

  async getIpAddress(): Promise<string> {
    try {
      const stdout = (
        await this.serial.exec('hostname -I', PI_ZERO_PROMPT, 10000)
      ).stdout;

      const lines = stdout.split('\n');
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
      return (
        await this.serial.exec(
          'cat /etc/network/interfaces',
          PI_ZERO_PROMPT,
          10000
        )
      ).stdout;
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
