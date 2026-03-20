import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { ExtraSetupService } from './extra-setup.service';
import { NodeInstallOptions, NodeInstallService } from './node-install.service';

export interface SetupCommandOptions {
  /**
   * Node.js tarball URL（unofficial-builds）
   */
  nodeTarUrl: string;
}

@Injectable({ providedIn: 'root' })
export class SetupCommandService {
  private serial = inject(SerialFacadeService);
  private extraSetup = inject(ExtraSetupService);
  private nodeInstall = inject(NodeInstallService);

  private readonly prompt = 'pi@raspberrypi:';

  /**
   * CHIRIMEN 初期セットアップを実行します。
   *
   * 現時点では issue #412 のコマンド分類に沿って「TZ/デバイス設定 + Node/依存導入」のみを best-effort で実行します。
   */
  async run(options: SetupCommandOptions): Promise<void> {
    await this.extraSetup.apply();

    await this.nodeInstall.install({
      nodeTarUrl: options.nodeTarUrl,
    });

    // forever 側は後工程で利用される前提なので、最低限の整地だけ行います
    try {
      await this.serial.exec('forever stopall', this.prompt, 60000, 0);
    } catch {
      // best-effort
    }
  }
}
