import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { ChirimenPanelComponent } from './chirimen-panel.component';

@Injectable({
  providedIn: 'root',
})
export class ChirimenPanelDialogService {
  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(ChirimenPanelComponent, {
      height: '320px',
      width: '420px',
      panelClass: 'my-dialog',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
