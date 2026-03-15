import { Routes } from '@angular/router';
import { browserCheckGuard } from '@libs-shared-guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@libs-console-shell-feature').then((m) => m.ConsoleShellComponent),
    canActivate: [browserCheckGuard],
  },
  {
    path: 'unsupported-browser',
    loadComponent: () => import('@libs-unsupported-browser'),
    canActivate: [browserCheckGuard],
  },
  {
    path: '**',
    loadComponent: () => import('@libs-page-not-found'),
  },
];
