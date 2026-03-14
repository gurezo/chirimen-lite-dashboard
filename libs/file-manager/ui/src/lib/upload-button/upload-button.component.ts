import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'lib-upload-button',
  standalone: true,
  template: `
    <button type="button">
      Upload
    </button>
  `,
})
export class UploadButtonComponent {
  @Output() readonly upload = new EventEmitter<void>();
}
