import { FileListItem } from '../models/file-list.model';
import { WiFiInfo } from '../models/wifi.model';

/**
 * 共通パーサーユーティリティ
 *
 * porting/utils/parser-utils.ts から移行・統合
 * WiFiInfo型を新しい型定義に対応
 */
export class ParserUtils {
  /**
   * コマンド出力を行の配列に分割
   */
  static parseOutputLines(output: string): string[] {
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
  }

  /**
   * ls -laコマンドの出力をパース
   */
  static parseLsOutput(output: string): FileListItem[] {
    const lines = output.split('\n');
    const files: FileListItem[] = [];

    for (const line of lines) {
      if (line.startsWith('total') || !line.trim()) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 9) continue;

      const isDirectory = line.startsWith('d');
      const size = parseInt(parts[4], 10);
      const name = parts[8];

      files.push({
        name,
        size,
        isDirectory,
      });
    }

    return files;
  }

  /**
   * iwlist scanコマンドの出力をパース
   *
   * 新しいWiFiInfo型に対応（essid → ssid、channel: string → number）
   */
  static parseIwlistOutput(output: string): WiFiInfo[] {
    const lines = output.split('\n');
    const wifiInfos: WiFiInfo[] = [];
    let wifiInfo: Partial<WiFiInfo> = {};
    let first = true;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.indexOf('Cell') >= 0 && line.indexOf('Address') > 0) {
        const parts = line.split(/\s+/);
        if (!first) {
          wifiInfos.push(wifiInfo as WiFiInfo);
        } else {
          first = false;
        }
        wifiInfo = { address: parts[5] };
      } else if (line.indexOf('ESSID:') >= 0) {
        // essid → ssid に変更
        wifiInfo.ssid = line.split(':')[1].trim().replace(/"/g, '');
      } else if (line.indexOf('IEEE 802.11') >= 0) {
        wifiInfo.spec = line.split(':')[1].trim();
      } else if (line.indexOf('Protocol:') >= 0) {
        wifiInfo.spec = line.split(':')[1].trim();
      } else if (line.indexOf('Quality') >= 0) {
        wifiInfo.quality = line.trim();
      } else if (line.indexOf('Group Cipher') >= 0) {
        wifiInfo.spec += ',' + line.split(':')[1].trim();
      } else if (line.indexOf('Pairwise Ciphers') >= 0) {
        wifiInfo.spec += ',' + line.split(':')[1].trim();
      } else if (line.indexOf('Authentication Suites') >= 0) {
        wifiInfo.spec += line.split(':')[1].trim();
      } else if (line.indexOf('Frequency:') >= 0) {
        wifiInfo.frequency = line.split(':')[1].trim();
        // Frequency行からチャンネル情報を抽出（string → number に変更）
        const channelMatch = line.match(/Channel (\d+)/);
        if (channelMatch) {
          wifiInfo.channel = parseInt(channelMatch[1], 10);
        }
      } else if (line.indexOf('Channel:') >= 0) {
        // channel: string → number に変更
        wifiInfo.channel = parseInt(line.split(':')[1].trim(), 10);
      }
    }
    wifiInfos.push(wifiInfo as WiFiInfo);

    return wifiInfos;
  }

  /**
   * ifconfigコマンドの出力をパース
   */
  static parseIfconfigOutput(output: string): {
    ipInfo: string;
    ipaddr?: string;
  } {
    let wdf = false;
    let ipInfo = 'wlan0: ';
    let ipaddr: string | undefined;

    for (const line of output.split('\n')) {
      if (line.indexOf('wlan0:') >= 0) {
        wdf = true;
      } else if (line === '') {
        wdf = false;
      }
      if (wdf) {
        if (line.indexOf('inet ') >= 0) {
          ipInfo += line + '\n';
          ipaddr = line;
        } else if (line.indexOf('ether ') >= 0) {
          ipInfo +=
            'MAC Address: ' +
            line.substring(
              line.indexOf('ether ') + 6,
              line.indexOf('txqueuelen')
            ) +
            '\n';
        }
      }
    }
    ipInfo += '\n';

    return { ipInfo, ipaddr };
  }

  /**
   * iwconfigコマンドの出力をパース
   */
  static parseIwconfigOutput(output: string): string {
    let wdf = false;
    let wlInfo = '';

    for (const line of output.split('\n')) {
      if (line.indexOf('wlan0') >= 0) {
        wdf = true;
      } else if (line === '') {
        wdf = false;
      }
      if (wdf) {
        wlInfo += line + '\n';
      }
    }

    return wlInfo;
  }
}
