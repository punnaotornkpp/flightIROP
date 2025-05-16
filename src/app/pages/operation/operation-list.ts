import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PermissionService } from '../../service/permission.service';
import { AuthService } from '../../service/auth.service';
import { FlightService } from '../../service/flight.service';
import { SubscriptionDestroyer } from '../../shared/core/helper/SubscriptionDestroyer.helper';
@Component({
  selector: 'operation-list',
  standalone: false,
  template: `
    <p-confirmDialog></p-confirmDialog>
    <div class="p-6 bg-white rounded-xl shadow-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          Flight Irregularity Operations
        </h2>
        <p-splitbutton
          *ngIf="permissionService.canCreate()"
          label="Create"
          icon="pi pi-plus"
          [model]="createOptions"
          class="bg-yellow-500 text-white rounded-md ml-auto mr-4"
          (onClick)="onDefaultCreateClick()"
        />
      </div>
      <div class="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div class="flex flex-wrap items-end gap-4">
          <button
            pButton
            label="Clear"
            icon="pi pi-filter-slash"
            class="p-button-outlined p-button-secondary"
            (click)="clearFilters()"
          ></button>
          <div>
            <button
              (click)="isFilterOpen = !isFilterOpen"
              class="flex items-center gap-2 border border-green-500 text-green-600 px-10 py-2 rounded hover:bg-green-50"
            >
              <i class="pi pi-filter"></i> Filters
            </button>

            <div
              *ngIf="isFilterOpen"
              class="absolute z-10 mt-2 w-[300px] bg-white dark:bg-zinc-900 shadow-md border border-gray-200 rounded p-4"
            >
              <div class="flex justify-between items-center mb-3">
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
              <p-select
                name="selectedStatus"
                [(ngModel)]="selectedStatus"
                [options]="statusOptions"
                placeholder="Filter by Status"
                optionLabel="label"
                optionValue="value"
                class="w-full mb-3"
              ></p-select>
              <p-select
                name="selectedCreatedBy"
                [(ngModel)]="selectedCreatedBy"
                [options]="createdByOptions"
                placeholder="Filter by Creator"
                optionLabel="label"
                optionValue="value"
                class="w-full mb-3"
              ></p-select>
              <p-select
                name="selectedMessageType"
                [(ngModel)]="selectedMessageType"
                [options]="messageTypeOptions"
                placeholder="Filter by Message Type"
                optionLabel="label"
                optionValue="value"
                class="w-full mb-3"
              ></p-select>

              <p-select
                name="selectedActionCode"
                [(ngModel)]="selectedActionCode"
                [options]="actionCodeOptions"
                placeholder="Filter by Action Code"
                optionLabel="label"
                optionValue="value"
                class="w-full mb-3"
              ></p-select>
              <p-datePicker
                name="selectedDateRange"
                [(ngModel)]="selectedDateRange"
                selectionMode="range"
                dateFormat="yy-mm-dd"
                placeholder="Filter by Date Range"
                showIcon="true"
                class="w-full"
              />
              <button
                pButton
                label="Clear Filters"
                icon="pi pi-times"
                class="p-button-sm p-button-secondary w-full mt-4"
                (click)="clearFilters()"
              ></button>
            </div>
          </div>
        </div>
        <p-iconfield iconPosition="left" class="ml-auto">
          <p-inputicon>
            <i class="pi pi-search"></i>
          </p-inputicon>
          <input
            name="searchKeyword"
            pInputText
            type="text"
            [(ngModel)]="searchKeyword"
            placeholder="Search Keyword"
            class="border rounded px-4 py-2 w-64"
          />
        </p-iconfield>
      </div>
      <p-table
        [value]="getFilteredOperations()"
        [paginator]="true"
        [rows]="10"
        responsiveLayout="scroll"
        class="shadow rounded overflow-hidden"
      >
        <ng-template pTemplate="header">
          <tr class="bg-gray-100 text-sm text-gray-700">
            <th class="px-4 py-2 !text-center">Transaction No.</th>
            <th class="px-4 py-2 !text-center">Message Type</th>
            <th class="px-4 py-2 !text-center">Created Team</th>
            <th class="px-4 py-2 !text-center">Season</th>
            <th class="px-4 py-2 !text-center">Action Code</th>
            <th class="px-4 py-2 !text-center">Created Date</th>
            <th class="px-4 py-2 !text-center">Status</th>
            <th class="px-4 py-2 !text-center">Flight Count</th>
            <th class="px-4 py-2 !text-center">Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-op let-index="rowIndex">
          <tr
            class="hover:bg-gray-50 transition duration-200 ease-in-out text-sm"
          >
            <td class="px-4 py-2 !text-center">{{ op.transactionNumber }}</td>
            <td class="px-4 py-2 !text-center">{{ op.messageType }}</td>
            <td class="px-4 py-2 !text-center">{{ op.createdTeam }}</td>
            <td class="px-4 py-2 !text-center">{{ op.season }}</td>
            <td class="px-4 py-2 !text-center">{{ op.actionCode }}</td>
            <td class="px-4 py-2 !text-center">
              {{ op.createdDate | date : 'yyyy-MM-dd' }}
            </td>
            <td class="px-4 py-2 !text-center">
              <span [ngClass]="getStatusClass(op.statusDescription)">
                {{ op.statusDescription }}
              </span>
            </td>
            <td class="px-4 py-2 !text-center">
              {{ op.flightIropItems?.length }}
            </td>
            <td class="px-4 py-2 !text-center">
              <div class="flex justify-center gap-2">
                <button
                  pButton
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-info p-button-sm"
                  (click)="viewOperation(op)"
                ></button>
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-warning p-button-sm"
                  (click)="editOperation(op)"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger p-button-sm"
                  (click)="deleteOperation(op, index)"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class OperationList extends SubscriptionDestroyer implements OnInit {
  operations: any[] = [];
  selectedStatus: string | null = null;
  selectedCreatedBy: string | null = null;
  searchKeyword: string = '';
  isFilterOpen: boolean = false;
  selectedDateRange: Date[] = [];

  statusOptions = [
    { label: 'CREATED', value: 'CREATED' },
    { label: 'APPROVED', value: 'APPROVED' },
    { label: 'INPROGRESS', value: 'INPROGRESS' },
    { label: 'DONE', value: 'DONE' },
  ];

  createdByOptions = [
    { label: 'Planning', value: 'PLN' },
    { label: 'Operation', value: 'OPS' },
  ];

  selectedMessageType: string | null = null;
  selectedActionCode: string | null = null;

  actionCodeOptions = [
    { label: 'REVISED', value: 'REVISED' },
    { label: 'CANCELLED', value: 'CANCELLED' },
    { label: 'INFORM', value: 'INFORM' },
    { label: 'RESUME', value: 'RESUME' },
  ];

  messageTypeOptions = [
    { label: 'OPS', value: 'OPS' },
    { label: 'ASM', value: 'ASM' },
    { label: 'SSM', value: 'SSM' },
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

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public permissionService: PermissionService,
    private authService: AuthService,
    private service: FlightService
  ) {
    super();
  }

  ngOnInit(): void {
    this.reloadOperations();
    const routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.reloadOperations();
      }
    });
    this.AddSubscription(routerSub);
  }

  reloadOperations() {
    const obs = this.service.getSavedOperations().subscribe({
      next: (res) => {
        this.operations = res.map((op: any) => ({
          ...op,
          createdDate: new Date(op.createdDate), // ตอนนี้ backend ส่ง createdDate
        }));
        this.messageService.add({
          severity: 'success',
          summary: 'Loaded',
          detail: 'Operation list loaded successfully!',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed',
          detail: 'Unable to load operations.',
        });
      },
    });
    this.AddSubscription(obs);
  }

  onDefaultCreateClick() {
    this.messageService.add({
      severity: 'info',
      summary: 'Create',
      detail: 'กรุณาเลือกประเภทก่อนสร้าง',
    });
  }

  viewOperation(op: any) {
    this.router.navigate([`/admin/operation/approved/${op.transactionNumber}`]);
  }

  editOperation(op: any) {
    if (op.statusDescription !== 'CREATED') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cannot Edit',
        detail: 'You can edit only transactions with status "CREATED".',
      });
      return;
    }
    this.router.navigate(['/admin/operation/edit', op.transactionNumber]);
  }

  navigateToCreate(type: string) {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    const role = user.role;
    const createdBy = ['PLANNING_OFFICER', 'PLANNING_MANAGER'].includes(role)
      ? 'PLN'
      : ['OPERATION_OFFICER', 'OPERATION_MANAGER'].includes(role)
      ? 'OPS'
      : null;

    if (!createdBy) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Unauthorized',
        detail: 'ไม่สามารถสร้างรายการได้จากสิทธิ์ของคุณ',
      });
      return;
    }
    this.router.navigate(['/admin/operation/create'], {
      queryParams: {
        type, // 'revised' | 'cancelled' | ...
        createdBy, // 'PLN' | 'OPS'
      },
    });
  }

  deleteOperation(op: any, index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this transaction?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        const obs = this.service
          .deleteSavedOperation(op.transactionNumber)
          .subscribe({
            next: () => {
              this.operations.splice(index, 1); // ลบจาก list บนจอ
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Transaction has been deleted.',
              });
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete transaction.',
              });
            },
          });
        this.AddSubscription(obs);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CREATED':
        return '!bg-blue-100 !text-blue-800 !border !border-blue-300 px-2 py-1 rounded text-sm';
      case 'INPROGRESS':
        return '!bg-yellow-100 !text-yellow-800 !border !border-yellow-300 px-2 py-1 rounded text-sm';
      case 'APPROVED':
        return '!bg-green-100 !text-green-800 !border !border-green-300 px-2 py-1 rounded text-sm';
      case 'DONE':
        return '!bg-gray-100 !text-gray-800 !border !border-gray-300 px-2 py-1 rounded text-sm';
      default:
        return '';
    }
  }

  clearFilters() {
    this.selectedStatus = null;
    this.selectedCreatedBy = null;
    this.selectedMessageType = null;
    this.selectedActionCode = null;
    this.selectedDateRange = [];
    this.searchKeyword = '';
  }

  getFilteredOperations() {
    return this.operations.filter((op) => {
      const matchesStatus =
        !this.selectedStatus || op.statusDescription === this.selectedStatus;
      const matchesCreatedBy =
        !this.selectedCreatedBy || op.createdTeam === this.selectedCreatedBy;
      const matchesMessageType =
        !this.selectedMessageType ||
        op.messageType === this.selectedMessageType;
      const matchesActionCode =
        !this.selectedActionCode || op.actionCode === this.selectedActionCode;
      const matchesDate =
        this.selectedDateRange.length === 0 ||
        (op.createdDate &&
          (!this.selectedDateRange[0] ||
            op.createdDate >= this.selectedDateRange[0]) &&
          (!this.selectedDateRange[1] ||
            op.createdDate <= this.selectedDateRange[1]));
      const keyword = this.searchKeyword?.toLowerCase();
      const matchesKeyword =
        !keyword ||
        [
          op.transactionNumber,
          op.messageType,
          op.createdTeam,
          op.season,
          op.actionCode,
        ].some((f) => f?.toLowerCase().includes(keyword));

      return (
        matchesStatus &&
        matchesCreatedBy &&
        matchesMessageType &&
        matchesActionCode &&
        matchesDate &&
        matchesKeyword
      );
    });
  }
}
