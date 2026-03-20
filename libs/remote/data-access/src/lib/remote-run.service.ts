import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';

@Injectable({ providedIn: 'root' })
export class RemoteRunService {
  private serial = inject(SerialFacadeService);
  private readonly prompt = 'pi@raspberrypi:';

  /**
   * forever でプロセスを起動します。
   *
   * @param scriptPath Remote 上の JS ファイルパス（例: RelayServer.js）
   */
  async start(scriptPath: string, args: string[] = []): Promise<void> {
    const argsPart = args.length ? ` ${args.map((a) => JSON.stringify(a)).join(' ')}` : '';
    // -w は start の待ち合わせ（環境依存のため長めの timeout）
    await this.serial.exec(
      `forever start -w ${scriptPath}${argsPart}`,
      this.prompt,
      120000,
      0
    );
  }
}

