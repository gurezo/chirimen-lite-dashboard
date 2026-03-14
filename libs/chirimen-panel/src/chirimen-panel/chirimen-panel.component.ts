import { Component, viewChild } from '@angular/core';
import { MatTable, MatTableModule } from '@angular/material/table';

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
  imports: [MatTable, MatTableModule],
  templateUrl: './chirimen-panel.component.html',
})
export class ChirimenPanelComponent {
  displayedColumns: string[] = ['Now Running', 'App Name', 'Select'];
  dataSource = [...ELEMENT_DATA];

  readonly table = viewChild(MatTable<PeriodicElement>);
}
