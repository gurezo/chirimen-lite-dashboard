import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { ButtonComponent, WifiInfoComponent } from '../../components';
import { dummyWiFiInformation } from '../../models';
import { DialogService } from '../../service/dialog/dialog.service';
// import { FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'choh-wifi-setting',
  standalone: true,
  imports: [
    ButtonComponent,
    WifiInfoComponent,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    NgFor,
    ReactiveFormsModule,
  ],
  templateUrl: './wifi-setting.component.html',
  styleUrl: './wifi-setting.component.scss',
})
export class WifiSettingComponent {
  wifiInfoList = dummyWiFiInformation;
  private service = inject(DialogService);

  closeModal(): void {
    this.service.closeDialog();
  }
}
