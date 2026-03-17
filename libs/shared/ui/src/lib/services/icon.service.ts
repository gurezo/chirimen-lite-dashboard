import { inject, Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private domSanitizer = inject(DomSanitizer);
  private matIconRegistry = inject(MatIconRegistry);

  // アイコン定義を定数化
  private readonly ICONS = [
    { name: 'terminal', path: '/terminal.png' },
    { name: 'upload', path: '/upload.png' },
    { name: 'settings', path: '/settings.png' },
    { name: 'sync', path: '/sync.png' },
    { name: 'sync_disabled', path: '/sync_disabled.png' },
    { name: 'lan', path: '/lan.png' },
    { name: 'javascript', path: '/javascript.png' },
    { name: 'save_sa', path: '/save_as.png' },
    { name: 'file_open', path: '/file_open.png' },
    { name: 'schema', path: '/schema.png' },
    { name: 'segment', path: '/segment.png' },
    { name: 'left_panel_open', path: '/left_panel_open.png' },
    { name: 'left_panel_close', path: '/left_panel_close.png' },
    { name: 'right_panel_open', path: '/right_panel_open.png' },
    { name: 'right_panel_close', path: '/right_panel_close.png' },
  ] as const;

  registIcons() {
    this.ICONS.forEach((icon) => {
      this.matIconRegistry.addSvgIcon(
        icon.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.path)
      );
    });
  }
}
