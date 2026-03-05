import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { vi } from 'vitest';

import { browserCheckGuard } from './browser-check.guard';
import { isBrowserSupported } from '@gurezo/web-serial-rxjs';

vi.mock('@gurezo/web-serial-rxjs', () => ({
  isBrowserSupported: vi.fn(),
}));

describe('browserCheckGuard', () => {
  const executeGuard = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ) => TestBed.runInInjectionContext(() => browserCheckGuard(route, state));

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    router = TestBed.inject(Router);
  });

  describe('ルートパス（\"\"）へのアクセス時', () => {
    afterEach(() => {
      vi.mocked(isBrowserSupported).mockReset();
    });

    it('対応ブラウザの場合はそのまま表示を許可してtrueを返す', () => {
      vi.mocked(isBrowserSupported).mockReturnValue(true);

      const route = {
        routeConfig: { path: '' },
      } as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = executeGuard(route, state);

      expect(result).toBe(true);
    });

    it('非対応ブラウザの場合はサポート外ページへリダイレクトするUrlTreeを返す', () => {
      vi.mocked(isBrowserSupported).mockReturnValue(false);

      const route = {
        routeConfig: { path: '' },
      } as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = executeGuard(route, state);

      expect(result).toEqual(router.parseUrl('/unsupported-browser'));
    });
  });

  describe('サポート外ブラウザページ（\"unsupported-browser\"）へのアクセス時', () => {
    afterEach(() => {
      vi.mocked(isBrowserSupported).mockReset();
    });

    it('対応ブラウザの場合はホームページへリダイレクトするUrlTreeを返す', () => {
      vi.mocked(isBrowserSupported).mockReturnValue(true);

      const route = {
        routeConfig: { path: 'unsupported-browser' },
      } as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = executeGuard(route, state);

      expect(result).toEqual(router.parseUrl('/'));
    });

    it('非対応ブラウザの場合はそのまま表示を許可してtrueを返す', () => {
      vi.mocked(isBrowserSupported).mockReturnValue(false);

      const route = {
        routeConfig: { path: 'unsupported-browser' },
      } as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      const result = executeGuard(route, state);

      expect(result).toBe(true);
    });
  });
});
