import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';

export interface NodeInstallOptions {
  /**
   * unofficial-builds の tarball URL
   *
   * 例: https://unofficial-builds.nodejs.org/...tar.xz
   */
  nodeTarUrl: string;
  /**
   * 展開先ディレクトリ
   */
  installLibDir?: string; // default: /usr/local/lib/nodejs
}

@Injectable({ providedIn: 'root' })
export class NodeInstallService {
  private serial = inject(SerialFacadeService);
  private readonly prompt = 'pi@raspberrypi:';

  /**
   * Node.js をインストールして、chirimen 用の依存まで導入します。
   */
  async install(options: NodeInstallOptions): Promise<void> {
    const installLibDir = options.installLibDir ?? '/usr/local/lib/nodejs';
    const tarFileName = options.nodeTarUrl.split('/').pop() ?? 'node.tar.xz';

    const cmds: string[] = [
      // basics
      'node -v || true',
      'npm -v || true',
      'which forever || true',

      // setup workdir
      'mkdir -p chirimenSetup',
      'cd chirimenSetup',
      `wget -O ${tarFileName} ${options.nodeTarUrl}`,

      // install
      `sudo mkdir -p ${installLibDir}`,
      `sudo tar -xJvf ${tarFileName} -C ${installLibDir}`,
      "echo 'export PATH=/usr/local/lib/nodejs/bin:$PATH' | tee -a ~/.profile",
      '. ~/.profile',

      // device tweaks
      'sudo raspi-config nonint do_camera 0',
      'sudo raspi-config nonint do_legacy 0',

      // chirimen deps
      'sudo npm install -g forever',
      'wget -O package.json https://tutorial.chirimen.org/pizero/package.json',
      'wget -O RelayServer.js https://chirimen.org/remote-connection/js/beta/RelayServer.js',
      'npm install',

      // verify i2c
      'i2cdetect -y 1',
    ];

    for (const cmd of cmds) {
      await this.serial.exec(cmd, this.prompt, 300000, 0);
    }
  }
}
