import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const unsupportedBrowserGuard: CanActivateFn = () => {
  const router = inject(Router);

  const userAgent = window.navigator.userAgent.toLowerCase();

  // デスクトップ版のChrome, Edge, Operaの判定
  const isChrome = /chrome/.test(userAgent) && !/edge|opr/.test(userAgent);
  const isEdge = /edg/.test(userAgent);
  const isOpera = /opr/.test(userAgent);

  if (isChrome || isEdge || isOpera) {
    // 対応ブラウザの場合は、ホームページにリダイレクト
    router.navigate(['/']);
    return false;
  } else {
    // 非対応ブラウザの場合は、このページへのアクセスを許可
    return true;
  }
};
