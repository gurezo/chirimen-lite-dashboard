import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { firstValueFrom } from 'rxjs';

export interface SetupCommandOptions {
  prompt?: string;
  timeout?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SetupCommandService {
  private readonly serial = inject(SerialFacadeService);
  private readonly defaultPrompt = 'pi@raspberrypi:';
  private readonly defaultTimeout = 10000;

  async exec(command: string, options: SetupCommandOptions = {}): Promise<string> {
    const result = await firstValueFrom(
      this.serial.exec(command, {
        prompt: options.prompt ?? this.defaultPrompt,
        timeout: options.timeout ?? this.defaultTimeout,
      })
    );
    return result.stdout;
  }

  async ensurePrompt(): Promise<string> {
    return this.exec('\n', { prompt: '$ ', timeout: 3000 });
  }

  async login(loginId: string, loginPassword: string): Promise<void> {
    await this.exec(loginId, { prompt: 'Password:', timeout: 5000 });
    await this.exec(loginPassword, { prompt: this.defaultPrompt, timeout: 5000 });
  }

  async configureSession(): Promise<void> {
    await this.exec(' HISTCONTROL=ignoreboth');
  }

  async setTimezoneTokyo(): Promise<void> {
    await this.exec(' sudo timedatectl set-timezone Asia/Tokyo', { timeout: 15000 });
  }

  async setSystemDate(mmddhhmmYYYYss: string): Promise<void> {
    await this.exec(` sudo date ${mmddhhmmYYYYss}`);
  }

  async sendCtrlC(): Promise<void> {
    await this.serial.write('\x03');
  }

  async sendCtrlD(): Promise<void> {
    await this.serial.write('\x04');
  }

  async sendPagerKeys(): Promise<void> {
    await this.exec(' ');
    await this.exec('q');
  }

  async pwd(): Promise<string> {
    return this.exec(' pwd');
  }

  async lsAllQuoted(): Promise<string> {
    return this.exec(' ls -al --quoting-style=c');
  }

  async cd(path = ''): Promise<string> {
    const command = path.length > 0 ? ` cd -- ${path}` : ' cd --';
    return this.exec(command);
  }

  async rm(path: string): Promise<void> {
    await this.exec(` rm -- ${path}`);
  }

  async mv(from: string, to: string, useSudo = false): Promise<void> {
    const prefix = useSudo ? 'sudo ' : '';
    await this.exec(` ${prefix}mv -- ${from} ${to}`);
  }

  async cp(from: string, to: string, useSudo = false): Promise<void> {
    const prefix = useSudo ? 'sudo ' : '';
    await this.exec(` ${prefix}cp -- ${from} ${to}`);
  }

  async readFileAsBase64(path: string): Promise<string> {
    return this.exec(` base64 -- ${path}`, { timeout: 30000 });
  }

  async readFileAsBase64WithPager(path: string): Promise<string> {
    const command =
      " base64 -- " +
      `${path} | sed '$a ENDLINE--More--' | if [ 12 -le $(cat /etc/debian_version | cut -d. -f1) ]; then more --exit-on-eof -50; else more -50; fi`;
    return this.exec(command, { timeout: 30000 });
  }

  async openBase64Upload(path: string): Promise<void> {
    await this.exec(` base64 -d > ${path}`, { prompt: '\n', timeout: 10000 });
  }

  async ifconfig(): Promise<string> {
    return this.exec(' ifconfig');
  }

  async iwconfig(): Promise<string> {
    return this.exec(' iwconfig');
  }

  async scanWifi(): Promise<string> {
    return this.exec(' sudo iwlist wlan0 scan', { timeout: 30000 });
  }

  async checkTutorialHost(): Promise<string> {
    return this.exec(' wget --spider -nv https://tutorial.chirimen.org/', {
      timeout: 20000,
    });
  }
}
