import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-progress-dialog',
  template: `
    <div class="dialog-content">
      @if (message()) {
        <p>{{ message() }}</p>
      }
      <p>Progress: {{ progress() }}%</p>
      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="progress()"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-content {
        padding: 1rem;
        min-width: 200px;
      }
      .progress-bar {
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 0.5rem;
      }
      .progress-fill {
        height: 100%;
        background: #1976d2;
        transition: width 0.2s ease;
      }
    `,
  ],
})
export class ProgressDialogComponent {
  readonly message = input('');
  readonly progress = input(0);
}
