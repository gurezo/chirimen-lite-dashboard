import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DialogService } from '@libs-dialogs';
import { ButtonComponent } from '@libs-ui';
import { dummyWiFiInformation } from '@dashboard/models';
import { WifiInfoComponent } from './components/wifi-info/wifi-info.component';

@Component({
  selector: 'choh-wifi',
  imports: [
    ButtonComponent,
    WifiInfoComponent,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './wifi.component.html',
})
export class WifiComponent {
  wifiInfoList = dummyWiFiInformation;
  dialogService = inject(DialogService);

  closeModal(): void {
    this.dialogService.close();
  }
}
