import { Component } from '@angular/core';
import { PinAssignComponent } from '@libs-pin-assign-panel-ui';

@Component({
  selector: 'lib-right-sidebar',
  imports: [PinAssignComponent],
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col',
  },
  template: `
    <div
      class="right-sidebar flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <choh-pin-assign />
    </div>
  `,
})
export class RightSidebarComponent {}
