import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { SubscriptionDestroyer } from '../../../core/helper/SubscriptionDestroyer.helper';
import { FlightService } from '../../../service/flight.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FlightIropResponse } from '../../../types/flight.model';

@Component({
  selector: 'app-operation-form',
  standalone: true,
  templateUrl: './operation-form.component.html',
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    DialogModule,
    CheckboxModule,
    CalendarModule,
  ],
})
export class OperationFormComponent
  extends SubscriptionDestroyer
  implements OnInit
{
  @Input() editId: string | null = null;

  flightSearchCriteria = {
    flightNumber: '',
    startDate: null as Date | null, // วันเริ่มต้น
    endDate: null as Date | null, // วันสิ้นสุด
    singleDateMode: false, // true = ใช้แค่วันเดียว
  };

  flightSheduleInfo: FlightIropResponse[] = [];

  type: string | null = null;

  typeOptions = [
    { label: 'OPS', value: 'OPS' },
    { label: 'ASM', value: 'ASM' },
    { label: 'SSM', value: 'SSM' },
  ];

  actionOptions = [
    { label: 'REVISED', value: 'REVISED' },
    { label: 'CANCELLED', value: 'CANCELLED' },
    { label: 'INFORM', value: 'INFORM' },
    { label: 'RESUME', value: 'RESUME' },
  ];

  editIndex: number | null = null;

  isLoading = false;

  informTypeOptions = [
    { label: 'Introduced', value: 'INTRODUCED' },
    { label: 'Maintenance', value: 'MAINTENANCE' },
    { label: 'Pilot Training', value: 'Pilot_training' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: FlightService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.type = params.get('type');
    });
    if (this.editId) {
      // this.loadOperationData(this.editId);
    } else {
      // this.fetchGenerateNumber();
      // this.formData.action = this.type?.toUpperCase() || '';
    }
  }

  removeFlight(index: number) {
    // this.flightList.splice(index, 1);
  }

  editFlight(index: number) {
    // const flightToEdit = this.flightList[index];
    // this.newFlight = {
    //   ...flightToEdit,
    //   departureDate: flightToEdit.departureDate
    //     ? new Date(flightToEdit.departureDate)
    //     : null,
    // };
    // this.editIndex = index;
    // this.showFlightDialog = true;
  }

  goBack() {
    this.router.navigate(['/admin/operation']);
  }

  onAdd() {
    // this.isLoading = true;
    // setTimeout(() => {
    //   const newOperation = {
    //     ...this.formData,
    //     status: 'CREATED',
    //     flights: this.flightList,
    //   };
    //   const existing = JSON.parse(localStorage.getItem('operations') || '[]');
    //   const index = existing.findIndex(
    //     (op: any) => op.generateNumber === this.formData.generateNumber
    //   );
    //   if (index !== -1) {
    //     //  อัปเดตข้อมูลเก่า
    //     existing[index] = newOperation;
    //   } else {
    //     //  ถ้าไม่เจอ ถือว่าเป็นข้อมูลใหม่
    //     existing.push(newOperation);
    //   }
    //   localStorage.setItem('operations', JSON.stringify(existing));
    //   this.isLoading = false;
    //   this.router.navigate(['/apps/operation']);
    // }, 1500);
  }
}
