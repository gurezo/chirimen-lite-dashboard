import { TestBed } from '@angular/core/testing';

import { ExampleDialogService } from './example.dialog.service';

describe('ExampleDialogService', () => {
  let service: ExampleDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExampleDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
