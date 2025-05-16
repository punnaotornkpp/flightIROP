import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { operationRoutes } from './operation.routes';
import { OperationApprovedComponent } from './operation-approved/operation-approved.component';
import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationList } from './operation-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../shared/prime-ng.module';
import { ConfirmationService } from 'primeng/api';
import { FlightScheduleEditorComponent } from './operation-form/flight-schedule-editor/flight-schedule-editor.component';

@NgModule({
  declarations: [
    OperationList,
    OperationFormComponent,
    OperationApprovedComponent,
    FlightScheduleEditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimeNgModule,
    RouterModule.forChild(operationRoutes),
  ],
  providers: [ConfirmationService],
})
export class OperationModule {}
