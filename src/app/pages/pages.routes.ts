import { Routes } from '@angular/router';

export default [
  {
    path: 'operation',
    loadChildren: () => import('../pages/operation/operation.routes'),
    data: { breadcrumb: 'Operation' },
  },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
