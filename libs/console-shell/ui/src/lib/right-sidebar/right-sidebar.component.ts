import { Component } from '@angular/core';
import { PinAssignComponent } from '@libs-pin-assign-panel-ui';

@Component({
  selector: 'lib-right-sidebar',
  imports: [PinAssignComponent],
  template: `
    <div class="right-sidebar min-h-0 overflow-auto">
      <choh-pin-assign />
    </div>
  `,
})
export class RightSidebarComponent {}
