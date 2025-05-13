import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FlightService } from '../../../service/flight.service';
import { MessageService } from 'primeng/api';
import { SubscriptionDestroyer } from '../../../core/helper/SubscriptionDestroyer.helper';
import { EditorModule } from 'primeng/editor';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-operation-approved',
  standalone: true,
  templateUrl: './operation-approved.component.html',
  styleUrls: ['./operation-approved.component.scss'],
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    TagModule,
    EditorModule,
    FormsModule,
    CardModule,
    DividerModule,
    AccordionModule,
    DialogModule,
  ],
})
export class OperationApprovedComponent
  extends SubscriptionDestroyer
  implements OnInit
{
  transactionNumber!: string;
  operation: any;
  visible: boolean = false;
  isLoading = true;
  rawItem!: any;
  readonly statusStyleMap = {
    CREATED: {
      pillBg: 'bg-green-100 dark:bg-green-900/30',
      circleBg: 'bg-green-500',
      text: 'text-green-600',
      icon: 'pi-plus', // icon ปากกา/บวก
    },
    INPROGRESS: {
      pillBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      circleBg: 'bg-yellow-500',
      text: 'text-yellow-600',
      icon: 'pi-clock', // นาฬิกา
    },
    APPROVED: {
      pillBg: 'bg-blue-100 dark:bg-blue-900/30',
      circleBg: 'bg-blue-500',
      text: 'text-blue-600',
      icon: 'pi-check', // ✓
    },
    REJECTED: {
      pillBg: 'bg-red-100 dark:bg-red-900/30',
      circleBg: 'bg-red-500',
      text: 'text-red-600',
      icon: 'pi-times', // ✕
    },
  } as const;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: FlightService,
    private messageService: MessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.transactionNumber =
      this.route.snapshot.paramMap.get('transactionNumber') || '';
    if (this.transactionNumber) {
      this.loadOperation();
    }
  }

  showDialog(item: any) {
    this.rawItem = item;
    this.visible = true;
  }
  loadOperation() {
    this.isLoading = true;
    const obs = this.service
      .getSavedOperationById(this.transactionNumber)
      .subscribe({
        next: (res) => {
          if (res.customNotifyMessage) {
            res.customNotifyMessage = this.decodeHtml(res.customNotifyMessage);
          }
          this.operation = res;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load operation',
          });
        },
      });
    this.AddSubscription(obs);
  }

  decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  getActionSeverity(code: string | undefined) {
    return (code || '').toUpperCase() === 'CANCELLED' ? 'danger' : 'info';
  }

  buildHeader(s: any) {
    const depDate = s.originalDepartureTime
      ? new Date(s.originalDepartureTime).toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '';
    return `Flight ${s.flightNumber} from ${s.origin} to ${s.destination} – Departure ${depDate}`;
  }

  saveDraft() {
    if (!this.operation) return;
    this.updateStatus('INPROGRESS');
  }

  onApprove() {
    if (!this.operation) return;
    this.updateStatus('APPROVED');
  }

  undoApprove() {
    if (!this.operation) return;
    this.updateStatus('CREATED');
  }

  updateStatus(newStatus: string) {
    this.isLoading = true;
    const obs = this.service
      .updateSavedOperationStatus(this.transactionNumber, newStatus)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Status updated to ${newStatus}`,
          });
          this.operation.statusDescription = newStatus;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update status',
          });
        },
      });
    this.AddSubscription(obs);
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

  back() {
    this.router.navigate(['/admin/operation']);
  }

  onPrint() {
    window.print();
  }

  get statusStyle() {
    const key = (this.operation?.statusDescription || '').toUpperCase();
    return (
      this.statusStyleMap[key as keyof typeof this.statusStyleMap] ||
      this.statusStyleMap.CREATED
    );
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

  copyToClipboard(obj: any, label = 'Copied') {
    const json = JSON.stringify(obj, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: label,
        detail: 'JSON placed on clipboard',
      });
    });
  }

  /** ปุ่มใน dialog */
  copyRaw() {
    this.copyToClipboard(this.rawItem, 'Raw flight copied');
  }

  /** ปุ่มภายนอก */
  copyOperation() {
    this.copyToClipboard(this.operation, 'Operation copied');
  }
}
