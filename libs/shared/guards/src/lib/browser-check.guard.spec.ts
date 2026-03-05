import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { vi } from 'vitest';

import { browserCheckGuard } from './browser-check.guard';
import { isSupportedBrowser } from './browser-detection';

vi.mock('./browser-detection', () => ({
  isSupportedBrowser: vi.fn(),
}));

describe('browserCheckGuard', () => {
  const executeGuard = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ) => TestBed.runInInjectionContext(() => browserCheckGuard(route, state));

  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate');
    route = {} as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;
  });

  afterEach(() => {
    navigateSpy.mockClear();
  });

  it('should be created', () => {
    expect(browserCheckGuard).toBeTruthy();
  });

  describe('対応ブラウザの場合', () => {
    afterEach(() => {
      vi.mocked(isSupportedBrowser).mockReset();
    });

    it('対応ブラウザの場合はページ遷移を許可してtrueを返す', () => {
      vi.mocked(isSupportedBrowser).mockReturnValue(true);

      const result = executeGuard(route, state);

      expect(result).toBe(true);
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('非対応ブラウザの場合', () => {
    afterEach(() => {
      vi.mocked(isSupportedBrowser).mockReset();
    });

    it('非対応ブラウザの場合はサポート外ページへリダイレクトしてfalseを返す', () => {
      vi.mocked(isSupportedBrowser).mockReturnValue(false);

      const result = executeGuard(route, state);

      expect(result).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/unsupported-browser']);
    });
  });
});
