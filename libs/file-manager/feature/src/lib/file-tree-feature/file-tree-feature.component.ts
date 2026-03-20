import { Component, inject, OnInit } from '@angular/core';
import { FileListService } from '@libs-file-manager-data-access';

@Component({
  selector: 'lib-file-tree-feature',
  standalone: true,
  template: `
    <section>
      <h1>File Tree Feature</h1>
      <p>デバイス上の 'ls -al' 出力（概略）:</p>
      <pre class="whitespace-pre-wrap">{{ output }}</pre>
      @if (errorMessage) {
        <p class="text-red-600">{{ errorMessage }}</p>
      }
    </section>
  `,
})
export class FileTreeFeatureComponent implements OnInit {
  private fileList = inject(FileListService);

  output = '';
  errorMessage: string | null = null;

  async ngOnInit(): Promise<void> {
    try {
      const files = await this.fileList.listFiles('.');
      this.output = files.join('\n');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorMessage = message;
    }
  }
}
