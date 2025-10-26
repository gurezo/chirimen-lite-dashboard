import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { browserCheckGuard } from './browser-check.guard';

describe('browserCheckGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => browserCheckGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
