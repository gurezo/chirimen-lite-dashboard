import { AsyncPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Observable, of } from 'rxjs';

export type ToolbarAction =
  | 'wifi'
  | 'editor'
  | 'example'
  | 'i2c'
  | 'setup'
  | 'remote';

@Component({
  selector: 'lib-action-tool-bar',
  imports: [AsyncPipe, MatIconButton, MatIcon],
  templateUrl: './action-tool-bar.component.html',
})
export class ActionToolBarComponent {
  connected$ = input<Observable<boolean>>(of(false));
  toolbarAction = output<ToolbarAction>();

  readonly toolbarActions = [
    { name: 'wifi', icon: 'signal_wifi_4_bar' },
    { name: 'editor', icon: 'terminal' },
    { name: 'example', icon: 'javascript' },
    { name: 'i2c', icon: 'lan' },
    { name: 'setup', icon: 'settings' },
    { name: 'remote', icon: 'sync' },
  ] as const;
}
