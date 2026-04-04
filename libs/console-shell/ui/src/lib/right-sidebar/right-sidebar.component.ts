import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PinAssignComponent } from '@libs-pin-assign-panel-ui';

@Component({
  selector: 'lib-right-sidebar',
  imports: [MatIconButton, MatIcon, PinAssignComponent],
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col',
  },
  template: `
    <div
      class="right-sidebar flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div
        class="flex shrink-0 flex-col items-center gap-1 border-b border-gray-200 py-2"
      >
        <mat-icon aria-hidden="true">fiber_pin</mat-icon>
        <button
          mat-icon-button
          type="button"
          [attr.aria-label]="
            rightNavOpen() ? 'Close right panel' : 'Open right panel'
          "
          (click)="toggleRightSidebar.emit()"
        >
          <mat-icon>
            @if (rightNavOpen()) {
              right_panel_close
            } @else {
              right_panel_open
            }
          </mat-icon>
        </button>
      </div>
      @if (rightNavOpen()) {
        <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <choh-pin-assign />
        </div>
      }
    </div>
  `,
})
export class RightSidebarComponent {
  rightNavOpen = input<boolean>(true);
  toggleRightSidebar = output<void>();
}
