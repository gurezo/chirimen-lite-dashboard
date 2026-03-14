import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { connectionGuard } from './connection.guard';

describe('connectionGuard', () => {
  const executeGuard = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) =>
    TestBed.runInInjectionContext(() =>
      connectionGuard(route, state) as ReturnType<typeof connectionGuard>
    );

  let router: Router;
  let storeSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    storeSelect = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: Store,
          useValue: { select: storeSelect },
        },
      ],
    });
    router = TestBed.inject(Router);
  });

  describe('接続不要ルート（path: ""）', () => {
    it('常に true を返して許可する', () => {
      storeSelect.mockReturnValue(of(true));

      const route = {
        routeConfig: { path: '' },
      } as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = executeGuard(route, state);

      expect(result).toBe(true);
      expect(storeSelect).not.toHaveBeenCalled();
    });
  });

  describe('接続不要ルート（path: "unsupported-browser"）', () => {
    it('常に true を返して許可する', () => {
      storeSelect.mockReturnValue(of(false));

      const route = {
        routeConfig: { path: 'unsupported-browser' },
      } as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = executeGuard(route, state);

      expect(result).toBe(true);
      expect(storeSelect).not.toHaveBeenCalled();
    });
  });

  describe('接続必須ルート（上記以外）', () => {
    it('接続済みの場合は true を返して許可する', (done) => {
      storeSelect.mockReturnValue(of(true));

      const route = {
        routeConfig: { path: 'terminal' },
      } as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = executeGuard(route, state);

      if (typeof result === 'boolean') {
        expect(result).toBe(true);
        done();
      } else {
        result.subscribe((value) => {
          expect(value).toBe(true);
          done();
        });
      }
    });

    it('未接続の場合は "/" へリダイレクトする UrlTree を返す', (done) => {
      storeSelect.mockReturnValue(of(false));

      const route = {
        routeConfig: { path: 'terminal' },
      } as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = executeGuard(route, state);

      if (typeof result === 'boolean') {
        expect(result).toEqual(router.parseUrl('/'));
        done();
      } else {
        result.subscribe((value) => {
          expect(value).toEqual(router.parseUrl('/'));
          done();
        });
      }
    });
  });
});
