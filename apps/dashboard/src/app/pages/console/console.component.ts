import { Component } from '@angular/core';
import { ConsoleContainersComponent } from '../../containers';

@Component({
  selector: 'choh-console',
  imports: [ConsoleContainersComponent],
  template: `<choh-console-containers />`,
})
export default class ConsoleComponent {}
