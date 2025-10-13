import { Dialog } from '@angular/cdk/dialog';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Terminal } from '@xterm/xterm';
import { ConsoleToolBarComponent } from '../../components';
import { xtermConsoleConfigOptions } from '../../shared/models';
import { DialogService } from '../../shared/service/dialog/dialog.service';
import { WebSerialService } from '../../shared/web-serial';

@Component({
  selector: 'choh-console',
  imports: [ConsoleToolBarComponent, MatDividerModule],
  template: `
    <choh-console-tool-bar
      (eventWiFiSetting)="openWifiSettingDialog()"
      (eventCreateFile)="createFile()"
      (eventGetExample)="openExampleFrameDialog()"
      (eventSetupChirimen)="openSetupChirimenDialog()"
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
  dialogService = inject(DialogService);
  dialog = inject(Dialog);

  label = 'connect';
  xterminal = new Terminal(xtermConsoleConfigOptions);
  consoleDom: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  openWifiSettingDialog() {
    this.dialogService.openWifiSettingDialog();
  }

  createFile() {}

  openExampleFrameDialog() {
    this.dialogService.openExampleFrameDialog();
  }

  openSetupChirimenDialog() {
    this.dialogService.openSetupChirimenDialog();
  }
  openI2CDetectDialog() {
    this.dialogService.openI2CDetectDialog();
  }

  openFileUploadDialog() {
    this.dialogService.openFileUploadDialog();
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
