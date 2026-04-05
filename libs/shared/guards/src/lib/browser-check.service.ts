import { Injectable } from '@angular/core';
import { checkBrowserSupport } from '@gurezo/web-serial-rxjs';

@Injectable({ providedIn: 'root' })
export class BrowserCheckService {
  /**
   * Web Serial 利用可否（Chromium 系・API 有無を @gurezo/web-serial-rxjs で検証）
   */
  isSupported(): boolean {
    try {
      checkBrowserSupport();
      return true;
    } catch {
      return false;
    }
  }
}
