import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@dashboard/serial';

/**
 * システム情報
 */
export interface SystemInfo {
  hostname: string;
  osVersion: string;
  kernelVersion: string;
  uptime: string;
  cpuInfo: string;
  memoryInfo: string;
}

/**
 * システムサービス
 *
 * システム全体の操作（再起動、シャットダウン、システム情報取得）を担当
 * WiFiService から reboot() を分離して新設
 */
@Injectable({
  providedIn: 'root',
})
export class SystemService {
  private serial = inject(SerialFacadeService);

  /**
   * システムを再起動
   */
  async reboot(): Promise<void> {
    try {
      await this.serial.executeCommand('sudo reboot', 'EOL', 10000);
      // 再起動後は接続が切れるので切断処理
      await this.serial.disconnect();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to reboot: ${errorMessage}`);
    }
  }

  /**
   * システムをシャットダウン
   */
  async shutdown(): Promise<void> {
    try {
      await this.serial.executeCommand('sudo shutdown -h now', 'EOL', 10000);
      // シャットダウン後は接続が切れるので切断処理
      await this.serial.disconnect();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to shutdown: ${errorMessage}`);
    }
  }

  /**
   * ホスト名を取得
   *
   * @returns ホスト名
   */
  async getHostname(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'hostname',
        'pi@raspberrypi:',
        10000
      );

      return result.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get hostname: ${errorMessage}`);
    }
  }

  /**
   * OS バージョンを取得
   *
   * @returns OS バージョン
   */
  async getOsVersion(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        "cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '\"'",
        'pi@raspberrypi:',
        10000
      );

      return result.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get OS version: ${errorMessage}`);
    }
  }

  /**
   * カーネルバージョンを取得
   *
   * @returns カーネルバージョン
   */
  async getKernelVersion(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'uname -r',
        'pi@raspberrypi:',
        10000
      );

      return result.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get kernel version: ${errorMessage}`);
    }
  }

  /**
   * アップタイムを取得
   *
   * @returns アップタイム
   */
  async getUptime(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'uptime -p',
        'pi@raspberrypi:',
        10000
      );

      return result.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get uptime: ${errorMessage}`);
    }
  }

  /**
   * CPU 情報を取得
   *
   * @returns CPU 情報
   */
  async getCpuInfo(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'cat /proc/cpuinfo | grep "model name" | head -n 1',
        'pi@raspberrypi:',
        10000
      );

      return result.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get CPU info: ${errorMessage}`);
    }
  }

  /**
   * メモリ情報を取得
   *
   * @returns メモリ情報
   */
  async getMemoryInfo(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'free -h',
        'pi@raspberrypi:',
        10000
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get memory info: ${errorMessage}`);
    }
  }

  /**
   * システム情報を一括取得
   *
   * @returns システム情報
   */
  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const [hostname, osVersion, kernelVersion, uptime, cpuInfo, memoryInfo] =
        await Promise.all([
          this.getHostname(),
          this.getOsVersion(),
          this.getKernelVersion(),
          this.getUptime(),
          this.getCpuInfo(),
          this.getMemoryInfo(),
        ]);

      return {
        hostname,
        osVersion,
        kernelVersion,
        uptime,
        cpuInfo,
        memoryInfo,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get system info: ${errorMessage}`);
    }
  }

  /**
   * ディスク使用量を取得
   *
   * @returns ディスク使用量
   */
  async getDiskUsage(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'df -h',
        'pi@raspberrypi:',
        10000
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get disk usage: ${errorMessage}`);
    }
  }

  /**
   * システム日時を取得
   *
   * @returns システム日時
   */
  async getSystemDateTime(): Promise<Date> {
    try {
      const result = await this.serial.executeCommand(
        'date +%s',
        'pi@raspberrypi:',
        10000
      );

      const timestamp = parseInt(result.trim(), 10);
      return new Date(timestamp * 1000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get system date time: ${errorMessage}`);
    }
  }
}

