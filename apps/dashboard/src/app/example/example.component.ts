import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { I2cdetectDialogService } from '@libs-i2cdetect';
import { ButtonComponent } from '@libs-ui';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ExampleListComponent } from './components/example-list/example-list.component';
import { ExampleItem } from './models/example.item.model';
import { ExampleDataService } from './services/example.data.service';

@Component({
  selector: 'choh-example',
  imports: [ButtonComponent, ExampleListComponent, AsyncPipe],
  templateUrl: './example.component.html',
})
export class ExampleComponent implements OnInit {
  private service = inject(I2cdetectDialogService);
  private exampleDialogService = inject(ExampleDataService);

  exampleSubject = new BehaviorSubject<
    [ExampleItem[], ExampleItem[], ExampleItem[]]
  >([[], [], []]);
  example$ = this.exampleSubject.asObservable();

  ngOnInit(): void {
    this.example$ = forkJoin([
      this.exampleDialogService.getGPIOExampleList(),
      this.exampleDialogService.getI2CExampleList(),
      this.exampleDialogService.getRemoteExampleList(),
    ]);
  }

  closeModal(): void {
    this.service.closeDialog();
  }
}
