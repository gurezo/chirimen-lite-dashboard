import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ButtonComponent, ExampleListComponent } from '../components';
import { I2cdetectDialogService } from '../i2cdetect/i2cdetect.dialog.service';
import { ExampleItem } from '../shared/models';
import { ExampleDataService } from './example.data.service';

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
