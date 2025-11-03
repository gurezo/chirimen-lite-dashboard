import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isSupportedBrowser } from './browser-detection';

export const unsupportedBrowserGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (isSupportedBrowser()) {
    // 対応ブラウザの場合は、ホームページにリダイレクト
    router.navigate(['/']);
    return false;
  } else {
    // 非対応ブラウザの場合は、このページへのアクセスを許可
    return true;
  }
};
