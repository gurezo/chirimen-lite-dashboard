import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../components';
import { DialogService } from '../../shared/service/dialog/dialog.service';

@Component({
  selector: 'choh-file-upload',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent {
  private service = inject(DialogService);
  private fb = inject(FormBuilder);
  uploadForm: FormGroup;

  constructor() {
    this.uploadForm = this.fb.group({ file: [null] });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadForm.patchValue({ file });
    }
    this.closeModal();
  }

  onSubmit(): void {
    if (this.uploadForm.valid) {
      const file = this.uploadForm.get('file')?.value;
      console.log('Uploading file:', file);
      // アップロードロジックをここに追加
    }
  }

  closeModal(): void {
    this.service.closeDialog();
  }
}
