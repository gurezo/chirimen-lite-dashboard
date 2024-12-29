import { Component } from '@angular/core';
import { ConsoleContainersComponent } from '../../containers';

@Component({
  selector: 'choh-console',
  standalone: true,
  imports: [ConsoleContainersComponent],
  template: `<choh-console-containers />`,
})
export default class ConsoleComponent {}
