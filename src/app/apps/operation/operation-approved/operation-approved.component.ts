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

    const mockOps = JSON.parse(localStorage.getItem('operations') || '[]');

    this.operation = mockOps.find((op: any) => op.generateNumber === id);

    if (this.operation) {
      this.status = this.operation.status;
    }
  }

  saveDraft() {
    this.status = 'INPROGRESS';
    this.updateStatus('INPROGRESS');
  }

  onApprove() {
    this.isLoading = true;

    setTimeout(() => {
      this.status = 'APPROVED';
      this.updateStatus('APPROVED');
      this.isLoading = false;
      this.router.navigate(['/apps/operation']);
    }, 1500); // mock delay
  }

  undoApprove() {
    this.status = 'CREATED';
    this.updateStatus('CREATED');
  }

  onPrint() {}

  updateStatus(newStatus: string) {
    const allOps = JSON.parse(localStorage.getItem('operations') || '[]');
    const index = allOps.findIndex(
      (op: any) => op.generateNumber === this.operation.generateNumber
    );
    if (index !== -1) {
      allOps[index].status = newStatus;
      localStorage.setItem('operations', JSON.stringify(allOps));
    }
  }

  back() {
    this.router.navigate(['/apps/operation']);
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
}
