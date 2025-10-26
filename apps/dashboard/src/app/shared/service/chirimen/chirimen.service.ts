import { Injectable, inject } from '@angular/core';
import { FileListItem, FileListService } from '@libs-file-manager';
import { SerialFacadeService } from '../serial/serial-facade.service';

/**
 * CHIRIMEN サービス
 *
 * CHIRIMEN 環境のセットアップとアプリケーション管理を担当
 * porting/services/chirimen.service.ts から移行
 */
@Injectable({
  providedIn: 'root',
})
export class ChirimenService {
  private serial = inject(SerialFacadeService);
  private fileList = inject(FileListService);

  private appDir = '~/myApp';
  private absAppDir = '/home/pi/myApp/';

  /**
   * CHIRIMEN 環境をセットアップ
   *
   * @returns セットアップメッセージ
   */
  async setupChirimen(): Promise<string> {
    let message = 'START CHIRIMEN SETUP';
    const nodeVersion = 'v22.9.0';

    try {
      await this.serial.executeCommand('cd', 'pi@raspberrypi:', 10000);

      const nodeVOutput = await this.serial.executeCommand(
        'node -v',
        'pi@raspberrypi:',
        20000
      );

      let nodeV: string;

      if (nodeVOutput.indexOf('-bash:') === 0) {
        // Node.js がインストールされていない場合
        await this.installNodeJs(nodeVersion);
        nodeV = await this.getNodeVersionInfo();
      } else {
        // 既にインストールされている場合
        nodeV = await this.getNodeVersionInfo();
      }

      // Legacy camera support を追加
      await this.serial.executeCommand(
        'sudo raspi-config nonint do_camera 0',
        'pi@raspberrypi:',
        10000
      );

      await this.serial.executeCommand(
        'sudo raspi-config nonint do_legacy 0',
        'pi@raspberrypi:',
        10000
      );

      // Forever コマンドをインストール
      const foreverOutput = await this.serial.executeCommand(
        'which forever',
        'pi@raspberrypi:',
        10000
      );

      if (foreverOutput.indexOf('forever') === -1) {
        message = nodeV + '<br><br>Installing forever command for Node.js';
        await this.serial.executeCommand(
          'sudo npm install -g forever',
          'pi@raspberrypi:',
          300000
        );
      }

      message =
        nodeV +
        '<br><br>NEXT building CHIRIMEN environment and its libraries on ' +
        this.appDir;

      // CHIRIMEN 開発ディレクトリを構築
      await this.buildChirimenDevDir(this.appDir);

      await this.serial.executeCommand('cd', 'pi@raspberrypi:', 10000);
      await this.fileList.listFiles();

      message =
        'CONGRATURATIONS. setup completed!<br>Your prototyping directory is ' +
        this.appDir;

      return message;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`CHIRIMEN setup failed: ${errorMessage}`);
    }
  }

  /**
   * I2C デバイスを検出
   *
   * @returns I2C デバイス情報（HTML形式）
   */
  async detectI2cDevices(): Promise<string> {
    try {
      const output = await this.serial.executeCommand(
        'i2cdetect -y 1',
        'pi@raspberrypi:',
        10000
      );

      const lines = output.split('\n');
      let result = '<pre><code>     ';

      for (let i = 1; i < lines.length - 1; i++) {
        result += lines[i] + '\n';
      }

      result += '</pre></code>';
      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to detect I2C devices: ${errorMessage}`);
    }
  }

  /**
   * JavaScript アプリケーションのリストを取得
   *
   * @returns JavaScript ファイルのリスト
   */
  async getJsApps(): Promise<string[]> {
    try {
      await this.serial.executeCommand(
        `cd ${this.absAppDir}`,
        'pi@raspberrypi:',
        10000
      );

      const files = await this.fileList.listFiles();

      return files
        .filter((file: FileListItem) => file.name.endsWith('.js'))
        .map((file: FileListItem) => file.name);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get JS apps: ${errorMessage}`);
    }
  }

  /**
   * すべての Forever アプリを停止
   */
  async stopAllForeverApps(): Promise<void> {
    try {
      await this.serial.executeCommand(
        'forever stopall',
        'pi@raspberrypi:',
        20000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to stop Forever apps: ${errorMessage}`);
    }
  }

  /**
   * Forever アプリを起動
   *
   * @param appName アプリケーション名
   */
  async startForeverApp(appName: string): Promise<void> {
    try {
      await this.serial.executeCommand(
        `forever start -w ${appName}`,
        'pi@raspberrypi:',
        20000
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to start Forever app: ${errorMessage}`);
    }
  }

  /**
   * Forever アプリのリストを取得
   *
   * @returns 実行中の Forever アプリのリスト
   */
  async listForeverApps(): Promise<string> {
    try {
      const result = await this.serial.executeCommand(
        'forever list',
        'pi@raspberrypi:',
        10000
      );

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to list Forever apps: ${errorMessage}`);
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Node.js をインストール
   */
  private async installNodeJs(version: string): Promise<void> {
    await this.serial.executeCommand(
      'mkdir chirimenSetup',
      'pi@raspberrypi:',
      10000
    );

    await this.serial.executeCommand(
      'cd chirimenSetup',
      'pi@raspberrypi:',
      10000
    );

    await this.serial.executeCommand(
      `VERSION=${version}`,
      'pi@raspberrypi:',
      10000
    );

    await this.serial.executeCommand(
      'DISTRO=linux-armv6l',
      'pi@raspberrypi:',
      10000
    );

    // Node.js ランタイムをダウンロード
    await this.serial.executeCommand(
      'wget https://unofficial-builds.nodejs.org/download/release/$VERSION/node-$VERSION-$DISTRO.tar.xz',
      'pi@raspberrypi:',
      200000
    );

    await this.serial.executeCommand(
      'sudo mkdir -p /usr/local/lib/nodejs',
      'pi@raspberrypi:',
      10000
    );

    // Node.js ランタイムを展開
    await this.serial.executeCommand(
      'sudo tar -xJvf node-$VERSION-$DISTRO.tar.xz -C /usr/local/lib/nodejs',
      'pi@raspberrypi:',
      200000
    );

    // PATH を設定
    await this.serial.executeCommand(
      `echo -n -e "# Nodejs\\nVERSION=${version}\\nDISTRO=linux-armv6l\\n\\nexport PATH=/usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin:$PATH\\n" | tee -a ~/.profile`,
      'pi@raspberrypi:',
      10000
    );

    await this.serial.executeCommand('. ~/.profile', 'pi@raspberrypi:', 10000);
  }

  /**
   * Node.js バージョン情報を取得
   */
  private async getNodeVersionInfo(): Promise<string> {
    const nodeVersionOutput = await this.serial.executeCommand(
      'node -v',
      'pi@raspberrypi:',
      20000
    );

    let nodeV = 'Version:<br> node.js:' + nodeVersionOutput;

    const npmVersionOutput = await this.serial.executeCommand(
      'npm -v',
      'pi@raspberrypi:',
      20000
    );

    nodeV += '<br> npm:' + npmVersionOutput;
    return nodeV;
  }

  /**
   * CHIRIMEN 開発ディレクトリを構築
   */
  private async buildChirimenDevDir(targetDir: string): Promise<void> {
    if (!targetDir) {
      targetDir = this.appDir;
    }

    await this.serial.executeCommand(
      `mkdir ${targetDir}`,
      'pi@raspberrypi:',
      10000
    );

    await this.serial.executeCommand(
      `cd ${targetDir}`,
      'pi@raspberrypi:',
      10000
    );

    await this.serial.executeCommand(
      'wget -O package.json https://tutorial.chirimen.org/pizero/package.json',
      'pi@raspberrypi:',
      20000
    );

    await this.serial.executeCommand(
      'wget -O RelayServer.js https://chirimen.org/remote-connection/js/beta/RelayServer.js',
      'pi@raspberrypi:',
      20000
    );

    await this.serial.executeCommand('npm install', 'pi@raspberrypi:', 500000);
  }

  // ============================================
  // Legacy methods (後方互換性のため)
  // ============================================

  /**
   * @deprecated Use detectI2cDevices() instead
   */
  async i2cdetect(): Promise<string> {
    return this.detectI2cDevices();
  }

  /**
   * @deprecated Use startForeverApp() instead
   */
  async setForeverApp(appName: string): Promise<void> {
    return this.startForeverApp(appName);
  }

  /**
   * @deprecated Use stopAllForeverApps() instead
   */
  async stopAllForeverApp(): Promise<void> {
    return this.stopAllForeverApps();
  }
}
