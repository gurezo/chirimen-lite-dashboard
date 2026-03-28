import { AsyncPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';

export type ToolbarAction =
  | 'wifi'
  | 'editor'
  | 'example'
  | 'i2c'
  | 'setup'
  | 'remote';

@Component({
  selector: 'lib-header-toolbar',
  imports: [
    AsyncPipe,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    RouterLink,
  ],
  templateUrl: './header-toolbar.component.html',
})
export class HeaderToolbarComponent {
  connected$ = input<Observable<boolean>>(of(false));
  eventConnect = output<void>();
  eventDisConnect = output<void>();
  toolbarAction = output<ToolbarAction>();
  rightNavOpen = input<boolean>(true);
  toggleRightSidebar = output<void>();

  readonly toolbarActions = [
    { name: 'wifi', icon: 'signal_wifi_4_bar' },
    { name: 'editor', icon: 'terminal' },
    { name: 'example', icon: 'javascript' },
    { name: 'i2c', icon: 'lan' },
    { name: 'setup', icon: 'settings' },
    { name: 'remote', icon: 'sync' },
  ] as const;
}
