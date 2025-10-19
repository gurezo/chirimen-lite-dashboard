import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '@libs-ui';
import { dummyWiFiInformation } from '../shared/models';
import { DialogService } from '../shared/services/dialogs/dialog.service';
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
