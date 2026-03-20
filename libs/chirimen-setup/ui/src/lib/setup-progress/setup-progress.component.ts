import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-setup-progress',
  standalone: true,
  template: ` <p>Setup progress: {{ progress }}%</p> `,
})
export class SetupProgressComponent {
  @Input() progress = 0;
}
