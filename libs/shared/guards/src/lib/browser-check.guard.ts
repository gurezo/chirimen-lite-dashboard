import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isSupportedBrowser } from './browser-detection';

export const browserCheckGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (isSupportedBrowser()) {
    // デスクトップ版の Chrome, Edge, Opera の場合はページ遷移を許可
    return true;
  } else {
    // それ以外のブラウザの場合は、サポート外ページへ遷移
    router.navigate(['/unsupported-browser']);
    return false;
  }
};
