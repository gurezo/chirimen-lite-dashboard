import { Routes } from '@angular/router';
import { browserCheckGuard, unsupportedBrowserGuard } from '@dashboard/guards';

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
    canActivate: [unsupportedBrowserGuard],
  },
  {
    path: '**',
    loadComponent: () => import('@libs-page-not-found'),
  },
];
