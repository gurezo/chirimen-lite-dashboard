import { Component, input } from '@angular/core';

@Component({
  selector: 'choh-file-name-display',
  standalone: true,
  template: `
    <div class="file-name-display">
      @if (fileName()) {
        <span>{{ fileName() }}</span>
      } @else {
        <span>—</span>
      }
    </div>
  `,
})
export class FileNameDisplayComponent {
  fileName = input<string | null>(null);
}
