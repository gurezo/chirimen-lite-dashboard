import { Component, input } from '@angular/core';

@Component({
  selector: 'choh-file-name-display',
  template: `
    <div class="file-name-display">
      @if (fileName()) {
        <span>{{ fileName() }}</span>
        @if (isDirty()) {
          <span> *</span>
        }
      } @else {
        <span>—</span>
      }
    </div>
  `,
})
export class FileNameDisplayComponent {
  fileName = input<string | null>(null);
  isDirty = input(false);
}
