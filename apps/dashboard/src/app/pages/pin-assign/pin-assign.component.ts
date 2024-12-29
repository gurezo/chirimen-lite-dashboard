import { Component } from '@angular/core';
import { PinAssignContainersComponent } from '../../containers';

@Component({
  selector: 'choh-pin-assign',
  standalone: true,
  imports: [PinAssignContainersComponent],
  template: `<choh-pin-assign />`,
})
export default class PinAssignComponent {}
