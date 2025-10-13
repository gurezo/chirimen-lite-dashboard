import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '@chirimen-lite-dashboard/ui';
import { WifiInfoComponent } from '../../components';
import { dummyWiFiInformation } from '../../shared/models';
import { DialogService } from '../../shared/service/dialog/dialog.service';

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
  private service = inject(DialogService);

  closeModal(): void {
    this.service.closeDialog();
  }
}
