import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './pages.routes';
import { OperationModule } from './operation/operation.module';

@NgModule({
  imports: [OperationModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesModule {}
