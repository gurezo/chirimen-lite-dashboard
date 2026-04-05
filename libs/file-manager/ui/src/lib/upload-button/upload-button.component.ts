import { Component, output } from '@angular/core';

@Component({
  selector: 'lib-upload-button',
  template: `
    <button type="button">
      Upload
    </button>
  `,
})
export class UploadButtonComponent {
  readonly upload = output<void>();
}
