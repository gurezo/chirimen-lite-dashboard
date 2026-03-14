import { Routes } from '@angular/router';
import { browserCheckGuard, connectionGuard } from '@console/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout.component'),
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
