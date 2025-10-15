import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent, WifiInfoComponent } from '../../components';
import { I2cdetectDialogService } from '../../i2cdetect/i2cdetect.dialog.service';
import { dummyWiFiInformation } from '../../shared/models';

@Component({
  selector: 'choh-wifi-setting',
  imports: [
    ButtonComponent,
    WifiInfoComponent,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './wifi-setting.component.html',
})
export class WifiSettingComponent {
  wifiInfoList = dummyWiFiInformation;
  private service = inject(I2cdetectDialogService);

  closeModal(): void {
    this.service.closeDialog();
  }
}
