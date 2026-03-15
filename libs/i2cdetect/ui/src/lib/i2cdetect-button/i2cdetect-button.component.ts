import { Component, inject } from '@angular/core';
import { DialogService } from '@libs-dialogs-util';
import { ButtonComponent } from '@libs-shared-ui';

@Component({
  selector: 'choh-i2cdetect',
  imports: [ButtonComponent],
  templateUrl: './i2cdetect-button.component.html',
})
export class I2cdetectButtonComponent {
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
70: -- -- -- -- -- -- --
  `;

  closeModal(): void {
    this.dialogService.close();
  }
}
