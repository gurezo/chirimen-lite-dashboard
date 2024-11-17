import { Routes } from '@angular/router';
import { browserCheckGuard } from './guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout-main/layout-main.component'),
    canActivate: [browserCheckGuard],
  },
  {
    path: 'unsupported-browser',
    loadComponent: () =>
      import('./pages/unsupported-browser/unsupported-browser.component'),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/page-not-found/page-not-found.component'),
  },
];
