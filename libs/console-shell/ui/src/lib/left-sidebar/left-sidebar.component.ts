import { Component } from '@angular/core';
import { FileTreeFeatureComponent } from '@libs-file-manager-feature';

@Component({
  selector: 'lib-left-sidebar',
  standalone: true,
  imports: [FileTreeFeatureComponent],
  template: `
    <div class="left-sidebar h-full border-r border-gray-200">
      <lib-file-tree-feature />
    </div>
  `,
})
export class LeftSidebarComponent {}
