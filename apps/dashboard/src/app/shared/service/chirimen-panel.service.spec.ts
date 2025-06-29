import { TestBed } from '@angular/core/testing';

import { ChirimenPanelService } from './chirimen-panel.service';

describe('ChirimenPanelService', () => {
  let service: ChirimenPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChirimenPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
