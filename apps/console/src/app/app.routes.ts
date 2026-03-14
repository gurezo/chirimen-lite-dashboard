import { Routes } from '@angular/router';
import { browserCheckGuard, connectionGuard } from '@libs-console-guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@libs-console-shell-feature').then((m) => m.ConsoleShellComponent),
    canActivate: [browserCheckGuard, connectionGuard],
  },
  {
    path: 'unsupported-browser',
    loadComponent: () => import('@libs-unsupported-browser'),
    canActivate: [browserCheckGuard, connectionGuard],
  },
  {
    path: '**',
    loadComponent: () => import('@libs-page-not-found'),
  },
];
