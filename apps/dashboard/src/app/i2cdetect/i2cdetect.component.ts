import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@chirimen-lite-dashboard/ui';
import { DialogService } from '../shared/service/dialog/dialog.service';

@Component({
  selector: 'choh-i2cdetect',
  imports: [ButtonComponent],
  templateUrl: './i2cdetect.component.html',
})
export class I2cdetectComponent {
  private service = inject(DialogService);
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
    this.service.closeDialog();
  }
}
