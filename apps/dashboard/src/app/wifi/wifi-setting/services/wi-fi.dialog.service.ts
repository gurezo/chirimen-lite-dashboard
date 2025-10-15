import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { WifiSettingComponent } from '../wifi-setting.component';

@Injectable({
  providedIn: 'root',
})
export class WifiDialogService {
  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(WifiSettingComponent, {
      width: '600px',
      panelClass: 'my-dialog',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
