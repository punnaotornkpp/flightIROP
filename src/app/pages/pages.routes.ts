import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent, // ต้อง import และ declare
  },
  {
    path: 'operation',
    loadChildren: () =>
      import('./operation/operation.module').then((m) => m.OperationModule),
  },
];
