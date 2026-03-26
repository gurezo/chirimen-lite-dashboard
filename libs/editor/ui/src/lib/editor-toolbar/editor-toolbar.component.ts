import { Component, input, output } from '@angular/core';

@Component({
  selector: 'choh-editor-toolbar',
  standalone: true,
  template: `
    <div class="editor-toolbar">
      <button type="button" [disabled]="saveDisabled()" (click)="saveRequested.emit()">
        Save
      </button>
    </div>
  `,
})
export class EditorToolbarComponent {
  saveDisabled = input(false);
  saveRequested = output<void>();
}
