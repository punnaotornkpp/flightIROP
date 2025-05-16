import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  IFlightScheduleDetail,
  IFlightScheduleGroup,
  IIropFlightSchedule,
  ISearchFlightScheduleRequest,
} from '../../../../types/flight.model';
import { FlightService } from '../../../../service/flight.service';
import { MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { SubscriptionDestroyer } from '../../../../shared/core/helper/SubscriptionDestroyer.helper';
@Component({
  selector: 'app-flight-schedule-editor',
  standalone: false,
  templateUrl: './flight-schedule-editor.component.html',
  styleUrls: ['./flight-schedule-editor.component.scss'],
})
export class FlightScheduleEditorComponent
  extends SubscriptionDestroyer
  implements OnInit, OnChanges
{
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<IFlightScheduleGroup>();
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() selectedSourceType: 'OPS' | 'ASM' | 'SSM' | null = null;
  loading = false;

  flightSearch = {
    flightNumber: '',
    rangeDate: null as Date | Date[] | null,
    singleDate: false,
  };

  scheduleResultGroup!: IFlightScheduleGroup;
  // scheduleResultDetails: IFlightScheduleDetail[] = [];
  selectedDetailKeys = new Set<string>(); // หรือ Array<string> ก็ได้
  dopDays = [
    { label: 'Mon', value: '1' },
    { label: 'Tue', value: '2' },
    { label: 'Wed', value: '3' },
    { label: 'Thu', value: '4' },
    { label: 'Fri', value: '5' },
    { label: 'Sat', value: '6' },
    { label: 'Sun', value: '7' },
  ];
  selectedDops: string[] = ['1', '2', '3', '4', '5', '6', '7'];
  currentMenuItems: MenuItem[] = [];
  hasSearched = false;

  constructor(
    private service: FlightService,
    private messageService: MessageService
  ) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.resetForm();
  }

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm() {
    this.flightSearch = {
      flightNumber: '',
      rangeDate: null as Date | Date[] | null,
      singleDate: false,
    };
    this.scheduleResultGroup = {} as IFlightScheduleGroup;
    // this.scheduleResultDetails = [];
    this.selectedDetailKeys.clear();
    this.selectedDops = ['1', '2', '3', '4', '5', '6', '7'];
    this.currentMenuItems = [];
    this.loading = false;
    this.hasSearched = false;
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

  getDetailKey(d: IFlightScheduleDetail) {
    return `${d.origin}|${d.destination}|${d.scheduledDeparture}`;
  }

  isSelected(d: IFlightScheduleDetail): boolean {
    return this.selectedDetailKeys.has(this.getDetailKey(d));
  }

  toggle(d: IFlightScheduleDetail) {
    const key = this.getDetailKey(d);
    this.selectedDetailKeys.has(key)
      ? this.selectedDetailKeys.delete(key)
      : this.selectedDetailKeys.add(key);
  }

  searchFlightSchedule() {
    this.hasSearched = true;
    const range = this.flightSearch.rangeDate;
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (this.selectedSourceType === 'SSM') {
      if (!Array.isArray(range) || range.length < 2) return; // ตรวจให้ชัวร์
      [startDate, endDate] = range;
    } else {
      if (!range || range instanceof Array) return; // ห้ามเป็น array
      startDate = endDate = range;
    }
    if (!this.flightSearch.flightNumber || !startDate || !endDate) return;
    const req: ISearchFlightScheduleRequest = {
      flightNumber: this.flightSearch.flightNumber,
      startSearchDate: this.formatDate(startDate),
      endSearchDate: this.formatDate(endDate),
      flightStatus: '',
      dop: this.selectedDops.join(','),
    };
    this.loading = true;
    this.service.getFlightScheduleInfo(req).subscribe({
      next: (resp) => {
        if (resp.data.flightScheduleDetails.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No flight schedule found.',
          });
          this.loading = false;
          return;
        } else {
          if (resp.data) this.scheduleResultGroup = resp.data;
          this.scheduleResultGroup.flightScheduleDetails =
            resp.data.flightScheduleDetails.map((s) => ({
              ...s,
              flightNumber: resp.data.flightNumber,
              origin: s.origin,
              destination: s.destination,
              scheduledDeparture: s.scheduledDeparture,
              scheduledArrival: s.scheduledArrival,
              duration: s.duration,
              frequency: s.frequency,
              day: s.day,
              flightStatus: s.flightStatus,
            }));
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Search flight successfully!',
          });
          this.loading = false;
        }
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

  toggleDop(dop: string) {
    const index = this.selectedDops.indexOf(dop);
    if (index >= 0) {
      this.selectedDops.splice(index, 1);
    } else {
      this.selectedDops.push(dop);
    }
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

  openMenu(event: Event, menu: Menu, row: IFlightScheduleDetail) {
    this.currentMenuItems = this.getMenuItems(row);
    menu.toggle(event);
  }

  getMenuItems(row: IFlightScheduleDetail) {
    return [
      {
        label: 'Remove',
        icon: 'pi pi-trash',
        command: () => this.removeScheduleDetail(row),
      },
    ];
  }

  removeScheduleDetail(row: IFlightScheduleDetail) {
    const key = this.getDetailKey(row);
    this.scheduleResultGroup.flightScheduleDetails =
      this.scheduleResultGroup.flightScheduleDetails.filter(
        (d) => this.getDetailKey(d) !== key
      );
    this.selectedDetailKeys.delete(key);
  }

  onSave() {
    this.save.emit(this.scheduleResultGroup);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Loaded flight info successfully!',
    });
    this.hideDialog();
    // const selected: IFlightScheduleDetail[] = this.scheduleResultDetails;
    // if (selected.length === 0) return;
    // const obs = this.service.getFlightInfoForSchedule(selected).subscribe({
    //   next: (info: IFlightInfoView[]) => {
    //     const transformed: IFlightIropItem[] = info.map((f) => ({
    //       reason: null,
    //       flightNumber: f.flightNumber,
    //       newFlightNumber: '',
    //       origin: f.origin,
    //       destination: f.destination,
    //       originalDepartureTime: f.scheduledDeparture,
    //       originalArrivalTime: f.scheduledArrival,
    //       revisedDepartureTime: null,
    //       revisedArrivalTime: null,
    //       originalOperatingAircraft: f.aircraftType,
    //       revisedOperatingAircraft: null,
    //       originalFlightStatus: f.flightStatus,
    //       revisedFlightStatus: null,
    //       day: f.day,
    //       frequency: f.frequency,
    //       remark: '',
    //     }));

    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       detail: 'Loaded flight info successfully!',
    //     });
    //     this.save.emit(transformed);
    //     this.hideDialog();
    //   },
    //   error: () => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Failed',
    //       detail: 'Failed to load flight info.',
    //     });
    //   },
    // });

    // this.AddSubscription(obs);
  }
}
