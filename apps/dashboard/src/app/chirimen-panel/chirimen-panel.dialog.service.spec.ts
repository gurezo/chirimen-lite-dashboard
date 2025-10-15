import { TestBed } from '@angular/core/testing';

import { ChirimenPanelDialogService } from './chirimen-panel.dialog.service';

describe('ChirimenPanelDialogService', () => {
  let service: ChirimenPanelDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChirimenPanelDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
