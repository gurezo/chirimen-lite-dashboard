import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DialogService } from '@libs-dialogs-util';
import { ButtonComponent } from '@libs-shared-ui';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ExampleItem } from '@libs-example-util';
import { ExampleListComponent } from '@libs-example-ui';
import { ExampleDataService } from '@libs-example-data-access';

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
