import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ButtonComponent, ExampleListComponent } from '../../components';
import { ExampleItem } from '../../models';
import { DialogService } from '../../shared/service/dialog/dialog.service';
import { ExampleDialogService } from './example.dialog.service';

@Component({
  selector: 'choh-example',
  imports: [ButtonComponent, ExampleListComponent, AsyncPipe],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent implements OnInit {
  private service = inject(DialogService);
  private exampleDialogService = inject(ExampleDialogService);

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
