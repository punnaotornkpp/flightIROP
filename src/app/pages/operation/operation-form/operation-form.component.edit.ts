// import { Component } from '@angular/core';
// import { OperationFormComponent } from './operation-form.component';
// import { CommonModule } from '@angular/common';
// import {
//   ReactiveFormsModule,
//   FormsModule,
//   FormBuilder,
//   FormGroup,
// } from '@angular/forms';
// import { AccordionModule } from 'primeng/accordion';
// import { ButtonModule } from 'primeng/button';
// import { CheckboxModule } from 'primeng/checkbox';
// import { DatePickerModule } from 'primeng/datepicker';
// import { DialogModule } from 'primeng/dialog';
// import { EditorModule } from 'primeng/editor';
// import { InputGroupModule } from 'primeng/inputgroup';
// import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
// import { InputTextModule } from 'primeng/inputtext';
// import { MultiSelectModule } from 'primeng/multiselect';
// import { PopoverModule } from 'primeng/popover';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { SelectModule } from 'primeng/select';
// import { SelectButtonModule } from 'primeng/selectbutton';
// import { TableModule } from 'primeng/table';
// import { FlightScheduleEditorComponent } from './flight-schedule-editor/flight-schedule-editor.component';
// import { AuthService } from '../../../service/auth.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MessageService } from 'primeng/api';
// import { FlightService } from '../../../service/flight.service';

// @Component({
//   selector: 'app-operation-form',
//   standalone: true,
//   templateUrl: './operation-form.component.html',
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     FormsModule,
//     FlightScheduleEditorComponent,
//     TableModule,
//     ButtonModule,
//     InputTextModule,
//     DialogModule,
//     CheckboxModule,
//     MultiSelectModule,
//     InputGroupModule,
//     InputGroupAddonModule,
//     SelectModule,
//     DatePickerModule,
//     AccordionModule,
//     EditorModule,
//     ProgressSpinnerModule,
//     PopoverModule,
//     SelectButtonModule,
//   ],
// })
// export class OperationFormEditComponent extends OperationFormComponent {
//   private txn!: string;

//   constructor(
//     fb: FormBuilder,
//     route: ActivatedRoute,
//     router: Router,
//     service: FlightService,
//     authService: AuthService,
//     messageService: MessageService
//   ) {
//     super(fb, route, router, service, authService, messageService);
//   }

//   override ngOnInit(): void {
//     const user = this.authService.getCurrentUser();
//     this.userRole = user?.role ?? '';
//     this.sourceTypeOptions = this.getSourceTypeOptionsByRole(this.userRole);
//     this.buildForm();
//     this.txn = this.route.snapshot.paramMap.get('transactionNumber') ?? '';
//     if (!this.txn) {
//       this.messageService.add({
//         severity: 'error',
//         summary: 'Error',
//         detail: 'No transaction number.',
//       });
//       this.router.navigate(['/admin/operation']);
//       return;
//     }
//     this.isLoading = true;
//     this.service.getSavedOperationById(this.txn).subscribe({
//       next: (op) => {
//         this.form.patchValue({
//           createdBy: op.createdTeam, // PLN / OPS
//           remark: op.remark,
//           customNotifyMessage: op.customNotifyMessage,
//         });
//         if (op.season?.length === 3) {
//           this.selectedSeasonType = op.season[0] as 'S' | 'W';

//           const shortYear = +op.season.slice(1);
//           this.selectedSeasonYear = 2000 + shortYear;
//           this.updateSeasonCode();
//         }
//         this.form.patchValue({
//           sourceType: op.messageType,
//           // …ฟิลด์อื่น…
//         });
//         this.iropActionType = op.actionCode; // 'CANCELLED' | 'REVISED'…
//         const typeId = this.getReasonTypeId(this.iropActionType);
//         if (typeId !== null) {
//           this.service.getReasons(typeId).subscribe((res) => {
//             this.reasons = res.map((r: any) => ({
//               label: r.en,
//               value: r.code,
//             }));
//           });
//         }
//         this.flightIropItems = op.flightIropItems ?? [];

//         this.isLoading = false;
//       },
//       error: () => {
//         this.isLoading = false;
//         this.messageService.add({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Load failed.',
//         });
//       },
//     });
//   }

//   override onAdd(): void {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     const payload = {
//       ...this.form.value,
//       flightIropItems: this.flightIropItems,
//     };

//     this.isLoading = true;
//     this.service.updateSavedOperation(this.txn, payload).subscribe({
//       next: () => {
//         this.isLoading = false;
//         this.messageService.add({
//           severity: 'success',
//           summary: 'Updated',
//           detail: 'Operation updated.',
//         });
//         this.router.navigate(['/admin/operation']);
//       },
//       error: () => {
//         this.isLoading = false;
//         this.messageService.add({
//           severity: 'error',
//           summary: 'Error',
//           detail: 'Update failed.',
//         });
//       },
//     });
//   }
// }
