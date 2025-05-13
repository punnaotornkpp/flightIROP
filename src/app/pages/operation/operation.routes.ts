import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./operation-list').then((c) => c.OperationList),
    data: { breadcrumb: 'List' },
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./operation-form/operation-form.component').then(
        (c) => c.OperationFormComponent
      ),
    data: { breadcrumb: 'Create' },
  },
  {
    path: 'approved/:transactionNumber',
    loadComponent: () =>
      import('./operation-approved/operation-approved.component').then(
        (m) => m.OperationApprovedComponent
      ),
  },
  // {
  //   path: 'edit/:transactionNumber',
  //   loadComponent: () =>
  //     import('./operation-form/operation-form.component.edit').then(
  //       (c) => c.OperationFormEditComponent
  //     ),
  //   data: { breadcrumb: 'Edit' },
  // },
] as Routes;
