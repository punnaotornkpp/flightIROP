import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  ISeason,
  INoteOption,
  IFlightIropRequest,
  IFlightIropItem,
} from '../../../types/flight.model';
import { FlightScheduleEditorComponent } from './flight-schedule-editor/flight-schedule-editor.component';
import { AccordionModule, AccordionPanel } from 'primeng/accordion';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-operation-form',
  standalone: true,
  templateUrl: './operation-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FlightScheduleEditorComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    CheckboxModule,
    MultiSelectModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectModule,
    DatePickerModule,
    AccordionModule,
  ],
})
export class OperationFormComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  userRole: string = '';
  flightIropItems: IFlightIropItem[] = [];
  seasonOptions: ISeason[] = [
    { label: 'Summer 2025', code: 'S25' },
    { label: 'Winter 2025', code: 'W25' },
    { label: 'Summer 2026', code: 'S26' },
    { label: 'Winter 2026', code: 'W26' },
    { label: 'Summer 2027', code: 'S27' },
  ];
  sourceTypeOptions: { label: string; value: string }[] = [];
  noteOptions: INoteOption[] = [
    { code: 'TC', description: 'Time Change' },
    { code: 'EQ', description: 'Equipment Change' },
    { code: 'CX', description: 'Flight Cancellation' },
    { code: 'AC', description: 'Aircraft Change' },
    { code: 'OT', description: 'Others' },
  ];
  flightDialogVisible = false;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  iropActionType: 'REVISED' | 'CANCELLED' | 'INFORM' | 'RESUME' | null = null;

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
    const createdBy = ['PLANNING_OFFICER', 'PLANNING_MANAGER'].includes(
      this.userRole
    )
      ? 'PLN'
      : ['OPERATION_OFFICER', 'OPERATION_MANAGER'].includes(this.userRole)
      ? 'OPS'
      : null;
    this.sourceTypeOptions = this.getSourceTypeOptionsByRole(this.userRole);
    this.buildForm();
    if (createdBy) {
      this.form.patchValue({ createdBy });
    }
    this.route.queryParams.subscribe((params) => {
      const type = params['type']?.toUpperCase();
      if (['REVISED', 'CANCELLED', 'INFORM', 'RESUME'].includes(type)) {
        this.iropActionType = type;
      }
    });
  }

  buildForm() {
    this.form = this.fb.group({
      createdBy: ['', Validators.required],
      season: [null, Validators.required],
      sourceType: [null, Validators.required],
      messageCode: [''],
      message: [''],
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

  goBack() {
    this.router.navigate(['/admin/operation']);
  }

  openAddFlightDialog() {
    this.flightDialogVisible = true;
  }

  onFlightDialogClose() {
    this.flightDialogVisible = false;
  }

  onFlightDialogSave(newFlights: IFlightIropItem[]) {
    const withDefaults = newFlights.map((f) => ({
      ...f,
      revisedDepartureTime: new Date(f.originalDepartureTime),
      revisedArrivalTime: new Date(f.originalArrivalTime),
    }));
    this.flightIropItems = [...this.flightIropItems, ...withDefaults];
    this.flightDialogVisible = false;
  }

  removeFlight(index: number) {
    this.flightIropItems.splice(index, 1);
  }

  updateFlight(index: number, updated: Partial<IFlightIropItem>) {
    this.flightIropItems[index] = {
      ...this.flightIropItems[index],
      ...updated,
    };
  }

  preparePayload(): IFlightIropRequest {
    const formValue = this.form.value;
    return {
      flightIropItems: this.flightIropItems.map((f) => ({
        reason: f.reason ?? null,
        flightNumber: f.flightNumber,
        newFlightNumber: '',
        origin: f.origin,
        destination: f.destination,
        originalDepartureTime: f.originalDepartureTime,
        originalArrivalTime: f.originalArrivalTime,
        revisedDepartureTime: f.revisedDepartureTime ?? null,
        revisedArrivalTime: f.revisedArrivalTime ?? null,
        originalOperatingAircraft: f.originalOperatingAircraft,
        revisedOperatingAircraft: f.revisedOperatingAircraft ?? null,
        originalFlightStatus: f.originalFlightStatus,
        revisedFlightStatus: f.revisedFlightStatus ?? null,
        daysOfOperation: this.getDayNumber(f.originalDepartureTime),
        remark: f.remark ?? '',
      })),
      messageType: this.iropActionType ?? '',
      createdTeam: formValue.createdBy,
      season: formValue.season,
      actionCode: formValue.sourceType,
      customNotifyMessage: formValue.message,
      remark: formValue.message ?? '',
    };
  }

  getDayNumber(dateTime: string): number {
    const date = new Date(dateTime);
    return date.getDay() === 0 ? 7 : date.getDay(); // 1=Mon ... 7=Sun
  }

  onAdd() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const allComplete = this.flightIropItems.every((f) =>
      this.isFlightComplete(f)
    );
    if (!allComplete) {
      // show toast / dialog
      return;
    }

    const payload = this.preparePayload();
    console.log('✅ Ready to submit', payload);
    // this.service.createOperation(payload)...
  }

  getNoteDescription(code: string): string {
    const map: Record<string, string> = {
      TC: 'Time Change',
      EQ: 'Equipment Change',
      CX: 'Flight Cancellation',
      AC: 'Aircraft Change',
      OT: 'Others',
    };
    return map[code] ?? '';
  }

  getSeasonLabel(code: string): string {
    const map: Record<string, string> = {
      S25: 'Summer 2025',
      W24: 'Winter 2024',
      W25: 'Winter 2025',
      S26: 'Summer 2026',
      W26: 'Winter 2026',
      S27: 'Summer 2027',
    };
    return `${map[code] || code} (${code})`;
  }

  getFlightHeader(f: IFlightIropItem): string {
    const isComplete = this.isFlightComplete(f);
    const icon = isComplete
      ? '<span class="text-green-600">✅</span>'
      : '<span class="text-gray-400">⬜</span>';
    const date = new Date(f.originalDepartureTime);
    const day = date.toLocaleString('en-US', { weekday: 'short' });
    const month = date.toLocaleString('en-US', { month: 'long' });
    const dayNum = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `
    <div class="flex gap-2 items-center">
      ${icon}
      <span class="flex flex-wrap">
        <span class="text-slate-700 font-mono">Flight ${f.flightNumber} from ${f.origin} to ${f.destination} – Departure at &nbsp;</span>
        <span class="ml-1 font-mono text-yellow-600 font-semibold min-w-[260px] inline-block">
          ${day}, ${month} ${dayNum}, ${year}
        </span>
      </span>
    </div>
  `;
  }

  formatDateTime(value: string | Date): string {
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${date} ${hour}:${minute}`;
  }

  isFlightComplete(f: IFlightIropItem): boolean {
    return !!(
      f.revisedDepartureTime &&
      f.revisedArrivalTime &&
      f.revisedOperatingAircraft &&
      f.revisedFlightStatus
    );
  }
}
