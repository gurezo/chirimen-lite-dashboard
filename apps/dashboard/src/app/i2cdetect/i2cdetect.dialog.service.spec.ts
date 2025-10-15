import { TestBed } from '@angular/core/testing';

import { I2cdetectDialogService } from './i2cdetect.dialog.service';

describe('I2cdetectDialogService', () => {
  let service: I2cdetectDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(I2cdetectDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
