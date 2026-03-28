import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileTreeNode } from '@libs-file-manager-util';

@Component({
  selector: 'lib-file-tree',
  template: `
    <div class="file-tree text-sm">
      @if (!nodes.length) {
        <p class="text-gray-500">No files</p>
      } @else {
        <ul class="space-y-1">
          @for (node of nodes; track node.path) {
            <li>
              <button
                type="button"
                class="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                (click)="onSelect(node)"
              >
                @if (node.isDirectory) {
                  <span>📁 {{ node.name }}</span>
                } @else {
                  <span>📄 {{ node.name }}</span>
                }
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class FileTreeComponent {
  @Input() nodes: FileTreeNode[] = [];

  @Output() readonly directorySelected = new EventEmitter<FileTreeNode>();
  @Output() readonly fileSelected = new EventEmitter<FileTreeNode>();

  onSelect(node: FileTreeNode): void {
    if (node.isDirectory) {
      this.directorySelected.emit(node);
      return;
    }
    this.fileSelected.emit(node);
  }
}
