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
import { SubscriptionDestroyer } from '../../../core/helper/SubscriptionDestroyer.helper';
import { EditorModule } from 'primeng/editor';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { PopoverModule } from 'primeng/popover';
import { SelectButtonModule } from 'primeng/selectbutton';
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
    EditorModule,
    ProgressSpinnerModule,
    PopoverModule,
    SelectButtonModule,
  ],
})
export class OperationFormComponent
  extends SubscriptionDestroyer
  implements OnInit
{
  form!: FormGroup;
  isLoading = false;
  userRole: string = '';
  flightIropItems: IFlightIropItem[] = [];
  seasonTypeOptions = [
    { label: 'Summer 2025', code: 'S25' },
    { label: 'Winter 2025', code: 'W25' },
    { label: 'Summer 2026', code: 'S26' },
    { label: 'Winter 2026', code: 'W26' },
    { label: 'Summer 2027', code: 'S27' },
  ];
  yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => ({
    label: year.toString(),
    value: year,
  }));
  selectedSeasonType: 'S' | 'W' | null = null;
  selectedSeasonYear: number | null = null;
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
  reasons: { label: string; value: string }[] = [];
  selectedReason: string | null = null;
  selectedFlightNumbers: string[] = [];
  flightNumberOptions: { label: string; value: string }[] = [];
  selectedIndexes: number[] = [];
  bulkRevisedDeparture: Date | null = null;
  bulkRevisedArrival: Date | null = null;

  constructor(
    public fb: FormBuilder,
    public route: ActivatedRoute,
    public router: Router,
    public service: FlightService,
    public authService: AuthService,
    public messageService: MessageService
  ) {
    super();
  }

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
    const typeId = this.getReasonTypeId(this.iropActionType);
    if (typeId === null) {
      console.error('Unknown action type, cannot fetch reasons.');
      return;
    }
    this.service.getReasons(typeId).subscribe({
      next: (res) => {
        this.reasons = res.map((r: any) => ({
          label: r.en,
          value: r.code,
        }));
      },
      error: (err) => {
        console.error('Failed to load reasons', err);
      },
    });
  }

  // updateSeasonCode() {
  //   if (this.selectedSeasonType && this.selectedSeasonYear) {
  //     const yearCode = this.selectedSeasonYear.toString().slice(-2); // 2025 -> "25"
  //     const seasonCode = this.selectedSeasonType + yearCode;
  //     this.form.get('season')?.setValue(seasonCode);
  //   } else {
  //     this.form.get('season')?.setValue(null);
  //   }
  // }

  buildForm() {
    this.form = this.fb.group({
      createdBy: ['', Validators.required],
      season: [null, Validators.required],
      sourceType: [null],
      messageCode: [''],
      remark: [''],
      customNotifyMessage: [null, Validators.required],
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
    const existingKeys = new Set(
      this.flightIropItems.map(
        (f) =>
          `${f.flightNumber}|${this.formatDateOnly(f.originalDepartureTime)}`
      )
    );

    const filteredNewFlights = newFlights.filter((f) => {
      const key = `${f.flightNumber}|${this.formatDateOnly(
        f.originalDepartureTime
      )}`;
      return !existingKeys.has(key);
    });

    if (filteredNewFlights.length < newFlights.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Duplicate Flights',
        detail: 'Some flights were already added and have been skipped.',
        life: 3000,
      });
    }

    const withDefaults = filteredNewFlights.map((f) => {
      let base = { ...f };
      if (this.iropActionType === 'REVISED') {
        base = {
          ...base,
          revisedDepartureTime: new Date(f.originalDepartureTime),
          revisedArrivalTime: new Date(f.originalArrivalTime),
          revisedOperatingAircraft: f.originalOperatingAircraft,
        };
      }
      if (this.iropActionType === 'CANCELLED') {
        base = {
          ...base,
          revisedFlightStatus: 'Cancelled',
        };
      }
      return base;
    });

    this.flightIropItems = [...this.flightIropItems, ...withDefaults];
    this.flightDialogVisible = false;
  }

  formatDateOnly(dateStr: string): string {
    return dateStr.split('T')[0];
  }

  getFlightSummary(f: IFlightIropItem): string {
    if (!this.iropActionType) return '';

    switch (this.iropActionType) {
      case 'REVISED':
        if (
          !f.revisedDepartureTime ||
          !f.revisedArrivalTime ||
          !f.revisedOperatingAircraft
        ) {
          return '';
        }
        return `New Time: ${this.formatTimeOnly(
          f.revisedDepartureTime
        )} - ${this.formatTimeOnly(f.revisedArrivalTime)}, Aircraft: ${
          f.revisedOperatingAircraft
        }, Reason: ${f.reason || '-'}`;

      case 'CANCELLED':
        if (!f.revisedFlightStatus) return '';
        return `Status: ${f.revisedFlightStatus}, Reason: ${f.reason || '-'}`;

      case 'INFORM':
      case 'RESUME':
        return `Reason: ${f.reason || '-'}, Remark: ${f.remark || '-'}`;

      default:
        return '';
    }
  }

  formatTimeOnly(date: string | Date): string {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  }

  getReasonTypeId(type: string | null): number | null {
    switch (type) {
      case 'REVISED':
        return 0;
      case 'CANCELLED':
        return 1;
      case 'INFORM':
        return 2;
      case 'RESUME':
        return 3;
      default:
        return null;
    }
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
      messageType: formValue.sourceType,
      createdTeam: formValue.createdBy,
      season: formValue.season,
      actionCode: this.iropActionType ?? '',
      customNotifyMessage: formValue.customNotifyMessage,
      remark: formValue.remark ?? '',
    };
  }

  getDayNumber(dateTime: string): number {
    const date = new Date(dateTime);
    return date.getDay() === 0 ? 7 : date.getDay(); // 1=Mon ... 7=Sun
  }

  onAdd() {
    console.log(this.form.value);
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    const allComplete = this.flightIropItems.every((f) =>
      this.isFlightComplete(f)
    );
    if (!allComplete) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete Flights',
        detail: 'Please complete all flight fields before submitting.',
      });
      return;
    }
    this.isLoading = true;
    const payload = this.preparePayload();
    const obs = this.service.createOperation(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Operation Created',
          detail: 'Flight operation created successfully!',
        });
        this.router.navigate(['/admin/operation']);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Create Failed',
          detail: 'Failed to create flight operation. Please try again.',
        });
      },
      complete: () => {
        this.isLoading = false; // ✅ จบโหลด
      },
    });
    this.AddSubscription(obs);
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
    if (!f.reason) return false;
    if (this.iropActionType === 'REVISED') {
      return !!(
        f.revisedDepartureTime &&
        f.revisedArrivalTime &&
        f.revisedOperatingAircraft
      );
    }
    if (this.iropActionType === 'CANCELLED') {
      return !!f.revisedFlightStatus;
    }
    if (this.iropActionType === 'INFORM' || this.iropActionType === 'RESUME') {
      return !!f.reason;
    }
    return true;
  }

  onSelectFlight(index: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedIndexes.includes(index)) {
        this.selectedIndexes.push(index);
      }
    } else {
      this.selectedIndexes = this.selectedIndexes.filter((i) => i !== index);
    }
  }

  handleOpenFlightPanel(event: Event, panel: any) {
    this.flightNumberOptions = this.flightIropItems.map((f) => {
      const date = new Date(f.originalDepartureTime);
      const day = date.toLocaleString('en-US', { weekday: 'short' }); // Thu
      const month = date.toLocaleString('en-US', { month: 'short' }); // May
      const dayNum = String(date.getDate()).padStart(2, '0'); // 01
      const year = date.getFullYear();

      return {
        label: `Flight ${f.flightNumber} on ${day}, ${month} , ${year} ${dayNum}`,
        value: f.flightNumber + '|' + f.originalDepartureTime,
      };
    });
    panel.toggle(event);
  }

  confirmApplyReason(panel: any) {
    if (!this.selectedReason || this.selectedFlightNumbers.length === 0) {
      return;
    }
    this.flightIropItems = this.flightIropItems.map((f) => {
      const key = f.flightNumber + '|' + f.originalDepartureTime;
      if (this.selectedFlightNumbers.includes(key)) {
        return { ...f, reason: this.selectedReason };
      }
      return f;
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Applied Successfully',
      detail: 'Selected reason has been applied to selected flights.',
      life: 3000,
    });

    panel.hide();
  }

  handleOpenTimePanel(event: Event, popover: any) {
    this.flightNumberOptions = this.flightIropItems.map((f) => {
      const date = new Date(f.originalDepartureTime);
      const day = date.toLocaleString('en-US', { weekday: 'short' });
      const month = date.toLocaleString('en-US', { month: 'short' });
      const dayNum = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return {
        label: `Flight ${f.flightNumber} on ${day}, ${month} ${dayNum}, ${year}`,
        value: f.flightNumber + '|' + f.originalDepartureTime,
      };
    });
    this.bulkRevisedDeparture = null;
    this.bulkRevisedArrival = null;
    this.selectedFlightNumbers = [];
    popover.toggle(event);
  }

  confirmBulkTimeUpdate(popover: any) {
    if (
      !this.bulkRevisedDeparture ||
      !this.bulkRevisedArrival ||
      this.selectedFlightNumbers.length === 0
    ) {
      return;
    }

    this.flightIropItems = this.flightIropItems.map((f) => {
      const key = f.flightNumber + '|' + f.originalDepartureTime;
      if (this.selectedFlightNumbers.includes(key)) {
        const originalDep = new Date(f.originalDepartureTime);
        const originalArr = new Date(f.originalArrivalTime);

        const newDep = new Date(originalDep);
        const newArr = new Date(originalArr);

        // เซ็ตเฉพาะเวลา
        newDep.setHours(
          this.bulkRevisedDeparture!.getHours(),
          this.bulkRevisedDeparture!.getMinutes(),
          0,
          0
        );

        newArr.setHours(
          this.bulkRevisedArrival!.getHours(),
          this.bulkRevisedArrival!.getMinutes(),
          0,
          0
        );

        return {
          ...f,
          revisedDepartureTime: newDep,
          revisedArrivalTime: newArr,
        };
      }
      return f;
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Updated Times',
      detail: 'Revised times updated successfully without changing the dates.',
      life: 3000,
    });

    popover.hide();
  }
}
