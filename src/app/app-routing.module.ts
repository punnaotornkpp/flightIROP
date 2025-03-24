import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayout } from './layout/components/app.layout';
import { Landing } from './pages/landing/landing';
import { Notfound } from './pages/notfound/notfound';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../app/pages/dashboards/ecommercedashboard').then(
            (c) => c.EcommerceDashboard
          ),
        data: { breadcrumb: 'E-Commerce Dashboard' },
      },
      {
        path: 'dashboard-banking',
        loadComponent: () =>
          import('../app/pages/dashboards/bankingdashboard').then(
            (c) => c.BankingDashboard
          ),
        data: { breadcrumb: 'Banking Dashboard' },
      },
      {
        path: 'uikit',
        data: { breadcrumb: 'UI Kit' },
        loadChildren: () => import('../app/pages/uikit/uikit.routes'),
      },
      {
        path: 'documentation',
        data: { breadcrumb: 'Documentation' },
        loadComponent: () =>
          import('../app/pages/documentation/documentation').then(
            (c) => c.Documentation
          ),
      },
      {
        path: 'pages',
        loadChildren: () => import('../app/pages/pages.routes'),
      },
      {
        path: 'apps',
        loadChildren: () => import('../app/apps/apps.routes'),
        data: { breadcrumb: 'Apps' },
      },
      {
        path: 'blocks',
        data: { breadcrumb: 'Free Blocks' },
        loadChildren: () => import('../app/pages/blocks/blocks.routes'),
      },
      {
        path: 'ecommerce',
        loadChildren: () => import('../app/pages/ecommerce/ecommerce.routes'),
        data: { breadcrumb: 'E-Commerce' },
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../app/pages/usermanagement/usermanagement.routes'),
      },
    ],
  },
  { path: 'landing', component: Landing },
  { path: 'notfound', component: Notfound },
  {
    path: 'auth',
    loadChildren: () => import('../app/pages/auth/auth.routes'),
  },
  { path: '**', redirectTo: '/notfound' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
