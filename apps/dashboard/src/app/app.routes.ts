import { Routes } from '@angular/router';
import { browserCheckGuard } from '@dashboard/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout.component'),
    canActivate: [browserCheckGuard],
  },
  {
    path: 'unsupported-browser',
    loadComponent: () => import('@libs-unsupported-browser'),
  },
  {
    path: '**',
    loadComponent: () => import('@libs-page-not-found'),
  },
];
