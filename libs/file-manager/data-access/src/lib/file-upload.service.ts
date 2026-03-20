import { Injectable, inject } from '@angular/core';
import { FileContentService } from '@libs-wifi-data-access';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private fileContent = inject(FileContentService);

  /**
   * バイナリのアップロード（base64 + Ctrl-C/Ctrl-D 方式）
   */
  async uploadBinary(
    targetPath: string,
    buffer: ArrayBuffer,
  ): Promise<void> {
    await this.fileContent.writeBinaryFile(targetPath, buffer);
  }
}
