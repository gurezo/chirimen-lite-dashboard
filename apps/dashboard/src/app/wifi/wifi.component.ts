import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '../components';
import { dummyWiFiInformation } from '../shared/models';
import { WifiInfoComponent } from './components/wifi-info/wifi-info.component';
import { WifiDialogService } from './services/wi-fi.dialog.service';

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
  service = inject(WifiDialogService);

  closeModal(): void {
    this.service.closeDialog();
  }
}
