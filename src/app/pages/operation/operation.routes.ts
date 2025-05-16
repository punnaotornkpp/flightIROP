import { Routes } from '@angular/router';
import { OperationList } from './operation-list';
import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationApprovedComponent } from './operation-approved/operation-approved.component';

export const operationRoutes: Routes = [
  { path: '', component: OperationList },
  { path: 'create', component: OperationFormComponent },
  {
    path: 'approved/:transactionNumber',
    component: OperationApprovedComponent,
  },
];
