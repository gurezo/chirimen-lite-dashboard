import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-setup-step-list',
  standalone: true,
  template: `
    <ul>
      @for (step of steps; track step) {
        <li>{{ step }}</li>
      }
    </ul>
  `,
})
export class SetupStepListComponent {
  @Input() steps: string[] = [];
}
