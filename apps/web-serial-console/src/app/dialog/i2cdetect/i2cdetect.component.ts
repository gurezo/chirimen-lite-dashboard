import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../components';
import { DialogService } from '../../service/dialog/dialog.service';

@Component({
  selector: 'app-i2cdetect',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './i2cdetect.component.html',
  styleUrl: './i2cdetect.component.scss',
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
