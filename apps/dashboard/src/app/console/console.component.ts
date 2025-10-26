import { AfterViewInit, Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { ChirimenPanelComponent } from '@libs-chirimen-panel';
import { DialogService } from '@libs-dialogs';
import { ExampleComponent } from '@libs-example';
import { FileUploadComponent } from '@libs-file-upload';
import { I2cdetectComponent } from '@libs-i2cdetect';
import { SerialFacadeService } from '@libs-web-serial';
import { Store } from '@ngrx/store';
import { Terminal } from '@xterm/xterm';
import { xtermConsoleConfigOptions } from '@dashboard/models';
import { WifiComponent } from '../wifi/wifi.component';
import { ConsoleToolBarComponent } from './components/console-tool-bar/console-tool-bar.component';

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
  providers: [SerialFacadeService],
})
export default class ConsoleComponent implements AfterViewInit {
  store = inject(Store);
  service = inject(SerialFacadeService);
  dialogService = inject(DialogService);

  label = 'connect';
  xterminal = new Terminal(xtermConsoleConfigOptions);
  consoleDom: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  openWifiSettingDialog() {
    this.dialogService.open(WifiComponent, {
      width: '600px',
      panelClass: 'my-dialog',
    });
  }

  createFile() {}

  openExampleFrameDialog() {
    this.dialogService.open(ExampleComponent, {
      height: '480px',
      width: '720px',
      panelClass: 'my-dialog',
    });
  }

  openChirimenPanelDialog() {
    this.dialogService.open(ChirimenPanelComponent, {
      height: '320px',
      width: '420px',
      panelClass: 'my-dialog',
    });
  }

  openI2CDetectDialog() {
    this.dialogService.open(I2cdetectComponent, {
      height: '320px',
      width: '420px',
      panelClass: 'my-dialog',
    });
  }

  openFileUploadDialog() {
    this.dialogService.open(FileUploadComponent, {
      height: '300px',
      width: '500px',
      panelClass: 'my-dialog',
    });
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
