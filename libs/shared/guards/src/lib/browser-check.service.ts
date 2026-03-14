import { Injectable } from '@angular/core';
import { isBrowserSupported } from '@gurezo/web-serial-rxjs';

@Injectable({ providedIn: 'root' })
export class BrowserCheckService {
  isSupported(): boolean {
    return isBrowserSupported();
  }
}
