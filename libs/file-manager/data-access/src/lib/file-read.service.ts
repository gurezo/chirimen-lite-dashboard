import { Injectable, inject } from '@angular/core';
import { FileContentService } from '@libs-wifi-data-access';

@Injectable({ providedIn: 'root' })
export class FileReadService {
  private fileContent = inject(FileContentService);

  async read(path: string): Promise<string> {
    const info = await this.fileContent.readFile(path);
    if (!info.isText || typeof info.content !== 'string') {
      throw new Error('Target file is not a text file');
    }
    return info.content;
  }
}
