import { Component, Input } from '@angular/core';
import { ExampleItem } from '../../models';
import { ExampleItemComponent } from '../example-item/example-item.component';

@Component({
  selector: 'choh-example-list',
  imports: [ExampleItemComponent],
  templateUrl: './example-list.component.html',
})
export class ExampleListComponent {
  @Input() gpioExample!: ExampleItem[];
  @Input() i2cExample!: ExampleItem[];
  @Input() remoteExample!: ExampleItem[];
}
