import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileService } from '@libs-file-manager-data-access';
import { FileTreeComponent } from '@libs-file-manager-ui';
import { FileTreeNode, joinPath } from '@libs-file-manager-util';
import { PiZeroShellReadinessService } from '@libs-web-serial-data-access';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'lib-file-tree-feature',
  imports: [FileTreeComponent],
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col',
  },
  template: `
    <section
      class="flex h-full min-h-0 min-w-0 flex-col gap-2 p-2"
      aria-label="File browser"
    >
      <div class="shrink-0 space-y-2">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Files</h2>
          <button type="button" class="text-xs underline" (click)="reload()">
            reload
          </button>
        </div>

        <p class="text-xs text-gray-500 break-all">current: {{ currentPath }}</p>

        @if (currentPath !== '.') {
          <button type="button" class="text-xs underline" (click)="goParent()">
            ← parent
          </button>
        }

        @if (loading) {
          <p class="text-xs text-gray-500">loading...</p>
        }
      </div>

      <div
        class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        role="region"
        aria-label="File list"
      >
        <lib-file-tree
          [nodes]="nodes"
          (directorySelected)="onDirectorySelected($event)"
          (fileSelected)="onFileSelected($event)"
        />
      </div>

      @if (errorMessage) {
        <p class="shrink-0 text-xs text-red-600">{{ errorMessage }}</p>
      }
    </section>
  `,
})
export class FileTreeFeatureComponent implements OnInit {
  private file = inject(FileService);
  private shellReadiness = inject(PiZeroShellReadinessService);
  private destroyRef = inject(DestroyRef);
  @Output() readonly fileSelected = new EventEmitter<string>();

  nodes: FileTreeNode[] = [];
  currentPath = '.';
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loading = true;
    if (this.shellReadiness.isReady()) {
      void this.loadCurrentPath();
      return;
    }
    this.shellReadiness.ready$
      .pipe(
        filter(Boolean),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => void this.loadCurrentPath());
  }

  async reload(): Promise<void> {
    if (!this.shellReadiness.isReady()) {
      return;
    }
    await this.loadCurrentPath();
  }

  async onDirectorySelected(node: FileTreeNode): Promise<void> {
    if (!this.shellReadiness.isReady()) {
      return;
    }
    this.currentPath = node.path;
    await this.loadCurrentPath();
  }

  onFileSelected(node: FileTreeNode): void {
    this.fileSelected.emit(node.path);
  }

  async goParent(): Promise<void> {
    if (!this.shellReadiness.isReady()) {
      return;
    }
    if (this.currentPath === '.') {
      return;
    }
    const normalized = this.currentPath.startsWith('./')
      ? this.currentPath.slice(2)
      : this.currentPath;
    const segments = normalized.split('/').filter(Boolean);
    segments.pop();
    this.currentPath =
      segments.length === 0 ? '.' : joinPath('.', segments.join('/'));
    await this.loadCurrentPath();
  }

  private async loadCurrentPath(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    try {
      this.nodes = await this.file.listTree(this.currentPath);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorMessage = message;
    } finally {
      this.loading = false;
    }
  }
}
