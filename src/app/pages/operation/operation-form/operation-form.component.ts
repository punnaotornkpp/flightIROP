import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../../../service/flight.service';
import { AuthService } from '../../../service/auth.service';
import {
  INoteOption,
  IFlightIropRequest,
  IFlightIropItem,
  IFlightScheduleGroup,
} from '../../../types/flight.model';
import { MessageService } from 'primeng/api';
import { SubscriptionDestroyer } from '../../../shared/core/helper/SubscriptionDestroyer.helper';
@Component({
  selector: 'app-operation-form',
  standalone: false,
  templateUrl: './operation-form.component.html',
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
  selectedSourceType: 'OPS' | 'ASM' | 'SSM' | null = null;
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
    this.form.get('sourceType')?.valueChanges.subscribe((newSourceType) => {
      this.selectedSourceType = newSourceType as 'SSM' | 'ASM' | 'OPS';
      this.flightIropItems = [];
    });
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

  buildForm() {
    this.form = this.fb.group({
      createdBy: ['', Validators.required],
      season: [null, Validators.required],
      sourceType: [null, Validators.required],
      messageCode: [''],
      remark: [''],
      reason: [null, Validators.required],
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
    const selectedSourceType = this.form.get('sourceType')?.value;

    if (!selectedSourceType) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Please select Source Type first',
        detail: 'Please select a source type before adding a flight.',
      });
      return;
    }

    this.selectedSourceType = selectedSourceType;
    this.flightDialogVisible = true;
  }

  onFlightDialogClose() {
    this.flightDialogVisible = false;
  }

  onFlightDialogSave(newGroup: IFlightScheduleGroup) {
    const existingKeys = new Set(
      this.flightIropItems.map(
        (f) =>
          `${f.flightNumber}|${this.formatDateOnly(f.originalDepartureTime)}`
      )
    );
    const newItems: IFlightIropItem[] = newGroup.flightScheduleDetails
      .map((d) => {
        const key = `${newGroup.flightNumber}|${this.formatDateOnly(
          d.scheduledDeparture
        )}`;
        if (existingKeys.has(key)) return null;
        let base: IFlightIropItem = {
          reason: null,
          flightNumber: newGroup.flightNumber,
          newFlightNumber: '',
          origin: d.origin,
          destination: d.destination,
          originalDepartureTime: d.scheduledDeparture,
          originalArrivalTime: d.scheduledArrival,
          revisedDepartureTime: null,
          revisedArrivalTime: null,
          originalOperatingAircraft: newGroup.aircraftType,
          revisedOperatingAircraft: null,
          originalFlightStatus: d.flightStatus,
          revisedFlightStatus: null,
          day: d.day,
          frequency: d.frequency,
          remark: '',
        };
        if (this.iropActionType === 'CANCELLED') {
          base.revisedFlightStatus = 'Cancelled';
        }
        return base;
      })
      .filter((item): item is IFlightIropItem => item !== null); // Remove nulls
    if (newItems.length < newGroup.flightScheduleDetails.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Duplicate Flights',
        detail: 'Some flights were already added and have been skipped.',
        life: 3000,
      });
    }
    this.flightIropItems = [...this.flightIropItems, ...newItems];
    this.flightDialogVisible = false;
  }

  formatDateOnly(dateStr: string): string {
    return dateStr.split('T')[0];
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
        revisedDepartureTime: null,
        revisedArrivalTime: null,
        originalOperatingAircraft: f.originalOperatingAircraft,
        revisedOperatingAircraft: f.revisedOperatingAircraft ?? null,
        originalFlightStatus: f.originalFlightStatus,
        revisedFlightStatus: f.revisedFlightStatus ?? null,
        day: f.day,
        frequency: f.frequency,
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

  onAdd() {
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

  formatDateTime(value: string): string {
    try {
      const clean = value.split('T');
      const datetime = clean.length > 2 ? clean[0] + 'T' + clean[1] : value;

      const d = new Date(datetime);
      if (isNaN(d.getTime())) return 'Invalid Date';
      return d.toLocaleString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
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

  isFlightComplete(f: IFlightIropItem): boolean {
    switch (this.iropActionType) {
      case 'REVISED':
        return Boolean(f.revisedDepartureTime && f.revisedArrivalTime);
      case 'CANCELLED':
        return Boolean(f.revisedFlightStatus);
      case 'INFORM':
        return Boolean(f.reason);
      case 'RESUME':
        return Boolean(f.reason);
      default:
        return false;
    }
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
