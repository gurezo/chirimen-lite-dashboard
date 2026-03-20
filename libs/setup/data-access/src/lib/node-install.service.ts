import { Injectable, inject } from '@angular/core';
import { SetupCommandService } from './setup-command.service';

@Injectable({
  providedIn: 'root',
})
export class NodeInstallService {
  private readonly setupCommand = inject(SetupCommandService);

  async checkPrerequisites(): Promise<void> {
    await this.setupCommand.exec('node -v');
    await this.setupCommand.exec('npm -v');
    await this.setupCommand.exec('which forever');
  }

  async installNode(version: string, distro = 'linux-armv6l'): Promise<void> {
    await this.setupCommand.exec('mkdir chirimenSetup');
    await this.setupCommand.exec('cd chirimenSetup');
    await this.setupCommand.exec('mkdir nodejs');
    await this.setupCommand.exec('cd nodejs');
    await this.setupCommand.exec(`VERSION=${version}`);
    await this.setupCommand.exec(`DISTRO=${distro}`);
    await this.setupCommand.exec(
      `wget https://unofficial-builds.nodejs.org/download/release/v${version}/node-v${version}-${distro}.tar.xz`,
      { timeout: 60000 }
    );
    await this.setupCommand.exec('sudo mkdir -p /usr/local/lib/nodejs');
    await this.setupCommand.exec(
      `sudo tar -xJvf node-v${version}-${distro}.tar.xz -C /usr/local/lib/nodejs`,
      { timeout: 60000 }
    );
    await this.setupCommand.exec(
      'echo "export PATH=/usr/local/lib/nodejs/node-v$VERSION-$DISTRO/bin:$PATH" | tee -a ~/.profile'
    );
    await this.setupCommand.exec('. ~/.profile');
  }

  async setupChirimenProject(): Promise<void> {
    await this.setupCommand.exec('sudo npm install -g forever', { timeout: 60000 });
    await this.setupCommand.exec(
      'wget -O package.json https://tutorial.chirimen.org/pizero/package.json',
      { timeout: 30000 }
    );
    await this.setupCommand.exec(
      'wget -O RelayServer.js https://chirimen.org/remote-connection/js/beta/RelayServer.js',
      { timeout: 30000 }
    );
    await this.setupCommand.exec('npm install', { timeout: 120000 });
    await this.setupCommand.exec('i2cdetect -y 1');
  }
}
