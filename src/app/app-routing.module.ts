import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppLayout } from './layout/components/app.layout';
import { Notfound } from './pages/notfound/notfound';

export const routes: Routes = [
  {
    path: 'admin',
    component: AppLayout,
    children: [
      {
        path: '',
        loadChildren: () => import('../app/pages/pages.routes'),
      },
    ],
  },
  { path: 'notfound', component: Notfound },
  {
    path: '',
    loadChildren: () => import('../app/pages/auth/auth.routes'),
  },
  { path: '**', redirectTo: '/notfound' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
