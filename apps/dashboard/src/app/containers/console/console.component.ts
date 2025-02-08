import { Dialog } from '@angular/cdk/dialog';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Terminal } from '@xterm/xterm';
import { ConsoleToolBarComponent } from '../../components';
import { xtermConsoleConfigOptions } from '../../models';
import { WebSerialService, XtermService } from '../../service';
import { DialogService } from '../../service/dialog/dialog.service';

@Component({
  selector: 'choh-console',
  imports: [ConsoleToolBarComponent, MatDividerModule],
  templateUrl: './console.component.html',
  styleUrl: './console.component.scss',
  providers: [WebSerialService],
})
export class ConsoleComponent implements AfterViewInit {
  store = inject(Store);
  service = inject(WebSerialService);
  xtermService = inject(XtermService);
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

    this.xterminal.onKey((e) => this.xtermService.onKey(this.xterminal, e));
  }
}
