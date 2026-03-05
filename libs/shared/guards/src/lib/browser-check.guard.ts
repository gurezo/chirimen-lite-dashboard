import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isSupportedBrowser } from './browser-detection';

export const browserCheckGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (isSupportedBrowser()) {
    router.navigate(['/']);
  } else {
    router.navigate(['/unsupported-browser']);
  }

  return false;
};
