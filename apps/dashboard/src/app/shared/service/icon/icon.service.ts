import { inject, Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private domSanitizer = inject(DomSanitizer);
  private matIconRegistry = inject(MatIconRegistry);

  registIcons() {
    this.matIconRegistry.addSvgIcon(
      'terminal',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/terminal.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'upload',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/upload.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'settings',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/settings.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'sync',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/sync.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'sync_disabled',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/sync_disabled.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'lan',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/lan.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'javascript',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/javascript.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'save_sa',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/save_as.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'file_open',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/file_open.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'schema',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/schema.png'),
    );
    this.matIconRegistry.addSvgIcon(
      'segment',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/segment.png'),
    );
  }
}
