import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@libs-ui';
import { DialogService } from '../shared/services/dialogs/dialog.service';

@Component({
  selector: 'choh-i2cdetect',
  imports: [ButtonComponent],
  templateUrl: './i2cdetect.component.html',
})
export class I2cdetectComponent {
  private dialogService = inject(DialogService);
  i2cDevices = `
     0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
00:                         -- -- -- -- -- -- -- --
10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
40: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
60: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
70: -- -- -- -- -- -- -- --
  `;

  closeModal(): void {
    this.dialogService.close();
  }
}
