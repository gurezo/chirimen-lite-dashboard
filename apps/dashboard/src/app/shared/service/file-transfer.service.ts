import { Injectable } from '@angular/core';
import { WebSerialService } from '../web-serial/service/web-serial.service';

@Injectable({
  providedIn: 'root',
})
export class FileTransferService {
  constructor(private webSerial: WebSerialService) {}

  // ファイルアップロード（バイナリデータをbase64で送信）
  async uploadFile(buffer: ArrayBuffer, fileName: string): Promise<void> {
    // const base64 = this.arrayBufferToBase64(buffer);
    // await this.webSerial.write(`base64 -d > ${this.escapePath(fileName)}\n`);
    // const lineLength = 512;
    // for (let i = 0; i <= Math.floor(base64.length / lineLength); i++) {
    //   const line = base64.substring(i * lineLength, (i + 1) * lineLength);
    //   await this.webSerial.write(line + '\n');
    //   await sleep(1);
    // }
    // await this.webSerial.write('\x04'); // ctrld (EOT)
    // await sleep(10);
    // await this.webSerial.writeln('');
    // await sleep(10);
    // 応答取得ロジックは要実装
    return;
  }

  // ファイルダウンロード（base64で取得しデコード）
  async downloadFile(path: string): Promise<ArrayBuffer | null> {
    // await this.webSerial.writeln(`base64 -- ${this.escapePath(path)}`);
    // 応答取得ロジックは要実装
    // ここではnull返却
    return null;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private escapePath(path: string): string {
    const jsonString = JSON.stringify(String(path));
    return jsonString.replace(/^"/, `$$'`).replace(/"$/, `'`);
  }
}
