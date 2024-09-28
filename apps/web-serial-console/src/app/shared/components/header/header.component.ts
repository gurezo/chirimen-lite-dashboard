import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { DialogService } from '../../service/dialog/dialog.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private domSanitizer = inject(DomSanitizer);
  private matIconRegistry = inject(MatIconRegistry);
  private dailogService = inject(DialogService);
  dialog = inject(Dialog);

  isSerialConnected = true;
  isNotSerialConnected = !this.isSerialConnected;

  ngOnInit(): void {
    this.matIconRegistry.addSvgIcon(
      'terminal',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '/terminal_24dp_5F6368.svg',
      ),
    );
  }

  openPinAssignDialog() {
    this.dailogService.openPinAssignDialog();
  }
}
