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
    path: 'edit/:id',
    loadComponent: () =>
      import('./operation-form/operation-form.component.edit').then(
        (m) => m.OperationFormEditComponent
      ),
  },
  {
    path: 'approved/:id',
    loadComponent: () =>
      import('./operation-approved/operation-approved.component').then(
        (m) => m.OperationApprovedComponent
      ),
  },

  //   {
  //       path: 'edit',
  //       loadComponent: () => import('./edit').then((c) => c.Edit),
  //       data: { breadcrumb: 'Edit' }
  //   }
] as Routes;
