import { Component, inject, ViewChild } from '@angular/core';
import { MatTable, MatTableModule } from '@angular/material/table';
import { DialogService } from '../../service/dialog/dialog.service';

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
  selector: 'app-chirimen-setup',
  standalone: true,
  imports: [MatTable, MatTableModule],
  templateUrl: './chirimen-setup.component.html',
  styleUrl: './chirimen-setup.component.scss',
})
export class ChirimenSetupComponent {
  displayedColumns: string[] = ['Now Running', 'App Name', 'Select'];
  dataSource = [...ELEMENT_DATA];
  private service = inject(DialogService);

  @ViewChild(MatTable) table: MatTable<PeriodicElement> =
    {} as MatTable<PeriodicElement>;

  constructor() {
    this.table.dataSource = this.dataSource;
  }

  closeModal(): void {
    this.service.closeDialog();
  }
}
