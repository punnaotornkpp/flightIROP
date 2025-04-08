import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationFormComponent } from './operation-form.component';

@Component({
  selector: 'app-operation-form-edit',
  standalone: true,
  imports: [OperationFormComponent],
  template: `<app-operation-form [editId]="editId"></app-operation-form>`,
})
export class OperationFormEditComponent implements OnInit {
  editId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.editId = this.route.snapshot.paramMap.get('id');
  }
}
