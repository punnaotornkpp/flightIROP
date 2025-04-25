import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, ToastModule, RouterOutlet],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <router-outlet></router-outlet>
  `,
})
export class AppShellComponent {}
