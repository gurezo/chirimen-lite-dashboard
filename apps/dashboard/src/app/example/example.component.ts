import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DialogService } from '@libs-dialogs';
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
  private dialogService = inject(DialogService);
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
    this.dialogService.close();
  }
}
