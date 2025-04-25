import { Component, OnInit } from '@angular/core';
import { AuthService } from './service/auth.service';
import { PermissionService } from './service/permission.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.permissionService.setUser(user);
    }
  }
}
