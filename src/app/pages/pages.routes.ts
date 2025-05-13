import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('../pages/home/home.component'),
    data: { breadcrumb: 'Home' },
  },
  {
    path: 'operation',
    loadChildren: () => import('../pages/operation/operation.routes'),
    data: { breadcrumb: 'Operation' },
  },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
