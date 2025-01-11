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
  selector: 'choh-console-containers',
  imports: [ConsoleToolBarComponent, MatDividerModule],
  templateUrl: './console-containers.component.html',
  styleUrl: './console-containers.component.scss',
  providers: [WebSerialService],
})
export class ConsoleContainersComponent implements AfterViewInit {
  store = inject(Store);
  service = inject(WebSerialService);
  xtermService = inject(XtermService);
  dailogService = inject(DialogService);
  dialog = inject(Dialog);

  label = 'connect';
  xterminal = new Terminal(xtermConsoleConfigOptions);
  consoleDom: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.configTerminal();
  }

  openWifiSettingDialog() {
    this.dailogService.openWifiSettingDialog();
  }

  createFile() {}

  openExampleFrameDialog() {
    this.dailogService.openExampleFrameDialog();
  }

  openSetupChirimenDialog() {
    this.dailogService.openSetupChirimenDialog();
  }
  openI2CDetectDialog() {
    this.dailogService.openI2CDetectDialog();
  }

  openFileUploadDialog() {
    this.dailogService.openFileUploadDialog();
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
