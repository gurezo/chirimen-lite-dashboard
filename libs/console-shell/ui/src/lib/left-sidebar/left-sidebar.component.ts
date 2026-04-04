import { Component, inject } from '@angular/core';
import { ConsoleShellStore } from '@libs-console-shell-util';
import { FileTreeFeatureComponent } from '@libs-file-manager-feature';

@Component({
  selector: 'lib-left-sidebar',
  imports: [FileTreeFeatureComponent],
  host: {
    class:
      'flex min-h-0 flex-1 flex-col overflow-hidden border-r border-gray-200',
  },
  template: `
    <lib-file-tree-feature (fileSelected)="onFileSelected($event)" />
  `,
})
export class LeftSidebarComponent {
  private shellStore = inject(ConsoleShellStore);

  onFileSelected(path: string): void {
    this.shellStore.setSelectedFilePath(path);
    this.shellStore.setActivePanel('editor');
  }
}
