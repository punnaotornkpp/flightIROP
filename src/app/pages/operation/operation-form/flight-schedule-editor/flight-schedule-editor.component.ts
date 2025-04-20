import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import {
  IScheduleDayDetail,
  IIropFlightSchedule,
  ISearchFlightScheduleRequest,
  ISearchFlightScheduleResponse,
  IropSection,
} from '../../../../types/flight.model';
import { FlightService } from '../../../../service/flight.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-flight-schedule-editor',
  standalone: true,
  templateUrl: './flight-schedule-editor.component.html',
  styleUrls: ['./flight-schedule-editor.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    CalendarModule,
    CheckboxModule,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    DropdownModule,
  ],
})
export class FlightScheduleEditorComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() mode: 'ADD' | 'EDIT' = 'ADD';
  @Input() sectionToEdit?: IropSection;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<IropSection>();

  title = '';
  actionType = '';
  flightSearch = {
    flightNumber: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    singleDate: false,
  };

  scheduleResult: ISearchFlightScheduleResponse[] = [];
  selectedMap = new Map<string, boolean>();
  editMap = new Map<string, Partial<IScheduleDayDetail>>();

  constructor(public service: FlightService) {}

  ngOnInit() {
    if (this.visible && this.mode === 'ADD') {
      this.resetForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        if (this.mode === 'ADD') {
          this.resetForm();
        } else if (this.mode === 'EDIT' && this.sectionToEdit) {
          this.loadSection(this.sectionToEdit);
        }
      }
    }
  }

  resetForm() {
    this.title = '';
    this.actionType = '';
    this.flightSearch = {
      flightNumber: '',
      startDate: null,
      endDate: null,
      singleDate: false,
    };
    this.scheduleResult = [];
    this.selectedMap.clear();
    this.editMap.clear();
  }

  loadSection(section: IropSection) {
    this.title = section.title;
    this.actionType = section.actionType;

    const first = section.schedule[0];
    this.flightSearch = {
      flightNumber: first.flightNumber,
      startDate: new Date(first.effectiveDate),
      endDate: new Date(first.expirationDate),
      singleDate: false,
    };

    this.scheduleResult = section.schedule.map((f) => ({
      flightNumber: f.flightNumber,
      origin: f.origin,
      destination: f.destination,
      effectiveDate: f.effectiveDate,
      expirationDate: f.expirationDate,
      schedule: f.schedule,
    }));

    this.selectedMap.clear();
    this.editMap.clear();

    for (const flight of section.schedule) {
      for (const s of flight.schedule) {
        const key = `${flight.flightNumber}_${flight.effectiveDate}_${s.frequency}`;
        this.selectedMap.set(key, true);
        this.editMap.set(key, {
          revisedDeparture: s.revisedDeparture ?? '',
          revisedArrival: s.revisedArrival ?? '',
          aircraft: s.aircraft ?? '',
          message: s.message ?? '',
          status: s.status,
        });
      }
    }
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  get isSearchDisabled(): boolean {
    return !this.actionType;
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  getDayLabel(day: number): string {
    const map = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return map[day - 1];
  }

  toggleSelectedDay(period: ISearchFlightScheduleResponse, day: number) {
    const key = `${period.flightNumber}_${period.effectiveDate}_${day}`;
    const current = this.selectedMap.get(key) ?? false;
    this.selectedMap.set(key, !current);
    if (!this.editMap.has(key)) this.getOrCreateEdit(period, day);
  }

  getOrCreateEdit(
    period: ISearchFlightScheduleResponse,
    day: number
  ): Partial<IScheduleDayDetail> {
    const key = `${period.flightNumber}_${period.effectiveDate}_${day}`;
    if (!this.editMap.has(key)) {
      const schedule = period.schedule.find(
        (s) => parseInt(s.frequency) === day
      );
      this.editMap.set(key, {
        revisedDeparture: schedule?.estimatedDeparture || '',
        revisedArrival: schedule?.estimatedArrival || '',
        aircraft: '',
        message: '',
        status: this.actionType !== 'CANCELLED',
      });
    }
    return this.editMap.get(key)!;
  }

  isDaySelected(period: ISearchFlightScheduleResponse, day: number): boolean {
    return (
      this.selectedMap.get(
        `${period.flightNumber}_${period.effectiveDate}_${day}`
      ) ?? false
    );
  }

  hasFlightOnDay(schedule: any[], day: number): boolean {
    return schedule.some((s) => parseInt(s.frequency) === day);
  }

  getFlightTime(schedule: any[], day: number, type: string): string {
    const found = schedule.find((s) => parseInt(s.frequency) === day);
    return found?.[type] ?? '-';
  }

  autoFormatTime(event: any) {
    const input = event.target;
    let val = input.value.replace(/[^0-9]/g, '');
    if (val.length >= 3) {
      val = val.substring(0, 2) + ':' + val.substring(2, 4);
    }
    input.value = val;
  }

  searchFlightSchedule() {
    const { flightNumber, startDate, endDate, singleDate } = this.flightSearch;
    if (!flightNumber || !startDate) return;

    const start = this.formatDate(startDate);
    const end = singleDate ? start : this.formatDate(endDate);

    const req: ISearchFlightScheduleRequest = {
      flightNumber,
      startDate: start,
      endDate: end,
      singleDate,
    };

    this.service
      .getFlightScheduleInfo(flightNumber, start, end)
      .subscribe((res) => {
        this.scheduleResult = res;
        this.selectedMap.clear();
        this.editMap.clear();
      });
  }

  onSave() {
    const flightSchedules: IIropFlightSchedule[] = [];

    for (const period of this.scheduleResult) {
      const selectedDays: IScheduleDayDetail[] = [];

      for (let day = 1; day <= 7; day++) {
        const key = `${period.flightNumber}_${period.effectiveDate}_${day}`;
        if (this.selectedMap.get(key)) {
          const raw = period.schedule.find(
            (s) => parseInt(s.frequency) === day
          );
          if (!raw) continue;

          const edit = this.editMap.get(key) || {};
          const detail: IScheduleDayDetail = {
            frequency: String(day),
            estimatedDeparture: raw.estimatedDeparture,
            estimatedArrival: raw.estimatedArrival,
            actualDeparture: raw.actualDeparture,
            actualArrival: raw.actualArrival,
            revisedDeparture: edit.revisedDeparture || null,
            revisedArrival: edit.revisedArrival || null,
            aircraft: edit.aircraft || '',
            message: edit.message || '',
            duration: raw.duration,
            timeAdjustor: raw.timeAdjustor,
            stops: raw.stops,
            status: this.actionType !== 'CANCELLED',
          };
          selectedDays.push(detail);
        }
      }

      if (selectedDays.length > 0) {
        flightSchedules.push({
          flightNumber: period.flightNumber,
          origin: period.origin,
          destination: period.destination,
          effectiveDate: period.effectiveDate,
          expirationDate: period.expirationDate,
          message: '',
          schedule: selectedDays,
        });
      }
    }

    const section: IropSection = {
      title: this.title,
      actionType: this.actionType as any,
      schedule: flightSchedules,
    };

    this.save.emit(section);
    this.hideDialog();
  }
}
