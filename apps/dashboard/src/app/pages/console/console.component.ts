import { AfterViewInit, Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Terminal } from '@xterm/xterm';
import { ChirimenPanelDialogService } from '../../chirimen-panel/chirimen-panel.dialog.service';
import { ConsoleToolBarComponent } from '../../components';
import { FileUploadDialogService } from '../../dialog/file-upload/file-upload.dialog.service';
import { ExampleDialogService } from '../../example/services/example.dialog.service';
import { I2cdetectDialogService } from '../../i2cdetect/i2cdetect.dialog.service';
import { xtermConsoleConfigOptions } from '../../shared/models';
import { WebSerialService } from '../../shared/web-serial';
import { WifiDialogService } from '../../wifi/wifi-setting/services/wi-fi.dialog.service';

@Component({
  selector: 'choh-console',
  imports: [ConsoleToolBarComponent, MatDividerModule],
  template: `
    <choh-console-tool-bar
      (eventWiFiSetting)="openWifiSettingDialog()"
      (eventCreateFile)="createFile()"
      (eventGetExample)="openExampleFrameDialog()"
      (eventSetupChirimen)="openChirimenPanelDialog()"
      (eventI2CDetect)="openI2CDetectDialog()"
      (eventFileUpload)="openFileUploadDialog()"
    />
    <div id="consoleDom" class="mt-2"></div>
  `,
  providers: [WebSerialService],
})
export default class ConsoleComponent implements AfterViewInit {
  store = inject(Store);
  service = inject(WebSerialService);
  dialogService = inject(I2cdetectDialogService);
  exampleDialogService = inject(ExampleDialogService);
  chirimenPanelDialogService = inject(ChirimenPanelDialogService);
  wifiDialogService = inject(WifiDialogService);
  fileUploadDialogService = inject(FileUploadDialogService);
  i2cdetectDialogService = inject(I2cdetectDialogService);

  label = 'connect';
  xterminal = new Terminal(xtermConsoleConfigOptions);
  consoleDom: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  openWifiSettingDialog() {
    this.wifiDialogService.openDialog();
  }

  createFile() {}

  openExampleFrameDialog() {
    this.exampleDialogService.openDialog();
  }

  openChirimenPanelDialog() {
    this.chirimenPanelDialogService.openDialog();
  }
  openI2CDetectDialog() {
    this.i2cdetectDialogService.openDialog();
  }

  openFileUploadDialog() {
    this.fileUploadDialogService.openDialog();
  }

  private configTerminal() {
    this.consoleDom = document.getElementById('consoleDom');
    if (this.consoleDom) {
      this.xterminal.open(this.consoleDom);
    } else {
      return;
    }

    this.xterminal.reset();
    this.xterminal.writeln('$ ');

    // キー入力処理（XtermService から移植）
    this.xterminal.onKey((e) => this.onKey(e));
  }

  private onKey(e: { domEvent: KeyboardEvent }) {
    const ev = e.domEvent;
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

    if (ev.code === 'Enter') {
      this.xterminal.write('\r\n$ ');
    } else if (ev.code === 'Backspace') {
      this.xterminal.write('\b \b');
    } else if (printable) {
      this.xterminal.write(ev.key);
    }
  }
}
