import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';

import { isConnected } from '@libs-web-serial';

/**
 * 接続必須でないルート（'' または 'unsupported-browser'）は常に許可する。
 * それ以外のルートでは、接続済みなら許可、未接続なら '/' へリダイレクトする。
 */
export const connectionGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const store = inject(Store);

  const path = route.routeConfig?.path;
  const isPublicPath =
    path === '' || path === 'unsupported-browser';

  if (isPublicPath) {
    return true;
  }

  return store.select(isConnected).pipe(
    take(1),
    map((connected) =>
      connected ? true : router.parseUrl('/')
    )
  );
};
