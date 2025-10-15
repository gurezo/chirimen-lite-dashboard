import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { I2cdetectComponent } from './i2cdetect.component';

@Injectable({
  providedIn: 'root',
})
export class I2cdetectDialogService {
  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(I2cdetectComponent, {
      height: '320px',
      width: '420px',
      panelClass: 'my-dialog',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
