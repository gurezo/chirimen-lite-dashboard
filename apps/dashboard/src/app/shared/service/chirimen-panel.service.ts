import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChirimenPanelService {
  appDir = '~/myApp';
  absAppDir = '/home/pi/myApp/';
  nodeVersion = 'v22.9.0';
  message = '';
  nodeInfo = '';

  constructor() {}

  async setupChirimen() {
    this.message = 'START CHIRIMEN SETUP';
    // ここでWebSerialServiceやFileManagerService等を使ってコマンド送信・応答取得
    // 例: await this.webSerial.writeln('cd');
    // ...
    // セットアップ進行状況をthis.messageに反映
    // node.js, forever, camera, npm, etc. のインストール処理
    // 完了時:
    this.message =
      'CONGRATULATIONS. setup completed!\nYour prototyping directory is ' +
      this.appDir;
  }

  async buildChirimenDevDir(targetDir?: string) {
    // ... targetDirの作成、package.jsonやRelayServer.jsの取得、npm installなど
  }

  async i2cdetect() {
    // i2cdetectコマンドを実行し、結果をthis.message等に反映
  }

  showExamplePanel() {
    // 例: iframeでexampleページを表示するロジック
  }
}
