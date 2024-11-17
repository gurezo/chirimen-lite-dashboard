import { Component, Input } from '@angular/core';
import { ExampleItem } from '../../models';
import { ExampleItemComponent } from '../example-item/example-item.component';

@Component({
  selector: 'app-example-list',
  standalone: true,
  imports: [ExampleItemComponent],
  templateUrl: './example-list.component.html',
  styleUrl: './example-list.component.scss',
})
export class ExampleListComponent {
  @Input() gpioExample!: ExampleItem[];
  @Input() i2cExample!: ExampleItem[];
  @Input() remoteExample!: ExampleItem[];
}