import { Routes } from '@angular/router';
import { browserCheckGuard } from './shared/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout.component'),
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
