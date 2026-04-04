import {
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  isConnected,
  selectIsPostConnectInitDone,
} from '@libs-web-serial-state';
import { FileListService } from '@libs-file-manager-data-access';
import { FileTreeComponent } from '@libs-file-manager-ui';
import { FileTreeNode, joinPath } from '@libs-file-manager-util';
import { combineLatest, Subscription } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

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
export class FileTreeFeatureComponent implements OnInit, OnDestroy {
  private fileList = inject(FileListService);
  private store = inject(Store);
  private router = inject(Router);
  private loadSubscription?: Subscription;

  @Output() readonly fileSelected = new EventEmitter<string>();

  nodes: FileTreeNode[] = [];
  currentPath = '.';
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const terminal$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.isTerminalRoute()),
      startWith(this.isTerminalRoute()),
    );

    this.loadSubscription = combineLatest([
      this.store.select(isConnected),
      this.store.select(selectIsPostConnectInitDone),
      terminal$,
    ])
      .pipe(
        filter(
          ([connected, postConnectDone, terminal]) =>
            connected && postConnectDone && terminal,
        ),
      )
      .subscribe(() => {
        void this.loadCurrentPath();
      });
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  /**
   * lazy `loadComponent` だけの子ルートでは `ActivatedRoute.snapshot.routeConfig.path`
   * が期待どおり取れないことがあるため、実際の URL（primary outlet の末尾セグメント）で判定する。
   */
  private isTerminalRoute(): boolean {
    const tree = this.router.parseUrl(this.router.url);
    const primary = tree.root.children[PRIMARY_OUTLET];
    const segments = primary?.segments ?? [];
    return (
      segments.length > 0 &&
      segments[segments.length - 1].path === 'terminal'
    );
  }

  async reload(): Promise<void> {
    await this.loadCurrentPath();
  }

  async onDirectorySelected(node: FileTreeNode): Promise<void> {
    this.currentPath = node.path;
    await this.loadCurrentPath();
  }

  onFileSelected(node: FileTreeNode): void {
    this.fileSelected.emit(node.path);
  }

  async goParent(): Promise<void> {
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
      this.nodes = await this.fileList.list(this.currentPath);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorMessage = message;
    } finally {
      this.loading = false;
    }
  }
}
