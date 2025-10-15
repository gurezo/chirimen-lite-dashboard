import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { FileUploadComponent } from './file-upload.component';

@Injectable({
  providedIn: 'root',
})
export class FileUploadDialogService {
  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(FileUploadComponent, {
      height: '300px',
      width: '500px',
      panelClass: 'my-dialog',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
