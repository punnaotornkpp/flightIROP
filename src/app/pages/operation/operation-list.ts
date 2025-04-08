import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { EditorModule } from 'primeng/editor';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SplitButtonModule } from 'primeng/splitbutton';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../service/auth.service';

export interface Flight {
  flightNumber: string;
  departureDate: string; // หรือ Date ก็ได้ถ้าคุณ parse เป็น Date ก่อนใช้งาน
  origin: string;
  destination: string;
  aircraft: string;
  originDepartureTime: string;
  originArrivalTime: string;
  revisedDepartureTime: string;
  revisedArrivalTime: string;
  originAircraft: string;
  revisedAircraft: string;
  message: string;
}

export type OperationStatus = 'CREATED' | 'APPROVED' | 'ASSIGNED' | 'DONE';

export interface Operation {
  header: string;
  uniqueName: string;
  generateNumber: string;
  operationType: 'REVISED' | 'CANCELLED' | 'INFORM' | 'RESUME';
  actionType: string;
  message: string;
  createDate: string; // หรือ Date
  status: OperationStatus;
  flights: Flight[];
}

@Component({
  selector: 'operation-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataViewModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TagModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    EditorModule,
    IconFieldModule,
    InputIconModule,
    SplitButtonModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <p-dialog
      header="Send Email"
      [(visible)]="showMailDialog"
      [modal]="true"
      [style]="{ width: '600px' }"
    >
      <div
        class="bg-surface-0 dark:bg-surface-950 grid gap-4 mt-2 grid-nogutter"
      >
        <div class="col-span-12">
          <label
            for="to"
            class="text-surface-900 dark:text-surface-0 font-semibold"
            >To</label
          >
          <p-iconfield style="height: 3.5rem" class="mt-2">
            <p-inputicon class="pi pi-user" style="left: 1.5rem" />
            <input
              id="to"
              type="text"
              pInputText
              [(ngModel)]="newMail.to"
              class="!pl-16 text-surface-900 dark:text-surface-0 font-semibold"
              style="height: 3.5rem"
              fluid
            />
          </p-iconfield>
        </div>
        <div class="col-span-12">
          <label
            for="Subject"
            class="text-surface-900 dark:text-surface-0 font-semibold"
            >Subject</label
          >
          <p-iconfield style="height: 3.5rem" class="mt-2">
            <p-inputicon class="pi pi-pencil" style="left: 1.5rem" />
            <input
              id="subject"
              type="text"
              pInputText
              [(ngModel)]="newMail.title"
              class="!pl-16 text-surface-900 dark:text-surface-0 font-semibold"
              fluid
              style="height: 3.5rem"
            />
          </p-iconfield>
        </div>
        <div class="col-span-12">
          <p-editor
            [style]="{ height: '250px' }"
            [(ngModel)]="newMail.message"
          ></p-editor>
        </div>
        <div class="col-span-12 flex gap-x-4 justify-end mt-6">
          <button
            pButton
            pRipple
            type="button"
            class="h-12 w-full sm:w-auto"
            icon="pi pi-send"
            label="Send Message"
            (click)="sendMail()"
          ></button>
        </div>
      </div>
    </p-dialog>
    <p-dialog
      header="{{ selectedOperation?.uniqueName }}"
      [(visible)]="showViewDialog"
      [modal]="true"
      [style]="{ width: '80vw' }"
      [contentStyle]="{ padding: '1.5rem' }"
    >
      <div *ngIf="selectedOperation?.flights?.length > 0; else noFlights">
        <p-table
          [value]="selectedOperation.flights"
          class="p-datatable-sm"
          [scrollable]="true"
        >
          <ng-template pTemplate="header">
            <tr class="!bg-gray-100 text-gray-700 font-bold">
              <th></th>
              <th>Flight Number</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>AirCraft Type</th>
              <th>Dep.</th>
              <th>Arr.</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-flight>
            <!-- ORIGINAL ROW -->
            <tr>
              <td class="!font-bold !text-gray-700">(ORIGINAL)</td>
              <td>{{ flight.flightNumber }}</td>
              <td>{{ flight.origin }}</td>
              <td>{{ flight.destination }}</td>
              <td>{{ getAircraftText(flight.originAircraft) }}</td>
              <td>{{ formatTime(flight.originDepartureTime) }}</td>
              <td>{{ formatTime(flight.originArrivalTime) }}</td>
            </tr>

            <!-- DELAYED ROW -->
            <tr class="!text-red-600 !font-semibold">
              <td>(DELAYED)</td>
              <td>{{ flight.flightNumber }}</td>
              <td>{{ flight.origin }}</td>
              <td>{{ flight.destination }}</td>
              <td>
                {{
                  getAircraftText(
                    flight.revisedAircraft || flight.originAircraft
                  )
                }}
              </td>
              <td>
                {{
                  formatTime(
                    flight.revisedDepartureTime || flight.originDepartureTime
                  )
                }}
              </td>
              <td>
                {{
                  formatTime(
                    flight.revisedArrivalTime || flight.originArrivalTime
                  )
                }}
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      <ng-template #noFlights>
        <div class="text-center text-gray-400">No flight data available.</div>
      </ng-template>
      <div class="flex justify-end mt-4">
        <button
          pButton
          label="Close"
          class="p-button-md p-button-secondary "
          (click)="showViewDialog = false"
        ></button>
      </div>
    </p-dialog>
    <div class="p-4 bg-white dark:bg-zinc-900 shadow-md rounded">
      <div class="text-xl font-semibold mb-4 ">Planning & Operation</div>
      <div class="text-md font-light text-gray-400 mb-4">
        Flight operations include flight irregularities and bookings.
      </div>

      <div class="flex items-center flex-wrap gap-3 my-8">
        <button
          pButton
          class="border border-yellow-500 text-yellow-600 bg-yellow-50 px-4 py-2 rounded flex items-center gap-2"
          (click)="clearFilters()"
        >
          <i class="pi pi-filter-slash"></i>
          Clear
        </button>

        <!-- Filter Dropdown Container -->
        <div class="relative">
          <button
            (click)="isFilterOpen = !isFilterOpen"
            class="flex items-center gap-2 border border-green-500 text-green-600 px-4 py-2 rounded hover:bg-green-50"
          >
            <i class="pi pi-filter"></i> Filter Status
          </button>

          <!-- Filter Panel -->
          <div
            *ngIf="isFilterOpen"
            class="absolute z-10 mt-2 w-[300px] bg-white dark:bg-zinc-900 shadow-md border border-gray-200 rounded p-4"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-semibold text-sm text-gray-700"
                >Filter Options</span
              >
              <button
                class="text-gray-500 hover:text-red-500"
                (click)="isFilterOpen = false"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
            <p-dropdown
              [(ngModel)]="selectedHeader"
              [options]="headerOptions"
              placeholder="Filter Header"
              class="w-full mb-3"
            ></p-dropdown>
            <p-calendar
              [(ngModel)]="selectedDate"
              placeholder="Filter Date"
              dateFormat="dd M yy"
              class="!w-full !mb-3"
            ></p-calendar>

            <!-- Status Filter -->
            <p-dropdown
              [(ngModel)]="selectedStatus"
              [options]="statusOptions"
              placeholder="Filter Status"
              class="w-full"
            ></p-dropdown>
          </div>
        </div>

        <!-- Search -->
        <input
          pInputText
          type="text"
          [(ngModel)]="searchKeyword"
          placeholder="Search Keyword"
          class="border rounded px-4 py-2"
        />
        <p-splitbutton
          label="Create"
          icon="pi pi-plus"
          [model]="createOptions"
          class="bg-yellow-500 text-white rounded-md ml-auto mr-4"
          (onClick)="onDefaultCreateClick()"
        ></p-splitbutton>
      </div>

      <p-table
        [value]="getFilteredOperations()"
        [paginator]="true"
        [rows]="10"
        class="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Transaction No.</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
            <th>View</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-op let-rowIndex="rowIndex">
          <tr>
            <td>
              {{ op.generateNumber }}/{{ op.createDate | date : 'yyyy-MM-dd' }}
            </td>
            <td>
              <p-tag
                [value]="op.action?.toUpperCase()"
                [styleClass]="getHeaderClass(op.action)"
                [icon]="getHeaderIcon(op.action)"
              ></p-tag>
            </td>
            <td>{{ op.createDate | date : 'yyyy-MM-dd' }}</td>
            <td>
              <p-tag
                [value]="op.status"
                [severity]="getStatusSeverity(op.status)"
              ></p-tag>
            </td>
            <td>
              <ng-container [ngSwitch]="getAvailableActions(op.status)">
                <!-- Edit -->
                <button
                  *ngIf="getAvailableActions(op.status).includes('EDIT')"
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-success p-button-sm mx-1"
                  (click)="onEditOperation(op)"
                ></button>

                <!-- Delete -->
                <button
                  *ngIf="getAvailableActions(op.status).includes('DELETE')"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm mx-1"
                  (click)="confirmDelete(rowIndex)"
                ></button>

                <!-- Send -->
                <button
                  *ngIf="getAvailableActions(op.status).includes('SEND')"
                  pButton
                  icon="pi pi-send"
                  class="p-button-rounded p-button-info p-button-sm mx-1"
                  (click)="showMailDialog = true"
                ></button>
                <button
                  *ngIf="getAvailableActions(op.status).includes('APPROVE')"
                  pButton
                  icon="pi pi-tag"
                  class="p-button-rounded p-button-help p-button-sm mx-1"
                  (click)="onApprove(op)"
                ></button>
              </ng-container>
            </td>

            <td>
              <!-- <button
                pButton
                icon="pi pi-ellipsis-h"
                class="p-button-rounded p-button-secondary p-button-sm"
                (click)="onViewOperation(op)"
              ></button> -->
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center">ไม่พบรายการ</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class OperationList implements OnInit {
  searchKeyword = '';
  selectedStatus: string | null = null;
  selectedHeader: string | null = null;
  selectedDate: Date | null = null;
  isFilterOpen = false;
  showMailDialog = false;
  newMail = {
    to: '',
    title: '',
    message: '',
  };

  statusOptions = [
    { label: 'Created', value: 'CREATED' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'Done', value: 'DONE' },
  ];

  headerOptions = [
    { label: 'Delayed', value: 'Delayed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  createOptions = [
    {
      label: 'REVISED',
      icon: 'pi pi-pencil',
      command: () => this.navigateToCreate('revised'),
    },
    {
      label: 'CANCELLED',
      icon: 'pi pi-times-circle',
      command: () => this.navigateToCreate('cancelled'),
    },
    {
      label: 'INFORM',
      icon: 'pi pi-info-circle',
      command: () => this.navigateToCreate('inform'),
    },
    {
      label: 'RESUME',
      icon: 'pi pi-play',
      command: () => this.navigateToCreate('resume'),
    },
  ];

  showViewDialog = false;
  selectedOperation: any = null;

  userRole: UserRole | null = null;

  operations: Operation[] = [];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role ?? null;
  }

  ngOnInit(): void {
    const rawData = localStorage.getItem('operations');
    this.operations = rawData ? (JSON.parse(rawData) as Operation[]) : [];
  }

  getAvailableActions(status: string): string[] {
    // console.log(status);
    const roleMap: Record<UserRole, string[]> = {
      PLANNING_OFFICER: ['EDIT', 'DELETE', 'SEND'],
      PLANNING_MANAGER: ['EDIT', 'DELETE', 'SEND', 'APPROVE'],
      OPERATION_OFFICER: ['APPROVE'],
      OPERATION_MANAGER: ['EDIT', 'DELETE', 'SEND', 'APPROVE'],
    };

    const allowedStatuses: Record<UserRole, string[]> = {
      PLANNING_OFFICER: ['CREATED'],
      PLANNING_MANAGER: ['CREATED', 'APPROVED', 'INPROGRESS'],
      OPERATION_OFFICER: ['APPROVE'],
      OPERATION_MANAGER: [
        'CREATED',
        'APPROVED',
        'INPROGRESS',
        'APPROVED',
        'ASSIGNED',
      ],
    };
    if (!this.userRole) return [];
    const allowed = allowedStatuses[this.userRole];
    const actions = roleMap[this.userRole];
    return allowed.includes(status) ? actions : [];
  }

  navigateToCreate(type: string) {
    this.router.navigate(['/admin/operation/create'], {
      queryParams: { type },
    });
  }

  onViewOperation(op: any) {
    this.selectedOperation = op;
    this.showViewDialog = true;
  }

  getAircraftText(aircraft: string) {
    return `738(${aircraft})`;
  }

  formatTime(date: string | Date | null): string {
    // if (!date) return '';
    // const d = new Date(date);
    // const h = d.getHours().toString().padStart(2, '0');
    // const m = d.getMinutes().toString().padStart(2, '0');
    return `${date}`;
  }

  // formatTime(dateStr: string | Date | null): string {
  //   if (!dateStr) return '';
  //   const date = new Date(dateStr);
  //   return `${date.getHours().toString().padStart(2, '0')}${date
  //     .getMinutes()
  //     .toString()
  //     .padStart(2, '0')}`;
  // }

  onDefaultCreateClick() {
    this.messageService.add({
      severity: 'info',
      summary: 'Create',
      detail: 'กรุณาเลือกประเภทก่อนสร้าง',
    });
  }

  sendMail() {
    this.messageService.add({
      severity: 'success',
      summary: 'Email Sent',
      detail: `Message to ${this.newMail.to} has been sent.`,
    });
    this.newMail = { to: '', title: '', message: '' };
    this.showMailDialog = false;
  }

  confirmDelete(index: number) {
    this.confirmationService.confirm({
      message: 'คุณต้องการลบรายการนี้หรือไม่?',
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'ลบเลย',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const deletedOperation = this.operations[index];

        // 1. ลบออกจาก this.operations
        this.operations.splice(index, 1);

        // 2. อัปเดต localStorage
        const stored = JSON.parse(localStorage.getItem('operations') || '[]');
        const updated = stored.filter(
          (op: any) => op.generateNumber !== deletedOperation.generateNumber
        );
        localStorage.setItem('operations', JSON.stringify(updated));

        // 3. แจ้งผลลบ
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'รายการถูกลบเรียบร้อยแล้ว',
        });
      },
    });
  }

  clearFilters() {
    this.searchKeyword = '';
    this.selectedStatus = null;
    this.selectedHeader = null;
    this.selectedDate = null;
  }

  getFilteredOperations() {
    return this.operations.filter((op) => {
      const matchesStatus = this.selectedStatus
        ? op.status === this.selectedStatus
        : true;
      const matchesHeader = this.selectedHeader
        ? op.header === this.selectedHeader
        : true;
      const matchesDate = this.selectedDate
        ? op.createDate === this.formatDate(this.selectedDate)
        : true;
      const matchesKeyword = this.searchKeyword
        ? [op.uniqueName, op.header, op.createDate, op.status].some((field) =>
            field
              ?.toString()
              .toLowerCase()
              .includes(this.searchKeyword!.toLowerCase())
          )
        : true;

      return matchesStatus && matchesHeader && matchesDate && matchesKeyword;
    });
  }

  formatDate(date: Date): string {
    const options = {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    } as const;
    return new Intl.DateTimeFormat('en-GB', options)
      .format(date)
      .toUpperCase()
      .replace(/ /g, ' ');
  }

  getStatusSeverity(
    status: string
  ):
    | 'success'
    | 'secondary'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast'
    | undefined {
    switch (status) {
      case 'CREATED':
        return 'success';
      case 'APPROVED':
        return 'warn';
      case 'ASSIGNED':
        return 'danger';
      case 'DONE':
        return 'info';
      default:
        return undefined;
    }
  }

  getHeaderIcon(header: string): string {
    switch (header) {
      case 'Cancelled':
        return 'pi pi-times';
      case 'Revised':
        return 'pi pi-clock';
      case 'Inform':
        return 'pi pi-question-circle';
      // case 'DONE':
      //   return 'pi pi-flag';
      default:
        return 'pi pi-info-circle';
    }
  }

  getHeaderClass(header: string): string {
    switch (header) {
      case 'CANCELLED':
        return '!bg-red-100 !text-red-800';
      case 'REVISED':
        return '!bg-yellow-100 !text-yellow-800';
      case 'INFORM':
        return '!bg-green-100 !text-green-800';
      case 'RESUME':
        return '!bg-green-100 !text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onEditOperation(op: any) {
    this.router.navigate(['/admin/operation/edit', op.generateNumber]);
  }

  onApprove(op: any) {
    this.router.navigate(['/admin/operation/approved', op.generateNumber]);
  }
}
