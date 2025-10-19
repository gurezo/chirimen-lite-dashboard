import { Component, inject, ViewChild } from '@angular/core';
import { MatTable, MatTableModule } from '@angular/material/table';
import { ButtonComponent } from '@libs-ui';
import { DialogService } from '../shared/services/dialogs/dialog.service';

export interface PeriodicElement {
  runing: string;
  appName: string;
  select: boolean;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { runing: '-', appName: 'STOP ALL APPS', select: true },
  { runing: '', appName: 'RelayServer.js', select: false },
  { runing: '', appName: 'main-gpio-polling.js', select: false },
  { runing: '', appName: 'main-hello-real-world.js', select: false },
];

@Component({
  selector: 'choh-chirimen-panel',
  imports: [ButtonComponent, MatTable, MatTableModule],
  templateUrl: './chirimen-panel.component.html',
})
export class ChirimenPanelComponent {
  displayedColumns: string[] = ['Now Running', 'App Name', 'Select'];
  dataSource = [...ELEMENT_DATA];
  private dialogService = inject(DialogService);

  @ViewChild(MatTable) table: MatTable<PeriodicElement> =
    {} as MatTable<PeriodicElement>;

  constructor() {
    this.table.dataSource = this.dataSource;
  }

  closeModal(): void {
    this.dialogService.close();
  }
}
