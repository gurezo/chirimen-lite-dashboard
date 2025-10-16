import { TestBed } from '@angular/core/testing';

import { WiFiService } from './wi-fi.service';

describe('WiFiService', () => {
  let service: WiFiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WiFiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
