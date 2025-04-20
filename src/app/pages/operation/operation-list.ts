import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Route, Router } from '@angular/router';
import {
  IropActionType,
  IropStatus,
  CreatedByRole,
  SourceType,
  ISeason,
  IIropFlightSchedule,
  IropTransaction,
} from '../../types/flight.model';
import { SubscriptionDestroyer } from '../../core/helper/SubscriptionDestroyer.helper';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';

@Component({
  selector: 'operation-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
  ],
  template: `
    <div class="p-6 bg-white rounded-xl shadow-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          Flight Irregularity Operations
        </h2>
        <button
          pButton
          label="Create IROP"
          icon="pi pi-plus"
          class="p-button-success font-semibold px-4 py-2"
          (click)="navigateToCreate()"
        ></button>
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

          <p-dropdown
            [(ngModel)]="selectedStatus"
            [options]="statusOptions"
            placeholder="Filter by Status"
            optionLabel="label"
            optionValue="value"
            class="w-64"
          ></p-dropdown>

          <p-dropdown
            [(ngModel)]="selectedCreatedBy"
            [options]="createdByOptions"
            placeholder="Filter by Creator"
            optionLabel="label"
            optionValue="value"
            class="w-64"
          ></p-dropdown>

          <p-calendar
            [(ngModel)]="selectedDate"
            dateFormat="yy-mm-dd"
            placeholder="Filter by Date"
            showIcon="true"
            class="w-64"
          ></p-calendar>
        </div>

        <p-iconfield iconPosition="left" class="ml-auto">
          <p-inputicon>
            <i class="pi pi-search"></i>
          </p-inputicon>
          <input
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
        class="shadow rounded overflow-hidden "
      >
        <ng-template pTemplate="header">
          <tr class="bg-gray-100 text-sm text-gray-700">
            <th class="px-4 py-2">Transaction No.</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Created By</th>
            <th class="px-4 py-2">Season</th>
            <th class="px-4 py-2">Date</th>
            <th class="px-4 py-2">Section Count</th>
            <th class="px-4 py-2 text-center">Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-op let-index="rowIndex">
          <tr
            class="hover:bg-gray-50 transition duration-200 ease-in-out text-sm"
          >
            <td class="px-4 py-2">{{ op.transactionNo }}</td>
            <td class="px-4 py-2">
              <span [ngClass]="getStatusClass(op.status)">
                {{ op.status }}
              </span>
            </td>
            <td class="px-4 py-2">{{ op.createdBy }}</td>
            <td class="px-4 py-2">{{ op.season.label }}</td>
            <td class="px-4 py-2">{{ op.createDate | date : 'yyyy-MM-dd' }}</td>
            <td class="px-4 py-2">{{ op.sections.length }}</td>
            <td class="px-4 py-2 text-center">
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
                  (click)="deleteOperation(index)"
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
  operations: IropTransaction[] = [];
  selectedStatus: string | null = null;
  selectedCreatedBy: string | null = null;
  selectedDate: Date | null = null;
  searchKeyword: string = '';

  statusOptions = [
    { label: 'Created', value: 'CREATED' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Done', value: 'DONE' },
  ];

  createdByOptions = [
    { label: 'Planning', value: 'PLN' },
    { label: 'Operation', value: 'OPS' },
  ];

  constructor(private router: Router) {
    super();
  }

  ngOnInit(): void {
    const saved = sessionStorage.getItem('iropTransactions');
    const fromStorage = saved ? JSON.parse(saved) : [];
    this.operations = [...fromStorage];
  }

  navigateToCreate() {
    this.router.navigate(['/admin/operation/create']);
  }

  viewOperation(op: any) {
    this.router.navigate([`/admin/operation/approved/${op.transactionNo}`]);
  }

  editOperation(op: any) {
    // Implement later
    alert('✏️ Edit not implemented yet');
  }

  deleteOperation(index: number) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    this.operations.splice(index, 1);
    sessionStorage.setItem('iropTransactions', JSON.stringify(this.operations));
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
    this.selectedDate = null;
    this.searchKeyword = '';
  }

  getFilteredOperations() {
    return this.operations.filter((op) => {
      const matchesStatus =
        !this.selectedStatus || op.status === this.selectedStatus;
      const matchesCreatedBy =
        !this.selectedCreatedBy || op.createdBy === this.selectedCreatedBy;
      const matchesDate =
        !this.selectedDate ||
        (op.createDate || '').startsWith(
          this.selectedDate.toISOString().split('T')[0]
        );
      const keyword = this.searchKeyword?.toLowerCase();
      const matchesKeyword =
        !keyword ||
        [op.transactionNo, op.season.label].some((f) =>
          f?.toLowerCase().includes(keyword)
        );
      return matchesStatus && matchesCreatedBy && matchesDate && matchesKeyword;
    });
  }
}
