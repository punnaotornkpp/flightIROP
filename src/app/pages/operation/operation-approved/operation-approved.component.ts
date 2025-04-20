import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-operation-approved',
  standalone: true,
  templateUrl: './operation-approved.component.html',
  styleUrls: ['./operation-approved.component.scss'],
  imports: [TableModule, ButtonModule, CommonModule, TagModule],
})
export class OperationApprovedComponent implements OnInit {
  operation: any;
  status: 'CREATED' | 'INPROGRESS' | 'APPROVED' = 'CREATED';
  isLoading = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const mockOps = JSON.parse(
      sessionStorage.getItem('iropTransactions') || '[]'
    );
    console.log(id);
    console.log(mockOps);
    this.operation = mockOps.find((op: any) => op.transactionNo === id);
    if (this.operation) {
      this.status = this.operation.status;
    }
    console.log(this.operation);
  }

  saveDraft() {
    this.status = 'INPROGRESS';
    this.updateStatus('INPROGRESS');
  }

  formatTime(date: Date | string | null): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  onApprove() {
    this.isLoading = true;
    setTimeout(() => {
      this.status = 'APPROVED';
      this.updateStatus('APPROVED');
      this.isLoading = false;
      this.router.navigate(['/admin/operation']);
    }, 1500); // mock delay
  }

  undoApprove() {
    this.status = 'CREATED';
    this.updateStatus('CREATED');
  }

  onPrint() {}

  updateStatus(newStatus: string) {
    const allOps = JSON.parse(
      sessionStorage.getItem('iropTransactions') || '[]'
    );
    const index = allOps.findIndex(
      (op: any) => op.transactionNo === this.operation.transactionNo
    );
    if (index !== -1) {
      allOps[index].status = newStatus;
      sessionStorage.setItem('iropTransactions', JSON.stringify(allOps));
    }
  }

  back() {
    this.router.navigate(['/admin/operation']);
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

  shouldShowRevisedRow(d: any): boolean {
    return !!(d.revisedDeparture || d.revisedArrival);
  }

  getDayLabel(day: number): string {
    const map = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return map[day - 1] || '-';
  }

  getSectionLabel(index: number): string {
    return `${String.fromCharCode(65 + index)}.`; // A., B., C. ...
  }
}
