import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { FlightService } from '../../../service/flight.service';
import { AuthService } from '../../../service/auth.service';
import {
  ICreateIropRequest,
  ISeason,
  INoteOption,
  SourceType,
  IIropFlightSchedule,
} from '../../../types/flight.model';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

interface SourceTypeOption {
  label: string;
  value: SourceType;
}

@Component({
  selector: 'app-operation-form',
  standalone: true,
  templateUrl: './operation-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    CheckboxModule,
    CalendarModule,
    MultiSelectModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
})
export class OperationFormComponent implements OnInit {
  form!: FormGroup;
  editId: string | null = null;
  isLoading = false;
  userRole: string = '';

  seasonOptions: ISeason[] = [
    { label: 'Winter 2024', code: 'W24' },
    { label: 'Summer 2025', code: 'S25' },
  ];

  sourceTypeOptions: SourceTypeOption[] = [];

  noteOptions: INoteOption[] = [
    { code: 'TC', description: 'Time Change' },
    { code: 'EQ', description: 'Equipment Change' },
    { code: 'CX', description: 'Flight Cancellation' },
    { code: 'AC', description: 'Aircraft Change' },
    { code: 'OT', description: 'Others' },
  ];

  showFlightDialog = false;

  flightSearch = {
    flightNumber: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    singleDate: false,
  };

  scheduleResult: IIropFlightSchedule[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: FlightService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role ?? '';
    this.sourceTypeOptions = this.getSourceTypeOptionsByRole(this.userRole);

    this.editId = this.route.snapshot.paramMap.get('id');
    this.buildForm();

    if (!this.editId) {
      const type = this.route.snapshot.queryParamMap.get('type')?.toUpperCase();
      const createdBy = this.route.snapshot.queryParamMap
        .get('createdBy')
        ?.toUpperCase();

      if (type && createdBy) {
        this.form.patchValue({
          actionType: type,
          createdBy: createdBy,
        });
      } else {
        this.router.navigate(['/admin/operation']);
      }
    } else {
      // this.loadOperationData(this.editId);
    }
  }

  getSourceTypeOptionsByRole(role: string): SourceTypeOption[] {
    if (['OPERATION_OFFICER', 'OPERATION_MANAGER'].includes(role)) {
      return [
        { label: 'OPS', value: 'OPS' },
        { label: 'ASM', value: 'ASM' },
      ];
    }
    if (['PLANNING_OFFICER', 'PLANNING_MANAGER'].includes(role)) {
      return [
        { label: 'ASM', value: 'ASM' },
        { label: 'SSM', value: 'SSM' },
      ];
    }
    return [];
  }

  buildForm() {
    this.form = this.fb.group({
      actionType: ['', Validators.required],
      createdBy: ['', Validators.required],
      season: [null, Validators.required],
      sourceType: [null, Validators.required],
      messageCode: [''],
      message: ['', Validators.required],
      noteOptions: [[]],
      schedule: this.fb.group({
        flightNumber: [''],
        origin: [''],
        destination: [''],
        effectiveDate: [new Date()],
        expirationDate: [new Date()],
        message: [''],
        days: [[]],
      }),
    });
  }

  goBack() {
    this.router.navigate(['/admin/operation']);
  }

  onAdd() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ICreateIropRequest = this.form.getRawValue();
    payload.messageCode = this.generateMessageCode();

    this.isLoading = true;
    this.service.createOperation(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/operation']);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  generateMessageCode(): string {
    const source = this.form.value.sourceType;
    const createdBy = this.form.value.createdBy;
    const action = this.form.value.actionType.slice(0, 3);
    const seasonCode = this.form.value.season?.code || '';
    const running = '014';
    return `${source} ${createdBy} ${action} ${seasonCode}/${running}`;
  }

  syncSingleDate() {
    if (this.flightSearch.singleDate && this.flightSearch.startDate) {
      this.flightSearch.endDate = this.flightSearch.startDate;
    }
  }

  onDateChange() {
    if (this.flightSearch.singleDate) {
      this.flightSearch.endDate = this.flightSearch.startDate;
    }
  }

  fetchFlightSchedule() {
    const { flightNumber, startDate, endDate } = this.flightSearch;
    if (!flightNumber || !startDate || !endDate) return;

    const formattedStart = this.formatDate(startDate);
    const formattedEnd = this.formatDate(endDate);

    this.service
      .getFlightScheduleInfo(flightNumber, formattedStart, formattedEnd)
      .subscribe((resp) => {
        this.scheduleResult = resp;
      });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // yyyy-MM-dd
  }
}
