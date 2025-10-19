import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ButtonComponent } from '@libs-ui';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ExampleListComponent } from './components/example-list/example-list.component';
import { ExampleItem } from './models/example.item.model';
import { ExampleDataService } from './services/example.data.service';
import { ExampleDialogService } from './services/example.dialog.service';

@Component({
  selector: 'choh-example',
  imports: [ButtonComponent, ExampleListComponent, AsyncPipe],
  templateUrl: './example.component.html',
})
export class ExampleComponent implements OnInit {
  private exampleDialogService = inject(ExampleDialogService);
  private exampleDataService = inject(ExampleDataService);

  exampleSubject = new BehaviorSubject<
    [ExampleItem[], ExampleItem[], ExampleItem[]]
  >([[], [], []]);
  example$ = this.exampleSubject.asObservable();

  ngOnInit(): void {
    this.example$ = forkJoin([
      this.exampleDataService.getGPIOExampleList(),
      this.exampleDataService.getI2CExampleList(),
      this.exampleDataService.getRemoteExampleList(),
    ]);
  }

  closeModal(): void {
    this.exampleDialogService.closeDialog();
  }
}
