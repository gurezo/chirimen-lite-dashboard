import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { ExampleComponent } from '../example.component';

@Injectable({
  providedIn: 'root',
})
export class ExampleDialogService {
  dialog = inject(Dialog);

  openDialog() {
    this.dialog.open(ExampleComponent, {
      height: '480px',
      width: '720px',
      panelClass: 'my-dialog',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
