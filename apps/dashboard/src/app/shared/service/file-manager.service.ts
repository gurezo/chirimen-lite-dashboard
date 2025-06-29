import { Injectable } from '@angular/core';
import { WebSerialService } from '../web-serial/service/web-serial.service';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  constructor(private webSerial: WebSerialService) {}

  async printWorkingDirectory(): Promise<string> {
    // await this.webSerial.writeln('pwd');
    // 応答取得ロジックは要実装（例: イベント/コールバック/RxJS等）
    // ここでは仮に空文字返却
    return '';
  }

  async list(): Promise<string[]> {
    // 応答取得ロジックは要実装
    return [];
  }

  async changeDirectory(dir: string): Promise<void> {
    // 応答取得ロジックは要実装
    return;
  }

  async remove(fileName: string): Promise<void> {
    // await this.webSerial.writeln(`rm -- ${this.escapePath(fileName)}`);
    // 応答取得ロジックは要実装
    return;
  }

  async move(fromPath: string, toPath: string, bySudo = false): Promise<void> {
    // const sudoHead = bySudo ? 'sudo ' : '';
    // await this.webSerial.writeln(
    //   `${sudoHead}mv -- ${this.escapePath(fromPath)} ${this.escapePath(toPath)}`
    // );
    // 応答取得ロジックは要実装
    return;
  }

  async copy(fromPath: string, toPath: string, bySudo = false): Promise<void> {
    //   const sudoHead = bySudo ? 'sudo ' : '';
    //   await this.webSerial.writeln(
    //     `${sudoHead}cp -- ${this.escapePath(fromPath)} ${this.escapePath(toPath)}`
    // );
    // 応答取得ロジックは要実装
    return;
  }

  // ファイルアップロード/ダウンロード等も同様に追加可能

  private escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }
}
