import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FileTreeNode } from '@libs-file-manager-util';

@Component({
  selector: 'lib-file-tree',
  imports: [MatIcon],
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
                class="inline-flex w-full items-center gap-1 text-left px-2 py-1 rounded hover:bg-gray-100"
                (click)="onSelect(node)"
              >
                @if (node.isDirectory) {
                  <mat-icon aria-hidden="true" class="shrink-0 text-amber-500">folder</mat-icon>
                  <span>{{ node.name }}</span>
                } @else {
                  <mat-icon aria-hidden="true" class="shrink-0">article</mat-icon>
                  <span>{{ node.name }}</span>
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
