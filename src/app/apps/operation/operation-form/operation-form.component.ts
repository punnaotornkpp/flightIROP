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
import { format } from 'date-fns';

@Component({
  selector: 'app-operation-form',
  standalone: true,
  templateUrl: './operation-form.component.html',
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    DialogModule,
  ],
})
export class OperationFormComponent implements OnInit {
  @Input() editId: string | null = null;

  type: string | null = null;

  formData = {
    type: '',
    generateNumber: '',
    action: '',
    message: '',
    createDate: null as Date | null,
    informType: '',
  };

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

  flightList: {
    flightNumber: string;
    origin: string;
    destination: string;
    aircraft: string;
    departureDate: Date | string;
    originDepartureTime: Date | null;
    originArrivalTime: Date | null;
    revisedDepartureTime: Date | null;
    revisedArrivalTime: Date | null;
    originAircraft: string;
    revisedAircraft: string;
    message: string;
    status: string;
  }[] = [];

  aircraftList = [
    'HS-DBG',
    'HS-DBK',
    'HS-DBO',
    'HS-DBP',
    'HS-DBQ',
    'HS-DBR',
    'HS-DBS',
    'HS-DBT',
    'HS-DBU',
    'HS-DBV',
    'HS-DBW',
    'HS-DBX',
    'HS-DBY',
    'HS-DBZ',
  ];

  showFlightDialog = false;

  newFlight = {
    flightNumber: '',
    departureDate: null as Date | null,
    origin: '',
    destination: '',
    originDepartureTime: null as Date | null,
    originArrivalTime: null as Date | null,
    revisedDepartureTime: null as Date | null,
    revisedArrivalTime: null as Date | null,
    originAircraft: '',
    revisedAircraft: '',
    message: '',
    status: '', // EARLY / DELAY
  };

  editIndex: number | null = null;
  isLoading = false;

  informTypeOptions = [
    { label: 'Introduced', value: 'INTRODUCED' },
    { label: 'Maintenance', value: 'MAINTENANCE' },
    { label: 'Pilot Training', value: 'Pilot_training' },
  ];

  showDuplicateDialog = false;
  duplicateDate: Date | null = null;
  flightToDuplicate: any = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.type = params.get('type');
    });
    if (this.editId) {
      this.loadOperationData(this.editId);
    } else {
      this.fetchGenerateNumber();
      this.formData.action = this.type?.toUpperCase() || '';
    }
  }

  fetchGenerateNumber() {
    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      this.formData.generateNumber = `OPS-${randomNum}`;
    }, 300);
  }

  addFlight() {
    const { originDepartureTime, revisedDepartureTime } = this.newFlight;

    if (originDepartureTime && revisedDepartureTime) {
      this.newFlight.status =
        revisedDepartureTime < originDepartureTime ? 'EARLY' : 'DELAY';
    }

    const newFlightData = {
      flightNumber: this.newFlight.flightNumber,
      departureDate: this.newFlight.departureDate?.toISOString() || '',
      origin: this.newFlight.origin,
      destination: this.newFlight.destination,
      aircraft: this.newFlight.originAircraft,
      originDepartureTime: this.newFlight.originDepartureTime,
      originArrivalTime: this.newFlight.originArrivalTime,
      revisedDepartureTime: this.newFlight.revisedDepartureTime,
      revisedArrivalTime: this.newFlight.revisedArrivalTime,
      originAircraft: this.newFlight.originAircraft,
      revisedAircraft: this.newFlight.revisedAircraft,
      message: this.newFlight.message,
      status: this.newFlight.status,
    };

    if (this.editIndex !== null) {
      this.flightList[this.editIndex] = {
        ...newFlightData,
        // ไม่ต้อง format ที่นี่ เพราะ flightList ต้องการ Date
        departureDate: newFlightData.departureDate
          ? format(newFlightData.departureDate, 'yyyy-MM-dd HH:mm:ss')
          : '',
      };
      this.editIndex = null;
    } else {
      this.flightList.push({
        ...newFlightData,
        departureDate: newFlightData.departureDate
          ? format(newFlightData.departureDate, 'yyyy-MM-dd HH:mm:ss')
          : '',
      });
    }

    this.newFlight = {
      flightNumber: '',
      departureDate: null,
      origin: '',
      destination: '',
      originDepartureTime: null,
      originArrivalTime: null,
      revisedDepartureTime: null,
      revisedArrivalTime: null,
      originAircraft: '',
      revisedAircraft: '',
      message: '',
      status: '',
    };

    this.showFlightDialog = false;
  }

  removeFlight(index: number) {
    this.flightList.splice(index, 1);
  }

  duplicateFlight(index: number) {
    this.flightToDuplicate = this.flightList[index];
    this.duplicateDate = null;
    this.showDuplicateDialog = true;
  }

  confirmDuplicate() {
    if (!this.flightToDuplicate || !this.duplicateDate) return;

    const duplicated = {
      ...this.flightToDuplicate,
      departureDate: format(this.duplicateDate, 'yyyy-MM-dd HH:mm:ss'),
    };

    this.flightList.push(duplicated);
    this.showDuplicateDialog = false;
  }

  editFlight(index: number) {
    const flightToEdit = this.flightList[index];

    this.newFlight = {
      ...flightToEdit,
      departureDate: flightToEdit.departureDate
        ? new Date(flightToEdit.departureDate)
        : null,
    };

    this.editIndex = index;
    this.showFlightDialog = true;
  }

  goBack() {
    this.router.navigate(['/apps/operation']);
  }

  onAdd() {
    this.isLoading = true;

    setTimeout(() => {
      const newOperation = {
        ...this.formData,
        status: 'CREATED',
        flights: this.flightList,
      };

      const existing = JSON.parse(localStorage.getItem('operations') || '[]');

      const index = existing.findIndex(
        (op: any) => op.generateNumber === this.formData.generateNumber
      );

      if (index !== -1) {
        // 👈 อัปเดตข้อมูลเก่า
        existing[index] = newOperation;
      } else {
        // 👈 ถ้าไม่เจอ ถือว่าเป็นข้อมูลใหม่
        existing.push(newOperation);
      }

      localStorage.setItem('operations', JSON.stringify(existing));

      this.isLoading = false;
      this.router.navigate(['/apps/operation']);
    }, 1500);
  }

  loadOperationData(id: string) {
    const operations = JSON.parse(localStorage.getItem('operations') || '[]');

    const op = operations.find((o: any) => o.generateNumber === id);

    if (op) {
      this.formData = {
        type: op.type,
        generateNumber: op.generateNumber,
        action: op.action,
        message: op.message,
        createDate: new Date(op.createDate),
        informType: op.informType || '',
      };

      this.flightList = op.flights || [];
    }
  }

  loadFlightInfo() {
    const { flightNumber, departureDate } = this.newFlight;

    if (!flightNumber || !departureDate) return;

    const baseDate = new Date(departureDate);
    const originDepartureTime = new Date(baseDate);
    originDepartureTime.setHours(10, 0, 0); // 10:00

    const originArrivalTime = new Date(baseDate);
    originArrivalTime.setHours(12, 0, 0); // 12:00

    this.newFlight.origin = 'DMK';
    this.newFlight.destination = 'CNX';
    this.newFlight.originAircraft = 'HS-DBZ';
    this.newFlight.originDepartureTime = originDepartureTime;
    this.newFlight.originArrivalTime = originArrivalTime;
  }
}
