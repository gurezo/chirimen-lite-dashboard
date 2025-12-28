import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { vi } from 'vitest';

import { unsupportedBrowserGuard } from './unsupported-browser.guard';

describe('unsupportedBrowserGuard', () => {
  const executeGuard = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) =>
    TestBed.runInInjectionContext(() => unsupportedBrowserGuard(route, state));

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
    expect(unsupportedBrowserGuard).toBeTruthy();
  });

  describe('対応ブラウザの場合', () => {
    const originalUserAgent = window.navigator.userAgent;

    afterEach(() => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true,
        configurable: true,
      });
    });

    it('Chromeの場合はホームページへリダイレクトしてfalseを返す', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        writable: true,
        configurable: true,
      });

      const result = executeGuard(route, state);

      expect(result).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('Edgeの場合はホームページへリダイレクトしてfalseを返す', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        writable: true,
        configurable: true,
      });

      const result = executeGuard(route, state);

      expect(result).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('Operaの場合はホームページへリダイレクトしてfalseを返す', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
        writable: true,
        configurable: true,
      });

      const result = executeGuard(route, state);

      expect(result).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('非対応ブラウザの場合', () => {
    const originalUserAgent = window.navigator.userAgent;

    afterEach(() => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: originalUserAgent,
        writable: true,
        configurable: true,
      });
    });

    it('Firefoxの場合はtrueを返す', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        writable: true,
        configurable: true,
      });

      const result = executeGuard(route, state);

      expect(result).toBe(true);
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('Safariの場合はtrueを返す', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        writable: true,
        configurable: true,
      });

      const result = executeGuard(route, state);

      expect(result).toBe(true);
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
