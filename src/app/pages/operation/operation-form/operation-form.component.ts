// operation-form.component.ts
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
  IIropFlightSchedule,
  ISearchFlightScheduleResponse,
  IScheduleDayDetail,
  IropSection,
  IFlightIropRequest,
  CreatedByRole,
  IropTransaction,
} from '../../../types/flight.model';
import { FlightScheduleEditorComponent } from './flight-schedule-editor/flight-schedule-editor.component';

@Component({
  selector: 'app-operation-form',
  standalone: true,
  templateUrl: './operation-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    FlightScheduleEditorComponent,
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
  isLoading = false;
  userRole: string = '';
  scheduleResult: ISearchFlightScheduleResponse[] = [];
  addedFlights: IIropFlightSchedule[] = [];
  editMap: Map<string, Partial<IScheduleDayDetail>> = new Map();
  selectedMap: Map<string, boolean> = new Map();
  sectionEditIndex: number | null = null;

  flightSearch = {
    flightNumber: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    singleDate: false,
  };

  seasonOptions: ISeason[] = [
    { label: 'Winter 2024', code: 'W24' },
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
  flightEditMode: 'ADD' | 'EDIT' = 'ADD';
  flightToEdit?: IIropFlightSchedule;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  addedSections: IropSection[] = [];
  sectionToEdit?: IropSection;
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
  }

  hideDialog() {
    this.visible = false;
    this.visibleChange.emit(this.visible); // เพื่อให้ two-way binding อัปเดต
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

  // getActiveDays(days: IScheduleDayDetail[]): IScheduleDayDetail[] {
  //   return days.filter((d) => d.isActive);
  // }

  getDayLabel(day: number): string {
    const dayMap = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayMap[day - 1];
  }

  openAddFlightDialog() {
    this.flightEditMode = 'ADD';
    this.sectionToEdit = undefined;
    this.flightDialogVisible = true;
  }

  // editFlight(flight: IIropFlightSchedule) {
  //   this.flightEditMode = 'EDIT';
  //   this.flightToEdit = flight;
  //   this.flightDialogVisible = true;
  // }

  onFlightDialogClose() {
    this.flightDialogVisible = false;
  }

  onFlightDialogSave(updatedSection: IropSection) {
    if (this.flightEditMode === 'EDIT' && this.sectionEditIndex !== null) {
      this.addedSections[this.sectionEditIndex] = updatedSection;
    } else {
      this.addedSections.push(updatedSection);
    }
    this.sectionEditIndex = null; // reset
    this.flightDialogVisible = false;
  }

  onAdd() {
    console.log(this.form.value);
    if (this.form.invalid) {
      console.log('not pass');
      this.form.markAllAsTouched();
      return;
    }

    if (this.addedSections.length === 0) {
      console.log('not pass');
      alert('Please add at least one flight section.');
      return;
    }

    const formValue = this.form.value;

    const payload: IFlightIropRequest = {
      createdBy: formValue.createdBy,
      sourceType: formValue.sourceType,
      season: formValue.season,
      messageCode: formValue.messageCode || '',
      message: formValue.message,
      noteOptions: formValue.noteOptions || [],
      sections: this.addedSections, // IropSection[] (แต่ละ section มี actionType แล้ว)
    };

    console.log('📦 Final Payload', payload);

    // for mockup
    const fullTransaction: IropTransaction = {
      transactionNo: this.generateTransactionNo('OPS', 'S25', 1),
      status: 'CREATED',
      createdBy: payload.createdBy,
      sourceType: payload.sourceType,
      season: {
        code: payload.season,
        label: this.getSeasonLabel(payload.season),
      },
      createDate: new Date().toISOString(),
      modifyDate: new Date().toISOString(),
      messageCode: payload.messageCode || '',
      message: payload.message,
      noteOptions: payload.noteOptions.map((code) => ({
        code,
        description: this.getNoteDescription(code),
      })),
      sections: payload.sections,
    };
    console.log(fullTransaction);
    const existingRaw = sessionStorage.getItem('iropTransactions');
    const existingList: IropTransaction[] = existingRaw
      ? JSON.parse(existingRaw)
      : [];

    // 👉 เพิ่มรายการใหม่เข้าไปข้างหน้า
    existingList.unshift(fullTransaction);

    // 👉 เก็บกลับเข้า session storage
    sessionStorage.setItem('iropTransactions', JSON.stringify(existingList));
    // simulate API or success
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      alert('✅ IROP created successfully!');
      this.router.navigate(['/admin/operation']); // หรือ reset form ก็ได้
    }, 800);
  }

  editSection(section: IropSection, index: number) {
    this.flightEditMode = 'EDIT';
    this.sectionToEdit = structuredClone(section); // ลึกเพื่อป้องกัน mutation
    this.sectionEditIndex = index;
    this.flightDialogVisible = true;
  }

  /////// for mockup only

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

  generateTransactionNo(
    createdBy: CreatedByRole,
    seasonCode: string,
    id?: number
  ): string {
    const finalId = id ?? Math.floor(100 + Math.random() * 900);
    return `${createdBy}-${seasonCode}-${finalId}`;
  }
}
