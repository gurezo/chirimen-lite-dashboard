import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const browserCheckGuard: CanActivateFn = () => {
  const router = inject(Router);

  const userAgent = window.navigator.userAgent.toLowerCase();

  // デスクトップ版のChrome, Edge, Operaの判定
  const isChrome = /chrome/.test(userAgent) && !/edge|opr/.test(userAgent);
  const isEdge = /edg/.test(userAgent);
  const isOpera = /opr/.test(userAgent);

  if (isChrome || isEdge || isOpera) {
    // デスクトップ版の Chrome, Edge, Opera の場合はページ遷移を許可
    return true;
  } else {
    // それ以外のブラウザの場合は、サポート外ページへ遷移
    router.navigate(['/unsupported-browser']);
    return false;
  }
};

