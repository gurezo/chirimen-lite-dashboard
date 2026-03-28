import { Component, inject } from '@angular/core';
import { ConsoleShellStore } from '@libs-console-shell-util';
import { FileTreeFeatureComponent } from '@libs-file-manager-feature';

@Component({
  selector: 'lib-left-sidebar',
  imports: [FileTreeFeatureComponent],
  template: `
    <div class="left-sidebar h-full border-r border-gray-200">
      <lib-file-tree-feature (fileSelected)="onFileSelected($event)" />
    </div>
  `,
})
export class LeftSidebarComponent {
  private shellStore = inject(ConsoleShellStore);

  onFileSelected(path: string): void {
    this.shellStore.setSelectedFilePath(path);
    this.shellStore.setActivePanel('editor');
  }
}
