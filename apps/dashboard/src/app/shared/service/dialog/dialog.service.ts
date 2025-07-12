import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { ChirimenSetupComponent } from '../../../chirimen-panel/chirimen-setup/chirimen-setup.component';
import { PinAssignComponent } from '../../../components';
import { FileUploadComponent } from '../../../dialog';
import { ExampleComponent } from '../../../example/example.component';
import { I2cdetectComponent } from '../../../i2cdetect/i2cdetect.component';
import { WifiSettingComponent } from '../../../wifi/wifi-setting/wifi-setting.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  dialog = inject(Dialog);

  openPinAssignDialog() {
    this.dialog.open(PinAssignComponent, {
      height: '654px',
      width: '546px',
      panelClass: 'my-dialog',
    });
  }

  openFileUploadDialog() {
    this.dialog.open(FileUploadComponent, {
      height: '300px',
      width: '500px',
      panelClass: 'my-dialog',
    });
  }

  openI2CDetectDialog() {
    this.dialog.open(I2cdetectComponent, {
      height: '320px',
      width: '420px',
      panelClass: 'my-dialog',
    });
  }

  openSetupChirimenDialog() {
    this.dialog.open(ChirimenSetupComponent, {
      height: '320px',
      width: '420px',
      panelClass: 'my-dialog',
    });
  }

  openExampleFrameDialog() {
    this.dialog.open(ExampleComponent, {
      height: '480px',
      width: '720px',
      panelClass: 'my-dialog',
    });
  }

  openWifiSettingDialog() {
    this.dialog.open(WifiSettingComponent, {
      width: '600px',
      panelClass: 'my-dialog',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
