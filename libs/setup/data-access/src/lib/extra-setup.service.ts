import { Injectable, inject } from '@angular/core';
import { SetupCommandService } from './setup-command.service';

@Injectable({
  providedIn: 'root',
})
export class ExtraSetupService {
  private readonly setupCommand = inject(SetupCommandService);

  async enableSshAndReboot(): Promise<void> {
    await this.setupCommand.exec('cd');
    await this.setupCommand.exec('sudo touch /boot/ssh');
    await this.setupCommand.exec('sudo reboot', { timeout: 15000 });
  }

  async configureWifiScript(ssid: string, password: string): Promise<void> {
    await this.setupCommand.exec(
      `chmod +x wifi_setup.sh && ./wifi_setup.sh "${ssid}" "${password}"`,
      { timeout: 30000 }
    );
  }

  async setupCameraAndLegacyMode(): Promise<void> {
    await this.setupCommand.exec('sudo raspi-config nonint do_camera 0');
    await this.setupCommand.exec('sudo raspi-config nonint do_legacy 0');
  }

  async setupForeverAndCron(appPath: string): Promise<void> {
    await this.setupCommand.exec(' forever stopall');
    await this.setupCommand.exec(` forever start -w ${appPath}`);
    await this.setupCommand.exec(' forever list --plain');
    await this.setupCommand.exec(' touch ./chirimenCronSetting.txt');
    await this.setupCommand.exec(
      ` echo -e "@reboot /usr/local/bin/forever start ${appPath}"> chirimenCronSetting.txt`
    );
    await this.setupCommand.exec(' crontab ./chirimenCronSetting.txt');
    await this.setupCommand.exec(' rm ./chirimenCronSetting.txt');
  }
}
