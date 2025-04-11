// OperationFormComponent.ts - Enhanced for step-by-step flight irregularity handling
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
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
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FlightService } from '../../../service/flight.service';
import { AuthService } from '../../../service/auth.service';
import {
  ICreateIropRequest,
  ISeason,
  INoteOption,
  SourceType,
  IIropFlightSchedule,
} from '../../../types/flight.model';

@Component({
  selector: 'app-operation-form',
  standalone: true,
  templateUrl: './operation-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    CheckboxModule,
    MultiSelectModule,
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

  sourceTypeOptions: { label: string; value: string }[] = [];

  noteOptions: INoteOption[] = [
    { code: 'TC', description: 'Time Change' },
    { code: 'EQ', description: 'Equipment Change' },
    { code: 'CX', description: 'Flight Cancellation' },
    { code: 'AC', description: 'Aircraft Change' },
    { code: 'OT', description: 'Others' },
  ];

  flightSearch = {
    flightNumber: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    singleDate: false,
  };

  scheduleResult: any[] = [];
  dayMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
    }
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
    });
  }

  getSourceTypeOptionsByRole(role: string) {
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

  getDayLabel(freq: number): string {
    return this.dayMap[freq - 1] || `Day ${freq}`;
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
        this.scheduleResult = resp.map((r: any) => ({
          ...r,
          selectedDays: {
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
            7: true,
          },
          configuring: false,
          schedule: r.schedule.map((s: any) => ({
            ...s,
            originAircraft: s.aircraft || '',
            newAircraft: '',
            revisedDeparture: '',
            revisedArrival: '',
          })),
        }));
      });
  }

  configurePeriod(index: number) {
    this.scheduleResult[index].configuring =
      !this.scheduleResult[index].configuring;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  goBack() {
    this.router.navigate(['/admin/operation']);
  }

  generateMessageCode(): string {
    const source = this.form.value.sourceType;
    const createdBy = this.form.value.createdBy;
    const action = this.form.value.actionType.slice(0, 3);
    const seasonCode = this.form.value.season?.code || '';
    const running = '014';
    return `${source} ${createdBy} ${action} ${seasonCode}/${running}`;
  }

  onAdd() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ICreateIropRequest = {
      ...this.form.getRawValue(),
      messageCode: this.generateMessageCode(),
      schedule: this.scheduleResult.flatMap((p) =>
        p.schedule
          .filter((s: any) => p.selectedDays[+s.frequency])
          .map((s: any) => ({
            flightNumber: p.flightNumber,
            origin: p.origin,
            destination: p.destination,
            date: this.deriveDateFromFrequency(p.effectiveDate, +s.frequency),
            estimatedDeparture: s.estimatedDeparture,
            estimatedArrival: s.estimatedArrival,
            revisedDeparture: s.revisedDeparture,
            revisedArrival: s.revisedArrival,
            aircraft: s.newAircraft || s.originAircraft,
            originAircraft: s.originAircraft,
          }))
      ),
    };

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

  deriveDateFromFrequency(startDate: string, frequency: number): string {
    const base = new Date(startDate);
    const dayOffset = (frequency - base.getDay() + 7) % 7;
    const result = new Date(base);
    result.setDate(base.getDate() + dayOffset);
    return this.formatDate(result);
  }

  isDaySelected(period: any, frequency: number): boolean {
    return !!period.selectedDays[Number(frequency)];
  }

  getSelectedSchedule(period: any): any[] {
    return period.schedule.filter((s: { frequency: number }) =>
      this.isDaySelected(period, s.frequency)
    );
  }
}
