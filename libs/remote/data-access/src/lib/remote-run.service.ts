import { Injectable, inject } from '@angular/core';
import { SerialFacadeService } from '@libs-web-serial-data-access';
import { PI_ZERO_PROMPT, SERIAL_TIMEOUT } from '@libs-web-serial-util';

@Injectable({ providedIn: 'root' })
export class RemoteRunService {
  private serial = inject(SerialFacadeService);
  private readonly prompt = PI_ZERO_PROMPT;

  /**
   * forever でプロセスを起動します。
   *
   * @param scriptPath Remote 上の JS ファイルパス（例: RelayServer.js）
   */
  async start(scriptPath: string, args: string[] = []): Promise<void> {
    const argsPart = args.length ? ` ${args.map((a) => JSON.stringify(a)).join(' ')}` : '';
    // -w は start の待ち合わせ（環境依存のため長めの timeout）
    await this.serial.exec(`forever start -w ${scriptPath}${argsPart}`, {
      prompt: this.prompt,
      timeout: SERIAL_TIMEOUT.PROCESS_CONTROL,
    });
  }
}
