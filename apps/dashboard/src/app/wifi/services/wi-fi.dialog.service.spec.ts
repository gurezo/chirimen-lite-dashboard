import { TestBed } from '@angular/core/testing';

import { WifiDialogService } from './wi-fi.dialog.service';

describe('WifiDialogService', () => {
  let service: WifiDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WifiDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
