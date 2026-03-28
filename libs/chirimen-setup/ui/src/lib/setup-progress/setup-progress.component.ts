import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'lib-setup-progress',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './setup-progress.component.html',
})
export class SetupProgressComponent {
  /** 0–100 */
  @Input() progress = 0;
  @Input() currentLabel = '';
  @Input() indeterminate = false;
}
