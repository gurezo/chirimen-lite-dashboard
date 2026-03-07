import { Routes } from '@angular/router';
import { browserCheckGuard } from '@console/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout.component'),
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
