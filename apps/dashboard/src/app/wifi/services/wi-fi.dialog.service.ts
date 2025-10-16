import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { WifiComponent } from '../wifi.component';

@Injectable({
  providedIn: 'root',
})
export class WifiDialogService {
  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(WifiComponent, {
      width: '600px',
      panelClass: 'my-dialog',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
