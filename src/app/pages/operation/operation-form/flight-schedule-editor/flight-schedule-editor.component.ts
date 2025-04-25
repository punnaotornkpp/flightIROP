import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
} from '@angular/core';
import {
  IFlightInfoRequest,
  IFlightInfoView,
  IFlightIropItem,
  IIropFlightSchedule,
  IScheduleDayDetailExtended,
  ISearchFlightScheduleRequest,
} from '../../../../types/flight.model';
import { FlightService } from '../../../../service/flight.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { SubscriptionDestroyer } from '../../../../core/helper/SubscriptionDestroyer.helper';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-flight-schedule-editor',
  standalone: true,
  templateUrl: './flight-schedule-editor.component.html',
  styleUrls: ['./flight-schedule-editor.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    CheckboxModule,
    InputTextModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    TabViewModule,
    DatePickerModule,
  ],
})
export class FlightScheduleEditorComponent
  extends SubscriptionDestroyer
  implements OnInit, OnChanges
{
  @Input() visible = false;
  @Input() mode: 'ADD' | 'EDIT' = 'ADD';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<IFlightIropItem[]>();
  @Output() visibleChange = new EventEmitter<boolean>();
  loading = false;
  loadingReview = false;

  flightSearch = {
    flightNumber: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    singleDate: false,
  };

  scheduleResult: IIropFlightSchedule[] = [];
  flightInfoList: IFlightInfoView[] = [];

  constructor(
    private service: FlightService,
    private messageService: MessageService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.visible && this.mode === 'ADD') this.resetForm();
  }

  ngOnChanges(): void {
    if (this.visible && this.mode === 'ADD') {
      this.resetForm();
    }
  }

  resetForm() {
    this.flightSearch = {
      flightNumber: '',
      startDate: null,
      endDate: null,
      singleDate: false,
    };
    this.scheduleResult = [];
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  }

  formatDateOnly(dateStr: string): string {
    return dateStr.split('T')[0];
  }

  getScheduleDate(
    startDateStr: string,
    endDateStr: string,
    frequency: string
  ): string {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const targetDay = parseInt(frequency); // 1 = Mon ... 7 = Sun

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay() === 0 ? 7 : d.getDay();
      if (day === targetDay) {
        return this.formatDateToYMD(d); // ใช้ manual format แทน toISOString
      }
    }
    console.warn('No matching day found for frequency:', frequency);
    return '';
  }

  formatDateToYMD(date: Date): string {
    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0')
    );
  }

  searchFlightSchedule() {
    const { flightNumber, startDate, endDate, singleDate } = this.flightSearch;
    if (!flightNumber || !startDate) return;

    const start = this.formatDate(startDate);
    const end = singleDate ? start : this.formatDate(endDate);

    const req: ISearchFlightScheduleRequest = {
      flightNumber,
      startSearchDate: start,
      endSearchDate: end,
    };
    const frequencyToDay: Record<string, string> = {
      '1': 'Mon',
      '2': 'Tue',
      '3': 'Wed',
      '4': 'Thu',
      '5': 'Fri',
      '6': 'Sat',
      '7': 'Sun',
    };
    this.loading = true;
    this.service.getFlightScheduleInfo(req).subscribe({
      next: (resp) => {
        const allDays = ['1', '2', '3', '4', '5', '6', '7'];
        const frequencyToDay: Record<string, string> = {
          '1': 'Mon',
          '2': 'Tue',
          '3': 'Wed',
          '4': 'Thu',
          '5': 'Fri',
          '6': 'Sat',
          '7': 'Sun',
        };

        this.scheduleResult = resp.map((flight) => {
          const scheduleMap = new Map(
            flight.schedule.map((s) => [
              s.frequency,
              {
                ...s,
                scheduleDate: this.getScheduleDate(
                  flight.effectiveDate,
                  flight.expirationDate,
                  s.frequency
                ),
                dayLabel: frequencyToDay[s.frequency] || '',
                status: true,
              } as IScheduleDayDetailExtended,
            ])
          );

          const filledSchedule: IScheduleDayDetailExtended[] = allDays.map(
            (freq) =>
              scheduleMap.get(freq) ??
              ({
                frequency: freq,
                scheduledDeparture: '',
                scheduledArrival: '',
                duration: '',
                timeAdjustor: 0,
                stops: 0,
                scheduleDate: '',
                dayLabel: frequencyToDay[freq] || '',
                status: false,
              } as IScheduleDayDetailExtended)
          );

          return {
            ...flight,
            schedule: filledSchedule,
          };
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Search flight successfully!',
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Failed to search flight schedule.',
        });
      },
    });
  }

  toggleDay(flight: IIropFlightSchedule, freq: string) {
    const item = flight.schedule.find((s) => s.frequency === freq);
    if (item) item.status = !item.status;
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  getDayNumber(dateTime: string): number {
    const date = new Date(dateTime);
    const day = date.getDay(); // 0 (Sun) → 6 (Sat)
    return day === 0 ? 7 : day; // แปลงให้เป็น 1-7 (Mon-Sun)
  }

  onSave() {
    const selected: IFlightInfoRequest[] = this.scheduleResult.flatMap((f) =>
      f.schedule
        .filter((s) => s.status)
        .map((s) => ({
          flightNumber: f.flightNumber,
          origin: f.origin,
          destination: f.destination,
          scheduledDeparture: s.scheduleDate,
        }))
    );
    if (selected.length === 0) return;
    this.loadingReview = true;
    const obs = this.service.getFlightInfoForSchedule(selected).subscribe({
      next: (info: IFlightInfoView[]) => {
        const transformed = info.map(
          (f): IFlightIropItem => ({
            reason: null,
            flightNumber: f.flightNumber,
            newFlightNumber: '',
            origin: f.origin,
            destination: f.destination,
            originalDepartureTime: f.scheduledDeparture,
            originalArrivalTime: f.scheduledArrival,
            revisedDepartureTime: null,
            revisedArrivalTime: null,
            originalOperatingAircraft: f.aircraftType,
            revisedOperatingAircraft: null,
            originalFlightStatus: f.flightStatus,
            revisedFlightStatus: null,
            daysOfOperation: this.getDayNumber(f.scheduledDeparture),
            remark: '',
          })
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Loaded flight info successfully!',
        });

        this.loadingReview = false;
        this.save.emit(transformed);
        this.hideDialog();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Failed to load flight info.',
        });
        this.loadingReview = false;
      },
    });
    this.AddSubscription(obs);
  }
}
